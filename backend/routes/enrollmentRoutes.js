// routes/enrollmentRoutes.js
const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const { requireFields } = require("../middleware/validationMiddleware");
const {
  addEnrollment,
  getEnrollments,
  removeEnrollment,
} = require("../controllers/enrollmentController");

// POST /enrollments
router.post(
  "/",
  authenticateToken,
  requireFields(["course_code", "quarter", "section", "professor"]),
  addEnrollment
);

// GET /enrollments
router.get("/", authenticateToken, getEnrollments);

// DELETE /enrollments/:courseCode
router.delete("/:courseCode", authenticateToken, removeEnrollment);

module.exports = router;
