const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Media = require("../models/Media");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { ok, created, fail } = require("../utils/apiResponse");

const router = express.Router();

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Create role-specific directories
const rolesDir = {
  admin: path.join(uploadDir, "admin"),
  teacher: path.join(uploadDir, "teacher"),
  student: path.join(uploadDir, "student"),
  media: uploadDir
};

Object.values(rolesDir).forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Storage for general media files
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`),
});

// Storage for role-based profile photos
const profilePhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const role = req.body.role || req.user?.role || "student";
    const roleDir = rolesDir[role] || rolesDir.student;
    cb(null, roleDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = req.body.userId || req.user?.sub || "unknown";
    cb(null, `${name}-${timestamp}${ext}`);
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

const uploadProfilePhoto = multer({ 
  storage: profilePhotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile photos'));
    }
  }
});

// General media upload
router.post("/upload", auth(["admin", "teacher"]), upload.single("file"), async (req, res) => {
  try {
    const { category, title, type } = req.body;
    const media = await Media.create({
      category,
      title,
      type,
      url: `/uploads/${req.file.filename}`,
      createdBy: req.user.sub,
    });
    return created(res, media, "Media uploaded");
  } catch (error) {
    console.error("Media upload error:", error);
    return fail(res, 500, "Failed to upload media: " + error.message);
  }
});

// Profile photo upload for authenticated users
router.post("/upload-profile", auth(["admin", "teacher", "student"]), uploadProfilePhoto.single("photo"), async (req, res) => {
  try {
    if (!req.file) {
      return fail(res, 400, "No file uploaded");
    }

    const role = req.body.role || req.user.role;
    const photoUrl = `/uploads/${role}/${req.file.filename}`;

    // Update user profile with photo URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user.sub,
      { 
        photoUrl: photoUrl,
        picture: photoUrl // Also update picture field
      },
      { new: true }
    );

    if (!updatedUser) {
      return fail(res, 404, "User not found");
    }

    return ok(res, {
      photoUrl: photoUrl,
      user: updatedUser
    }, "Profile photo uploaded successfully");
  } catch (error) {
    console.error("Profile photo upload error:", error);
    return fail(res, 500, "Failed to upload profile photo: " + error.message);
  }
});

// Get user profile photo
router.get("/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("photoUrl picture name email");
    
    if (!user) {
      return fail(res, 404, "User not found");
    }

    return ok(res, {
      photoUrl: user.photoUrl || user.picture,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return fail(res, 500, "Failed to get profile: " + error.message);
  }
});

// Get all media
router.get("/", async (req, res) => {
  try {
    const category = req.query.category;
    const filter = category ? { category } : {};
    const items = await Media.find(filter).sort({ createdAt: -1 });
    return ok(res, items);
  } catch (error) {
    return fail(res, 500, "Failed to fetch media: " + error.message);
  }
});

// Delete media
router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);
    if (!media) return fail(res, 404, "Media not found");
    return ok(res, {}, "Media deleted");
  } catch (error) {
    return fail(res, 500, "Failed to delete media: " + error.message);
  }
});

module.exports = router;
