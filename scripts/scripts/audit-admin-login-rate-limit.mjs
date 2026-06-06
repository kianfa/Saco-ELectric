import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import pg from "pg"

const { Pool } = pg
const migration = await readFile(new URL("../supabase/migrations/20260606_admin_login_rate_limits.sql", import.meta.url), "utf8")
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const globalKey = createHash("sha256").update("admin-login-global-v1").digest("hex")
const cleanupKey = createHash("sha256").update(`cleanup-${process.pid}-${Date.now()}`).digest("hex")
const keys = [globalKey, cleanupKey]

async function cleanupExpired() {
  await pool.query("delete from public.admin_login_rate_limits where window_started_at <= now() - interval '60 seconds'")
}

async function consume() {
  await cleanupExpired()
  const result = await pool.query(
    `insert into public.admin_login_rate_limits as limits (key, attempt_count, window_started_at)
     values ($1, 1, now())
     on conflict (key) do update
     set attempt_count = case
           when limits.window_started_at <= now() - interval '60 seconds' then 1
           else limits.attempt_count + 1
         end,
         window_started_at = case
           when limits.window_started_at <= now() - interval '60 seconds' then now()
           else limits.window_started_at
         end
     returning attempt_count <= 3 as allowed`,
    [globalKey],
  )
  return result.rows[0].allowed
}

try {
  await pool.query(migration)
  await pool.query("delete from public.admin_login_rate_limits where key = any($1::text[])", [keys])

  assert.equal(await consume(), true, "attempt 1 must be accepted")
  assert.equal(await consume(), true, "attempt 2 must be accepted even when request identity changes")
  assert.equal(await consume(), true, "attempt 3 must be accepted even when request identity changes")
  assert.equal(await consume(), false, "attempt 4 must be blocked even when request identity changes")
  await pool.query("update public.admin_login_rate_limits set window_started_at = now() - interval '60 seconds' where key = $1", [globalKey])
  assert.equal(await consume(), true, "login must be accepted after the 60-second window")

  await pool.query("delete from public.admin_login_rate_limits where key = $1", [globalKey])
  const parallelResults = await Promise.all(Array.from({ length: 4 }, () => consume()))
  assert.equal(parallelResults.filter(Boolean).length, 3, "parallel requests must allow only three attempts")
  assert.equal(parallelResults.filter((allowed) => !allowed).length, 1, "parallel fourth request must be blocked")

  await pool.query("insert into public.admin_login_rate_limits (key, attempt_count, window_started_at) values ($1, 2, now() - interval '61 seconds')", [cleanupKey])
  await cleanupExpired()
  const expired = await pool.query("select 1 from public.admin_login_rate_limits where key = $1", [cleanupKey])
  assert.equal(expired.rowCount, 0, "expired rows must be cleaned up")

  await pool.query("delete from public.admin_login_rate_limits where key = $1", [globalKey])
  const cleared = await pool.query("select 1 from public.admin_login_rate_limits where key = $1", [globalKey])
  assert.equal(cleared.rowCount, 0, "successful login cleanup must clear the global record")

  console.log("admin login global rate-limit PostgreSQL integration audit passed")
} finally {
  await pool.query("delete from public.admin_login_rate_limits where key = any($1::text[])", [keys]).catch(() => {})
  await pool.end()
}
