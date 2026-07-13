# nirmaan.org - Full Stack Educational Platform

Full-stack platform for Nirmaan with role-based access, student lifecycle workflow, attendance, online testing, performance tracking, media management, and GSAP-driven interactive UI.

## Tech Stack
- Frontend: Next.js 16, Tailwind CSS v4, GSAP
- Backend: Node.js, Express, MongoDB, JWT, OTP
- Database: MongoDB (Mongoose)
- Auth: JWT + OTP (Admin/Teacher), password login (Student)

## Core Workflows
1. Student submits application.
2. Admin reviews and approves/rejects.
3. On approval, student record and Nirmaan ID are generated.
4. Student activates account and logs in.
5. Teacher/Admin manages attendance, tests, performance.
6. Student views dashboard, ID card, attendance, and scores.

## Folder Structure
- frontend: Next.js app with GSAP animations and role dashboards
- backend: Express API with modular routes and models
- docker-compose.yml: Local production-like stack

## Backend API Summary
- Auth
  - POST /api/auth/request-otp
  - POST /api/auth/verify-otp
  - POST /api/auth/student-register
  - POST /api/auth/student-login
- Applications
  - POST /api/applications
  - GET /api/applications?status=pending
  - PATCH /api/applications/:id/review
- Students
  - GET /api/students/me
  - GET /api/students/search?q=
- Attendance
  - POST /api/attendance/mark
  - GET /api/attendance/student/:studentId
- Tests
  - POST /api/tests
  - GET /api/tests
  - GET /api/tests/:id
  - POST /api/tests/:id/submit
  - GET /api/tests/result/mine
- Performance
  - POST /api/performance/:studentId
  - GET /api/performance/:studentId
- Media
  - POST /api/media/upload
  - GET /api/media
- Admin
  - GET /api/admin/dashboard

## Run Locally
### Backend
1. Copy backend/.env.example to backend/.env
2. npm install
3. npm run dev

### Frontend
1. Copy frontend/.env.example to frontend/.env
2. npm install
3. npm run dev

## Docker Run
1. Configure backend/.env and frontend/.env
2. docker compose up --build

## Integrating Your Real Media
- Replace placeholder assets in frontend/public.
- Upload inauguration/trainer/gallery images and videos via /api/media/upload.
- Update trainer intro links and social assets in frontend content.
- all are integrated with the erp system
