import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

export interface SqliteStatement {
  get: (...params: any[]) => any;
  all: (...params: any[]) => any[];
  run: (...params: any[]) => { changes?: number };
}

export interface SqliteDatabase {
  exec: (sql: string) => void;
  prepare: (sql: string) => SqliteStatement;
}

type DatabaseSync = SqliteDatabase;

let activeEngineName = 'SQLite 3 (Node Built-in node:sqlite)';
export function getDbEngine() {
  return activeEngineName;
}

function tryLoadNodeSqlite(dbFilePath: string): SqliteDatabase | null {
  try {
    const baseUrl =
      typeof import.meta !== 'undefined' && import.meta.url
        ? import.meta.url
        : path.join(process.cwd(), 'package.json');
    const req = createRequire(baseUrl);
    const sqliteMod = req('node:sqlite');
    if (sqliteMod && typeof sqliteMod.DatabaseSync === 'function') {
      activeEngineName = 'SQLite 3 (Node Built-in node:sqlite)';
      return new sqliteMod.DatabaseSync(dbFilePath);
    }
    return null;
  } catch {
    return null;
  }
}

function sanitizeBindParams(params: any[]): any[] {
  return params.map(p => (p === undefined ? null : p));
}

function wrapSqlJsDb(rawDb: any): SqliteDatabase {
  return {
    exec: (sql: string) => {
      rawDb.exec(sql);
    },
    prepare: (sql: string) => ({
      get: (...params: any[]) => {
        const stmt = rawDb.prepare(sql);
        try {
          if (params.length > 0) stmt.bind(sanitizeBindParams(params));
          return stmt.step() ? stmt.getAsObject() : undefined;
        } finally {
          stmt.free();
        }
      },
      all: (...params: any[]) => {
        const stmt = rawDb.prepare(sql);
        try {
          if (params.length > 0) stmt.bind(sanitizeBindParams(params));
          const rows: any[] = [];
          while (stmt.step()) {
            rows.push(stmt.getAsObject());
          }
          return rows;
        } finally {
          stmt.free();
        }
      },
      run: (...params: any[]) => {
        if (params.length > 0) {
          rawDb.run(sql, sanitizeBindParams(params));
        } else {
          rawDb.run(sql);
        }
        return { changes: typeof rawDb.getRowsModified === 'function' ? rawDb.getRowsModified() : 0 };
      }
    })
  };
}

async function createSqlJsDatabase(dbFilePath: string): Promise<SqliteDatabase> {
  const mod: any = await import('sql.js/dist/sql-wasm-inline.js');
  const initSqlJs = mod.default || mod;
  const SQL = await initSqlJs();
  const existingBytes = fs.existsSync(dbFilePath) ? fs.readFileSync(dbFilePath) : undefined;
  const rawDb = existingBytes && existingBytes.length > 0 ? new SQL.Database(existingBytes) : new SQL.Database();
  activeEngineName = 'SQLite 3 (Serverless sql.js WASM)';
  return wrapSqlJsDb(rawDb);
}

const __filename = typeof import.meta !== 'undefined' && import.meta.url ? fileURLToPath(import.meta.url) : '';
const __dirname = __filename ? path.dirname(__filename) : process.cwd();

const candidateSeedPaths = [
  path.resolve(process.cwd(), 'data', 'db.json'),
  path.resolve(__dirname, 'data', 'db.json'),
  path.resolve(__dirname, '..', 'data', 'db.json')
];
const SEED_JSON_FILE = candidateSeedPaths.find(p => fs.existsSync(p)) || candidateSeedPaths[0];
const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'ashivam-data') : path.resolve(process.cwd(), 'data');
export const SQLITE_DB_FILE = path.join(DATA_DIR, 'ashivam.db');
const LEGACY_JSON_FILE = path.join(DATA_DIR, 'db.json');

export const commonStudentPasswordHash = bcrypt.hashSync('student123', 10);
export const commonTeacherPasswordHash = bcrypt.hashSync('teacher123', 10);

function buildDefaultSeedData() {
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

  const pinnedStudents: Record<string, { id: string; name: string; email: string; gender: string; parentName: string; parentEmail: string; parentPhone: string; class: string; section: string }[]> = {
    '5th-A': [{ id: 's1', name: 'Kavya Kumar', email: 'kavya@ashivam.edu', gender: 'Female', parentName: 'Mr. Anil Kumar', parentEmail: 'kumar@ashivam.edu', parentPhone: '+91 98765 43210', class: '5th', section: 'A' }],
    '3rd-A': [{ id: 's2', name: 'Rahul Kumar', email: 'rahul@ashivam.edu', gender: 'Male', parentName: 'Mr. Anil Kumar', parentEmail: 'kumar@ashivam.edu', parentPhone: '+91 98765 43210', class: '3rd', section: 'A' }],
    '4th-A': [{ id: 's3', name: 'Ananya Singh', email: 'ananya@ashivam.edu', gender: 'Female', parentName: 'Mrs. Sunita Singh', parentEmail: 'singh@ashivam.edu', parentPhone: '+91 91234 56789', class: '4th', section: 'A' }],
    '2nd-A': [{ id: 's4', name: 'Sai Teja', email: 'sai@gmail.com', gender: 'Male', parentName: 'Mr. Srinivas Rao', parentEmail: 'srinivas@ashivam.edu', parentPhone: '+91 98480 12345', class: '2nd', section: 'A' }]
  };

  const generatedStudents: any[] = [];
  let studentIdx = 0;
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

  const teachers = [
    { id: 't1', teacherId: 'T101', name: 'Dr. Ramesh Babu', designation: 'Principal', email: 'principal@ashivam.edu', phone: '+91 90000 11111', qualification: 'Ph.D., M.Ed.', experience: '22 Years', subject: 'Administration & Moral Science', assignedClasses: ['All Classes'] },
    { id: 't2', teacherId: 'T102', name: 'Mrs. Sarojini Devi', designation: 'Vice Principal', email: 'sarojini@ashivam.edu', phone: '+91 90000 22222', qualification: 'M.A., B.Ed.', experience: '16 Years', subject: 'Social Studies', assignedClasses: ['5th-A', '5th-B'] },
    { id: 't3', teacherId: 'T103', name: 'Mrs. Vannani Rao', designation: 'Class Teacher', email: 'vannani@ashivam.edu', phone: '+91 90000 33333', qualification: 'M.Sc., B.Ed.', experience: '10 Years', subject: 'Mathematics', assignedClasses: ['3rd-A', '4th-A', '5th-A'] },
    { id: 't4', teacherId: 'T104', name: 'Mr. Rajesh Sharma', designation: 'Class Teacher', email: 'sharma@ashivam.edu', phone: '+91 90000 44444', qualification: 'M.A. English, B.Ed.', experience: '8 Years', subject: 'English', assignedClasses: ['1st-A', '1st-B', '2nd-A'] },
    { id: 't5', teacherId: 'T105', name: 'Mr. Venkat Rao', designation: 'Senior Teacher', email: 'venkat@ashivam.edu', phone: '+91 90000 55555', qualification: 'M.A. Telugu, TPT', experience: '12 Years', subject: 'Telugu', assignedClasses: ['2nd-B', '3rd-B', '4th-B'] },
    { id: 't6', teacherId: 'T106', name: 'Mrs. Padma Kumari', designation: 'Teacher', email: 'padma@ashivam.edu', phone: '+91 90000 66666', qualification: 'M.A. Hindi, HPT', experience: '9 Years', subject: 'Hindi', assignedClasses: ['1st-A', '2nd-A', '3rd-A'] },
    { id: 't7', teacherId: 'T107', name: 'Mrs. Divya Nair', designation: 'Teacher', email: 'divya@ashivam.edu', phone: '+91 90000 77777', qualification: 'M.Sc., B.Ed.', experience: '7 Years', subject: 'Science', assignedClasses: ['4th-A', '4th-B', '5th-A'] },
    { id: 't8', teacherId: 'T108', name: 'Mr. Karthik Reddy', designation: 'IT Instructor', email: 'karthik@ashivam.edu', phone: '+91 90000 88888', qualification: 'B.Tech, MCA', experience: '6 Years', subject: 'Computer Science', assignedClasses: ['3rd-A', '4th-A', '5th-A', '5th-B'] },
    { id: 't9', teacherId: 'T109', name: 'Mr. Suresh Kumar', designation: 'Physical Director', email: 'suresh@ashivam.edu', phone: '+91 90000 99999', qualification: 'M.P.Ed.', experience: '11 Years', subject: 'Physical Education & Sports', assignedClasses: ['All Classes'] }
  ];

  const users = [
    { id: 'u1', name: 'School Administrator', email: 'admin@ashivam.edu', passwordHash: bcrypt.hashSync('admin123', 10), role: 'admin' },
    ...teachers.map((t, idx) => ({
      id: idx === 0 ? 'u2_principal' : t.id === 't3' ? 'u2' : t.id === 't4' ? 'u3' : `u_teach_${t.id}`,
      name: t.name,
      email: t.email,
      passwordHash: commonTeacherPasswordHash,
      role: 'teacher',
      teacherId: t.teacherId,
      assignedClasses: t.assignedClasses,
      subjects: [t.subject]
    })),
    { id: 'u4', name: 'Mr. Anil Kumar', email: 'kumar@ashivam.edu', passwordHash: bcrypt.hashSync('parent123', 10), role: 'parent', childrenIds: ['s1', 's2'] },
    { id: 'u5', name: 'Mrs. Sunita Singh', email: 'singh@ashivam.edu', passwordHash: bcrypt.hashSync('parent123', 10), role: 'parent', childrenIds: ['s3'] },
    ...generatedStudents.map((s, idx) => ({
      id: `u_stud_${idx + 1}`,
      name: s.fullName,
      email: s.email,
      passwordHash: commonStudentPasswordHash,
      role: 'student',
      studentId: s.studentId,
      rollNumber: s.rollNumber,
      class: s.class,
      section: s.section
    }))
  ];

  const subjectsPool = ['Telugu', 'English', 'Mathematics', 'Science', 'Social', 'Hindi'];
  const times = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const extras = ['Computer Lab', 'Library & Reading', 'Art & Craft', 'Moral Science', 'Sports & Games'];

  const timetables = classesList.map((cls, idx) => ({
    id: `tt_${cls.grade}_${cls.section}`,
    class: `${cls.grade}-${cls.section}`,
    schedule: days.map((day, dIdx) => {
      const daySubjects = subjectsPool.map((_, sIdx) => subjectsPool[(idx + dIdx + sIdx) % subjectsPool.length]);
      const periods = day === 'Saturday'
        ? [
            `${times[0]} • ${daySubjects[0]}`,
            `${times[1]} • ${daySubjects[2]}`,
            `${times[2]} • ${extras[(idx + dIdx) % extras.length]}`,
            `${times[3]} • Sports & Co-Curricular`
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
  }));

  return {
    users,
    classes: classesList.map((c, idx) => ({
      id: `c_${c.grade}_${c.section}`,
      grade: c.grade,
      section: c.section,
      roomNumber: `Room 10${idx + 1}`,
      classTeacherName: idx % 2 === 0 ? 'Mrs. Vannani Rao' : 'Mr. Rajesh Sharma'
    })),
    students: generatedStudents,
    teachers,
    attendance: generatedStudents.map(s => ({
      id: `att_${s.id}`,
      date: '2026-03-19',
      class: s.class,
      section: s.section,
      studentId: s.id,
      studentName: s.fullName,
      status: 'Present'
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
    results: generatedStudents.map((s, idx) => ({
      id: `r_${s.id}`,
      studentId: s.id,
      studentName: s.fullName,
      class: `${s.class}-${s.section}`,
      subject: subjectsPool[idx % subjectsPool.length],
      marksObtained: 82 + (idx % 17),
      maxMarks: 100,
      grade: (82 + (idx % 17)) >= 90 ? 'A+' : 'A',
      remarks: 'Consistent progress and participation.'
    })),
    notices: [
      { id: 'n1', title: 'Annual Science & Arts Exhibition 2026', description: 'All primary students from Grade 1 to Grade 5 are encouraged to submit innovative science models by April 10th.', category: 'Event', date: '2026-03-18' },
      { id: 'n2', title: 'Term 2 Parent-Teacher Meeting (PTM)', description: 'PTM is scheduled for Saturday, April 18th from 9:00 AM to 1:00 PM across all classrooms.', category: 'Meeting', date: '2026-03-15' }
    ],
    feedback: [
      { id: 'fb1', date: '2026-03-17', sender: 'Mr. Anil Kumar', senderEmail: 'kumar@ashivam.edu', teacherName: 'Mrs. Vannani Rao', message: 'Thank you for helping Rahul improve his multiplication speed this week.' }
    ],
    inquiries: [],
    timetables
  };
}

let dbInstance: DatabaseSync | null = null;

function createTables(db: DatabaseSync) {
  db.exec(`
    PRAGMA foreign_keys = ON;
    ${!process.env.VERCEL ? 'PRAGMA journal_mode = WAL;' : ''}

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'teacher', 'student', 'parent')),
      student_id TEXT,
      teacher_id TEXT,
      roll_number INTEGER,
      class_grade TEXT,
      section TEXT,
      assigned_classes_json TEXT,
      subjects_json TEXT,
      children_ids_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      grade TEXT NOT NULL,
      section TEXT NOT NULL,
      class_section TEXT NOT NULL UNIQUE,
      room_number TEXT NOT NULL,
      class_teacher_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL UNIQUE,
      roll_number INTEGER NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      dob TEXT NOT NULL,
      gender TEXT NOT NULL,
      class_grade TEXT NOT NULL,
      section TEXT NOT NULL,
      academic_year TEXT NOT NULL DEFAULT '2025-2026',
      blood_group TEXT DEFAULT 'O+',
      address TEXT DEFAULT '',
      parent_name TEXT NOT NULL,
      parent_email TEXT DEFAULT '',
      parent_phone TEXT NOT NULL,
      attendance_percentage REAL NOT NULL DEFAULT 95.0,
      fee_status TEXT NOT NULL DEFAULT 'Pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      teacher_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      designation TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      qualification TEXT NOT NULL,
      experience TEXT NOT NULL,
      subject TEXT NOT NULL,
      assigned_classes_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      class_grade TEXT NOT NULL,
      section TEXT NOT NULL,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Present', 'Absent')),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS fees (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL UNIQUE,
      student_name TEXT NOT NULL,
      class_section TEXT NOT NULL,
      total_amount INTEGER NOT NULL DEFAULT 22000,
      paid_amount INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK(status IN ('Paid', 'Pending')),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS results (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      class_section TEXT NOT NULL,
      subject TEXT NOT NULL,
      marks_obtained INTEGER NOT NULL,
      max_marks INTEGER NOT NULL DEFAULT 100,
      grade TEXT NOT NULL,
      remarks TEXT DEFAULT '',
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS timetables (
      id TEXT PRIMARY KEY,
      class_section TEXT NOT NULL UNIQUE,
      schedule_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notices (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'All',
      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      sender TEXT NOT NULL,
      sender_email TEXT DEFAULT '',
      teacher_name TEXT NOT NULL,
      message TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'New',
      date TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_grade, section);
    CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id, date);
    CREATE INDEX IF NOT EXISTS idx_fees_status ON fees(status);
    CREATE INDEX IF NOT EXISTS idx_results_student ON results(student_id);
  `);
}

function importDataset(db: DatabaseSync, source: any) {
  db.exec('BEGIN');
  try {
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (
        id, name, email, password_hash, role, student_id, teacher_id,
        roll_number, class_grade, section, assigned_classes_json, subjects_json, children_ids_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const u of source.users || []) {
      insertUser.run(
        String(u.id),
        String(u.name || ''),
        String(u.email || '').trim().toLowerCase(),
        String(u.passwordHash || commonStudentPasswordHash),
        String(u.role || 'student'),
        u.studentId || null,
        u.teacherId || null,
        u.rollNumber ?? null,
        u.class || null,
        u.section || null,
        u.assignedClasses ? JSON.stringify(u.assignedClasses) : null,
        u.subjects ? JSON.stringify(u.subjects) : null,
        u.childrenIds ? JSON.stringify(u.childrenIds) : null
      );
    }

    const insertClass = db.prepare(`
      INSERT OR IGNORE INTO classes (id, grade, section, class_section, room_number, class_teacher_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const c of source.classes || []) {
      insertClass.run(
        String(c.id),
        String(c.grade),
        String(c.section),
        `${c.grade}-${c.section}`,
        String(c.roomNumber || 'Room 101'),
        String(c.classTeacherName || 'Mrs. Vannani Rao')
      );
    }

    const insertStudent = db.prepare(`
      INSERT OR IGNORE INTO students (
        id, student_id, roll_number, full_name, email, dob, gender, class_grade, section,
        academic_year, blood_group, address, parent_name, parent_email, parent_phone,
        attendance_percentage, fee_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of source.students || []) {
      insertStudent.run(
        String(s.id),
        String(s.studentId),
        Number(s.rollNumber),
        String(s.fullName),
        String(s.email).trim().toLowerCase(),
        String(s.dob || '2016-06-15'),
        String(s.gender || 'Female'),
        String(s.class),
        String(s.section),
        String(s.academicYear || '2025-2026'),
        String(s.bloodGroup || 'O+'),
        String(s.address || ''),
        String(s.parentName || 'Parent'),
        String(s.parentEmail || ''),
        String(s.parentPhone || ''),
        Number(s.attendancePercentage ?? 95),
        String(s.feeStatus || 'Pending')
      );
    }

    const insertTeacher = db.prepare(`
      INSERT OR IGNORE INTO teachers (
        id, teacher_id, name, designation, email, phone, qualification, experience, subject, assigned_classes_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const t of source.teachers || []) {
      insertTeacher.run(
        String(t.id),
        String(t.teacherId),
        String(t.name),
        String(t.designation || 'Teacher'),
        String(t.email).trim().toLowerCase(),
        String(t.phone || ''),
        String(t.qualification || 'B.Ed.'),
        String(t.experience || '1 Year'),
        String(t.subject || 'General'),
        JSON.stringify(Array.isArray(t.assignedClasses) ? t.assignedClasses : ['3rd-A', '4th-A'])
      );
    }

    const insertAttendance = db.prepare(`
      INSERT OR IGNORE INTO attendance (id, date, class_grade, section, student_id, student_name, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const a of source.attendance || []) {
      insertAttendance.run(
        String(a.id),
        String(a.date),
        String(a.class),
        String(a.section),
        String(a.studentId),
        String(a.studentName),
        a.status === 'Absent' ? 'Absent' : 'Present'
      );
    }

    const insertFee = db.prepare(`
      INSERT OR IGNORE INTO fees (id, student_id, student_name, class_section, total_amount, paid_amount, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const f of source.fees || []) {
      insertFee.run(
        String(f.id),
        String(f.studentId),
        String(f.studentName),
        String(f.class),
        Number(f.totalAmount ?? 22000),
        Number(f.paidAmount ?? 0),
        f.status === 'Paid' ? 'Paid' : 'Pending'
      );
    }

    const insertResult = db.prepare(`
      INSERT OR IGNORE INTO results (id, student_id, student_name, class_section, subject, marks_obtained, max_marks, grade, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const r of source.results || []) {
      insertResult.run(
        String(r.id),
        String(r.studentId),
        String(r.studentName),
        String(r.class),
        String(r.subject),
        Number(r.marksObtained ?? 0),
        Number(r.maxMarks ?? 100),
        String(r.grade || 'A'),
        String(r.remarks || '')
      );
    }

    const insertTimetable = db.prepare(`
      INSERT OR IGNORE INTO timetables (id, class_section, schedule_json)
      VALUES (?, ?, ?)
    `);
    for (const tt of source.timetables || []) {
      insertTimetable.run(
        String(tt.id),
        String(tt.class),
        JSON.stringify(tt.schedule || [])
      );
    }

    const insertNotice = db.prepare(`
      INSERT OR IGNORE INTO notices (id, title, description, category, date)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const n of source.notices || []) {
      insertNotice.run(
        String(n.id),
        String(n.title),
        String(n.description),
        String(n.category || 'All'),
        String(n.date || new Date().toISOString().split('T')[0])
      );
    }

    const insertFeedback = db.prepare(`
      INSERT OR IGNORE INTO feedback (id, date, sender, sender_email, teacher_name, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const fb of source.feedback || []) {
      insertFeedback.run(
        String(fb.id),
        String(fb.date || new Date().toISOString().split('T')[0]),
        String(fb.sender || 'Parent'),
        String(fb.senderEmail || ''),
        String(fb.teacherName || 'Class Teacher'),
        String(fb.message || '')
      );
    }

    const insertInquiry = db.prepare(`
      INSERT OR IGNORE INTO inquiries (id, name, email, phone, message, status, date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const inq of source.inquiries || []) {
      insertInquiry.run(
        String(inq.id),
        String(inq.name),
        String(inq.email),
        String(inq.phone || ''),
        String(inq.message),
        String(inq.status || 'New'),
        String(inq.date || new Date().toISOString().split('T')[0])
      );
    }

    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

function initializeDatabaseContents(db: SqliteDatabase) {
  createTables(db);

  const countRow = db.prepare('SELECT COUNT(*) as cnt FROM students').get() as { cnt: number };
  if (countRow.cnt === 0) {
    let sourceData: any = null;
    const jsonCandidate = fs.existsSync(LEGACY_JSON_FILE)
      ? LEGACY_JSON_FILE
      : candidateSeedPaths.find(p => fs.existsSync(p)) || (fs.existsSync(SEED_JSON_FILE) ? SEED_JSON_FILE : null);

    if (jsonCandidate) {
      try {
        const parsed = JSON.parse(fs.readFileSync(jsonCandidate, 'utf-8'));
        if (parsed && Array.isArray(parsed.students) && parsed.students.length > 0) {
          sourceData = parsed;
        }
      } catch (e) {
        console.error('Failed to read legacy JSON seed, using defaults:', e);
      }
    }

    importDataset(db, sourceData || buildDefaultSeedData());
  }

  dbInstance = db;
  if (!process.env.VERCEL) {
    syncDbToJson(db);
  }
}

let dbInitPromise: Promise<SqliteDatabase> | null = null;

export async function ensureDbReady(): Promise<SqliteDatabase> {
  if (dbInstance) return dbInstance;
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    const nativeDb = tryLoadNodeSqlite(SQLITE_DB_FILE);
    const db = nativeDb || (await createSqlJsDatabase(SQLITE_DB_FILE));
    initializeDatabaseContents(db);
    return db;
  })();

  try {
    return await dbInitPromise;
  } catch (err) {
    dbInitPromise = null;
    throw err;
  }
}

export function getDb(): SqliteDatabase {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const nativeDb = tryLoadNodeSqlite(SQLITE_DB_FILE);
  if (!nativeDb) {
    throw new Error('SQLite database is still initializing. Call ensureDbReady() first.');
  }
  initializeDatabaseContents(nativeDb);
  return nativeDb;
}

export function mapUserRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    studentId: row.student_id || undefined,
    teacherId: row.teacher_id || undefined,
    rollNumber: row.roll_number ?? undefined,
    class: row.class_grade || undefined,
    section: row.section || undefined,
    assignedClasses: row.assigned_classes_json ? JSON.parse(row.assigned_classes_json) : undefined,
    subjects: row.subjects_json ? JSON.parse(row.subjects_json) : undefined,
    childrenIds: row.children_ids_json ? JSON.parse(row.children_ids_json) : undefined
  };
}

export function mapStudentRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    studentId: row.student_id,
    rollNumber: row.roll_number,
    fullName: row.full_name,
    email: row.email,
    dob: row.dob,
    gender: row.gender,
    class: row.class_grade,
    section: row.section,
    academicYear: row.academic_year,
    bloodGroup: row.blood_group,
    address: row.address,
    parentName: row.parent_name,
    parentEmail: row.parent_email,
    parentPhone: row.parent_phone,
    attendancePercentage: row.attendance_percentage,
    feeStatus: row.fee_status
  };
}

export function mapTeacherRow(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    teacherId: row.teacher_id,
    name: row.name,
    designation: row.designation,
    email: row.email,
    phone: row.phone,
    qualification: row.qualification,
    experience: row.experience,
    subject: row.subject,
    assignedClasses: row.assigned_classes_json ? JSON.parse(row.assigned_classes_json) : []
  };
}

export function mapClassRow(row: any) {
  return {
    id: row.id,
    grade: row.grade,
    section: row.section,
    classSection: row.class_section,
    roomNumber: row.room_number,
    classTeacherName: row.class_teacher_name
  };
}

export function mapAttendanceRow(row: any) {
  return {
    id: row.id,
    date: row.date,
    class: row.class_grade,
    section: row.section,
    studentId: row.student_id,
    studentName: row.student_name,
    status: row.status
  };
}

export function mapFeeRow(row: any) {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    class: row.class_section,
    totalAmount: row.total_amount,
    paidAmount: row.paid_amount,
    status: row.status
  };
}

export function mapResultRow(row: any) {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    class: row.class_section,
    subject: row.subject,
    marksObtained: row.marks_obtained,
    maxMarks: row.max_marks,
    grade: row.grade,
    remarks: row.remarks
  };
}

export function mapTimetableRow(row: any) {
  return {
    id: row.id,
    class: row.class_section,
    schedule: row.schedule_json ? JSON.parse(row.schedule_json) : []
  };
}

export function mapFeedbackRow(row: any) {
  return {
    id: row.id,
    date: row.date,
    sender: row.sender,
    senderEmail: row.sender_email,
    teacherName: row.teacher_name,
    message: row.message
  };
}

export function syncDbToJson(dbArg?: DatabaseSync) {
  if (process.env.VERCEL) return;
  try {
    const db = dbArg || dbInstance || getDb();
    let existingExtra: Record<string, any> = {};
    if (fs.existsSync(LEGACY_JSON_FILE)) {
      try {
        const prev = JSON.parse(fs.readFileSync(LEGACY_JSON_FILE, 'utf-8'));
        if (prev && typeof prev === 'object') {
          if (prev.seedVersion !== undefined) existingExtra.seedVersion = prev.seedVersion;
          if (prev.parents !== undefined) existingExtra.parents = prev.parents;
          if (prev.examinations !== undefined) existingExtra.examinations = prev.examinations;
        }
      } catch {
        // Ignore malformed legacy metadata
      }
    }

    const users = db.prepare('SELECT * FROM users ORDER BY rowid ASC').all().map(mapUserRow);
    const students = db.prepare('SELECT * FROM students ORDER BY roll_number ASC').all().map(mapStudentRow);
    const teachers = db.prepare('SELECT * FROM teachers ORDER BY teacher_id ASC').all().map(mapTeacherRow);
    const classes = db.prepare('SELECT * FROM classes ORDER BY grade ASC, section ASC').all().map((row: any) => ({
      id: row.id,
      grade: row.grade,
      section: row.section,
      room: row.room_number,
      classTeacherName: row.class_teacher_name
    }));
    const attendance = db.prepare('SELECT * FROM attendance ORDER BY rowid ASC').all().map(mapAttendanceRow);
    const fees = db.prepare('SELECT * FROM fees ORDER BY rowid ASC').all().map(mapFeeRow);
    const results = db.prepare('SELECT * FROM results ORDER BY rowid ASC').all().map(mapResultRow);
    const notices = db.prepare('SELECT * FROM notices ORDER BY date DESC, rowid DESC').all();
    const feedback = db.prepare('SELECT * FROM feedback ORDER BY date DESC, rowid DESC').all().map(mapFeedbackRow);
    const inquiries = db.prepare('SELECT * FROM inquiries ORDER BY date DESC, rowid DESC').all();
    const timetables = db.prepare('SELECT * FROM timetables ORDER BY class_section ASC').all().map(mapTimetableRow);

    const snapshot = {
      ...existingExtra,
      users,
      students,
      teachers,
      classes,
      attendance,
      fees,
      examinations: existingExtra.examinations || [],
      results,
      notices,
      feedback,
      inquiries,
      timetables
    };

    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LEGACY_JSON_FILE, JSON.stringify(snapshot, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to sync SQLite snapshot to data/db.json:', err);
  }
}
