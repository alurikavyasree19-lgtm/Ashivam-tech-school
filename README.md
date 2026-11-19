# ASHIVAM TECH – Primary School Management ERP

A full-stack Primary School Management ERP web application built with **React 19**, **Vite 8**, **Tailwind CSS v4**, **Express 4**, **JWT Authentication**, and **SQLite 3 (`node:sqlite`)** automatically synchronized with **`data/db.json`**. It includes dedicated portals for **Admin**, **Teacher**, **Student**, and **Parent**, a built-in **SQLite Database Lab & Live JSON Inspector**, and zero-error **GitHub + Vercel** serverless deployment support.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Learn How the Architecture Works](#learn-how-the-architecture-works)
- [Getting Started (Local Development)](#getting-started-local-development)
- [Demo Credentials](#demo-credentials)
- [API Endpoints](#api-endpoints)
- [Upload & Push to GitHub](#upload--push-to-github)
- [Deploy on Vercel Without Errors](#deploy-on-vercel-without-errors)
- [Troubleshooting Vercel Deployments](#troubleshooting-vercel-deployments)

---

## Features

### Public School Website
- **Hero, About, Campus Facilities & Gallery**: Clean institutional landing page featuring ASHIVAM TECH campus gate branding, smart classroom/computer lab/library/security/transport/playground visuals, and smooth section navigation.
- **Admission Inquiry Form**: Visitors can submit inquiries (`POST /api/contact`) stored in SQLite and tracked inside the Admin Portal.
- **Role-Based Sign-In**: Branded **Portal Selection** showcase for Admin, Teacher, Student, and Parent portals with one-click demo credential autofill.

### Admin Portal
- **Live Overview Metrics**: Real-time counts for all 59+ students across 10 sections (`1st-A` through `5th-B`), faculty teachers, collected vs. expected tuition fees, and parent admission inquiries.
- **Student & Teacher Management**: Add, edit, and delete students or teachers (`+ Add Student` / `+ Add Teacher`). Newly added students and teachers automatically receive login accounts.
- **Class Assignment Control**: Assign specific class sections (e.g., `3rd-A`, `4th-A`, `5th-A`) to teachers inline.
- **Full Weekly Timetable**: Interactive **Monday – Saturday** class schedule editor across all 10 class sections.
- **Fees, Attendance, Exams, Notices & Inquiries**: Collect tuition payments, mark daily attendance, publish exam marks, post notices, and manage admission inquiries.
- **SQLite Database Lab & Live JSON Code Inspector**:
  - Explore all 11 relational SQLite tables, columns, and `ON DELETE CASCADE` foreign keys.
  - Run read-only `SELECT`, `JOIN`, `GROUP BY`, and `PRAGMA` queries in **Table View** or **Code (JSON)**.
  - Inspect live synced **`data/db.json`** records across **All Tables, Teachers, Students, Users, Classes, Fees, Attendance, Results, Timetables, Notices, Feedback, and Inquiries** with search filtering and **Live Sync (5s auto-refresh)**.

### Teacher Portal
- **Scoped Class Access**: Teachers only see students, attendance records, fee statuses, exam results, and timetables for their assigned sections.
- **Shared Teacher Password Login**: All seeded and newly added teachers log in using their own email address and `teacher123`.

### Student Portal
- **Personal Student Profile**: Displays student ID, roll number, grade/section, attendance percentage, and academic year right after sign-in.
- **Shared Student Password Login**: Every student (including newly admitted students) logs in with their own email address and `student123`.
- **Fees, Marks & Report Cards**: View fee payment status, subject marks/grades, weekly class timetable, and download `.txt` report cards.

### Parent Portal
- **Child Overview**: Linked children directory, attendance percentage, fee ledger, exam results, school notices, and direct **Parent Feedback** notes to class teachers.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React
- **Backend API**: Express 4, `jsonwebtoken` (JWT), `bcryptjs`
- **Database**: **SQLite 3** via Node 22 built-in `node:sqlite` (`DatabaseSync` with `PRAGMA foreign_keys = ON`) + live `data/db.json` synchronization
- **Local & Node Server**: `server.ts` (`tsx` for dev, Express static + API in Node production)
- **Serverless Deployment**: Vercel Serverless Function (`/api/index.ts`) + Vite-free Express API (`/app.ts`)

---

## Project Structure

```text
├── api/
│   └── index.ts                # Vercel Serverless Function entrypoint (normalizes /api routes & wraps app.ts)
├── data/
│   ├── ashivam.db              # Local SQLite database (auto-created on startup, git-ignored)
│   └── db.json                 # Live-synced seed dataset tracked for GitHub & Vercel cold starts
├── public/
│   └── assets/aistudio/        # Static brand logo & campus media
├── src/
│   ├── assets/images/          # Bundled campus, facility & portal showcase images
│   ├── components/
│   │   ├── AuthViews.tsx       # Portal selection hub & role login form
│   │   ├── DashboardModals.tsx # Student, Teacher, Result, Notice, Timetable & Report modals
│   │   ├── DatabaseLab.tsx     # SQLite Schema Explorer, SQL Sandbox & Live JSON Code Inspector
│   │   └── LandingPage.tsx     # Public school website & inquiry form
│   ├── portalVisuals.ts        # Bundled role showcase assets & portal color themes
│   ├── types.ts                # Shared TypeScript interfaces
│   ├── App.tsx                 # Main React app, state, and role-scoped dashboards
│   ├── main.tsx                # React DOM mount point
│   └── index.css               # Tailwind CSS v4 theme & typography tokens
├── .env.example                # Environment variable template (safe for GitHub, no secrets)
├── app.ts                      # Pure Express REST API (zero Vite imports for safe Vercel bundling)
├── database.ts                 # SQLite 3 schema (11 tables), foreign keys, seed, mappers & JSON sync
├── package.json                # Dependencies, build/start scripts & Node 22.x engine pin
├── server.ts                   # Local development & Node HTTP server (Vite middleware + Express API)
├── tsconfig.json               # TypeScript compiler configuration
├── vite.config.ts              # Vite 8 ESM config + asset copying
└── vercel.json                 # Vercel build output, db.json file tracing & API/SPA rewrites
```

---

## Learn How the Architecture Works

If you are studying this codebase to learn full-stack TypeScript + SQLite + Vercel serverless deployment:

1. **Why Express (`app.ts`) is Separated from Vite (`server.ts`)**:
   - `app.ts` creates the pure Express REST API (`createApp()`) with JSON error handling and **zero Vite imports**.
   - `server.ts` mounts `vite.middlewares` in local dev (`npm run dev`) or serves `dist/` in standalone Node (`npm start`).
   - `api/index.ts` imports `createApp()` directly so Vercel does not attempt to bundle `vite` or dev servers into the serverless bundle.

2. **Relational SQLite + Live `data/db.json` Sync (`database.ts`)**:
   - Opens SQLite via Node 22's built-in `node:sqlite` loaded cleanly inside `getDb()`, eliminating native C++ compile issues on Linux/macOS/Windows/Vercel.
   - Creates 11 normalized tables (`users`, `classes`, `students`, `teachers`, `attendance`, `fees`, `results`, `timetables`, `notices`, `feedback`, `inquiries`) with `FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE`.
   - Locally, every insert/update/delete calls `syncDbToJson(db)` to keep `data/db.json` up to date for both GitHub commits and Vercel cold starts.

3. **Serverless Filesystem Behavior on Vercel**:
   - Vercel deployment bundles are read-only at runtime (`process.env.VERCEL=1`), so `database.ts` skips writing to `data/db.json` and copies the bundled snapshot from `data/db.json` into `/tmp/ashivam-data/ashivam.db` on cold start.
   - *(Note: Vercel `/tmp` resets on new deployments or idle cold starts; for permanent multi-region cloud writes across invocations, swap `database.ts` to PostgreSQL/Neon or Turso.)*

4. **Safe Vercel API Path Normalization (`vercel.json` + `api/index.ts`)**:
   - `vercel.json` maps `/api/(.*)` -> `/api?__vercel_path=$1` and traces `data/db.json` into `api/index.ts`.
   - `api/index.ts` reconstructs `/api/<subpath>` before handing requests to Express, guaranteeing routes like `/api/auth/login`, `/api/students`, and `/api/database/json` resolve identically locally and on Vercel.

---

## Getting Started (Local Development)

### 1. Prerequisites
- **Node.js 22.x** (required for built-in `node:sqlite`, pinned in `package.json`)
- **npm** & **git**

Verify your Node version:
```bash
node -v
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
```

Set `JWT_SECRET` inside `.env`:
```env
JWT_SECRET="replace-with-a-strong-random-secret"
```

### 4. Run Locally (Frontend + Backend on Port 3000)
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

### 5. Pre-Deployment Verification (Run Before Pushing)
```bash
npm run lint     # Must finish with 0 TypeScript errors
npm run build    # Must bundle dist/ cleanly via Vite 8
```

---

## Demo Credentials

| Role | Email | Password | Notes |
| --- | --- | --- | --- |
| **Admin** | `admin@ashivam.edu` | `admin123` | Full ERP + SQLite Database Lab + Live JSON Viewer |
| **Teacher (Maths)** | `vannani@ashivam.edu` | `teacher123` | Assigned to `3rd-A`, `4th-A`, `5th-A` |
| **Teacher (English)** | `sharma@ashivam.edu` | `teacher123` | Assigned to `1st-A`, `1st-B`, `2nd-A` |
| **Any Teacher** | `<teacher-email>` | `teacher123` | Same password for all seeded & newly added teachers |
| **Student** | `kavya@ashivam.edu` | `student123` | Class `5th-A` |
| **Student** | `sai@gmail.com` | `student123` | Sai Teja, Class `2nd-A` |
| **Any Student** | `<student-email>` | `student123` | Same password for all 59+ & newly added students |
| **Parent** | `kumar@ashivam.edu` | `parent123` | Parent of Kavya & Rahul Kumar |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Server & SQLite health check + live table counts |
| `POST` | `/api/auth/login` | Public | Verify email/password & return JWT |
| `GET` | `/api/auth/me` | Bearer | Validate token & return current user claims |
| `GET` | `/api/stats` | Bearer | Role-scoped dashboard statistics |
| `POST` | `/api/contact` | Public | Submit landing-page admission inquiry |
| `GET` | `/api/inquiries` | Admin | List admission inquiries |
| `PATCH` | `/api/inquiries/:id` | Admin | Update inquiry status (`New` / `Contacted`) |
| `GET` | `/api/students` | Bearer | List students (role-scoped) |
| `GET` | `/api/students/:id` | Bearer | Full profile with results, attendance & fees |
| `POST` | `/api/students` | Admin | Enroll student + auto-create fee, attendance & user login |
| `PATCH` | `/api/students/:id` | Admin | Update student profile & cascaded tables |
| `DELETE` | `/api/students/:id` | Admin | Delete student & linked records (`CASCADE`) |
| `GET` | `/api/teachers` | Bearer | List teachers |
| `POST` | `/api/teachers` | Admin | Add teacher + auto-create login |
| `PATCH` | `/api/teachers/:id` | Admin | Update teacher profile & assigned classes |
| `DELETE` | `/api/teachers/:id` | Admin | Remove teacher |
| `GET` | `/api/classes` | Bearer | List class sections (role-scoped) |
| `GET` | `/api/attendance` | Bearer | Get attendance logs (role-scoped) |
| `POST` | `/api/attendance` | Admin/Teacher | Mark Present/Absent & recalculate percentage |
| `GET` | `/api/fees` | Bearer | List fee records (role-scoped) |
| `PATCH` | `/api/fees/:id` | Admin | Update fee paid amount & Paid/Pending status |
| `GET` | `/api/results` | Bearer | List exam results (role-scoped) |
| `POST` | `/api/results` | Admin/Teacher | Publish subject exam result |
| `DELETE` | `/api/results/:id` | Admin/Teacher | Delete exam result |
| `GET` | `/api/timetables` | Bearer | List Mon–Sat class timetables |
| `PUT` | `/api/timetables/:id` | Admin | Update timetable schedule |
| `GET` | `/api/notices` | Bearer | List school notices |
| `POST` | `/api/notices` | Admin | Publish notice |
| `DELETE` | `/api/notices/:id` | Admin | Delete notice |
| `GET` | `/api/feedback` | Bearer | List parent feedback notes |
| `POST` | `/api/feedback` | Bearer | Submit feedback message to teacher |
| `GET` | `/api/database/schema` | Admin | Inspect SQLite tables, columns & foreign keys |
| `POST` | `/api/database/query` | Admin | Run read-only SQL learning queries |
| `GET` | `/api/database/json` | Admin | Live multi-table JSON feed (`?table=teachers|students|all&q=...`) |

---

## Upload & Push to GitHub

1. Open [GitHub New Repository](https://github.com/new), enter a repository name (e.g. `ashivam-tech-school-erp`), leave **Initialize this repository with a README** unchecked, and click **Create repository**.
2. Extract/open your project folder locally in your terminal and run:

```bash
git init
git add .
git status   # Confirm .env, data/*.db, and node_modules/ are NOT staged (.gitignore handles this)
git commit -m "Initial commit: ASHIVAM TECH Primary School ERP"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

3. Whenever you edit code or add new records locally in `data/db.json`:
```bash
git add .
git commit -m "Update project and synced database snapshot"
git push
```

---

## Deploy on Vercel Without Errors

This repository is pre-configured for zero-error deployment using `vercel.json`, `api/index.ts`, `app.ts`, `data/db.json`, and `"engines": { "node": "22.x" }` in `package.json`.

### Step-by-Step (Vercel Dashboard — Recommended)
1. Push all project files to your GitHub repository (`main` branch).
2. Open **[vercel.com/new](https://vercel.com/new)**, sign in with GitHub, and click **Import** next to your repository.
3. Leave the **Build & Output Settings** detected from `vercel.json`:
   - **Framework Preset**: `Other` (or `Vite`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - **Name**: `JWT_SECRET`
   - **Value**: any strong random string (at least 32 characters)
5. Click **Deploy**.
6. Once deployed, open **Project Settings → General → Node.js Version** and verify **`22.x`** is selected (if changed, click **Deployments → Redeploy**).
7. Verify your live backend immediately by visiting:
   ```text
   https://<your-project>.vercel.app/api/health
   ```
   It should return HTTP `200` with JSON:
   ```json
   { "status": "ok", "database": "sqlite", "engine": "node:sqlite", ... }
   ```

### Alternative: Deploy Directly Using Vercel CLI
```bash
npm install -g vercel
vercel login
vercel              # Preview deployment + links project
vercel env add JWT_SECRET production
vercel --prod       # Production deployment
```

---

## Troubleshooting Vercel Deployments

- **`Unexpected token 'A', "A server e"...` or `500 FUNCTION_INVOCATION_FAILED`**:
  - Verify **Project Settings → General → Node.js Version** is **`22.x`** (`node:sqlite` requires Node 22).
  - Verify `vercel.json` has `"includeFiles": "data/db.json"` and `data/db.json` was pushed to GitHub.
  - Check **Vercel Dashboard → Deployments → Logs → Functions** on `/api/health` for the exact JSON error message.
- **404 on `/api/...` routes on Vercel**:
  - Confirm `api/index.ts` and `vercel.json` are both in the root of your GitHub repository and redeploy cleanly (`Redeploy` with Build Cache unchecked).
- **Changes made online reset later on Vercel**:
  - Vercel serverless functions write to ephemeral `/tmp/ashivam-data/ashivam.db`. All committed records in `data/db.json` (including seeded accounts and newly synced students/teachers pushed from local) always load automatically on every fresh start.
