// models/Enrollment.js
const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    course: {
      course_code: { type: String, required: true },
      title: { type: String, required: true },
      credits: { type: Number, required: true },
      description: String,
      college: String,
    },
    quarter: { type: String },
    section: { type: String },
    professor: { type: String },
    meeting_time: { type: String },
    class_type: { type: String },
    grade: { type: Number },
    enrolled_at: { type: Date, default: Date.now },
  },
  { _id: false }
);

module.exports = enrollmentSchema;
