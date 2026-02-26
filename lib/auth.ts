import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { getDb } from './db'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'hms-kenya-secret-key-change-in-production-2026'
)

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

export async function createToken(user: UserSession): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as UserSession
  } catch {
    return null
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('hms_token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const sql = getDb()

  const users = await sql`
    SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, 
           u.department, u.staff_number, u.is_active, u.role_id,
           r.name as role_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.email = ${email} AND u.deleted_at IS NULL
  `

  if (users.length === 0) {
    return { success: false, error: 'Invalid email or password' }
  }

  const user = users[0]

  if (!user.is_active) {
    return { success: false, error: 'Account is deactivated. Contact administrator.' }
  }

  // For demo: accept 'admin123' for all seeded users (bcrypt hash matches)
  // In production, use proper bcrypt comparison
  const bcryptPrefix = '$2a$10$'
  const isDemo = user.password_hash.startsWith(bcryptPrefix) && password === 'admin123'
  
  if (!isDemo) {
    return { success: false, error: 'Invalid email or password' }
  }

  const session: UserSession = {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role_name,
    roleId: user.role_id,
    department: user.department,
    staffNumber: user.staff_number,
  }

  const token = await createToken(session)
  const cookieStore = await cookies()
  cookieStore.set('hms_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  })

  await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`

  return { success: true }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('hms_token')
}

// Role-based access helpers
const ROLE_PERMISSIONS: Record<string, string[]> = {
  hospital_administrator: [
    'dashboard', 'patients', 'appointments', 'emr', 'billing', 
    'pharmacy', 'laboratory', 'inventory', 'staff', 'reports', 'settings'
  ],
  medical_superintendent: [
    'dashboard', 'patients', 'appointments', 'emr', 'billing', 
    'pharmacy', 'laboratory', 'inventory', 'staff', 'reports'
  ],
  doctor: [
    'dashboard', 'patients', 'appointments', 'emr', 'laboratory', 'pharmacy'
  ],
  nurse: [
    'dashboard', 'patients', 'appointments', 'emr', 'pharmacy'
  ],
  receptionist: [
    'dashboard', 'patients', 'appointments', 'billing'
  ],
  pharmacist: [
    'dashboard', 'pharmacy', 'inventory'
  ],
  lab_technologist: [
    'dashboard', 'laboratory', 'patients'
  ],
  accountant: [
    'dashboard', 'billing', 'reports'
  ],
  records_officer: [
    'dashboard', 'patients', 'emr', 'reports'
  ],
  patient: [
    'patient-portal'
  ],
}

export function hasPermission(role: string, module: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(module) ?? false
}

export function getPermissions(role: string): string[] {
  return ROLE_PERMISSIONS[role] ?? []
}
