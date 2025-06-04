// models/University.js
const mongoose = require("mongoose");

const universitySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

const University = mongoose.model("University", universitySchema);

module.exports = University;
