import "server-only"

import { createHash } from "node:crypto"
import { databasePool } from "@/lib/db/postgres"

const ADMIN_LOGIN_WINDOW_SECONDS = 60
const ADMIN_LOGIN_MAX_ATTEMPTS = 3
const ADMIN_LOGIN_GLOBAL_KEY = createHash("sha256").update("admin-login-global-v1").digest("hex")

export const ADMIN_LOGIN_RATE_LIMIT_MESSAGE = "تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً ۱ دقیقه دیگر دوباره تلاش کنید."

export async function consumeAdminLoginAttempt(): Promise<{ allowed: boolean; key: string }> {
  await databasePool.query(
    `delete from public.admin_login_rate_limits
     where window_started_at <= now() - make_interval(secs => $1)`,
    [ADMIN_LOGIN_WINDOW_SECONDS],
  )

  const result = await databasePool.query<{ allowed: boolean }>(
    `insert into public.admin_login_rate_limits as limits (key, attempt_count, window_started_at)
     values ($1, 1, now())
     on conflict (key) do update
     set attempt_count = case
           when limits.window_started_at <= now() - make_interval(secs => $2) then 1
           else limits.attempt_count + 1
         end,
         window_started_at = case
           when limits.window_started_at <= now() - make_interval(secs => $2) then now()
           else limits.window_started_at
         end
     returning attempt_count <= $3 as allowed`,
    [ADMIN_LOGIN_GLOBAL_KEY, ADMIN_LOGIN_WINDOW_SECONDS, ADMIN_LOGIN_MAX_ATTEMPTS],
  )

  return { allowed: result.rows[0]?.allowed === true, key: ADMIN_LOGIN_GLOBAL_KEY }
}

export async function clearAdminLoginAttempts(key: string): Promise<void> {
  await databasePool.query("delete from public.admin_login_rate_limits where key = $1", [key])
}
