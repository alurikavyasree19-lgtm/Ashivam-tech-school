export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  teacherId?: string;
  assignedClasses?: string[];
  childrenIds?: string[];
  studentId?: string;
  rollNumber?: number;
  class?: string;
  section?: string;
  subjects?: string[];
}

export interface Student {
  id: string;
  studentId: string;
  rollNumber: number;
  fullName: string;
  email: string;
  dob: string;
  gender: string;
  class: string;
  section: string;
  academicYear: string;
  bloodGroup: string;
  address: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  attendancePercentage: number;
  feeStatus: 'Paid' | 'Pending';
}

export interface Teacher {
  id: string;
  teacherId: string;
  name: string;
  designation: string;
  email: string;
  phone: string;
  qualification: string;
  experience: string;
  subject: string;
  assignedClasses: string[];
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  totalAmount: number;
  paidAmount: number;
  status: 'Paid' | 'Pending';
}

export interface ExamResult {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks: string;
}

export interface TimetableDay {
  day: string;
  periods: string[];
}

export interface Timetable {
  id: string;
  class: string;
  schedule: TimetableDay[];
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
}

export interface FeedbackItem {
  id: string;
  date: string;
  sender: string;
  senderEmail?: string;
  teacherName: string;
  message: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  date: string;
}

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  text: string;
}

export interface DbSchemaColumn {
  name: string;
  type: string;
  notNull: boolean;
  primaryKey: boolean;
  defaultValue: string | null;
}

export interface DbSchemaForeignKey {
  from: string;
  toTable: string;
  toColumn: string;
  onDelete: string;
}

export interface DbSchemaTable {
  name: string;
  description: string;
  rowCount: number;
  createSql: string;
  columns: DbSchemaColumn[];
  foreignKeys: DbSchemaForeignKey[];
}

export interface DbSchemaResponse {
  engine: string;
  storagePath: string;
  foreignKeysEnabled: boolean;
  tables: DbSchemaTable[];
}

export const ALL_CLASS_SECTIONS = [
  '1st-A', '1st-B',
  '2nd-A', '2nd-B',
  '3rd-A', '3rd-B',
  '4th-A', '4th-B',
  '5th-A', '5th-B'
] as const;
