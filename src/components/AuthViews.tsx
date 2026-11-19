import React, { useState } from 'react';
import {
  Shield, UserCheck, Award, Users,
  ArrowRight, ArrowLeft, Eye, EyeOff, AlertCircle, Building
} from 'lucide-react';
import { UserRole } from '../types';
import { PORTAL_SCHOOL_BUILDING, PORTAL_THEMES } from '../portalVisuals';

interface LoginSelectionPageProps {
  onSelectRole: (role: UserRole) => void;
  onBack: () => void;
}

const ROLE_ORDER: UserRole[] = ['admin', 'teacher', 'student', 'parent'];

function getRoleIcon(role: UserRole) {
  switch (role) {
    case 'admin':
      return <Shield className="w-5 h-5 text-[#EC483E]" />;
    case 'teacher':
      return <UserCheck className="w-5 h-5 text-[#d99b08]" />;
    case 'student':
      return <Award className="w-5 h-5 text-blue-700" />;
    case 'parent':
      return <Users className="w-5 h-5 text-emerald-700" />;
  }
}

function CampusImage({
  src,
  alt,
  className,
  fallbackLabel
}: {
  src: string;
  alt: string;
  className: string;
  fallbackLabel: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-[#3D4B56] to-[#24303C] flex flex-col items-center justify-center p-4 text-center">
        <Building className="w-7 h-7 text-[#F6C33B] mb-1.5" />
        <span className="text-xs font-semibold text-white">{fallbackLabel}</span>
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

export function LoginSelectionPage({ onSelectRole, onBack }: LoginSelectionPageProps) {
  const [hoveredRole, setHoveredRole] = useState<UserRole>('admin');
  const activeTheme = PORTAL_THEMES[hoveredRole];

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-slate-600 hover:text-[#EC483E] inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Campus</span>
          </button>

          <span className="text-base font-extrabold tracking-tight text-slate-900 inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <img
              src="/assets/aistudio/company_logo_c387ba1a.jpeg"
              alt="Ashivam Technologies Logo"
              referrerPolicy="no-referrer"
              onError={e => {
                e.currentTarget.style.display = 'none';
              }}
              className="h-9 w-auto object-contain"
            />
            <span>ASHIVAM TECH</span>
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left Column: All 4 School Portals stacked cleanly */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#EC483E]">
                ASHIVAM TECH Academic Portals
              </p>
              <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-slate-900">
                Choose your school portal
              </h1>
              <p className="text-sm text-slate-600 max-w-lg">
                Select Admin, Teacher, Student, or Parent access to enter your dedicated primary school workspace.
              </p>
            </div>

            <div className="space-y-3">
              {ROLE_ORDER.map(roleKey => {
                const info = PORTAL_THEMES[roleKey];
                const isHighlighted = hoveredRole === roleKey;
                return (
                  <button
                    type="button"
                    key={roleKey}
                    onMouseEnter={() => setHoveredRole(roleKey)}
                    onFocus={() => setHoveredRole(roleKey)}
                    onClick={() => onSelectRole(roleKey)}
                    className={`w-full text-left bg-white p-4 sm:p-5 rounded-sm border transition-all duration-150 flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EC483E] ${
                      isHighlighted
                        ? 'border-[#EC483E] shadow-md translate-x-0.5'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-sm bg-[#F7F8FA] border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                        {getRoleIcon(roleKey)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900">{info.title}</h2>
                          <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">· {info.wing}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{info.desc}</p>
                      </div>
                    </div>
                    <span className="w-9 h-9 rounded-sm bg-[#F7F8FA] border border-slate-200 flex items-center justify-center text-[#EC483E] shrink-0">
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Primary School Campus Building & Portal Wing Visual Showcase */}
          <div className="lg:col-span-6 flex">
            <div className="relative w-full min-h-[380px] lg:min-h-[560px] rounded-sm overflow-hidden border border-slate-300 bg-[#2C3A47] shadow-md flex flex-col">
              <CampusImage
                src={PORTAL_SCHOOL_BUILDING}
                alt="ASHIVAM TECH Primary School Architectural Building Campus"
                fallbackLabel="ASHIVAM TECH Main Campus"
                className="absolute inset-0 w-full h-full object-cover opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-[#1E293B]/85 to-[#2C3A47]/70" />

              <div className="relative z-10 flex-1 flex flex-col justify-between p-6 sm:p-7 gap-5 text-white">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#F6C33B]">
                    <Building className="w-3.5 h-3.5 shrink-0" />
                    <span>Green Valley Main Campus</span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-300 truncate">
                    {activeTheme.wing}
                  </span>
                </div>

                {/* Unobstructed Campus Building & Active Wing Image Showcase */}
                <div className="grid grid-cols-12 gap-3 items-stretch">
                  <div className="col-span-7 h-52 sm:h-64 rounded-sm overflow-hidden border border-white/20 bg-[#3D4B56] shadow-sm relative">
                    <CampusImage
                      src={PORTAL_SCHOOL_BUILDING}
                      alt="ASHIVAM TECH Primary School Main Campus Building"
                      fallbackLabel="Main Campus Building"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="col-span-5 h-52 sm:h-64 rounded-sm overflow-hidden border border-white/20 bg-[#3D4B56] shadow-sm relative">
                    <CampusImage
                      key={hoveredRole}
                      src={activeTheme.bgImage}
                      alt={`${activeTheme.title} — ${activeTheme.wing}`}
                      fallbackLabel={activeTheme.title}
                      className="w-full h-full object-cover transition-opacity duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#F6C33B]">
                    {activeTheme.wing}
                  </p>
                  <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white leading-snug">
                    {activeTheme.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg">
                    {activeTheme.desc}
                  </p>
                  <div className="pt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-200">
                    {activeTheme.highlights.map(item => (
                      <span key={item} className="inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-[#EC483E] inline-block shrink-0" />
                        <span>{item}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface LoginFormProps {
  selectedRole: UserRole;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  loginError: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onQuickFill: (role: UserRole) => void;
  onBack: () => void;
}

export function LoginForm({
  selectedRole,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loginError,
  loading,
  onSubmit,
  onQuickFill,
  onBack
}: LoginFormProps) {
  const theme = PORTAL_THEMES[selectedRole];

  return (
    <div className="min-h-screen relative flex flex-col bg-[#2C3A47]">
      {/* Role-Specific Full-Bleed Architectural / Interior Background */}
      <CampusImage
        key={`bg-${selectedRole}`}
        src={theme.bgImage}
        alt={`${theme.title} Campus Interior`}
        fallbackLabel={theme.title}
        className="fixed inset-0 w-full h-full object-cover z-0"
      />
      <div className="fixed inset-0 bg-[#1E293B]/75 backdrop-blur-[2px] z-0" />

      <header className="relative z-20 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-slate-600 hover:text-[#EC483E] inline-flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Portals</span>
          </button>

          <span className="text-base font-extrabold tracking-tight text-slate-900 inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <img
              src="/assets/aistudio/company_logo_c387ba1a.jpeg"
              alt="Ashivam Technologies Logo"
              referrerPolicy="no-referrer"
              onError={e => {
                e.currentTarget.style.display = 'none';
              }}
              className="h-9 w-auto object-contain"
            />
            <span>ASHIVAM TECH</span>
          </span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center py-10 px-4 sm:px-6">
        <div className="max-w-4xl w-full bg-white rounded-sm shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 border border-white/20">
          {/* Left Showcase Panel inside Card showing role scene & campus info */}
          <div className="md:col-span-5 relative min-h-[220px] md:min-h-full bg-[#2C3A47] text-white flex flex-col justify-between p-6 sm:p-8 overflow-hidden">
            <CampusImage
              key={`panel-${selectedRole}`}
              src={theme.bgImage}
              alt={theme.wing}
              fallbackLabel={theme.wing}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/95 via-[#1E293B]/65 to-[#1E293B]/35" />

            <div className="relative z-10 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-sm bg-white flex items-center justify-center shadow-sm">
                {getRoleIcon(selectedRole)}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F6C33B]">
                {theme.wing}
              </span>
            </div>

            <div className="relative z-10 space-y-2.5 mt-12">
              <h2 className="font-editorial text-2xl font-bold text-white leading-snug">
                {theme.title}
              </h2>
              <p className="text-xs text-slate-200 leading-relaxed">
                {theme.desc}
              </p>
              <div className="pt-2 space-y-1 text-[11px] text-slate-200">
                {theme.highlights.map(item => (
                  <p key={item} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#F6C33B] inline-block shrink-0" />
                    <span>{item}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="md:col-span-7 p-6 sm:p-8 space-y-6 bg-white">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[#EC483E]">{selectedRole} Authentication</p>
              <h1 className="font-editorial text-2xl font-bold text-slate-900 capitalize">
                Sign in to {selectedRole} Portal
              </h1>
            </div>

            {/* Interactive Role Switcher Segmented Control */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">Quick-fill demo role</p>
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-sm">
                {ROLE_ORDER.map(role => (
                  <button
                    type="button"
                    key={role}
                    onClick={() => onQuickFill(role)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-sm capitalize transition-colors whitespace-nowrap ${
                      selectedRole === role
                        ? 'bg-[#F6C33B] text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {selectedRole === 'student' && (
              <div className="p-3.5 bg-[#F7F8FA] border border-slate-200 rounded-sm text-xs text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900">Student Multi-Email Login</p>
                <p>
                  Every student signs in with their own email (such as <span className="font-mono text-slate-900">kavya@ashivam.edu</span> or <span className="font-mono text-slate-900">sai@gmail.com</span>) and the shared password <span className="font-mono font-semibold text-slate-900">student123</span>.
                </p>
              </div>
            )}

            {selectedRole === 'teacher' && (
              <div className="p-3.5 bg-[#F7F8FA] border border-slate-200 rounded-sm text-xs text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900">Teacher Multi-Email Login</p>
                <p>
                  Every faculty member uses their own email (such as <span className="font-mono text-slate-900">vannani@ashivam.edu</span> or <span className="font-mono text-slate-900">venkat@ashivam.edu</span>) and the shared password <span className="font-mono font-semibold text-slate-900">teacher123</span>.
                </p>
              </div>
            )}

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email ID
                </label>
                <input
                  id="login-email"
                  type="text"
                  inputMode="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={
                    selectedRole === 'student'
                      ? 'e.g. sai@gmail.com'
                      : selectedRole === 'teacher'
                        ? 'e.g. vannani@ashivam.edu'
                        : 'e.g. admin@ashivam.edu'
                  }
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-sm text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#EC483E] focus:border-[#EC483E]"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-sm text-sm text-slate-900 pr-10 focus:outline-none focus:ring-2 focus:ring-[#EC483E] focus:border-[#EC483E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#EC483E] hover:bg-[#d9382e] disabled:opacity-60 text-white font-semibold rounded-sm transition-colors text-sm"
              >
                {loading ? 'Signing in...' : `Sign in to ${selectedRole} portal`}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
