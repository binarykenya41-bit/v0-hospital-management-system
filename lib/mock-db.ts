import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const DB_PATH = join(process.cwd(), 'data', 'mock-db.json')

export interface MockDB {
  users: Record<string, unknown>[]
  patients: Record<string, unknown>[]
  appointments: Record<string, unknown>[]
  medicines: Record<string, unknown>[]
  lab_tests: Record<string, unknown>[]
  invoices: Record<string, unknown>[]
  invoice_items: Record<string, unknown>[]
  inventory: Record<string, unknown>[]
  suppliers: Record<string, unknown>[]
  payments: Record<string, unknown>[]
  admissions: Record<string, unknown>[]
}

export function readDb(): MockDB {
  const raw = readFileSync(DB_PATH, 'utf-8')
  return JSON.parse(raw) as MockDB
}

export function writeDb(db: MockDB): void {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

export function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
}
