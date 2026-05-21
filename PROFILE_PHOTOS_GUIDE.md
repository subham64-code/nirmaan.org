# Profile Photo Management Guide

## Overview
The profile photo system now supports uploading and displaying photos for Admin, Teacher, and Student roles with organized file storage.

## Features

### 1. **Profile Photo Upload**
- Upload photos via dashboard header
- Supported formats: JPG, PNG, GIF, WebP
- Maximum file size: 5MB
- Photos are organized by role:
  - `/uploads/admin/` - Admin profile photos
  - `/uploads/teacher/` - Teacher profile photos
  - `/uploads/student/` - Student profile photos

### 2. **Photo Display**
Photos are displayed in:
- **Navbar** - Top-right profile menu
- **Dashboard Shells** - All dashboards (Admin, Teacher, Student)
- **UserProfileHeader** - Dropdown menu with profile info
- **TeacherProfileCard** - Teacher profile cards

### 3. **Photo Storage**
Backend stores photos with:
- Automatic folder organization by role
- Filename format: `{userId}-{timestamp}.{extension}`
- Static file serving via `/uploads/{role}/{filename}`

## How to Use

### For Users

#### Uploading a Profile Photo

1. **Navigate to your dashboard**
   - Admin: `/dashboard/admin`
   - Teacher: `/dashboard/teacher`
   - Student: `/dashboard/student`

2. **Click on your profile picture** in the top-right corner

3. **Select "Upload Photo"** from the dropdown menu

4. **Choose an image file** from your device
   - Formats: JPG, PNG, GIF, WebP
   - Size: Up to 5MB

5. **Photo updates automatically** in all locations

#### Updating from Navbar

You can also upload photos from the main navbar:
1. Click your profile picture/avatar in the top-right
2. Select "Upload Photo"
3. Choose and upload your image

### For Developers

#### API Endpoints

**Profile Photo Upload**
```
POST /api/media/upload-profile
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- photo: File
- role: admin|teacher|student (optional)
```

**Get User Profile Photo**
```
GET /api/media/profile/:userId
```

**General Media Upload**
```
POST /api/media/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- file: File
- category: string
- title: string
- type: string
```

#### Storage Locations

- **Backend Photos**: `backend/uploads/{role}/{filename}`
- **API Endpoint**: `/uploads/{role}/{filename}`
- **Frontend Access**: URL stored in User.photoUrl and User.picture

#### Database Schema

User model fields for photos:
```javascript
{
  photoUrl: String,      // Full path to uploaded photo
  picture: String,       // Legacy field, same as photoUrl
}
```

## Folder Structure

```
backend/
├── uploads/
│   ├── admin/          # Admin profile photos
│   ├── teacher/        # Teacher profile photos
│   ├── student/        # Student profile photos
│   └── [other media]   # General media uploads
```

## Troubleshooting

### Photo Not Showing
1. Check file format (must be image)
2. Verify file size (max 5MB)
3. Clear browser cache
4. Check browser console for errors
5. Verify API endpoint is working: `GET /api/media/profile/{userId}`

### Upload Fails
1. Ensure you're authenticated (token exists)
2. Verify file is an image
3. Check file size doesn't exceed 5MB
4. Check server logs for detailed errors

### Photos in Wrong Folder
- Photos are automatically organized by role
- Admin photos → `/uploads/admin/`
- Teacher photos → `/uploads/teacher/`
- Student photos → `/uploads/student/`

## Technical Details

### Frontend Components

**UserProfileHeader.tsx**
- Displays current user profile
- Handles photo upload
- Provides logout option

**Navbar.tsx**
- Shows profile in top navigation
- Fetch photos from API
- Upload capability

**DashboardShell.tsx**
- Integrates UserProfileHeader
- Fetches user data on mount
- Passes role and name to profile header

**TeacherProfileCard.tsx**
- Displays faculty profile
- Shows teacher photo
- Uses fallback avatar if no photo

### Backend Routes

**media.routes.js**
- `/media/upload` - General media upload
- `/media/upload-profile` - Profile photo upload
- `/media/profile/:userId` - Get user profile
- `/media` - List all media

### Photo Caching

Photos are cached in localStorage:
- `nirmaan_user_picture` - Current user's photo URL
- Updates when new photo uploaded
- Clears on logout

## Future Enhancements

- [ ] Crop/resize photos before upload
- [ ] Compress images automatically
- [ ] Generate avatar from initials
- [ ] Support for cover photos
- [ ] Photo validation (facial recognition)
- [ ] Bulk photo management for admins
