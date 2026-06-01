const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Media = require("../models/Media");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { ok, created, fail } = require("../utils/apiResponse");
const { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } = require("../config/cloudinary");

const router = express.Router();

const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const tempStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`),
});

const upload = multer({
  storage: tempStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

router.post("/upload", auth(["admin", "teacher"]), upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return fail(res, 400, "No file uploaded");
    const { category, title, type } = req.body;
    const result = await uploadToCloudinary(req.file.path);
    fs.unlink(req.file.path, () => {});
    const media = await Media.create({
      category,
      title,
      type,
      url: result.secure_url,
      publicId: result.public_id,
      createdBy: req.user.sub,
    });
    return created(res, media, "Media uploaded");
  } catch (error) {
    console.error("Media upload error:", error);
    return fail(res, 500, "Failed to upload media: " + error.message);
  }
});

router.post("/upload-profile", auth(["admin", "teacher", "student"]), upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return fail(res, 400, "No file uploaded");
    const result = await uploadToCloudinary(req.file.path, { folder: 'nirmaan/profiles' });
    fs.unlink(req.file.path, () => {});

    const photoUrl = result.secure_url;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.sub,
      { photoUrl, picture: photoUrl },
      { new: true }
    );

    if (!updatedUser) return fail(res, 404, "User not found");
    return ok(res, { photoUrl, user: updatedUser }, "Profile photo uploaded successfully");
  } catch (error) {
    console.error("Profile photo upload error:", error);
    return fail(res, 500, "Failed to upload profile photo: " + error.message);
  }
});

router.get("/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("photoUrl picture name email");
    if (!user) return fail(res, 404, "User not found");
    return ok(res, { photoUrl: user.photoUrl || user.picture, name: user.name, email: user.email });
  } catch (error) {
    console.error("Get profile error:", error);
    return fail(res, 500, "Failed to get profile: " + error.message);
  }
});

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

router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return fail(res, 404, "Media not found");
    if (media.publicId) {
      deleteFromCloudinary(media.publicId).catch(() => {});
    }
    await Media.findByIdAndDelete(req.params.id);
    return ok(res, {}, "Media deleted");
  } catch (error) {
    return fail(res, 500, "Failed to delete media: " + error.message);
  }
});

module.exports = router;
