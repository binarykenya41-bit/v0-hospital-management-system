'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Search, X } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table'
import { StatusBadge } from '@/components/status-badge'
import { PatientForm } from './patient-form'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading, mutate } = useSWR(
    `/api/patients?search=${search}&page=${page}&limit=20`,
    fetcher
  )

  const columns = [
    { key: 'patient_number', label: 'Patient No.' },
    {
      key: 'name',
      label: 'Name',
      render: (row: Record<string, unknown>) =>
        `${row.first_name} ${row.last_name}`,
    },
    { key: 'national_id', label: 'National ID' },
    { key: 'gender', label: 'Gender' },
    { key: 'phone', label: 'Phone' },
    { key: 'county', label: 'County' },
    { key: 'sha_number', label: 'SHA No.' },
    {
      key: 'patient_type',
      label: 'Type',
      render: (row: Record<string, unknown>) => (
        <StatusBadge status={String(row.patient_type || 'outpatient')} />
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Patient Registry"
        description="Manage patient registrations and records"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex h-8 items-center gap-1 bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-[#005A9E]"
          >
            <Plus className="h-4 w-4" />
            Register Patient
          </button>
        }
      />

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, patient number, or national ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="h-8 w-full border border-input bg-card pl-8 pr-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 bg-card border border-border animate-pulse" />
      ) : (
        <DataTable
          columns={columns}
          data={data?.patients ?? []}
          page={data?.page ?? 1}
          totalPages={data?.totalPages ?? 1}
          onPageChange={setPage}
          emptyMessage="No patients found"
        />
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/30 pt-12 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-card border border-border mx-4 mb-12">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Register New Patient</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <PatientForm
              onSuccess={() => { setShowForm(false); mutate() }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
