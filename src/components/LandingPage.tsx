import React, { useState } from 'react';
import {
  GraduationCap, ChevronRight, CheckCircle, AlertCircle,
  BookOpen, Building, MapPin, Phone, Mail, Clock, Menu, X
} from 'lucide-react';
import heroBoyImg from '../assets/images/primary_school_hero_boy_1795009629440.jpg';
import smartClassroomImg from '../assets/images/smart_classroom_kids_1794909605075.jpg';
import computerLabImg from '../assets/images/school_computer_lab_1794909604914.jpg';
import libraryImg from '../assets/images/primary_school_library_1794909603743.jpg';
import campusSecurityImg from '../assets/images/school_campus_security_1794909603525.jpg';
import schoolBusImg from '../assets/images/primary_school_bus_1794909603539.jpg';
import playgroundImg from '../assets/images/school_playground_kids_1794909604804.jpg';

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
    img: smartClassroomImg,
    title: 'Smart Interactive Classrooms',
    kicker: 'Grade 1–5 · Digital Boards',
    desc: 'Bright, ergonomic classrooms equipped with interactive smart displays and visual concept kits tailored for primary learners.',
    featured: true
  },
  {
    img: computerLabImg,
    title: 'Primary Computer Lab',
    kicker: 'Hands-on Coding · Safe Browsing',
    desc: 'Dedicated child-friendly workstations introducing typing, logic puzzles, and guided digital literacy.'
  },
  {
    img: libraryImg,
    title: 'Story & Reading Library',
    kicker: '10,000+ Titles · Quiet Corners',
    desc: 'Curated bilingual storybooks, illustrated encyclopedias, and weekly guided reading circles.'
  },
  {
    img: campusSecurityImg,
    title: '24/7 Verified Campus Security',
    kicker: 'CCTV · Visitor Verification',
    desc: 'Round-the-clock perimeter monitoring, trained campus staff, and checked guardian pickup gates.'
  },
  {
    img: schoolBusImg,
    title: 'GPS-Tracked School Transport',
    kicker: 'Route Attendants · Safe Transit',
    desc: 'Dedicated primary-school buses with trained route attendants and real-time pickup coordination.'
  },
  {
    img: playgroundImg,
    title: 'Outdoor Sports & Playground',
    kicker: 'Daily Physical Education · Track & Turf',
    desc: 'Shaded play zones, athletic tracks, and supervised team games building coordination and healthy habits.',
    featured: true
  }
];

const GRADE_CURRICULUM = [
  { grade: '1st Grade', sections: 'Sections A & B', focus: 'Phonics, Early Numeracy, Telugu, Hindi & Storytelling', room: 'Rooms 101 – 102' },
  { grade: '2nd Grade', sections: 'Sections A & B', focus: 'Reading Fluency, Mental Arithmetic & Environmental Discovery', room: 'Rooms 103 – 104' },
  { grade: '3rd Grade', sections: 'Sections A & B', focus: 'Grammar, Multiplication Foundations, Science Labs & Art', room: 'Rooms 201 – 202' },
  { grade: '4th Grade', sections: 'Sections A & B', focus: 'Fractions, Geography, Guided Computer Coding & Experiments', room: 'Rooms 203 – 204' },
  { grade: '5th Grade', sections: 'Sections A & B', focus: 'Reasoning, Essay Writing, Pre-Middle STEM & Leadership', room: 'Rooms 301 – 302' }
];

const FEATURED_TEACHERS = [
  { name: 'Dr. Ramesh Babu', role: 'Principal', subject: 'Administration & Moral Science', exp: '22 Years Experience', classes: 'All Classes' },
  { name: 'Mrs. Sarojini Devi', role: 'Vice Principal', subject: 'Social Studies', exp: '16 Years Experience', classes: '5th-A, 5th-B' },
  { name: 'Mrs. Vannani Rao', role: 'Class Teacher', subject: 'Mathematics', exp: '10 Years Experience', classes: '3rd-A, 4th-A, 5th-A' },
  { name: 'Mr. Rajesh Sharma', role: 'Class Teacher', subject: 'English Language', exp: '8 Years Experience', classes: '1st-A, 1st-B, 2nd-A' }
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
      <div className="absolute inset-0 bg-gradient-to-br from-[#5d6f7d] via-[#6b7e8c] to-[#4a5b68] flex flex-col items-center justify-center p-6 text-center">
        <GraduationCap className="w-10 h-10 text-[#F6C33B] mb-2" />
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
      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: text };
      }
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
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Top Bar Contract: Crisp White header, 3 zones cleanly separated */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-8">
          <a
            href="#home"
            className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC483E] rounded"
          >
            <span className="h-11 flex items-center justify-center shrink-0">
              <img
                src="/assets/aistudio/company_logo_c387ba1a.jpeg"
                alt="Ashivam Technologies Logo"
                referrerPolicy="no-referrer"
                onError={e => {
                  e.currentTarget.style.display = 'none';
                }}
                className="h-11 w-auto object-contain"
              />
            </span>
            <span>ASHIVAM TECH</span>
          </a>

          <nav aria-label="Primary" className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
            <a href="#home" className="text-[#EC483E] font-semibold hover:text-[#d9382e] transition-colors whitespace-nowrap shrink-0">Home</a>
            <a href="#about" className="hover:text-[#EC483E] transition-colors whitespace-nowrap shrink-0">About us</a>
            <a href="#classes" className="hover:text-[#EC483E] transition-colors whitespace-nowrap shrink-0">Classes</a>
            <a href="#teachers" className="hover:text-[#EC483E] transition-colors whitespace-nowrap shrink-0">Teachers</a>
            <a href="#contact" className="hover:text-[#EC483E] transition-colors whitespace-nowrap shrink-0">Contact us</a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onNavigateLogin}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 bg-[#F6C33B] hover:bg-[#e8b42a] rounded-sm transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Portal Login
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 rounded text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 text-sm font-medium text-slate-700">
            <a href="#home" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#EC483E] font-semibold">Home</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-[#EC483E]">About us</a>
            <a href="#classes" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-[#EC483E]">Classes</a>
            <a href="#teachers" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-[#EC483E]">Teachers</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-[#EC483E]">Contact us</a>
          </div>
        )}
      </header>

      {/* BeSchool-Inspired Steel-Slate Hero Section */}
      <section id="home" className="scroll-mt-20 relative bg-[#6B7E8C]">
        <div className="relative min-h-[500px] sm:min-h-[560px] lg:min-h-[610px] flex items-center overflow-hidden">
          <ResilientImage
            src={heroBoyImg}
            alt="Curious primary school student in a blue graduation cap looking through a magnifying glass"
            fallbackTitle="ASHIVAM TECH Primary School"
            className="absolute inset-0 w-full h-full object-cover object-[22%_center] md:object-center"
          />
          {/* Keep the left portrait vibrant while subtly tinting the right side behind text */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#526370]/25 via-[#687A88]/55 to-[#6A7D8B]/85 lg:from-transparent lg:via-transparent lg:to-[#6B7E8C]/80" />

          <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-14 pb-24 lg:pt-16 lg:pb-28">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              <div className="hidden lg:block lg:col-span-6" />
              <div className="lg:col-span-6 max-w-xl ml-auto space-y-5">
                <p className="text-xs sm:text-sm font-bold tracking-wider uppercase text-[#F6C33B]">
                  Welcome on our site
                </p>

                <h1
                  className="font-editorial font-bold text-white leading-[1.08]"
                  style={{ fontSize: 'clamp(2.5rem, 4.5vw, 4.25rem)' }}
                >
                  Primary School
                </h1>

                <p className="text-sm sm:text-base text-slate-100 leading-relaxed max-w-lg">
                  ASHIVAM TECH nurtures young learners across Grades 1 to 5 with caring subject faculty, interactive classrooms, daily attendance tracking, and unified portals for parents and students.
                </p>

                <div className="pt-2">
                  <a
                    href="#about"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#EC483E] hover:bg-[#d9382e] text-white text-sm font-semibold rounded-sm transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <span>Learn more</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overlapping 3-Column Feature Strip: Coral Red · Warm Amber · Crisp White */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-12 sm:-mt-14 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <a
                href="#teachers"
                className="bg-[#EC483E] hover:bg-[#d9382e] text-white px-7 py-6 rounded-sm shadow-md transition-transform duration-150 hover:-translate-y-0.5 flex items-center justify-between gap-4"
              >
                <span className="text-lg font-bold inline-flex items-center gap-2 whitespace-nowrap">
                  <span>Our teachers</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
                <BookOpen className="w-9 h-9 text-white/90 shrink-0 stroke-[1.75]" />
              </a>

              <a
                href="#classes"
                className="bg-[#F6C33B] hover:bg-[#ebb62a] text-slate-900 px-7 py-6 rounded-sm shadow-md transition-transform duration-150 hover:-translate-y-0.5 flex items-center justify-between gap-4"
              >
                <span className="text-lg font-bold inline-flex items-center gap-2 whitespace-nowrap">
                  <span>All classes</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
                <GraduationCap className="w-9 h-9 text-slate-900/85 shrink-0 stroke-[1.75]" />
              </a>

              <a
                href="#contact"
                className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 px-7 py-6 rounded-sm shadow-md transition-transform duration-150 hover:-translate-y-0.5 flex items-center justify-between gap-4"
              >
                <span className="text-lg font-bold inline-flex items-center gap-2 whitespace-nowrap">
                  <span>Contact us</span>
                  <ChevronRight className="w-4 h-4 text-[#EC483E]" />
                </span>
                <Building className="w-9 h-9 text-slate-900 shrink-0 stroke-[1.75]" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="scroll-mt-20 py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#EC483E]">
                About Our School
              </p>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
                Strong primary foundations from Grade 1 through Grade 5.
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">
                ASHIVAM TECH Primary School combines attentive classroom teaching across Telugu, Hindi, English, Mathematics, Science, and Social Studies with structured daily progress tracking across all 10 class sections.
              </p>
              <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">10</p>
                  <p className="text-xs text-slate-500 mt-0.5">Sections (A & B)</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#EC483E] tabular-nums">1:15</p>
                  <p className="text-xs text-slate-500 mt-0.5">Teacher Ratio</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">4</p>
                  <p className="text-xs text-slate-500 mt-0.5">School Portals</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-5">
              <div className="relative h-56 sm:h-64 rounded-sm overflow-hidden border border-slate-200 bg-[#3D4B56]">
                <ResilientImage
                  src="/assets/aistudio/image_f4101ff3.png"
                  alt="Ashivam Tech School Campus Front Entrance and School Bus"
                  fallbackTitle="ASHIVAM TECH SCHOOL Campus"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-sm overflow-hidden">
              <div className="bg-white p-7 space-y-2.5">
                <p className="text-xs font-mono font-bold text-[#EC483E] tabular-nums">01</p>
                <h3 className="text-lg font-bold text-slate-900">Dedicated Subject Faculty</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Qualified educators for Languages, Mathematics, Environmental Science, Computer Literacy, and Physical Education.
                </p>
              </div>
              <div className="bg-white p-7 space-y-2.5">
                <p className="text-xs font-mono font-bold text-[#d99b08] tabular-nums">02</p>
                <h3 className="text-lg font-bold text-slate-900">Activity-Led Classrooms</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Interactive whiteboards, hands-on science demonstrations, guided reading circles, and weekly co-curricular periods.
                </p>
              </div>
              <div className="bg-white p-7 space-y-2.5">
                <p className="text-xs font-mono font-bold text-[#EC483E] tabular-nums">03</p>
                <h3 className="text-lg font-bold text-slate-900">Verified Campus Safety</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Continuous CCTV coverage, gated visitor check-in, and trained attendants on every school bus route.
                </p>
              </div>
              <div className="bg-white p-7 space-y-2.5">
                <p className="text-xs font-mono font-bold text-[#d99b08] tabular-nums">04</p>
                <h3 className="text-lg font-bold text-slate-900">Transparent Parent Connect</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Instant attendance percentages, downloadable exam report cards, fee ledgers, and direct teacher messages.
                </p>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Classes Section */}
      <section id="classes" className="scroll-mt-20 py-16 lg:py-24 bg-[#F7F8FA] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#EC483E]">All Classes · Grades 1 – 5</p>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900">
                Structured primary curriculum from Class 1st to Class 5th.
              </h2>
            </div>
            <button
              type="button"
              onClick={onNavigateLogin}
              className="px-5 py-2.5 bg-[#F6C33B] hover:bg-[#ebb62a] text-slate-900 text-sm font-bold rounded-sm transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 self-start md:self-auto"
            >
              <span>View Class Timetables</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {GRADE_CURRICULUM.map((item, idx) => (
              <div
                key={item.grade}
                className="bg-white border border-slate-200 rounded-sm p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <p className={`text-xs font-mono font-bold tabular-nums ${idx % 2 === 0 ? 'text-[#EC483E]' : 'text-[#d99b08]'}`}>
                    {item.sections}
                  </p>
                  <h3 className="font-editorial text-2xl font-bold text-slate-900">{item.grade}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.focus}</p>
                </div>
                <p className="text-xs font-medium text-slate-500 pt-3 border-t border-slate-100 tabular-nums">
                  {item.room} · Mon–Sat
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Teachers Section */}
      <section id="teachers" className="scroll-mt-20 py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#EC483E]">Our Teachers</p>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900">
                Experienced faculty guiding every classroom section.
              </h2>
            </div>
            <button
              type="button"
              onClick={onNavigateLogin}
              className="px-5 py-2.5 bg-[#EC483E] hover:bg-[#d9382e] text-white text-sm font-semibold rounded-sm transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 self-start md:self-auto"
            >
              <span>Teacher Portal Sign In</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURED_TEACHERS.map(teacher => (
              <div
                key={teacher.name}
                className="bg-[#F7F8FA] border border-slate-200 rounded-sm p-6 space-y-3"
              >
                <p className="text-xs font-bold text-[#EC483E]">{teacher.role}</p>
                <h3 className="text-lg font-bold text-slate-900">{teacher.name}</h3>
                <p className="text-sm font-medium text-slate-700">{teacher.subject}</p>
                <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 space-y-1">
                  <p>{teacher.exp}</p>
                  <p className="font-mono text-slate-700">Assigned: {teacher.classes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Bento Showcase */}
      <section id="facilities" className="scroll-mt-20 py-16 lg:py-24 bg-[#F7F8FA] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#EC483E]">Campus Infrastructure</p>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900">
                Built for daily curiosity, movement, and student safety.
              </h2>
            </div>
            <p className="text-sm text-slate-600 max-w-sm">
              Every facility is purposefully sized for Grade 1 to Grade 5 students across Sections A and B.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FACILITIES.map((item) => (
              <div
                key={item.title}
                className={`relative rounded-sm overflow-hidden border border-slate-200 bg-[#5d6f7d] group h-72 flex flex-col justify-end p-6 ${
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
                  <p className="text-xs font-semibold text-[#F6C33B]">{item.kicker}</p>
                  <h3 className="text-xl font-bold text-white">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Admissions Section */}
      <section id="contact" className="scroll-mt-20 py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-[#EC483E]">Admissions Desk</p>
                <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900">
                  Inquire about 2025–2026 admissions.
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Submit your contact details to schedule a campus visit or request grade availability. Every inquiry goes directly to our school office dashboard.
                </p>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-200 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#EC483E] mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Campus Address</p>
                    <p className="text-xs text-slate-600 mt-0.5">Plot 42, Green Valley Academic Enclave</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#EC483E] mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">School & Office Hours</p>
                    <p className="text-xs text-slate-600 mt-0.5 tabular-nums">Monday – Saturday · 08:30 AM – 03:30 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#EC483E] mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Admissions Helpline</p>
                    <p className="text-xs text-slate-600 mt-0.5 tabular-nums">+91 90000 11111</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#EC483E] mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">Admissions Email</p>
                    <p className="text-xs text-slate-600 mt-0.5">admissions@ashivam.edu</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-[#F7F8FA] border border-slate-200 rounded-sm p-6 sm:p-8 space-y-5">
                {contactState === 'success' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm rounded-sm flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Admission inquiry submitted</p>
                      <p className="text-xs text-emerald-800 mt-0.5">Our school office has logged your request and will reach out shortly.</p>
                    </div>
                  </div>
                )}

                {contactState === 'error' && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 text-sm rounded-sm flex items-start gap-2.5">
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
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#EC483E] focus:border-[#EC483E]"
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
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#EC483E] focus:border-[#EC483E]"
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
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#EC483E] focus:border-[#EC483E]"
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
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#EC483E] focus:border-[#EC483E]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactState === 'submitting'}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#EC483E] hover:bg-[#d9382e] disabled:opacity-60 text-white font-semibold rounded-sm transition-colors text-sm"
                  >
                    {contactState === 'submitting' ? 'Submitting...' : 'Submit Admission Inquiry'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Steel-Slate Footer */}
      <footer className="bg-[#3D4B56] text-slate-200 border-t border-[#323F49] py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-xs">
          <div className="space-y-1">
            <p className="text-sm font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#F6C33B]" />
              <span>ASHIVAM TECH Primary School</span>
            </p>
            <p className="text-slate-300">Grades 1–5 Academic Administration & Learning ERP</p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <a href="#about" className="hover:text-white transition-colors">About us</a>
            <a href="#classes" className="hover:text-white transition-colors">Classes</a>
            <a href="#teachers" className="hover:text-white transition-colors">Teachers</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact us</a>
            <button
              type="button"
              onClick={onNavigateLogin}
              className="text-[#F6C33B] hover:text-amber-300 font-bold transition-colors"
            >
              Portal Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
