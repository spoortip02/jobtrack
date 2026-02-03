# JobTrack — Full-Stack Job Application Tracker

JobTrack is a full-stack web application that helps users track job applications across different stages of the hiring pipeline — from saving roles to receiving offers.

This project was built to demonstrate real-world full-stack development skills, including authentication, database design, API development, and modern UI patterns.

---

##  Features

- User registration and login with secure password hashing
- Session-based authentication using NextAuth
- Protected dashboard (only accessible to logged-in users)
- Create, view, update, and delete job applications
- Track application status across stages:
  - SAVED → APPLIED → OA → PHONE → ONSITE → OFFER / REJECTED / GHOSTED
- Search and filter applications by company, role, and status
- Automatically records the date when an application is marked as APPLIED
- Clean, responsive dashboard UI with modals, badges, and stats

---

##  Tech Stack

**Frontend**
- Next.js (App Router)
- React
- Tailwind CSS

**Backend**
- Next.js Route Handlers (API routes)
- Prisma ORM
- SQLite (local development)

**Authentication & Security**
- NextAuth (Credentials Provider)
- bcrypt for password hashing
- Server-side validation with Zod

---

##  Architecture Overview

- `app/` — Pages and API route handlers (App Router)
- `app/api/` — Backend endpoints for auth and job applications
- `lib/` — Prisma client, auth configuration, and validation schemas
- `prisma/` — Database schema and migrations

The app follows a clean separation between UI, API logic, and database access, similar to production-grade Next.js applications.

---

##  Key Implementation Details

- Passwords are never stored in plaintext (bcrypt hashing)
- All job applications are scoped to the authenticated user
- Server-side validation prevents invalid or malicious input
- Prisma migrations ensure consistent database schema
- Status updates are handled through RESTful PATCH endpoints

---

##  Getting Started (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/jobtrack.git
cd jobtrack
