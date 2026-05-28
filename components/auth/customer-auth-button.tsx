"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { LogOut, User, UserCircle } from "lucide-react"
import { logoutCustomerAction } from "@/lib/actions/auth-actions"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type CustomerStatus = {
  isLoggedIn: boolean
  user: {
    email: string | null
    fullName: string | null
    phone: string | null
  } | null
}

export function CustomerAuthButton() {
  const [status, setStatus] = useState<CustomerStatus | null>(null)

  useEffect(() => {
    let mounted = true
    fetch("/api/auth/customer/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: CustomerStatus) => {
        if (mounted) setStatus(data)
      })
      .catch(() => {
        if (mounted) setStatus({ isLoggedIn: false, user: null })
      })
    return () => {
      mounted = false
    }
  }, [])

  if (!status?.isLoggedIn) {
    return (
      <>
        <Button asChild variant="outline" className="hidden sm:flex items-center gap-2 rounded-xl">
          <Link href="/auth/login">
            <User className="w-5 h-5" />
            <span className="hidden lg:inline">ورود / ثبت‌نام</span>
          </Link>
        </Button>
        <Button asChild variant="outline" size="icon" className="rounded-xl sm:hidden">
          <Link href="/auth/login" aria-label="ورود / ثبت نام">
            <User className="w-5 h-5" />
          </Link>
        </Button>
      </>
    )
  }

  const displayName = status.user?.fullName || status.user?.email || "حساب کاربری"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="hidden sm:flex items-center gap-2 rounded-xl">
          <UserCircle className="w-5 h-5" />
          <span className="hidden lg:inline max-w-32 truncate">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" dir="rtl">
        <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">حساب کاربری</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={logoutCustomerAction}>
          <DropdownMenuItem asChild>
            <button type="submit" className="flex w-full items-center gap-2 text-right">
              <LogOut className="h-4 w-4" />
              خروج
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
      <Button asChild variant="outline" size="icon" className="rounded-xl sm:hidden">
        <Link href="/account" aria-label="حساب کاربری">
          <UserCircle className="w-5 h-5" />
        </Link>
      </Button>
    </DropdownMenu>
  )
}
