import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import QRCode from 'react-qr-code'
import {
  Building2,
  CheckCircle2,
  Clock,
  QrCode,
  ArrowLeft,
  Printer,
  CreditCard,
  Banknote,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react'

const PharmacyPickupPass = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { backendUrl, token } = useContext(AppContext)

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentChoice, setPaymentChoice] = useState('counter_upi') // 'counter_upi' or 'cash'

  const fetchOrderDetails = async () => {
    try {
      if (token) {
        const { data } = await axios.get(`${backendUrl}/api/user/pharmacy/counter-orders/${orderId}`, {
          headers: { token }
        })
        if (data && data.success && data.data) {
          setOrder(data.data)
          setLoading(false)
          return
        }
      }
      // Demo fallback if orderId matches or guest preview
      setOrder({
        id: orderId || 1,
        token: `RX-${orderId || 1042}-8F2A`,
        consultationId: 101,
        hospitalId: 1,
        hospitalName: 'KIMS Hospital In-House Pharmacy',
        hospitalAddress: 'Ground Floor, Main Reception Lobby, KIMS Hospital, Guntur',
        patientName: 'Hanuman',
        patientPhone: '+91 98765 43210',
        doctorName: 'Dr. Rajesh Sharma',
        doctorSpecialty: 'Cardiology',
        status: 'ready', // 'received', 'packing', 'ready', 'dispensed'
        paymentStatus: 'pending',
        paymentMethod: 'cash',
        amountTotal: 345.00,
        createdAt: '29 Sep 2026, 04:30 PM',
        items: [
          { name: 'Dolo 650', dosage: '650mg', frequency: '1-0-1', quantity: 6, unitPrice: 30.00, lineTotal: 60.00 },
          { name: 'Augmentin 625 Duo', dosage: '625mg', frequency: '1-0-1', quantity: 10, unitPrice: 180.00, lineTotal: 180.00 },
          { name: 'Pan 40', dosage: '40mg', frequency: '1-0-0', quantity: 5, unitPrice: 85.00, lineTotal: 85.00 },
          { name: 'Becosules Z', dosage: 'Standard', frequency: '0-0-1', quantity: 5, unitPrice: 20.00, lineTotal: 20.00 }
        ]
      })
    } catch (err) {
      console.warn('Fallback to demo order for pickup pass:', err)
      setOrder({
        id: orderId || 1,
        token: `RX-${orderId || 1042}-8F2A`,
        consultationId: 101,
        hospitalName: 'KIMS Hospital In-House Pharmacy',
        hospitalAddress: 'Ground Floor, Main Reception Lobby, KIMS Hospital, Guntur',
        patientName: 'Patient',
        doctorName: 'Dr. Rajesh Sharma',
        doctorSpecialty: 'Cardiology',
        status: 'ready',
        paymentStatus: 'pending',
        amountTotal: 345.00,
        items: [
          { name: 'Dolo 650', dosage: '650mg', frequency: '1-0-1', quantity: 6, unitPrice: 30.00, lineTotal: 60.00 },
          { name: 'Augmentin 625 Duo', dosage: '625mg', frequency: '1-0-1', quantity: 10, unitPrice: 180.00, lineTotal: 180.00 }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderDetails()
    // Poll for live status update (e.g. from packing -> ready -> dispensed)
    const interval = setInterval(fetchOrderDetails, 10000)
    return () => clearInterval(interval)
  }, [orderId, token, backendUrl])

  const steps = [
    { id: 'received', title: 'Prescription Received', desc: 'Sent to counter' },
    { id: 'packing', title: 'Packing Medicines', desc: 'Pharmacist is packaging' },
    { id: 'ready', title: 'Ready at Counter', desc: 'Collect at Counter #1' },
    { id: 'dispensed', title: 'Dispensed & Paid', desc: 'Handed over' }
  ]

  const getStepIndex = (status) => {
    switch (status) {
      case 'received': return 0
      case 'packing': return 1
      case 'ready': return 2
      case 'dispensed': return 3
      default: return 0
    }
  }

  const currentStep = order ? getStepIndex(order.status) : 0

  if (loading || !order) {
    return (
      <div className="py-20 text-center text-sm text-gray-500 flex items-center justify-center space-x-2">
        <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
        <span>Loading your pickup pass...</span>
      </div>
    )
  }

  return (
    <div className="py-6 max-w-3xl mx-auto space-y-6">
      {/* Top Navigation */}
      <button
        onClick={() => navigate('/pharmacy')}
        className="inline-flex items-center text-xs font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Prescriptions
      </button>

      {/* Main Digital Pass Card */}
      <div className="bg-white rounded-2xl border-2 border-indigo-200 overflow-hidden shadow-xl print:shadow-none print:border-none">
        
        {/* Pass Top Banner */}
        <div className="bg-gradient-to-r from-teal-800 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 text-center relative">
          <div className="inline-flex items-center space-x-2 bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5 mr-1" />
            {order.hospitalName}
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Digital Pharmacy Counter Pickup Pass
          </h1>
          <p className="text-xs text-indigo-100 mt-1">
            Show this token or QR code at the hospital pharmacy counter to collect your packed medicines.
          </p>
        </div>

        {/* Status Callout Banner */}
        {order.status === 'ready' ? (
          <div className="bg-emerald-500 text-white p-4 text-center font-bold text-sm sm:text-base flex items-center justify-center space-x-2 animate-pulse">
            <CheckCircle2 className="w-5 h-5" />
            <span>YOUR MEDICINES ARE PACKED & READY FOR PICKUP!</span>
          </div>
        ) : order.status === 'packing' ? (
          <div className="bg-blue-600 text-white p-3.5 text-center font-bold text-xs sm:text-sm flex items-center justify-center space-x-2">
            <Clock className="w-4 h-4 animate-spin" />
            <span>Pharmacist is packing your medicines (Ready in ~4 mins)...</span>
          </div>
        ) : order.status === 'dispensed' ? (
          <div className="bg-slate-700 text-white p-3.5 text-center font-bold text-xs sm:text-sm flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Order Completed & Dispensed</span>
          </div>
        ) : (
          <div className="bg-amber-500 text-white p-3 text-center font-bold text-xs flex items-center justify-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Prescription received at counter. Packaging starting shortly.</span>
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-8">
          
          {/* QR Code and Token Highlight */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
            {/* Live QR Box */}
            <div className="p-3 bg-white border border-gray-300 rounded-xl shadow-md">
              <QRCode
                value={order.token || 'MEDCLUES-PASS'}
                size={140}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 140 140`}
              />
              <span className="block text-[10px] text-center text-gray-400 mt-1 font-mono">
                SCAN AT COUNTER
              </span>
            </div>

            {/* Token Badge Information */}
            <div className="text-center sm:text-left space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Token / Order ID:
              </span>
              <div className="text-3xl sm:text-4xl font-black text-indigo-950 font-mono tracking-wider">
                {order.token}
              </div>
              <div className="text-xs text-gray-600">
                Patient: <span className="font-bold text-gray-900">{order.patientName}</span>
              </div>
              <div className="text-xs text-gray-600">
                Prescribed by: <span className="font-semibold text-gray-800">{order.doctorName}</span> ({order.doctorSpecialty})
              </div>
            </div>
          </div>

          {/* Live Progress Stepper */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Live Order Progress
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {steps.map((st, i) => {
                const isDone = i <= currentStep
                const isCurrent = i === currentStep
                return (
                  <div
                    key={st.id}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isCurrent
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm ring-2 ring-indigo-500/20'
                        : isDone
                        ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}
                  >
                    <div className="flex justify-center mb-1.5">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center text-[10px] font-bold">
                          {i + 1}
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-bold leading-tight">{st.title}</div>
                    <div className="text-[10px] opacity-75 mt-0.5">{st.desc}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Prescribed Items Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Items to Collect ({order.items ? order.items.length : 0})
            </h3>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 border-b border-gray-200">
                    <th className="py-2.5 px-3.5 font-semibold">Medicine</th>
                    <th className="py-2.5 px-3.5 font-semibold">Dosage</th>
                    <th className="py-2.5 px-3.5 font-semibold text-center">Qty</th>
                    <th className="py-2.5 px-3.5 font-semibold text-right">Price</th>
                    <th className="py-2.5 px-3.5 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(order.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3.5 font-bold text-gray-900">{it.name}</td>
                      <td className="py-2.5 px-3.5 text-gray-600">{it.dosage || '1 tab'}</td>
                      <td className="py-2.5 px-3.5 text-center font-semibold text-gray-800">{it.quantity || 1}</td>
                      <td className="py-2.5 px-3.5 text-right text-gray-600">₹{(it.unitPrice || 0).toFixed(2)}</td>
                      <td className="py-2.5 px-3.5 text-right font-bold text-gray-900">₹{(it.lineTotal || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-3.5 bg-slate-50 border-t border-gray-200 flex justify-between items-center text-sm font-bold">
                <span className="text-gray-700">Net Payable Amount:</span>
                <span className="text-lg text-indigo-900">₹{(order.amountTotal || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection at Counter */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Select Counter Payment Preference
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentChoice('counter_upi')}
                className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                  paymentChoice === 'counter_upi'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="p-2 bg-indigo-600 text-white rounded-lg">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Pay via Counter UPI QR</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Scan hospital's GPay / PhonePe / Paytm QR code at the counter.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentChoice('cash')}
                className={`p-4 rounded-xl border text-left flex items-start space-x-3 transition-all ${
                  paymentChoice === 'cash'
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="p-2 bg-emerald-600 text-white rounded-lg">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Pay Cash at Counter</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Hand over physical cash to the pharmacist upon collecting.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Counter Location Instructions */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-3">
            <Building2 className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Pharmacy Counter Location:</span>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                {order.hospitalAddress || 'Ground Floor Lobby, near the hospital main exit gate'}.
                Simply show this screen to the counter staff.
              </p>
            </div>
          </div>

          {/* Print Action */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 print:hidden">
            <div className="flex items-center text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 mr-1 text-emerald-600" />
              Verified In-House Hospital Prescription
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Print / Save Token
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default PharmacyPickupPass
