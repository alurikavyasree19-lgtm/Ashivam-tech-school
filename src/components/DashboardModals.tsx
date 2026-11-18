import React from 'react';
import { X, Download } from 'lucide-react';
import { ALL_CLASS_SECTIONS, Student, Timetable, TimetableDay } from '../types';

export function StudentFormModal({
  mode,
  form,
  setForm,
  onClose,
  onSubmit
}: {
  mode: 'create' | 'edit';
  form: any;
  setForm: (val: any) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {mode === 'edit' ? 'Edit Student Profile' : 'Add New Student'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'edit'
                ? 'Updates profile, fee ledger, and login details across SQLite tables.'
                : 'Auto-creates fee invoice, attendance entry, and student login (password: student123).'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Student Full Name</label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email ID</label>
              <input
                type="text"
                inputMode="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. aarav@ashivam.edu"
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={form.dob}
                onChange={e => setForm({ ...form, dob: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={e => setForm({ ...form, gender: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Class Grade</label>
              <select
                value={form.class}
                onChange={e => setForm({ ...form, class: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              >
                <option value="1st">1st Grade</option>
                <option value="2nd">2nd Grade</option>
                <option value="3rd">3rd Grade</option>
                <option value="4th">4th Grade</option>
                <option value="5th">5th Grade</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Section</label>
              <select
                value={form.section}
                onChange={e => setForm({ ...form, section: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Parent / Guardian Name</label>
              <input
                type="text"
                required
                value={form.parentName}
                onChange={e => setForm({ ...form, parentName: e.target.value })}
                placeholder="Mr. Rajesh"
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Parent Phone</label>
              <input
                type="text"
                required
                value={form.parentPhone}
                onChange={e => setForm({ ...form, parentPhone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
              <input
                type="text"
                value={form.bloodGroup || 'O+'}
                onChange={e => setForm({ ...form, bloodGroup: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
              <input
                type="text"
                value={form.address || ''}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="Plot 42, Green Valley"
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-semibold rounded-lg text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg"
            >
              {mode === 'edit' ? 'Update Student' : 'Save Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TeacherFormModal({
  mode,
  form,
  setForm,
  onClose,
  onSubmit
}: {
  mode: 'create' | 'edit';
  form: any;
  setForm: (val: any) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {mode === 'edit' ? 'Edit Teacher & Assigned Classes' : 'Add New Teacher'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Default teacher login password: <span className="font-mono font-semibold text-slate-700">teacher123</span>
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Mrs. Lakshmi"
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                required
                value={form.designation}
                onChange={e => setForm({ ...form, designation: e.target.value })}
                placeholder="Class Teacher"
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {mode === 'create' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email ID</label>
              <input
                type="text"
                inputMode="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. lakshmi@ashivam.edu"
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              >
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
              <input
                type="text"
                required
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 11111"
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-2">Assign Class Sections</label>
            <div className="grid grid-cols-5 gap-2">
              {ALL_CLASS_SECTIONS.map(clsSec => {
                const checked = (form.assignedClasses || []).includes(clsSec);
                return (
                  <button
                    type="button"
                    key={clsSec}
                    onClick={() => {
                      const current: string[] = form.assignedClasses || [];
                      const updated = checked ? current.filter(c => c !== clsSec) : [...current, clsSec];
                      setForm({ ...form, assignedClasses: updated });
                    }}
                    className={`py-1.5 px-2 rounded-lg border font-semibold text-[11px] transition-colors ${
                      checked
                        ? 'bg-indigo-700 text-white border-indigo-700'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {clsSec}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-semibold rounded-lg text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-lg"
            >
              {mode === 'edit' ? 'Update Teacher' : 'Save Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddEventModal({
  newEvent,
  setNewEvent,
  onClose,
  onSubmit
}: {
  newEvent: { title: string; description: string; category: string };
  setNewEvent: (v: { title: string; description: string; category: string }) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="text-lg font-bold text-slate-900">Publish School Event / Notice</h3>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Notice Title</label>
            <input
              type="text"
              required
              value={newEvent.title}
              onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
              placeholder="Annual Science Fair 2026"
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={newEvent.category}
              onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
            >
              <option value="All">All</option>
              <option value="Event">Event</option>
              <option value="Meeting">Meeting</option>
              <option value="Holiday">Holiday</option>
              <option value="Exam">Exam</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={newEvent.description}
              onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
              placeholder="Event details, schedule, and instructions..."
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-semibold rounded-lg text-slate-700">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg">
              Publish Notice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddResultModal({
  students,
  newResult,
  setNewResult,
  onClose,
  onSubmit
}: {
  students: Student[];
  newResult: any;
  setNewResult: (v: any) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="text-lg font-bold text-slate-900">Publish Exam Result</h3>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Student</label>
            <select
              required
              value={newResult.studentId}
              onChange={e => setNewResult({ ...newResult, studentId: e.target.value })}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.fullName} (Class {s.class}-{s.section}, Roll #{s.rollNumber})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={newResult.subject}
                onChange={e => setNewResult({ ...newResult, subject: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
              >
                <option value="Telugu">Telugu</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="Social">Social</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Marks (out of 100)</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={newResult.marksObtained}
                onChange={e => setNewResult({ ...newResult, marksObtained: e.target.value })}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm tabular-nums"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Teacher Remarks</label>
            <input
              type="text"
              required
              value={newResult.remarks}
              onChange={e => setNewResult({ ...newResult, remarks: e.target.value })}
              className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-semibold rounded-lg text-slate-700">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg">
              Save Result
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditTimetableModal({
  timetable,
  onChangeSchedule,
  onClose,
  onSubmit
}: {
  timetable: Timetable;
  onChangeSchedule: (next: TimetableDay[]) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-3xl w-full p-6 sm:p-8 space-y-5 shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Edit Timetable — Class {timetable.class}</h3>
            <p className="text-xs text-slate-500 mt-0.5">One period per line for each weekday (Monday – Saturday).</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {timetable.schedule.map((dayObj, dIdx) => (
              <div key={dayObj.day} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <label className="block font-bold text-slate-800">{dayObj.day}</label>
                <textarea
                  rows={5}
                  value={dayObj.periods.join('\n')}
                  onChange={e => {
                    const updated = timetable.schedule.map((item, idx) =>
                      idx === dIdx
                        ? { ...item, periods: e.target.value.split('\n').filter(line => line.trim().length > 0) }
                        : item
                    );
                    onChangeSchedule(updated);
                  }}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 font-semibold rounded-lg text-slate-700">
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg">
              Save Timetable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function StudentDetailModal({
  detail,
  onClose,
  onDownloadReport
}: {
  detail: { student: Student; results: any[]; fees?: any; attendance?: any[] };
  onClose: () => void;
  onDownloadReport: (d: any) => void;
}) {
  const st = detail.student;
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-blue-700 text-white font-bold flex items-center justify-center text-base">
              {st.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{st.fullName}</h3>
              <p className="text-xs text-slate-600 tabular-nums">
                ID {st.studentId} · Roll #{st.rollNumber} · Class {st.class}-{st.section}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Attendance</span>
            <span className="font-mono font-bold text-emerald-700 text-sm tabular-nums">{st.attendancePercentage}%</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Fee Status</span>
            <span className={`font-bold text-sm ${st.feeStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
              {detail.fees?.status || st.feeStatus}
            </span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Parent Phone</span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">{st.parentPhone}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block">Blood Group</span>
            <span className="font-semibold text-slate-900">{st.bloodGroup || 'O+'}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700">Academic Examination Results</h4>
          {detail.results.length === 0 ? (
            <p className="text-xs text-slate-500 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              No exam marks published yet.
            </p>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-2 px-3">Subject</th>
                    <th className="py-2 px-3 text-right">Marks</th>
                    <th className="py-2 px-3">Grade</th>
                    <th className="py-2 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detail.results.map((r: any) => (
                    <tr key={r.id}>
                      <td className="py-2 px-3 font-semibold text-slate-900">{r.subject}</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-800">
                        {r.marksObtained}/{r.maxMarks}
                      </td>
                      <td className="py-2 px-3 font-semibold text-emerald-700">{r.grade}</td>
                      <td className="py-2 px-3 text-slate-600">{r.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
          <span className="text-slate-500">Login Email: <strong className="text-slate-800">{st.email}</strong></span>
          <button
            type="button"
            onClick={() => onDownloadReport(detail)}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Report Card</span>
          </button>
        </div>
      </div>
    </div>
  );
}
