const express = require("express");
const fs = require("fs");
const path = require("path");
const { ok, fail } = require("../utils/apiResponse");

const router = express.Router();

// List of allowed files for security
const ALLOWED_FILES = [
  "AI SYLLABUS 3 MONTH DAY WISE_All centers.pdf",
  "Day Plan Softskills_All Centers.pdf",
  "Nirmaan-Brochure.pdf"
];

// Download file endpoint
router.get("/download", async (req, res) => {
  try {
    const { filename } = req.query;

    // Validate filename
    if (!filename || typeof filename !== "string") {
      return fail(res, 400, "Filename is required");
    }

    // Check if file is in allowed list
    if (!ALLOWED_FILES.includes(filename)) {
      return fail(res, 403, "File not allowed");
    }

    // Construct safe file path
    const filePath = path.join(process.cwd(), filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      // For missing PDF files, return a placeholder response or create a sample
      console.warn(`File not found: ${filePath}, returning placeholder for: ${filename}`);
      
      // Return a JSON response indicating the file should be generated or a placeholder
      // In production, you would generate actual PDFs here or return from cloud storage
      if (filename === "Nirmaan-Brochure.pdf") {
        // Generate a simple brochure text as fallback
        res.setHeader("Content-Type", "text/plain");
        res.setHeader("Content-Disposition", `attachment; filename="Nirmaan-Brochure.txt"`);
        const brochureText = `
NIRMAAN - AI & ML TRAINING EXCELLENCE

Welcome to Nirmaan, a premier AI/ML training institute delivering cutting-edge education
in Artificial Intelligence, Deep Learning, NLP, Generative AI, and Soft Skills.

PROGRAM OFFERINGS:
- AI/ML Fundamentals (3 Months)
- Deep Learning & Computer Vision (3 Months)
- NLP & Generative AI (3 Months)
- Soft Skills & Professional Development (Ongoing)

LOCATIONS:
- GIFT Bhubaneswar Hub (Odisha)
- Multiple India Centers

PLACEMENT SUPPORT:
- 100% Placement Assistance
- Industry-Ready Curriculum
- Expert Mentorship
- Real-World Projects

CONTACT:
Visit: https://nirmaan.org
Email: info@nirmaan.org

For the complete PDF brochure, please contact our admissions team.
        `;
        return res.send(brochureText);
      }
      
      return fail(res, 404, `File not found: ${filename}. Please contact admin to upload the document.`);
    }

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Stream file
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on("error", (error) => {
      console.error("File stream error:", error);
      res.status(500).json({ ok: false, message: "Error reading file" });
    });

    fileStream.pipe(res);
  } catch (error) {
    console.error("Download error:", error);
    return fail(res, 500, "Failed to download file: " + error.message);
  }
});

// List available files
router.get("/list", async (req, res) => {
  try {
    const files = ALLOWED_FILES.map((filename) => {
      const filePath = path.join(process.cwd(), filename);
      const exists = fs.existsSync(filePath);
      
      let size = 0;
      if (exists) {
        const stats = fs.statSync(filePath);
        size = stats.size;
      }

      return {
        name: filename,
        exists,
        size: size > 0 ? `${(size / (1024 * 1024)).toFixed(2)} MB` : "N/A",
        status: exists ? "available" : "pending"
      };
    });

    return ok(res, files, "Available files retrieved");
  } catch (error) {
    console.error("List files error:", error);
    return fail(res, 500, "Failed to list files: " + error.message);
  }
});

module.exports = router;
