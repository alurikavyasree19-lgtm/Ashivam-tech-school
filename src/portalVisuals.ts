import portalBuildingImg from './assets/images/portal_school_building_1795010537055.jpg';
import adminBgImg from './assets/images/portal_bg_admin_1795010536991.jpg';
import teacherBgImg from './assets/images/portal_bg_teacher_1795010538287.jpg';
import studentBgImg from './assets/images/portal_bg_student_1795010537391.jpg';
import parentBgImg from './assets/images/portal_bg_parent_1795010538423.jpg';
import { UserRole } from './types';

export const PORTAL_SCHOOL_BUILDING = portalBuildingImg;

export const PORTAL_THEMES: Record<
  UserRole,
  {
    title: string;
    wing: string;
    desc: string;
    bgImage: string;
    accentColor: string;
    highlights: string[];
  }
> = {
  admin: {
    title: 'Admin Portal',
    wing: 'Principal & Central Administration Wing',
    desc: 'Manage 1st–5th enrollments, faculty class assignments, tuition ledgers, timetables, and the live SQLite database.',
    bgImage: adminBgImg,
    accentColor: '#EC483E',
    highlights: ['55+ Students & 10 Class Sections', 'Fee Ledger & SQLite Learning Lab']
  },
  teacher: {
    title: 'Teacher Portal',
    wing: 'Classroom & Faculty Hub',
    desc: 'View assigned class rosters, mark daily attendance with automatic percentage updates, and publish subject marks.',
    bgImage: teacherBgImg,
    accentColor: '#F6C33B',
    highlights: ['Section-Scoped Attendance & Marks', 'Shared Password: teacher123']
  },
  student: {
    title: 'Student Portal',
    wing: 'Primary Study & Library Corner',
    desc: 'Check personal profile details, attendance tracking, fee receipts, subject exam scores, and weekly timetables.',
    bgImage: studentBgImg,
    accentColor: '#2563EB',
    highlights: ['Downloadable Exam Report Cards', 'Shared Password: student123']
  },
  parent: {
    title: 'Parent Portal',
    wing: 'Campus Courtyard & Family Connect',
    desc: 'Monitor your child’s daily attendance, tuition payment status, exam progress, and message class teachers directly.',
    bgImage: parentBgImg,
    accentColor: '#16A34A',
    highlights: ['Linked Child Progress & Report Cards', 'Direct Leave Note Messaging']
  }
};
