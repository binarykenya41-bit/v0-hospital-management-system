'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { KENYAN_COUNTIES, BLOOD_GROUPS, PATIENT_TYPES } from '@/lib/constants'

interface PatientFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function PatientForm({ onSuccess, onCancel }: PatientFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const body: Record<string, string | null> = {}
    formData.forEach((value, key) => {
      body[key] = value.toString() || null
    })

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to register patient')
        setLoading(false)
        return
      }

      onSuccess()
    } catch {
      setError('Network error')
      setLoading(false)
    }
  }

  const inputClass = "h-8 w-full border border-input bg-card px-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
  const labelClass = "text-xs font-medium text-foreground mb-1"
  const selectClass = "h-8 w-full border border-input bg-card px-2 text-sm text-foreground focus:border-primary focus:outline-none"

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex flex-col gap-4">
        <fieldset className="border border-border p-3">
          <legend className="text-xs font-semibold text-primary px-1">Personal Information</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col">
              <label className={labelClass}>First Name *</label>
              <input name="first_name" required className={inputClass} placeholder="First name" />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Last Name *</label>
              <input name="last_name" required className={inputClass} placeholder="Last name" />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Other Names</label>
              <input name="other_names" className={inputClass} placeholder="Other names" />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>National ID *</label>
              <input name="national_id" required className={inputClass} placeholder="e.g. 32456789" />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Date of Birth</label>
              <input name="date_of_birth" type="date" className={inputClass} />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Gender *</label>
              <select name="gender" required className={selectClass}>
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Phone</label>
              <input name="phone" className={inputClass} placeholder="+254..." />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Email</label>
              <input name="email" type="email" className={inputClass} placeholder="email@example.com" />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Blood Group</label>
              <select name="blood_group" className={selectClass}>
                <option value="">Select</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="border border-border p-3">
          <legend className="text-xs font-semibold text-primary px-1">Location & Insurance</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col">
              <label className={labelClass}>County</label>
              <select name="county" className={selectClass}>
                <option value="">Select county</option>
                {KENYAN_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Sub-County</label>
              <input name="sub_county" className={inputClass} placeholder="Sub-county" />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Ward</label>
              <input name="ward" className={inputClass} placeholder="Ward" />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>SHA Number</label>
              <input name="sha_number" className={inputClass} placeholder="SHA-XXXXXX" />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Insurance Provider</label>
              <input name="insurance_provider" className={inputClass} placeholder="e.g. AAR, Jubilee" />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Insurance Number</label>
              <input name="insurance_number" className={inputClass} placeholder="Insurance number" />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Patient Type</label>
              <select name="patient_type" className={selectClass}>
                {PATIENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="flex flex-col sm:col-span-2">
              <label className={labelClass}>Address</label>
              <input name="address" className={inputClass} placeholder="Physical address" />
            </div>
          </div>
        </fieldset>

        <fieldset className="border border-border p-3">
          <legend className="text-xs font-semibold text-primary px-1">Next of Kin</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col">
              <label className={labelClass}>Full Name</label>
              <input name="next_of_kin_name" className={inputClass} placeholder="Full name" />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Phone</label>
              <input name="next_of_kin_phone" className={inputClass} placeholder="+254..." />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Relationship</label>
              <select name="next_of_kin_relationship" className={selectClass}>
                <option value="">Select</option>
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Child">Child</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="border border-border p-3">
          <legend className="text-xs font-semibold text-primary px-1">Emergency Contact</legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col">
              <label className={labelClass}>Full Name</label>
              <input name="emergency_contact_name" className={inputClass} placeholder="Full name" />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Phone</label>
              <input name="emergency_contact_phone" className={inputClass} placeholder="+254..." />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Relationship</label>
              <select name="emergency_contact_relationship" className={selectClass}>
                <option value="">Select</option>
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Child">Child</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="border border-border p-3">
          <legend className="text-xs font-semibold text-primary px-1">Referral Information</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className={labelClass}>Referral Source</label>
              <input name="referral_source" className={inputClass} placeholder="e.g. Self, Health Center" />
            </div>
            <div className="flex flex-col">
              <label className={labelClass}>Referral Hospital</label>
              <input name="referral_hospital" className={inputClass} placeholder="Referring hospital name" />
            </div>
          </div>
        </fieldset>
      </div>

      {error && <p className="text-sm text-destructive mt-3">{error}</p>}

      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="h-8 px-4 text-sm border border-border text-foreground hover:bg-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex h-8 items-center gap-1 bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-[#005A9E] disabled:opacity-60"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Register Patient
        </button>
      </div>
    </form>
  )
}
