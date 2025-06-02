// models/User.js
const mongoose = require("mongoose");
const enrollmentSchema = require("./Enrollment");
const advisorSchema = require("./Advisor");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password_hash: { type: String, required: true },

  // ---- new “profile” fields ----
  name: { type: String, default: "", required: true }, // Alex Johnson
  pronouns: { type: String, default: "" }, // They/Them
  bio: { type: String, default: "" },
  gender: { type: String, default: "" },
  birthday: { type: Date, default: null }, // store as Date
  contactInfo: { type: String, default: "" },
  first_name: { type: String },
  last_name: { type: String },
  email: { type: String, unique: true, required: true },
  role: { type: String, default: "student" },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "University",
    required: true,
  },
  password_reset: { type: String, default: null },
  created_at: { type: Date, default: Date.now },
  enrollments: [enrollmentSchema],
  advisors: [advisorSchema],
});

const User = mongoose.model("User", userSchema);

// ------ Data operation helpers ------

// Get a user by ID (lean object)
async function getUserById(userId) {
  return await User.findById(userId).lean();
}

// Add an enrollment array entry
async function addEnrollmentToUser(userId, enrollmentData) {
  return await User.findByIdAndUpdate(
    userId,
    { $push: { enrollments: enrollmentData } },
    { new: true }
  );
}

// Remove an enrollment by course_code
async function removeEnrollmentFromUser(userId, courseCode) {
  return await User.findByIdAndUpdate(
    userId,
    { $pull: { enrollments: { "course.course_code": courseCode } } },
    { new: true }
  );
}

// Add an advisor array entry
async function addAdvisorToUser(userId, advisorData) {
  return await User.findByIdAndUpdate(
    userId,
    { $push: { advisors: advisorData } },
    { new: true }
  );
}

module.exports = {
  User,
  getUserById,
  addEnrollmentToUser,
  removeEnrollmentFromUser,
  addAdvisorToUser,
};
