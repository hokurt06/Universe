// controllers/enrollmentController.js
const { Course } = require("../models/Course");
const { addEnrollmentToUser, getUserById } = require("../models/User");

// POST /enrollments
async function addEnrollment(req, res) {
  try {
    const {
      course_code,
      quarter,
      section,
      professor,
      meeting_time,
      class_type,
      grade,
    } = req.body;

    const course = await Course.findOne({ course_code });
    if (!course) {
      return res.status(404).json({ message: "Course not found in catalog" });
    }

    const enrollmentData = {
      course: {
        course_code: course.course_code,
        title: course.title,
        credits: course.credits,
        description: course.description,
        college: course.college,
      },
      quarter,
      section,
      professor,
      meeting_time: meeting_time || "",
      class_type: class_type || "",
      grade: grade || null,
    };

    const updatedUser = await addEnrollmentToUser(req.user.id, enrollmentData);
    res.status(201).json({
      message: "Enrollment added successfully",
      enrollments: updatedUser.enrollments,
    });
  } catch (error) {
    console.error("Error adding enrollment:", error);
    res
      .status(500)
      .json({ message: "Error adding enrollment", error: error.message });
  }
}

// GET /enrollments
async function getEnrollments(req, res) {
  try {
    const user = await getUserById(req.user.id);
    res.json({ enrollments: user.enrollments || [] });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res
      .status(500)
      .json({ message: "Error fetching enrollments", error: error.message });
  }
}

// DELETE /enrollments/:courseCode
async function removeEnrollment(req, res) {
  try {
    const { courseCode } = req.params;
    const updatedUser = await removeEnrollmentFromUser(req.user.id, courseCode);
    res.json({
      message: "Enrollment removed",
      enrollments: updatedUser.enrollments,
    });
  } catch (error) {
    console.error("Error removing enrollment:", error);
    res
      .status(500)
      .json({ message: "Error removing enrollment", error: error.message });
  }
}

module.exports = {
  addEnrollment,
  getEnrollments,
  removeEnrollment,
};
