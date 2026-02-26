'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Bell } from 'lucide-react'

interface TopNavProps {
  user: {
    firstName: string
    lastName: string
    role: string
  }
}

export function TopNav({ user }: TopNavProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground">
          Moi Teaching & Referral Hospital
        </h2>
        <span className="hidden sm:inline text-xs text-muted-foreground">
          | Hospital Management System
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div className="h-6 w-px bg-border" />

        <span className="hidden md:block text-xs text-muted-foreground">
          {user.firstName} {user.lastName}
        </span>

        <button
          type="button"
          onClick={handleLogout}
          className="flex h-8 items-center gap-1 px-2 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Sign out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  )
}
