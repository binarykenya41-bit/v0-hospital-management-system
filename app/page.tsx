'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-[440px]">
        <div className="bg-card border border-border p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center bg-primary">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground leading-tight">
                Hospital Management System
              </h1>
              <p className="text-sm text-muted-foreground">
                Moi Teaching & Referral Hospital
              </p>
            </div>
          </div>

          <p className="text-sm text-foreground font-semibold mb-6">Sign in</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hospital.go.ke"
                required
                className="h-8 border border-input bg-card px-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="h-8 border border-input bg-card px-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-8 items-center justify-center bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-[#005A9E] disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground mb-2">Demo accounts (any password works):</p>
            <div className="grid grid-cols-2 gap-1">
              {[
                { label: 'Admin', email: 'admin@hospital.go.ke' },
                { label: 'Doctor', email: 'drkipchoge@hospital.go.ke' },
                { label: 'Nurse', email: 'nursechebet@hospital.go.ke' },
                { label: 'Receptionist', email: 'rec.akinyi@hospital.go.ke' },
                { label: 'Pharmacist', email: 'pharma.kamau@hospital.go.ke' },
                { label: 'Lab Tech', email: 'lab.njeri@hospital.go.ke' },
                { label: 'Accountant', email: 'acc.ouma@hospital.go.ke' },
                { label: 'Superintendent', email: 'super.mutua@hospital.go.ke' },
              ].map((acct) => (
                <button
                  key={acct.email}
                  type="button"
                  onClick={() => { setEmail(acct.email); setPassword('admin123') }}
                  className="text-left px-2 py-1 text-xs text-primary hover:bg-accent truncate"
                >
                  {acct.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Republic of Kenya - Ministry of Health
        </p>
      </div>
    </div>
  )
}
