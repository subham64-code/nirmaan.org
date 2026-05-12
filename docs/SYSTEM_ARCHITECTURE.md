# Nirmaan Educational Platform - System Design Architecture

## Overview

The Nirmaan Educational Platform is a comprehensive AI-powered learning management system designed for vocational training in AI/ML and related technologies. The system follows a modern microservices-inspired architecture with separate frontend and backend applications.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  Web Browser (Next.js)  │  Mobile Web (Responsive)              │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      Frontend Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 14 (App Router)  │  React 18  │  TailwindCSS           │
│  Framer Motion            │  Lucide Icons │  Axios               │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────┐
│                      API Gateway / Load Balancer                 │
├─────────────────────────────────────────────────────────────────┤
│  Nginx / Cloudflare (Optional)                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      Backend Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  Node.js + Express.js  │  REST API  │  JWT Authentication       │
│  Multer (File Uploads)  │  Rate Limiting  │  CORS               │
└────────────┬───────────────────────┬───────────────────────────┘
             │                       │
┌────────────▼───────────────────────▼───────────────────────────┐
│                      Service Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  Auth Service  │  Student Service  │  Teacher Service           │
│  Test Service  │  Attendance Service  │  Email Service          │
│  SMS Service   │  AI Service (Gemini, DeepSeek, Ollama)        │
└────────────┬───────────────────────┬───────────────────────────┘
             │                       │
┌────────────▼───────────────────────▼───────────────────────────┐
│                      Data Layer                                  │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB (Primary Database)  │  Google Sheets (Attendance)      │
│  GridFS (File Storage)       │  Cloud Storage (Future)         │
└─────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      External Services                           │
├─────────────────────────────────────────────────────────────────┤
│  SendGrid (Email)  │  Twilio (SMS)  │  Google Maps              │
│  Google OAuth      │  Gemini AI     │  DeepSeek AI              │
│  Ollama AI         │  YouTube (Videos)                          │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend Architecture

**Technology Stack:**
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: TailwindCSS + Custom CSS Variables
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod Validation

**Key Features:**
- Server-Side Rendering (SSR) for SEO
- Client-Side Rendering for interactive components
- Static Generation for static pages
- API Routes for serverless functions
- Responsive design for all screen sizes
- Dark mode support via CSS variables

**Frontend Directory Structure:**
```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home page
│   │   ├── login/             # Login pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── syllabus/          # Syllabus management
│   │   ├── attendance/        # Attendance tracking
│   │   └── notes/             # Study materials
│   ├── components/            # Reusable components
│   │   ├── DashboardShell.tsx # Dashboard layout
│   │   ├── AIChatWidget.tsx   # AI chatbot
│   │   ├── AdminChatbot.tsx   # Admin AI assistant
│   │   ├── RealTimeOTPLogin.tsx # OTP-based login
│   │   └── ...
│   ├── lib/                   # Utilities and services
│   │   ├── api.ts             # Axios configuration
│   │   ├── constants.ts       # App constants and API keys
│   │   ├── gemini.ts          # Gemini AI service
│   │   ├── deepseek.ts        # DeepSeek AI service
│   │   └── ollama.ts          # Ollama AI service
│   └── styles/                # Global styles
├── public/                    # Static assets
└── .env.local                 # Environment variables
```

### 2. Backend Architecture

**Technology Stack:**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Rate Limiting**: express-rate-limit
- **CORS**: cors middleware
- **Validation**: express-validator
- **Email**: SendGrid
- **SMS**: Twilio

**Backend Directory Structure:**
```
backend/
├── src/
│   ├── config/                # Configuration files
│   │   ├── db.js              # MongoDB connection
│   │   ├── email.js           # Email configuration
│   │   └── sms.js             # SMS configuration
│   ├── controllers/           # Request handlers
│   │   ├── authController.js  # Authentication logic
│   │   ├── studentController.js
│   │   ├── teacherController.js
│   │   ├── testController.js  # Test management
│   │   └── attendanceController.js
│   ├── models/                # Database models
│   │   ├── User.js            # User schema
│   │   ├── Student.js
│   │   ├── Teacher.js
│   │   ├── Test.js
│   │   ├── Question.js
│   │   ├── Attendance.js
│   │   └── Application.js
│   ├── routes/                # API routes
│   │   ├── auth.js            # Auth endpoints
│   │   ├── students.js
│   │   ├── teachers.js
│   │   ├── tests.js
│   │   └── attendance.js
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js            # JWT verification
│   │   ├── error.js           # Error handling
│   │   └── rateLimiter.js
│   ├── services/              # Business logic
│   │   ├── emailService.js    # Email sending
│   │   ├── smsService.js      # SMS sending
│   │   ├── otpService.js      # OTP generation/verification
│   │   └── aiService.js       # AI integration
│   └── utils/                 # Utility functions
│       ├── logger.js          # Logging
│       └── validators.js      # Input validation
├── uploads/                   # File uploads directory
├── .env                       # Environment variables
└── server.js                  # Entry point
```

### 3. Database Architecture

**MongoDB Collections:**

1. **Users Collection**
   - Fields: `_id`, `email`, `password`, `role`, `name`, `phone`, `createdAt`, `updatedAt`
   - Indexes: `email` (unique), `phone`
   - Relationships: References in Students, Teachers

2. **Students Collection**
   - Fields: `_id`, `userId`, `nirmaanId`, `course`, `qualification`, `status`, `avatar`, `predefined`
   - Indexes: `nirmaanId` (unique), `userId`
   - Relationships: References Users, Tests, Attendance

3. **Teachers Collection**
   - Fields: `_id`, `userId`, `subjects`, `qualifications`, `experience`, `bio`
   - Indexes: `userId`
   - Relationships: References Users, Tests

4. **Tests Collection**
   - Fields: `_id`, `title`, `course`, `durationMinutes`, `totalMarks`, `questions`, `isPublished`, `createdBy`, `createdAt`
   - Indexes: `createdBy`, `course`, `isPublished`
   - Relationships: References Teachers, Questions, TestResults

5. **Questions Collection**
   - Fields: `_id`, `testId`, `prompt`, `options`, `answer`, `marks`, `type`
   - Indexes: `testId`
   - Relationships: References Tests

6. **TestResults Collection**
   - Fields: `_id`, `testId`, `studentId`, `answers`, `score`, `totalMarks`, `submittedAt`, `graded`, `feedback`
   - Indexes: `testId`, `studentId`
   - Relationships: References Tests, Students

7. **Attendance Collection**
   - Fields: `_id`, `studentId`, `date`, `status`, `course`, `markedBy`
   - Indexes: `studentId`, `date`, `course`
   - Relationships: References Students, Teachers

8. **Applications Collection**
   - Fields: `_id`, `name`, `email`, `phone`, `qualification`, `course`, `status`, `createdAt`
   - Indexes: `email`, `phone`, `status`
   - Relationships: None

### 4. API Architecture

**RESTful API Endpoints:**

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/request-otp` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

**Students:**
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

**Teachers:**
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get teacher by ID
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher

**Tests:**
- `GET /api/tests` - Get all tests
- `POST /api/tests` - Create test
- `GET /api/tests/:id` - Get test by ID
- `PUT /api/tests/:id` - Update test
- `DELETE /api/tests/:id` - Delete test
- `POST /api/tests/:id/clone` - Clone test
- `PATCH /api/tests/:id/publish` - Publish/unpublish test
- `GET /api/tests/:id/results` - Get test results
- `POST /api/tests/:id/submit` - Submit test

**Attendance:**
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/student/:id` - Get student attendance
- `GET /api/attendance/report` - Get attendance report

**Applications:**
- `POST /api/applications` - Submit application
- `GET /api/applications` - Get all applications
- `PATCH /api/applications/:id/status` - Update application status

### 5. Authentication & Authorization Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Enter Email/Phone
     ▼
┌─────────────────┐
│ Frontend (OTP)  │
└────┬────────────┘
     │
     │ 2. POST /api/auth/request-otp
     ▼
┌─────────────────┐
│  Backend API    │
└────┬────────────┘
     │
     ├─► 3a. Generate OTP
     ├─► 3b. Send via SendGrid (Email)
     └─► 3c. Send via Twilio (SMS)
     │
     │ 4. Return success
     ▼
┌─────────────────┐
│ Frontend (OTP)  │
└────┬────────────┘
     │
     │ 5. User enters OTP
     ▼
┌─────────────────┐
│ Frontend (OTP)  │
└────┬────────────┘
     │
     │ 6. POST /api/auth/verify-otp
     ▼
┌─────────────────┐
│  Backend API    │
└────┬────────────┘
     │
     ├─► 7a. Verify OTP
     ├─► 7b. Check user role
     ├─► 7c. Generate JWT token
     └─► 7d. Return token + user data
     │
     │ 8. Store token in localStorage
     ▼
┌─────────────────┐
│ Frontend (Auth) │
└────┬────────────┘
     │
     │ 9. Include token in headers
     ▼
┌─────────────────┐
│  Backend API    │
└────┬────────────┘
     │
     │ 10. Verify JWT token
     ▼
┌─────────────────┐
│  Protected Route│
└─────────────────┘
```

### 6. AI Services Integration

**Supported AI Services:**

1. **Google Gemini AI**
   - Purpose: Admin chatbot, general AI assistance
   - API Key: Configured in constants
   - Endpoint: `https://generativelanguage.googleapis.com`
   - Use Cases: Admin dashboard AI assistant, general queries

2. **DeepSeek AI**
   - Purpose: Advanced AI responses, smart recommendations
   - API Key: Configured in constants
   - Endpoint: Custom API
   - Use Cases: Student recommendations, content generation

3. **Ollama AI**
   - Purpose: Teacher question generation
   - API Key: Configured in constants
   - Endpoint: Local/Remote Ollama instance (default: localhost:11434)
   - Use Cases: AI-powered question generation for tests

**AI Service Architecture:**
```
┌─────────────┐
│  Frontend   │
└──────┬──────┘
       │
       │ Request
       ▼
┌─────────────────┐
│  AI Service     │
│  (lib/ai.ts)    │
└──────┬──────────┘
       │
       ├─► Gemini Service (Admin)
       ├─► DeepSeek Service (Students)
       └─► Ollama Service (Teachers)
       │
       ▼
┌─────────────────┐
│  External APIs  │
└─────────────────┘
```

### 7. External Services Integration

**Email Service (SendGrid):**
- API Keys: Node.js and Python specific keys
- Purpose: OTP emails, notifications, alerts
- Features: HTML emails, attachments, templates

**SMS Service (Twilio):**
- Account SID: Configured in .env
- Purpose: OTP via SMS, attendance alerts
- Features: International SMS, delivery tracking

**Google Services:**
- Maps API: Location services, center mapping
- OAuth: Social login integration
- Sheets API: Attendance data synchronization

### 8. Security Architecture

**Security Measures:**
1. **Authentication**: JWT-based stateless authentication
2. **Authorization**: Role-based access control (RBAC)
3. **Rate Limiting**: Prevent brute-force attacks
4. **CORS**: Cross-origin resource sharing configuration
5. **Input Validation**: Server-side validation using express-validator
6. **Password Hashing**: bcrypt for secure password storage
7. **HTTPS**: Encrypted communication (production)
8. **Environment Variables**: Sensitive data in .env files
9. **SQL Injection Prevention**: MongoDB driver sanitization
10. **XSS Protection**: Input sanitization and CSP headers

**Role-Based Access Control:**
- **Admin**: Full system access, user management, settings
- **Teacher**: Test creation, student management, attendance marking
- **Student**: View content, take tests, view attendance

### 9. Deployment Architecture

**Development Environment:**
- Frontend: `http://localhost:3000` (Next.js dev server)
- Backend: `http://localhost:5000` (Express.js)
- Database: `mongodb://127.0.0.1:27017/nirmaan_org`

**Production Environment (Recommended):**
```
┌─────────────────────────────────────┐
│         CDN (Cloudflare)            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Frontend (Vercel/Netlify)      │
│      Next.js Static Export          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Backend (AWS/Heroku/DigitalOcean)│
│      Node.js + Express              │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Database (MongoDB Atlas)       │
│      Cloud-hosted MongoDB           │
└─────────────────────────────────────┘
```

### 10. Monitoring & Logging

**Logging Strategy:**
- Application logs: Winston or custom logger
- Error tracking: Sentry (optional)
- Performance monitoring: New Relic or similar (optional)
- Database logs: MongoDB logging
- API logs: Request/response logging

**Metrics to Track:**
- API response times
- Error rates
- User activity
- Database query performance
- External API call success rates

## Scalability Considerations

**Horizontal Scaling:**
- Stateless backend design for easy scaling
- Load balancer for multiple backend instances
- Database read replicas for query scaling
- CDN for static asset delivery

**Vertical Scaling:**
- Increase server resources as needed
- Database indexing optimization
- Caching layer (Redis) for frequently accessed data

**Future Enhancements:**
- Microservices architecture migration
- GraphQL API alternative
- WebSocket for real-time features
- Message queue (RabbitMQ/Redis) for async tasks
- Containerization with Docker
- Kubernetes orchestration

## Summary

The Nirmaan Educational Platform follows a modern, scalable architecture with clear separation of concerns. The system is designed to handle multiple user roles (Admin, Teacher, Student) with appropriate access controls. AI integration through multiple services (Gemini, DeepSeek, Ollama) provides intelligent features for question generation and assistance. The architecture supports future growth and can be scaled horizontally as user demand increases.
