'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Search, X, Loader2, FileText } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table'
import { StatusBadge } from '@/components/status-badge'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const TEST_CATEGORIES = [
  'Hematology', 'Biochemistry', 'Serology', 'Microbiology', 
  'Parasitology', 'Urinalysis', 'Immunology'
]

export default function LaboratoryPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [selectedTest, setSelectedTest] = useState<Record<string, unknown> | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const { data, isLoading, mutate } = useSWR(
    `/api/laboratory?status=${statusFilter}`,
    fetcher
  )

  const { data: patientsData } = useSWR('/api/patients?limit=100', fetcher)
  const { data: doctorsData } = useSWR('/api/doctors', fetcher)

  const columns = [
    {
      key: 'patient',
      label: 'Patient',
      render: (row: Record<string, unknown>) =>
        `${row.patient_first_name} ${row.patient_last_name}`,
    },
    { key: 'patient_number', label: 'Patient No.' },
    { key: 'test_name', label: 'Test Name' },
    { key: 'test_category', label: 'Category' },
    {
      key: 'urgency',
      label: 'Urgency',
      render: (row: Record<string, unknown>) => (
        <StatusBadge status={String(row.urgency || 'routine')} />
      ),
    },
    {
      key: 'doctor',
      label: 'Ordered By',
      render: (row: Record<string, unknown>) =>
        row.doctor_first_name ? `Dr. ${row.doctor_first_name} ${row.doctor_last_name}` : '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Record<string, unknown>) => (
        <StatusBadge status={String(row.status)} />
      ),
    },
    {
      key: 'requested_at',
      label: 'Requested',
      render: (row: Record<string, unknown>) =>
        new Date(String(row.requested_at)).toLocaleDateString(),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row: Record<string, unknown>) => (
        <button
          onClick={() => { setSelectedTest(row); setShowResults(true) }}
          className="text-primary hover:underline text-xs"
        >
          {row.status === 'completed' ? 'View' : 'Enter'} Results
        </button>
      ),
    },
  ]

  async function handleRequestTest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormLoading(true)

    const formData = new FormData(e.currentTarget)
    const body: Record<string, string | null> = {}
    formData.forEach((v, k) => { body[k] = v.toString() || null })

    const response = await fetch('/api/laboratory', {
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

  async function handleSaveResults(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedTest) return
    setFormLoading(true)

    const formData = new FormData(e.currentTarget)
    const body: Record<string, unknown> = {
      lab_test_id: selectedTest.id,
      status: 'completed',
    }
    formData.forEach((v, k) => { body[k] = v.toString() })

    const response = await fetch(`/api/laboratory/${selectedTest.id}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      setFormLoading(false)
      setShowResults(false)
      setSelectedTest(null)
      mutate()
    }
    setFormLoading(false)
  }

  const inputClass = "h-8 w-full border border-input bg-card px-2 text-sm text-foreground focus:border-primary focus:outline-none"
  const labelClass = "text-xs font-medium text-foreground mb-1"

  return (
    <div>
      <PageHeader
        title="Laboratory Management"
        description="Request tests, record results, and track turnaround time"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex h-8 items-center gap-1 bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-[#005A9E]"
          >
            <Plus className="h-4 w-4" />
            Request Test
          </button>
        }
      />

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 border border-input bg-card px-2 text-sm text-foreground focus:border-primary focus:outline-none min-w-48"
        >
          <option value="">All Tests</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {isLoading ? (
        <div className="h-64 bg-card border border-border animate-pulse" />
      ) : (
        <DataTable
          columns={columns}
          data={data?.tests ?? []}
          emptyMessage="No lab tests found"
        />
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/30 pt-12 overflow-y-auto">
          <div className="w-full max-w-lg bg-card border border-border mx-4 mb-12">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Request Lab Test</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleRequestTest} className="p-4 flex flex-col gap-3">
              <div className="flex flex-col">
                <label className={labelClass}>Patient *</label>
                <select name="patient_id" required className={inputClass}>
                  <option value="">Select patient</option>
                  {patientsData?.patients?.map((p: Record<string, string>) => (
                    <option key={p.id} value={p.id}>
                      {p.patient_number} - {p.first_name} {p.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Test Name *</label>
                <input name="test_name" type="text" required placeholder="e.g., Full Blood Count" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className={labelClass}>Category *</label>
                  <select name="test_category" required className={inputClass}>
                    <option value="">Select category</option>
                    {TEST_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Urgency</label>
                  <select name="urgency" className={inputClass}>
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Ordered By</label>
                <select name="doctor_id" className={inputClass}>
                  <option value="">Select doctor</option>
                  {doctorsData?.doctors?.map((d: Record<string, string>) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.first_name} {d.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Notes</label>
                <textarea name="notes" rows={2} className="w-full border border-input bg-card px-2 py-1 text-sm text-foreground focus:border-primary focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={() => setShowForm(false)} className="h-8 px-4 text-sm border border-border text-foreground hover:bg-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="flex h-8 items-center gap-1 bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-[#005A9E] disabled:opacity-60">
                  {formLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Request Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResults && selectedTest && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/30 pt-12 overflow-y-auto">
          <div className="w-full max-w-lg bg-card border border-border mx-4 mb-12">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Lab Test Results</h2>
              <button onClick={() => { setShowResults(false); setSelectedTest(null) }} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="border-b border-border px-4 py-3 bg-secondary">
              <p className="text-sm font-medium text-foreground">{String(selectedTest.test_name)}</p>
              <p className="text-xs text-muted-foreground">
                {String(selectedTest.patient_first_name)} {String(selectedTest.patient_last_name)} ({String(selectedTest.patient_number)})
              </p>
            </div>
            <form onSubmit={handleSaveResults} className="p-4 flex flex-col gap-3">
              <div className="flex flex-col">
                <label className={labelClass}>Result Text *</label>
                <textarea name="result_text" rows={3} required className="w-full border border-input bg-card px-2 py-1 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="Enter test results..." />
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Reference Range</label>
                <input name="reference_range" type="text" className={inputClass} placeholder="e.g., 4.5-11.0 x 10^9/L" />
              </div>
              <div className="flex items-center gap-2">
                <input
                  name="is_abnormal"
                  type="checkbox"
                  id="is_abnormal"
                  className="h-4 w-4 border border-input rounded"
                />
                <label htmlFor="is_abnormal" className="text-xs text-foreground cursor-pointer">
                  Results are abnormal
                </label>
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Notes</label>
                <textarea name="notes" rows={2} className="w-full border border-input bg-card px-2 py-1 text-sm text-foreground focus:border-primary focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={() => { setShowResults(false); setSelectedTest(null) }} className="h-8 px-4 text-sm border border-border text-foreground hover:bg-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="flex h-8 items-center gap-1 bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-[#005A9E] disabled:opacity-60">
                  {formLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Save Results
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
