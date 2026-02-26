'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Search, FileText, Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function EMRPage() {
  const [search, setSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Record<string, unknown> | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  const { data } = useSWR(
    search ? `/api/patients?search=${search}&limit=10` : null,
    fetcher
  )

  async function handleSaveRecord(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedPatient) return
    setSaving(true)
    setSavedMessage('')

    const formData = new FormData(e.currentTarget)
    const body: Record<string, string | null> = {
      patient_id: String(selectedPatient.id),
      record_type: 'consultation',
    }
    formData.forEach((v, k) => { body[k] = v.toString() || null })

    const res = await fetch('/api/emr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setSaving(false)
    if (res.ok) {
      setSavedMessage('Medical record saved successfully')
      e.currentTarget.reset()
    }
  }

  const inputClass = "h-8 w-full border border-input bg-card px-2 text-sm text-foreground focus:border-primary focus:outline-none"
  const labelClass = "text-xs font-medium text-foreground mb-1"

  return (
    <div>
      <PageHeader
        title="Electronic Medical Records"
        description="Create and manage patient medical records"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <div className="bg-card border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Find Patient</h3>
            <div className="relative mb-3">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search patient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-full border border-input bg-card pl-8 pr-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {data?.patients?.map((p: Record<string, unknown>) => (
              <button
                key={String(p.id)}
                onClick={() => setSelectedPatient(p)}
                className={`flex w-full items-start gap-2 border-b border-border px-2 py-2 text-left hover:bg-secondary ${
                  selectedPatient?.id === p.id ? 'bg-accent' : ''
                }`}
              >
                <FileText className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {String(p.first_name)} {String(p.last_name)}
                  </p>
                  <p className="text-xs text-muted-foreground">{String(p.patient_number)}</p>
                </div>
              </button>
            ))}

            {selectedPatient && (
              <div className="mt-4 border-t border-border pt-3">
                <h4 className="text-xs font-semibold text-primary mb-2">Selected Patient</h4>
                <p className="text-sm font-medium text-foreground">
                  {String(selectedPatient.first_name)} {String(selectedPatient.last_name)}
                </p>
                <p className="text-xs text-muted-foreground">{String(selectedPatient.patient_number)}</p>
                <p className="text-xs text-muted-foreground">
                  {String(selectedPatient.gender)} | {String(selectedPatient.blood_group || 'N/A')}
                </p>
                <p className="text-xs text-muted-foreground">SHA: {String(selectedPatient.sha_number || 'N/A')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="bg-card border border-border">
              <div className="border-b border-border px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">New Medical Record</h3>
                <p className="text-xs text-muted-foreground">
                  Patient: {String(selectedPatient.first_name)} {String(selectedPatient.last_name)} ({String(selectedPatient.patient_number)})
                </p>
              </div>
              <form onSubmit={handleSaveRecord} className="p-4 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <label className={labelClass}>Diagnosis *</label>
                    <input name="diagnosis" required className={inputClass} placeholder="Primary diagnosis" />
                  </div>
                  <div className="flex flex-col">
                    <label className={labelClass}>ICD-10 Code</label>
                    <input name="icd10_code" className={inputClass} placeholder="e.g. J18.9" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Chief Complaint</label>
                  <textarea name="chief_complaint" rows={2} className="w-full border border-input bg-card px-2 py-1 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="Patient's main complaint" />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>History of Present Illness</label>
                  <textarea name="history_of_illness" rows={2} className="w-full border border-input bg-card px-2 py-1 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="History details" />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Examination Findings</label>
                  <textarea name="examination_findings" rows={2} className="w-full border border-input bg-card px-2 py-1 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="Physical examination findings" />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Treatment Plan</label>
                  <textarea name="treatment_plan" rows={2} className="w-full border border-input bg-card px-2 py-1 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="Treatment plan" />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Clinical Notes</label>
                  <textarea name="clinical_notes" rows={3} className="w-full border border-input bg-card px-2 py-1 text-sm text-foreground focus:border-primary focus:outline-none" placeholder="Additional clinical notes" />
                </div>

                {savedMessage && (
                  <p className="text-sm text-success">{savedMessage}</p>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button type="submit" disabled={saving} className="flex h-8 items-center gap-1 bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-[#005A9E] disabled:opacity-60">
                    {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save Record
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center bg-card border border-border">
              <div className="text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Search and select a patient to create a medical record</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
