# Frontend Architecture Pipeline Documentation

## Overview

The frontend pipeline for the Nirmaan Educational Platform is built on Next.js 14 with the App Router, providing a modern, performant, and scalable user interface. This document outlines the complete frontend architecture, data flow, component hierarchy, and build pipeline.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: TailwindCSS + Custom CSS Variables
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod Validation
- **State Management**: React Hooks (useState, useEffect, useContext)
- **TypeScript**: Full type safety

## Frontend Architecture Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Interaction Layer                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Component Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  Page Components (app/)  │  Layout Components  │  UI Components │
│  - page.tsx              │  - DashboardShell   │  - Buttons     │
│  - login/*               │  - Navbar           │  - Cards       │
│  - dashboard/*           │  - Sidebar          │  - Forms       │
│  - syllabus/*            │  - Footer           │  - Modals      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Custom Hooks Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  useAuth()  │  useApi()  │  useLocalStorage()  │  useMediaQuery()│
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Service Layer                                 │
├─────────────────────────────────────────────────────────────────┤
│  API Client (Axios)  │  AI Services  │  Utility Functions        │
│  - api.ts             │  - gemini.ts  │  - validators.ts         │
│  - authHeader()       │  - deepseek.ts│  - formatters.ts         │
│                       │  - ollama.ts  │                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Layer                                    │
├─────────────────────────────────────────────────────────────────┤
│  API Endpoints  │  Local Storage  │  Session Storage            │
│  - REST API     │  - JWT Token    │  - User Session            │
│  - GraphQL (Future)                │                            │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

### Page Components (App Router)

```
app/
├── layout.tsx                    # Root layout
├── page.tsx                      # Home/Landing page
├── login/
│   ├── student/
│   │   └── page.tsx              # Student login
│   ├── teacher/
│   │   └── page.tsx              # Teacher login
│   └── admin/
│       └── page.tsx              # Admin login
├── dashboard/
│   ├── layout.tsx                # Dashboard layout
│   ├── admin/
│   │   ├── page.tsx              # Admin dashboard
│   │   ├── ai-assistant/
│   │   │   └── page.tsx          # AI assistant
│   │   ├── teachers/
│   │   │   └── page.tsx          # Teacher management
│   │   ├── applications/
│   │   │   └── page.tsx          # Application management
│   │   └── media/
│   │       └── page.tsx          # Media management
│   ├── teacher/
│   │   ├── page.tsx              # Teacher dashboard
│   │   ├── tests/
│   │   │   ├── page.tsx          # Test list
│   │   │   └── [testId]/
│   │   │       ├── results/
│   │   │       │   └── [resultId]/
│   │   │       │       └── page.tsx
│   │   ├── attendance/
│   │   │   └── page.tsx          # Attendance marking
│   │   └── performance/
│   │       └── page.tsx          # Performance analytics
│   └── student/
│       ├── page.tsx              # Student dashboard
│       ├── tests/
│       │   └── page.tsx          # Available tests
│       ├── attendance/
│       │   └── page.tsx          # Attendance view
│       └── performance/
│           └── page.tsx          # Performance view
├── syllabus/
│   └── page.tsx                  # Syllabus page
├── attendance/
│   └── page.tsx                  # Attendance public page
├── notes/
│   └── page.tsx                  # Notes page
└── apply/
    └── page.tsx                  # Application form
```

### Component Categories

#### 1. Layout Components
- **DashboardShell**: Main dashboard layout with navigation
- **Navbar**: Top navigation bar
- **Sidebar**: Side navigation for dashboards
- **Footer**: Page footer

#### 2. UI Components
- **AnimatedCard**: Animated card component
- **Glass**: Glassmorphism effect wrapper
- **ImageWithFallback**: Image with fallback text
- **LogoSection**: Logo display components

#### 3. Form Components
- **RealTimeOTPLogin**: OTP-based login form
- **StudentLoginWithList**: Student selection login
- **ApplicationForm**: Student application form

#### 4. AI Components
- **AIChatWidget**: Public AI chatbot
- **AdminChatbot**: Admin dashboard AI assistant
- **TeacherProfileCard**: Teacher profile display

#### 5. Content Components
- **FacultyIntroVideos**: Faculty introduction videos
- **AchievementsSection**: Achievements display
- **ViewNotes**: Notes viewer and downloader
- **StudentAssessmentView**: Student test view

## Data Flow Pipeline

### 1. Authentication Flow

```
User Input
    ↓
Component State (useState)
    ↓
Form Handler
    ↓
API Service (api.ts)
    ↓
Axios Request (with authHeader)
    ↓
Backend API
    ↓
Response
    ↓
Update State / localStorage
    ↓
UI Re-render
```

**Example: OTP Login**
```typescript
// Component
const [email, setEmail] = useState("");
const [otp, setOtp] = useState("");

// API Call
const response = await api.post("/auth/verify-otp", {
  email,
  otp,
  role: "student"
});

// Store Token
localStorage.setItem("nirmaan_token", response.data.data.token);
localStorage.setItem("nirmaan_user", JSON.stringify(response.data.data.user));
```

### 2. Data Fetching Flow

```
Component Mount (useEffect)
    ↓
Fetch Function
    ↓
API Service (api.ts)
    ↓
Axios Request (with authHeader)
    ↓
Backend API
    ↓
Response
    ↓
Update State
    ↓
UI Re-render with Data
```

**Example: Fetching Tests**
```typescript
useEffect(() => {
  const fetchTests = async () => {
    try {
      const response = await api.get("/tests", {
        headers: authHeader(token)
      });
      setTests(response.data.data);
    } catch (error) {
      console.error("Failed to fetch tests:", error);
    }
  };
  fetchTests();
}, []);
```

### 3. AI Service Integration Flow

```
User Input (Topic/Question)
    ↓
Component State
    ↓
AI Service Call (gemini.ts/deepseek.ts/ollama.ts)
    ↓
External API (Gemini/DeepSeek/Ollama)
    ↓
AI Response
    ↓
Update State
    ↓
Display in UI
```

**Example: AI Question Generation**
```typescript
const handleAiGenerateQuestions = async () => {
  try {
    const questions = await OllamaService.generateQuestions(
      aiTopic,
      aiDifficulty,
      aiQuestionCount,
      aiQuestionType
    );
    setAiGeneratedQuestions(questions);
  } catch (error) {
    console.error("AI generation error:", error);
  }
};
```

## State Management Strategy

### Local State (useState)
- Form inputs
- UI toggles (modals, dropdowns)
- Temporary data
- Loading states
- Error messages

### Global State (Context API - Future)
- User authentication status
- Theme preferences
- Notification system

### Server State (React Query - Future)
- Cached API responses
- Optimistic updates
- Background refetching

### Persistent Storage
- **localStorage**: JWT tokens, user data, preferences
- **sessionStorage**: Temporary session data

## API Integration Pipeline

### Axios Configuration (lib/api.ts)

```typescript
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("nirmaan_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("nirmaan_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### API Service Patterns

**1. GET Request**
```typescript
const fetchData = async () => {
  const response = await api.get("/endpoint", {
    headers: authHeader(token)
  });
  return response.data;
};
```

**2. POST Request**
```typescript
const createData = async (data: FormData) => {
  const response = await api.post("/endpoint", data, {
    headers: authHeader(token)
  });
  return response.data;
};
```

**3. PUT/PATCH Request**
```typescript
const updateData = async (id: string, data: FormData) => {
  const response = await api.put(`/endpoint/${id}`, data, {
    headers: authHeader(token)
  });
  return response.data;
};
```

**4. DELETE Request**
```typescript
const deleteData = async (id: string) => {
  const response = await api.delete(`/endpoint/${id}`, {
    headers: authHeader(token)
  });
  return response.data;
};
```

## Build Pipeline

### Development Build
```bash
npm run dev
```
- Hot Module Replacement (HMR)
- Fast Refresh
- Development server on localhost:3000
- Source maps enabled

### Production Build
```bash
npm run build
```
- Static optimization
- Code splitting
- Tree shaking
- Minification
- Image optimization
- CSS optimization

### Static Export (Optional)
```bash
npm run build
npm run export
```
- Generates static HTML files
- No server required
- Suitable for static hosting

## Performance Optimization

### 1. Code Splitting
- Automatic route-based splitting
- Dynamic imports for heavy components
- Lazy loading for images

### 2. Image Optimization
- Next.js Image component
- WebP format support
- Responsive images
- Lazy loading

### 3. Caching Strategy
- Static asset caching
- API response caching (future with React Query)
- Browser caching headers

### 4. Bundle Optimization
- Tree shaking
- Minification
- Compression (gzip/brotli)

### 5. Rendering Strategy
- Static Generation (SSG) for static pages
- Server-Side Rendering (SSR) for dynamic pages
- Client-Side Rendering (CSR) for interactive components

## Error Handling Pipeline

### Component-Level Error Handling
```typescript
try {
  const response = await api.get("/endpoint");
  setData(response.data);
} catch (error) {
  console.error("Error:", error);
  setError("Failed to fetch data");
} finally {
  setLoading(false);
}
```

### Global Error Boundary
```typescript
// Error boundary component to catch React errors
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### API Error Handling
```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          break;
        case 403:
          // Forbidden - show access denied
          break;
        case 404:
          // Not found - show error message
          break;
        case 500:
          // Server error - show server error message
          break;
      }
    } else if (error.request) {
      // No response from server
      console.error("Network error");
    } else {
      // Request setup error
      console.error("Request error");
    }
    return Promise.reject(error);
  }
);
```

## Security Pipeline

### 1. Environment Variables
- Sensitive data stored in .env.local
- Not committed to version control
- Accessible only on server-side (NEXT_PUBLIC_ for client-side)

### 2. Input Validation
- Client-side validation with Zod
- Server-side validation (backend)
- Sanitization of user inputs

### 3. XSS Prevention
- React's built-in XSS protection
- Content Security Policy (CSP) headers
- Sanitize HTML when using dangerouslySetInnerHTML

### 4. CSRF Protection
- SameSite cookie attributes
- CSRF tokens for state-changing operations

### 5. Secure Headers
- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security (HTTPS)

## Testing Pipeline (Future)

### Unit Testing
```bash
npm run test
```
- Jest testing framework
- React Testing Library
- Component testing

### Integration Testing
- API integration tests
- End-to-end testing with Playwright/Cypress

### Type Checking
```bash
npm run type-check
```
- TypeScript type checking
- Catch type errors at build time

## Deployment Pipeline

### Development Deployment
```bash
npm run dev
```
- Local development server
- Hot reload enabled

### Staging Deployment
```bash
npm run build
npm run start
```
- Production build
- Test on staging environment

### Production Deployment
```bash
npm run build
npm run start
# or deploy to Vercel/Netlify
vercel --prod
```

**Vercel Deployment:**
- Automatic deployments on git push
- Preview deployments for pull requests
- Edge network caching
- Automatic HTTPS

**Netlify Deployment:**
- Continuous deployment from git
- Edge functions for API routes
- Form handling
- Automatic HTTPS

## Monitoring & Analytics (Future)

### Performance Monitoring
- Web Vitals tracking
- Core Web Vitals (LCP, FID, CLS)
- Custom performance metrics

### User Analytics
- Google Analytics integration
- User behavior tracking
- Conversion funnel analysis

### Error Tracking
- Sentry integration
- Error reporting and alerting
- Performance monitoring

## Summary

The frontend pipeline for Nirmaan Educational Platform follows modern React and Next.js best practices. The architecture is modular, scalable, and performance-optimized. The clear separation of concerns between components, services, and data layers makes the codebase maintainable and easy to extend. The pipeline supports both development and production environments with appropriate build optimizations and error handling strategies.
