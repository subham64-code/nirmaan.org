const express = require("express");
const Faculty = require("../models/Faculty");
const auth = require("../middleware/auth");
const { ok, created, fail } = require("../utils/apiResponse");
const logAction = require("../utils/logAction");

const router = express.Router();

// Get all faculty members
router.get("/", async (req, res) => {
  try {
    const faculties = await Faculty.find({ isActive: true })
      .select("name designation photo department bio email phone")
      .sort({ designation: 1, name: 1 });

    return ok(res, faculties, "Faculty members retrieved");
  } catch (error) {
    console.error("Get faculty error:", error);
    return fail(res, 500, "Failed to retrieve faculty: " + error.message);
  }
});

// Get faculty by designation
router.get("/designation/:designation", async (req, res) => {
  try {
    const { designation } = req.params;
    const faculties = await Faculty.find({ designation, isActive: true })
      .select("name designation photo department bio email phone")
      .sort({ name: 1 });

    return ok(res, faculties, `${designation} retrieved`);
  } catch (error) {
    console.error("Get faculty by designation error:", error);
    return fail(res, 500, "Failed to retrieve faculty: " + error.message);
  }
});

// Get faculty by name
router.get("/name/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const faculty = await Faculty.findOne({ name: new RegExp(name, "i"), isActive: true });

    if (!faculty) {
      return fail(res, 404, "Faculty member not found");
    }

    return ok(res, faculty, "Faculty member retrieved");
  } catch (error) {
    console.error("Get faculty by name error:", error);
    return fail(res, 500, "Failed to retrieve faculty: " + error.message);
  }
});

// Get single faculty by ID
router.get("/:id", async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return fail(res, 404, "Faculty not found");
    }

    return ok(res, faculty, "Faculty retrieved");
  } catch (error) {
    console.error("Get faculty by ID error:", error);
    return fail(res, 500, "Failed to retrieve faculty: " + error.message);
  }
});

// Add faculty (admin only)
router.post("/", auth(["admin"]), async (req, res) => {
  try {
    const { name, email, phone, designation, photo, department, bio } = req.body;

    const existingFaculty = await Faculty.findOne({ $or: [{ name }, { email }] });
    if (existingFaculty) {
      return fail(res, 400, "Faculty member already exists");
    }

    const faculty = await Faculty.create({
      name,
      email,
      phone,
      designation,
      photo,
      department,
      bio,
    });

    await logAction(req.user.sub, "faculty.create", { facultyId: faculty._id, name });

    return created(res, faculty, "Faculty member added");
  } catch (error) {
    console.error("Create faculty error:", error);
    return fail(res, 500, "Failed to add faculty: " + error.message);
  }
});

// Update faculty (admin only)
router.put("/:id", auth(["admin"]), async (req, res) => {
  try {
    const { name, email, phone, designation, photo, department, bio, isActive } = req.body;

    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        designation,
        photo,
        department,
        bio,
        isActive,
      },
      { new: true }
    );

    if (!faculty) {
      return fail(res, 404, "Faculty not found");
    }

    await logAction(req.user.sub, "faculty.update", { facultyId: faculty._id, name });

    return ok(res, faculty, "Faculty updated");
  } catch (error) {
    console.error("Update faculty error:", error);
    return fail(res, 500, "Failed to update faculty: " + error.message);
  }
});

// Delete faculty (admin only)
router.delete("/:id", auth(["admin"]), async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);

    if (!faculty) {
      return fail(res, 404, "Faculty not found");
    }

    await logAction(req.user.sub, "faculty.delete", { facultyId: faculty._id, name: faculty.name });

    return ok(res, null, "Faculty deleted");
  } catch (error) {
    console.error("Delete faculty error:", error);
    return fail(res, 500, "Failed to delete faculty: " + error.message);
  }
});

module.exports = router;
