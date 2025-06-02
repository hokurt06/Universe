// controllers/courseController.js
const { getAllCourses, addCourse } = require("../models/Course");

// POST /courses
async function createCourse(req, res) {
  try {
    const { course_code, title, credits, description, college } = req.body;
    const course = await addCourse({
      course_code,
      title,
      credits,
      description: description || "",
      college,
    });
    res.status(201).json({
      message: "Course added successfully",
      courseId: course._id,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res
      .status(500)
      .json({ message: "Error creating course", error: error.message });
  }
}

// GET /courses
async function listCourses(req, res) {
  try {
    const courses = await getAllCourses();
    res.json({ courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res
      .status(500)
      .json({ message: "Error fetching courses", error: error.message });
  }
}

module.exports = {
  createCourse,
  listCourses,
};
