const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Media = require("../models/Media");
const auth = require("../middleware/auth");
const { ok, created } = require("../utils/apiResponse");

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`),
});
const upload = multer({ storage });

router.post("/upload", auth(["admin", "teacher"]), upload.single("file"), async (req, res) => {
  const { category, title, type } = req.body;
  const media = await Media.create({
    category,
    title,
    type,
    url: `/uploads/${req.file.filename}`,
    createdBy: req.user.sub,
  });
  return created(res, media, "Media uploaded");
});

router.get("/", async (req, res) => {
  const category = req.query.category;
  const filter = category ? { category } : {};
  const items = await Media.find(filter).sort({ createdAt: -1 });
  return ok(res, items);
});

router.delete("/:id", auth(["admin"]), async (req, res) => {
  const media = await Media.findByIdAndDelete(req.params.id);
  if (!media) return fail(res, 404, "Media not found");
  return ok(res, {}, "Media deleted");
});

module.exports = router;
