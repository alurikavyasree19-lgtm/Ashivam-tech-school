import express from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  getDb,
  SQLITE_DB_FILE,
  commonStudentPasswordHash,
  commonTeacherPasswordHash,
  mapUserRow,
  mapStudentRow,
  mapTeacherRow,
  mapClassRow,
  mapAttendanceRow,
  mapFeeRow,
  mapResultRow,
  mapTimetableRow,
  mapFeedbackRow,
  syncDbToJson
} from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'ashivam-tech-secret-key-2026';

const TABLE_DESCRIPTIONS: Record<string, string> = {
  users: 'Authentication accounts for Admin, Teachers, Students, and Parents with bcrypt hashes and role claims.',
  classes: 'Primary school grade-section rooms (1st-A through 5th-B) and homeroom teacher assignments.',
  students: 'Master student directory with roll numbers, contact info, attendance %, and fee status.',
  teachers: 'Faculty profiles, qualifications, primary subjects, and JSON array of assigned class sections.',
  attendance: 'Daily attendance logs linked via foreign key student_id -> students(id).',
  fees: 'Annual tuition ledger (₹22,000) linked 1:1 with each student via student_id.',
  results: 'Subject-wise examination marks, grades, and teacher remarks linked via student_id.',
  timetables: 'Weekly Monday–Saturday class period schedules stored per class_section.',
  notices: 'School-wide announcements, circulars, and upcoming event calendar items.',
  feedback: 'Direct leave notes and messages sent by parents to teachers.',
  inquiries: 'Public admission inquiries submitted from the website contact form.'
};

export function createApp() {
  const app = express();
  app.use(express.json());

  // Initialize SQLite schema & seed/migrate on startup
  getDb();

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
    const db = getDb();
    const cleanEmail = String(req.body.email || '').trim().toLowerCase();
    const cleanPassword = String(req.body.password || '').trim();

    let userRow: any = db.prepare('SELECT * FROM users WHERE LOWER(TRIM(email)) = ?').get(cleanEmail);
    let user = mapUserRow(userRow);

    // Auto-provision user login if student or teacher record exists without a user row
    if (!user && cleanEmail) {
      const studentRow: any = db.prepare('SELECT * FROM students WHERE LOWER(TRIM(email)) = ?').get(cleanEmail);
      if (studentRow) {
        const stud = mapStudentRow(studentRow)!;
        const newId = `u_stud_${Date.now()}`;
        db.prepare(`
          INSERT INTO users (id, name, email, password_hash, role, student_id, roll_number, class_grade, section)
          VALUES (?, ?, ?, ?, 'student', ?, ?, ?, ?)
        `).run(newId, stud.fullName, stud.email, commonStudentPasswordHash, stud.studentId, stud.rollNumber, stud.class, stud.section);
        user = mapUserRow(db.prepare('SELECT * FROM users WHERE id = ?').get(newId));
      } else {
        const teacherRow: any = db.prepare('SELECT * FROM teachers WHERE LOWER(TRIM(email)) = ?').get(cleanEmail);
        if (teacherRow) {
          const teacher = mapTeacherRow(teacherRow)!;
          const assigned = teacher.assignedClasses.length > 0 ? teacher.assignedClasses : ['3rd-A', '4th-A', '5th-A'];
          const newId = `u_teach_${Date.now()}`;
          db.prepare(`
            INSERT INTO users (id, name, email, password_hash, role, teacher_id, assigned_classes_json, subjects_json)
            VALUES (?, ?, ?, ?, 'teacher', ?, ?, ?)
          `).run(newId, teacher.name, teacher.email, commonTeacherPasswordHash, teacher.teacherId, JSON.stringify(assigned), JSON.stringify(teacher.subject ? [teacher.subject] : []));
          user = mapUserRow(db.prepare('SELECT * FROM users WHERE id = ?').get(newId));
        }
      }
      if (user) syncDbToJson(db);
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
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      teacherId: user.teacherId,
      assignedClasses: user.assignedClasses,
      childrenIds: user.childrenIds,
      studentId: user.studentId,
      rollNumber: user.rollNumber,
      class: user.class,
      section: user.section
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: tokenPayload });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  app.get('/api/students', authenticateToken, (req: any, res) => {
    const db = getDb();
    let students = db.prepare('SELECT * FROM students ORDER BY roll_number ASC').all().map(mapStudentRow);

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
    const db = getDb();
    const studentRow = db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id);
    const student = mapStudentRow(studentRow);
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

    const results = db.prepare('SELECT * FROM results WHERE student_id = ?').all(student.id).map(mapResultRow);
    const attendance = db.prepare('SELECT * FROM attendance WHERE student_id = ? ORDER BY date DESC').all(student.id).map(mapAttendanceRow);
    const feeRow = db.prepare('SELECT * FROM fees WHERE student_id = ?').get(student.id);
    const fees = feeRow ? mapFeeRow(feeRow) : undefined;
    res.json({ student, results, attendance, fees });
  });

  app.post('/api/students', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = getDb();
    const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ error: 'Student email is required' });
    }
    const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(TRIM(email)) = ?').get(normalizedEmail);
    const existingStudent = db.prepare('SELECT id FROM students WHERE LOWER(TRIM(email)) = ?').get(normalizedEmail);
    if (existingUser || existingStudent) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const maxRollRow = db.prepare('SELECT COALESCE(MAX(roll_number), 100) as maxRoll FROM students').get() as { maxRoll: number };
    const nextRoll = Number(maxRollRow.maxRoll) + 1;
    const id = `s_${Date.now()}`;
    const studentId = `S${nextRoll}`;
    const fullName = String(req.body.fullName || '').trim();
    const dob = String(req.body.dob || '2016-06-15');
    const gender = String(req.body.gender || 'Female');
    const cls = String(req.body.class || '1st');
    const section = String(req.body.section || 'A');
    const academicYear = String(req.body.academicYear || '2025-2026');
    const bloodGroup = String(req.body.bloodGroup || 'O+');
    const address = String(req.body.address || '');
    const parentName = String(req.body.parentName || '').trim();
    const parentEmail = String(req.body.parentEmail || '').trim().toLowerCase();
    const parentPhone = String(req.body.parentPhone || '').trim();

    db.exec('BEGIN');
    try {
      db.prepare(`
        INSERT INTO students (
          id, student_id, roll_number, full_name, email, dob, gender, class_grade, section,
          academic_year, blood_group, address, parent_name, parent_email, parent_phone,
          attendance_percentage, fee_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 95, 'Pending')
      `).run(
        id, studentId, nextRoll, fullName, normalizedEmail, dob, gender, cls, section,
        academicYear, bloodGroup, address, parentName, parentEmail, parentPhone
      );

      db.prepare(`
        INSERT INTO attendance (id, date, class_grade, section, student_id, student_name, status)
        VALUES (?, ?, ?, ?, ?, ?, 'Present')
      `).run(`att_${id}`, new Date().toISOString().split('T')[0], cls, section, id, fullName);

      db.prepare(`
        INSERT INTO fees (id, student_id, student_name, class_section, total_amount, paid_amount, status)
        VALUES (?, ?, ?, ?, 22000, 0, 'Pending')
      `).run(`f_${id}`, id, fullName, `${cls}-${section}`);

      db.prepare(`
        INSERT INTO users (id, name, email, password_hash, role, student_id, roll_number, class_grade, section)
        VALUES (?, ?, ?, ?, 'student', ?, ?, ?, ?)
      `).run(`u_${Date.now()}`, fullName, normalizedEmail, commonStudentPasswordHash, studentId, nextRoll, cls, section);

      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      return res.status(500).json({ error: 'Database error while adding student' });
    }

    syncDbToJson(db);
    const created = mapStudentRow(db.prepare('SELECT * FROM students WHERE id = ?').get(id));
    res.status(201).json(created);
  });

  app.patch('/api/students/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = getDb();
    const existing = mapStudentRow(db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id));
    if (!existing) return res.status(404).json({ error: 'Student not found' });

    const nextFullName = req.body.fullName !== undefined ? String(req.body.fullName).trim() : existing.fullName;
    const nextEmail = req.body.email !== undefined ? String(req.body.email).trim().toLowerCase() : existing.email;
    const nextDob = req.body.dob !== undefined ? String(req.body.dob) : existing.dob;
    const nextGender = req.body.gender !== undefined ? String(req.body.gender) : existing.gender;
    const nextClass = req.body.class !== undefined ? String(req.body.class) : existing.class;
    const nextSection = req.body.section !== undefined ? String(req.body.section) : existing.section;
    const nextBloodGroup = req.body.bloodGroup !== undefined ? String(req.body.bloodGroup) : existing.bloodGroup;
    const nextAddress = req.body.address !== undefined ? String(req.body.address) : existing.address;
    const nextParentName = req.body.parentName !== undefined ? String(req.body.parentName).trim() : existing.parentName;
    const nextParentPhone = req.body.parentPhone !== undefined ? String(req.body.parentPhone).trim() : existing.parentPhone;

    if (nextEmail !== existing.email) {
      const clash = db.prepare('SELECT id FROM users WHERE LOWER(TRIM(email)) = ? AND student_id != ?').get(nextEmail, existing.studentId);
      if (clash) return res.status(400).json({ error: 'Another user already uses this email' });
    }

    db.exec('BEGIN');
    try {
      db.prepare(`
        UPDATE students
        SET full_name = ?, email = ?, dob = ?, gender = ?, class_grade = ?, section = ?,
            blood_group = ?, address = ?, parent_name = ?, parent_phone = ?
        WHERE id = ?
      `).run(nextFullName, nextEmail, nextDob, nextGender, nextClass, nextSection, nextBloodGroup, nextAddress, nextParentName, nextParentPhone, existing.id);

      db.prepare(`UPDATE fees SET student_name = ?, class_section = ? WHERE student_id = ?`).run(nextFullName, `${nextClass}-${nextSection}`, existing.id);
      db.prepare(`UPDATE results SET student_name = ?, class_section = ? WHERE student_id = ?`).run(nextFullName, `${nextClass}-${nextSection}`, existing.id);
      db.prepare(`UPDATE attendance SET student_name = ?, class_grade = ?, section = ? WHERE student_id = ?`).run(nextFullName, nextClass, nextSection, existing.id);
      db.prepare(`UPDATE users SET name = ?, email = ?, class_grade = ?, section = ? WHERE role = 'student' AND student_id = ?`).run(nextFullName, nextEmail, nextClass, nextSection, existing.studentId);
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      return res.status(500).json({ error: 'Failed to update student' });
    }

    syncDbToJson(db);
    const updated = mapStudentRow(db.prepare('SELECT * FROM students WHERE id = ?').get(existing.id));
    res.json(updated);
  });

  app.delete('/api/students/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = getDb();
    const student = mapStudentRow(db.prepare('SELECT * FROM students WHERE id = ?').get(req.params.id));
    if (!student) return res.status(404).json({ error: 'Student not found' });

    db.exec('BEGIN');
    try {
      db.prepare('DELETE FROM students WHERE id = ?').run(student.id);
      db.prepare(`DELETE FROM users WHERE role = 'student' AND (student_id = ? OR LOWER(email) = ?)`).run(student.studentId, student.email.toLowerCase());
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      return res.status(500).json({ error: 'Failed to delete student' });
    }
    syncDbToJson(db);
    res.json({ success: true });
  });

  app.get('/api/teachers', authenticateToken, (req: any, res) => {
    const db = getDb();
    const teachers = db.prepare('SELECT * FROM teachers ORDER BY teacher_id ASC').all().map(mapTeacherRow);
    res.json(teachers);
  });

  app.post('/api/teachers', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = getDb();
    const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
    if (!normalizedEmail) return res.status(400).json({ error: 'Teacher email is required' });

    const existingUser = db.prepare('SELECT id FROM users WHERE LOWER(TRIM(email)) = ?').get(normalizedEmail);
    const existingTeacher = db.prepare('SELECT id FROM teachers WHERE LOWER(TRIM(email)) = ?').get(normalizedEmail);
    if (existingUser || existingTeacher) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const assignedClasses =
      Array.isArray(req.body.assignedClasses) && req.body.assignedClasses.length > 0
        ? req.body.assignedClasses
        : ['3rd-A', '4th-A'];
    const countRow = db.prepare('SELECT COUNT(*) as cnt FROM teachers').get() as { cnt: number };
    const teacherId = `T${101 + Number(countRow.cnt)}`;
    const id = `t_${Date.now()}`;
    const name = String(req.body.name || '').trim();
    const designation = String(req.body.designation || 'Teacher');
    const phone = String(req.body.phone || '').trim();
    const qualification = String(req.body.qualification || 'M.A., B.Ed.');
    const experience = String(req.body.experience || '1 Year');
    const subject = String(req.body.subject || 'Mathematics');

    db.exec('BEGIN');
    try {
      db.prepare(`
        INSERT INTO teachers (id, teacher_id, name, designation, email, phone, qualification, experience, subject, assigned_classes_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, teacherId, name, designation, normalizedEmail, phone, qualification, experience, subject, JSON.stringify(assignedClasses));

      db.prepare(`
        INSERT INTO users (id, name, email, password_hash, role, teacher_id, assigned_classes_json, subjects_json)
        VALUES (?, ?, ?, ?, 'teacher', ?, ?, ?)
      `).run(`u_teach_${Date.now()}`, name, normalizedEmail, commonTeacherPasswordHash, teacherId, JSON.stringify(assignedClasses), JSON.stringify([subject]));
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      return res.status(500).json({ error: 'Failed to add teacher' });
    }

    syncDbToJson(db);
    res.status(201).json(mapTeacherRow(db.prepare('SELECT * FROM teachers WHERE id = ?').get(id)));
  });

  app.patch('/api/teachers/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = getDb();
    const existing = mapTeacherRow(db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id));
    if (!existing) return res.status(404).json({ error: 'Teacher not found' });

    const nextName = req.body.name !== undefined ? String(req.body.name).trim() : existing.name;
    const nextDesignation = req.body.designation !== undefined ? String(req.body.designation) : existing.designation;
    const nextPhone = req.body.phone !== undefined ? String(req.body.phone).trim() : existing.phone;
    const nextSubject = req.body.subject !== undefined ? String(req.body.subject) : existing.subject;
    const nextQualification = req.body.qualification !== undefined ? String(req.body.qualification) : existing.qualification;
    const nextExperience = req.body.experience !== undefined ? String(req.body.experience) : existing.experience;
    const nextClasses = Array.isArray(req.body.assignedClasses) && req.body.assignedClasses.length > 0
      ? req.body.assignedClasses
      : existing.assignedClasses;

    db.exec('BEGIN');
    try {
      db.prepare(`
        UPDATE teachers
        SET name = ?, designation = ?, phone = ?, qualification = ?, experience = ?, subject = ?, assigned_classes_json = ?
        WHERE id = ?
      `).run(nextName, nextDesignation, nextPhone, nextQualification, nextExperience, nextSubject, JSON.stringify(nextClasses), existing.id);

      db.prepare(`
        UPDATE users
        SET name = ?, assigned_classes_json = ?, subjects_json = ?
        WHERE role = 'teacher' AND (teacher_id = ? OR LOWER(email) = ?)
      `).run(nextName, JSON.stringify(nextClasses), JSON.stringify([nextSubject]), existing.teacherId, existing.email.toLowerCase());
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      return res.status(500).json({ error: 'Failed to update teacher' });
    }

    syncDbToJson(db);
    res.json(mapTeacherRow(db.prepare('SELECT * FROM teachers WHERE id = ?').get(existing.id)));
  });

  app.delete('/api/teachers/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = getDb();
    const teacher = mapTeacherRow(db.prepare('SELECT * FROM teachers WHERE id = ?').get(req.params.id));
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
    if (teacher.id === 't1') return res.status(400).json({ error: 'Cannot remove School Principal' });

    db.exec('BEGIN');
    try {
      db.prepare('DELETE FROM teachers WHERE id = ?').run(teacher.id);
      db.prepare(`DELETE FROM users WHERE role = 'teacher' AND (teacher_id = ? OR LOWER(email) = ?)`).run(teacher.teacherId, teacher.email.toLowerCase());
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      return res.status(500).json({ error: 'Failed to delete teacher' });
    }
    syncDbToJson(db);
    res.json({ success: true });
  });

  app.get('/api/classes', authenticateToken, (req: any, res) => {
    const db = getDb();
    let classes = db.prepare('SELECT * FROM classes ORDER BY grade ASC, section ASC').all().map(mapClassRow);
    if (req.user.role === 'teacher') {
      const assigned = req.user.assignedClasses || [];
      classes = classes.filter((c: any) => assigned.includes(`${c.grade}-${c.section}`) || assigned.includes('All Classes'));
    }
    res.json(classes);
  });

  app.get('/api/attendance', authenticateToken, (req: any, res) => {
    const db = getDb();
    let records = db.prepare('SELECT * FROM attendance ORDER BY date DESC').all().map(mapAttendanceRow);
    if (req.user.role === 'teacher') {
      const assigned = req.user.assignedClasses || [];
      records = records.filter((a: any) => assigned.includes(`${a.class}-${a.section}`) || assigned.includes('All Classes'));
    } else if (req.user.role === 'parent') {
      const childrenIds = req.user.childrenIds || [];
      records = records.filter((a: any) => childrenIds.includes(a.studentId));
    } else if (req.user.role === 'student') {
      const userEmail = String(req.user.email || '').toLowerCase();
      const st = mapStudentRow(db.prepare('SELECT * FROM students WHERE LOWER(email) = ? OR student_id = ?').get(userEmail, req.user.studentId || ''));
      records = records.filter((a: any) => a.studentId === (st ? st.id : ''));
    }
    res.json(records);
  });

  app.post('/api/attendance', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const db = getDb();
    const { studentId, status, date } = req.body;
    const student = mapStudentRow(db.prepare('SELECT * FROM students WHERE id = ?').get(studentId));
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const clsSec = `${student.class}-${student.section}`;
    if (req.user.role === 'teacher') {
      const assigned = req.user.assignedClasses || [];
      if (!assigned.includes(clsSec) && !assigned.includes('All Classes')) {
        return res.status(403).json({ error: 'Not assigned to this class' });
      }
    }

    const targetDate = date || new Date().toISOString().split('T')[0];
    const cleanStatus = status === 'Absent' ? 'Absent' : 'Present';

    const existing: any = db.prepare('SELECT id FROM attendance WHERE student_id = ? AND date = ?').get(student.id, targetDate);
    if (existing) {
      db.prepare('UPDATE attendance SET status = ? WHERE id = ?').run(cleanStatus, existing.id);
    } else {
      db.prepare(`
        INSERT INTO attendance (id, date, class_grade, section, student_id, student_name, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(`att_${Date.now()}`, targetDate, student.class, student.section, student.id, student.fullName, cleanStatus);
    }

    const statsRow = db.prepare(`
      SELECT
        COUNT(*) as totalCount,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as presentCount
      FROM attendance
      WHERE student_id = ?
    `).get(student.id) as { totalCount: number; presentCount: number };

    const pct = statsRow.totalCount > 0
      ? Number(((Number(statsRow.presentCount) / Number(statsRow.totalCount)) * 100).toFixed(1))
      : student.attendancePercentage;

    db.prepare('UPDATE students SET attendance_percentage = ? WHERE id = ?').run(pct, student.id);
    syncDbToJson(db);
    res.json({ success: true, attendancePercentage: pct, status: cleanStatus });
  });

  app.get('/api/fees', authenticateToken, (req: any, res) => {
    const db = getDb();
    let fees = db.prepare('SELECT * FROM fees ORDER BY class_section ASC, student_name ASC').all().map(mapFeeRow);
    if (req.user.role === 'teacher') {
      const assigned = req.user.assignedClasses || [];
      fees = fees.filter((f: any) => assigned.includes(f.class) || assigned.includes('All Classes'));
    } else if (req.user.role === 'student') {
      const userEmail = String(req.user.email || '').toLowerCase();
      const st = mapStudentRow(db.prepare('SELECT * FROM students WHERE LOWER(email) = ? OR student_id = ?').get(userEmail, req.user.studentId || ''));
      fees = fees.filter((f: any) => f.studentId === (st ? st.id : ''));
    } else if (req.user.role === 'parent') {
      const childrenIds = req.user.childrenIds || [];
      fees = fees.filter((f: any) => childrenIds.includes(f.studentId));
    }
    res.json(fees);
  });

  app.patch('/api/fees/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = getDb();
    const feeRow = db.prepare('SELECT * FROM fees WHERE id = ?').get(req.params.id);
    if (!feeRow) return res.status(404).json({ error: 'Fee record not found' });
    const fee = mapFeeRow(feeRow);

    const nextStatus = req.body.status === 'Paid' || req.body.status === 'Pending'
      ? req.body.status
      : (fee.status === 'Paid' ? 'Pending' : 'Paid');
    const nextPaid = typeof req.body.paidAmount === 'number'
      ? req.body.paidAmount
      : (nextStatus === 'Paid' ? fee.totalAmount : 10000);

    db.exec('BEGIN');
    try {
      db.prepare('UPDATE fees SET paid_amount = ?, status = ? WHERE id = ?').run(nextPaid, nextStatus, fee.id);
      db.prepare('UPDATE students SET fee_status = ? WHERE id = ?').run(nextStatus, fee.studentId);
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      return res.status(500).json({ error: 'Failed to update fee record' });
    }
    syncDbToJson(db);
    res.json(mapFeeRow(db.prepare('SELECT * FROM fees WHERE id = ?').get(fee.id)));
  });

  app.get('/api/results', authenticateToken, (req: any, res) => {
    const db = getDb();
    let results = db.prepare('SELECT * FROM results ORDER BY class_section ASC, student_name ASC').all().map(mapResultRow);
    if (req.user.role === 'teacher') {
      const assigned = req.user.assignedClasses || [];
      results = results.filter((r: any) => assigned.includes(r.class) || assigned.includes('All Classes'));
    } else if (req.user.role === 'student') {
      const userEmail = String(req.user.email || '').toLowerCase();
      const st = mapStudentRow(db.prepare('SELECT * FROM students WHERE LOWER(email) = ? OR student_id = ?').get(userEmail, req.user.studentId || ''));
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
    const db = getDb();
    const student = mapStudentRow(db.prepare('SELECT * FROM students WHERE id = ?').get(req.body.studentId));
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
    const id = `res_${Date.now()}`;
    const subject = String(req.body.subject || 'Mathematics');
    const remarks = String(req.body.remarks || 'Good progress');

    db.prepare(`
      INSERT INTO results (id, student_id, student_name, class_section, subject, marks_obtained, max_marks, grade, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, student.id, student.fullName, clsSec, subject, marksObtained, maxMarks, grade, remarks);

    syncDbToJson(db);
    res.status(201).json(mapResultRow(db.prepare('SELECT * FROM results WHERE id = ?').get(id)));
  });

  app.delete('/api/results/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const db = getDb();
    const row = db.prepare('SELECT * FROM results WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Result not found' });
    const resItem = mapResultRow(row);
    if (req.user.role === 'teacher') {
      const assigned = req.user.assignedClasses || [];
      if (!assigned.includes(resItem.class) && !assigned.includes('All Classes')) {
        return res.status(403).json({ error: 'Not assigned to this class' });
      }
    }
    db.prepare('DELETE FROM results WHERE id = ?').run(req.params.id);
    syncDbToJson(db);
    res.json({ success: true });
  });

  app.get('/api/notices', authenticateToken, (req: any, res) => {
    const db = getDb();
    res.json(db.prepare('SELECT * FROM notices ORDER BY date DESC').all());
  });

  app.post('/api/notices', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = getDb();
    const id = `n_${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];
    const title = String(req.body.title || '').trim();
    const description = String(req.body.description || '').trim();
    const category = String(req.body.category || 'All');

    db.prepare('INSERT INTO notices (id, title, description, category, date) VALUES (?, ?, ?, ?, ?)').run(id, title, description, category, date);
    syncDbToJson(db);
    res.status(201).json(db.prepare('SELECT * FROM notices WHERE id = ?').get(id));
  });

  app.delete('/api/notices/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = getDb();
    db.prepare('DELETE FROM notices WHERE id = ?').run(req.params.id);
    syncDbToJson(db);
    res.json({ success: true });
  });

  app.get('/api/timetables', authenticateToken, (req: any, res) => {
    const db = getDb();
    let tt = db.prepare('SELECT * FROM timetables ORDER BY class_section ASC').all().map(mapTimetableRow);
    if (req.user.role === 'teacher') {
      const assigned = req.user.assignedClasses || [];
      tt = tt.filter((t: any) => assigned.includes(t.class) || assigned.includes('All Classes'));
    } else if (req.user.role === 'student') {
      if (req.user.class && req.user.section) {
        tt = tt.filter((t: any) => t.class === `${req.user.class}-${req.user.section}`);
      }
    } else if (req.user.role === 'parent') {
      const childrenIds = req.user.childrenIds || [];
      const childRows = db.prepare('SELECT id, class_grade, section FROM students').all() as any[];
      const childClasses = childRows
        .filter(s => childrenIds.includes(s.id))
        .map(s => `${s.class_grade}-${s.section}`);
      if (childClasses.length > 0) {
        tt = tt.filter((t: any) => childClasses.includes(t.class));
      }
    }
    res.json(tt);
  });

  app.put('/api/timetables/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = getDb();
    const existing = db.prepare('SELECT * FROM timetables WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Timetable not found' });
    const nextSchedule = Array.isArray(req.body.schedule) ? req.body.schedule : mapTimetableRow(existing).schedule;
    db.prepare('UPDATE timetables SET schedule_json = ? WHERE id = ?').run(JSON.stringify(nextSchedule), req.params.id);
    syncDbToJson(db);
    res.json(mapTimetableRow(db.prepare('SELECT * FROM timetables WHERE id = ?').get(req.params.id)));
  });

  app.post('/api/feedback', authenticateToken, (req: any, res) => {
    const db = getDb();
    const id = `fb_${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];
    const sender = req.user.name;
    const senderEmail = req.user.email || '';
    const teacherName = String(req.body.teacherName || 'Mrs. Vannani Rao');
    const message = String(req.body.message || '').trim();

    db.prepare('INSERT INTO feedback (id, date, sender, sender_email, teacher_name, message) VALUES (?, ?, ?, ?, ?, ?)').run(
      id, date, sender, senderEmail, teacherName, message
    );
    syncDbToJson(db);
    const feedback = mapFeedbackRow(db.prepare('SELECT * FROM feedback WHERE id = ?').get(id));
    res.status(201).json({ success: true, message: 'Sent!', feedback });
  });

  app.get('/api/feedback', authenticateToken, (req: any, res) => {
    const db = getDb();
    let list = db.prepare('SELECT * FROM feedback ORDER BY date DESC').all().map(mapFeedbackRow);
    if (req.user.role === 'parent') {
      list = list.filter((fb: any) => fb.senderEmail === req.user.email || fb.sender === req.user.name);
    } else if (req.user.role === 'teacher') {
      list = list.filter((fb: any) => !fb.teacherName || fb.teacherName === req.user.name);
    }
    res.json(list);
  });

  app.get('/api/stats', authenticateToken, (req: any, res) => {
    const db = getDb();
    if (req.user.role === 'teacher') {
      const assigned = req.user.assignedClasses || [];
      const students = db.prepare('SELECT class_grade, section FROM students').all() as any[];
      const assignedStudents = students.filter(s =>
        assigned.includes(`${s.class_grade}-${s.section}`) || assigned.includes('All Classes')
      );
      const teacherCount = (db.prepare('SELECT COUNT(*) as cnt FROM teachers').get() as { cnt: number }).cnt;
      return res.json({
        totalStudents: assignedStudents.length,
        totalTeachers: teacherCount,
        totalClasses: assigned.includes('All Classes') ? 10 : assigned.length
      });
    }
    const studentCount = (db.prepare('SELECT COUNT(*) as cnt FROM students').get() as { cnt: number }).cnt;
    const teacherCount = (db.prepare('SELECT COUNT(*) as cnt FROM teachers').get() as { cnt: number }).cnt;
    const paidCount = (db.prepare("SELECT COUNT(*) as cnt FROM fees WHERE status = 'Paid'").get() as { cnt: number }).cnt;
    const feeTotals = db.prepare('SELECT COALESCE(SUM(paid_amount), 0) as collected, COALESCE(SUM(total_amount), 0) as expected FROM fees').get() as { collected: number; expected: number };
    const inquiryCount = (db.prepare("SELECT COUNT(*) as cnt FROM inquiries WHERE status != 'Contacted'").get() as { cnt: number }).cnt;

    res.json({
      totalStudents: studentCount,
      totalTeachers: teacherCount,
      totalClasses: 5,
      paidFeesCount: paidCount,
      feesCollected: feeTotals.collected,
      feesExpected: feeTotals.expected,
      pendingInquiries: inquiryCount
    });
  });

  app.post('/api/contact', (req, res) => {
    const db = getDb();
    const id = `inq_${Date.now()}`;
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim();
    const phone = String(req.body.phone || '').trim();
    const message = String(req.body.message || '').trim();
    const date = new Date().toISOString().split('T')[0];

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }
    db.prepare(`
      INSERT INTO inquiries (id, name, email, phone, message, status, date)
      VALUES (?, ?, ?, ?, ?, 'New', ?)
    `).run(id, name, email, phone, message, date);
    syncDbToJson(db);
    const inquiry = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id);
    res.status(201).json({ success: true, inquiry });
  });

  app.get('/api/inquiries', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = getDb();
    res.json(db.prepare('SELECT * FROM inquiries ORDER BY date DESC').all());
  });

  app.patch('/api/inquiries/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = getDb();
    const existing = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Inquiry not found' });
    const nextStatus = String(req.body.status || 'Contacted');
    db.prepare('UPDATE inquiries SET status = ? WHERE id = ?').run(nextStatus, req.params.id);
    syncDbToJson(db);
    res.json(db.prepare('SELECT * FROM inquiries WHERE id = ?').get(req.params.id));
  });

  // ==========================================================
  // DATABASE EXPLORER & SQL LEARNING LAB (Admin Only, Read-Only)
  // ==========================================================
  app.get('/api/database/schema', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = getDb();
    const tableRows = db.prepare(`
      SELECT name, sql FROM sqlite_master
      WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name ASC
    `).all() as { name: string; sql: string }[];

    const tables = tableRows.map(tbl => {
      const safeName = tbl.name.replace(/[^a-zA-Z0-9_]/g, '');
      const columns = db.prepare(`PRAGMA table_info("${safeName}")`).all() as any[];
      const foreignKeys = db.prepare(`PRAGMA foreign_key_list("${safeName}")`).all() as any[];
      const countRow = db.prepare(`SELECT COUNT(*) as cnt FROM "${safeName}"`).get() as { cnt: number };
      return {
        name: safeName,
        description: TABLE_DESCRIPTIONS[safeName] || '',
        rowCount: Number(countRow.cnt),
        createSql: tbl.sql,
        columns: columns.map(c => ({
          name: c.name,
          type: c.type || 'TEXT',
          notNull: Boolean(c.notnull),
          primaryKey: Boolean(c.pk),
          defaultValue: c.dflt_value
        })),
        foreignKeys: foreignKeys.map(fk => ({
          from: fk.from,
          toTable: fk.table,
          toColumn: fk.to,
          onDelete: fk.on_delete
        }))
      };
    });

    res.json({
      engine: 'SQLite 3 (Node Built-in node:sqlite)',
      storagePath: process.env.VERCEL ? '/tmp/ashivam-data/ashivam.db' : 'data/ashivam.db',
      foreignKeysEnabled: true,
      tables
    });
  });

  app.post('/api/database/query', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const rawSql = String(req.body.sql || '').trim();
    if (!rawSql) return res.status(400).json({ error: 'SQL query cannot be empty' });

    const normalized = rawSql.replace(/;+\s*$/, '');
    if (normalized.includes(';')) {
      return res.status(400).json({ error: 'Only a single read-only SQL statement is permitted at a time.' });
    }

    const upper = normalized.toUpperCase();
    if (!/^(SELECT|WITH|EXPLAIN|PRAGMA\s+TABLE_INFO|PRAGMA\s+FOREIGN_KEY_LIST|PRAGMA\s+INDEX_LIST)\b/.test(upper)) {
      return res.status(400).json({ error: 'SQL Learning Lab only permits read-only SELECT, WITH, EXPLAIN, or inspection PRAGMA queries.' });
    }

    if (/\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|REPLACE|ATTACH|DETACH|VACUUM|REINDEX|TRIGGER)\b/.test(upper)) {
      return res.status(400).json({ error: 'Mutating or DDL SQL keywords are blocked in the read-only Learning Lab.' });
    }

    const db = getDb();
    const start = performance.now();
    try {
      const rows = db.prepare(normalized).all() as any[];
      const durationMs = Number((performance.now() - start).toFixed(2));
      const limited = rows.slice(0, 100).map(row => {
        if (row && typeof row === 'object' && 'password_hash' in row) {
          return { ...row, password_hash: '•••••••• (bcrypt protected)' };
        }
        return row;
      });
      const columns = limited.length > 0 ? Object.keys(limited[0]) : [];
      res.json({
        columns,
        rows: limited,
        totalRows: rows.length,
        truncated: rows.length > 100,
        durationMs
      });
    } catch (err: any) {
      res.status(400).json({ error: err?.message || 'SQL syntax error' });
    }
  });

  app.get('/api/database/json', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const db = getDb();
    const q = String(req.query.q || '').trim().toLowerCase();
    const tableFilter = String(req.query.table || 'all').trim().toLowerCase();

    const allStudents = db.prepare('SELECT * FROM students ORDER BY roll_number DESC').all().map(mapStudentRow);
    const allTeachers = db.prepare('SELECT * FROM teachers ORDER BY rowid DESC').all().map(mapTeacherRow);
    const allClasses = db.prepare('SELECT * FROM classes ORDER BY grade ASC, section ASC').all().map(mapClassRow);
    const allFees = db.prepare('SELECT * FROM fees ORDER BY rowid DESC').all().map(mapFeeRow);
    const allAttendance = db.prepare('SELECT * FROM attendance ORDER BY rowid DESC').all().map(mapAttendanceRow);
    const allResults = db.prepare('SELECT * FROM results ORDER BY rowid DESC').all().map(mapResultRow);
    const allTimetables = db.prepare('SELECT * FROM timetables ORDER BY class_section ASC').all().map(mapTimetableRow);
    const allNotices = db.prepare('SELECT * FROM notices ORDER BY date DESC, rowid DESC').all();
    const allFeedback = db.prepare('SELECT * FROM feedback ORDER BY date DESC, rowid DESC').all().map(mapFeedbackRow);
    const allInquiries = db.prepare('SELECT * FROM inquiries ORDER BY date DESC, rowid DESC').all();
    const allUsers = db.prepare('SELECT * FROM users ORDER BY rowid DESC').all().map((row: any) => {
      const mapped = mapUserRow(row)!;
      return { ...mapped, passwordHash: '•••••••• (bcrypt protected)' };
    });

    const matchesQuery = (obj: any) => !q || JSON.stringify(obj).toLowerCase().includes(q);

    const students = allStudents.filter(matchesQuery);
    const teachers = allTeachers.filter(matchesQuery);
    const classes = allClasses.filter(matchesQuery);
    const timetableMatches = allTimetables.filter(matchesQuery);
    const notices = allNotices.filter(matchesQuery);
    const feedback = allFeedback.filter(matchesQuery);
    const inquiries = allInquiries.filter(matchesQuery);

    const matchedStudentIds = new Set(students.map((s: any) => s.id));
    const matchedStudentCodes = new Set(students.map((s: any) => s.studentId));
    const matchedTeacherCodes = new Set(teachers.map((t: any) => t.teacherId));

    const fees = allFees.filter((f: any) => !q || matchedStudentIds.has(f.studentId) || matchesQuery(f));
    const attendance = allAttendance.filter((a: any) => !q || matchedStudentIds.has(a.studentId) || matchesQuery(a));
    const results = allResults.filter((r: any) => !q || matchedStudentIds.has(r.studentId) || matchesQuery(r));
    const users = allUsers.filter(
      (u: any) =>
        !q ||
        (u.studentId && matchedStudentCodes.has(u.studentId)) ||
        (u.teacherId && matchedTeacherCodes.has(u.teacherId)) ||
        matchesQuery(u)
    );

    const counts = {
      teachers: allTeachers.length,
      students: allStudents.length,
      users: allUsers.length,
      classes: allClasses.length,
      fees: allFees.length,
      attendance: allAttendance.length,
      results: allResults.length,
      timetables: allTimetables.length,
      notices: allNotices.length,
      feedback: allFeedback.length,
      inquiries: allInquiries.length
    };

    const collections: Record<string, any[]> = {
      teachers,
      students,
      users,
      classes,
      fees,
      attendance,
      results,
      timetables: timetableMatches,
      notices,
      feedback,
      inquiries
    };

    const filteredData =
      tableFilter !== 'all' && collections[tableFilter]
        ? { [tableFilter]: collections[tableFilter] }
        : collections;

    res.json({
      sourceFile: 'data/db.json (synced with SQLite ashivam.db)',
      syncedAt: new Date().toISOString(),
      activeTable: tableFilter,
      counts,
      totalStudents: allStudents.length,
      filteredStudents: students.length,
      ...filteredData
    });
  });

  app.get('/api/health', (req, res) => {
    const db = getDb();
    const count = (tbl: string) => (db.prepare(`SELECT COUNT(*) as cnt FROM ${tbl}`).get() as { cnt: number }).cnt;
    res.json({
      status: 'ok',
      database: 'sqlite',
      engine: 'node:sqlite',
      storage: path.basename(SQLITE_DB_FILE),
      counts: {
        students: count('students'),
        teachers: count('teachers'),
        users: count('users'),
        fees: count('fees'),
        results: count('results'),
        inquiries: count('inquiries')
      }
    });
  });

  app.get('/api', (_req, res) => {
    res.json({ status: 'ok', service: 'ASHIVAM TECH ERP API' });
  });

  // Ensure API errors always return JSON instead of HTML/plain text
  app.use('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API route not found' });
  });

  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error('Unhandled API error:', err);
    if (res.headersSent) return;
    res.status(err?.status || 500).json({
      error: err?.message || 'Internal server error'
    });
  });

  return app;
}
