// models/Course.js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  course_code: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  credits: { type: Number, required: true },
  description: { type: String },
  college: { type: String },
  created_at: { type: Date, default: Date.now },
});

const Course = mongoose.model("Course", courseSchema);

// Data helpers:

async function getAllCourses() {
  return await Course.find({}).lean();
}

async function addCourse(courseData) {
  const course = new Course(courseData);
  return await course.save();
}

module.exports = {
  Course,
  getAllCourses,
  addCourse,
};
