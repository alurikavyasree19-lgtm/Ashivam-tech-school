import React from 'react';
import {
  GraduationCap, Shield, UserCheck, Award, Users,
  ArrowRight, ArrowLeft, Eye, EyeOff, AlertCircle
} from 'lucide-react';
import { UserRole } from '../types';

interface LoginSelectionPageProps {
  onSelectRole: (role: UserRole) => void;
  onBack: () => void;
}

const ROLES: {
  role: UserRole;
  title: string;
  desc: string;
  icon: React.ReactNode;
  accent: string;
}[] = [
  {
    role: 'admin',
    title: 'Admin Portal',
    desc: 'Manage students, faculty, timetables, fees, admissions, and SQLite database.',
    icon: <Shield className="w-5 h-5 text-blue-700" />,
    accent: 'hover:border-blue-600'
  },
  {
    role: 'teacher',
    title: 'Teacher Portal',
    desc: 'View assigned sections, mark daily attendance, and publish exam marks.',
    icon: <UserCheck className="w-5 h-5 text-indigo-700" />,
    accent: 'hover:border-indigo-600'
  },
  {
    role: 'student',
    title: 'Student Portal',
    desc: 'Check profile, attendance %, fee status, exam grades, and weekly timetable.',
    icon: <Award className="w-5 h-5 text-emerald-700" />,
    accent: 'hover:border-emerald-600'
  },
  {
    role: 'parent',
    title: 'Parent Portal',
    desc: 'Track child progress, report cards, fee ledger, and message class teachers.',
    icon: <Users className="w-5 h-5 text-amber-700" />,
    accent: 'hover:border-amber-600'
  }
];

export function LoginSelectionPage({ onSelectRole, onBack }: LoginSelectionPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-slate-600 hover:text-slate-950 inline-flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Campus</span>
          </button>

          <span className="text-base font-extrabold tracking-tight text-slate-900 inline-flex items-center gap-2 whitespace-nowrap shrink-0">
            <GraduationCap className="w-5 h-5 text-blue-700" />
            <span>ASHIVAM TECH ERP</span>
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="max-w-5xl w-full space-y-10">
          <div className="space-y-2 max-w-xl">
            <p className="text-xs font-semibold text-blue-700">Role-Based Access</p>
            <h1 className="text-3xl font-extrabold text-slate-900">Select your school portal</h1>
            <p className="text-sm text-slate-600">
              Choose your account role below to sign in with your registered school email address.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ROLES.map(item => (
              <button
                type="button"
                key={item.role}
                onClick={() => onSelectRole(item.role)}
                className={`text-left bg-white p-6 rounded-xl border border-slate-200 ${item.accent} transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between space-y-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600`}
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
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
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-slate-600 hover:text-slate-950 inline-flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Portals</span>
          </button>

          <span className="text-base font-extrabold tracking-tight text-slate-900 inline-flex items-center gap-2 whitespace-nowrap shrink-0">
            <GraduationCap className="w-5 h-5 text-blue-700" />
            <span>ASHIVAM TECH ERP</span>
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl shadow-sm p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-blue-700 capitalize">{selectedRole} Authentication</p>
            <h1 className="text-2xl font-extrabold text-slate-900 capitalize">
              Sign in to {selectedRole} Portal
            </h1>
          </div>

          {/* Interactive Role Switcher Segmented Control */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500">Quick-fill demo role</p>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg">
              {(['admin', 'teacher', 'student', 'parent'] as UserRole[]).map(role => (
                <button
                  type="button"
                  key={role}
                  onClick={() => onQuickFill(role)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-md capitalize transition-colors whitespace-nowrap ${
                    selectedRole === role
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {selectedRole === 'student' && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-1">
              <p className="font-semibold text-slate-900">Student Multi-Email Login</p>
              <p>
                Every student signs in with their own email (such as <span className="font-mono text-slate-900">kavya@ashivam.edu</span> or <span className="font-mono text-slate-900">sai@gmail.com</span>) and the shared password <span className="font-mono font-semibold text-slate-900">student123</span>.
              </p>
            </div>
          )}

          {selectedRole === 'teacher' && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-1">
              <p className="font-semibold text-slate-900">Teacher Multi-Email Login</p>
              <p>
                Every faculty member uses their own email (such as <span className="font-mono text-slate-900">vannani@ashivam.edu</span> or <span className="font-mono text-slate-900">venkat@ashivam.edu</span>) and the shared password <span className="font-mono font-semibold text-slate-900">teacher123</span>.
              </p>
            </div>
          )}

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
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
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
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
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
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
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {loading ? 'Signing in...' : `Sign in to ${selectedRole} portal`}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
