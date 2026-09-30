import React, { useContext, useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import pharmacyStaffImg from '../assets/pharmacy_banner_staff.png'
import medicinePlaceholderImg from '../assets/medicine_pack_placeholder.png'
import axios from 'axios'
import {
  Building2,
  Clock,
  QrCode,
  CheckCircle2,
  Package,
  AlertCircle,
  ChevronRight,
  Pill,
  Search,
  RefreshCw,
  FileText,
  Hospital,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  Info,
  ArrowRight,
  Filter,
  Eye,
  Check,
  ChevronLeft,
  UploadCloud,
  MapPin,
  User,
  Bell,
  HelpCircle,
  CheckCircle,
  ShoppingBag,
  Zap,
  Calendar,
  FileCheck
} from 'lucide-react'

// Demo Visited Hospital & Prescriptions Data with Hospital-Specific Categories (Direct from Tata 1mg Database)
const DEMO_VISITED_HOSPITALS = [
  {
    id: 16,
    name: 'KIMS Super Specialty Hospital Pharmacy',
    tag: 'KIMS',
    address: 'Ground Floor, OPD Block A, Main Road, Guntur',
    doctorName: 'Dr. Rajesh Sharma',
    doctorSpecialty: 'Cardiology & Critical Care',
    visitDate: '12 Sep 2025 • 10:30 AM',
    prescriptionNotes: 'Take medicines after food. Avoid oily diet. Review in 5 days.',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80',
    medicinesSummary: 'Actorise 100, Dolo 650, Augmentin',
    totalMedicinesCount: 3,
    totalPrescriptionAmount: 7646.00,
    oneClickPrice: 7473.00,
    categories: ['All', 'BLOOD RELATED', 'PAIN ANALGESICS', 'ANTI INFECTIVES', 'Fever & Pain', 'Blood Pressure'],
    summaryItems: [
      { name: 'Actorise 100 Injection', dosage: '100mcg', timing: 'Once weekly (SC)', duration: 'x 1 vial', price: 7473.00, image: 'https://onemg.gumlet.io/l_watermark_346/a_ignore,c_fit,q_auto,f_auto/c4d7f754a03f4c2c8b24847c534c2c6a.jpg' },
      { name: 'Dolo 650', dosage: '650mg', timing: '1-0-1 (After Food)', duration: 'x 3 days', price: 45.00, image: 'https://onemg.gumlet.io/l_watermark_346/a_ignore,c_fit,q_auto,f_auto/cropped/q76922.jpg' },
      { name: 'Augmentin 625 Duo', dosage: '625mg', timing: '1-0-1 (After Food)', duration: 'x 5 days', price: 128.00, image: 'https://onemg.gumlet.io/l_watermark_346/a_ignore,c_fit,q_auto,f_auto/cropped/q39257.jpg' }
    ],
    token: 'RX-1042-8F2A',
    status: 'packing'
  },
  {
    id: 17,
    name: 'Apollo Hospital Counter Pharmacy',
    tag: 'Apollo',
    address: 'Floor 1, Apollo Medical Center, Brodipet, Guntur',
    doctorName: 'Dr. Sunita Rao',
    doctorSpecialty: 'General Medicine & Pulmonology',
    visitDate: '10 Sep 2025 • 04:15 PM',
    prescriptionNotes: 'Drink warm fluids and get adequate rest.',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=600&q=80',
    medicinesSummary: 'Benadryl Syrup, BUDEcort 0.5mg, Pan 40',
    totalMedicinesCount: 3,
    totalPrescriptionAmount: 356.00,
    oneClickPrice: 294.00,
    categories: ['All', 'RESPIRATORY', 'Fever & Pain', 'Stomach Care', 'Allergy & Cold', 'GASTRO INTESTINAL', 'Diabetes'],
    summaryItems: [
      { name: 'Benadryl Syrup', dosage: '100ml', timing: '10ml (Night)', duration: 'x 5 days', price: 173.00, image: 'https://onemg.gumlet.io/l_watermark_346/a_ignore,c_fit,q_auto,f_auto/3fd1878ed3734cb6b357d34fb1d47cc1.jpg' },
      { name: 'BUDEcort 0.5mg Respules (2ml Each)', dosage: '0.5mg', timing: '1-0-1 (Inhalation)', duration: 'x 5 days', price: 121.00, image: 'https://onemg.gumlet.io/l_watermark_346/a_ignore,c_fit,q_auto,f_auto/lzupbnuthjghpr2yzjnh.jpg' },
      { name: 'Pan 40', dosage: '40mg', timing: '1-0-0 (Before Food)', duration: 'x 5 days', price: 62.00, image: 'https://onemg.gumlet.io/l_watermark_346/a_ignore,c_fit,q_auto,f_auto/e21183cf9b784a929ff85c6352932c02.jpg' }
    ],
    token: 'RX-1038-7B11',
    status: 'ready'
  },
  {
    id: 18,
    name: 'Manipal Hospital Pharmacy Counter',
    tag: 'Manipal',
    address: 'Near NH-16, Tadepalli, Guntur',
    doctorName: 'Dr. K. V. Raman',
    doctorSpecialty: 'Oncology & Super Specialty',
    visitDate: '05 Sep 2025 • 06:00 PM',
    prescriptionNotes: 'Follow scheduled chemotherapy protocol and apply topical creams as advised.',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80',
    medicinesSummary: 'Avastin 100mg, Betnovate-C, Azel 80',
    totalMedicinesCount: 3,
    totalPrescriptionAmount: 36985.50,
    oneClickPrice: 30542.50,
    categories: ['All', 'ANTI NEOPLASTICS', 'NEURO CNS', 'DERMA', 'HORMONES', 'PAIN ANALGESICS'],
    summaryItems: [
      { name: 'Avastin 100mg Injection', dosage: '100mg', timing: 'IV Infusion', duration: 'x 1 vial', price: 30473.00, image: 'https://onemg.gumlet.io/l_watermark_346/a_ignore,c_fit,q_auto,f_auto/1c1c52f2167c48cc987a52473bc0440b.jpg' },
      { name: 'Betnovate-C Cream', dosage: '30g', timing: 'Apply twice daily', duration: 'x 1 tube', price: 69.50, image: 'https://onemg.gumlet.io/l_watermark_346/a_ignore,c_fit,q_auto,f_auto/cropped/suh9cpr4ojpmmdbshw2a.jpg' },
      { name: 'Azel 80 Capsule', dosage: '80mg', timing: '1-0-0 (Morning)', duration: 'x 14 days', price: 6443.00, image: 'https://onemg.gumlet.io/l_watermark_346/a_ignore,c_fit,q_auto,f_auto/118fcd2fbc554da78f2b4f8cbbf3a8c1.jpg' }
    ],
    token: 'RX-1025-4M99',
    status: 'dispensed'
  }
]

const DEFAULT_CATEGORIES = [
  'All',
  'BLOOD RELATED',
  'PAIN ANALGESICS',
  'ANTI INFECTIVES',
  'RESPIRATORY',
  'ANTI NEOPLASTICS',
  'DERMA',
  'GASTRO INTESTINAL',
  'Fever & Pain'
]

const CATEGORY_TABS = [
  'All',
  'Pain Relief',
  'Antibiotics',
  'Gastro',
  'Diabetes',
  'Cardiac',
  'Vitamins',
  'Others'
]

const ALL_PARTNER_HOSPITALS = [
  {
    id: 16,
    name: 'KIMS Super Specialty Hospital Pharmacy',
    location: 'Main Road, Guntur',
    distance: '0.8 km',
    timing: '24/7 Open',
    rating: 4.9,
    phone: '+91 863 2345678'
  },
  {
    id: 17,
    name: 'Apollo Hospital Counter Pharmacy',
    location: 'Brodipet 2nd Line, Guntur',
    distance: '1.2 km',
    timing: '24/7 Open',
    rating: 4.8,
    phone: '+91 863 2223344'
  },
  {
    id: 18,
    name: 'Manipal Hospital Pharmacy Counter',
    location: 'Tadepalli, Guntur',
    distance: '2.5 km',
    timing: 'Open till 11:00 PM',
    rating: 4.7,
    phone: '+91 863 2998877'
  },
  {
    id: 11,
    name: 'Aster Ramesh Hospital Pharmacy',
    location: 'Collector Office Road, Guntur',
    distance: '1.9 km',
    timing: '24/7 Open',
    rating: 4.8,
    phone: '+91 863 2445566'
  }
]

// Clean image resolver: handles hotlinking protection, removes 1mg dummy placeholders, and provides instant fallback
const cleanMedicineImage = (imgUrl) => {
  if (!imgUrl || typeof imgUrl !== 'string') return medicinePlaceholderImg
  if (imgUrl.includes('hx2gxivwmeoxxxsc1hix') || imgUrl.includes('placeholder')) {
    return medicinePlaceholderImg
  }
  return imgUrl
}

const Pharmacy = () => {
  const { backendUrl, token, userData } = useContext(AppContext)
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  // Primary Tabs: 'catalog' | 'prescriptions' | 'orders'
  const [activeTab, setActiveTab] = useState('catalog')

  // Search & Filters
  const [globalSearch, setGlobalSearch] = useState('')
  const [catalogSearch, setCatalogSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Live Backend Search Data & Seeded Catalog
  const [catalogMedicines, setCatalogMedicines] = useState([])
  const [backendCategories, setBackendCategories] = useState([])
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [backendMedicines, setBackendMedicines] = useState([])
  const [backendHospitals, setBackendHospitals] = useState([])
  const [isSearchingBackend, setIsSearchingBackend] = useState(false)

  // Medicine Details Modal State
  const [selectedMedModal, setSelectedMedModal] = useState(null)

  // Page Optimization: Numbered Pagination for Medicine Catalog
  const [catalogPage, setCatalogPage] = useState(1)
  const itemsPerPage = 10 // 2 rows of 5 cards on desktop
  const [visibleSearchCount, setVisibleSearchCount] = useState(10)

  // Selected Hospital & Visited Hospital
  const [currentHospitalIndex, setCurrentHospitalIndex] = useState(0)
  const activeHospital = DEMO_VISITED_HOSPITALS[currentHospitalIndex] || DEMO_VISITED_HOSPITALS[0]
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState(DEMO_VISITED_HOSPITALS[0])
  const [isHospitalSelectorOpen, setIsHospitalSelectorOpen] = useState(false)

  // Synchronize hospital filter when active visited hospital changes
  useEffect(() => {
    if (DEMO_VISITED_HOSPITALS[currentHospitalIndex]) {
      setSelectedHospitalFilter(DEMO_VISITED_HOSPITALS[currentHospitalIndex])
      setSelectedCategory('All')
      setCatalogPage(1)
    }
  }, [currentHospitalIndex])

  // Reset catalog pagination on filter/search change
  useEffect(() => {
    setCatalogPage(1)
  }, [catalogSearch, selectedCategory, selectedHospitalFilter])

  // Fetch verified Tata 1mg medicines dynamically from database for selected hospital
  useEffect(() => {
    const fetchHospitalCatalog = async () => {
      setLoadingCatalog(true)
      try {
        const hospParam = selectedHospitalFilter?.id ? `&hospital_id=${selectedHospitalFilter.id}` : ''
        const { data } = await axios.get(`${backendUrl}/api/user/pharmacy/catalog?limit=150${hospParam}`)
        if (data && data.success && Array.isArray(data.medicines)) {
          setCatalogMedicines(data.medicines)
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            setBackendCategories(data.categories.map(c => c.category).filter(Boolean))
          } else {
            setBackendCategories([])
          }
          if (Array.isArray(data.hospitals) && data.hospitals.length > 0) {
            setBackendHospitals(data.hospitals)
          }
        }
      } catch (err) {
        console.warn('Backend catalog error:', err)
      } finally {
        setLoadingCatalog(false)
      }
    }
    fetchHospitalCatalog()
  }, [backendUrl, selectedHospitalFilter])

  // Live Backend Search Sync
  useEffect(() => {
    const fetchLiveCatalog = async () => {
      if (!globalSearch.trim()) {
        setBackendMedicines([])
        return
      }
      setIsSearchingBackend(true)
      try {
        const params = new URLSearchParams()
        params.append('q', globalSearch.trim())
        params.append('limit', '80')
        const { data } = await axios.get(`${backendUrl}/api/user/pharmacy/catalog?${params.toString()}`)
        if (data && data.success && Array.isArray(data.medicines)) {
          setBackendMedicines(data.medicines)
          if (Array.isArray(data.hospitals) && data.hospitals.length > 0) {
            setBackendHospitals(data.hospitals)
          }
        }
      } catch (err) {
        // Fallback silently to client-side catalog
      } finally {
        setIsSearchingBackend(false)
      }
    }
    const timer = setTimeout(fetchLiveCatalog, 200)
    return () => clearTimeout(timer)
  }, [globalSearch, backendUrl])

  // Filter matching hospital medical shops based on search
  const matchingHospitals = useMemo(() => {
    if (!globalSearch.trim()) return []
    const q = globalSearch.toLowerCase().trim()
    const list = [...ALL_PARTNER_HOSPITALS]
    
    // Add backend hospitals if not already in list
    backendHospitals.forEach(bh => {
      if (!list.some(h => h.name.toLowerCase() === bh.name.toLowerCase())) {
        list.push({
          id: bh.id,
          name: bh.name,
          location: bh.address || 'Partner Hospital Counter',
          distance: '1.5 km',
          timing: '24/7 Open',
          rating: 4.8,
          phone: '+91 863 2223344'
        })
      }
    })

    return list.filter(h =>
      h.name.toLowerCase().includes(q) ||
      h.location.toLowerCase().includes(q)
    )
  }, [globalSearch, backendHospitals])

  // Filter matching medicines based on search (combines live search + hospital catalog directly from Tata 1mg)
  const matchingMedicines = useMemo(() => {
    if (!globalSearch.trim()) return []
    const q = globalSearch.toLowerCase().trim()
    const combined = [...backendMedicines, ...catalogMedicines]
    const seen = new Set()
    return combined.filter(med => {
      const name = (med.name || '').toLowerCase()
      const salt = (med.salt || '').toLowerCase()
      const brand = (med.brand || '').toLowerCase()
      const cat = (med.category || '').toLowerCase()
      const match = name.includes(q) || salt.includes(q) || brand.includes(q) || cat.includes(q)
      if (!match) return false
      if (seen.has(name)) return false
      seen.add(name)
      return true
    })
  }, [globalSearch, backendMedicines, catalogMedicines])

  // Prescription Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadSuccessAlert, setUploadSuccessAlert] = useState(false)
  const [uploadNotes, setUploadNotes] = useState('')

  // Medicine Reminders Modal
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)

  // Cart State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('medclues_pharmacy_cart_v2')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false)
  const [fulfillmentMode, setFulfillmentMode] = useState('pickup') // 'pickup' | 'delivery'
  const [checkoutSuccessToken, setCheckoutSuccessToken] = useState(null)

  // Orders State
  const [orders, setOrders] = useState([
    {
      id: 'ORD-9842',
      token: 'RX-1042-8F2A',
      hospitalName: 'KIMS Super Specialty Hospital',
      date: 'Today, 11:42 AM',
      status: 'packing', // 'received', 'packing', 'ready', 'dispensed'
      total: 345.00,
      fulfillment: 'pickup',
      items: [
        { name: 'Dolo 650mg', qty: 2, price: 45.00 },
        { name: 'Augmentin 625', qty: 1, price: 128.00 },
        { name: 'Pan 40', qty: 2, price: 62.00 }
      ]
    }
  ])

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('medclues_pharmacy_cart_v2', JSON.stringify(cart))
    } catch (e) {
      console.warn('LocalStorage save error:', e)
    }
  }, [cart])

  // Cart Helpers
  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + (item.quantity || 1), 0), [cart])
  const cartSubtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0), [cart])
  const deliveryFee = fulfillmentMode === 'delivery' ? 40.00 : 0.00
  const cartGrandTotal = cartSubtotal + deliveryFee

  const addToCart = (med, e) => {
    if (e) e.stopPropagation()
    setCart(prev => {
      const exists = prev.find(item => item.id === med.id)
      if (exists) {
        return prev.map(item => item.id === med.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...med, quantity: 1 }]
    })
  }

  const updateCartQty = (medId, delta, e) => {
    if (e) e.stopPropagation()
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === medId) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean)
    )
  }

  const getCartQuantity = (medId) => {
    const found = cart.find(x => x.id === medId)
    return found ? found.quantity : 0
  }

  // 1-Click Reorder handler
  const handleOneClickReorder = (hospital) => {
    const newItems = hospital.summaryItems.map((item, idx) => ({
      id: 200 + idx,
      name: item.name,
      price: item.price,
      quantity: 1,
      pack_size: item.dosage,
      image: item.image || medicinePlaceholderImg
    }))

    setCart(newItems)
    setIsCartDrawerOpen(true)
  }

  // Handle Prescription File Selection
  const handleFileDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0])
      setUploadSuccessAlert(true)
      setTimeout(() => setUploadSuccessAlert(false), 4500)
    }
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
      setUploadSuccessAlert(true)
      setTimeout(() => setUploadSuccessAlert(false), 4500)
    }
  }

  // Submit Uploaded Prescription
  const handleConfirmUpload = () => {
    if (!uploadedFile) return
    const newToken = `RX-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      token: newToken,
      hospitalName: activeHospital.name,
      date: 'Just now',
      status: 'received',
      total: 0.00,
      fulfillment: 'pickup',
      items: [{ name: `Uploaded Slip (${uploadedFile.name})`, qty: 1, price: 0.00 }]
    }
    setOrders([newOrder, ...orders])
    setIsUploadModalOpen(false)
    setUploadedFile(null)
    setUploadNotes('')
    setCheckoutSuccessToken(newToken)
  }

  // Complete Checkout
  const handleCheckout = () => {
    if (cart.length === 0) return
    const generatedToken = `RX-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      token: generatedToken,
      hospitalName: activeHospital.name,
      date: 'Just now',
      status: 'received',
      total: cartGrandTotal,
      fulfillment: fulfillmentMode,
      items: cart.map(i => ({ name: i.name, qty: i.quantity, price: i.price }))
    }
    setOrders([newOrder, ...orders])
    setCart([])
    setIsCartDrawerOpen(false)
    setCheckoutSuccessToken(generatedToken)
  }

  // Dynamic Categories tailored for the active hospital
  const activeCategories = useMemo(() => {
    if (backendCategories.length > 0) {
      return ['All', ...backendCategories.filter(c => c && c !== 'All')]
    }
    if (selectedHospitalFilter && Array.isArray(selectedHospitalFilter.categories) && selectedHospitalFilter.categories.length > 0) {
      return selectedHospitalFilter.categories
    }
    return DEFAULT_CATEGORIES
  }, [backendCategories, selectedHospitalFilter])

  // Filtered Catalog (Filtered specifically by Selected Hospital, Search Query, and Category)
  const filteredCatalog = useMemo(() => {
    return catalogMedicines.filter(med => {
      // 1. Hospital Exclusivity Check
      if (selectedHospitalFilter && med.hospital_id) {
        if (med.hospital_id !== selectedHospitalFilter.id) {
          return false
        }
      }

      // 2. Search query filter
      const matchSearch =
        catalogSearch === '' ||
        (med.name && med.name.toLowerCase().includes(catalogSearch.toLowerCase())) ||
        (med.salt && med.salt.toLowerCase().includes(catalogSearch.toLowerCase())) ||
        (med.brand && med.brand.toLowerCase().includes(catalogSearch.toLowerCase()))

      // 3. Category tab filter
      const matchCategory =
        selectedCategory === 'All' ||
        (med.category && med.category.toLowerCase().includes(selectedCategory.toLowerCase()))

      return matchSearch && matchCategory
    })
  }, [catalogMedicines, catalogSearch, selectedCategory, selectedHospitalFilter])

  // Pagination Computations
  const totalCatalogPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredCatalog.length / itemsPerPage))
  }, [filteredCatalog.length, itemsPerPage])

  const paginatedCatalog = useMemo(() => {
    const start = (catalogPage - 1) * itemsPerPage
    return filteredCatalog.slice(start, start + itemsPerPage)
  }, [filteredCatalog, catalogPage, itemsPerPage])

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-outfit text-slate-800 pb-20">
      
      {/* 1. TOP SUB-HEADER BAR (Search Bar + Cart Only) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Global Search Bar (Full prominence) */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value)
                  setCatalogSearch(e.target.value)
                }}
                placeholder="Search hospital pharmacies, doctors, or medicines..."
                className="w-full pl-11 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-full text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-2xs"
              />
              {globalSearch && (
                <button
                  onClick={() => {
                    setGlobalSearch('')
                    setCatalogSearch('')
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  title="Clear Search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Cart Button with Count Badge Only */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-2.5 text-slate-700 hover:text-sky-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="View Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-sky-600 text-white text-[11px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-5">
        
        {/* 2. HERO BANNER (Ultra-Premium & Compact) */}
        <div className="relative rounded-3xl bg-gradient-to-r from-sky-100/80 via-white to-blue-100/60 border border-sky-200/90 py-5 sm:py-6 px-6 sm:px-8 overflow-hidden shadow-[0_4px_24px_-4px_rgba(2,132,199,0.09)] mb-5">
          {/* Decorative soft glow */}
          <div className="absolute -top-12 -right-12 w-80 h-80 bg-sky-300/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-8">
            
            {/* Banner Left Content */}
            <div className="max-w-xl text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-sky-200 shadow-2xs backdrop-blur-sm text-[10px] sm:text-[11px] font-black text-sky-700 uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Official Hospital In-House Pharmacy Storefront</span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-[28px] font-black text-slate-900 leading-tight tracking-tight mb-2">
                Order Genuine Medicines From <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-primary to-blue-700">
                  Your Hospital's In-House Pharmacy
                </span>
              </h1>

              {/* Modern Micro Feature Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-3.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/90 border border-slate-200/90 text-[11px] font-bold text-slate-700 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  100% Authentic
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/90 border border-slate-200/90 text-[11px] font-bold text-slate-700 shadow-2xs">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Fast Counter Pickup
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/90 border border-slate-200/90 text-[11px] font-bold text-slate-700 shadow-2xs">
                  <Package className="w-3.5 h-3.5 text-sky-600" />
                  Home Delivery Available
                </span>
              </div>

              {/* CTA Row */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Prescription Slip (PDF/Image)</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </button>

                <span className="text-[11px] text-slate-500 font-medium">
                  ⚡ Instant Token Generated • 0 Wait Time
                </span>
              </div>
            </div>

            {/* Banner Right Image (With Floating Pharmacist Tag) */}
            <div className="relative flex items-center justify-center shrink-0">
              <div className="relative">
                <img
                  src={pharmacyStaffImg}
                  alt="Hospital In-House Pharmacist"
                  className="w-auto h-36 sm:h-44 lg:h-48 object-contain drop-shadow-md z-10"
                />
                <div className="absolute -bottom-1 -left-2 bg-white/95 backdrop-blur-md border border-sky-200 px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1.5 z-20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-extrabold text-slate-800">
                    Hospital Pharmacists Online
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3. TABS NAVIGATION (Streamlined) */}
        <div className="flex items-center gap-6 sm:gap-8 border-b border-slate-200 mb-5 pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 pb-2.5 text-xs sm:text-sm font-bold transition-all relative cursor-pointer whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'text-sky-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Visited Hospitals & Medicine Catalog</span>
            {activeTab === 'catalog' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`flex items-center gap-2 pb-2.5 text-xs sm:text-sm font-bold transition-all relative cursor-pointer whitespace-nowrap ${
              activeTab === 'prescriptions'
                ? 'text-sky-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Prescription</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-100 text-slate-700">
              {DEMO_VISITED_HOSPITALS.length}
            </span>
            {activeTab === 'prescriptions' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 pb-2.5 text-xs sm:text-sm font-bold transition-all relative cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'text-sky-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-100 text-slate-700">
              {orders.length}
            </span>
            {activeTab === 'orders' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />
            )}
          </button>
        </div>

        {/* 4. MAIN TWO-COLUMN DASHBOARD */}
        {activeTab === 'catalog' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: Dynamic Search Results OR Visited Hospitals + In-House Catalog (9 cols) */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6">
              
              {globalSearch.trim() !== '' ? (
                /* DYNAMIC SEARCH RESULTS (Displayed directly under banner; NO recently visited hospitals) */
                <div className="space-y-6 text-left">
                  {/* Results Header Bar */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                          <Search className="w-4 h-4" />
                        </div>
                        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                          Search Results for "{globalSearch}"
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Found {matchingMedicines.length} medicine{matchingMedicines.length === 1 ? '' : 's'} and {matchingHospitals.length} hospital medical store{matchingHospitals.length === 1 ? '' : 's'}
                        {isSearchingBackend && (
                          <span className="ml-2 text-sky-600 font-semibold animate-pulse">• Searching live inventory...</span>
                        )}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setGlobalSearch('')
                        setCatalogSearch('')
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Clear Search</span>
                    </button>
                  </div>

                  {/* 1. MATCHING HOSPITAL PHARMACIES & MEDICAL SHOPS */}
                  {matchingHospitals.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
                      <div className="flex items-center gap-2 mb-3">
                        <Hospital className="w-4 h-4 text-sky-600" />
                        <h3 className="text-sm font-extrabold text-slate-900">
                          Matching Hospital Medical Shops ({matchingHospitals.length})
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                        {matchingHospitals.map((hosp, idx) => (
                          <div
                            key={hosp.id || idx}
                            onClick={() => {
                              setCurrentHospitalIndex(idx % DEMO_VISITED_HOSPITALS.length)
                              setGlobalSearch('')
                            }}
                            className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/40 transition-all cursor-pointer flex flex-col justify-between group"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-1">
                                <h4 className="text-xs font-black text-slate-900 group-hover:text-sky-600 transition-colors">
                                  {hosp.name}
                                </h4>
                                <span className="text-xs font-bold text-amber-500 shrink-0">★ {hosp.rating || 4.8}</span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{hosp.location || hosp.address} • {hosp.distance || '1.5 km'}</span>
                              </div>
                              <span className="inline-block mt-2 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                {hosp.timing || '24/7 Open'}
                              </span>
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600">
                              <span>Enter Hospital Store</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. MATCHING MEDICINES */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-sky-600" />
                        <h3 className="text-sm font-extrabold text-slate-900">
                          Matching Medicines ({matchingMedicines.length})
                        </h3>
                      </div>
                    </div>

                    {matchingMedicines.length === 0 && matchingHospitals.length === 0 ? (
                      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
                        <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-3">
                          <Search className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">
                          No medicines or hospital shops found for "{globalSearch}"
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Try searching by salt (e.g. Paracetamol, Pantoprazole) or hospital name (e.g. KIMS, Apollo)
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                          {['Dolo 650', 'Augmentin', 'Pan 40', 'Zerodol', 'KIMS', 'Apollo'].map((term) => (
                            <button
                              key={term}
                              onClick={() => setGlobalSearch(term)}
                              className="px-3 py-1 bg-slate-100 hover:bg-sky-50 hover:text-sky-600 rounded-full text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
                        {matchingMedicines.slice(0, visibleSearchCount).map((med) => {
                          const inCartQty = getCartQuantity(med.id)
                          return (
                            <div
                              key={med.id}
                              onClick={() => setSelectedMedModal(med)}
                              className="bg-white rounded-2xl border border-slate-200/80 p-3 flex flex-col justify-between hover:shadow-md hover:border-sky-300 transition-all text-left group cursor-pointer"
                            >
                              <div>
                                <div className="relative w-full h-24 bg-slate-50 rounded-xl overflow-hidden mb-2.5 flex items-center justify-center p-2 border border-slate-100">
                                  <span className="absolute top-1.5 right-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                                    In Stock
                                  </span>
                                  <img
                                    src={cleanMedicineImage(med.image)}
                                    alt={med.name}
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      e.target.onerror = null
                                      e.target.src = medicinePlaceholderImg
                                    }}
                                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                                  />
                                </div>

                                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug line-clamp-1">
                                  {med.name}
                                </h4>
                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                  {med.salt || med.category || 'Pharmaceutical Formulation'}
                                </p>
                                <div className="text-[11px] font-bold text-slate-900 mt-1.5">
                                  ₹ {(med.price || 45).toFixed(0)}{' '}
                                  <span className="text-[10px] font-normal text-slate-400">
                                    • {med.pack_size || med.dosage_form || '10 tablets'}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-2.5 pt-2 border-t border-slate-100">
                                {inCartQty > 0 ? (
                                  <div className="flex items-center justify-between bg-sky-50 rounded-xl p-1 border border-sky-200">
                                    <button
                                      onClick={(e) => updateCartQty(med.id, -1, e)}
                                      className="w-5 h-5 rounded-lg bg-white text-sky-600 flex items-center justify-center shadow-2xs hover:bg-sky-600 hover:text-white transition-colors cursor-pointer"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs font-black text-sky-900">
                                      {inCartQty}
                                    </span>
                                    <button
                                      onClick={(e) => updateCartQty(med.id, 1, e)}
                                      className="w-5 h-5 rounded-lg bg-white text-sky-600 flex items-center justify-center shadow-2xs hover:bg-sky-600 hover:text-white transition-colors cursor-pointer"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={(e) => addToCart(med, e)}
                                    className="w-full py-1.5 px-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 transition-all cursor-pointer"
                                  >
                                    <ShoppingCart className="w-3.5 h-3.5" />
                                    <span>Add to Cart</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Search Results Pagination / Show More */}
                    {matchingMedicines.length > 10 && (
                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                        <span>
                          Showing {Math.min(visibleSearchCount, matchingMedicines.length)} of {matchingMedicines.length} matching medicines
                        </span>
                        {visibleSearchCount < matchingMedicines.length ? (
                          <button
                            onClick={() => setVisibleSearchCount(prev => prev + 10)}
                            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
                          >
                            Show More Results (+10)
                          </button>
                        ) : (
                          <button
                            onClick={() => setVisibleSearchCount(10)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors"
                          >
                            Show Less
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* DEFAULT VIEW (When no item is searched: Shows Recently Visited Hospitals + Standard In-House Catalog) */
                <>
                  {/* SECTION: My Recently Visited Hospitals */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                            <Hospital className="w-4 h-4" />
                          </div>
                          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                            My Recently Visited Hospitals
                          </h2>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Quick access to your recent doctor consultations and prescriptions
                        </p>
                      </div>

                      <button
                        onClick={() => setIsHospitalSelectorOpen(true)}
                        className="text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>View All ({DEMO_VISITED_HOSPITALS.length})</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Interactive Visited Hospital Switcher Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3.5 scrollbar-none">
                      {DEMO_VISITED_HOSPITALS.map((hosp, idx) => {
                        const isSelected = (currentHospitalIndex === idx)
                        return (
                          <button
                            key={hosp.id}
                            onClick={() => {
                              setCurrentHospitalIndex(idx)
                              setSelectedHospitalFilter(hosp)
                              setSelectedCategory('All')
                              setCatalogPage(1)
                            }}
                            className={`group flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                              isSelected
                                ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white border-transparent shadow-md shadow-sky-500/20 scale-[1.01]'
                                : 'bg-white text-slate-700 border-slate-200/90 hover:border-sky-300 hover:bg-sky-50/50 shadow-2xs'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-300 animate-pulse' : 'bg-slate-300 group-hover:bg-sky-400'}`} />
                            <span className="font-extrabold">{hosp.tag || hosp.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-700'
                            }`}>
                              {hosp.doctorSpecialty}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    {/* Primary Visited Hospital Card (Ultra-Premium Redesign) */}
                    <div className="bg-gradient-to-br from-white via-white to-sky-50/25 rounded-3xl border border-slate-200/90 shadow-[0_8px_30px_-6px_rgba(2,132,199,0.08),0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_-6px_rgba(2,132,199,0.12)] transition-all duration-300 p-5 sm:p-6 relative overflow-hidden group">
                      {/* Top Luminous Accent Line */}
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 via-primary to-emerald-400" />
                      
                      {/* Ambient Glow */}
                      <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-400/10 rounded-full blur-2xl pointer-events-none" />

                      <div className="flex flex-col md:flex-row items-start gap-5 sm:gap-6 relative z-10">
                        
                        {/* Hospital Building Image with Floating Badges */}
                        <div className="relative w-full md:w-52 h-44 rounded-2xl overflow-hidden shrink-0 border border-slate-200/80 shadow-xs group/img">
                          <img
                            src={activeHospital.image}
                            alt={activeHospital.name}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                          />
                          {/* Top-Left Glowing Status Badge */}
                          <div className="absolute top-2.5 left-2.5 bg-sky-600/95 backdrop-blur-md text-white text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                            </span>
                            <span>Recent Visit</span>
                          </div>

                          {/* Bottom Image Overlay Tag */}
                          <div className="absolute bottom-2 inset-x-2 bg-slate-900/75 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-xl flex items-center justify-between">
                            <span className="flex items-center gap-1 text-emerald-400 font-bold">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Verified In-House</span>
                            </span>
                            <span className="text-amber-300 font-bold">★ 4.9</span>
                          </div>
                        </div>

                        {/* Hospital Info & Prescribed Doctor */}
                        <div className="flex-1 text-left">
                          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug group-hover:text-sky-700 transition-colors">
                            {activeHospital.name}
                          </h3>

                          {/* Doctor Consultation Line */}
                          <div className="flex items-center gap-2 mt-2 text-xs text-slate-700">
                            <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                              <User className="w-3 h-3" />
                            </div>
                            <span className="font-extrabold text-slate-900">{activeHospital.doctorName}</span>
                            <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-md">
                              ({activeHospital.doctorSpecialty})
                            </span>
                          </div>

                          {/* Date and Time */}
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{activeHospital.visitDate}</span>
                          </div>

                          {/* Prescribed Medicines Badge */}
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50/70 border border-sky-200/80 text-xs font-bold text-sky-950 mt-3 shadow-2xs">
                            <Pill className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <span>{activeHospital.totalMedicinesCount} Medicines Prescribed</span>
                            <span className="text-sky-700 font-normal">({activeHospital.medicinesSummary})</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap items-center gap-3 mt-4">
                            <button
                              onClick={() => handleOneClickReorder(activeHospital)}
                              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md shadow-sky-500/25 hover:shadow-lg hover:shadow-sky-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                            >
                              <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                              <span>1-Click Reorder (₹{activeHospital.oneClickPrice.toFixed(0)})</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedHospitalFilter(activeHospital)
                                setSelectedCategory('All')
                                setCatalogPage(1)
                                const el = document.getElementById('hospital-medicine-catalog')
                                if (el) el.scrollIntoView({ behavior: 'smooth' })
                              }}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-900 border border-sky-200/90 rounded-xl text-xs sm:text-sm font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                            >
                              <Building2 className="w-3.5 h-3.5 text-sky-600" />
                              <span>Browse Hospital Catalog</span>
                              <ChevronRight className="w-3.5 h-3.5 text-sky-600" />
                            </button>
                          </div>
                        </div>

                        {/* Prescription Summary Receipt Panel */}
                        <div className="w-full md:w-72 bg-gradient-to-b from-slate-50/90 via-slate-50/60 to-sky-50/30 border border-slate-200/90 rounded-2xl p-4 shrink-0 text-left shadow-2xs">
                          <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 mb-2.5 pb-2 border-b border-slate-200/60">
                            <div className="flex items-center gap-1.5">
                              <FileCheck className="w-3.5 h-3.5 text-sky-600" />
                              <span>Prescription Summary</span>
                            </div>
                            <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-full">
                              3 Medicines • 7 Days
                            </span>
                          </div>

                          <div className="space-y-2 mb-3">
                            {activeHospital.summaryItems.map((item, idx) => (
                              <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200/80 hover:border-sky-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-colors">
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-xs text-slate-900">{item.name}</span>
                                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                    {item.duration}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                                  {item.timing}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/80">
                            <span className="text-xs text-slate-500 font-semibold">Total Amount</span>
                            <span className="text-base font-black text-slate-900 tracking-tight">
                              ₹ {activeHospital.totalPrescriptionAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

              {/* SECTION: Medicine Catalog */}
              <div id="hospital-medicine-catalog" className="pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                        <Pill className="w-4 h-4" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                        {selectedHospitalFilter ? `${selectedHospitalFilter.tag || selectedHospitalFilter.name} Pharmacy Catalog` : 'Medicine Catalog'}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedHospitalFilter 
                        ? `Showing verified in-stock medicines exclusively from ${selectedHospitalFilter.name}` 
                        : "Browse medicines from this hospital's in-house pharmacy"}
                    </p>
                  </div>

                  {/* Search and Category Filter Inputs */}
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        placeholder="Search medicines..."
                        className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs w-44 sm:w-52"
                      />
                    </div>

                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-2xs cursor-pointer"
                    >
                      <option value="All">All Categories</option>
                      {activeCategories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Active Hospital Filter Status Strip */}
                {selectedHospitalFilter && (
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-sky-50 via-blue-50/60 to-white border border-sky-200/80 rounded-2xl px-4 py-2.5 mb-3.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>Browsing: <strong className="text-sky-900">{selectedHospitalFilter.name}</strong></span>
                      <span className="text-[11px] font-bold text-sky-700 bg-white border border-sky-200 px-2 py-0.5 rounded-full shadow-2xs">
                        {filteredCatalog.length} medicines available
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedHospitalFilter(null)
                        setSelectedCategory('All')
                        setCatalogPage(1)
                      }}
                      className="text-xs font-bold text-sky-600 hover:text-sky-800 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <span>View All Hospitals</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Horizontal Category Chips (Exclusively Hospital-Specific) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
                  {activeCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-sky-600 text-white shadow-xs scale-[1.02]'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Medicine Cards Grid (Paginated for Optimal Performance) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
                  {paginatedCatalog.map((med) => {
                    const inCartQty = getCartQuantity(med.id)
                    return (
                      <div
                        key={med.id}
                        onClick={() => setSelectedMedModal(med)}
                        className="bg-white rounded-2xl border border-slate-200/80 p-3 flex flex-col justify-between hover:shadow-md hover:border-sky-300 transition-all text-left group cursor-pointer"
                      >
                        <div>
                          {/* Image & In-Stock Badge */}
                          <div className="relative w-full h-24 bg-slate-50 rounded-xl overflow-hidden mb-2.5 flex items-center justify-center p-2 border border-slate-100">
                            <span className="absolute top-1.5 right-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                              In Stock
                            </span>
                            <img
                              src={cleanMedicineImage(med.image)}
                              alt={med.name}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = medicinePlaceholderImg
                              }}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                            />
                          </div>

                          {/* Medicine Info */}
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug line-clamp-1">
                            {med.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {med.salt}
                          </p>
                          <div className="text-[11px] font-bold text-slate-900 mt-1.5">
                            ₹ {med.price.toFixed(0)}{' '}
                            <span className="text-[10px] font-normal text-slate-400">
                              • {med.pack_size}
                            </span>
                          </div>
                        </div>

                        {/* Add to Cart Button */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100">
                          {inCartQty > 0 ? (
                            <div className="flex items-center justify-between bg-sky-50 rounded-xl p-1 border border-sky-200">
                              <button
                                onClick={(e) => updateCartQty(med.id, -1, e)}
                                className="w-5 h-5 rounded-lg bg-white text-sky-600 flex items-center justify-center shadow-2xs hover:bg-sky-600 hover:text-white transition-colors cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-black text-sky-900">
                                {inCartQty}
                              </span>
                              <button
                                onClick={(e) => updateCartQty(med.id, 1, e)}
                                className="w-5 h-5 rounded-lg bg-white text-sky-600 flex items-center justify-center shadow-2xs hover:bg-sky-600 hover:text-white transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => addToCart(med, e)}
                              className="w-full py-1.5 px-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 transition-all cursor-pointer"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>Add to Cart</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Numbered Pagination Bar */}
                <div className="mt-5 pt-3.5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                  <div className="text-xs text-slate-600 font-medium">
                    Showing <span className="font-extrabold text-slate-900">{filteredCatalog.length === 0 ? 0 : (catalogPage - 1) * itemsPerPage + 1}</span> to <span className="font-extrabold text-slate-900">{Math.min(catalogPage * itemsPerPage, filteredCatalog.length)}</span> of <span className="font-extrabold text-slate-900">{filteredCatalog.length}</span> medicines
                  </div>

                  {totalCatalogPages > 1 && (
                    <div className="flex items-center gap-1.5">
                      {/* Previous Page Button */}
                      <button
                        onClick={() => {
                          setCatalogPage(p => Math.max(1, p - 1))
                          const el = document.getElementById('hospital-medicine-catalog')
                          if (el) el.scrollIntoView({ behavior: 'smooth' })
                        }}
                        disabled={catalogPage === 1}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                          catalogPage === 1
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs cursor-pointer'
                        }`}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>

                      {/* Numbered Page Buttons */}
                      {Array.from({ length: totalCatalogPages }, (_, i) => i + 1).map((pageNum) => {
                        if (
                          pageNum === 1 ||
                          pageNum === totalCatalogPages ||
                          (pageNum >= catalogPage - 1 && pageNum <= catalogPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => {
                                setCatalogPage(pageNum)
                                const el = document.getElementById('hospital-medicine-catalog')
                                if (el) el.scrollIntoView({ behavior: 'smooth' })
                              }}
                              className={`w-8 h-8 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                catalogPage === pageNum
                                  ? 'bg-sky-600 text-white shadow-xs scale-105'
                                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 shadow-2xs'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        } else if (pageNum === catalogPage - 2 || pageNum === catalogPage + 2) {
                          return (
                            <span key={pageNum} className="text-slate-400 text-xs px-1">
                              •••
                            </span>
                          )
                        }
                        return null
                      })}

                      {/* Next Page Button */}
                      <button
                        onClick={() => {
                          setCatalogPage(p => Math.min(totalCatalogPages, p + 1))
                          const el = document.getElementById('hospital-medicine-catalog')
                          if (el) el.scrollIntoView({ behavior: 'smooth' })
                        }}
                        disabled={catalogPage === totalCatalogPages}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                          catalogPage === totalCatalogPages
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs cursor-pointer'
                        }`}
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </>
          )}

        </div>

            {/* RIGHT SIDEBAR: Quick Actions & Active Counter Token (3 cols) */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-4">
              
              {/* CARD 1: Quick Actions (Upload Prescription Drag-and-Drop) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-4.5 shadow-2xs text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-sky-600 fill-current" />
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Quick Actions
                  </h3>
                </div>

                {/* Drag and Drop Zone (Compact) */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50 rounded-xl p-3.5 text-center cursor-pointer transition-all mb-3 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                  <div className="w-8 h-8 mx-auto rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    Drag & drop prescription image
                  </div>
                  <div className="text-[11px] text-sky-600 font-semibold underline mt-0.5">
                    or click to browse
                  </div>
                  <div className="text-[9px] text-slate-400 mt-1">
                    Supports PDF, JPG, PNG (Max 10MB)
                  </div>
                </div>

                {/* File Selected Notification */}
                {uploadedFile && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-xs font-semibold text-emerald-800 truncate max-w-[170px]">
                        {uploadedFile.name}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setUploadedFile(null)
                      }}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Quick Action Link Rows */}
                <div className="space-y-1 pt-1.5 border-t border-slate-100">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                      <span>View My Orders</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => setIsReminderModalOpen(true)}
                    className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-slate-400" />
                      <span>Medicine Reminders</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => alert('MedClues 24/7 Pharmacy Helpline: 1800-425-8888\nEmail: pharmacy@medclues.com')}
                    className="w-full flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Help & Support</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* CARD 2: Hospital Genuine Guarantee */}
              <div className="bg-gradient-to-br from-white to-sky-50/70 rounded-2xl border border-sky-100/90 p-4 shadow-2xs text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">100% Genuine Medicines</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      Dispensed directly from certified hospital in-house pharmacies with verified batch control.
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-sky-700">
                      <span>✓ Official Hospital Supply</span>
                      <span>•</span>
                      <span>✓ Zero Counterfeit</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* 5. TAB 2: MY PRESCRIPTIONS DETAILED VIEW */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">Digital Doctor Prescriptions</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified e-prescriptions issued directly by your consulting doctors
                </p>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:bg-sky-700 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Paper Rx</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {DEMO_VISITED_HOSPITALS.map((hosp) => (
                <div key={hosp.id} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-sky-100 text-sky-700">
                        {hosp.doctorSpecialty}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1.5">
                        {hosp.doctorName}
                      </h3>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{hosp.name}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{hosp.visitDate}</span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-2">
                    {hosp.summaryItems.map((med, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{med.name}</span>
                          <span className="text-slate-400 text-[11px] ml-2">({med.timing})</span>
                        </div>
                        <span className="font-bold text-slate-900">₹{med.price.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 mb-4">
                    <strong>Doctor's Advice:</strong> {hosp.prescriptionNotes}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-[11px] text-slate-400">Total Consultation Rx</span>
                      <div className="text-sm font-black text-slate-900">₹ {hosp.totalPrescriptionAmount.toFixed(2)}</div>
                    </div>
                    <button
                      onClick={() => handleOneClickReorder(hosp)}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Reorder Prescribed Medicines</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. TAB 3: ORDERS & TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-6 text-left">
            <div>
              <h2 className="text-xl font-black text-slate-900">Past & Active Orders</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track your hospital counter pickup tokens and medicine delivery statuses
              </p>
            </div>

            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">Order #{ord.id}</span>
                      <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                        Token: {ord.token}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 font-semibold">
                      {ord.hospitalName}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {ord.date} • {ord.items.map(i => `${i.name} (x${i.qty})`).join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Total Bill</div>
                      <div className="text-base font-black text-slate-900">₹ {ord.total.toFixed(2)}</div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {ord.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* 7. CART DRAWER (Slide-Over from Right) */}
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            onClick={() => setIsCartDrawerOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between text-left">
              
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Your Pharmacy Cart</h3>
                    <p className="text-[11px] text-slate-500">{cartItemCount} Medicines Selected</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content / Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                
                {/* Fulfillment Selector */}
                <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold">
                  <button
                    onClick={() => setFulfillmentMode('pickup')}
                    className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      fulfillmentMode === 'pickup'
                        ? 'bg-white text-sky-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Counter Pickup (Free)</span>
                  </button>

                  <button
                    onClick={() => setFulfillmentMode('delivery')}
                    className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      fulfillmentMode === 'delivery'
                        ? 'bg-white text-sky-700 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Home Delivery (₹40)</span>
                  </button>
                </div>

                {/* Items */}
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center mx-auto mb-3">
                      <ShoppingCart className="w-7 h-7" />
                    </div>
                    <div className="font-bold text-slate-700 text-sm">Your cart is empty</div>
                    <p className="text-xs text-slate-400 mt-1">Browse medicines or reorder from your prescriptions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image || medicinePlaceholderImg}
                            alt={item.name}
                            className="w-10 h-10 object-contain rounded-lg bg-white p-1 border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{item.name}</div>
                            <div className="text-[11px] text-slate-500">₹{item.price.toFixed(0)} • {item.pack_size || '10 tabs'}</div>
                          </div>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5">
                            <button
                              onClick={(e) => updateCartQty(item.id, -1, e)}
                              className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-slate-900">
                              {item.quantity || 1}
                            </span>
                            <button
                              onClick={(e) => updateCartQty(item.id, 1, e)}
                              className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* Drawer Footer & Checkout */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Medicines Subtotal</span>
                      <span className="font-bold text-slate-900">₹{cartSubtotal.toFixed(2)}</span>
                    </div>
                    {fulfillmentMode === 'delivery' && (
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span className="font-bold text-slate-900">₹40.00</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                      <span>Grand Total</span>
                      <span className="text-sky-600">₹{cartGrandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm Order & Generate Pickup Token</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 8. UPLOAD PRESCRIPTION MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl text-left border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Upload Doctor Prescription</h3>
                  <p className="text-[11px] text-slate-500">Fast-track verification & packing at hospital</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/50 rounded-2xl p-6 text-center cursor-pointer transition-colors mb-4"
            >
              <UploadCloud className="w-8 h-8 text-sky-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800">
                {uploadedFile ? uploadedFile.name : 'Select or drop your doctor prescription photo/PDF'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Supports JPG, PNG, PDF up to 10MB</p>
            </div>

            {/* Special Instructions Note */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Any instructions for the pharmacist? (Optional)
              </label>
              <textarea
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                placeholder="E.g. Send 10 tablets instead of 15, or prefer generic substitute..."
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpload}
                disabled={!uploadedFile}
                className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Submit to Pharmacy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. SELECTOR MODAL: ALL PARTNER HOSPITALS */}
      {isHospitalSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl text-left border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Hospital className="w-5 h-5 text-sky-600" />
                <h3 className="font-extrabold text-base text-slate-900">Partner Hospital Pharmacies</h3>
              </div>
              <button
                onClick={() => setIsHospitalSelectorOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {ALL_PARTNER_HOSPITALS.map((hosp, idx) => (
                <div
                  key={hosp.id}
                  onClick={() => {
                    setCurrentHospitalIndex(idx % DEMO_VISITED_HOSPITALS.length)
                    setIsHospitalSelectorOpen(false)
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">{hosp.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{hosp.location} • {hosp.distance}</div>
                    <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {hosp.timing}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-500">★ {hosp.rating}</span>
                    <div className="text-[10px] text-sky-600 font-bold mt-1">Select ➔</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 10. CHECKOUT / TOKEN SUCCESS MODAL */}
      {checkoutSuccessToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-slate-900">
              Order Confirmed!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Your hospital counter token has been issued. Show this QR at the pharmacy counter.
            </p>

            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 my-4">
              <div className="text-[10px] uppercase font-bold text-slate-400">Token ID</div>
              <div className="text-xl font-black text-sky-600 tracking-wider my-0.5">
                {checkoutSuccessToken}
              </div>
              <div className="text-[11px] text-slate-500">{activeHospital.name}</div>
            </div>

            <button
              onClick={() => {
                setCheckoutSuccessToken(null)
                setActiveTab('orders')
              }}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              View Order Tracking
            </button>
          </div>
        </div>
      )}

      {/* 11. MEDICINE REMINDERS MODAL */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl text-left border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-sky-600" />
                <h3 className="font-extrabold text-base text-slate-900">Medicine Reminders</h3>
              </div>
              <button
                onClick={() => setIsReminderModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Dolo 650mg</div>
                  <div className="text-[11px] text-slate-500">After Lunch • 01:30 PM</div>
                </div>
                <span className="text-xs font-extrabold text-sky-600">Active</span>
              </div>

              <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Pan 40</div>
                  <div className="text-[11px] text-slate-500">Empty Stomach • 07:30 AM</div>
                </div>
                <span className="text-xs font-extrabold text-sky-600">Active</span>
              </div>
            </div>

            <button
              onClick={() => setIsReminderModalOpen(false)}
              className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 12. MEDICINE DETAILS MODAL */}
      {selectedMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl text-left border border-slate-100 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex-1 pr-4">
                <span className="inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 mb-1">
                  {selectedMedModal.category || 'Pharmaceutical Care'}
                </span>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {selectedMedModal.name}
                </h3>
                {selectedMedModal.brand && (
                  <div className="text-xs text-slate-400 font-medium mt-0.5">
                    Brand: <span className="text-slate-700 font-bold">{selectedMedModal.brand}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedMedModal(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-4 space-y-4">
              {/* Product Pack Photo with In-Stock Badge */}
              <div className="relative w-full h-44 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center p-4 overflow-hidden">
                <span className="absolute top-3 right-3 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                  In Stock • Genuine Pack
                </span>
                <img
                  src={cleanMedicineImage(selectedMedModal.image)}
                  alt={selectedMedModal.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = medicinePlaceholderImg
                  }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Salt Composition */}
              <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-xl">
                <div className="text-[11px] uppercase font-bold text-sky-800">
                  Salt / Active Chemical Composition
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">
                  {selectedMedModal.salt || selectedMedModal.name}
                </div>
              </div>

              {/* Key Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Dosage Form</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedMedModal.dosage_form || 'Tablet'}</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Strength / Pack</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedMedModal.strength || selectedMedModal.pack_size || 'Standard Pack'}</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Rx Requirement</div>
                  <div className="font-bold text-amber-700 mt-0.5">
                    {selectedMedModal.requires_rx !== false ? 'Prescription Required' : 'OTC Allowed'}
                  </div>
                </div>
              </div>

              {/* Available Partner Hospitals */}
              {selectedMedModal.available_hospitals && selectedMedModal.available_hospitals.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                    <Hospital className="w-3.5 h-3.5 text-sky-600" />
                    <span>In-Stock at Partner Hospitals ({selectedMedModal.available_hospitals.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {selectedMedModal.available_hospitals.map((h, i) => (
                      <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Price & Cart Actions */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Hospital Counter Price</div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-xl font-black text-slate-900">
                      ₹ {(selectedMedModal.price || 45).toFixed(0)}
                    </span>
                    {selectedMedModal.mrp && selectedMedModal.mrp > selectedMedModal.price && (
                      <span className="text-xs text-slate-400 line-through">
                        MRP ₹{selectedMedModal.mrp.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getCartQuantity(selectedMedModal.id) > 0 ? (
                    <div className="flex items-center bg-white rounded-xl border border-sky-300 p-1 shadow-2xs">
                      <button
                        onClick={(e) => updateCartQty(selectedMedModal.id, -1, e)}
                        className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-black text-slate-900">
                        {getCartQuantity(selectedMedModal.id)}
                      </span>
                      <button
                        onClick={(e) => updateCartQty(selectedMedModal.id, 1, e)}
                        className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        addToCart(selectedMedModal, e)
                      }}
                      className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer active:scale-98 transition-all"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default Pharmacy
