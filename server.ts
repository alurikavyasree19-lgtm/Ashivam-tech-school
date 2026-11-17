import express from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'ashivam-tech-secret-key-2026';
const PORT = Number(process.env.PORT) || 3000;
const SEED_DB_FILE = path.resolve(__dirname, 'data', 'db.json');
const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'ashivam-data') : path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate 55 students (50 to 60 students) distributed across all 10 class sections (1st-A to 5th-B)
const sampleNames = [
  'Kavya Kumar', 'Rahul Kumar', 'Ananya Singh', 'Aarav Patel', 'Diya Sharma',
  'Rohan Verma', 'Sneha Reddy', 'Kiran Kumar', 'Priya Nair', 'Vikram Joshi',
  'Vivaan Rao', 'Aditya Menon', 'Vihaan Gupta', 'Arjun Reddy', 'Sai Teja',
  'Reyansh Verma', 'Ayaan Khan', 'Krishna Murthy', 'Ishaan Iyer', 'Sanya Kapoor',
  'Riya Deshmukh', 'Aadhya Kulkarni', 'Shanaya Bose', 'Meera Pillai', 'Navya Hegde',
  'Pooja Bhat', 'Neha Agarwal', 'Tanvi Jain', 'Varun Shetty', 'Karthik Rao',
  'Amit Tiwari', 'Sumit Mishra', 'Deepak Dubey', 'Manish Saxena', 'Suresh Babu',
  'Ramesh Naidu', 'Sunita Devi', 'Geeta Rani', 'Anita Kumari', 'Kavitha Gowda',
  'Siddharth Roy', 'Nikhil Das', 'Abhishek Sen', 'Akash Choudhary', 'Alok Bansal',
  'Aniket Chauhan', 'Bhavana Prasad', 'Charan Teja', 'Divya Bharathi', 'Eshwar Rao',
  'Ganesh Naik', 'Harsh Vardhan', 'Jatin Arora', 'Lokesh Yadav', 'Mohit Sharma'
];

const classesList = [
  { grade: '1st', section: 'A', count: 6 },
  { grade: '1st', section: 'B', count: 6 },
  { grade: '2nd', section: 'A', count: 6 },
  { grade: '2nd', section: 'B', count: 6 },
  { grade: '3rd', section: 'A', count: 6 },
  { grade: '3rd', section: 'B', count: 5 },
  { grade: '4th', section: 'A', count: 5 },
  { grade: '4th', section: 'B', count: 5 },
  { grade: '5th', section: 'A', count: 5 },
  { grade: '5th', section: 'B', count: 5 }
];

let generatedStudents: any[] = [];
let studentIdx = 0;

// Place Kavya Kumar (s1, 5th-A), Rahul Kumar (s2, 3rd-A), Ananya Singh (s3, 4th-A), and Sai Teja (s4, 2nd-A) in their exact sections
const pinnedStudents: Record<string, { id: string; name: string; email: string; gender: string; parentName: string; parentEmail: string; parentPhone: string; class: string; section: string }[]> = {
  '5th-A': [{ id: 's1', name: 'Kavya Kumar', email: 'kavya@ashivam.edu', gender: 'Female', parentName: 'Mr. Anil Kumar', parentEmail: 'kumar@ashivam.edu', parentPhone: '+91 98765 43210', class: '5th', section: 'A' }],
  '3rd-A': [{ id: 's2', name: 'Rahul Kumar', email: 'rahul@ashivam.edu', gender: 'Male', parentName: 'Mr. Anil Kumar', parentEmail: 'kumar@ashivam.edu', parentPhone: '+91 98765 43210', class: '3rd', section: 'A' }],
  '4th-A': [{ id: 's3', name: 'Ananya Singh', email: 'ananya@ashivam.edu', gender: 'Female', parentName: 'Mrs. Sunita Singh', parentEmail: 'singh@ashivam.edu', parentPhone: '+91 91234 56789', class: '4th', section: 'A' }],
  '2nd-A': [{ id: 's4', name: 'Sai Teja', email: 'sai@gmail.com', gender: 'Male', parentName: 'Mr. Srinivas Rao', parentEmail: 'srinivas@ashivam.edu', parentPhone: '+91 98480 12345', class: '2nd', section: 'A' }]
};

let rollCounter = 101;
classesList.forEach(cls => {
  const key = `${cls.grade}-${cls.section}`;
  const pinned = pinnedStudents[key] || [];
  pinned.forEach(p => {
    generatedStudents.push({
      id: p.id,
      studentId: `S${rollCounter}`,
      rollNumber: rollCounter,
      fullName: p.name,
      email: p.email,
      dob: '2015-05-12',
      gender: p.gender,
      class: p.class,
      section: p.section,
      academicYear: '2025-2026',
      bloodGroup: 'O+',
      address: 'Plot 42, Green Valley',
      parentName: p.parentName,
      parentEmail: p.parentEmail,
      parentPhone: p.parentPhone,
      attendancePercentage: 95.0,
      feeStatus: p.id === 's2' ? 'Pending' : 'Paid'
    });
    rollCounter++;
    studentIdx++;
  });

  const remaining = cls.count - pinned.length;
  for (let i = 0; i < remaining; i++) {
    const rawName = sampleNames[(studentIdx + 3) % sampleNames.length];
    const gender = studentIdx % 2 === 0 ? 'Female' : 'Male';
    const firstName = rawName.split(' ')[0];
    generatedStudents.push({
      id: `s_${rollCounter}`,
      studentId: `S${rollCounter}`,
      rollNumber: rollCounter,
      fullName: rawName,
      email: `${firstName.toLowerCase()}${rollCounter}@ashivam.edu`,
      dob: '2016-06-15',
      gender,
      class: cls.grade,
      section: cls.section,
      academicYear: '2025-2026',
      bloodGroup: studentIdx % 2 === 0 ? 'A+' : 'B+',
      address: `Plot ${rollCounter}, Green Valley`,
      parentName: `Parent of ${firstName}`,
      parentEmail: `parent${rollCounter}@ashivam.edu`,
      parentPhone: `+91 98765 ${String(10000 + rollCounter).slice(-5)}`,
      attendancePercentage: Number((89 + (studentIdx % 10)).toFixed(1)),
      feeStatus: studentIdx % 4 === 0 ? 'Pending' : 'Paid'
    });
    rollCounter++;
    studentIdx++;
  }
});

const commonStudentPasswordHash = bcrypt.hashSync('student123', 10);
const commonTeacherPasswordHash = bcrypt.hashSync('teacher123', 10);

const studentUsers = generatedStudents.map((s, idx) => ({
  id: `u_stud_${idx + 1}`,
  name: s.fullName,
  email: s.email,
  passwordHash: commonStudentPasswordHash,
  role: 'student',
  studentId: s.studentId,
  rollNumber: s.rollNumber,
  class: s.class,
  section: s.section
}));

const defaultDb = {
  seedVersion: 5,
  users: [
    { id: 'u1', name: 'Dr. R. K. Verma', email: 'admin@ashivam.edu', passwordHash: bcrypt.hashSync('admin123', 10), role: 'admin' },
    { id: 'u2', name: 'Mrs. Vannani Rao', email: 'vannani@ashivam.edu', passwordHash: bcrypt.hashSync('teacher123', 10), role: 'teacher', teacherId: 'T106', assignedClasses: ['3rd-A', '4th-A', '5th-A'], subjects: ['Maths'] },
    { id: 'u3', name: 'Mr. Rajesh Sharma', email: 'sharma@ashivam.edu', passwordHash: bcrypt.hashSync('teacher123', 10), role: 'teacher', teacherId: 'T104', assignedClasses: ['1st-A', '1st-B', '2nd-A'], subjects: ['English'] },
    { id: 'u4', name: 'Mr. Anil Kumar', email: 'kumar@ashivam.edu', passwordHash: bcrypt.hashSync('parent123', 10), role: 'parent', childrenIds: ['s1', 's2'] },
    { id: 'u5', name: 'Mrs. Sunita Singh', email: 'singh@ashivam.edu', passwordHash: bcrypt.hashSync('parent123', 10), role: 'parent', childrenIds: ['s3'] },
    ...studentUsers
  ],
  students: generatedStudents, // 55 students total (50-60 range)
  teachers: [
    { id: 't1', teacherId: 'T101', name: 'Dr. R. K. Verma', designation: 'School Principal', email: 'admin@ashivam.edu', phone: '+91 98000 11111', qualification: 'Ph.D. Education', experience: '20 Years', subject: 'Administration' },
    { id: 't2', teacherId: 'T102', name: 'Mrs. Sarojini Devi', designation: 'School Vice Principal', email: 'sarojini@ashivam.edu', phone: '+91 98000 22222', qualification: 'M.Ed., M.A.', experience: '15 Years', subject: 'Administration / Supervision' },
    { id: 't3', teacherId: 'T103', name: 'Mr. Venkat Rao', designation: 'Teacher', email: 'venkat@ashivam.edu', phone: '+91 98333 44556', qualification: 'M.A. Telugu, B.Ed.', experience: '10 Years', subject: 'Telugu' },
    { id: 't4', teacherId: 'T104', name: 'Mr. Rajesh Sharma', designation: 'Teacher', email: 'sharma@ashivam.edu', phone: '+91 98222 33445', qualification: 'M.A. English, D.El.Ed.', experience: '5 Years', subject: 'English' },
    { id: 't5', teacherId: 'T105', name: 'Mrs. Padma Latha', designation: 'Teacher', email: 'padma@ashivam.edu', phone: '+91 98444 55667', qualification: 'M.A. Hindi, B.Ed.', experience: '7 Years', subject: 'Hindi' },
    { id: 't6', teacherId: 'T106', name: 'Mrs. Vannani Rao', designation: 'Teacher', email: 'vannani@ashivam.edu', phone: '+91 98111 22334', qualification: 'M.Sc., B.Ed.', experience: '8 Years', subject: 'Maths' },
    { id: 't7', teacherId: 'T107', name: 'Dr. Ramesh Kumar', designation: 'Teacher', email: 'ramesh@ashivam.edu', phone: '+91 98555 66778', qualification: 'M.Sc. Physics, B.Ed.', experience: '9 Years', subject: 'Science' },
    { id: 't8', teacherId: 'T108', name: 'Ms. Divya Reddy', designation: 'Teacher', email: 'divya@ashivam.edu', phone: '+91 98666 77889', qualification: 'M.A. History, B.Ed.', experience: '6 Years', subject: 'Social' }
  ],
  parents: [
    { id: 'p1', parentId: 'P101', name: 'Mr. Anil Kumar', email: 'kumar@ashivam.edu', phone: '+91 98765 43210', address: 'Plot 42, Green Valley', childrenNames: ['Kavya Kumar (5th-A)', 'Rahul Kumar (3rd-A)'] },
    { id: 'p2', parentId: 'P102', name: 'Mrs. Sunita Singh', email: 'singh@ashivam.edu', phone: '+91 91234 56789', address: '18 Royal Palms', childrenNames: ['Ananya Singh (4th-A)'] }
  ],
  classes: [
    { id: 'c1', grade: '1st', section: 'A', room: 'Room 101' },
    { id: 'c2', grade: '1st', section: 'B', room: 'Room 102' },
    { id: 'c3', grade: '2nd', section: 'A', room: 'Room 103' },
    { id: 'c4', grade: '2nd', section: 'B', room: 'Room 104' },
    { id: 'c5', grade: '3rd', section: 'A', room: 'Room 105' },
    { id: 'c6', grade: '3rd', section: 'B', room: 'Room 106' },
    { id: 'c7', grade: '4th', section: 'A', room: 'Room 107' },
    { id: 'c8', grade: '4th', section: 'B', room: 'Room 108' },
    { id: 'c9', grade: '5th', section: 'A', room: 'Room 109' },
    { id: 'c10', grade: '5th', section: 'B', room: 'Room 110' }
  ],
  attendance: generatedStudents.map((s, idx) => ({
    id: `att_${idx + 1}`,
    date: '2026-11-16',
    class: s.class,
    section: s.section,
    studentId: s.id,
    studentName: s.fullName,
    status: idx % 7 === 0 ? 'Absent' : 'Present'
  })),
  fees: generatedStudents.map(s => ({
    id: `f_${s.id}`,
    studentId: s.id,
    studentName: s.fullName,
    class: `${s.class}-${s.section}`,
    totalAmount: 22000,
    paidAmount: s.feeStatus === 'Paid' ? 22000 : 10000,
    status: s.feeStatus
  })),
  examinations: [
    { id: 'ex1', examName: 'First Term Assessment 2026', class: '5th', subject: 'Mathematics', maxMarks: 100, passingMarks: 35 }
  ],
  results: generatedStudents.map((s, idx) => ({
    id: `res_${idx}`,
    studentId: s.id,
    studentName: s.fullName,
    class: `${s.class}-${s.section}`,
    subject: idx % 2 === 0 ? 'Telugu' : 'Mathematics',
    marksObtained: 82 + (idx % 16),
    maxMarks: 100,
    grade: idx % 3 === 0 ? 'A+' : 'A',
    remarks: 'Very good progress'
  })),
  notices: [
    { id: 'n1', title: 'Annual Sports Day 2026', description: 'Annual sports meet on Dec 20, 2026.', category: 'All', date: '2026-11-15' },
    { id: 'n2', title: 'Parent-Teacher Meeting', description: 'PTM scheduled for Saturday.', category: 'Parents', date: '2026-11-14' }
  ],
  feedback: [],
  inquiries: [],
  timetables: [
    '1st-A', '1st-B', '2nd-A', '2nd-B', '3rd-A', '3rd-B', '4th-A', '4th-B', '5th-A', '5th-B'
  ].map((cls, idx) => {
    const isLower = cls.startsWith('1st') || cls.startsWith('2nd');
    const rotate = (arr: string[], offset: number) => arr.map((_, i) => arr[(i + offset) % arr.length]);
    const core = isLower
      ? ['Telugu', 'English', 'Maths', 'Hindi', 'EVS']
      : ['Telugu', 'English', 'Maths', 'Science', 'Social'];
    const extras = ['Hindi', 'Computer Lab', 'Sports', 'Library', 'Art & Craft', 'Activity'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const times = ['09:00 AM', '09:50 AM', '10:50 AM', '11:40 AM', '01:15 PM'];
    return {
      id: `tt${idx + 1}`,
      class: cls,
      schedule: days.map((day, dIdx) => {
        const daySubjects = rotate(core, dIdx + idx);
        const periods = day === 'Saturday'
          ? [
              `${times[0]} • ${daySubjects[0]}`,
              `${times[1]} • ${daySubjects[2]}`,
              `${times[2]} • ${extras[(idx + dIdx) % extras.length]}`,
              `${times[3]} • Sports / Games`
            ]
          : [
              `${times[0]} • ${daySubjects[0]}`,
              `${times[1]} • ${daySubjects[1]}`,
              `${times[2]} • ${daySubjects[2]}`,
              `${times[3]} • ${daySubjects[3]}`,
              `${times[4]} • ${dIdx % 2 === 0 ? daySubjects[4] : extras[(idx + dIdx) % extras.length]}`
            ];
        return { day, periods };
      })
    };
  })
};

function readDb() {
  try {
    const sourceFile = fs.existsSync(DB_FILE)
      ? DB_FILE
      : process.env.VERCEL && fs.existsSync(SEED_DB_FILE)
        ? SEED_DB_FILE
        : null;
    if (sourceFile) {
      const parsed = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
      if (parsed && parsed.seedVersion === defaultDb.seedVersion) {
        if (!Array.isArray(parsed.inquiries)) parsed.inquiries = [];
        if (!Array.isArray(parsed.feedback)) parsed.feedback = [];
        if (!Array.isArray(parsed.attendance)) parsed.attendance = [];
        if (sourceFile === SEED_DB_FILE && !fs.existsSync(DB_FILE)) {
          writeDb(parsed);
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error(e);
  }
  writeDb(defaultDb);
  return defaultDb;
}

function writeDb(data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(e);
  }
}

export function createApp() {
  const app = express();
  app.use(express.json());

  // Initialize fresh database on startup if needed
  readDb();

  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token required' });
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });
      req.user = user;
      next();
    });
  };

  app.post('/api/auth/login', (req, res) => {
    const cleanEmail = String(req.body.email || '').trim().toLowerCase();
    const cleanPassword = String(req.body.password || '').trim();
    const db = readDb();
    let user = db.users.find((u: any) => String(u.email || '').trim().toLowerCase() === cleanEmail);

    // Fallback: if a student or teacher exists in db without a user record, auto-provision their user
    if (!user && cleanEmail) {
      const studentRec = db.students.find((s: any) => String(s.email || '').trim().toLowerCase() === cleanEmail);
      if (studentRec) {
        user = {
          id: `u_stud_${Date.now()}`,
          name: studentRec.fullName,
          email: studentRec.email,
          passwordHash: commonStudentPasswordHash,
          role: 'student',
          studentId: studentRec.studentId,
          rollNumber: studentRec.rollNumber,
          class: studentRec.class,
          section: studentRec.section
        };
        db.users.push(user);
        writeDb(db);
      } else {
        const teacherRec = db.teachers.find((t: any) => String(t.email || '').trim().toLowerCase() === cleanEmail);
        if (teacherRec) {
          user = {
            id: `u_teach_${Date.now()}`,
            name: teacherRec.name,
            email: teacherRec.email,
            passwordHash: commonTeacherPasswordHash,
            role: 'teacher',
            teacherId: teacherRec.teacherId,
            assignedClasses: Array.isArray(teacherRec.assignedClasses) && teacherRec.assignedClasses.length > 0
              ? teacherRec.assignedClasses
              : ['3rd-A', '4th-A', '5th-A'],
            subjects: teacherRec.subject ? [teacherRec.subject] : []
          };
          db.users.push(user);
          writeDb(db);
        }
      }
    }

    const isStudentCommonPassword =
      user?.role === 'student' &&
      cleanPassword.toLowerCase() === 'student123' &&
      bcrypt.compareSync('student123', user.passwordHash);

    const isTeacherCommonPassword =
      user?.role === 'teacher' &&
      cleanPassword.toLowerCase() === 'teacher123' &&
      bcrypt.compareSync('teacher123', user.passwordHash);

    if (!user || (!bcrypt.compareSync(cleanPassword, user.passwordHash) && !isStudentCommonPassword && !isTeacherCommonPassword)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const tokenPayload = {
      id: user.id, email: user.email, role: user.role, name: user.name,
      teacherId: user.teacherId, assignedClasses: user.assignedClasses,
      childrenIds: user.childrenIds, studentId: user.studentId, rollNumber: user.rollNumber,
      class: user.class, section: user.section
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: tokenPayload });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  app.get('/api/students', authenticateToken, (req: any, res) => {
    const db = readDb();
    let students = db.students;
    if (req.user.role === 'teacher') {
      const assigned = req.user.assignedClasses || [];
      students = students.filter((s: any) => assigned.includes(`${s.class}-${s.section}`) || assigned.includes('All Classes'));
    } else if (req.user.role === 'parent') {
      const childrenIds = req.user.childrenIds || [];
      students = students.filter((s: any) => childrenIds.includes(s.id));
    } else if (req.user.role === 'student') {
      students = students.filter(
        (s: any) =>
          (req.user.studentId && s.studentId === req.user.studentId) ||
          s.email.toLowerCase() === String(req.user.email || '').toLowerCase()
      );
    }
    res.json(students);
  });

  app.get('/api/students/:id', authenticateToken, (req: any, res) => {
    const db = readDb();
    const student = db.students.find((s: any) => s.id === req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    if (req.user.role === 'student' && String(req.user.email || '').toLowerCase() !== String(student.email || '').toLowerCase()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (req.user.role === 'parent' && !(req.user.childrenIds || []).includes(student.id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (req.user.role === 'teacher') {
      const assigned = req.user.assignedClasses || [];
      if (!assigned.includes(`${student.class}-${student.section}`) && !assigned.includes('All Classes')) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }

    const results = db.results.filter((r: any) => r.studentId === student.id);
    const attendance = db.attendance.filter((a: any) => a.studentId === student.id);
    const fees = db.fees.find((f: any) => f.studentId === student.id);
    res.json({ student, results, attendance, fees });
  });

  app.post('/api/students', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = readDb();
    const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
    if (normalizedEmail && db.users.some((u: any) => String(u.email || '').toLowerCase() === normalizedEmail)) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }
    const nextRoll = Math.max(...db.students.map((s: any) => Number(s.rollNumber) || 100), 100) + 1;
    const newStudent = {
      id: `s_${Date.now()}`,
      studentId: `S${nextRoll}`,
      rollNumber: nextRoll,
      attendancePercentage: 95,
      feeStatus: 'Pending',
      ...req.body,
      email: normalizedEmail || req.body.email
    };
    db.students.push(newStudent);
    db.attendance.push({
      id: `att_${newStudent.id}`,
      date: new Date().toISOString().split('T')[0],
      class: newStudent.class,
      section: newStudent.section,
      studentId: newStudent.id,
      studentName: newStudent.fullName,
      status: 'Present'
    });
    db.fees.push({
      id: `f_${newStudent.id}`,
      studentId: newStudent.id,
      studentName: newStudent.fullName,
      class: `${newStudent.class}-${newStudent.section}`,
      totalAmount: 22000,
      paidAmount: 0,
      status: 'Pending'
    });
    if (newStudent.email) {
      db.users.push({
        id: `u_${Date.now()}`,
        name: newStudent.fullName,
        email: newStudent.email,
        passwordHash: commonStudentPasswordHash,
        role: 'student',
        studentId: newStudent.studentId,
        rollNumber: newStudent.rollNumber,
        class: newStudent.class,
        section: newStudent.section
      });
    }
    writeDb(db);
    res.status(201).json(newStudent);
  });

  app.patch('/api/students/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = readDb();
    const idx = db.students.findIndex((s: any) => s.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Student not found' });
    const updated = { ...db.students[idx], ...req.body };
    db.students[idx] = updated;
    const feeIdx = db.fees.findIndex((f: any) => f.studentId === updated.id);
    if (feeIdx !== -1) {
      db.fees[feeIdx].studentName = updated.fullName;
      db.fees[feeIdx].class = `${updated.class}-${updated.section}`;
    }
    writeDb(db);
    res.json(updated);
  });

  app.delete('/api/students/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = readDb();
    const student = db.students.find((s: any) => s.id === req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    db.students = db.students.filter((s: any) => s.id !== req.params.id);
    db.fees = db.fees.filter((f: any) => f.studentId !== req.params.id);
    db.results = db.results.filter((r: any) => r.studentId !== req.params.id);
    db.attendance = db.attendance.filter((a: any) => a.studentId !== req.params.id);
    db.users = db.users.filter(
      (u: any) =>
        u.role !== 'student' ||
        (u.studentId !== student.studentId && String(u.email || '').toLowerCase() !== String(student.email || '').toLowerCase())
    );
    writeDb(db);
    res.json({ success: true });
  });

  app.get('/api/teachers', authenticateToken, (req: any, res) => {
    const db = readDb();
    res.json(db.teachers);
  });

  app.post('/api/teachers', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = readDb();
    const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
    if (normalizedEmail && db.users.some((u: any) => String(u.email || '').trim().toLowerCase() === normalizedEmail)) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }
    const assignedClasses =
      Array.isArray(req.body.assignedClasses) && req.body.assignedClasses.length > 0
        ? req.body.assignedClasses
        : ['3rd-A', '4th-A'];
    const teacherId = `T${101 + db.teachers.length}`;
    const newTeacher = {
      id: `t_${Date.now()}`,
      teacherId,
      qualification: req.body.qualification || 'M.A., B.Ed.',
      experience: req.body.experience || '1 Year',
      ...req.body,
      email: normalizedEmail || req.body.email,
      assignedClasses
    };
    db.teachers.push(newTeacher);
    if (newTeacher.email) {
      db.users.push({
        id: `u_teach_${Date.now()}`,
        name: newTeacher.name,
        email: newTeacher.email,
        passwordHash: commonTeacherPasswordHash,
        role: 'teacher',
        teacherId: newTeacher.teacherId,
        assignedClasses,
        subjects: newTeacher.subject ? [newTeacher.subject] : []
      });
    }
    writeDb(db);
    res.status(201).json(newTeacher);
  });

  app.delete('/api/teachers/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = readDb();
    const teacher = db.teachers.find((t: any) => t.id === req.params.id);
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    if (teacher.id === 't1') return res.status(400).json({ error: 'Cannot remove School Principal' });
    db.teachers = db.teachers.filter((t: any) => t.id !== req.params.id);
    db.users = db.users.filter(
      (u: any) =>
        u.role !== 'teacher' ||
        (u.teacherId !== teacher.teacherId && String(u.email || '').toLowerCase() !== String(teacher.email || '').toLowerCase())
    );
    writeDb(db);
    res.json({ success: true });
  });

  app.get('/api/classes', authenticateToken, (req: any, res) => {
    const db = readDb();
    let classes = db.classes;
    if (req.user.role === 'teacher') {
      const assigned = req.user.assignedClasses || [];
      classes = classes.filter((c: any) => assigned.includes(`${c.grade}-${c.section}`) || assigned.includes('All Classes'));
    }
    res.json(classes);
  });

  app.get('/api/attendance', authenticateToken, (req: any, res) => {
    const db = readDb();
    let records = db.attendance || [];
    if (req.user.role === 'teacher') {
      const assigned = req.user.assignedClasses || [];
      records = records.filter((a: any) => assigned.includes(`${a.class}-${a.section}`) || assigned.includes('All Classes'));
    } else if (req.user.role === 'parent') {
      const childrenIds = req.user.childrenIds || [];
      records = records.filter((a: any) => childrenIds.includes(a.studentId));
    } else if (req.user.role === 'student') {
      const userEmail = String(req.user.email || '').toLowerCase();
      const st = db.students.find((s: any) => String(s.email || '').toLowerCase() === userEmail || (req.user.studentId && s.studentId === req.user.studentId));
      records = records.filter((a: any) => a.studentId === (st ? st.id : ''));
    }
    res.json(records);
  });

  app.post('/api/attendance', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const { studentId, status, date } = req.body;
    const db = readDb();
    const studentIdx = db.students.findIndex((s: any) => s.id === studentId);
    if (studentIdx === -1) return res.status(404).json({ error: 'Student not found' });
    const student = db.students[studentIdx];
    const clsSec = `${student.class}-${student.section}`;
    if (req.user.role === 'teacher') {
      const assigned = req.user.assignedClasses || [];
      if (!assigned.includes(clsSec) && !assigned.includes('All Classes')) {
        return res.status(403).json({ error: 'Not assigned to this class' });
      }
    }
    const targetDate = date || new Date().toISOString().split('T')[0];
    const existingIdx = db.attendance.findIndex((a: any) => a.studentId === student.id && a.date === targetDate);
    if (existingIdx !== -1) {
      db.attendance[existingIdx].status = status;
    } else {
      db.attendance.push({
        id: `att_${Date.now()}`,
        date: targetDate,
        class: student.class,
        section: student.section,
        studentId: student.id,
        studentName: student.fullName,
        status
      });
    }
    const studentRecords = db.attendance.filter((a: any) => a.studentId === student.id);
    const presentCount = studentRecords.filter((a: any) => a.status === 'Present').length;
    const pct = studentRecords.length > 0 ? Number(((presentCount / studentRecords.length) * 100).toFixed(1)) : student.attendancePercentage;
    db.students[studentIdx].attendancePercentage = pct;
    writeDb(db);
    res.json({ success: true, attendancePercentage: pct, status });
  });

  app.get('/api/fees', authenticateToken, (req: any, res) => {
    const db = readDb();
    let fees = db.fees;
    if (req.user.role === 'teacher') {
      const assigned = req.user.assignedClasses || [];
      fees = fees.filter((f: any) => assigned.includes(f.class) || assigned.includes('All Classes'));
    } else if (req.user.role === 'student') {
      const userEmail = String(req.user.email || '').toLowerCase();
      const st = db.students.find((s: any) => String(s.email || '').toLowerCase() === userEmail || (req.user.studentId && s.studentId === req.user.studentId));
      fees = fees.filter((f: any) => f.studentId === (st ? st.id : ''));
    } else if (req.user.role === 'parent') {
      const childrenIds = req.user.childrenIds || [];
      fees = fees.filter((f: any) => childrenIds.includes(f.studentId));
    }
    res.json(fees);
  });

  app.patch('/api/fees/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = readDb();
    const feeIdx = db.fees.findIndex((f: any) => f.id === req.params.id);
    if (feeIdx === -1) return res.status(404).json({ error: 'Fee record not found' });
    const fee = db.fees[feeIdx];
    const nextStatus = req.body.status || (fee.status === 'Paid' ? 'Pending' : 'Paid');
    const nextPaid = typeof req.body.paidAmount === 'number'
      ? req.body.paidAmount
      : (nextStatus === 'Paid' ? fee.totalAmount : 10000);
    db.fees[feeIdx] = { ...fee, paidAmount: nextPaid, status: nextStatus };
    const studIdx = db.students.findIndex((s: any) => s.id === fee.studentId);
    if (studIdx !== -1) {
      db.students[studIdx].feeStatus = nextStatus;
    }
    writeDb(db);
    res.json(db.fees[feeIdx]);
  });

  app.get('/api/results', authenticateToken, (req: any, res) => {
    const db = readDb();
    let results = db.results;
    if (req.user.role === 'teacher') {
      const assigned = req.user.assignedClasses || [];
      results = results.filter((r: any) => assigned.includes(r.class) || assigned.includes('All Classes'));
    } else if (req.user.role === 'student') {
      const userEmail = String(req.user.email || '').toLowerCase();
      const st = db.students.find((s: any) => String(s.email || '').toLowerCase() === userEmail || (req.user.studentId && s.studentId === req.user.studentId));
      results = results.filter((r: any) => r.studentId === (st ? st.id : ''));
    } else if (req.user.role === 'parent') {
      const childrenIds = req.user.childrenIds || [];
      results = results.filter((r: any) => childrenIds.includes(r.studentId));
    }
    res.json(results);
  });

  app.post('/api/results', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const db = readDb();
    const student = db.students.find((s: any) => s.id === req.body.studentId);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    const clsSec = `${student.class}-${student.section}`;
    if (req.user.role === 'teacher') {
      const assigned = req.user.assignedClasses || [];
      if (!assigned.includes(clsSec) && !assigned.includes('All Classes')) {
        return res.status(403).json({ error: 'Not assigned to this class' });
      }
    }
    const marksObtained = Number(req.body.marksObtained) || 0;
    const maxMarks = Number(req.body.maxMarks) || 100;
    const pct = maxMarks > 0 ? (marksObtained / maxMarks) * 100 : 0;
    const grade = req.body.grade || (pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 35 ? 'C' : 'F');
    const newResult = {
      id: `res_${Date.now()}`,
      studentId: student.id,
      studentName: student.fullName,
      class: clsSec,
      subject: req.body.subject || 'Mathematics',
      marksObtained,
      maxMarks,
      grade,
      remarks: req.body.remarks || 'Good progress'
    };
    db.results.push(newResult);
    writeDb(db);
    res.status(201).json(newResult);
  });

  app.delete('/api/results/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const db = readDb();
    const resItem = db.results.find((r: any) => r.id === req.params.id);
    if (!resItem) return res.status(404).json({ error: 'Result not found' });
    if (req.user.role === 'teacher') {
      const assigned = req.user.assignedClasses || [];
      if (!assigned.includes(resItem.class) && !assigned.includes('All Classes')) {
        return res.status(403).json({ error: 'Not assigned to this class' });
      }
    }
    db.results = db.results.filter((r: any) => r.id !== req.params.id);
    writeDb(db);
    res.json({ success: true });
  });

  app.get('/api/notices', authenticateToken, (req: any, res) => {
    const db = readDb();
    res.json(db.notices);
  });

  app.post('/api/notices', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = readDb();
    const notice = { id: `n_${Date.now()}`, date: new Date().toISOString().split('T')[0], ...req.body };
    db.notices.unshift(notice);
    writeDb(db);
    res.status(201).json(notice);
  });

  app.delete('/api/notices/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = readDb();
    db.notices = db.notices.filter((n: any) => n.id !== req.params.id);
    writeDb(db);
    res.json({ success: true });
  });

  app.get('/api/timetables', authenticateToken, (req: any, res) => {
    const db = readDb();
    let tt = db.timetables;
    if (req.user.role === 'teacher') {
      const assigned = req.user.assignedClasses || [];
      tt = tt.filter((t: any) => assigned.includes(t.class) || assigned.includes('All Classes'));
    } else if (req.user.role === 'student') {
      if (req.user.class && req.user.section) {
        tt = tt.filter((t: any) => t.class === `${req.user.class}-${req.user.section}`);
      }
    } else if (req.user.role === 'parent') {
      const childrenIds = req.user.childrenIds || [];
      const childClasses = db.students
        .filter((s: any) => childrenIds.includes(s.id))
        .map((s: any) => `${s.class}-${s.section}`);
      if (childClasses.length > 0) {
        tt = tt.filter((t: any) => childClasses.includes(t.class));
      }
    }
    res.json(tt);
  });

  app.put('/api/timetables/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = readDb();
    const idx = db.timetables.findIndex((t: any) => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Timetable not found' });
    db.timetables[idx] = { ...db.timetables[idx], schedule: req.body.schedule || db.timetables[idx].schedule };
    writeDb(db);
    res.json(db.timetables[idx]);
  });

  app.post('/api/feedback', authenticateToken, (req: any, res) => {
    const db = readDb();
    const feedback = { id: `fb_${Date.now()}`, date: new Date().toISOString().split('T')[0], sender: req.user.name, senderEmail: req.user.email, ...req.body };
    db.feedback.unshift(feedback);
    writeDb(db);
    res.status(201).json({ success: true, message: 'Sent!', feedback });
  });

  app.get('/api/feedback', authenticateToken, (req: any, res) => {
    const db = readDb();
    let list = db.feedback || [];
    if (req.user.role === 'parent') {
      list = list.filter((fb: any) => fb.senderEmail === req.user.email || fb.sender === req.user.name);
    } else if (req.user.role === 'teacher') {
      list = list.filter((fb: any) => !fb.teacherName || fb.teacherName === req.user.name);
    }
    res.json(list);
  });

  app.get('/api/stats', authenticateToken, (req: any, res) => {
    const db = readDb();
    if (req.user.role === 'teacher') {
      const assigned = req.user.assignedClasses || [];
      const assignedStudents = db.students.filter((s: any) => assigned.includes(`${s.class}-${s.section}`) || assigned.includes('All Classes'));
      return res.json({
        totalStudents: assignedStudents.length,
        totalTeachers: db.teachers.length,
        totalClasses: assigned.length
      });
    }
    res.json({
      totalStudents: db.students.length,
      totalTeachers: db.teachers.length,
      totalClasses: 5
    });
  });

  app.post('/api/contact', (req, res) => {
    const db = readDb();
    const inquiry = {
      id: `inq_${Date.now()}`,
      name: String(req.body.name || '').trim(),
      email: String(req.body.email || '').trim(),
      phone: String(req.body.phone || '').trim(),
      message: String(req.body.message || '').trim(),
      status: 'New',
      date: new Date().toISOString().split('T')[0]
    };
    if (!inquiry.name || !inquiry.email || !inquiry.message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    if (!Array.isArray(db.inquiries)) db.inquiries = [];
    db.inquiries.unshift(inquiry);
    writeDb(db);
    res.status(201).json({ success: true, inquiry });
  });

  app.get('/api/inquiries', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = readDb();
    res.json(db.inquiries || []);
  });

  app.patch('/api/inquiries/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = readDb();
    if (!Array.isArray(db.inquiries)) db.inquiries = [];
    const idx = db.inquiries.findIndex((i: any) => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Inquiry not found' });
    db.inquiries[idx].status = req.body.status || 'Contacted';
    writeDb(db);
    res.json(db.inquiries[idx]);
  });

  app.get('/api/health', (req, res) => {
    const db = readDb();
    res.json({
      status: 'ok',
      database: 'json-file',
      counts: {
        students: db.students.length,
        teachers: db.teachers.length,
        users: db.users.length,
        fees: db.fees.length,
        results: db.results.length,
        inquiries: (db.inquiries || []).length
      }
    });
  });

  return app;
}

async function startServer() {
  const app = createApp();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true } });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'dist', 'index.html')));
  }

  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
}

if (!process.env.VERCEL) {
  startServer();
}
