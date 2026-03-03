'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Search, X, Loader2, Printer } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table'
import { StatusBadge } from '@/components/status-badge'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function BillingPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({ patient_id: '', items: [] as Array<{ description: string; quantity: number; unit_price: number }> })

  const { data, isLoading, mutate } = useSWR(
    `/api/billing?status=${statusFilter}`,
    fetcher
  )

  const { data: patientsData } = useSWR('/api/patients?limit=100', fetcher)

  const columns = [
    { key: 'invoice_number', label: 'Invoice No.' },
    {
      key: 'patient',
      label: 'Patient',
      render: (row: Record<string, unknown>) =>
        `${row.patient_first_name} ${row.patient_last_name}`,
    },
    { key: 'patient_number', label: 'Patient No.' },
    { key: 'billing_type', label: 'Billing Type' },
    {
      key: 'sha_number',
      label: 'SHA Number',
      render: (row: Record<string, unknown>) => row.sha_number || '-',
    },
    { key: 'total', label: 'Total (KES)', render: (row: Record<string, unknown>) => `${Number(row.total).toLocaleString()}` },
    { key: 'amount_paid', label: 'Paid (KES)', render: (row: Record<string, unknown>) => `${Number(row.amount_paid).toLocaleString()}` },
    { key: 'balance', label: 'Balance (KES)', render: (row: Record<string, unknown>) => {
      const balance = Number(row.balance)
      return <span className={balance > 0 ? 'text-destructive font-medium' : 'text-success'}>{balance.toLocaleString()}</span>
    } },
    {
      key: 'status',
      label: 'Status',
      render: (row: Record<string, unknown>) => (
        <StatusBadge status={String(row.status)} />
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row: Record<string, unknown>) => (
        <button className="text-primary hover:underline text-xs" onClick={() => handlePrintInvoice(String(row.invoice_number))}>
          <Printer className="h-4 w-4" />
        </button>
      ),
    },
  ]

  async function handleCreateInvoice(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormLoading(true)

    const form = e.currentTarget
    const items = []
    let itemCount = 0
    
    // Collect line items from form
    while (form.querySelector(`input[name="item_${itemCount}_description"]`)) {
      const desc = (form.querySelector(`input[name="item_${itemCount}_description"]`) as HTMLInputElement)?.value
      const qty = Number((form.querySelector(`input[name="item_${itemCount}_qty"]`) as HTMLInputElement)?.value || 0)
      const price = Number((form.querySelector(`input[name="item_${itemCount}_price"]`) as HTMLInputElement)?.value || 0)
      
      if (desc && qty > 0 && price > 0) {
        items.push({ description: desc, quantity: qty, unit_price: price, total: qty * price })
      }
      itemCount++
    }

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)

    const body = {
      patient_id: formData.patient_id,
      billing_type: (form.querySelector('select[name="billing_type"]') as HTMLSelectElement)?.value || 'cash',
      sha_number: (form.querySelector('input[name="sha_number"]') as HTMLInputElement)?.value || null,
      insurance_provider: (form.querySelector('input[name="insurance_provider"]') as HTMLInputElement)?.value || null,
      insurance_number: (form.querySelector('input[name="insurance_number"]') as HTMLInputElement)?.value || null,
      subtotal,
      total: subtotal,
      items,
    }

    const response = await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      setFormLoading(false)
      setShowForm(false)
      setFormData({ patient_id: '', items: [] })
      mutate()
    }
    setFormLoading(false)
  }

  function handlePrintInvoice(invoiceNumber: string) {
    window.open(`/api/invoices/${invoiceNumber}/print`, '_blank')
  }

  function addLineItem() {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unit_price: 0 }],
    })
  }

  const inputClass = "h-8 w-full border border-input bg-card px-2 text-sm text-foreground focus:border-primary focus:outline-none"
  const labelClass = "text-xs font-medium text-foreground mb-1"

  return (
    <div>
      <PageHeader
        title="Billing & Invoicing"
        description="Create invoices, manage payments, and track SHA claims"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex h-8 items-center gap-1 bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-[#005A9E]"
          >
            <Plus className="h-4 w-4" />
            Create Invoice
          </button>
        }
      />

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 border border-input bg-card px-2 text-sm text-foreground focus:border-primary focus:outline-none min-w-48"
        >
          <option value="">All Invoices</option>
          <option value="pending">Pending</option>
          <option value="partial">Partially Paid</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
        <div className="h-64 bg-card border border-border animate-pulse" />
      ) : (
        <DataTable
          columns={columns}
          data={data?.invoices ?? []}
          emptyMessage="No invoices found"
        />
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/30 pt-12 overflow-y-auto">
          <div className="w-full max-w-3xl bg-card border border-border mx-4 mb-12">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Create New Invoice</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="p-4 flex flex-col gap-3">
              <div className="flex flex-col">
                <label className={labelClass}>Patient *</label>
                <select
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  required
                  className={inputClass}
                >
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
                  <label className={labelClass}>Billing Type *</label>
                  <select name="billing_type" required className={inputClass}>
                    <option value="cash">Cash</option>
                    <option value="sha">SHA</option>
                    <option value="insurance">Insurance</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>SHA Number</label>
                  <input name="sha_number" type="text" className={inputClass} placeholder="e.g., 123456789" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className={labelClass}>Insurance Provider</label>
                  <input name="insurance_provider" type="text" className={inputClass} />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Insurance Number</label>
                  <input name="insurance_number" type="text" className={inputClass} />
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-foreground">Invoice Items</label>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="text-xs text-primary hover:underline"
                  >
                    + Add Item
                  </button>
                </div>

                {formData.items.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-xs">
                    No items yet. Click "Add Item" to add line items.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {formData.items.map((_, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                        <input
                          name={`item_${idx}_description`}
                          type="text"
                          placeholder="Description"
                          className={`col-span-5 ${inputClass}`}
                          defaultValue={formData.items[idx]?.description}
                        />
                        <input
                          name={`item_${idx}_qty`}
                          type="number"
                          placeholder="Qty"
                          min="1"
                          className={`col-span-2 ${inputClass}`}
                          defaultValue={formData.items[idx]?.quantity || 1}
                        />
                        <input
                          name={`item_${idx}_price`}
                          type="number"
                          placeholder="Unit Price"
                          min="0"
                          step="0.01"
                          className={`col-span-3 ${inputClass}`}
                          defaultValue={formData.items[idx]?.unit_price}
                        />
                        <input
                          type="text"
                          disabled
                          value={`KES ${(formData.items[idx]?.quantity * formData.items[idx]?.unit_price || 0).toLocaleString()}`}
                          className={`col-span-2 ${inputClass} bg-secondary`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={() => setShowForm(false)} className="h-8 px-4 text-sm border border-border text-foreground hover:bg-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading || !formData.patient_id || formData.items.length === 0} className="flex h-8 items-center gap-1 bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-[#005A9E] disabled:opacity-60">
                  {formLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
