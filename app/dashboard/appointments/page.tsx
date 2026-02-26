'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, X, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table'
import { StatusBadge } from '@/components/status-badge'
import { APPOINTMENT_TYPES, CLINICS } from '@/lib/constants'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AppointmentsPage() {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  const { data, isLoading, mutate } = useSWR(
    `/api/appointments?date=${dateFilter}`,
    fetcher
  )
  const { data: patientsData } = useSWR('/api/patients?limit=100', fetcher)
  const { data: doctorsData } = useSWR('/api/doctors', fetcher)

  const columns = [
    {
      key: 'time',
      label: 'Time',
      render: (row: Record<string, unknown>) => String(row.appointment_time).slice(0, 5),
    },
    {
      key: 'patient',
      label: 'Patient',
      render: (row: Record<string, unknown>) =>
        `${row.patient_first_name} ${row.patient_last_name}`,
    },
    { key: 'patient_number', label: 'Patient No.' },
    { key: 'appointment_type', label: 'Type' },
    { key: 'clinic', label: 'Clinic' },
    {
      key: 'doctor',
      label: 'Doctor',
      render: (row: Record<string, unknown>) =>
        row.doctor_first_name ? `Dr. ${row.doctor_first_name} ${row.doctor_last_name}` : '-',
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (row: Record<string, unknown>) => (
        <StatusBadge status={String(row.priority || 'routine')} />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Record<string, unknown>) => (
        <StatusBadge status={String(row.status)} />
      ),
    },
  ]

  async function handleBookAppointment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormLoading(true)
    const formData = new FormData(e.currentTarget)
    const body: Record<string, string | null> = {}
    formData.forEach((v, k) => { body[k] = v.toString() || null })

    await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setFormLoading(false)
    setShowForm(false)
    mutate()
  }

  const inputClass = "h-8 w-full border border-input bg-card px-2 text-sm text-foreground focus:border-primary focus:outline-none"
  const labelClass = "text-xs font-medium text-foreground mb-1"

  return (
    <div>
      <PageHeader
        title="Appointment Management"
        description="Schedule and manage patient appointments"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex h-8 items-center gap-1 bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-[#005A9E]"
          >
            <Plus className="h-4 w-4" />
            Book Appointment
          </button>
        }
      />

      <div className="flex items-center gap-2 mb-4">
        <label className="text-sm text-muted-foreground">Date:</label>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="h-8 border border-input bg-card px-2 text-sm text-foreground focus:border-primary focus:outline-none"
        />
      </div>

      {isLoading ? (
        <div className="h-64 bg-card border border-border animate-pulse" />
      ) : (
        <DataTable
          columns={columns}
          data={data?.appointments ?? []}
          emptyMessage="No appointments for this date"
        />
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/30 pt-16 overflow-y-auto">
          <div className="w-full max-w-lg bg-card border border-border mx-4 mb-12">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Book New Appointment</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleBookAppointment} className="p-4 flex flex-col gap-3">
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
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className={labelClass}>Date *</label>
                  <input name="appointment_date" type="date" required className={inputClass} defaultValue={dateFilter} />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Time *</label>
                  <input name="appointment_time" type="time" required className={inputClass} />
                </div>
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Appointment Type *</label>
                <select name="appointment_type" required className={inputClass}>
                  <option value="">Select type</option>
                  {APPOINTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Clinic</label>
                <select name="clinic" className={inputClass}>
                  <option value="">Select clinic</option>
                  {CLINICS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Doctor</label>
                <select name="doctor_id" className={inputClass}>
                  <option value="">Select doctor</option>
                  {doctorsData?.doctors?.map((d: Record<string, string>) => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.first_name} {d.last_name} - {d.department}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Reason</label>
                <textarea name="reason" rows={2} className="w-full border border-input bg-card px-2 py-1 text-sm text-foreground focus:border-primary focus:outline-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={() => setShowForm(false)} className="h-8 px-4 text-sm border border-border text-foreground hover:bg-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="flex h-8 items-center gap-1 bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-[#005A9E] disabled:opacity-60">
                  {formLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
