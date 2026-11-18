import React, { useState } from 'react';
import {
  GraduationCap, ArrowRight, CheckCircle, AlertCircle,
  BookOpen, Shield, MapPin, Phone, Mail, Clock, Menu, X
} from 'lucide-react';

interface LandingPageProps {
  onNavigateLogin: () => void;
}

interface FacilityItem {
  img: string;
  title: string;
  kicker: string;
  desc: string;
  featured?: boolean;
}

const FACILITIES: FacilityItem[] = [
  {
    img: '/src/assets/images/smart_classroom_kids_1794909605075.jpg',
    title: 'Smart Interactive Classrooms',
    kicker: 'Grade 1–5 · Digital Boards',
    desc: 'Bright, ergonomic classrooms equipped with interactive smart displays and visual concept kits tailored for primary learners.',
    featured: true
  },
  {
    img: '/src/assets/images/school_computer_lab_1794909604914.jpg',
    title: 'Primary Computer Lab',
    kicker: 'Hands-on Coding · Safe Browsing',
    desc: 'Dedicated child-friendly workstations introducing typing, logic puzzles, and guided digital literacy.'
  },
  {
    img: '/src/assets/images/primary_school_library_1794909603743.jpg',
    title: 'Story & Reading Library',
    kicker: '10,000+ Titles · Quiet Corners',
    desc: 'Curated bilingual storybooks, illustrated encyclopedias, and weekly guided reading circles.'
  },
  {
    img: '/src/assets/images/school_campus_security_1794909603525.jpg',
    title: '24/7 Verified Campus Security',
    kicker: 'CCTV · Visitor Verification',
    desc: 'Round-the-clock perimeter monitoring, trained campus staff, and checked guardian pickup gates.'
  },
  {
    img: '/src/assets/images/primary_school_bus_1794909603539.jpg',
    title: 'GPS-Tracked School Transport',
    kicker: 'Route Attendants · Safe Transit',
    desc: 'Dedicated primary-school buses with trained route attendants and real-time pickup coordination.'
  },
  {
    img: '/src/assets/images/school_playground_kids_1794909604804.jpg',
    title: 'Outdoor Sports & Playground',
    kicker: 'Daily Physical Education · Track & Turf',
    desc: 'Shaded play zones, athletic tracks, and supervised team games building coordination and healthy habits.',
    featured: true
  }
];

function ResilientImage({
  src,
  alt,
  className,
  fallbackTitle
}: {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 flex flex-col items-center justify-center p-6 text-center">
        <GraduationCap className="w-10 h-10 text-blue-300 mb-2" />
        <span className="text-sm font-semibold text-white">{fallbackTitle}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

export default function LandingPage({ onNavigateLogin }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [contactState, setContactState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [contactError, setContactError] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactState('submitting');
    setContactError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Could not submit inquiry. Please verify your details.');
      }
      setContactState('success');
      setContactForm({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      setContactState('error');
      setContactError(err.message || 'Network error while submitting inquiry.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 zones separated cleanly */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <a
            href="#home"
            className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md"
          >
            <span className="h-11 flex items-center justify-center shrink-0">
              <img
                src="/assets/aistudio/company_logo_c387ba1a.jpeg"
                alt="Ashivam Technologies Logo"
                referrerPolicy="no-referrer"
                className="h-11 w-auto object-contain"
              />
            </span>
            <span>ASHIVAM TECH</span>
          </a>

          <nav aria-label="Primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#home" className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">Home</a>
            <a href="#about" className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">About School</a>
            <a href="#facilities" className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">Facilities</a>
            <a href="#contact" className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0">Admissions</a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onNavigateLogin}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <span>Portal Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 text-sm font-medium text-slate-700">
            <a href="#home" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-blue-700">Home</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-blue-700">About School</a>
            <a href="#facilities" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-blue-700">Facilities</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-blue-700">Admissions</a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="scroll-mt-16 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-blue-300">
                <span>Primary Campus</span>
                <span aria-hidden="true">·</span>
                <span>Grades 1 to 5</span>
                <span aria-hidden="true">·</span>
                <span>Smart Academic ERP</span>
              </div>

              <h1
                className="font-extrabold tracking-tight text-white leading-[1.1]"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.65rem)' }}
              >
                Thoughtful primary education backed by a unified school ERP.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                ASHIVAM TECH Primary School connects classroom teaching, daily attendance, Mon–Sat timetables, fee records, and report cards across Admin, Teacher, Student, and Parent portals.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2 text-sm whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <span>Open School Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a
                  href="#contact"
                  className="px-5 py-3 text-sm font-medium text-slate-200 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Submit Admission Inquiry
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative h-72 sm:h-80 lg:h-full min-h-[300px] rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
                <ResilientImage
                  src="/assets/aistudio/image_f4101ff3.png"
                  alt="ASHIVAM TECH Primary School Campus Building"
                  fallbackTitle="ASHIVAM TECH Primary Campus"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5">
                  <p className="text-sm font-semibold text-white">ASHIVAM TECH Primary Campus</p>
                  <p className="text-xs text-slate-300 mt-0.5">Model Academic Block · Green Valley</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-width 4-column Institutional Summary Strip */}
        <div className="border-t border-slate-800 bg-slate-950/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            <div className="py-5 pr-4 lg:px-6 lg:first:pl-0">
              <p className="text-2xl font-bold text-white tabular-nums">1st – 5th</p>
              <p className="text-xs text-slate-400 mt-1">Primary Grades (Sections A & B)</p>
            </div>
            <div className="py-5 pl-4 lg:px-6">
              <p className="text-2xl font-bold text-white tabular-nums">10 Sections</p>
              <p className="text-xs text-slate-400 mt-1">Monday–Saturday Schedules</p>
            </div>
            <div className="py-5 pr-4 lg:px-6">
              <p className="text-2xl font-bold text-white tabular-nums">1 : 15</p>
              <p className="text-xs text-slate-400 mt-1">Guided Teacher-Student Ratio</p>
            </div>
            <div className="py-5 pl-4 lg:px-6">
              <p className="text-2xl font-bold text-white tabular-nums">4 Portals</p>
              <p className="text-xs text-slate-400 mt-1">Admin, Teacher, Student & Parent</p>
            </div>
          </div>
        </div>
      </section>

      {/* About School Section */}
      <section id="about" className="scroll-mt-16 py-20 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-5">
              <p className="text-xs font-semibold text-blue-700 tracking-wide">
                About Our School
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                Strong academic foundations from Grade 1 through Grade 5.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                ASHIVAM TECH Primary School pairs attentive classroom instruction across Telugu, Hindi, English, Mathematics, Science, and Social Studies with structured daily progress tracking. Led by our Principal and subject faculty, each section receives individualized feedback and transparent parent communication.
              </p>
              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="font-bold text-slate-900 tabular-nums">6 Core Subjects</p>
                  <p className="text-xs text-slate-500 mt-1">Balanced language & STEM focus</p>
                </div>
                <div>
                  <p className="font-bold text-slate-900 tabular-nums">SQLite Relational DB</p>
                  <p className="text-xs text-slate-500 mt-1">Live attendance, fee & marks ledger</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-white p-7 space-y-2.5">
                <p className="text-xs font-mono font-medium text-blue-700 tabular-nums">01</p>
                <h3 className="text-lg font-bold text-slate-900">Dedicated Subject Faculty</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Qualified educators for Languages, Mathematics, Environmental Science, Computer Literacy, and Physical Education.
                </p>
              </div>
              <div className="bg-white p-7 space-y-2.5">
                <p className="text-xs font-mono font-medium text-blue-700 tabular-nums">02</p>
                <h3 className="text-lg font-bold text-slate-900">Activity-Led Classrooms</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Smart digital whiteboards, hands-on science demonstrations, guided reading circles, and weekly co-curricular periods.
                </p>
              </div>
              <div className="bg-white p-7 space-y-2.5">
                <p className="text-xs font-mono font-medium text-blue-700 tabular-nums">03</p>
                <h3 className="text-lg font-bold text-slate-900">Verified Campus Safety</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Continuous CCTV coverage, gated visitor check-in, and trained attendants on every school bus route.
                </p>
              </div>
              <div className="bg-white p-7 space-y-2.5">
                <p className="text-xs font-mono font-medium text-blue-700 tabular-nums">04</p>
                <h3 className="text-lg font-bold text-slate-900">Transparent Parent Connect</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Instant attendance percentages, downloadable exam report cards, fee receipts, and direct teacher notes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Asymmetric Bento Showcase */}
      <section id="facilities" className="scroll-mt-16 py-20 lg:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-semibold text-blue-700">Campus Infrastructure</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                Built for daily curiosity, movement, and student safety.
              </h2>
            </div>
            <p className="text-sm text-slate-600 max-w-sm">
              Every facility is purposefully sized for Grade 1 to Grade 5 students across Sections A and B.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FACILITIES.map((item) => (
              <div
                key={item.title}
                className={`relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group h-72 flex flex-col justify-end p-6 ${
                  item.featured ? 'md:col-span-2' : 'md:col-span-1'
                }`}
              >
                <ResilientImage
                  src={item.img}
                  alt={item.title}
                  fallbackTitle={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent" />
                <div className="relative z-10 space-y-1.5 max-w-lg">
                  <p className="text-xs font-medium text-blue-300">{item.kicker}</p>
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Admissions Section */}
      <section id="contact" className="scroll-mt-16 py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-blue-700">Admissions Desk</p>
                <h2 className="text-3xl font-extrabold text-slate-900">
                  Inquire about 2025–2026 admissions.
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Submit your contact details to schedule a campus visit or request grade availability. Every inquiry goes directly to our school office dashboard.
                </p>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-200 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-700 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Campus Address</p>
                    <p className="text-xs text-slate-600 mt-0.5">Plot 42, Green Valley Academic Enclave</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-blue-700 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">School & Office Hours</p>
                    <p className="text-xs text-slate-600 mt-0.5 tabular-nums">Monday – Saturday · 08:30 AM – 03:30 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-blue-700 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Admissions Helpline</p>
                    <p className="text-xs text-slate-600 mt-0.5 tabular-nums">+91 90000 11111</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-blue-700 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Admissions Email</p>
                    <p className="text-xs text-slate-600 mt-0.5">admissions@ashivam.edu</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5">
                {contactState === 'success' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm rounded-lg flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Admission inquiry submitted</p>
                      <p className="text-xs text-emerald-800 mt-0.5">Our school office has logged your request and will reach out shortly.</p>
                    </div>
                  </div>
                )}

                {contactState === 'error' && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 text-sm rounded-lg flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-700 mt-0.5 shrink-0" />
                    <p>{contactError}</p>
                  </div>
                )}

                <form onSubmit={handleContactSubmit} className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="inq-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Parent / Guardian Name
                      </label>
                      <input
                        id="inq-name"
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="e.g. Srinivas Rao"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                    <div>
                      <label htmlFor="inq-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Email Address
                      </label>
                      <input
                        id="inq-email"
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="parent@example.com"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="inq-phone" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      id="inq-phone"
                      type="tel"
                      required
                      value={contactForm.phone}
                      onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="inq-message" className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Inquiry Message (Grade & Questions)
                    </label>
                    <textarea
                      id="inq-message"
                      required
                      rows={3}
                      value={contactForm.message}
                      onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Seeking admission for Grade 3 Section A for the 2025–2026 academic year..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactState === 'submitting'}
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors text-sm"
                  >
                    {contactState === 'submitting' ? 'Submitting...' : 'Submit Admission Inquiry'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs">
          <div className="space-y-1">
            <p className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>ASHIVAM TECH Primary School</span>
            </p>
            <p>Grades 1–5 Academic Administration & Learning ERP</p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#facilities" className="hover:text-white transition-colors">Facilities</a>
            <a href="#contact" className="hover:text-white transition-colors">Admissions</a>
            <button
              type="button"
              onClick={onNavigateLogin}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              Portal Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
