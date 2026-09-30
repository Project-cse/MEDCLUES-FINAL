import React, { useState, useEffect, useContext } from 'react'
import { assets } from '../assets/assets'
import BackButton from '../components/BackButton'
import BackArrow from '../components/BackArrow'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import useScrollAnimation from '../utils/useScrollAnimation'
import {
  Phone,
  Clock,
  Heart,
  Baby,
  Brain,
  Sparkles,
  Activity,
  ShieldCheck,
  Eye,
  Headphones,
  Smile,
  Stethoscope,
  ShieldAlert
} from 'lucide-react'

const FALLBACK_SPECIALTIES = [
  { specialtyName: 'General Physician', helplineNumber: '1800-123-4567', availability: '24x7', status: 'Active' },
  { specialtyName: 'Cardiologist', helplineNumber: '1800-123-4568', availability: '24x7', status: 'Active' },
  { specialtyName: 'Pediatricians', helplineNumber: '1800-123-4569', availability: '24x7', status: 'Active' },
  { specialtyName: 'Dermatologist', helplineNumber: '1800-123-4570', availability: 'Working Hours', status: 'Active' },
  { specialtyName: 'Gynecologist', helplineNumber: '1800-123-4571', availability: '24x7', status: 'Active' },
  { specialtyName: 'Neurologist', helplineNumber: '1800-123-4572', availability: '24x7', status: 'Active' },
  { specialtyName: 'Gastroenterologist', helplineNumber: '1800-123-4573', availability: '24x7', status: 'Active' },
  { specialtyName: 'Orthopedics', helplineNumber: '1800-123-4574', availability: '24x7', status: 'Active' },
  { specialtyName: 'Ophthalmologist', helplineNumber: '1800-123-4575', availability: 'Working Hours', status: 'Active' },
  { specialtyName: 'Psychiatrist', helplineNumber: '1800-123-4576', availability: '24x7', status: 'Active' },
  { specialtyName: 'ENT Specialist', helplineNumber: '1800-123-4577', availability: 'Working Hours', status: 'Active' },
  { specialtyName: 'Dentistry', helplineNumber: '1800-123-4578', availability: 'Working Hours', status: 'Active' }
]

const getSpecialtyIcon = (name = '') => {
  const n = name.toLowerCase()
  if (n.includes('cardio') || n.includes('heart')) {
    return <Heart className="w-5 h-5 text-rose-500" />
  }
  if (n.includes('pedia') || n.includes('child')) {
    return <Baby className="w-5 h-5 text-amber-500" />
  }
  if (n.includes('neuro') || n.includes('brain')) {
    return <Brain className="w-5 h-5 text-purple-500" />
  }
  if (n.includes('derma') || n.includes('skin')) {
    return <Sparkles className="w-5 h-5 text-pink-500" />
  }
  if (n.includes('gyne') || n.includes('women')) {
    return <Activity className="w-5 h-5 text-indigo-500" />
  }
  if (n.includes('gastro') || n.includes('stomach')) {
    return <ShieldCheck className="w-5 h-5 text-emerald-500" />
  }
  if (n.includes('ortho') || n.includes('bone')) {
    return <Activity className="w-5 h-5 text-orange-500" />
  }
  if (n.includes('ophthal') || n.includes('eye')) {
    return <Eye className="w-5 h-5 text-teal-500" />
  }
  if (n.includes('psych') || n.includes('mental')) {
    return <Headphones className="w-5 h-5 text-blue-500" />
  }
  if (n.includes('dent') || n.includes('oral')) {
    return <Smile className="w-5 h-5 text-cyan-500" />
  }
  return <Stethoscope className="w-5 h-5 text-sky-500" />
}

const About = () => {
  const { backendUrl } = useContext(AppContext) || { backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000' }
  const [specialties, setSpecialties] = useState(FALLBACK_SPECIALTIES)
  const [loading, setLoading] = useState(true)
  const scrollRef = useScrollAnimation()

  useEffect(() => {
    fetchSpecialties()
  }, [backendUrl])

  const fetchSpecialties = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/specialty/public/all`)
      if (response.data && response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
        const formatted = response.data.data
          .map(item => ({
            id: item.id,
            specialtyName: item.specialtyName || item.specialty_name || 'General',
            helplineNumber: item.helplineNumber || item.helpline_number,
            availability: item.availability || '24x7',
            status: item.status || 'Active'
          }))
          .filter(item => item.helplineNumber) // only include valid helplines

        if (formatted.length > 0) {
          setSpecialties(formatted)
        }
      }
    } catch (error) {
      console.warn('Error fetching specialties, maintaining fallback:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container fade-in" ref={scrollRef}>
      {/* Back Arrow Button */}
      <div className='mb-4 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-4 slide-down'>
        <BackArrow className="flex-shrink-0" />
        <BackButton className="flex-grow sm:flex-grow-0" />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className='text-center mb-8 sm:mb-12 px-4 anim-header'>
          <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3'>
            About <span className='text-cyan-500'>MedClues</span>
          </h1>
          <p className='text-sm sm:text-base text-gray-600 max-w-2xl mx-auto'>
            Revolutionizing healthcare through modern technology and patient-centric solutions
          </p>
        </div>

        {/* Main Content */}
        <div className='card mb-6 sm:mb-8 card-hover-lift'>
          <div className='flex flex-col lg:flex-row gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8'>
            {/* Image Section */}
            <div className='lg:w-2/5 flex-shrink-0'>
              <div className='relative overflow-hidden rounded-xl'>
                {/* Back Arrow Button */}
                <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-4">
                    <BackArrow className="flex-shrink-0" />
                    <BackButton className="flex-grow sm:flex-grow-0" />
                </div>
                <img
                  className='w-full h-auto object-cover'
                  src={assets.about_image}
                  alt="MedClues Healthcare"
                />
              </div>
            </div>

            {/* Content Section */}
            <div className='flex-1 space-y-3 sm:space-y-4 text-gray-600'>
              <p className='text-sm sm:text-base leading-relaxed text-justify'>
                Welcome to MedClues, where we're transforming healthcare through innovation and technology.
                We understand the critical importance of secure, accessible, and seamless healthcare services in today's digital world.
              </p>

              <p className='text-sm sm:text-base leading-relaxed text-justify'>
                MedClues is committed to revolutionizing healthcare by putting patients first.
                Our platform ensures your health data remains secure, your appointments are hassle-free,
                and you have easy access to trusted healthcare providers when you need them most.
              </p>

              <div className='pt-2 sm:pt-4'>
                <h3 className='text-base sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2'>Our Vision</h3>
                <p className='text-sm sm:text-base leading-relaxed text-justify'>
                  We envision a future where healthcare is accessible to everyone, data flows seamlessly
                  between patients and providers, and technology enhances the healing process rather than
                  complicating it.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Highlights */}
        <div className='card p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 anim-section'>
          <h2 className='text-lg sm:text-xl font-bold text-gray-800 text-center mb-6 sm:mb-8'>
            Our <span className='text-cyan-500'>Technology</span>
          </h2>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 anim-grid'>
            <div className='text-center p-4 sm:p-6 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 hover:shadow-lg transition-shadow card-hover-lift'>
              <div className='text-3xl sm:text-4xl mb-3 sm:mb-4 anim-float'>🔒</div>
              <h3 className='text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2'>Secure Platform</h3>
              <p className='text-gray-600 text-xs sm:text-sm'>
                Enterprise-grade security protecting your health data with encryption and secure protocols.
              </p>
            </div>

            <div className='text-center p-4 sm:p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 hover:shadow-lg transition-shadow card-hover-lift'>
              <div className='text-3xl sm:text-4xl mb-3 sm:mb-4 anim-float' style={{ animationDelay: '0.5s' }}>⚡</div>
              <h3 className='text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2'>Smart Scheduling</h3>
              <p className='text-gray-600 text-xs sm:text-sm'>
                Intelligent appointment management for seamless booking and rescheduling.
              </p>
            </div>

            <div className='text-center p-4 sm:p-6 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 border border-green-100 hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1 card-hover-lift'>
              <div className='text-3xl sm:text-4xl mb-3 sm:mb-4 anim-float' style={{ animationDelay: '1s' }}>🌐</div>
              <h3 className='text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2'>Connected Care</h3>
              <p className='text-gray-600 text-xs sm:text-sm'>
                Unified system connecting patients with healthcare providers across the network.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className='text-center mb-6 sm:mb-8 px-4 anim-header'>
          <h2 className='text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2'>
            Why Choose <span className='text-cyan-500'>MedClues</span>
          </h2>
          <p className='text-sm sm:text-base text-gray-600'>Experience the future of healthcare management</p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 px-4 sm:px-0 anim-grid'>
          <div className='card p-4 sm:p-6 text-center hover:shadow-xl transition-shadow card-hover-lift'>
            <div className='text-2xl sm:text-3xl mb-2 sm:mb-3 anim-float'>🔐</div>
            <h3 className='text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2'>Data Privacy</h3>
            <p className='text-gray-600 text-xs sm:text-sm'>
              You control your health data. Secure access management ensures only authorized providers see your records.
            </p>
          </div>

          <div className='card p-4 sm:p-6 text-center hover:shadow-xl transition-shadow card-hover-lift'>
            <div className='text-2xl sm:text-3xl mb-2 sm:mb-3 anim-float' style={{ animationDelay: '0.5s' }}>🔄</div>
            <h3 className='text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2'>Seamless Experience</h3>
            <p className='text-gray-600 text-xs sm:text-sm'>
              From booking to consultation, enjoy a smooth healthcare journey with our intuitive platform.
            </p>
          </div>

          <div className='card p-4 sm:p-6 text-center hover:shadow-xl transition-shadow sm:col-span-2 md:col-span-1 card-hover-lift'>
            <div className='text-2xl sm:text-3xl mb-2 sm:mb-3 anim-float' style={{ animationDelay: '1s' }}>⚡</div>
            <h3 className='text-sm sm:text-base font-semibold text-gray-800 mb-1 sm:mb-2'>Instant Access</h3>
            <p className='text-gray-600 text-xs sm:text-sm'>
              Quick access to healthcare providers, appointment scheduling, and medical records anytime.
            </p>
          </div>
        </div>

        {/* Specialty Helpline Section */}
        {specialties.length > 0 && (
          <div className='card p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8'>
            <div className='text-center mb-6 sm:mb-8'>
              <h2 className='text-lg sm:text-xl font-bold text-gray-800 mb-2'>
                <span className='text-cyan-500'>Specialty</span> Helpline Numbers
              </h2>
              <p className='text-sm sm:text-base text-gray-600'>
                Contact our specialized helplines for immediate medical assistance
              </p>
            </div>

            {loading ? (
              <div className='text-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto'></div>
                <p className='text-gray-500 mt-2 text-sm'>Loading helplines...</p>
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                {specialties.map((specialty, index) => {
                  const name = specialty.specialtyName || specialty.specialty_name || 'General'
                  const phone = specialty.helplineNumber || specialty.helpline_number || '1800-123-4567'
                  const is24x7 = (specialty.availability || '').toLowerCase().includes('24')

                  return (
                    <div
                      key={specialty.id || index}
                      className='rounded-2xl bg-white border border-slate-200/90 hover:border-cyan-400 p-5 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group flex flex-col justify-between text-left relative overflow-hidden'
                    >
                      <div className='absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-100/40 to-transparent rounded-bl-full pointer-events-none' />

                      <div>
                        {/* Header: Icon + Specialty Name + Availability */}
                        <div className='flex items-start justify-between gap-2 mb-3'>
                          <div className='flex items-center gap-2.5'>
                            <div className='w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform'>
                              {getSpecialtyIcon(name)}
                            </div>
                            <div>
                              <h3 className='text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-cyan-700 transition-colors leading-snug'>
                                {name}
                              </h3>
                              <span className='text-[10px] text-slate-400 font-medium block'>
                                Dedicated Emergency Desk
                              </span>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 uppercase tracking-wider ${
                            is24x7
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {is24x7 ? '24x7' : 'Daytime'}
                          </span>
                        </div>

                        {/* Phone Number Display */}
                        <div className='my-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between'>
                          <span className='text-xs font-bold text-slate-500'>Toll-Free Helpline:</span>
                          <span className='text-sm font-black text-slate-800 tracking-wide'>
                            {phone}
                          </span>
                        </div>
                      </div>

                      {/* Direct Call Button */}
                      <a
                        href={`tel:${phone.replace(/\s/g, '')}`}
                        className='mt-2 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md transition-all active:scale-98 cursor-pointer'
                      >
                        <Phone className='w-3.5 h-3.5 fill-white' />
                        <span>Call Helpline ({phone})</span>
                      </a>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default About
