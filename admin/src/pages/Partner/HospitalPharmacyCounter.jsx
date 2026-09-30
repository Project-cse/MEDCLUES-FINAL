import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Inline Icons (clean SVGs matching admin UI)
const IconBuilding = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const IconSearch = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const IconQrCode = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);
const IconCheckCircle = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconCheck = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
const IconPackage = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);
const IconShoppingBag = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);
const IconRefreshCw = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const IconCreditCard = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);
const IconBanknote = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const IconStethoscope = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
  </svg>
);
const IconVolume2 = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  </svg>
);
const IconVolumeX = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l4-4m0 4l-4-4" />
  </svg>
);

export default function HospitalPharmacyCounter() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    today_orders: 0,
    received: 0,
    packing: 0,
    ready: 0,
    dispensed: 0,
    today_revenue: 0,
  });
  const [inventory, setInventory] = useState([]);
  const [activeTab, setActiveTab] = useState('queue');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Token Lookup & Dispense Modal
  const [searchToken, setSearchToken] = useState('');
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [matchedOrder, setMatchedOrder] = useState(null);
  const [dispenseTarget, setDispenseTarget] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('counter_upi');
  const [dispensing, setDispensing] = useState(false);

  // Inventory Search & Edit
  const [invSearch, setInvSearch] = useState('');
  const [editingMed, setEditingMed] = useState(null);

  const prevOrderCount = useRef(0);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const getHeaders = () => {
    const token =
      sessionStorage.getItem('pharmacyToken') ||
      sessionStorage.getItem('deanToken') ||
      sessionStorage.getItem('aToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const playNotificationChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (_) {}
  };

  // Fetch Counter Queue Orders
  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await axios.get(`${backendUrl}/api/pharmacy/counter/orders`, {
        headers: getHeaders(),
      });
      if (data.success && Array.isArray(data.orders)) {
        if (data.orders.length > prevOrderCount.current && prevOrderCount.current > 0) {
          playNotificationChime();
          toast.info('New prescription arrived at counter!');
        }
        prevOrderCount.current = data.orders.length;
        setOrders(data.orders);
      }
    } catch (err) {
      console.warn('Counter orders fetch error:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Fetch Stats
  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/pharmacy/counter/stats`, {
        headers: getHeaders(),
      });
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (_) {}
  };

  // Fetch Hospital Inventory
  const fetchInventory = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/pharmacy/inventory`, {
        headers: getHeaders(),
      });
      if (data.success && Array.isArray(data.medicines)) {
        setInventory(data.medicines);
      }
    } catch (err) {
      console.warn('Inventory fetch error:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
    fetchInventory();

    const interval = setInterval(() => {
      fetchOrders(true);
      fetchStats();
    }, 6000);

    return () => clearInterval(interval);
  }, [backendUrl]);

  // Lookup Order by Token / QR
  const handleLookup = async (tokenQuery) => {
    const q = (tokenQuery || searchToken).trim();
    if (!q) return;
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/pharmacy/counter/lookup`,
        { token: q },
        { headers: getHeaders()}
      );
      if (data.success && data.order) {
        setMatchedOrder(data.order);
        setIsLookupOpen(true);
      } else {
        toast.warn(data.message || 'Token not found');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lookup failed');
    }
  };

  // Update Status (packing, ready)
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/pharmacy/counter/orders/${orderId}/status`,
        { status: newStatus },
        { headers: getHeaders() }
      );
      if (data.success) {
        toast.success(`Order marked as ${newStatus}`);
        fetchOrders(true);
        fetchStats();
        if (matchedOrder && matchedOrder.id === orderId) {
          setMatchedOrder({ ...matchedOrder, status: newStatus });
        }
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  // Complete Dispensing & Settle Payment
  const handleDispense = async () => {
    if (!dispenseTarget) return;
    setDispensing(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/pharmacy/counter/orders/${dispenseTarget.id}/dispense`,
        { payment_method: paymentMethod },
        { headers: getHeaders() }
      );
      if (data.success) {
        toast.success(`Prescription ${dispenseTarget.public_id} dispensed! Stock deducted.`);
        setDispenseTarget(null);
        setIsLookupOpen(false);
        fetchOrders(true);
        fetchStats();
        fetchInventory();
      } else {
        toast.error(data.message || 'Dispense failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Dispense failed');
    } finally {
      setDispensing(false);
    }
  };

  // Update Stock & Price
  const handleSaveMedicine = async (medId, updates) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/pharmacy/inventory/${medId}/stock`,
        updates,
        { headers: getHeaders() }
      );
      if (data.success) {
        toast.success('Medicine inventory updated');
        setEditingMed(null);
        fetchInventory();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Inventory update failed');
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  const filteredInventory = inventory.filter((m) => {
    const q = invSearch.toLowerCase();
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.brand || '').toLowerCase().includes(q) ||
      (m.salt || '').toLowerCase().includes(q) ||
      (m.rack_location || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1.5">
                <IconBuilding className="w-3.5 h-3.5" /> In-House Hospital Pharmacy Counter
              </span>
              <span className="bg-white/10 text-white/80 text-xs px-2.5 py-0.5 rounded-full font-medium">
                Live Auto-Routing Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hospital Pharmacy Counter &amp; Dispensing Hub
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Automatic receipt of completed doctor prescriptions with pre-saved inventory pricing, counter QR pass lookup, and instant stock deduction.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition text-xs font-semibold flex items-center gap-1.5"
              title={soundEnabled ? 'Chime Enabled' : 'Chime Muted'}
            >
              {soundEnabled ? <IconVolume2 className="w-4 h-4 text-emerald-400" /> : <IconVolumeX className="w-4 h-4 text-slate-400" />}
            </button>
            <button
              onClick={() => { fetchOrders(); fetchStats(); }}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <IconRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Live Counter Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Today Orders</p>
            <p className="text-2xl font-black text-white mt-1">{stats.today_orders}</p>
          </div>
          <div className="bg-amber-500/10 rounded-2xl p-3 border border-amber-500/20">
            <p className="text-[11px] font-medium text-amber-300 uppercase tracking-wider">To Pack</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{stats.received}</p>
          </div>
          <div className="bg-blue-500/10 rounded-2xl p-3 border border-blue-500/20">
            <p className="text-[11px] font-medium text-blue-300 uppercase tracking-wider">Packing</p>
            <p className="text-2xl font-black text-blue-400 mt-1">{stats.packing}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-2xl p-3 border border-emerald-500/20">
            <p className="text-[11px] font-medium text-emerald-300 uppercase tracking-wider">Ready at Counter</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{stats.ready}</p>
          </div>
          <div className="bg-violet-500/10 rounded-2xl p-3 border border-violet-500/20 col-span-2 sm:col-span-1">
            <p className="text-[11px] font-medium text-violet-300 uppercase tracking-wider">Today Revenue</p>
            <p className="text-2xl font-black text-violet-300 mt-1">₹{Number(stats.today_revenue || 0).toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Token / QR Lookup Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <IconSearch className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchToken}
            onChange={(e) => setSearchToken(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            placeholder="Scan QR or Enter Token (e.g. RX-0001-A1B2 or Patient Phone)..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none uppercase font-mono font-semibold"
          />
        </div>
        <button
          onClick={() => handleLookup()}
          className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition"
        >
          <IconQrCode className="w-4 h-4" />
          Lookup Token
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'queue'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <IconShoppingBag className="w-4 h-4" />
          Prescription Counter Queue ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'inventory'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <IconPackage className="w-4 h-4" />
          Hospital Medicines Inventory ({inventory.length})
        </button>
      </div>

      {/* TAB 1: COUNTER QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'received', label: 'New / Received' },
              { id: 'packing', label: 'Packing' },
              { id: 'ready', label: 'Ready for Pickup' },
              { id: 'dispensed', label: 'Dispensed' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterStatus(f.id)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition border ${
                  filterStatus === f.id
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <IconShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-base font-semibold text-slate-700">No prescriptions found in this view</p>
              <p className="text-xs text-slate-400 mt-1">
                When doctors end consultations, prescriptions will automatically route to this counter queue.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => {
                const isReceived = order.status === 'received';
                const isPacking = order.status === 'packing';
                const isReady = order.status === 'ready';
                const isDispensed = order.status === 'dispensed';

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-2xl border p-5 transition shadow-sm flex flex-col justify-between ${
                      isReceived
                        ? 'border-amber-300 ring-2 ring-amber-100'
                        : isPacking
                        ? 'border-blue-300 ring-2 ring-blue-100'
                        : isReady
                        ? 'border-emerald-400 ring-2 ring-emerald-100'
                        : 'border-slate-200 opacity-80'
                    }`}
                  >
                    <div>
                      {/* Top Meta */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <span className="text-xs font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                            {order.public_id}
                          </span>
                          <p className="text-sm font-bold text-slate-900 mt-1.5">
                            {order.patient_name}
                          </p>
                          <p className="text-xs text-slate-500">{order.patient_phone}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              isReceived
                                ? 'bg-amber-100 text-amber-800'
                                : isPacking
                                ? 'bg-blue-100 text-blue-800'
                                : isReady
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {order.status}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                          </p>
                        </div>
                      </div>

                      {/* Doctor info */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3 bg-slate-50 p-2 rounded-xl">
                        <IconStethoscope className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="font-semibold text-slate-800">{order.doctor_name}</span>
                        <span className="text-slate-400">· {order.doctor_specialty || 'General'}</span>
                      </div>

                      {/* Items list */}
                      <div className="space-y-1.5 border-t border-slate-100 pt-2.5 mb-3">
                        {(order.items || []).map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-slate-700 truncate pr-2">
                              <strong>{it.quantity}x</strong> {it.name}
                            </span>
                            <span className="text-slate-900 font-semibold shrink-0">
                              ₹{Number(it.line_total || (Number(it.unit_price) * Number(it.quantity))).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Total Amount</p>
                        <p className="text-base font-extrabold text-slate-900">
                          ₹{Number(order.amount_total || 0).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isReceived && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'packing')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                          >
                            <IconPackage className="w-3.5 h-3.5" /> Start Packing
                          </button>
                        )}
                        {isPacking && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'ready')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                          >
                            <IconCheck className="w-3.5 h-3.5" /> Ready for Pickup
                          </button>
                        )}
                        {isReady && (
                          <button
                            onClick={() => setDispenseTarget(order)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                          >
                            <IconCheckCircle className="w-3.5 h-3.5" /> Dispense &amp; Pay
                          </button>
                        )}
                        {isDispensed && (
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                            <IconCheck className="w-3.5 h-3.5 text-emerald-500" /> Done
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HOSPITAL MEDICINES INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hospital Pre-Saved Medicines Catalog</h3>
              <p className="text-xs text-slate-500">
                Prescription pricing and counter availability calculate automatically from these rates.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <IconSearch className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={invSearch}
                onChange={(e) => setInvSearch(e.target.value)}
                placeholder="Search medicine, salt, rack..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-3">Medicine &amp; Strength</th>
                  <th className="p-3">Salt / Composition</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Rack Loc</th>
                  <th className="p-3">Stock Qty</th>
                  <th className="p-3">Counter Price (₹)</th>
                  <th className="p-3">MRP (₹)</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((med) => {
                  const isEditing = editingMed?.id === med.id;
                  return (
                    <tr key={med.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">
                        {med.name}
                        {med.strength && <span className="text-slate-400 font-normal"> ({med.strength})</span>}
                      </td>
                      <td className="p-3 text-slate-500">{med.salt || '—'}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {med.category || 'General'}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingMed.rack_location}
                            onChange={(e) => setEditingMed({ ...editingMed, rack_location: e.target.value })}
                            className="w-20 px-1.5 py-1 border rounded text-xs"
                          />
                        ) : (
                          med.rack_location || 'Rack A-1'
                        )}
                      </td>
                      <td className="p-3 font-bold">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editingMed.stock}
                            onChange={(e) => setEditingMed({ ...editingMed, stock: parseInt(e.target.value, 10) || 0 })}
                            className="w-16 px-1.5 py-1 border rounded text-xs"
                          />
                        ) : (
                          <span className={med.stock < 20 ? 'text-amber-600 font-bold' : 'text-slate-700'}>
                            {med.stock}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-emerald-600">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.5"
                            value={editingMed.price}
                            onChange={(e) => setEditingMed({ ...editingMed, price: parseFloat(e.target.value) || 0 })}
                            className="w-16 px-1.5 py-1 border rounded text-xs"
                          />
                        ) : (
                          `₹${parseFloat(med.price).toFixed(2)}`
                        )}
                      </td>
                      <td className="p-3 text-slate-400 line-through">
                        ₹{parseFloat(med.mrp || med.price).toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleSaveMedicine(med.id, editingMed)}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-bold"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingMed(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingMed({ ...med })}
                            className="text-xs text-indigo-600 font-bold hover:underline"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DISPENSE & PAYMENT MODAL */}
      {dispenseTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 p-6 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {dispenseTarget.public_id}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">Dispense &amp; Counter Checkout</h3>
              </div>
              <button
                onClick={() => setDispenseTarget(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Patient:</span>
                <span className="font-bold text-slate-900">{dispenseTarget.patient_name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Prescribing Doctor:</span>
                <span className="font-semibold text-slate-800">{dispenseTarget.doctor_name}</span>
              </div>
              <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-bold">Total Payable:</span>
                <span className="text-lg font-extrabold text-emerald-600">
                  ₹{Number(dispenseTarget.amount_total || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Counter Payment Method:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('counter_upi')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'counter_upi'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold ring-2 ring-indigo-200'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <IconCreditCard className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs">Counter UPI QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3.5 rounded-2xl border flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === 'cash'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-bold ring-2 ring-emerald-200'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <IconBanknote className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs">Cash at Counter</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDispenseTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDispense}
                disabled={dispensing}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <IconCheckCircle className="w-4 h-4" />
                {dispensing ? 'Dispensing...' : 'Confirm Dispensed & Paid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
