'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus, Search, X, Loader2, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { DataTable } from '@/components/data-table'
import { StatusBadge } from '@/components/status-badge'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function InventoryPage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  const { data, isLoading, mutate } = useSWR(
    `/api/inventory?search=${search}&category=${categoryFilter}`,
    fetcher
  )

  const { data: suppliersData } = useSWR('/api/suppliers', fetcher)

  const columns = [
    { key: 'item_name', label: 'Item Name' },
    { key: 'category', label: 'Category' },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (row: Record<string, unknown>) => {
        const qty = Number(row.quantity)
        const reorder = Number(row.reorder_level)
        const status = qty <= reorder ? 'low-stock' : 'in-stock'
        return (
          <div className="flex items-center gap-2">
            <span>{qty} {row.unit}</span>
            <StatusBadge status={status} />
          </div>
        )
      },
    },
    { key: 'reorder_level', label: 'Reorder Level' },
    { key: 'unit_cost', label: 'Unit Cost (KES)', render: (row: Record<string, unknown>) => `${Number(row.unit_cost).toFixed(2)}` },
    {
      key: 'supplier_name',
      label: 'Supplier',
      render: (row: Record<string, unknown>) => row.supplier_name || '-',
    },
    { key: 'department', label: 'Department' },
    {
      key: 'last_restock_date',
      label: 'Last Restock',
      render: (row: Record<string, unknown>) => 
        row.last_restock_date ? new Date(String(row.last_restock_date)).toLocaleDateString() : '-',
    },
    { key: 'location', label: 'Location' },
  ]

  async function handleAddItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormLoading(true)
    const formData = new FormData(e.currentTarget)
    const body: Record<string, string | null> = {}
    formData.forEach((v, k) => { body[k] = v.toString() || null })

    const response = await fetch('/api/inventory', {
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

  const categories = data?.items ? [...new Set(data.items.map((i: Record<string, unknown>) => i.category))] : []
  const inputClass = "h-8 w-full border border-input bg-card px-2 text-sm text-foreground focus:border-primary focus:outline-none"
  const labelClass = "text-xs font-medium text-foreground mb-1"

  return (
    <div>
      <PageHeader
        title="Inventory Management"
        description="Track hospital equipment, supplies, and store ledger"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex h-8 items-center gap-1 bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-[#005A9E]"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
        }
      />

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by item name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full border border-input bg-card pl-8 pr-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-8 border border-input bg-card px-2 text-sm text-foreground focus:border-primary focus:outline-none min-w-48"
        >
          <option value="">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="h-64 bg-card border border-border animate-pulse" />
      ) : data?.items?.some((i: Record<string, unknown>) => Number(i.quantity) <= Number(i.reorder_level)) ? (
        <div className="mb-4 border border-warning bg-warning/10 p-3 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <div className="text-sm text-foreground">
            <p className="font-medium">Low Stock Alert</p>
            <p className="text-xs text-muted-foreground">Some items need reordering. Stock levels are below reorder point.</p>
          </div>
        </div>
      ) : null}

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        emptyMessage="No items found in inventory"
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/30 pt-12 overflow-y-auto">
          <div className="w-full max-w-2xl bg-card border border-border mx-4 mb-12">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Add Inventory Item</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="p-4 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className={labelClass}>Item Name *</label>
                  <input name="item_name" type="text" required placeholder="e.g., Hospital Bed" className={inputClass} />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Category *</label>
                  <input name="category" type="text" required placeholder="e.g., Medical Equipment" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className={labelClass}>Quantity *</label>
                  <input name="quantity" type="number" required min="0" className={inputClass} />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Unit *</label>
                  <select name="unit" required className={inputClass}>
                    <option value="">Select unit</option>
                    <option value="Piece">Piece</option>
                    <option value="Box">Box</option>
                    <option value="Kit">Kit</option>
                    <option value="Set">Set</option>
                    <option value="Roll">Roll</option>
                    <option value="Pack">Pack</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className={labelClass}>Reorder Level *</label>
                  <input name="reorder_level" type="number" required min="0" className={inputClass} />
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Unit Cost (KES) *</label>
                  <input name="unit_cost" type="number" required min="0" step="0.01" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <label className={labelClass}>Supplier</label>
                  <select name="supplier_id" className={inputClass}>
                    <option value="">Select supplier</option>
                    {suppliersData?.suppliers?.map((s: Record<string, unknown>) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className={labelClass}>Department</label>
                  <input name="department" type="text" className={inputClass} />
                </div>
              </div>
              <div className="flex flex-col">
                <label className={labelClass}>Location</label>
                <input name="location" type="text" placeholder="e.g., Store Room B" className={inputClass} />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button type="button" onClick={() => setShowForm(false)} className="h-8 px-4 text-sm border border-border text-foreground hover:bg-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="flex h-8 items-center gap-1 bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-[#005A9E] disabled:opacity-60">
                  {formLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
