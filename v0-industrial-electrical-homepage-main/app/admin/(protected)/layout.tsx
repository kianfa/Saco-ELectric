import type { ReactNode } from "react"
import { requireAdminAccess } from "@/lib/auth/admin-auth"

export default async function ProtectedAdminRoutesLayout({ children }: { children: ReactNode }) {
  await requireAdminAccess()
  return <>{children}</>
}
