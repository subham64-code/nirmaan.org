# Database Architecture Documentation

## Overview

The Nirmaan Educational Platform uses MongoDB as its primary database, chosen for its flexibility, scalability, and document-oriented nature. This document outlines the complete database schema, relationships, indexing strategy, and data flow patterns.

## Database Technology

**MongoDB**
- **Version**: 4.4+
- **ODM**: Mongoose (Object Data Modeling)
- **Deployment**: MongoDB Atlas (Cloud) or Local MongoDB
- **Connection String**: `mongodb://127.0.0.1:27017/nirmaan_org` (local)

## Database Schema

### 1. Users Collection

**Purpose**: Store user authentication and profile information

**Schema Definition**:
```javascript
{
  _id: ObjectId,
  email: String (required, unique, indexed),
  password: String (hashed, select: false),
  name: String (required),
  phone: String,
  role: String (enum: ['admin', 'teacher', 'student'], default: 'student'),
  otp: String,
  otpExpiry: Date,
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `email` (unique, ascending)
- `phone` (ascending)
- `role` (ascending)
- `isActive` (ascending)

**Relationships**:
- One-to-one with Students collection
- One-to-one with Teachers collection
- Referenced in Tests collection (createdBy)

**Example Document**:
```json
{
  "_id": "64f7a8b9c0d1e2f3a4b5c6d7",
  "email": "teacher@nirmaan.edu",
  "name": "John Doe",
  "phone": "+919876543210",
  "role": "teacher",
  "isActive": true,
  "lastLogin": "2024-01-15T10:30:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 2. Students Collection

**Purpose**: Store student-specific information and enrollment details

**Schema Definition**:
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required, unique, indexed),
  nirmaanId: String (required, unique, indexed),
  course: String (required),
  qualification: String,
  status: String (enum: ['active', 'pending', 'approved', 'inactive']),
  avatar: String,
  predefined: Boolean (default: false),
  enrollmentDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `userId` (unique, ascending)
- `nirmaanId` (unique, ascending)
- `course` (ascending)
- `status` (ascending)

**Relationships**:
- Belongs to User (one-to-one)
- Has many TestResults
- Has many Attendance records
- Referenced in Applications

**Example Document**:
```json
{
  "_id": "64f7a8b9c0d1e2f3a4b5c6d8",
  "userId": "64f7a8b9c0d1e2f3a4b5c6d7",
  "nirmaanId": "NIR2024001",
  "course": "AI/ML",
  "qualification": "B.Tech",
  "status": "active",
  "avatar": "/uploads/profiles/student1.jpg",
  "predefined": true,
  "enrollmentDate": "2024-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 3. Teachers Collection

**Purpose**: Store teacher-specific information and qualifications

**Schema Definition**:
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required, unique, indexed),
  subjects: [String],
  qualifications: [String],
  experience: Number,
  bio: String,
  avatar: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `userId` (unique, ascending)
- `subjects` (ascending)

**Relationships**:
- Belongs to User (one-to-one)
- Has many Tests
- Has many Attendance records (markedBy)

**Example Document**:
```json
{
  "_id": "64f7a8b9c0d1e2f3a4b5c6d9",
  "userId": "64f7a8b9c0d1e2f3a4b5c6d7",
  "subjects": ["AI/ML", "Deep Learning", "NLP"],
  "qualifications": ["M.Tech AI", "PhD Computer Science"],
  "experience": 5,
  "bio": "Expert in AI and Machine Learning with 5 years of teaching experience",
  "avatar": "/uploads/profiles/teacher1.jpg",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 4. Tests Collection

**Purpose**: Store test/exam information and metadata

**Schema Definition**:
```javascript
{
  _id: ObjectId,
  title: String (required),
  course: String (required),
  durationMinutes: Number (required),
  totalMarks: Number (required),
  questions: [ObjectId] (ref: Question),
  createdBy: ObjectId (ref: User, required, indexed),
  isPublished: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `createdBy` (ascending)
- `course` (ascending)
- `isPublished` (ascending)
- Compound index: `createdBy` + `isPublished`

**Relationships**:
- Belongs to User (Teacher/Admin)
- Has many Questions
- Has many TestResults

**Example Document**:
```json
{
  "_id": "64f7a8b9c0d1e2f3a4b5c6da",
  "title": "AI Fundamentals Quiz",
  "course": "AI/ML",
  "durationMinutes": 60,
  "totalMarks": 100,
  "questions": ["64f7a8b9c0d1e2f3a4b5c6db", "64f7a8b9c0d1e2f3a4b5c6dc"],
  "createdBy": "64f7a8b9c0d1e2f3a4b5c6d7",
  "isPublished": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 5. Questions Collection

**Purpose**: Store individual questions for tests

**Schema Definition**:
```javascript
{
  _id: ObjectId,
  testId: ObjectId (ref: Test, required, indexed),
  prompt: String (required),
  options: [String],
  answer: Number, // Index of correct option
  marks: Number (required),
  type: String (enum: ['mcq', 'short', 'essay']),
  explanation: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `testId` (ascending)
- `type` (ascending)

**Relationships**:
- Belongs to Test
- Referenced in TestResults (answers)

**Example Document**:
```json
{
  "_id": "64f7a8b9c0d1e2f3a4b5c6db",
  "testId": "64f7a8b9c0d1e2f3a4b5c6da",
  "prompt": "What is the primary function of a neural network?",
  "options": [
    "Data storage",
    "Pattern recognition and learning",
    "Image processing only",
    "Text generation only"
  ],
  "answer": 1,
  "marks": 10,
  "type": "mcq",
  "explanation": "Neural networks are designed to recognize patterns and learn from data.",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 6. TestResults Collection

**Purpose**: Store student test submissions and results

**Schema Definition**:
```javascript
{
  _id: ObjectId,
  testId: ObjectId (ref: Test, required, indexed),
  studentId: ObjectId (ref: Student, required, indexed),
  answers: [{
    questionId: ObjectId,
    answer: String,
    isCorrect: Boolean
  }],
  score: Number,
  totalMarks: Number,
  submittedAt: Date,
  graded: Boolean (default: false),
  feedback: String,
  gradedBy: ObjectId (ref: User),
  gradedAt: Date,
  createdAt: Date
}
```

**Indexes**:
- `testId` (ascending)
- `studentId` (ascending)
- Compound index: `testId` + `studentId` (unique)
- `submittedAt` (descending)

**Relationships**:
- Belongs to Test
- Belongs to Student
- Graded by User (Teacher)

**Example Document**:
```json
{
  "_id": "64f7a8b9c0d1e2f3a4b5c6dd",
  "testId": "64f7a8b9c0d1e2f3a4b5c6da",
  "studentId": "64f7a8b9c0d1e2f3a4b5c6d8",
  "answers": [
    {
      "questionId": "64f7a8b9c0d1e2f3a4b5c6db",
      "answer": "1",
      "isCorrect": true
    }
  ],
  "score": 85,
  "totalMarks": 100,
  "submittedAt": "2024-01-15T11:00:00.000Z",
  "graded": true,
  "feedback": "Good performance. Focus on deep learning concepts.",
  "gradedBy": "64f7a8b9c0d1e2f3a4b5c6d7",
  "gradedAt": "2024-01-15T12:00:00.000Z",
  "createdAt": "2024-01-15T11:00:00.000Z"
}
```

### 7. Attendance Collection

**Purpose**: Store student attendance records

**Schema Definition**:
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: Student, required, indexed),
  date: Date (required, indexed),
  status: String (enum: ['Present', 'Absent', 'Late'], required),
  course: String (required),
  markedBy: ObjectId (ref: User),
  notes: String,
  createdAt: Date
}
```

**Indexes**:
- `studentId` (ascending)
- `date` (descending)
- `course` (ascending)
- Compound index: `studentId` + `date` (unique)
- Compound index: `date` + `course`

**Relationships**:
- Belongs to Student
- Marked by User (Teacher/Admin)

**Example Document**:
```json
{
  "_id": "64f7a8b9c0d1e2f3a4b5c6de",
  "studentId": "64f7a8b9c0d1e2f3a4b5c6d8",
  "date": "2024-01-15T00:00:00.000Z",
  "status": "Present",
  "course": "AI/ML",
  "markedBy": "64f7a8b9c0d1e2f3a4b5c6d7",
  "notes": "Attended all sessions",
  "createdAt": "2024-01-15T09:00:00.000Z"
}
```

### 8. Applications Collection

**Purpose**: Store student enrollment applications

**Schema Definition**:
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, indexed),
  phone: String (required, indexed),
  qualification: String (required),
  course: String (required),
  status: String (enum: ['pending', 'approved', 'rejected'], default: 'pending', indexed),
  message: String,
  reviewedBy: ObjectId (ref: User),
  reviewedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `email` (ascending)
- `phone` (ascending)
- `status` (ascending)
- `createdAt` (descending)

**Relationships**:
- Reviewed by User (Admin)

**Example Document**:
```json
{
  "_id": "64f7a8b9c0d1e2f3a4b5c6df",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+919876543211",
  "qualification": "B.Sc",
  "course": "AI/ML",
  "status": "approved",
  "message": "Interested in AI course",
  "reviewedBy": "64f7a8b9c0d1e2f3a4b5c6d0",
  "reviewedAt": "2024-01-15T10:00:00.000Z",
  "createdAt": "2024-01-10T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1
       │
       │ 1
┌──────▼──────┐       ┌─────────────┐
│  Student    │       │  Teacher    │
└──────┬──────┘       └──────┬──────┘
       │                     │
       │ 1                   │ 1
       │                     │
       │ N                   │ N
┌──────▼─────────────────────▼──────┐
│            Attendance             │
└────────────────────────────────────┘

┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1
       │
       │ 1
┌──────▼──────┐
│  Teacher    │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────▼──────┐       ┌─────────────┐
│    Test     │───────│  Question   │
└──────┬──────┘       └─────────────┘
       │ 1
       │
       │ N
┌──────▼─────────────┐
│   TestResult       │
└──────┬─────────────┘
       │ N
       │
       │ 1
┌──────▼──────┐
│  Student    │
└─────────────┘

┌─────────────┐
│ Application │
└─────────────┘
```

## Data Flow Patterns

### 1. User Registration Flow

```
User Input
    ↓
Create User Document
    ↓
Create Role-Specific Document (Student/Teacher)
    ↓
Generate OTP
    ↓
Send OTP via Email/SMS
    ↓
Store OTP in User Document
    ↓
Return Success
```

### 2. Test Creation Flow

```
Teacher Input
    ↓
Create Test Document
    ↓
Create Question Documents
    ↓
Link Questions to Test
    ↓
Store Test with Question IDs
    ↓
Return Test ID
```

### 3. Test Submission Flow

```
Student Input
    ↓
Validate Test ID
    ↓
Create TestResult Document
    ↓
Store Answers
    ↓
Calculate Score
    ↓
Update TestResult with Score
    ↓
Return Score
```

### 4. Attendance Marking Flow

```
Teacher Input
    ↓
Validate Student ID
    ↓
Check for Existing Attendance
    ↓
Create/Update Attendance Document
    ↓
Store Status and Metadata
    ↓
Return Success
```

## Indexing Strategy

### Single Field Indexes

**Users Collection**:
```javascript
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ phone: 1 })
db.users.createIndex({ role: 1 })
db.users.createIndex({ isActive: 1 })
```

**Students Collection**:
```javascript
db.students.createIndex({ userId: 1 }, { unique: true })
db.students.createIndex({ nirmaanId: 1 }, { unique: true })
db.students.createIndex({ course: 1 })
db.students.createIndex({ status: 1 })
```

**Tests Collection**:
```javascript
db.tests.createIndex({ createdBy: 1 })
db.tests.createIndex({ course: 1 })
db.tests.createIndex({ isPublished: 1 })
```

### Compound Indexes

**Tests Collection**:
```javascript
db.tests.createIndex({ createdBy: 1, isPublished: 1 })
```

**TestResults Collection**:
```javascript
db.testResults.createIndex({ testId: 1, studentId: 1 }, { unique: true })
db.testResults.createIndex({ submittedAt: -1 })
```

**Attendance Collection**:
```javascript
db.attendance.createIndex({ studentId: 1, date: 1 }, { unique: true })
db.attendance.createIndex({ date: -1, course: 1 })
```

**Applications Collection**:
```javascript
db.applications.createIndex({ createdAt: -1 })
```

## Query Optimization

### Common Query Patterns

**1. Fetch User by Email**:
```javascript
db.users.findOne({ email: "user@example.com" })
// Uses: email index
```

**2. Fetch Student Tests**:
```javascript
db.tests.find({ createdBy: teacherId, isPublished: true })
// Uses: compound index (createdBy + isPublished)
```

**3. Fetch Student Attendance**:
```javascript
db.attendance.find({
  studentId: studentId,
  date: { $gte: startDate, $lte: endDate }
})
// Uses: compound index (studentId + date)
```

**4. Fetch Test Results**:
```javascript
db.testResults.find({ testId: testId })
  .populate('studentId')
  .sort({ submittedAt: -1 })
// Uses: testId index, submittedAt index for sorting
```

### Aggregation Pipelines

**1. Student Performance Report**:
```javascript
db.testResults.aggregate([
  { $match: { studentId: ObjectId("...") } },
  {
    $group: {
      _id: "$testId",
      averageScore: { $avg: "$score" },
      totalAttempts: { $sum: 1 }
    }
  },
  {
    $lookup: {
      from: "tests",
      localField: "_id",
      foreignField: "_id",
      as: "test"
    }
  }
])
```

**2. Attendance Report**:
```javascript
db.attendance.aggregate([
  { $match: { date: { $gte: startDate, $lte: endDate } } },
  {
    $group: {
      _id: "$course",
      presentCount: {
        $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] }
      },
      absentCount: {
        $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] }
      },
      lateCount: {
        $sum: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] }
      }
    }
  }
])
```

**3. Course Statistics**:
```javascript
db.students.aggregate([
  { $match: { status: "active" } },
  {
    $group: {
      _id: "$course",
      studentCount: { $sum: 1 }
    }
  }
])
```

## Data Integrity

### Validation Rules

**User Email**:
- Required field
- Unique constraint
- Email format validation
- Lowercase storage

**Student Nirmaan ID**:
- Required field
- Unique constraint
- Format: NIR + Year + Sequence (e.g., NIR2024001)

**Test Duration**:
- Required field
- Minimum value: 1 minute
- Maximum value: 300 minutes (5 hours)

**Attendance Status**:
- Required field
- Enum values: Present, Absent, Late

### Cascade Operations

**User Deletion**:
- Delete associated Student/Teacher document
- Delete associated TestResults
- Delete associated Attendance records

**Test Deletion**:
- Delete associated Questions
- Delete associated TestResults

## Backup Strategy

### Backup Schedule

**Daily Backups**:
- Full database backup at 2:00 AM
- Retention: 7 days

**Weekly Backups**:
- Full database backup every Sunday
- Retention: 4 weeks

**Monthly Backups**:
- Full database backup on 1st of each month
- Retention: 12 months

### Backup Commands

**MongoDB Dump**:
```bash
mongodump --uri="mongodb://127.0.0.1:27017/nirmaan_org" --out=/backups/daily/$(date +%Y%m%d)
```

**MongoDB Atlas Backup**:
- Automatic continuous backups
- Point-in-time recovery
- Retention policy: 7 days

## Scaling Strategy

### Vertical Scaling
- Increase server resources (CPU, RAM, Storage)
- Optimize indexes and queries
- Implement caching layer (Redis)

### Horizontal Scaling
- MongoDB Replica Sets
- Read replicas for read-heavy operations
- Sharding for large datasets

### Caching Layer (Future)
- Redis for session storage
- Redis for frequently accessed data
- Cache invalidation strategy

## Security Considerations

### Data Encryption
- Encryption at rest (MongoDB Atlas)
- Encryption in transit (TLS/SSL)
- Field-level encryption for sensitive data

### Access Control
- Role-based access control (RBAC)
- MongoDB user authentication
- Network access control (IP whitelisting)

### Data Masking
- Mask sensitive fields in logs
- Exclude password field from queries
- Sanitize data before sending to client

## Monitoring

### Performance Metrics
- Query execution time
- Index usage statistics
- Database connection pool usage
- Disk I/O operations

### Alerts
- High CPU usage
- High memory usage
- Slow query logs
- Connection pool exhaustion

## Summary

The database architecture for Nirmaan Educational Platform is designed to be flexible, scalable, and performant. MongoDB's document-oriented nature allows for easy schema evolution, while proper indexing ensures fast query performance. The clear separation of concerns between collections, along with well-defined relationships, makes the data model maintainable and easy to understand. The backup and scaling strategies ensure data durability and system availability as the platform grows.
