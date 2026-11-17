# ASHIVAM TECH – Primary School Management ERP

A full-stack Primary School Management ERP web application built with **React 19**, **Vite**, **Tailwind CSS v4**, and **Express + JWT**, featuring role-based portals for **Admin**, **Teacher**, **Student**, and **Parent**, complete CRUD workflows, and ready-to-deploy **Vercel** serverless configuration.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started (Local Development)](#getting-started-local-development)
- [Demo Credentials](#demo-credentials)
- [API Endpoints](#api-endpoints)
- [Push to GitHub](#push-to-github)
- [Deploy on Vercel](#deploy-on-vercel)
- [Production Database Note](#production-database-note)

---

## Features

### Public Landing Page
- **About School**, Academics overview, Admission Highlights, Gallery, and smooth section navigation.
- **Contact / Admission Inquiry Form** persisted directly to the backend and visible inside the Admin Portal.
- Quick **Role-Based Sign In** modal with one-click demo credential fills.

### Admin Portal
- **Dashboard Overview**: Live counts for 55+ students across 10 sections (`1st-A` to `5th-B`), faculty directory, fee collection metrics, and pending parent inquiries.
- **Student & Teacher Management**: Add, edit, and delete students or teachers (`+ Add Student` / `+ Add Teacher`). Newly added students and teachers automatically receive login accounts.
- **Assigned Classes Control**: Assign specific class sections (e.g., `3rd-A`, `4th-A`, `5th-A`) to each teacher.
- **Full Weekly Timetable**: Interactive **Monday – Saturday** class schedule editor across all 10 class sections.
- **Fees, Attendance, Exams, Notices & Inquiries**: Mark fee statuses, publish exam results, post school announcements, and track admission inquiries.

### Teacher Portal
- **Scoped Class View**: Displays only the classes assigned to the logged-in teacher (for example, `3rd-A`, `4th-A`, `5th-A` for Mrs. Vannani Rao).
- **Scoped Modules**: Student Roster, Attendance Marking (auto-recalculates attendance %), Fee Status Overview, Exam Marks Entry & Results, and Class Timetables all filter strictly to the teacher's assigned sections.
- **Shared Teacher Password Login**: Every seeded and newly added teacher can log in with their own email and the shared password `teacher123`.

### Student Portal
- **Individual Student Profile & Dashboard**: Shows student ID, roll number, grade/section, attendance percentage, and academic year immediately upon login.
- **Shared Student Password Login**: Every student (including newly enrolled students) logs in with their own email (e.g. `sai@gmail.com`, `kavya@ashivam.edu`, `arjun@101`) and the shared password `student123`.
- **Fees, Results & Report Cards**: View paid/pending fee invoices, check subject marks and grades, download `.txt` report cards, and view weekly class timetables.

### Parent Portal
- **Child Overview**: Linked children roster, attendance tracking, fee status, exam results, school notices, and direct **Parent Feedback** submission.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React, Motion
- **Backend**: Express 4, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, JSON file persistence (`data/db.json`)
- **Deployment**: Node.js (`server.ts` via `tsx` / Node native TS) & Vercel Serverless (`/api/index.ts` + `vercel.json`)

---

## Project Structure

```text
├── api/
│   └── index.ts          # Vercel Serverless Function wrapper for Express API
├── data/
│   └── db.json           # Local JSON database (auto-seeded on first run)
├── public/               # Static public assets
├── src/
│   ├── assets/           # Bundled UI images & illustrations
│   ├── App.tsx           # Frontend portals (Landing, Admin, Teacher, Student, Parent)
│   ├── main.tsx          # React root entry point
│   └── index.css         # Tailwind CSS v4 entry
├── .env.example          # Environment variable template
├── package.json          # Scripts & dependencies
├── server.ts             # Express REST API + Vite/static server
├── tsconfig.json         # TypeScript configuration
└── vercel.json           # Vercel build output and API/SPA rewrite rules
```

---

## Getting Started (Local Development)

### 1. Prerequisites
- **Node.js 20+** (tested on Node `v22`)
- **npm**

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (optional for local development, recommended for production):

```bash
cp .env.example .env
```

Recommended variables:
```env
JWT_SECRET="replace-with-a-strong-random-secret"
```

### 4. Run in Development Mode
Starts the Express backend and Vite dev middleware together on **http://localhost:3000**:
```bash
npm run dev
```

### 5. Build & Run in Production Mode
```bash
npm run build
npm start
```
Other helpful scripts:
- `npm run lint` — Run TypeScript type checking (`tsc --noEmit`)
- `npm run clean` — Remove `dist` build artifacts

---

## Demo Credentials

| Role | Email | Password | Notes |
| --- | --- | --- | --- |
| **Admin** | `admin@ashivam.edu` | `admin123` | Full ERP access |
| **Teacher (Maths)** | `vannani@ashivam.edu` | `teacher123` | Assigned to `3rd-A`, `4th-A`, `5th-A` |
| **Teacher (English)** | `sharma@ashivam.edu` | `teacher123` | Assigned to `1st-A`, `1st-B`, `2nd-A` |
| **Any Teacher** | `<teacher-email>` | `teacher123` | Same password for all seeded & new teachers |
| **Student** | `kavya@ashivam.edu` | `student123` | Class `5th-A` |
| **Student** | `sai@gmail.com` | `student123` | Sai Teja, Class `2nd-A` |
| **Any Student** | `<student-email>` | `student123` | Same password for all 55+ & new students |
| **Parent** | `kumar@ashivam.edu` | `parent123` | Parent of Kavya & Rahul Kumar |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Health check & record counts |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Bearer | Get current user & linked profile |
| `POST` | `/api/contact` | Public | Submit landing-page inquiry |
| `GET` | `/api/inquiries` | Admin | List admission inquiries |
| `PATCH` | `/api/inquiries/:id` | Admin | Update inquiry status |
| `GET` | `/api/students` | Bearer | List students (role-scoped) |
| `POST` | `/api/students` | Admin | Enroll student + auto-create login |
| `PATCH` | `/api/students/:id` | Admin | Update student profile |
| `DELETE` | `/api/students/:id` | Admin | Delete student & linked user/fees/results |
| `GET` | `/api/teachers` | Bearer | List teachers |
| `POST` | `/api/teachers` | Admin | Add teacher + auto-create login |
| `PATCH` | `/api/teachers/:id` | Admin | Update teacher & assigned classes |
| `DELETE` | `/api/teachers/:id` | Admin | Remove teacher |
| `GET` | `/api/attendance` | Bearer | Get attendance logs |
| `POST` | `/api/attendance` | Admin/Teacher | Mark class attendance & recalculate % |
| `GET` | `/api/fees` | Bearer | List fee records (role-scoped) |
| `PATCH` | `/api/fees/:id` | Admin/Teacher | Toggle Paid/Pending status |
| `GET` | `/api/results` | Bearer | List exam results (role-scoped) |
| `POST` | `/api/results` | Admin/Teacher | Publish exam result |
| `DELETE` | `/api/results/:id` | Admin/Teacher | Delete exam result |
| `GET` | `/api/timetables` | Bearer | List Mon–Sat timetables |
| `PUT` | `/api/timetables/:classSection` | Admin | Update timetable for a section |
| `GET` | `/api/notices` | Bearer | List school notices |
| `POST` | `/api/notices` | Admin/Teacher | Publish notice |
| `DELETE` | `/api/notices/:id` | Admin | Delete notice |
| `GET` | `/api/feedback` | Bearer | List parent feedback |
| `POST` | `/api/feedback` | Parent | Submit parent feedback |

---

## Push to GitHub

1. Create a new empty repository on [GitHub](https://github.com/new) (do **not** initialize with a README if pushing an existing local project).
2. Run the following commands in your project folder:

```bash
git init
git add .
git commit -m "Initial commit: ASHIVAM TECH Primary School Management ERP"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

## Deploy on Vercel

This repository is pre-configured for Vercel via `vercel.json` and `/api/index.ts`.

### Option A: Deploy via Vercel Dashboard (Recommended)
1. Push your project to GitHub using the steps above.
2. Open [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
3. Click **Import** next to your repository.
4. Keep the detected settings (already enforced by `vercel.json`):
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   - `JWT_SECRET` = any strong random string (for signing auth tokens)
6. Click **Deploy**.
7. Once deployed, open `https://<your-app>.vercel.app` and verify `/api/health` returns `{ "status": "ok" }`.

### Option B: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
vercel --prod
```

---

## Production Database Note

Locally, the backend persists data to `data/db.json`. When running on **Vercel Serverless Functions**, the deployment filesystem is read-only except for `/tmp`, so `server.ts` automatically stores `db.json` inside `/tmp/ashivam-data` on Vercel. Because `/tmp` is ephemeral across serverless cold starts, connect an external managed database (such as PostgreSQL/Neon, Supabase, or Firebase Firestore) if you need permanent multi-instance persistence in production.
