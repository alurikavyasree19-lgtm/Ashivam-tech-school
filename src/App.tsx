import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Users, UserCheck, Calendar,
  DollarSign, Bell, Award, Search, LogOut, Menu, X,
  CheckCircle, AlertCircle, ArrowRight, Trash2, Edit,
  Building, PieChart, UserPlus, CalendarPlus, MessageSquare,
  Database, BookOpen
} from 'lucide-react';
import LandingPage from './components/LandingPage';
import { LoginSelectionPage, LoginForm } from './components/AuthViews';
import DatabaseLab from './components/DatabaseLab';
import { PORTAL_THEMES } from './portalVisuals';
import {
  StudentFormModal,
  TeacherFormModal,
  AddEventModal,
  AddResultModal,
  EditTimetableModal,
  StudentDetailModal
} from './components/DashboardModals';
import {
  ALL_CLASS_SECTIONS,
  AuthUser,
  ExamResult,
  FeeRecord,
  FeedbackItem,
  Inquiry,
  Notice,
  Student,
  Teacher,
  Timetable,
  ToastMessage,
  UserRole
} from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('ashivam_token'));
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('ashivam_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      localStorage.removeItem('ashivam_user');
      return null;
    }
  });
  const [currentView, setCurrentView] = useState<'home' | 'login_select' | 'login_form' | 'dashboard'>(
    token && currentUser ? 'dashboard' : 'home'
  );

  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const parseApiResponse = async (res: Response) => {
    const rawText = await res.text();
    try {
      return rawText ? JSON.parse(rawText) : {};
    } catch {
      return { error: rawText || `Server returned status ${res.status}` };
    }
  };

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(async res => {
          const data = await parseApiResponse(res);
          if (res.ok && data.user) {
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
      const data = await parseApiResponse(res);
      if (!res.ok) throw new Error(data.error || `Login failed (HTTP ${res.status})`);

      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('ashivam_token', data.token);
      localStorage.setItem('ashivam_user', JSON.stringify(data.user));
      setCurrentView('dashboard');
    } catch (err: any) {
      setLoginError(err.message || 'Unable to connect to authentication server');
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

  const fillDemoCreds = (role: UserRole) => {
    setSelectedRole(role);
    setLoginError('');
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-700 selection:text-white">
      {currentView === 'home' && (
        <LandingPage onNavigateLogin={() => setCurrentView('login_select')} />
      )}

      {currentView === 'login_select' && (
        <LoginSelectionPage
          onSelectRole={role => {
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

      {currentView === 'dashboard' && currentUser && token && (
        <Dashboard user={currentUser} token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

// ==========================================
// DASHBOARD WORKSPACE
// ==========================================
function Dashboard({ user, token, onLogout }: { user: AuthUser; token: string; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  const [selectedClassSection, setSelectedClassSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [feeFilter, setFeeFilter] = useState<'all' | 'Paid' | 'Pending'>('all');
  const [feeSearch, setFeeSearch] = useState('');
  const [timetableFilter, setTimetableFilter] = useState<string>('all');

  // Modals
  const [studentModalMode, setStudentModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentForm, setStudentForm] = useState({
    fullName: '', email: '', dob: '2016-06-15', gender: 'Female', class: '1st', section: 'A',
    parentName: '', parentEmail: '', parentPhone: '', address: '', bloodGroup: 'O+'
  });

  const [teacherModalMode, setTeacherModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [teacherForm, setTeacherForm] = useState<{
    name: string; designation: string; email: string; phone: string;
    qualification: string; experience: string; subject: string; assignedClasses: string[];
  }>({
    name: '', designation: 'Teacher', email: '', phone: '', qualification: 'M.A., B.Ed.',
    experience: '1 Year', subject: 'Mathematics', assignedClasses: ['3rd-A', '4th-A']
  });

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', category: 'All' });

  const [showAddResult, setShowAddResult] = useState(false);
  const [newResult, setNewResult] = useState({
    studentId: '', subject: 'Mathematics', marksObtained: '90', maxMarks: '100', remarks: 'Very good progress'
  });

  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<any>(null);

  const [parentFeedback, setParentFeedback] = useState({ teacherName: 'Mrs. Vannani Rao', message: '' });
  const [feedbackSent, setFeedbackSent] = useState(false);

  const pushToast = (type: ToastMessage['type'], text: string) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, user?.id, token]);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const reqs: Promise<Response>[] = [
        fetch('/api/stats', { headers }),
        fetch('/api/students', { headers }),
        fetch('/api/teachers', { headers }),
        fetch('/api/fees', { headers }),
        fetch('/api/results', { headers }),
        fetch('/api/notices', { headers }),
        fetch('/api/timetables', { headers }),
        fetch('/api/feedback', { headers })
      ];
      if (user.role === 'admin') {
        reqs.push(fetch('/api/inquiries', { headers }));
      }
      const responses = await Promise.all(reqs);
      if (responses[0].ok) setStats(await responses[0].json());
      if (responses[1].ok) setStudents(await responses[1].json());
      if (responses[2].ok) setTeachers(await responses[2].json());
      if (responses[3].ok) setFees(await responses[3].json());
      if (responses[4].ok) setResults(await responses[4].json());
      if (responses[5].ok) setNotices(await responses[5].json());
      if (responses[6].ok) setTimetables(await responses[6].json());
      if (responses[7].ok) setFeedbackList(await responses[7].json());
      if (user.role === 'admin' && responses[8]?.ok) setInquiries(await responses[8].json());
    } catch (e) {
      console.error(e);
    } finally {
      setDataLoading(false);
    }
  };

  const openAddStudentModal = (clsSec?: string | null) => {
    const [cls, sec] = clsSec && clsSec.includes('-') ? clsSec.split('-') : ['1st', 'A'];
    setEditingStudentId(null);
    setStudentForm({
      fullName: '', email: '', dob: '2016-06-15', gender: 'Female', class: cls, section: sec,
      parentName: '', parentEmail: '', parentPhone: '', address: '', bloodGroup: 'O+'
    });
    setStudentModalMode('create');
  };

  const openEditStudentModal = (st: Student) => {
    setEditingStudentId(st.id);
    setStudentForm({
      fullName: st.fullName,
      email: st.email,
      dob: st.dob || '2016-06-15',
      gender: st.gender,
      class: st.class,
      section: st.section,
      parentName: st.parentName,
      parentEmail: st.parentEmail || '',
      parentPhone: st.parentPhone,
      address: st.address || '',
      bloodGroup: st.bloodGroup || 'O+'
    });
    setStudentModalMode('edit');
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = studentModalMode === 'edit' && editingStudentId;
    const url = isEdit ? `/api/students/${editingStudentId}` : '/api/students';
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(studentForm)
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setStudentModalMode(null);
      await fetchData();
      pushToast(
        'success',
        isEdit
          ? `Updated ${studentForm.fullName}'s profile in SQLite.`
          : `Added ${studentForm.fullName}! Student password is student123.`
      );
    } else {
      pushToast('error', data.error || 'Failed to save student record.');
    }
  };

  const openAddTeacherModal = () => {
    setEditingTeacherId(null);
    setTeacherForm({
      name: '', designation: 'Teacher', email: '', phone: '', qualification: 'M.A., B.Ed.',
      experience: '1 Year', subject: 'Mathematics', assignedClasses: ['3rd-A', '4th-A']
    });
    setTeacherModalMode('create');
  };

  const openEditTeacherModal = (t: Teacher) => {
    setEditingTeacherId(t.id);
    setTeacherForm({
      name: t.name,
      designation: t.designation,
      email: t.email,
      phone: t.phone,
      qualification: t.qualification,
      experience: t.experience,
      subject: t.subject,
      assignedClasses: Array.isArray(t.assignedClasses) ? t.assignedClasses : []
    });
    setTeacherModalMode('edit');
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = teacherModalMode === 'edit' && editingTeacherId;
    const url = isEdit ? `/api/teachers/${editingTeacherId}` : '/api/teachers';
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(teacherForm)
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setTeacherModalMode(null);
      await fetchData();
      pushToast(
        'success',
        isEdit
          ? `Updated ${teacherForm.name}'s assignments.`
          : `Added ${teacherForm.name}! Teacher password is teacher123.`
      );
    } else {
      pushToast('error', data.error || 'Failed to save teacher record.');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newEvent)
    });
    if (res.ok) {
      setShowAddEvent(false);
      setNewEvent({ title: '', description: '', category: 'All' });
      await fetchData();
      pushToast('success', 'School notice published.');
    } else {
      pushToast('error', 'Failed to publish notice.');
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(parentFeedback)
    });
    if (res.ok) {
      setFeedbackSent(true);
      setParentFeedback({ teacherName: 'Mrs. Vannani Rao', message: '' });
      await fetchData();
      pushToast('success', 'Message delivered to teacher.');
      setTimeout(() => setFeedbackSent(false), 4000);
    }
  };

  const handleMarkAttendance = async (studentId: string, status: 'Present' | 'Absent') => {
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ studentId, status })
    });
    if (res.ok) {
      await fetchData();
      pushToast('success', `Marked ${status} and recalculated attendance %.`);
    }
  };

  const handleDeleteStudent = async (st: Student) => {
    const res = await fetch(`/api/students/${st.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      await fetchData();
      pushToast('info', `Removed ${st.fullName} and linked records.`);
    }
  };

  const handleDeleteTeacher = async (t: Teacher) => {
    const res = await fetch(`/api/teachers/${t.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      await fetchData();
      pushToast('info', `Removed ${t.name} from faculty directory.`);
    } else {
      pushToast('error', data.error || 'Could not remove teacher.');
    }
  };

  const handleToggleFeeStatus = async (fee: FeeRecord) => {
    const nextStatus = fee.status === 'Paid' ? 'Pending' : 'Paid';
    const res = await fetch(`/api/fees/${fee.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: nextStatus })
    });
    if (res.ok) {
      await fetchData();
      pushToast('success', `${fee.studentName} marked as ${nextStatus}.`);
    }
  };

  const handleCreateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newResult)
    });
    if (res.ok) {
      setShowAddResult(false);
      setNewResult({ studentId: '', subject: 'Mathematics', marksObtained: '90', maxMarks: '100', remarks: 'Very good progress' });
      await fetchData();
      pushToast('success', 'Exam result saved to database.');
    }
  };

  const handleDeleteResult = async (id: string) => {
    const res = await fetch(`/api/results/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      await fetchData();
      pushToast('info', 'Exam result deleted.');
    }
  };

  const handleDeleteNotice = async (id: string) => {
    const res = await fetch(`/api/notices/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      await fetchData();
      pushToast('info', 'Notice removed.');
    }
  };

  const handleUpdateInquiryStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      await fetchData();
      pushToast('success', 'Inquiry marked as contacted.');
    }
  };

  const handleSaveTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTimetable) return;
    const res = await fetch(`/api/timetables/${editingTimetable.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ schedule: editingTimetable.schedule })
    });
    if (res.ok) {
      setEditingTimetable(null);
      await fetchData();
      pushToast('success', `Updated Class ${editingTimetable.class} timetable.`);
    } else {
      pushToast('error', 'Failed to update timetable.');
    }
  };

  const handleDownloadReportCard = (detail: any) => {
    const st = detail.student;
    const resLines =
      (detail.results || []).length > 0
        ? detail.results
            .map((r: any) => `- ${r.subject}: ${r.marksObtained}/${r.maxMarks} (Grade ${r.grade}) - ${r.remarks}`)
            .join('\n')
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
    const res = await fetch(`/api/students/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setSelectedStudentDetail(await res.json());
  };

  const visibleClassSections: string[] =
    user.role === 'teacher'
      ? (user.assignedClasses || [])
      : user.role === 'student'
        ? [`${user.class}-${user.section}`]
        : user.role === 'parent'
          ? Array.from(new Set(students.filter(s => (user.childrenIds || []).includes(s.id)).map(s => `${s.class}-${s.section}`)))
          : [...ALL_CLASS_SECTIONS];

  const visibleFees =
    user.role === 'teacher'
      ? fees.filter(f => visibleClassSections.includes(f.class))
      : fees;

  const filteredFees = visibleFees.filter(f => {
    if (feeFilter !== 'all' && f.status !== feeFilter) return false;
    if (feeSearch.trim()) {
      const q = feeSearch.toLowerCase();
      return f.studentName.toLowerCase().includes(q) || f.class.toLowerCase().includes(q);
    }
    return true;
  });

  const visibleTimetables =
    user.role === 'teacher'
      ? timetables.filter(tt => visibleClassSections.includes(tt.class))
      : timetables;

  const displayedTimetables =
    timetableFilter === 'all'
      ? visibleTimetables
      : visibleTimetables.filter(tt => tt.class === timetableFilter);

  const tabTitles: Record<string, string> = {
    overview: `${user.role} Dashboard`,
    students: user.role === 'teacher' ? 'Assigned Classes & Students' : 'Classes (1st-A to 5th-B) & Students',
    teachers: 'Faculty & Teachers Directory',
    my_children: 'My Registered Children',
    fees: user.role === 'teacher' ? 'Fee Management (Assigned Students)' : 'Fee Management & Tuition Ledger',
    results: user.role === 'teacher' ? 'Examinations & Results (Assigned Classes)' : 'Examinations & Report Cards',
    timetable: user.role === 'teacher' ? 'Assigned Class Timetables' : 'Class Timetables (Mon–Sat)',
    notices: 'Notices, Events & Inquiries',
    database: 'SQLite Database & SQL Learning Lab'
  };

  const selectTab = (tab: string) => {
    setActiveTab(tab);
    setMobileNavOpen(false);
  };

  const renderSidebarNav = () => (
    <nav className="space-y-1 text-xs font-medium">
      <SidebarItem icon={<PieChart className="w-4 h-4" />} label="Dashboard" active={activeTab === 'overview'} onClick={() => selectTab('overview')} />

      {(user.role === 'admin' || user.role === 'teacher') && (
        <SidebarItem
          icon={<Users className="w-4 h-4" />}
          label={user.role === 'admin' ? 'Classes (1st–5th A&B)' : 'Assigned Classes'}
          active={activeTab === 'students'}
          onClick={() => {
            selectTab('students');
            setSelectedClassSection(null);
          }}
        />
      )}

      {user.role === 'admin' && (
        <>
          <SidebarItem icon={<UserPlus className="w-4 h-4" />} label="Add Student" active={false} onClick={() => { setMobileNavOpen(false); openAddStudentModal(); }} />
          <SidebarItem icon={<UserCheck className="w-4 h-4" />} label="Faculty & Teachers" active={activeTab === 'teachers'} onClick={() => selectTab('teachers')} />
          <SidebarItem icon={<CalendarPlus className="w-4 h-4" />} label="Add Event / Notice" active={false} onClick={() => { setMobileNavOpen(false); setShowAddEvent(true); }} />
        </>
      )}

      {user.role === 'parent' && (
        <SidebarItem icon={<Users className="w-4 h-4" />} label="My Children" active={activeTab === 'my_children'} onClick={() => selectTab('my_children')} />
      )}

      <SidebarItem icon={<DollarSign className="w-4 h-4" />} label="Fee Management" active={activeTab === 'fees'} onClick={() => selectTab('fees')} />
      <SidebarItem icon={<Award className="w-4 h-4" />} label="Examinations & Results" active={activeTab === 'results'} onClick={() => selectTab('results')} />
      <SidebarItem icon={<Calendar className="w-4 h-4" />} label="Class Timetables" active={activeTab === 'timetable'} onClick={() => selectTab('timetable')} />
      <SidebarItem icon={<Bell className="w-4 h-4" />} label="Notices & Events" active={activeTab === 'notices'} onClick={() => selectTab('notices')} />

      {user.role === 'admin' && (
        <div className="pt-3 mt-3 border-t border-slate-800">
          <SidebarItem icon={<Database className="w-4 h-4" />} label="Database & SQL Lab" active={activeTab === 'database'} onClick={() => selectTab('database')} />
        </div>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen flex bg-[#F7F8FA] text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[#2C3A47] text-slate-300 hidden md:flex flex-col justify-between border-r border-[#222D38] shrink-0 sticky top-0 h-screen">
        <div className="p-5 space-y-6 overflow-y-auto">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="h-10 px-2 bg-white rounded-sm flex items-center justify-center shrink-0">
              <img
                src="/assets/aistudio/company_logo_c387ba1a.jpeg"
                alt="Ashivam Technologies Logo"
                referrerPolicy="no-referrer"
                onError={e => {
                  e.currentTarget.style.display = 'none';
                }}
                className="h-8 w-auto object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">ASHIVAM TECH</p>
              <p className="text-[11px] text-[#F6C33B] font-semibold capitalize">{user.role} Portal</p>
            </div>
          </div>

          {renderSidebarNav()}
        </div>

        <div className="p-5 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-[#EC483E] flex items-center justify-center font-bold text-white text-xs shrink-0">
              {user.name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2 bg-[#222D38] hover:bg-[#EC483E] text-slate-200 hover:text-white rounded-sm text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/60" onClick={() => setMobileNavOpen(false)} />
          <aside className="relative z-10 w-64 bg-[#2C3A47] text-slate-300 flex flex-col justify-between p-5 h-full">
            <div className="space-y-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-sm font-bold text-white">ASHIVAM TECH</span>
                <button type="button" onClick={() => setMobileNavOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderSidebarNav()}
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2.5 bg-[#222D38] hover:bg-[#EC483E] text-white rounded-sm text-xs font-semibold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </aside>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Breadcrumb Contract */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="md:hidden p-2 -ml-1 rounded-sm text-slate-700 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500">
                <span>ASHIVAM TECH</span>
                <span>/</span>
                <span className="capitalize text-[#EC483E] font-semibold">{user.role} Portal</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 capitalize truncate">
                {tabTitles[activeTab] || 'Dashboard'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {user.role === 'admin' && (
              <button
                type="button"
                onClick={() => openAddStudentModal(selectedClassSection)}
                className="px-3.5 py-2 bg-[#EC483E] hover:bg-[#d9382e] text-white text-xs font-semibold rounded-sm inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Add Student</span>
              </button>
            )}
            <span className="hidden sm:inline text-xs font-semibold text-slate-700 capitalize whitespace-nowrap">
              {user.name}
            </span>
          </div>
        </header>

        {/* Toast Stack */}
        {toasts.length > 0 && (
          <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm w-full px-4 sm:px-0">
            {toasts.map(t => (
              <div
                key={t.id}
                className={`p-3.5 rounded-sm border shadow-lg text-xs flex items-center justify-between gap-3 ${
                  t.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : t.type === 'info'
                      ? 'bg-[#2C3A47] border-slate-700 text-white'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {t.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
                  <span className="font-medium">{t.text}</span>
                </div>
                <button type="button" onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))} className="opacity-70 hover:opacity-100">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {dataLoading ? (
            <div className="space-y-5">
              <div className="h-44 bg-white border border-slate-200 rounded-sm animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-28 bg-white border border-slate-200 rounded-sm animate-pulse" />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* TEACHER OVERVIEW */}
                  {user.role === 'teacher' && (() => {
                    const avgAttendance =
                      students.length > 0
                        ? (students.reduce((sum, s) => sum + Number(s.attendancePercentage || 0), 0) / students.length).toFixed(1)
                        : '0.0';
                    const roleTheme = PORTAL_THEMES.teacher;

                    return (
                      <div className="space-y-6">
                        <div className="relative rounded-sm overflow-hidden border border-slate-300 bg-[#2C3A47] text-white">
                          <img
                            src={roleTheme.bgImage}
                            alt={roleTheme.wing}
                            referrerPolicy="no-referrer"
                            onError={e => {
                              e.currentTarget.style.display = 'none';
                            }}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-[#1E293B]/95 via-[#1E293B]/80 to-[#1E293B]/55" />
                          <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-2 max-w-2xl">
                              <p className="text-xs font-bold uppercase tracking-wider text-[#F6C33B]">
                                {roleTheme.wing} · Faculty Workspace
                              </p>
                              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white">
                                Welcome back, {user.name}
                              </h2>
                              <p className="text-xs sm:text-sm text-slate-200 tabular-nums">
                                {user.email}
                                {user.teacherId ? ` · Faculty ID ${user.teacherId}` : ''}
                                {(user.subjects || []).length > 0 ? ` · Subject: ${(user.subjects || []).join(', ')}` : ''}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab('students');
                                  setSelectedClassSection(null);
                                }}
                                className="px-4 py-2.5 bg-[#EC483E] hover:bg-[#d9382e] text-white font-semibold text-xs rounded-sm whitespace-nowrap transition-colors"
                              >
                                Mark Attendance & View Classes
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveTab('results')}
                                className="px-4 py-2.5 bg-[#F6C33B] hover:bg-[#ebb62a] text-slate-900 font-bold text-xs rounded-sm whitespace-nowrap transition-colors"
                              >
                                Enter Exam Marks
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                          <StatCard title="Assigned Sections" value={visibleClassSections.length} icon={<Building className="w-5 h-5 text-[#EC483E]" />} />
                          <StatCard title="Assigned Students" value={students.length} icon={<Users className="w-5 h-5 text-blue-700" />} />
                          <StatCard title="Avg Class Attendance" value={`${avgAttendance}%`} icon={<UserCheck className="w-5 h-5 text-emerald-700" />} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-sm p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <h3 className="text-sm font-bold text-slate-900">Your Assigned Classes & Attendance</h3>
                              <span className="text-xs text-slate-500 tabular-nums">{results.length} Exam Records</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {visibleClassSections.map(clsSec => {
                                const clsStudents = students.filter(s => `${s.class}-${s.section}` === clsSec);
                                const clsAvg = clsStudents.length > 0
                                  ? Math.round(clsStudents.reduce((acc, s) => acc + Number(s.attendancePercentage || 0), 0) / clsStudents.length)
                                  : 0;
                                return (
                                  <button
                                    type="button"
                                    key={clsSec}
                                    onClick={() => {
                                      setActiveTab('students');
                                      setSelectedClassSection(clsSec);
                                    }}
                                    className="text-left p-4 bg-[#F7F8FA] hover:bg-white rounded-sm border border-slate-200 hover:border-[#EC483E] transition-colors space-y-3"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <h4 className="font-bold text-slate-900 text-base">Class {clsSec}</h4>
                                        <p className="text-xs text-slate-500 tabular-nums">{clsStudents.length} Students</p>
                                      </div>
                                      <ArrowRight className="w-4 h-4 text-[#EC483E] shrink-0" />
                                    </div>
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-[11px] text-slate-600 tabular-nums">
                                        <span>Attendance Rate</span>
                                        <span className="font-semibold text-slate-900">{clsAvg}%</span>
                                      </div>
                                      <div className="h-1.5 w-full bg-slate-200 rounded-sm overflow-hidden">
                                        <div className="h-full bg-emerald-600" style={{ width: `${Math.min(100, clsAvg)}%` }} />
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-sm p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <h3 className="text-sm font-bold text-slate-900">Recent Parent Notes & Notices</h3>
                              <button type="button" onClick={() => setActiveTab('notices')} className="text-xs font-semibold text-[#EC483E] hover:underline">
                                View all
                              </button>
                            </div>
                            <div className="space-y-3 text-xs">
                              {feedbackList.slice(0, 2).map(fb => (
                                <div key={fb.id} className="p-3 bg-[#F7F8FA] border border-slate-200 rounded-sm space-y-1">
                                  <div className="flex justify-between font-semibold text-slate-900">
                                    <span>From {fb.sender}</span>
                                    <span className="text-slate-400 font-normal tabular-nums">{fb.date}</span>
                                  </div>
                                  <p className="text-slate-600 line-clamp-2">{fb.message}</p>
                                </div>
                              ))}
                              {notices.slice(0, 2).map(n => (
                                <div key={n.id} className="p-3 bg-amber-50/70 border border-amber-200 rounded-sm space-y-1">
                                  <div className="flex justify-between font-semibold text-slate-900">
                                    <span>{n.title}</span>
                                    <span className="text-slate-500 font-normal tabular-nums">{n.date}</span>
                                  </div>
                                  <p className="text-slate-700 line-clamp-2">{n.description}</p>
                                </div>
                              ))}
                              {feedbackList.length === 0 && notices.length === 0 && (
                                <p className="text-slate-500">No recent parent notes or school notices.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* PARENT OVERVIEW */}
                  {user.role === 'parent' && (() => {
                    const children = students.filter(s => (user.childrenIds || []).includes(s.id));
                    const roleTheme = PORTAL_THEMES.parent;

                    return (
                      <div className="space-y-6">
                        <div className="relative rounded-sm overflow-hidden border border-slate-300 bg-[#2C3A47] text-white">
                          <img
                            src={roleTheme.bgImage}
                            alt={roleTheme.wing}
                            referrerPolicy="no-referrer"
                            onError={e => {
                              e.currentTarget.style.display = 'none';
                            }}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-[#1E293B]/95 via-[#1E293B]/80 to-[#1E293B]/55" />
                          <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-2 max-w-2xl">
                              <p className="text-xs font-bold uppercase tracking-wider text-[#F6C33B]">
                                {roleTheme.wing} · Family Connect
                              </p>
                              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white">
                                Welcome, {user.name}
                              </h2>
                              <p className="text-xs sm:text-sm text-slate-200 tabular-nums">
                                Linked Children: <strong>{children.length}</strong> · Active Notices: <strong>{notices.length}</strong>
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setActiveTab('fees')}
                                className="px-4 py-2.5 bg-[#F6C33B] hover:bg-[#ebb62a] text-slate-900 font-bold text-xs rounded-sm whitespace-nowrap transition-colors"
                              >
                                Fee Ledger
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveTab('results')}
                                className="px-4 py-2.5 bg-[#EC483E] hover:bg-[#d9382e] text-white font-semibold text-xs rounded-sm whitespace-nowrap transition-colors"
                              >
                                View Report Cards
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-sm p-6 space-y-4">
                          <h2 className="text-base font-bold text-slate-900">Your Registered Children</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {children.map(child => {
                              const childLatestResult = results.find(r => r.studentId === child.id);
                              return (
                                <div key={child.id} className="p-5 bg-[#F7F8FA] rounded-sm border border-slate-200 space-y-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <h3 className="font-bold text-slate-900 text-base">{child.fullName}</h3>
                                      <p className="text-xs text-slate-600 mt-0.5 tabular-nums">
                                        Class {child.class}-{child.section} · Roll #{child.rollNumber} · ID {child.studentId}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => openStudentDetail(child.id)}
                                      className="px-3.5 py-1.5 bg-[#EC483E] hover:bg-[#d9382e] text-white text-xs font-semibold rounded-sm shrink-0 transition-colors"
                                    >
                                      Report Card
                                    </button>
                                  </div>

                                  <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs text-slate-600 tabular-nums">
                                      <span>Attendance Progress</span>
                                      <span className="font-bold text-emerald-700">{child.attendancePercentage}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-200 rounded-sm overflow-hidden">
                                      <div className="h-full bg-emerald-600" style={{ width: `${Math.min(100, Number(child.attendancePercentage))}%` }} />
                                    </div>
                                  </div>

                                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700 tabular-nums">
                                    <span>
                                      Fee Status: <strong className={child.feeStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}>{child.feeStatus}</strong>
                                    </span>
                                    <span>
                                      Latest Score: <strong>{childLatestResult ? `${childLatestResult.subject} (${childLatestResult.grade})` : 'Pending'}</strong>
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          <div className="lg:col-span-7 bg-white p-6 rounded-sm border border-slate-200 space-y-4">
                            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-[#EC483E]" />
                              <span>Send Leave Note or Feedback to Teacher</span>
                            </h3>
                            {feedbackSent && (
                              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm font-medium">
                                Leave note delivered to teacher.
                              </div>
                            )}
                            <form onSubmit={handleSendFeedback} className="space-y-3 text-xs">
                              <div>
                                <label className="block font-semibold text-slate-700 mb-1">Select Teacher</label>
                                <select
                                  value={parentFeedback.teacherName}
                                  onChange={e => setParentFeedback({ ...parentFeedback, teacherName: e.target.value })}
                                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#EC483E]"
                                >
                                  {teachers.map(t => (
                                    <option key={t.id} value={t.name}>
                                      {t.name} ({t.subject})
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block font-semibold text-slate-700 mb-1">Message / Leave Note</label>
                                <textarea
                                  required
                                  rows={3}
                                  value={parentFeedback.message}
                                  onChange={e => setParentFeedback({ ...parentFeedback, message: e.target.value })}
                                  placeholder="Write your note for the class teacher..."
                                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#EC483E]"
                                />
                              </div>
                              <button type="submit" className="px-5 py-2.5 bg-[#EC483E] hover:bg-[#d9382e] text-white font-semibold rounded-sm transition-colors">
                                Send Message
                              </button>
                            </form>
                          </div>

                          <div className="lg:col-span-5 bg-white p-6 rounded-sm border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <h3 className="text-sm font-bold text-slate-900">School Notices & Sent Notes</h3>
                              <button type="button" onClick={() => setActiveTab('notices')} className="text-xs font-semibold text-[#EC483E] hover:underline">
                                All notices
                              </button>
                            </div>
                            <div className="space-y-3 text-xs">
                              {notices.slice(0, 3).map(n => (
                                <div key={n.id} className="p-3 bg-[#F7F8FA] border border-slate-200 rounded-sm space-y-1">
                                  <div className="flex justify-between font-semibold text-slate-900">
                                    <span>{n.title}</span>
                                    <span className="text-slate-400 font-normal tabular-nums">{n.date}</span>
                                  </div>
                                  <p className="text-slate-600 line-clamp-2">{n.description}</p>
                                </div>
                              ))}
                              {feedbackList.slice(0, 2).map(fb => (
                                <div key={fb.id} className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-sm space-y-1">
                                  <p className="font-semibold text-slate-900">Sent to {fb.teacherName} · {fb.date}</p>
                                  <p className="text-slate-700 line-clamp-2">{fb.message}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* STUDENT OVERVIEW */}
                  {user.role === 'student' && (() => {
                    const me = students[0];
                    const myFee = fees[0];
                    const roleTheme = PORTAL_THEMES.student;
                    const avgMarks =
                      results.length > 0
                        ? Math.round(
                            results.reduce(
                              (sum, r) => sum + ((Number(r.marksObtained) / Math.max(1, Number(r.maxMarks))) * 100),
                              0
                            ) / results.length
                          )
                        : null;

                    return (
                      <div className="space-y-6">
                        <div className="relative rounded-sm overflow-hidden border border-slate-300 bg-[#2C3A47] text-white">
                          <img
                            src={roleTheme.bgImage}
                            alt={roleTheme.wing}
                            referrerPolicy="no-referrer"
                            onError={e => {
                              e.currentTarget.style.display = 'none';
                            }}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-[#1E293B]/95 via-[#1E293B]/80 to-[#1E293B]/55" />
                          <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-2">
                              <p className="text-xs font-bold uppercase tracking-wider text-[#F6C33B]">
                                {roleTheme.wing} · Student Academic Space
                              </p>
                              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white">
                                Welcome, {me?.fullName || user.name}
                              </h2>
                              <p className="text-xs sm:text-sm text-slate-200 tabular-nums">
                                Class {me ? `${me.class}-${me.section}` : `${user.class}-${user.section}`} · Roll #{me?.rollNumber || user.rollNumber} · {me?.email || user.email}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2.5 shrink-0">
                              {me && (
                                <button
                                  type="button"
                                  onClick={() => openStudentDetail(me.id)}
                                  className="px-4 py-2.5 bg-[#EC483E] hover:bg-[#d9382e] text-white font-semibold text-xs rounded-sm transition-colors"
                                >
                                  Full Report Card
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setActiveTab('timetable')}
                                className="px-4 py-2.5 bg-[#F6C33B] hover:bg-[#ebb62a] text-slate-900 font-bold text-xs rounded-sm transition-colors"
                              >
                                Class Timetable
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveTab('fees')}
                                className="px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/25 text-white font-semibold text-xs rounded-sm transition-colors"
                              >
                                Fee Ledger
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                          <StatCard title="Attendance" value={me ? `${me.attendancePercentage}%` : '—'} icon={<UserCheck className="w-5 h-5 text-emerald-700" />} />
                          <StatCard
                            title="Tuition Fee Status"
                            value={myFee ? `${myFee.status} (₹${myFee.paidAmount.toLocaleString()})` : '—'}
                            icon={<DollarSign className="w-5 h-5 text-[#d99b08]" />}
                          />
                          <StatCard
                            title="Exam Average"
                            value={avgMarks !== null ? `${avgMarks}% (${results.length} Subjects)` : 'Pending'}
                            icon={<Award className="w-5 h-5 text-[#EC483E]" />}
                          />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          <div className="lg:col-span-6 bg-white p-6 rounded-sm border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <h3 className="font-bold text-slate-900 text-base">Subject Exam Performance</h3>
                              <button type="button" onClick={() => setActiveTab('results')} className="text-xs font-semibold text-[#EC483E] hover:underline">
                                Detailed marks
                              </button>
                            </div>
                            {results.length > 0 ? (
                              <div className="space-y-3.5">
                                {results.map(r => {
                                  const pct = Math.round((r.marksObtained / Math.max(1, r.maxMarks)) * 100);
                                  return (
                                    <div key={r.id} className="space-y-1">
                                      <div className="flex items-center justify-between text-xs tabular-nums">
                                        <span className="font-semibold text-slate-900">{r.subject}</span>
                                        <span className="text-slate-600">
                                          <strong className="text-slate-900">{r.marksObtained}/{r.maxMarks}</strong> · Grade {r.grade}
                                        </span>
                                      </div>
                                      <div className="h-2 bg-slate-100 rounded-sm overflow-hidden">
                                        <div
                                          className="h-full bg-[#EC483E]"
                                          style={{ width: `${Math.min(100, pct)}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500">Exam results will appear here once published by your teacher.</p>
                            )}
                          </div>

                          <div className="lg:col-span-6 bg-white p-6 rounded-sm border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <h3 className="font-bold text-slate-900 text-base">Latest Campus Notices</h3>
                              <button type="button" onClick={() => setActiveTab('notices')} className="text-xs font-semibold text-[#EC483E] hover:underline">
                                View all
                              </button>
                            </div>
                            <div className="space-y-3 text-xs">
                              {notices.slice(0, 3).map(n => (
                                <div key={n.id} className="p-3 bg-[#F7F8FA] border border-slate-200 rounded-sm space-y-1">
                                  <div className="flex justify-between font-semibold text-slate-900">
                                    <span>{n.title}</span>
                                    <span className="text-slate-400 font-normal tabular-nums">{n.date}</span>
                                  </div>
                                  <p className="text-slate-600">{n.description}</p>
                                </div>
                              ))}
                              {notices.length === 0 && (
                                <p className="text-slate-500">No notices posted yet.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {me && (
                          <div className="bg-white p-6 rounded-sm border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                              <h3 className="font-bold text-slate-900 text-base">Student Profile Details</h3>
                              <span className="font-mono text-xs text-slate-600">ID: {me.studentId}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                              <div className="p-3.5 bg-[#F7F8FA] border border-slate-200 rounded-sm">
                                <span className="text-slate-500 block">Full Name</span>
                                <span className="font-semibold text-slate-900 mt-0.5 block">{me.fullName}</span>
                              </div>
                              <div className="p-3.5 bg-[#F7F8FA] border border-slate-200 rounded-sm">
                                <span className="text-slate-500 block">Class & Roll Number</span>
                                <span className="font-semibold text-slate-900 mt-0.5 block tabular-nums">
                                  Class {me.class}-{me.section} · Roll #{me.rollNumber}
                                </span>
                              </div>
                              <div className="p-3.5 bg-[#F7F8FA] border border-slate-200 rounded-sm">
                                <span className="text-slate-500 block">Login Email</span>
                                <span className="font-mono font-semibold text-[#EC483E] mt-0.5 block">{me.email}</span>
                              </div>
                              <div className="p-3.5 bg-[#F7F8FA] border border-slate-200 rounded-sm">
                                <span className="text-slate-500 block">Date of Birth / Gender</span>
                                <span className="font-semibold text-slate-900 mt-0.5 block tabular-nums">{me.dob || '—'} · {me.gender}</span>
                              </div>
                              <div className="p-3.5 bg-[#F7F8FA] border border-slate-200 rounded-sm">
                                <span className="text-slate-500 block">Blood Group</span>
                                <span className="font-semibold text-slate-900 mt-0.5 block">{me.bloodGroup || 'O+'}</span>
                              </div>
                              <div className="p-3.5 bg-[#F7F8FA] border border-slate-200 rounded-sm">
                                <span className="text-slate-500 block">Parent / Guardian</span>
                                <span className="font-semibold text-slate-900 mt-0.5 block">{me.parentName} · {me.parentPhone}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* ADMIN OVERVIEW */}
                  {stats && user.role === 'admin' && (() => {
                    const roleTheme = PORTAL_THEMES.admin;
                    const collected = Number(stats.feesCollected || 0);
                    const expected = Math.max(1, Number(stats.feesExpected || 0));
                    const feePct = Math.round((collected / expected) * 100);
                    const grades = ['1st', '2nd', '3rd', '4th', '5th'];
                    const maxGradeCount = Math.max(
                      1,
                      ...grades.map(g => students.filter(s => s.class === g).length)
                    );

                    return (
                      <div className="space-y-6">
                        <div className="relative rounded-sm overflow-hidden border border-slate-300 bg-[#2C3A47] text-white">
                          <img
                            src={roleTheme.bgImage}
                            alt={roleTheme.wing}
                            referrerPolicy="no-referrer"
                            onError={e => {
                              e.currentTarget.style.display = 'none';
                            }}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-[#1E293B]/95 via-[#1E293B]/80 to-[#1E293B]/55" />
                          <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="space-y-2 max-w-2xl">
                              <p className="text-xs font-bold uppercase tracking-wider text-[#F6C33B]">
                                {roleTheme.wing} · Live SQLite Command Center
                              </p>
                              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white">
                                School Operations Overview
                              </h2>
                              <p className="text-xs sm:text-sm text-slate-200 tabular-nums">
                                Managing <strong>{stats.totalStudents} students</strong> across 10 sections, <strong>{teachers.length} teachers</strong>, and <strong>{stats.pendingInquiries || 0} pending admission inquiries</strong>.
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => openAddStudentModal()}
                                className="px-4 py-2.5 bg-[#EC483E] hover:bg-[#d9382e] text-white font-semibold text-xs rounded-sm inline-flex items-center gap-1.5 transition-colors"
                              >
                                <UserPlus className="w-4 h-4" />
                                <span>+ Add Student</span>
                              </button>
                              <button
                                type="button"
                                onClick={openAddTeacherModal}
                                className="px-4 py-2.5 bg-[#F6C33B] hover:bg-[#ebb62a] text-slate-900 font-bold text-xs rounded-sm inline-flex items-center gap-1.5 transition-colors"
                              >
                                <UserCheck className="w-4 h-4" />
                                <span>+ Add Teacher</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                          <StatCard title="Enrolled Students" value={stats.totalStudents} icon={<Users className="w-5 h-5 text-[#EC483E]" />} />
                          <StatCard title="Faculty Members" value={teachers.length} icon={<UserCheck className="w-5 h-5 text-blue-700" />} />
                          <StatCard
                            title="Tuition Collected"
                            value={`₹${collected.toLocaleString()}`}
                            icon={<DollarSign className="w-5 h-5 text-emerald-700" />}
                          />
                          <StatCard title="Pending Inquiries" value={stats.pendingInquiries ?? inquiries.length} icon={<Building className="w-5 h-5 text-[#d99b08]" />} />
                        </div>

                        {/* Visual Data Analytics Strip: Grade Enrollment + Tuition Collection */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          <div className="lg:col-span-7 bg-white p-6 rounded-sm border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                              <h3 className="text-sm font-bold text-slate-900">Grade-Wise Student Distribution (1st – 5th)</h3>
                              <div className="flex items-center gap-4 text-[11px] text-slate-600">
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 bg-[#EC483E] inline-block" /> Section A
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 bg-[#F6C33B] inline-block" /> Section B
                                </span>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {grades.map(grade => {
                                const secA = students.filter(s => s.class === grade && s.section === 'A').length;
                                const secB = students.filter(s => s.class === grade && s.section === 'B').length;
                                const total = secA + secB;
                                return (
                                  <div key={grade} className="space-y-1">
                                    <div className="flex justify-between text-xs tabular-nums">
                                      <span className="font-semibold text-slate-900">{grade} Grade</span>
                                      <span className="text-slate-600">
                                        A: {secA} · B: {secB} · <strong className="text-slate-900">{total} total</strong>
                                      </span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-sm overflow-hidden flex">
                                      <div
                                        className="h-full bg-[#EC483E]"
                                        style={{ width: `${(secA / maxGradeCount) * 100}%` }}
                                      />
                                      <div
                                        className="h-full bg-[#F6C33B]"
                                        style={{ width: `${(secB / maxGradeCount) * 100}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="lg:col-span-5 bg-white p-6 rounded-sm border border-slate-200 space-y-5 flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <h3 className="text-sm font-bold text-slate-900">Tuition Ledger Progress</h3>
                                <span className="font-mono text-xs font-bold text-emerald-700 tabular-nums">{feePct}% Paid</span>
                              </div>
                              <div className="space-y-1.5">
                                <div className="h-3 bg-slate-100 rounded-sm overflow-hidden">
                                  <div className="h-full bg-emerald-600" style={{ width: `${Math.min(100, feePct)}%` }} />
                                </div>
                                <div className="flex justify-between text-xs text-slate-600 tabular-nums">
                                  <span>Collected: ₹{collected.toLocaleString()}</span>
                                  <span>Target: ₹{expected.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2.5 pt-3 border-t border-slate-100">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-900">Recent Notices & Inquiries</h4>
                                <button type="button" onClick={() => setActiveTab('notices')} className="text-xs font-semibold text-[#EC483E] hover:underline">
                                  Open Desk
                                </button>
                              </div>
                              <div className="space-y-2 text-xs">
                                {notices.slice(0, 2).map(n => (
                                  <div key={n.id} className="p-2.5 bg-[#F7F8FA] border border-slate-200 rounded-sm flex items-center justify-between gap-2">
                                    <span className="font-medium text-slate-900 truncate">{n.title}</span>
                                    <span className="text-slate-500 shrink-0 tabular-nums">{n.date}</span>
                                  </div>
                                ))}
                                {inquiries.slice(0, 1).map(inq => (
                                  <div key={inq.id} className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-sm flex items-center justify-between gap-2">
                                    <span className="font-medium text-slate-900 truncate">Inquiry: {inq.name}</span>
                                    <span className="text-amber-800 font-semibold shrink-0">{inq.status}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Class Strength Overview Grid */}
                        <div className="bg-white p-6 rounded-sm border border-slate-200 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900">Section-Wise Enrollment (1st-A to 5th-B)</h3>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('students');
                                setSelectedClassSection(null);
                              }}
                              className="text-xs font-semibold text-[#EC483E] hover:underline"
                            >
                              View all classes
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {ALL_CLASS_SECTIONS.map(clsSec => {
                              const count = students.filter(s => `${s.class}-${s.section}` === clsSec).length;
                              return (
                                <button
                                  type="button"
                                  key={clsSec}
                                  onClick={() => {
                                    setActiveTab('students');
                                    setSelectedClassSection(clsSec);
                                  }}
                                  className="p-3.5 bg-[#F7F8FA] hover:bg-white border border-slate-200 hover:border-[#EC483E] rounded-sm text-left transition-colors"
                                >
                                  <p className="text-xs font-bold text-slate-900">Class {clsSec}</p>
                                  <p className="font-mono text-lg font-bold text-[#EC483E] mt-1 tabular-nums">{count}</p>
                                  <p className="text-[11px] text-slate-500">students</p>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* STUDENTS & CLASSES TAB */}
              {activeTab === 'students' && (
                <div className="space-y-6">
                  {!selectedClassSection ? (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="relative w-full sm:w-80">
                          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search any student by name, email, or roll #..."
                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                          />
                        </div>
                        {user.role === 'admin' && (
                          <button
                            type="button"
                            onClick={() => openAddStudentModal()}
                            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg inline-flex items-center gap-1.5 w-fit"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>+ Add Student</span>
                          </button>
                        )}
                      </div>

                      {searchQuery.trim() ? (
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                          <div className="px-5 py-3 border-b border-slate-200 text-xs font-semibold text-slate-700">
                            Search results across visible classes
                          </div>
                          <div className="divide-y divide-slate-100">
                            {students
                              .filter(st => {
                                const q = searchQuery.toLowerCase();
                                return (
                                  st.fullName.toLowerCase().includes(q) ||
                                  st.email.toLowerCase().includes(q) ||
                                  String(st.rollNumber).includes(q)
                                );
                              })
                              .map(st => (
                                <div key={st.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50">
                                  <div>
                                    <p className="font-bold text-slate-900 text-sm">{st.fullName}</p>
                                    <p className="text-slate-600 tabular-nums">
                                      Class {st.class}-{st.section} · Roll #{st.rollNumber} · {st.email}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => openStudentDetail(st.id)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg">
                                      Profile
                                    </button>
                                    {user.role === 'admin' && (
                                      <button type="button" onClick={() => openEditStudentModal(st)} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg">
                                        Edit
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : (
                        <div className={`grid grid-cols-1 sm:grid-cols-2 ${visibleClassSections.length <= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-5'} gap-4`}>
                          {visibleClassSections.map(clsSec => {
                            const count = students.filter(s => `${s.class}-${s.section}` === clsSec).length;
                            return (
                              <button
                                type="button"
                                key={clsSec}
                                onClick={() => setSelectedClassSection(clsSec)}
                                className="text-left p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-600 transition-colors flex flex-col justify-between space-y-4"
                              >
                                <div>
                                  <h4 className="font-bold text-slate-900 text-base">Class {clsSec}</h4>
                                  <p className="text-xs text-slate-500 mt-0.5 tabular-nums">{count} Students</p>
                                </div>
                                <span className="text-xs font-semibold text-blue-700 inline-flex items-center gap-1">
                                  <span>View Roster</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setSelectedClassSection(null)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg"
                        >
                          {user.role === 'teacher' ? '← Assigned Classes' : '← All Classes'}
                        </button>
                        <h3 className="font-bold text-slate-900 text-base">Class {selectedClassSection} Roster</h3>
                        {user.role === 'admin' && (
                          <button
                            type="button"
                            onClick={() => openAddStudentModal(selectedClassSection)}
                            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg"
                          >
                            + Add to {selectedClassSection}
                          </button>
                        )}
                      </div>

                      <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder={`Filter in ${selectedClassSection}...`}
                          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {students
                          .filter(st => `${st.class}-${st.section}` === selectedClassSection)
                          .filter(st => {
                            if (!searchQuery) return true;
                            const q = searchQuery.toLowerCase();
                            return st.fullName.toLowerCase().includes(q) || String(st.rollNumber).includes(q) || st.email.toLowerCase().includes(q);
                          })
                          .map(st => (
                            <div key={st.id} className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-bold text-slate-900 text-base">{st.fullName}</h4>
                                  <p className="text-xs text-slate-600 tabular-nums mt-0.5">
                                    Roll #{st.rollNumber} · Class {st.class}-{st.section}
                                  </p>
                                </div>
                                {user.role === 'admin' && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => openEditStudentModal(st)}
                                      title="Edit Student"
                                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-md"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteStudent(st)}
                                      title="Remove Student"
                                      className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                                <p className="text-slate-600 truncate">
                                  Email: <span className="font-mono text-slate-900">{st.email}</span>
                                </p>
                                <p className="text-slate-600">
                                  Parent: <span className="font-medium text-slate-900">{st.parentName}</span> · {st.parentPhone}
                                </p>
                                <p className="text-slate-600 tabular-nums">
                                  Attendance: <span className="font-bold text-emerald-700">{st.attendancePercentage}%</span> · Fee: <span className={st.feeStatus === 'Paid' ? 'font-semibold text-emerald-700' : 'font-semibold text-amber-700'}>{st.feeStatus}</span>
                                </p>
                              </div>

                              {(user.role === 'admin' || user.role === 'teacher') && (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleMarkAttendance(st.id, 'Present')}
                                    className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs rounded-lg"
                                  >
                                    Mark Present
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMarkAttendance(st.id, 'Absent')}
                                    className="flex-1 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-xs rounded-lg"
                                  >
                                    Mark Absent
                                  </button>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => openStudentDetail(st.id)}
                                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg"
                              >
                                View Full Profile & Report Card
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TEACHERS TAB */}
              {activeTab === 'teachers' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-slate-200">
                    <div>
                      <h2 className="font-bold text-slate-900 text-base">
                        Faculty & Teachers Directory ({teachers.length})
                      </h2>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Manage teaching staff, subjects, and assigned class sections.
                      </p>
                    </div>
                    {user.role === 'admin' && (
                      <button
                        type="button"
                        onClick={openAddTeacherModal}
                        className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-xs rounded-lg w-fit"
                      >
                        + Add Teacher
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {teachers.map(t => (
                      <div key={t.id} className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-slate-900 text-base">{t.name}</h3>
                            <p className="text-xs text-indigo-700 font-semibold mt-0.5">
                              {t.designation} · {t.subject}
                            </p>
                          </div>
                          {user.role === 'admin' && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditTeacherModal(t)}
                                title="Edit Teacher"
                                className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-slate-100 rounded-md"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              {t.id !== 't1' && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTeacher(t)}
                                  title="Remove Teacher"
                                  className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                          <p className="text-slate-600">
                            Email: <span className="font-mono text-slate-900">{t.email}</span>
                          </p>
                          <p className="text-slate-600">Qualification: {t.qualification} ({t.experience})</p>
                          <p className="text-slate-600 tabular-nums">Phone: {t.phone}</p>
                          {Array.isArray(t.assignedClasses) && t.assignedClasses.length > 0 && (
                            <p className="text-slate-700 font-medium">
                              Assigned: {t.assignedClasses.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MY CHILDREN TAB */}
              {activeTab === 'my_children' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {students.filter(s => (user.childrenIds || []).includes(s.id)).map(child => (
                    <div key={child.id} className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{child.fullName}</h3>
                        <p className="text-xs text-slate-600 mt-0.5 tabular-nums">
                          Class {child.class}-{child.section} · Roll #{child.rollNumber} · Attendance {child.attendancePercentage}%
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openStudentDetail(child.id)}
                        className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg"
                      >
                        View Details & Report Card
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* FEES TAB */}
              {activeTab === 'fees' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-bold text-slate-900 text-base">
                        {user.role === 'teacher'
                          ? `Fee Management — Assigned Classes (${visibleClassSections.join(', ')})`
                          : 'Fee Management & Tuition Ledger'}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                        Showing {filteredFees.length} of {visibleFees.length} records
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        value={feeSearch}
                        onChange={e => setFeeSearch(e.target.value)}
                        placeholder="Search student or class..."
                        className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                      />
                      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                        {(['all', 'Paid', 'Pending'] as const).map(status => (
                          <button
                            type="button"
                            key={status}
                            onClick={() => setFeeFilter(status)}
                            className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors ${
                              feeFilter === status ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="py-2.5 px-4 font-semibold">Student Name</th>
                          <th className="py-2.5 px-4 font-semibold">Class</th>
                          <th className="py-2.5 px-4 font-semibold text-right">Total Fee</th>
                          <th className="py-2.5 px-4 font-semibold text-right">Paid Amount</th>
                          <th className="py-2.5 px-4 font-semibold">Status</th>
                          {user.role === 'admin' && <th className="py-2.5 px-4 font-semibold text-right">Action</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredFees.map(f => (
                          <tr key={f.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-4 font-semibold text-slate-900">{f.studentName}</td>
                            <td className="py-2.5 px-4 text-slate-600">{f.class}</td>
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-800">₹{f.totalAmount.toLocaleString()}</td>
                            <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-emerald-700">₹{f.paidAmount.toLocaleString()}</td>
                            <td className="py-2.5 px-4">
                              <span className={`font-semibold ${f.status === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {f.status}
                              </span>
                            </td>
                            {user.role === 'admin' && (
                              <td className="py-2.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleToggleFeeStatus(f)}
                                  className={`px-3 py-1 rounded-md font-semibold text-[11px] border transition-colors ${
                                    f.status === 'Paid'
                                      ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                      : 'bg-emerald-700 text-white border-emerald-700 hover:bg-emerald-800'
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

              {/* RESULTS TAB */}
              {activeTab === 'results' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="font-bold text-slate-900 text-base">
                      {user.role === 'teacher'
                        ? `Examinations & Report Cards — Assigned Classes (${visibleClassSections.join(', ')})`
                        : 'Examinations & Report Cards'}
                    </h2>
                    {(user.role === 'admin' || user.role === 'teacher') && students.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewResult({ studentId: students[0]?.id || '', subject: 'Mathematics', marksObtained: '90', maxMarks: '100', remarks: 'Very good progress' });
                          setShowAddResult(true);
                        }}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg w-fit"
                      >
                        + Add Exam Result
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {visibleClassSections.map(clsSec => {
                      const classResults = results.filter(r => r.class === clsSec);
                      return (
                        <div key={clsSec} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
                          <h3 className="font-bold text-slate-900 text-sm">Class {clsSec} Results</h3>
                          {classResults.length === 0 ? (
                            <p className="text-xs text-slate-500">No results published for Class {clsSec} yet.</p>
                          ) : (
                            <div className="space-y-2">
                              {classResults.map(r => (
                                <div key={r.id} className="p-3 bg-white rounded-lg flex items-center justify-between text-xs border border-slate-200">
                                  <div>
                                    <span className="font-bold text-slate-900">{r.studentName}</span>
                                    <p className="text-slate-600 mt-0.5">{r.subject} · {r.remarks}</p>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="font-mono font-semibold text-blue-700 tabular-nums">
                                      {r.marksObtained}/{r.maxMarks}
                                    </span>
                                    <span className="font-bold text-emerald-700">Grade {r.grade}</span>
                                    {(user.role === 'admin' || user.role === 'teacher') && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteResult(r.id)}
                                        title="Delete Result"
                                        className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                                      >
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

              {/* TIMETABLES TAB */}
              {activeTab === 'timetable' && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="font-bold text-slate-900 text-base">
                      {user.role === 'teacher'
                        ? `Class Timetables — Assigned Classes (${visibleClassSections.join(', ')})`
                        : 'Weekly Class Timetables (Monday – Saturday)'}
                    </h2>
                    {visibleTimetables.length > 1 && (
                      <select
                        value={timetableFilter}
                        onChange={e => setTimetableFilter(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                      >
                        <option value="all">All Visible Sections</option>
                        {visibleTimetables.map(tt => (
                          <option key={tt.id} value={tt.class}>
                            Class {tt.class}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-5">
                    {displayedTimetables.map(tt => (
                      <div key={tt.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-slate-900 text-sm">Class {tt.class} Schedule</h3>
                          {user.role === 'admin' && (
                            <button
                              type="button"
                              onClick={() => setEditingTimetable(tt)}
                              className="px-3 py-1 bg-white border border-slate-300 hover:border-blue-600 text-slate-800 text-xs font-semibold rounded-md inline-flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit Timetable</span>
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                          {tt.schedule.map((sch, idx) => (
                            <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2 text-xs">
                              <span className="font-bold text-slate-900 block border-b border-slate-200 pb-1.5">{sch.day}</span>
                              <ul className="space-y-1.5 text-slate-700">
                                {sch.periods.map((p, pIdx) => (
                                  <li key={pIdx} className="leading-snug tabular-nums">{p}</li>
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

              {/* NOTICES & INQUIRIES TAB */}
              {activeTab === 'notices' && (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="font-bold text-slate-900 text-base">School Notices & Events</h2>
                      {user.role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => setShowAddEvent(true)}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg"
                        >
                          + Add Notice
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                      {notices.map(n => (
                        <div key={n.id} className="p-4 flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="font-semibold text-blue-700">{n.category}</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums">{n.date}</span>
                            </div>
                            <h3 className="font-bold text-slate-900 text-sm">{n.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed">{n.description}</p>
                          </div>
                          {user.role === 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteNotice(n.id)}
                              title="Delete Notice"
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {(user.role === 'admin' || user.role === 'teacher') && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                      <h3 className="font-bold text-slate-900 text-base">Parent Leave Notes & Feedback ({feedbackList.length})</h3>
                      {feedbackList.length === 0 ? (
                        <p className="text-xs text-slate-500">No parent messages received yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {feedbackList.map(fb => (
                            <div key={fb.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{fb.sender} → {fb.teacherName}</span>
                                <span className="text-slate-500 tabular-nums">{fb.date}</span>
                              </div>
                              <p className="text-slate-700">{fb.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {user.role === 'admin' && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                      <h3 className="font-bold text-slate-900 text-base">Website Admission Inquiries ({inquiries.length})</h3>
                      {inquiries.length === 0 ? (
                        <p className="text-xs text-slate-500">No admission inquiries submitted from the website yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {inquiries.map(inq => (
                            <div key={inq.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-1">
                                <p className="font-bold text-slate-900">{inq.name} · {inq.phone} ({inq.email})</p>
                                <p className="text-slate-700">{inq.message}</p>
                                <p className="text-slate-500 tabular-nums">Submitted on {inq.date}</p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className={`font-semibold ${inq.status === 'Contacted' ? 'text-emerald-700' : 'text-blue-700'}`}>
                                  {inq.status}
                                </span>
                                {inq.status !== 'Contacted' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateInquiryStatus(inq.id, 'Contacted')}
                                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg"
                                  >
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

              {/* DATABASE & SQL LEARNING LAB TAB (Admin Only) */}
              {activeTab === 'database' && user.role === 'admin' && (
                <DatabaseLab token={token} />
              )}
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      {studentModalMode && (
        <StudentFormModal
          mode={studentModalMode}
          form={studentForm}
          setForm={setStudentForm}
          onClose={() => setStudentModalMode(null)}
          onSubmit={handleSaveStudent}
        />
      )}

      {teacherModalMode && (
        <TeacherFormModal
          mode={teacherModalMode}
          form={teacherForm}
          setForm={setTeacherForm}
          onClose={() => setTeacherModalMode(null)}
          onSubmit={handleSaveTeacher}
        />
      )}

      {showAddEvent && (
        <AddEventModal
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          onClose={() => setShowAddEvent(false)}
          onSubmit={handleCreateEvent}
        />
      )}

      {showAddResult && (
        <AddResultModal
          students={students}
          newResult={newResult}
          setNewResult={setNewResult}
          onClose={() => setShowAddResult(false)}
          onSubmit={handleCreateResult}
        />
      )}

      {editingTimetable && (
        <EditTimetableModal
          timetable={editingTimetable}
          onChangeSchedule={schedule => setEditingTimetable({ ...editingTimetable, schedule })}
          onClose={() => setEditingTimetable(null)}
          onSubmit={handleSaveTimetable}
        />
      )}

      {selectedStudentDetail && (
        <StudentDetailModal
          detail={selectedStudentDetail}
          onClose={() => setSelectedStudentDetail(null)}
          onDownloadReport={handleDownloadReportCard}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: any; icon: React.ReactNode }) {
  return (
    <div className="p-5 rounded-sm border border-slate-200 bg-white flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tabular-nums">{value}</p>
      </div>
      <div className="w-10 h-10 bg-[#F7F8FA] border border-slate-200 rounded-sm flex items-center justify-center shrink-0">
        {icon}
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-sm font-medium transition-colors text-xs text-left ${
        active ? 'bg-[#EC483E] text-white font-semibold' : 'text-slate-300 hover:text-white hover:bg-white/10'
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
