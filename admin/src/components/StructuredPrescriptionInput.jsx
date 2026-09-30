import React, { useState, useEffect, useContext, useRef } from 'react'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { DoctorContext } from '../context/DoctorContext'

const DOSAGE_PRESETS = ['1 Tab', '2 Tabs', '1 Cap', '5 ml', '10 ml', '1 Drop', '1 Sachet']
const FREQUENCY_OPTIONS = [
  { value: '1-0-1', label: '1-0-1 (Twice daily)', perDay: 2 },
  { value: '1-0-0', label: '1-0-0 (Morning only)', perDay: 1 },
  { value: '0-0-1', label: '0-0-1 (Night only)', perDay: 1 },
  { value: '1-1-1', label: '1-1-1 (Thrice daily)', perDay: 3 },
  { value: '1-1-1-1', label: '1-1-1-1 (4 times daily)', perDay: 4 },
  { value: '0-1-0', label: '0-1-0 (Afternoon)', perDay: 1 },
  { value: 'SOS', label: 'SOS (As needed)', perDay: 1 },
]
const DURATION_PRESETS = ['3 days', '5 days', '7 days', '10 days', '14 days', '30 days']
const INSTRUCTION_PRESETS = ['After food', 'Before food', 'With warm water', 'At bedtime', 'Empty stomach']

export default function StructuredPrescriptionInput({
  appointmentId,
  hospitalId: propHospitalId,
  items = [],
  onChange,
  readOnly = false,
}) {
  const { backendUrl } = useContext(AppContext)
  const { dToken } = useContext(DoctorContext)

  const [inventory, setInventory] = useState([])
  const [loadingInventory, setLoadingInventory] = useState(false)
  const [activeDropdownRow, setActiveDropdownRow] = useState(null)
  const [searchTerms, setSearchTerms] = useState({})

  // Fetch hospital's pre-saved medicines inventory
  useEffect(() => {
    let cancelled = false
    const fetchInventory = async () => {
      setLoadingInventory(true)
      try {
        let url = `${backendUrl}/api/doctor/medicines`
        if (appointmentId) {
          url = `${backendUrl}/api/doctor/appointments/${appointmentId}/medicines`
        } else if (propHospitalId) {
          url = `${backendUrl}/api/doctor/medicines?hospitalId=${propHospitalId}`
        }
        const { data } = await axios.get(url, { headers: { dToken } })
        if (!cancelled && data.success && Array.isArray(data.medicines)) {
          setInventory(data.medicines)
        }
      } catch (err) {
        console.warn('Failed to load hospital medicine inventory:', err)
      } finally {
        if (!cancelled) setLoadingInventory(false)
      }
    }
    if (dToken) {
      fetchInventory()
    }
    return () => {
      cancelled = true
    }
  }, [appointmentId, propHospitalId, backendUrl, dToken])

  // Helper to calculate total and summary text
  const emitChanges = (updatedItems) => {
    let total = 0
    const summaryLines = []

    updatedItems.forEach((it, idx) => {
      const lineTotal = Number(it.line_total || (Number(it.unit_price || 0) * Number(it.quantity || 1)).toFixed(2))
      total += lineTotal
      if (it.name?.trim()) {
        summaryLines.push(
          `${idx + 1}. ${it.name} | ${it.dosage || '1 tab'} | ${it.frequency || '1-0-1'} | ${it.duration || '3 days'} | Qty: ${it.quantity || 1} ${it.instructions ? `(${it.instructions})` : ''} [₹${lineTotal.toFixed(2)}]`
        )
      }
    })

    if (onChange) {
      onChange(updatedItems, Number(total.toFixed(2)), summaryLines.join('\n'))
    }
  }

  // Row update helpers
  const handleItemChange = (index, field, value) => {
    const updated = [...items]
    const item = { ...updated[index], [field]: value }

    // If frequency or duration changes, auto-suggest quantity
    if (field === 'frequency' || field === 'duration') {
      const freqObj = FREQUENCY_OPTIONS.find((f) => f.value === (field === 'frequency' ? value : item.frequency))
      const perDay = freqObj ? freqObj.perDay : 2

      const durationStr = field === 'duration' ? value : item.duration || '3 days'
      const matchDays = String(durationStr).match(/(\d+)/)
      const days = matchDays ? parseInt(matchDays[1], 10) : 3

      const calculatedQty = Math.max(1, perDay * days)
      item.quantity = calculatedQty
      item.line_total = Number(((Number(item.unit_price) || 0) * calculatedQty).toFixed(2))
    } else if (field === 'quantity' || field === 'unit_price') {
      const q = Math.max(1, parseInt(item.quantity, 10) || 1)
      const p = parseFloat(item.unit_price) || 0
      item.line_total = Number((q * p).toFixed(2))
    }

    updated[index] = item
    emitChanges(updated)
  }

  // Selecting a pre-saved medicine from the hospital inventory
  const handleSelectMedicine = (index, med) => {
    const updated = [...items]
    const current = updated[index] || {}

    const unitPrice = parseFloat(med.price) || 40.0
    const qty = parseInt(current.quantity, 10) || 6
    const lineTotal = Number((unitPrice * qty).toFixed(2))

    updated[index] = {
      ...current,
      medicine_id: med.id,
      name: med.name,
      brand: med.brand || '',
      strength: med.strength || '',
      category: med.category || 'General',
      dosage_form: med.dosage_form || 'Tablet',
      stock: med.stock ?? 100,
      rack_location: med.rack_location || '',
      unit_price: unitPrice,
      quantity: qty,
      line_total: lineTotal,
      dosage: current.dosage || (med.dosage_form ? `1 ${med.dosage_form}` : '1 Tab'),
      frequency: current.frequency || '1-0-1',
      duration: current.duration || '3 days',
      instructions: current.instructions || 'After food',
    }

    setActiveDropdownRow(null)
    emitChanges(updated)
  }

  const handleAddRow = () => {
    const newItem = {
      medicine_id: null,
      name: '',
      dosage: '1 Tab',
      frequency: '1-0-1',
      duration: '3 days',
      quantity: 6,
      unit_price: 30.0,
      line_total: 180.0,
      instructions: 'After food',
    }
    const updated = [...items, newItem]
    emitChanges(updated)
    setActiveDropdownRow(items.length)
  }

  const handleRemoveRow = (index) => {
    const updated = items.filter((_, idx) => idx !== index)
    emitChanges(updated)
    if (activeDropdownRow === index) setActiveDropdownRow(null)
  }

  // Pre-seed 1 initial row if empty
  useEffect(() => {
    if (items.length === 0 && !readOnly) {
      handleAddRow()
    }
  }, [])

  const grandTotal = items.reduce((sum, it) => sum + (Number(it.line_total) || 0), 0)

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Structured Prescription &amp; Auto-Pricing
            </h4>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Prices calculate automatically from the hospital's pre-saved inventory counter.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="text-[11px] font-medium text-emerald-800 uppercase tracking-wider">Est. Pharmacy Total:</span>
            <span className="text-sm font-bold text-emerald-700">₹{grandTotal.toFixed(2)}</span>
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Medicine
            </button>
          )}
        </div>
      </div>

      {/* Multi-Row List */}
      <div className="space-y-3">
        {items.map((item, idx) => {
          const filter = (searchTerms[idx] || item.name || '').toLowerCase()
          const filteredMedicines = inventory.filter(
            (m) =>
              (m.name || '').toLowerCase().includes(filter) ||
              (m.salt || '').toLowerCase().includes(filter) ||
              (m.brand || '').toLowerCase().includes(filter)
          )

          const isStockLow = item.stock !== undefined && item.stock < (item.quantity || 1)

          return (
            <div
              key={idx}
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-3.5 sm:p-4 transition shadow-sm relative"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    Medicine #{idx + 1}
                  </span>
                  {item.category && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                      {item.category}
                    </span>
                  )}
                  {item.rack_location && (
                    <span className="text-[10px] text-slate-400">
                      📍 {item.rack_location}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 mr-1.5">
                      ₹{(Number(item.unit_price) || 0).toFixed(2)} × {item.quantity || 1} =
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      ₹{(Number(item.line_total) || 0).toFixed(2)}
                    </span>
                  </div>

                  {!readOnly && items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Remove row"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Grid Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                {/* 1. Medicine Dropdown / Searchable Input (Cols 1-4) */}
                <div className="sm:col-span-4 relative">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Medicine (Hospital Inventory) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled={readOnly}
                      value={item.name || ''}
                      onChange={(e) => {
                        const val = e.target.value
                        setSearchTerms((prev) => ({ ...prev, [idx]: val }))
                        handleItemChange(idx, 'name', val)
                        setActiveDropdownRow(idx)
                      }}
                      onFocus={() => setActiveDropdownRow(idx)}
                      placeholder="Search or pick pre-saved medicine..."
                      className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm bg-white outline-none pr-8"
                    />
                    <button
                      type="button"
                      disabled={readOnly}
                      onClick={() => setActiveDropdownRow(activeDropdownRow === idx ? null : idx)}
                      className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Autocomplete Dropdown Menu */}
                  {activeDropdownRow === idx && !readOnly && (
                    <div
                      className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100"
                    >
                      <div className="p-2 bg-slate-50 text-[11px] font-semibold text-slate-500 flex justify-between">
                        <span>Pre-Saved Hospital Catalog ({inventory.length})</span>
                        <button
                          type="button"
                          onClick={() => setActiveDropdownRow(null)}
                          className="text-slate-400 hover:text-slate-700 font-bold"
                        >
                          ✕
                        </button>
                      </div>

                      {filteredMedicines.length === 0 ? (
                        <div className="p-3 text-xs text-slate-400 text-center">
                          No exact inventory match. Custom item will use fallback pricing.
                        </div>
                      ) : (
                        filteredMedicines.map((med) => (
                          <div
                            key={med.id}
                            onClick={() => handleSelectMedicine(idx, med)}
                            className="p-2.5 hover:bg-indigo-50 cursor-pointer flex items-center justify-between text-left transition"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-xs font-semibold text-slate-900 truncate">
                                {med.name} {med.strength ? `(${med.strength})` : ''}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">
                                {med.brand ? `${med.brand} · ` : ''}{med.dosage_form || 'Tab'} · Stock: {med.stock ?? 100}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-emerald-600">₹{parseFloat(med.price).toFixed(2)}</span>
                              <p className="text-[10px] text-slate-400 line-through">MRP ₹{parseFloat(med.mrp || med.price).toFixed(2)}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {isStockLow && (
                    <p className="text-[11px] text-amber-600 font-medium mt-1">
                      ⚠️ Low stock alert ({item.stock} available in pharmacy counter)
                    </p>
                  )}
                </div>

                {/* 2. Dosage (Cols 5-6) */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={item.dosage || ''}
                    onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                    placeholder="e.g. 1 Tab"
                    className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2.5 py-2 text-sm bg-white outline-none"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {DOSAGE_PRESETS.slice(0, 3).map((d) => (
                      <button
                        key={d}
                        type="button"
                        disabled={readOnly}
                        onClick={() => handleItemChange(idx, 'dosage', d)}
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          item.dosage === d
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Frequency (Cols 7-8) */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Frequency *
                  </label>
                  <select
                    disabled={readOnly}
                    value={item.frequency || '1-0-1'}
                    onChange={(e) => handleItemChange(idx, 'frequency', e.target.value)}
                    className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2.5 py-2 text-xs bg-white outline-none font-medium text-slate-700"
                  >
                    {FREQUENCY_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Duration (Cols 9-10) */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Duration *
                  </label>
                  <input
                    type="text"
                    disabled={readOnly}
                    value={item.duration || ''}
                    onChange={(e) => handleItemChange(idx, 'duration', e.target.value)}
                    placeholder="e.g. 5 days"
                    className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2.5 py-2 text-sm bg-white outline-none"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    {DURATION_PRESETS.slice(0, 3).map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        disabled={readOnly}
                        onClick={() => handleItemChange(idx, 'duration', dur)}
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          item.duration === dur
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                            : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Quantity & Auto-Pricing (Cols 11-12) */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-slate-600">
                      Total Qty
                    </label>
                    <span className="text-[10px] text-slate-400">₹{item.unit_price || 0}/ea</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    disabled={readOnly}
                    value={item.quantity || 1}
                    onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                    className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-2.5 py-2 text-sm bg-white outline-none font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* Bottom Instructions / Meal Timing */}
              <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium text-slate-500">Instructions:</span>
                <input
                  type="text"
                  disabled={readOnly}
                  value={item.instructions || ''}
                  onChange={(e) => handleItemChange(idx, 'instructions', e.target.value)}
                  placeholder="e.g. After food, warm water"
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1 bg-white focus:border-indigo-400 outline-none flex-1 min-w-[140px]"
                />
                <div className="flex flex-wrap gap-1">
                  {INSTRUCTION_PRESETS.map((ins) => (
                    <button
                      key={ins}
                      type="button"
                      disabled={readOnly}
                      onClick={() => handleItemChange(idx, 'instructions', ins)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition ${
                        item.instructions === ins
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {ins}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Info Box */}
      <div className="mt-4 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
        <svg className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <span className="font-bold">In-Hospital Pharmacy Workflow:</span> When consultation is completed, this prescription is immediately transmitted to the hospital pharmacy counter. Patient receives their digital pickup token on the web app for 10-minute counter collection.
        </div>
      </div>
    </div>
  )
}
