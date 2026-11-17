import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Shield, Users, UserCheck, BookOpen, Calendar, 
  DollarSign, FileText, Bell, Award, Search, LogOut, Menu, X, 
  CheckCircle, AlertCircle, Eye, EyeOff, Phone, Mail, MapPin, 
  ArrowRight, Download, Plus, Trash2, Edit, User, Building,
  BookMarked, Clock, PieChart, Activity, Check, UserPlus, CalendarPlus, MessageSquare
} from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('ashivam_token'));
  const [currentUser, setCurrentUser] = useState<any>(JSON.parse(localStorage.getItem('ashivam_user') || 'null'));
  const [currentView, setCurrentView] = useState<'home' | 'login_select' | 'login_form' | 'dashboard'>(
    token && currentUser ? 'dashboard' : 'home'
  );
  
  const [selectedRole, setSelectedRole] = useState<'admin' | 'teacher' | 'student' | 'parent'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
          setCurrentView('dashboard');
        } else {
          handleLogout();
        }
      })
      .catch(() => handleLogout());
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('ashivam_token', data.token);
      localStorage.setItem('ashivam_user', JSON.stringify(data.user));
      setCurrentView('dashboard');
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('ashivam_token');
    localStorage.removeItem('ashivam_user');
    setCurrentView('login_select');
    setEmail('');
    setPassword('');
  };

  const fillDemoCreds = (role: string) => {
    setSelectedRole(role as any);
    if (role === 'admin') {
      setEmail('admin@ashivam.edu');
      setPassword('admin123');
    } else if (role === 'teacher') {
      setEmail('vannani@ashivam.edu');
      setPassword('teacher123');
    } else if (role === 'parent') {
      setEmail('kumar@ashivam.edu');
      setPassword('parent123');
    } else if (role === 'student') {
      setEmail('kavya@ashivam.edu');
      setPassword('student123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {currentView === 'home' && (
        <HomePage onNavigateLogin={() => setCurrentView('login_select')} />
      )}

      {currentView === 'login_select' && (
        <LoginSelectionPage 
          onSelectRole={(role) => {
            setLoginError('');
            setSelectedRole(role);
            fillDemoCreds(role);
            setCurrentView('login_form');
          }}
          onBack={() => setCurrentView('home')}
        />
      )}

      {currentView === 'login_form' && (
        <LoginForm 
          selectedRole={selectedRole}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          loginError={loginError}
          loading={loading}
          onSubmit={handleLogin}
          onQuickFill={fillDemoCreds}
          onBack={() => setCurrentView('login_select')}
        />
      )}

      {currentView === 'dashboard' && currentUser && (
        <Dashboard 
          user={currentUser}
          token={token!}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

// ==========================================
// 1. HOME PAGE
// ==========================================
function HomePage({ onNavigateLogin }: { onNavigateLogin: () => void }) {
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactForm)
    });
    if (res.ok) {
      setContactSubmitted(true);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                ASHIVAM TECH
              </span>
              <p className="text-xs font-medium text-slate-500 tracking-wider uppercase">Primary School ERP</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 font-medium text-slate-600">
            <a href="#home" className="hover:text-blue-600 transition">Home</a>
            <a href="#about" className="hover:text-blue-600 transition">About School</a>
            <a href="#facilities" className="hover:text-blue-600 transition">Facilities</a>
            <a href="#contact" className="hover:text-blue-600 transition">Contact Admissions</a>
          </nav>

          <button 
            onClick={onNavigateLogin}
            className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center space-x-2"
          >
            <span>Login Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section with Full School Building Exterior Image */}
      <section id="home" className="scroll-mt-20 relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/30 px-4 py-2 rounded-full text-blue-300 text-sm font-medium backdrop-blur">
              <Award className="w-4 h-4" />
              <span>ASHIVAM TECH Primary Campus & Smart ERP Hub</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Welcome to <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">ASHIVAM TECH</span> School
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0">
              A Smarter Way to Manage Learning, Teaching and School Administration. Empowering young learners from Grade 1 to 5.
            </p>
            <button 
              onClick={onNavigateLogin}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-xl shadow-blue-600/40 transition flex items-center justify-center space-x-3 text-base mx-auto lg:mx-0"
            >
              <span>Login Portal</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl text-center space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-white/20">
                <img 
                  src="/assets/aistudio/image_f4101ff3.png" 
                  alt="ASHIVAM TECH School Building" 
                  className="w-full h-56 object-cover transform hover:scale-105 transition duration-500"
                />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white">ASHIVAM TECH Primary Campus</h3>
                <p className="text-xs text-blue-300 mt-1">Smart ERP Hub & Model School Building</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Our School Section */}
      <section id="about" className="scroll-mt-20 py-24 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest">
                <BookOpen className="w-3.5 h-3.5" />
                <span>About Our School</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                Nurturing Young Minds from Grade 1 to Grade 5
              </h2>
              <p className="text-slate-600 leading-relaxed">
                ASHIVAM TECH Primary School provides a joyful, safe, and inspiring learning ecosystem where children build strong foundations in academics, creativity, and character. Led by our experienced Principal, Vice Principal, and dedicated subject teachers across Telugu, Hindi, English, Mathematics, Science, and Social Studies, every student receives personal attention.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-2xl font-extrabold text-blue-600">1st–5th</span>
                  <p className="text-xs font-semibold text-slate-600 mt-1">Primary Grades (A & B)</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-2xl font-extrabold text-indigo-600">1:15</span>
                  <p className="text-xs font-semibold text-slate-600 mt-1">Teacher-Student Ratio</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
                  <span className="text-2xl font-extrabold text-amber-500">100%</span>
                  <p className="text-xs font-semibold text-slate-600 mt-1">Smart Digital ERP</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Dedicated Faculty</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Specialized teachers for Telugu, English, Hindi, Maths, Science, and Social Studies guided by our Principal and Vice Principal.
                </p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Activity-Based Learning</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Interactive smart boards, hands-on computer labs, storytelling libraries, and daily outdoor sports for holistic growth.
                </p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Safe & Caring Campus</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  24/7 CCTV security, verified visitor gates, GPS-tracked buses, and attentive care for every primary student.
                </p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Parent-Teacher Connect</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Real-time attendance updates, exam report cards, timetables, and direct parent-teacher communication portals.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities with Small Background Images as requested */}
      <section id="facilities" className="scroll-mt-20 py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">World-Class Facilities</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Designed for Optimal Growth & Safety</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FacilityCard 
              img="/src/assets/images/smart_classroom_kids_1794909605075.jpg" 
              title="Smart Classes & Children's" 
              desc="Interactive smart boards and engaging digital learning aids for children." 
            />
            <FacilityCard 
              img="/src/assets/images/school_playground_kids_1794909604804.jpg" 
              title="School Playground" 
              desc="Vast outdoor play areas and sports grounds for children's physical activity." 
            />
            <FacilityCard 
              img="/src/assets/images/school_computer_lab_1794909604914.jpg" 
              title="Computers Lab" 
              desc="Modern computer stations and safe digital exploration kits for students." 
            />
            <FacilityCard 
              img="/src/assets/images/primary_school_library_1794909603743.jpg" 
              title="Library" 
              desc="Over 10,000 age-appropriate story books and children's reading corners." 
            />
            <FacilityCard 
              img="/src/assets/images/school_campus_security_1794909603525.jpg" 
              title="24/7 Security" 
              desc="CCTV surveillance, secure campus gates, and verified visitor protocols." 
            />
            <FacilityCard 
              img="/src/assets/images/primary_school_bus_1794909603539.jpg" 
              title="School Bus" 
              desc="GPS-enabled school buses with trained attendants and live parent tracking." 
            />
          </div>
        </div>
      </section>

      {/* Contact Admissions */}
      <section id="contact" className="scroll-mt-20 py-24 bg-slate-50 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">Admissions & Inquiries</h2>
            <h3 className="text-3xl font-extrabold text-slate-900">Contact ASHIVAM TECH School</h3>
          </div>
          {contactSubmitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl text-center font-bold">
              ✅ Admission inquiry submitted successfully!
            </div>
          )}
          <form onSubmit={handleContactSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" required value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} placeholder="Parent Name" className="px-4 py-3 bg-slate-50 border rounded-xl text-sm" />
              <input type="email" required value={contactForm.email} onChange={e => setContactForm({...contactForm, email: e.target.value})} placeholder="Email" className="px-4 py-3 bg-slate-50 border rounded-xl text-sm" />
              <input type="text" required value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} placeholder="Phone Number" className="px-4 py-3 bg-slate-50 border rounded-xl text-sm" />
              <input type="text" required value={contactForm.message} onChange={e => setContactForm({...contactForm, message: e.target.value})} placeholder="Message / Inquiry" className="px-4 py-3 bg-slate-50 border rounded-xl text-sm" />
            </div>
            <button type="submit" className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow">Submit Inquiry</button>
          </form>
        </div>
      </section>
    </div>
  );
}

function FacilityCard({ img, title, desc }: { img: string; title: string; desc: string }) {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-md group h-64 flex flex-col justify-end p-6 border border-slate-100">
      <img
        src={img}
        alt={title}
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent"></div>
      <div className="relative z-10 space-y-1">
        <h4 className="text-xl font-bold text-white">{title}</h4>
        <p className="text-xs text-slate-300 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ==========================================
// 2. LOGIN SELECTION PAGE
// ==========================================
function LoginSelectionPage({ onSelectRole, onBack }: { onSelectRole: (role: any) => void; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-4xl mx-auto w-full relative z-10 space-y-12">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold transition border border-slate-700">
            ← Back to Home
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight">ASHIVAM TECH ERP</span>
          </div>
        </div>

        <div className="text-center space-y-4 max-w-xl mx-auto">
          <h1 className="text-3xl font-extrabold">Select Your Portal Login</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <RoleCard icon={<Shield className="w-7 h-7 text-blue-400" />} title="Admin Login" onClick={() => onSelectRole('admin')} color="border-blue-500/30 hover:border-blue-500 bg-blue-950/20" />
          <RoleCard icon={<UserCheck className="w-7 h-7 text-indigo-400" />} title="Teacher Login" onClick={() => onSelectRole('teacher')} color="border-indigo-500/30 hover:border-indigo-500 bg-indigo-950/20" />
          <RoleCard icon={<Award className="w-7 h-7 text-emerald-400" />} title="Student Login" onClick={() => onSelectRole('student')} color="border-emerald-500/30 hover:border-emerald-500 bg-emerald-950/20" />
          <RoleCard icon={<Users className="w-7 h-7 text-amber-400" />} title="Parent Login" onClick={() => onSelectRole('parent')} color="border-amber-500/30 hover:border-amber-500 bg-amber-950/20" />
        </div>
      </div>
    </div>
  );
}

function RoleCard({ icon, title, onClick, color }: { icon: any; title: string; onClick: () => void; color: string }) {
  return (
    <div onClick={onClick} className={`p-6 rounded-2xl border transition cursor-pointer hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between ${color}`}>
      <div className="space-y-4">
        <div className="p-3 w-fit rounded-xl bg-white/5 border border-white/10">{icon}</div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <div className="flex items-center space-x-2 text-sm font-bold text-blue-400 mt-6">
        <span>Proceed</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
}

// ==========================================
// 3. LOGIN FORM
// ==========================================
function LoginForm({ 
  selectedRole, email, setEmail, password, setPassword, 
  showPassword, setShowPassword, loginError, loading, onSubmit, onQuickFill, onBack 
}: any) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center py-12 px-4 relative">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-sm text-slate-400 hover:text-white">← Back</button>
          <span className="text-xs uppercase font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">{selectedRole} Portal</span>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold capitalize">ASHIVAM TECH {selectedRole} Login</h2>
        </div>

        <div className="p-3 bg-slate-900/60 rounded-xl space-y-2 text-xs">
          <p className="font-semibold text-slate-400 text-center">💡 Quick Fill Demo Credentials:</p>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => onQuickFill('admin')} className="p-2 bg-slate-800 rounded font-medium text-blue-300">Admin Demo</button>
            <button type="button" onClick={() => onQuickFill('teacher')} className="p-2 bg-slate-800 rounded font-medium text-indigo-300">Teacher Demo</button>
            <button type="button" onClick={() => onQuickFill('parent')} className="p-2 bg-slate-800 rounded font-medium text-amber-300">Parent Demo</button>
            <button type="button" onClick={() => onQuickFill('student')} className="p-2 bg-slate-800 rounded font-medium text-emerald-300">Student Demo</button>
          </div>
          {selectedRole === 'student' && (
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/30 rounded-lg text-[11px] text-emerald-200 text-center space-y-0.5">
              <p>All students share password <span className="font-bold text-white">student123</span> with their own email.</p>
              <p className="text-emerald-300/80">Log in with any student email (e.g. kavya@ashivam.edu, sai@gmail.com) to open their profile.</p>
            </div>
          )}
          {selectedRole === 'teacher' && (
            <div className="p-2.5 bg-indigo-950/60 border border-indigo-500/30 rounded-lg text-[11px] text-indigo-200 text-center space-y-0.5">
              <p>All teachers share password <span className="font-bold text-white">teacher123</span> with their own email.</p>
              <p className="text-indigo-300/80">Log in with any teacher email (e.g. vannani@ashivam.edu, venkat@ashivam.edu, or any newly added teacher) to open their portal.</p>
            </div>
          )}
        </div>

        {loginError && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
            {loginError}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Email ID</label>
            <input
              type="text"
              inputMode="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={
                selectedRole === 'student'
                  ? 'Enter student email (e.g. sai@gmail.com)'
                  : selectedRole === 'teacher'
                  ? 'Enter teacher email (e.g. vannani@ashivam.edu)'
                  : 'e.g. admin@ashivam.edu'
              }
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow text-sm">
            {loading ? 'Authenticating...' : `Login to ${selectedRole} Dashboard`}
          </button>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 4. DASHBOARD CONTAINER
// ==========================================
function Dashboard({ user, token, onLogout }: { user: any; token: string; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  
  const [selectedClassSection, setSelectedClassSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddResult, setShowAddResult] = useState(false);

  const [parentFeedback, setParentFeedback] = useState({ teacherName: 'Mrs. Vannani Rao', message: '' });
  const [feedbackSent, setFeedbackSent] = useState(false);

  const [newStudent, setNewStudent] = useState({
    fullName: '', email: '', dob: '', gender: 'Female', class: '1st', section: 'A',
    parentName: '', parentEmail: '', parentPhone: '', address: '', bloodGroup: 'O+'
  });

  const [newTeacher, setNewTeacher] = useState<{
    name: string;
    designation: string;
    email: string;
    phone: string;
    qualification: string;
    experience: string;
    subject: string;
    assignedClasses: string[];
  }>({
    name: '', designation: 'Teacher', email: '', phone: '', qualification: '', experience: '', subject: 'Mathematics',
    assignedClasses: ['3rd-A', '4th-A']
  });

  const [newEvent, setNewEvent] = useState({
    title: '', description: '', category: 'All'
  });

  const [newResult, setNewResult] = useState({
    studentId: '', subject: 'Mathematics', marksObtained: '90', maxMarks: '100', remarks: 'Very good progress'
  });

  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab, user?.id, token]);

  const fetchData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const statsRes = await fetch('/api/stats', { headers });
      if (statsRes.ok) setStats(await statsRes.json());

      const studRes = await fetch('/api/students', { headers });
      if (studRes.ok) setStudents(await studRes.json());

      const teachRes = await fetch('/api/teachers', { headers });
      if (teachRes.ok) setTeachers(await teachRes.json());

      const feeRes = await fetch('/api/fees', { headers });
      if (feeRes.ok) setFees(await feeRes.json());

      const resRes = await fetch('/api/results', { headers });
      if (resRes.ok) setResults(await resRes.json());

      const noticeRes = await fetch('/api/notices', { headers });
      if (noticeRes.ok) setNotices(await noticeRes.json());

      const ttRes = await fetch('/api/timetables', { headers });
      if (ttRes.ok) setTimetables(await ttRes.json());

      const fbRes = await fetch('/api/feedback', { headers });
      if (fbRes.ok) setFeedbackList(await fbRes.json());

      if (user.role === 'admin') {
        const inqRes = await fetch('/api/inquiries', { headers });
        if (inqRes.ok) setInquiries(await inqRes.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openAddStudentModal = (clsSec?: string | null) => {
    if (clsSec && clsSec.includes('-')) {
      const [cls, sec] = clsSec.split('-');
      setNewStudent({
        fullName: '', email: '', dob: '', gender: 'Female', class: cls, section: sec,
        parentName: '', parentEmail: '', parentPhone: '', address: '', bloodGroup: 'O+'
      });
    } else {
      setNewStudent({
        fullName: '', email: '', dob: '', gender: 'Female', class: '1st', section: 'A',
        parentName: '', parentEmail: '', parentPhone: '', address: '', bloodGroup: 'O+'
      });
    }
    setShowAddStudent(true);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newStudent)
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setShowAddStudent(false);
      setNewStudent({
        fullName: '', email: '', dob: '', gender: 'Female', class: '1st', section: 'A',
        parentName: '', parentEmail: '', parentPhone: '', address: '', bloodGroup: 'O+'
      });
      fetchData();
      alert('Student added successfully! Login password is student123');
    } else {
      alert(data.error || 'Failed to add student');
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newTeacher)
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setShowAddTeacher(false);
      setNewTeacher({
        name: '', designation: 'Teacher', email: '', phone: '', qualification: '', experience: '', subject: 'Mathematics',
        assignedClasses: ['3rd-A', '4th-A']
      });
      fetchData();
      alert('Teacher added successfully! Login password is teacher123');
    } else {
      alert(data.error || 'Failed to add teacher');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newEvent)
    });
    if (res.ok) {
      setShowAddEvent(false);
      fetchData();
      alert('Event published!');
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(parentFeedback)
    });
    if (res.ok) {
      setFeedbackSent(true);
      setParentFeedback({ teacherName: 'Mrs. Vannani Rao', message: '' });
      fetchData();
      setTimeout(() => setFeedbackSent(false), 4000);
    }
  };

  const handleMarkAttendance = async (studentId: string, status: 'Present' | 'Absent') => {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ studentId, status })
    });
    if (res.ok) {
      fetchData();
    }
  };

  const handleDeleteStudent = async (id: string) => {
    const res = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchData();
  };

  const handleDeleteTeacher = async (id: string) => {
    const res = await fetch(`/api/teachers/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchData();
  };

  const handleToggleFeeStatus = async (fee: any) => {
    const nextStatus = fee.status === 'Paid' ? 'Pending' : 'Paid';
    const res = await fetch(`/api/fees/${fee.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status: nextStatus })
    });
    if (res.ok) fetchData();
  };

  const handleCreateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(newResult)
    });
    if (res.ok) {
      setShowAddResult(false);
      setNewResult({ studentId: '', subject: 'Mathematics', marksObtained: '90', maxMarks: '100', remarks: 'Very good progress' });
      fetchData();
    }
  };

  const handleDeleteResult = async (id: string) => {
    const res = await fetch(`/api/results/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchData();
  };

  const handleDeleteNotice = async (id: string) => {
    const res = await fetch(`/api/notices/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchData();
  };

  const handleUpdateInquiryStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    if (res.ok) fetchData();
  };

  const handleDownloadReportCard = (detail: any) => {
    const st = detail.student;
    const resLines = (detail.results || []).length > 0
      ? detail.results.map((r: any) => `- ${r.subject}: ${r.marksObtained}/${r.maxMarks} (Grade ${r.grade}) - ${r.remarks}`).join('\n')
      : '- No exam results published yet';
    const content = [
      'ASHIVAM TECH PRIMARY SCHOOL - STUDENT REPORT CARD',
      '==================================================',
      `Student Name : ${st.fullName}`,
      `Student ID   : ${st.studentId}`,
      `Roll Number  : #${st.rollNumber}`,
      `Class        : ${st.class}-${st.section}`,
      `Email        : ${st.email}`,
      `Attendance   : ${st.attendancePercentage}%`,
      `Fee Status   : ${detail.fees?.status || st.feeStatus}`,
      '',
      'EXAMINATION RESULTS:',
      resLines,
      '=================================================='
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${st.fullName.replace(/\s+/g, '_')}_Report_Card.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openStudentDetail = async (id: string) => {
    const res = await fetch(`/api/students/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) setSelectedStudentDetail(await res.json());
  };

  const renderStudentIcon = (gender: string) => (
    gender === 'Female' ? <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 font-bold">👧</div> : <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold">👦</div>
  );

  // All 10 class sections for Admin, and role-scoped sections for Teacher/Parent/Student
  const allClassSections = [
    '1st-A', '1st-B', 
    '2nd-A', '2nd-B', 
    '3rd-A', '3rd-B', 
    '4th-A', '4th-B', 
    '5th-A', '5th-B'
  ];

  const visibleClassSections: string[] =
    user.role === 'teacher'
      ? (user.assignedClasses || [])
      : user.role === 'student'
      ? [`${user.class}-${user.section}`]
      : user.role === 'parent'
      ? Array.from(new Set(students.filter(s => (user.childrenIds || []).includes(s.id)).map(s => `${s.class}-${s.section}`)))
      : allClassSections;

  const visibleFees =
    user.role === 'teacher'
      ? fees.filter(f => visibleClassSections.includes(f.class))
      : fees;

  const visibleTimetables =
    user.role === 'teacher'
      ? timetables.filter(tt => visibleClassSections.includes(tt.class))
      : timetables;

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between hidden md:flex border-r border-slate-800">
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">ASHIVAM TECH</span>
              <p className="text-xs text-blue-400 capitalize">{user.role} Portal</p>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-medium">
            <SidebarItem icon={<PieChart className="w-4 h-4" />} label="Dashboard" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            
            {(user.role === 'admin' || user.role === 'teacher') && (
              <SidebarItem icon={<Users className="w-4 h-4" />} label={user.role === 'admin' ? "Classes (1st to 5th A&B)" : "Assigned Classes"} active={activeTab === 'students'} onClick={() => { setActiveTab('students'); setSelectedClassSection(null); }} />
            )}

            {user.role === 'admin' && (
              <>
                <SidebarItem icon={<UserPlus className="w-4 h-4" />} label="Add Student" active={false} onClick={() => openAddStudentModal()} />
                <SidebarItem icon={<UserCheck className="w-4 h-4" />} label="Faculty & Teachers" active={activeTab === 'teachers'} onClick={() => setActiveTab('teachers')} />
                <SidebarItem icon={<CalendarPlus className="w-4 h-4" />} label="Add Event / Notice" active={false} onClick={() => setShowAddEvent(true)} />
              </>
            )}

            {user.role === 'parent' && (
              <SidebarItem icon={<Users className="w-4 h-4" />} label="My Children" active={activeTab === 'my_children'} onClick={() => setActiveTab('my_children')} />
            )}

            <SidebarItem icon={<DollarSign className="w-4 h-4" />} label="Fee Management" active={activeTab === 'fees'} onClick={() => setActiveTab('fees')} />
            <SidebarItem icon={<Award className="w-4 h-4" />} label="Examinations & Results" active={activeTab === 'results'} onClick={() => setActiveTab('results')} />
            <SidebarItem icon={<Calendar className="w-4 h-4" />} label="Class Timetables" active={activeTab === 'timetable'} onClick={() => setActiveTab('timetable')} />
            <SidebarItem icon={<Bell className="w-4 h-4" />} label="Notices & Events" active={activeTab === 'notices'} onClick={() => setActiveTab('notices')} />
          </nav>
        </div>

        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">{user.name[0]}</div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <h1 className="text-xl font-extrabold text-slate-800 capitalize">
            {activeTab === 'overview' && `${user.role} Dashboard`}
            {activeTab === 'students' && (user.role === 'teacher' ? 'Assigned Classes & Students' : 'Classes (1st-A to 5th-B) & Students')}
            {activeTab === 'teachers' && 'Faculty & Teachers Directory'}
            {activeTab === 'my_children' && 'My Registered Children'}
            {activeTab === 'fees' && (user.role === 'teacher' ? 'Fee Management (Assigned Students)' : 'Fee Status by Class & Section')}
            {activeTab === 'results' && (user.role === 'teacher' ? 'Examinations & Results (Assigned Classes)' : 'Examinations & Report Cards')}
            {activeTab === 'timetable' && (user.role === 'teacher' ? 'Assigned Class Timetables' : user.role === 'student' || user.role === 'parent' ? 'Class Timetable' : 'Class Timetables (1st to 5th A & B)')}
            {activeTab === 'notices' && 'Notices & Events'}
          </h1>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">{user.role}</span>
            <button onClick={onLogout} className="md:hidden p-2 text-rose-600"><LogOut className="w-5 h-5" /></button>
          </div>
        </header>

        <div className="p-6 sm:p-8 space-y-8 flex-1">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {user.role === 'teacher' && user.assignedClasses && (
                <div className="space-y-6">
                  <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-blue-900 text-base">Welcome, {user.name}</h3>
                      <p className="text-xs text-blue-700 mt-1">
                        Email: <span className="font-semibold">{user.email}</span>{user.teacherId ? ` • ID: ${user.teacherId}` : ''}{(user.subjects || []).length > 0 ? ` • Subject: ${(user.subjects || []).join(', ')}` : ''}
                      </p>
                      <p className="text-xs text-blue-700 mt-0.5">
                        Your Classes: <span className="font-semibold">{visibleClassSections.join(', ')}</span> • Total Assigned Students: <span className="font-semibold">{students.length}</span>
                      </p>
                    </div>
                    <button onClick={() => { setActiveTab('students'); setSelectedClassSection(null); }} className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow">View Assigned Classes & Students</button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Classes</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {visibleClassSections.map(clsSec => {
                        const count = students.filter(s => `${s.class}-${s.section}` === clsSec).length;
                        return (
                          <div
                            key={clsSec}
                            onClick={() => { setActiveTab('students'); setSelectedClassSection(clsSec); }}
                            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between"
                          >
                            <div>
                              <h5 className="font-extrabold text-slate-900 text-base">Class {clsSec}</h5>
                              <p className="text-xs text-slate-500 mt-0.5">{count} Assigned Students</p>
                            </div>
                            <span className="text-xs font-bold text-blue-600 flex items-center space-x-1">
                              <span>View</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {user.role === 'parent' && (
                <div className="space-y-6">
                  <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                    <h3 className="font-bold text-amber-900 text-base">Your Registered Children</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {students.filter(s => (user.childrenIds || []).includes(s.id)).map(child => (
                        <div key={child.id} className="p-4 bg-white rounded-xl border border-amber-200 flex items-center space-x-3">
                          {renderStudentIcon(child.gender)}
                          <div>
                            <p className="font-bold text-slate-800">{child.fullName} (Class {child.class}-{child.section})</p>
                            <p className="text-xs text-emerald-600 font-semibold">Today Attendance: Present • Fee: {child.feeStatus}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <span>Send Leave Note or Feedback to Class Teacher</span>
                    </h3>
                    {feedbackSent && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold">
                        ✅ Leave note / feedback successfully delivered to teacher!
                      </div>
                    )}
                    <form onSubmit={handleSendFeedback} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Select Teacher</label>
                        <select value={parentFeedback.teacherName} onChange={e => setParentFeedback({...parentFeedback, teacherName: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl">
                          <option value="Mrs. Vannani Rao">Mrs. Vannani Rao (Maths & Science)</option>
                          <option value="Mr. Rajesh Sharma">Mr. Rajesh Sharma (English & EVS)</option>
                          <option value="Mr. Venkat Rao">Mr. Venkat Rao (Telugu)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Message / Leave Note</label>
                        <textarea required value={parentFeedback.message} onChange={e => setParentFeedback({...parentFeedback, message: e.target.value})} placeholder="Type message..." className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl h-20" />
                      </div>
                      <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow">Send Message to Teacher</button>
                    </form>
                  </div>
                </div>
              )}

              {user.role === 'student' && (() => {
                const me = students[0];
                const myFee = fees[0];
                return (
                  <div className="space-y-6">
                    <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        {renderStudentIcon(me?.gender || 'Male')}
                        <div>
                          <h3 className="font-bold text-emerald-900 text-base">Welcome, {me?.fullName || user.name}</h3>
                          <p className="text-xs text-emerald-700 mt-1">
                            Class: <span className="font-semibold">{me ? `${me.class}-${me.section}` : `${user.class}-${user.section}`}</span> | Roll #{me?.rollNumber || user.rollNumber} | Email: <span className="font-semibold">{me?.email || user.email}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {me && (
                          <button onClick={() => openStudentDetail(me.id)} className="px-3.5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow">View Full Profile</button>
                        )}
                        <button onClick={() => setActiveTab('fees')} className="px-3.5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow">Fee Management</button>
                        <button onClick={() => setActiveTab('results')} className="px-3.5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow">Exam Results</button>
                        <button onClick={() => setActiveTab('timetable')} className="px-3.5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow">Timetable</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <StatCard title="Attendance" value={me ? `${me.attendancePercentage}%` : '—'} icon={<UserCheck className="w-6 h-6 text-emerald-600" />} />
                      <StatCard title="Fee Status" value={myFee ? myFee.status : '—'} icon={<DollarSign className="w-6 h-6 text-amber-600" />} />
                      <StatCard title="Exam Results" value={results.length > 0 ? `${results[0].marksObtained}/${results[0].maxMarks} (${results[0].grade})` : 'Pending'} icon={<Award className="w-6 h-6 text-blue-600" />} />
                    </div>

                    {me && (
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b pb-3">
                          <h4 className="font-bold text-slate-900 text-base">Student Profile Details</h4>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">ID: {me.studentId}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block">Full Name</span>
                            <span className="font-bold text-slate-800">{me.fullName}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block">Class & Section</span>
                            <span className="font-bold text-slate-800">Class {me.class}-{me.section} (Roll #{me.rollNumber})</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block">Login Email ID</span>
                            <span className="font-bold text-blue-600">{me.email}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block">Date of Birth / Gender</span>
                            <span className="font-bold text-slate-800">{me.dob || '—'} • {me.gender}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block">Blood Group</span>
                            <span className="font-bold text-slate-800">{me.bloodGroup || 'O+'}</span>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl">
                            <span className="text-slate-400 block">Parent / Guardian</span>
                            <span className="font-bold text-slate-800">{me.parentName} ({me.parentPhone})</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {stats && user.role === 'admin' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">School Administration Quick Actions</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Manage student admissions, faculty records, and school announcements.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openAddStudentModal()}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2 transition"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>+ Add Student</span>
                      </button>
                      <button
                        onClick={() => setShowAddTeacher(true)}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2 transition"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Teacher</span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <StatCard title="Total Students" value={stats.totalStudents} icon={<Users className="w-6 h-6 text-blue-600" />} />
                    <StatCard title="Total Teachers" value={teachers.length} icon={<UserCheck className="w-6 h-6 text-indigo-600" />} />
                    <StatCard title="Total Classes" value={stats.totalClasses} icon={<Building className="w-6 h-6 text-emerald-600" />} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STUDENTS TAB (Role-scoped Class Sections) */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              {!selectedClassSection ? (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-xs text-slate-500 font-semibold">
                      {user.role === 'teacher'
                        ? `Your Assigned Classes (${visibleClassSections.join(', ')}):`
                        : 'Select Class & Section (1st to 5th Grade, Section A & B):'}
                    </p>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => openAddStudentModal()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1.5 w-fit transition"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>+ Add Student</span>
                      </button>
                    )}
                  </div>
                  <div className={`grid grid-cols-1 sm:grid-cols-2 ${visibleClassSections.length <= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-5'} gap-4`}>
                    {visibleClassSections.map(clsSec => {
                      const count = students.filter(s => `${s.class}-${s.section}` === clsSec).length;
                      return (
                        <div key={clsSec} onClick={() => setSelectedClassSection(clsSec)} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-3">
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-base">Class {clsSec}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{count} Students</p>
                          </div>
                          <span className="text-xs font-bold text-blue-600 flex items-center space-x-1"><span>View Students</span><ArrowRight className="w-3.5 h-3.5" /></span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
                    <button onClick={() => setSelectedClassSection(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">
                      {user.role === 'teacher' ? '← Back to Assigned Classes' : '← Back to All Classes'}
                    </button>
                    <h3 className="font-bold text-slate-900 text-base">Class {selectedClassSection} Students</h3>
                    {user.role === 'admin' && (
                      <button onClick={() => openAddStudentModal(selectedClassSection)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow">
                        + Add Student
                      </button>
                    )}
                  </div>

                  <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder={`Search student name or roll # in ${selectedClassSection}...`} 
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {students.filter(st => `${st.class}-${st.section}` === selectedClassSection).filter(st => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return st.fullName.toLowerCase().includes(q) || String(st.rollNumber).includes(q);
                    }).map(st => (
                      <div key={st.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex items-center space-x-4">
                          {renderStudentIcon(st.gender)}
                          <div>
                            <h4 className="font-bold text-slate-900 text-base">{st.fullName}</h4>
                            <p className="text-xs text-blue-600 font-semibold">Roll #{st.rollNumber} • Class {st.class}-{st.section}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                          <p className="text-slate-600">Email: <span className="font-semibold text-slate-800">{st.email}</span></p>
                          <p className="text-slate-600">Parent: <span className="font-semibold">{st.parentName}</span> ({st.parentPhone})</p>
                          <p className="text-slate-600">Attendance: <span className="font-bold text-emerald-600">{st.attendancePercentage}%</span></p>
                        </div>
                        {(user.role === 'admin' || user.role === 'teacher') && (
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleMarkAttendance(st.id, 'Present')} className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded-lg transition">
                              ✓ Present
                            </button>
                            <button onClick={() => handleMarkAttendance(st.id, 'Absent')} className="flex-1 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[11px] rounded-lg transition">
                              ✕ Absent
                            </button>
                            {user.role === 'admin' && (
                              <button onClick={() => handleDeleteStudent(st.id)} title="Remove Student" className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                        <button onClick={() => openStudentDetail(st.id)} className="w-full py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-100 transition">
                          View Student Profile
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TEACHERS TAB (Expanded Faculty with Add Teacher) */}
          {activeTab === 'teachers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Total Faculty & Teachers Directory ({teachers.length} Members)</h3>
                  <p className="text-xs text-slate-500">Covering Telugu, Hindi, English, Mathematics, Science, Social Studies, Computer Science, Arts, and Sports.</p>
                </div>
                {user.role === 'admin' && (
                  <button onClick={() => setShowAddTeacher(true)} className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow">+ Add Teacher</button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers.map(t => (
                  <div key={t.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">👨‍🏫</div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{t.name}</h4>
                          <p className="text-xs text-indigo-600 font-semibold">{t.designation} • {t.subject}</p>
                        </div>
                      </div>
                      {user.role === 'admin' && t.id !== 't1' && (
                        <button onClick={() => handleDeleteTeacher(t.id)} title="Remove Teacher" className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                      <p className="text-slate-600">Email: <span className="font-semibold text-indigo-700">{t.email}</span></p>
                      <p className="text-slate-600">Qualification: <span className="font-semibold">{t.qualification}</span></p>
                      <p className="text-slate-600">Experience: <span className="font-semibold">{t.experience}</span></p>
                      <p className="text-slate-600">Phone: <span className="font-semibold">{t.phone}</span></p>
                      {Array.isArray(t.assignedClasses) && t.assignedClasses.length > 0 && (
                        <p className="text-slate-600">Assigned Classes: <span className="font-semibold">{t.assignedClasses.join(', ')}</span></p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MY CHILDREN TAB */}
          {activeTab === 'my_children' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {students.filter(s => (user.childrenIds || []).includes(s.id)).map(child => (
                  <div key={child.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center space-x-4">
                      {renderStudentIcon(child.gender)}
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">{child.fullName}</h4>
                        <p className="text-xs text-amber-700 font-semibold">Class {child.class}-{child.section} • Roll #{child.rollNumber}</p>
                      </div>
                    </div>
                    <button onClick={() => openStudentDetail(child.id)} className="w-full py-2.5 bg-amber-600 text-white font-bold text-xs rounded-xl shadow">
                      View Details & Report Card
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FEES TAB */}
          {activeTab === 'fees' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="font-bold text-slate-800 text-base">
                  {user.role === 'teacher' ? `Fee Management — Assigned Classes (${visibleClassSections.join(', ')})` : 'Fee Management by Class & Section'}
                </h3>
                {user.role === 'teacher' && (
                  <span className="text-xs font-semibold text-blue-600">{visibleFees.length} Assigned Students</span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b text-slate-400">
                      <th className="pb-3">Student Name</th>
                      <th className="pb-3">Class</th>
                      <th className="pb-3">Total Fee</th>
                      <th className="pb-3">Paid</th>
                      <th className="pb-3">Status</th>
                      {user.role === 'admin' && <th className="pb-3 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {visibleFees.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50">
                        <td className="py-3 font-bold text-slate-800">{f.studentName}</td>
                        <td className="py-3 text-slate-600">{f.class}</td>
                        <td className="py-3 font-semibold">₹{f.totalAmount.toLocaleString()}</td>
                        <td className="py-3 font-semibold text-emerald-600">₹{f.paidAmount.toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${f.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {f.status}
                          </span>
                        </td>
                        {user.role === 'admin' && (
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleToggleFeeStatus(f)}
                              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                                f.status === 'Paid' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                              }`}
                            >
                              {f.status === 'Paid' ? 'Mark Pending' : 'Mark Paid'}
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EXAMINATIONS & RESULTS */}
          {activeTab === 'results' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-bold text-slate-800 text-base">
                  {user.role === 'teacher' ? `Examinations & Report Cards — Assigned Classes (${visibleClassSections.join(', ')})` : 'Examinations & Report Cards'}
                </h3>
                {(user.role === 'admin' || user.role === 'teacher') && students.length > 0 && (
                  <button
                    onClick={() => {
                      setNewResult({ studentId: students[0]?.id || '', subject: 'Mathematics', marksObtained: '90', maxMarks: '100', remarks: 'Very good progress' });
                      setShowAddResult(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow w-fit"
                  >
                    + Add Exam Result
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {visibleClassSections.map(clsSec => {
                  const classResults = results.filter(r => r.class === clsSec);
                  return (
                    <div key={clsSec} className="border rounded-2xl p-4 space-y-3 bg-slate-50">
                      <h4 className="font-bold text-blue-600 text-sm">Class {clsSec} Results</h4>
                      {classResults.length === 0 ? (
                        <p className="text-xs text-slate-400">No results published for Class {clsSec} yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {classResults.map(r => (
                            <div key={r.id} className="p-3 bg-white rounded-xl flex items-center justify-between text-xs border">
                              <div>
                                <span className="font-bold text-slate-800">{r.studentName}</span>
                                <p className="text-xs text-slate-500">Subject: {r.subject} • {r.remarks}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-blue-600">{r.marksObtained}/{r.maxMarks}</span>
                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-xs">Grade {r.grade}</span>
                                {(user.role === 'admin' || user.role === 'teacher') && (
                                  <button onClick={() => handleDeleteResult(r.id)} title="Delete Result" className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TIMETABLES TAB (Role-scoped Class Sections) */}
          {activeTab === 'timetable' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-800 text-base">
                {user.role === 'teacher'
                  ? `Class Timetables — Assigned Classes (${visibleClassSections.join(', ')})`
                  : user.role === 'student' || user.role === 'parent'
                  ? 'Class Timetable'
                  : 'Class Timetables (1st to 5th Grade, Section A & B)'}
              </h3>
              <div className="space-y-6">
                {visibleTimetables.map(tt => (
                  <div key={tt.id} className="border rounded-2xl p-4 space-y-3 bg-slate-50">
                    <h4 className="font-bold text-blue-600 text-sm">Class {tt.class} Timetable</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                      {tt.schedule.map((sch: any, idx: number) => (
                        <div key={idx} className="p-3 bg-white rounded-xl border space-y-2 text-xs">
                          <span className="font-bold text-slate-800 block border-b pb-1">{sch.day}</span>
                          <ul className="space-y-1 text-slate-600">
                            {sch.periods.map((p: string, pIdx: number) => (
                              <li key={pIdx}>🏛️ {p}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTICES TAB */}
          {activeTab === 'notices' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-base">School Notices & Events</h3>
                  {user.role === 'admin' && (
                    <button onClick={() => setShowAddEvent(true)} className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow">+ Add Event</button>
                  )}
                </div>
                <div className="space-y-4">
                  {notices.map(n => (
                    <div key={n.id} className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-base">{n.title}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded-lg font-bold">{n.category}</span>
                          {user.role === 'admin' && (
                            <button onClick={() => handleDeleteNotice(n.id)} title="Delete Notice" className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{n.description}</p>
                      <p className="text-xs text-slate-400">Published on {n.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              {(user.role === 'admin' || user.role === 'teacher') && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-base">Parent Leave Notes & Feedback ({feedbackList.length})</h3>
                  {feedbackList.length === 0 ? (
                    <p className="text-xs text-slate-400">No parent messages received yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {feedbackList.map(fb => (
                        <div key={fb.id} className="p-4 bg-amber-50/50 rounded-xl border border-amber-100 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{fb.sender} → {fb.teacherName}</span>
                            <span className="text-slate-400">{fb.date}</span>
                          </div>
                          <p className="text-slate-700">{fb.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {user.role === 'admin' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-base">Admission Inquiries ({inquiries.length})</h3>
                  {inquiries.length === 0 ? (
                    <p className="text-xs text-slate-400">No admission inquiries submitted from the website yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {inquiries.map(inq => (
                        <div key={inq.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900">{inq.name} • {inq.phone} ({inq.email})</p>
                            <p className="text-slate-600">{inq.message}</p>
                            <p className="text-slate-400">Submitted on {inq.date}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2.5 py-1 rounded-full font-bold ${inq.status === 'Contacted' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{inq.status}</span>
                            {inq.status !== 'Contacted' && (
                              <button onClick={() => handleUpdateInquiryStatus(inq.id, 'Contacted')} className="px-3 py-1.5 bg-slate-900 text-white font-bold rounded-lg">
                                Mark Contacted
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ADD STUDENT MODAL */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-extrabold text-slate-900">Add New Student</h3>
              <button onClick={() => setShowAddStudent(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Student Full Name</label>
                  <input type="text" required value={newStudent.fullName} onChange={e => setNewStudent({...newStudent, fullName: e.target.value})} placeholder="e.g. Aarav Sharma" className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email ID</label>
                  <input type="text" inputMode="email" required value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} placeholder="e.g. aarav@ashivam.edu" className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl" />
                  <p className="text-[11px] text-slate-400 mt-1">Default student login password: <span className="font-semibold text-slate-600">student123</span></p>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input type="date" required value={newStudent.dob} onChange={e => setNewStudent({...newStudent, dob: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select value={newStudent.gender} onChange={e => setNewStudent({...newStudent, gender: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl">
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class Grade</label>
                  <select value={newStudent.class} onChange={e => setNewStudent({...newStudent, class: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl">
                    <option value="1st">1st Grade</option>
                    <option value="2nd">2nd Grade</option>
                    <option value="3rd">3rd Grade</option>
                    <option value="4th">4th Grade</option>
                    <option value="5th">5th Grade</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section</label>
                  <select value={newStudent.section} onChange={e => setNewStudent({...newStudent, section: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl">
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Name</label>
                  <input type="text" required value={newStudent.parentName} onChange={e => setNewStudent({...newStudent, parentName: e.target.value})} placeholder="Mr. Rajesh" className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Phone</label>
                  <input type="text" required value={newStudent.parentPhone} onChange={e => setNewStudent({...newStudent, parentPhone: e.target.value})} placeholder="+91 98765 43210" className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setShowAddStudent(false)} className="px-5 py-2.5 bg-slate-200 font-bold rounded-xl text-slate-700">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TEACHER MODAL */}
      {showAddTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-extrabold text-slate-900">Add New Teacher</h3>
              <button onClick={() => setShowAddTeacher(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreateTeacher} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teacher Full Name</label>
                <input type="text" required value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})} placeholder="e.g. Mrs. Lakshmi" className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email ID</label>
                <input type="text" inputMode="email" required value={newTeacher.email} onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} placeholder="e.g. lakshmi@ashivam.edu" className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl" />
                <p className="text-[11px] text-slate-400 mt-1">Default teacher login password: <span className="font-semibold text-slate-600">teacher123</span></p>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <select value={newTeacher.subject} onChange={e => setNewTeacher({...newTeacher, subject: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl">
                  <option value="Telugu">Telugu</option>
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="Social Studies">Social Studies</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Arts & Crafts">Arts & Crafts</option>
                  <option value="Physical Education">Physical Education</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input type="text" required value={newTeacher.phone} onChange={e => setNewTeacher({...newTeacher, phone: e.target.value})} placeholder="+91 98765 11111" className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-2">Assign Classes</label>
                <div className="grid grid-cols-5 gap-2">
                  {allClassSections.map(clsSec => {
                    const checked = newTeacher.assignedClasses.includes(clsSec);
                    return (
                      <button
                        type="button"
                        key={clsSec}
                        onClick={() => {
                          const updated = checked
                            ? newTeacher.assignedClasses.filter(c => c !== clsSec)
                            : [...newTeacher.assignedClasses, clsSec];
                          setNewTeacher({ ...newTeacher, assignedClasses: updated });
                        }}
                        className={`py-1.5 px-2 rounded-lg border font-bold text-[11px] transition ${
                          checked ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {clsSec}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setShowAddTeacher(false)} className="px-5 py-2.5 bg-slate-200 font-bold rounded-xl text-slate-700">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow">Save Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD EVENT MODAL */}
      {showAddEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-extrabold text-slate-900">Add School Event / Notice</h3>
              <button onClick={() => setShowAddEvent(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Title</label>
                <input type="text" required value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="Science Fair" className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea required value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} placeholder="Details..." className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl h-20" />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setShowAddEvent(false)} className="px-5 py-2.5 bg-slate-200 font-bold rounded-xl text-slate-700">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow">Publish Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD EXAM RESULT MODAL */}
      {showAddResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-extrabold text-slate-900">Publish Exam Result</h3>
              <button onClick={() => setShowAddResult(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreateResult} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Student</label>
                <select required value={newResult.studentId} onChange={e => setNewResult({...newResult, studentId: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl">
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.fullName} (Class {s.class}-{s.section}, Roll #{s.rollNumber})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <select value={newResult.subject} onChange={e => setNewResult({...newResult, subject: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl">
                    <option value="Telugu">Telugu</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Social">Social</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marks Obtained (out of 100)</label>
                  <input type="number" min="0" max="100" required value={newResult.marksObtained} onChange={e => setNewResult({...newResult, marksObtained: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remarks</label>
                <input type="text" required value={newResult.remarks} onChange={e => setNewResult({...newResult, remarks: e.target.value})} className="w-full px-3 py-2.5 bg-slate-50 border rounded-xl" />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setShowAddResult(false)} className="px-5 py-2.5 bg-slate-200 font-bold rounded-xl text-slate-700">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow">Save Result</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT PROFILE MODAL */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-4">
                {renderStudentIcon(selectedStudentDetail.student.gender)}
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">{selectedStudentDetail.student.fullName}</h3>
                  <p className="text-xs text-blue-600 font-bold">Roll #{selectedStudentDetail.student.rollNumber} • Class {selectedStudentDetail.student.class}-{selectedStudentDetail.student.section}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudentDetail(null)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Attendance</span>
                <span className="font-bold text-emerald-600 text-sm">{selectedStudentDetail.student.attendancePercentage}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Parent Phone</span>
                <span className="font-bold text-slate-800 text-sm">{selectedStudentDetail.student.parentPhone}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block">Fee Status</span>
                <span className="font-bold text-blue-600 text-sm">{selectedStudentDetail.student.feeStatus}</span>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t">
              <button onClick={() => handleDownloadReportCard(selectedStudentDetail)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Download Report Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: any; icon: any }) {
  return (
    <div className="p-6 rounded-2xl border bg-white shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase">{title}</p>
        <p className="text-3xl font-extrabold text-slate-900 mt-2">{value}</p>
      </div>
      <div className="w-12 h-12 bg-slate-50 rounded-xl shadow-sm flex items-center justify-center">{icon}</div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition text-xs ${active ? 'bg-blue-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
