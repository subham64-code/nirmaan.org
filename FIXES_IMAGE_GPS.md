# Image Upload & GPS Tracking - Fixes Applied ✅

## Issues Fixed

### 1. 404 Error on Image Upload ❌ → ✅

**Problem**: When uploading profile photos, getting 404 errors and photos not saving

**Root Cause**: 
- The `Content-Type: multipart/form-data` header was being explicitly set
- This broke axios/FormData automatic boundary handling
- Backend couldn't properly parse the multipart data
- Request path became malformed, resulting in 404

**Solution Applied**:
✅ Removed explicit `Content-Type: multipart/form-data` header from:
- `UserProfileHeader.tsx` (line 86)
- `Navbar.tsx` (line 88)

Now axios automatically handles the correct content type with proper boundary markers.

**Testing Image Upload**:
1. Login to dashboard (admin/teacher/student)
2. Click profile picture in top-right corner
3. Select "Upload Photo"
4. Choose an image (JPG, PNG, GIF, WebP)
5. ✅ Photo should upload successfully
6. ✅ See success message
7. ✅ Photo displays in profile dropdown and navbar

---

### 2. Geolocation "HTTPS Required" Error ❌ → ✅

**Problem**: Getting error "Geolocation requires a secure (HTTPS) connection" even on localhost

**Root Cause**:
- Browser Permissions-Policy header was blocking ALL geolocation access
- Geolocation API checks `window.isSecureContext` (true for HTTPS or localhost)
- But Permissions-Policy was preventing it regardless

**Solution Applied**:

#### A. Permissions-Policy Header (next.config.js)
✅ Updated to allow geolocation in **development mode only**:
```javascript
// Development: geolocation enabled
'camera=(), microphone=(), autoplay=(), encrypted-media=()'

// Production: geolocation disabled
'camera=(), microphone=(), geolocation=(), autoplay=(), encrypted-media=()'
```

#### B. Better Error Messages (GPSBasedAttendance.tsx & GPSTracker.tsx)
✅ Updated error handling to recognize localhost as secure:
```javascript
// Only show HTTPS error if NOT on localhost
if (!window.isSecureContext && 
    !window.location.hostname.includes('localhost') && 
    window.location.hostname !== '127.0.0.1') {
  errorMsg = 'Geolocation requires HTTPS for non-localhost domains.';
}
```

**Testing GPS Tracking**:

1. **Go to Attendance Page**
   - URL: `http://localhost:3000/attendance`
   - Login as student

2. **Click "Check GPS Location"**
   - You should see permission prompt ✅
   - Browser asks: "Allow this site to access your location?"

3. **Grant Permission**
   - Click "Allow"
   - GPS coordinates should display

4. **Expected Output**:
   ```
   ✅ GPS locked
   ✅ Your coordinates: Lat/Lng
   ✅ Nearest center found
   ✅ Distance to center: X km
   ```

---

## Detailed Changes

### Frontend Files Updated

| File | Change | Reason |
|------|--------|--------|
| `UserProfileHeader.tsx` | Removed `Content-Type` header | Let axios handle FormData automatically |
| `Navbar.tsx` | Removed `Content-Type` header | Let axios handle FormData automatically |
| `next.config.js` | Allow geolocation in dev mode | Enable GPS on localhost |
| `GPSBasedAttendance.tsx` | Improved error checking | Show proper errors for localhost |
| `GPSTracker.tsx` | Improved error checking | Show proper errors for localhost |

---

## API Request Flow (Fixed)

### Before (❌ 404 Error)
```
Client sends:
POST /api/media/upload-profile
Headers: {
  Authorization: Bearer token,
  Content-Type: multipart/form-data  // ❌ WRONG - breaks boundary
}
Body: FormData with photo

Backend receives:
❌ Can't parse multipart data properly
❌ Returns 404 (route not found due to parsing error)
```

### After (✅ Working)
```
Client sends:
POST /api/media/upload-profile
Headers: {
  Authorization: Bearer token
  // No explicit Content-Type - let axios set it with proper boundary
}
Body: FormData with photo

Backend receives:
✅ Correct multipart encoding
✅ Parses photo file correctly
✅ Saves to /uploads/{role}/{userId}-{timestamp}.ext
✅ Returns 200 with photoUrl
```

---

## How to Verify Fixes Are Working

### Check 1: Network Request
1. Open DevTools (F12)
2. Go to Network tab
3. Upload a profile photo
4. Look for `/api/media/upload-profile` request
5. ✅ Should show **200 OK** (not 404)
6. ✅ Response should have `photoUrl` field

### Check 2: Image Display
1. After upload completes
2. Profile picture in navbar updates ✅
3. Photo appears in profile dropdown ✅
4. Photo persists after page refresh ✅

### Check 3: GPS Permission
1. Go to `/attendance` page
2. Click "Check GPS Location" button
3. Browser should show permission prompt ✅
4. Grant location access
5. Should see coordinates displayed ✅

---

## Troubleshooting

### "Still getting 404 on image upload"
**Check**:
1. Is backend running? `npm start` in backend folder
2. Does `/uploads` folder exist? Create if missing: `mkdir backend/uploads`
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check DevTools > Network tab for actual error

**Solution**: 
- Restart backend server
- Clear browser cache and cookies
- Hard refresh (Ctrl+F5)

### "GPS still says HTTPS required"
**Check**:
1. Are you on `http://localhost:3000`? (not example.com)
2. Open DevTools Console tab
3. Run: `console.log(window.isSecureContext)`
4. Should return: `true` ✅

**Solution**:
- Use localhost (not IP address)
- Use port 3000 (standard dev port)
- Hard refresh (Ctrl+F5)
- Restart dev server if needed

### "Browser doesn't ask for GPS permission"
**Possible Reasons**:
1. Already denied permission previously
2. Permissions-Policy not updated (server needs restart)
3. Feature not fully supported in your browser

**Solution**:
1. Reset browser permissions:
   - Chrome: Settings → Privacy → Site settings → Location → Reset
   - Firefox: Preferences → Privacy → Permissions → Location → Clear
2. Restart dev server (backend AND frontend)
3. Hard refresh browser
4. Try again - should see permission prompt

### "Photo uploads but doesn't display"
**Check**:
1. Is photo file valid? (JPG, PNG, GIF, WebP)
2. Is file under 5MB?
3. Check browser console for errors (F12)
4. Check localStorage: Open DevTools > Application > LocalStorage
   - Look for `nirmaan_user_picture` key

**Solution**:
- Verify file format and size
- Check `/uploads/{role}/` folder exists on backend
- Restart backend server

---

## File Storage Structure

Photos are automatically organized:
```
backend/
├── uploads/
│   ├── admin/              # Admin profile photos
│   │   └── 12345-1234567890.jpg
│   ├── teacher/            # Teacher profile photos
│   │   └── 67890-1234567890.png
│   └── student/            # Student profile photos
│       └── 99999-1234567890.jpg
```

Served from: `http://localhost:5000/uploads/{role}/{filename}`

---

## Security Notes

✅ **File Validation**:
- Only images allowed (JPG, PNG, GIF, WebP)
- Max file size: 5MB
- Files saved with timestamp to prevent overwrite

✅ **Authentication**:
- All upload endpoints require valid JWT token
- Only authenticated users can upload
- Role parameter validated server-side

✅ **Geolocation in Production**:
- Geolocation blocked in production (Permissions-Policy)
- Only enabled for development (localhost)
- Production: Use HTTPS + explicit permission requests

---

## Next Steps

1. **Test Image Upload**: Upload a profile photo ✅
2. **Test GPS**: Go to attendance and enable GPS ✅
3. **Check Files**: Verify photos in backend `/uploads/` folder ✅
4. **Clear Cache**: Hard refresh if issues persist ✅

---

## API Endpoints Summary

### Profile Photo Upload
```
POST /api/media/upload-profile
Headers:
  Authorization: Bearer {token}
Body: FormData
  - photo: File
  - role: "admin" | "teacher" | "student"

Response:
{
  "success": true,
  "data": {
    "photoUrl": "/uploads/student/12345-1234567890.jpg",
    "user": { ... }
  }
}
```

### Get User Profile
```
GET /students/me
Headers:
  Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "profile": {
      "photoUrl": "/uploads/student/12345-1234567890.jpg",
      "name": "John Doe",
      ...
    }
  }
}
```

### Verify GPS Location
```
POST /api/attendance/verify-gps
Headers:
  Authorization: Bearer {token}
Body:
{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "studentName": "John Doe"
}
```

---

## Support

If issues persist after applying these fixes:

1. Check browser console for error messages (F12 → Console)
2. Check backend logs for server errors
3. Verify `.env` file has correct API_URL
4. Ensure both backend and frontend are restarted
5. Clear all browser cache and cookies

All fixes have been applied to your codebase! 🎉
