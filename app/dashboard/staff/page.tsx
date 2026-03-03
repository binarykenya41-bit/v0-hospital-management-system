'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Search, X, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table'
import { StatusBadge } from '@/components/status-badge'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const ROLES = [
  'hospital_administrator',
  'medical_superintendent',
  'doctor',
  'nurse',
  'receptionist',
  'pharmacist',
  'lab_technologist',
  'accountant',
  'records_officer',
]

const DEPARTMENTS = [
  'Administration',
  'Internal Medicine',
  'Surgery',
  'Pediatrics',
  'Obstetrics',
  'Orthopedics',
  'Medical Ward',
  'Surgical Ward',
  'Pharmacy',
  'Laboratory',
  'Finance',
  'Records',
  'Reception',
]

export default function StaffPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  const { data, isLoading, mutate } = useSWR(
    `/api/staff?search=${search}&role=${roleFilter}`,
    fetcher
  )

  const columns = [
    {
      key: 'name',
      label: 'Staff Name',
      render: (row: Record<string, unknown>) =>
        `${row.first_name} ${row.last_name}`,
    },
    { key: 'staff_number', label: 'Staff No.' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'role_name',
      label: 'Role',
      render: (row: Record<string, unknown>) => {
        const role = String(row.role_name || '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        return role
      },
    },
    { key: 'department', label: 'Department' },
    { key: 'national_id', label: 'National ID' },
    {
      key: 'is_active',
      label: 'Status',
      render: (row: Record<string, unknown>) => (
        <StatusBadge status={row.is_active ? 'active' : 'inactive'} />
      ),
    },
  ]

  async function handleAddStaff(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormLoading(true)
    const formData = new FormData(e.currentTarget)
    const body: Record<string, string | boolean | null> = {}
    formData.forEach((v, k) => {
      if (k === 'is_active') {
        body[k] = v === 'on'
      } else {
        body[k] = v.toString() || null
      }
    })

    const response = await fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      setFormLoading(false)
      setShowForm(false)
      mutate()
    }
    setFormLoading(false)
  }

  const inputClass = "h-8 w-full border border-input bg-card px-2 text-sm text-foreground focus:border-primary focus:outline-none"
  const labelClass = "text-xs font-medium text-foreground mb-1"

  return (
    <div>
      <PageHeader
        title="Staff Management"
        description="Manage hospital staff, roles, and departments"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex h-8 items-center gap-1 bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-[#005A9E]"
          >
            <Plus className="h-4 w-4" />
            Add Staff
          </button>
        }
      />

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, staff number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full border border-input bg-card pl-8 pr-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-8 border border-input bg-card px-2 text-sm text-foreground focus:border-primary focus:outline-none min-w-48"
        >
          <option value="">All Roles</option>
          {ROLES.map(role => (
            <option key={role} value={role}>
              {role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="h-64 bg-card border border-border animate-pulse" />
      ) : (
        <DataTable
          columns={columns}
          data={data?.staff ?? []}
          emptyMessage="No staff members found"
        />
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/30 pt-12 overflow-y-auto">
          <div className="w-full max-w-2xl bg-card border border-border mx-4 mb-12">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Add New Staff Member</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddStaff} className="p-4 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className={labelClass}>First Name *</label>
                  <input name="first_name" type="text" required className={inputClass} />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Last Name *</label>
                  <input name="last_name" type="text" required className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className={labelClass}>Email *</label>
                  <input name="email" type="email" required className={inputClass} />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Phone</label>
                  <input name="phone" type="tel" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className={labelClass}>Staff Number *</label>
                  <input name="staff_number" type="text" required className={inputClass} />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>National ID</label>
                  <input name="national_id" type="text" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className={labelClass}>Role *</label>
                  <select name="role_id" required className={inputClass}>
                    <option value="">Select role</option>
                    {ROLES.map((role, idx) => (
                      <option key={role} value={idx + 1}>
                        {role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Department *</label>
                  <select name="department" required className={inputClass}>
                    <option value="">Select department</option>
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Password *</label>
                <input name="password" type="password" required placeholder="Set initial password" className={inputClass} />
              </div>
              <div className="flex items-center gap-2">
                <input
                  name="is_active"
                  type="checkbox"
                  id="is_active"
                  defaultChecked
                  className="h-4 w-4 border border-input rounded"
                />
                <label htmlFor="is_active" className="text-xs text-foreground cursor-pointer">
                  Staff member is active
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={() => setShowForm(false)} className="h-8 px-4 text-sm border border-border text-foreground hover:bg-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="flex h-8 items-center gap-1 bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-[#005A9E] disabled:opacity-60">
                  {formLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Add Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
