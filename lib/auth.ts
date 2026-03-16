import { cookies } from 'next/headers'
import { readDb } from './mock-db'

export interface UserSession {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  roleId: number
  department: string | null
  staffNumber: string | null
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get('hms_session')?.value
  if (!raw) return null
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf-8')
    return JSON.parse(decoded) as UserSession
  } catch {
    return null
  }
}

export async function login(email: string, _password: string): Promise<{ success: boolean; error?: string }> {
  const db = readDb()
  const user = db.users.find((u) => (u as Record<string, unknown>).email === email)

  if (!user) {
    return { success: false, error: 'Invalid email or password' }
  }

  const u = user as Record<string, unknown>

  if (!u.is_active) {
    return { success: false, error: 'Account is deactivated. Contact administrator.' }
  }

  const session: UserSession = {
    id: String(u.id),
    email: String(u.email),
    firstName: String(u.first_name),
    lastName: String(u.last_name),
    role: String(u.role_name),
    roleId: Number(u.role_id),
    department: u.department ? String(u.department) : null,
    staffNumber: u.staff_number ? String(u.staff_number) : null,
  }

  const encoded = Buffer.from(JSON.stringify(session)).toString('base64')
  const cookieStore = await cookies()
  cookieStore.set('hms_session', encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })

  return { success: true }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('hms_session')
}

// Role-based access helpers
const ROLE_PERMISSIONS: Record<string, string[]> = {
  hospital_administrator: [
    'dashboard', 'patients', 'appointments', 'emr', 'billing',
    'pharmacy', 'laboratory', 'inventory', 'staff', 'reports', 'settings',
  ],
  medical_superintendent: [
    'dashboard', 'patients', 'appointments', 'emr', 'billing',
    'pharmacy', 'laboratory', 'inventory', 'staff', 'reports',
  ],
  doctor: [
    'dashboard', 'patients', 'appointments', 'emr', 'laboratory', 'pharmacy',
  ],
  nurse: [
    'dashboard', 'patients', 'appointments', 'emr', 'pharmacy',
  ],
  receptionist: [
    'dashboard', 'patients', 'appointments', 'billing',
  ],
  pharmacist: [
    'dashboard', 'pharmacy', 'inventory',
  ],
  lab_technologist: [
    'dashboard', 'laboratory', 'patients',
  ],
  accountant: [
    'dashboard', 'billing', 'reports',
  ],
  records_officer: [
    'dashboard', 'patients', 'emr', 'reports',
  ],
  patient: ['patient-portal'],
}

export function hasPermission(role: string, module: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(module) ?? false
}

export function getPermissions(role: string): string[] {
  return ROLE_PERMISSIONS[role] ?? []
}
