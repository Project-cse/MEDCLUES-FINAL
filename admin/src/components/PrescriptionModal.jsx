import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'
import { DoctorContext } from '../context/DoctorContext'
import { getPatientName, getPatientImage } from '../utils/appointmentDisplay'
import StructuredPrescriptionInput from './StructuredPrescriptionInput'

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
const labelCls = 'block text-xs font-semibold text-slate-600 mb-1.5'

const PrescriptionModal = ({ appointment, onClose, onSaved }) => {
    const { backendUrl } = useContext(AppContext)
    const { dToken } = useContext(DoctorContext)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ diagnosis: '', prescription: '', advice: '', notes: '', followupDate: '' })
    const [prescriptionItems, setPrescriptionItems] = useState([])
    const [prescriptionSummary, setPrescriptionSummary] = useState('')
    const [prescriptionTotal, setPrescriptionTotal] = useState(0)

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            setLoading(true)
            try {
                const { data } = await axios.get(
                    `${backendUrl}/api/doctor/appointments/${appointment._id}/consultation`,
                    { headers: { dToken } }
                )
                if (!cancelled && data?.success && data.consultation) {
                    const c = data.consultation
                    setForm({
                        diagnosis: c.diagnosis || '',
                        prescription: c.prescription || '',
                        advice: c.advice || '',
                        notes: c.notes || '',
                        followupDate: c.followupDate ? String(c.followupDate).slice(0, 10) : '',
                    })
                    const loadedItems = c.prescriptionItems || c.items || []
                    if (Array.isArray(loadedItems) && loadedItems.length > 0) {
                        setPrescriptionItems(loadedItems)
                    }
                }
            } catch (_) {
                // start blank on error
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [appointment._id, backendUrl, dToken])

    const handleSave = async () => {
        const hasItems = prescriptionItems.some((it) => it.name && it.name.trim())
        if (!hasItems && !form.prescription.trim()) {
            toast.error('Please enter at least one medicine before sending.')
            return
        }
        setSaving(true)
        try {
            const payload = {
                ...form,
                prescriptionItems,
                items: prescriptionItems,
                tablets: prescriptionSummary || form.prescription,
            }
            const { data } = await axios.post(
                `${backendUrl}/api/doctor/appointments/${appointment._id}/publish-prescription`,
                payload,
                { headers: { dToken } }
            )
            if (data?.success) {
                toast.success(data.message || 'Prescription sent to hospital pharmacy counter!')
                onSaved?.()
                onClose()
            } else {
                toast.error(data?.message || 'Could not save prescription')
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Could not save prescription')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full relative animate-scale-in overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
                style={{ maxHeight: '92vh' }}
            >
                {/* Header */}
                <div className="relative bg-gradient-to-r from-slate-800 to-slate-700 px-5 sm:px-6 py-5">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10" aria-label="Close">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <p className="text-[11px] uppercase tracking-widest text-white/60 font-semibold">Prescription &amp; Pharmacy Routing</p>
                    <div className="flex items-center gap-3 mt-3">
                        <img src={getPatientImage(appointment)} className="w-11 h-11 rounded-full object-cover ring-2 ring-white/30" alt="" />
                        <div className="min-w-0">
                            <h2 className="text-base font-bold text-white truncate">{getPatientName(appointment)}</h2>
                            <p className="text-xs text-white/70">Structured prescription with automated hospital inventory pricing</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-9 h-9 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
                        <div>
                            <label className={labelCls}>Primary Diagnosis</label>
                            <input className={inputCls} value={form.diagnosis} onChange={(e) => set('diagnosis', e.target.value)} placeholder="e.g. Acute bronchitis, Viral fever" />
                        </div>

                        {/* Structured Multi-Row Prescription */}
                        <div>
                            <StructuredPrescriptionInput
                                appointmentId={appointment._id}
                                hospitalId={appointment.hospital_id}
                                items={prescriptionItems}
                                onChange={(newItems, total, summaryText) => {
                                    setPrescriptionItems(newItems)
                                    setPrescriptionTotal(total)
                                    setPrescriptionSummary(summaryText)
                                }}
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Clinical Instructions &amp; Advice</label>
                            <textarea className={inputCls} rows={2} value={form.prescription} onChange={(e) => set('prescription', e.target.value)} placeholder="Dietary restrictions, precautions, hydration instructions…" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Special Advice</label>
                                <input className={inputCls} value={form.advice} onChange={(e) => set('advice', e.target.value)} placeholder="e.g. Rest for 3 days, drink warm fluids" />
                            </div>
                            <div>
                                <label className={labelCls}>Follow-up date</label>
                                <input type="date" className={inputCls} value={form.followupDate} onChange={(e) => set('followupDate', e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Internal notes</label>
                            <textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Doctor internal notes (saved to electronic health record)" />
                        </div>

                        <div className="flex items-start gap-2 text-xs text-emerald-800 bg-emerald-50/70 border border-emerald-200 rounded-xl px-3 py-2.5">
                            <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>
                                <strong>Automatic In-House Counter Routing:</strong> When you send this prescription, the hospital pharmacy counter will receive it immediately for packaging. The patient receives their QR/Token pickup pass.
                            </span>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                        {prescriptionItems.length > 0 && (
                            <span>Estimated Total: <strong className="text-slate-800 text-sm">₹{prescriptionTotal.toFixed(2)}</strong></span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-sm hover:bg-slate-100">Cancel</button>
                        <button onClick={handleSave} disabled={saving || loading} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm disabled:opacity-60 inline-flex items-center justify-center gap-2 shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            {saving ? 'Transmitting…' : 'Send Prescription to Pharmacy & Patient'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PrescriptionModal

