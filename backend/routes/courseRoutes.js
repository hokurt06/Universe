// routes/courseRoutes.js
const express = require("express");
const router = express.Router();

const { requireFields } = require("../middleware/validationMiddleware");
const {
  createCourse,
  listCourses,
} = require("../controllers/courseController");

// POST /courses
router.post(
  "/",
  requireFields(["course_code", "title", "credits", "college"]),
  createCourse
);

// GET /courses
router.get("/", listCourses);

module.exports = router;
