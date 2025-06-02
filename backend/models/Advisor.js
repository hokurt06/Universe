// models/Advisor.js
const mongoose = require("mongoose");

const advisorSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    name: { type: String, required: true },
    phone_number: String,
    office_address: String,
    office_hours: String,
    created_at: { type: Date, default: Date.now },
  },
  { _id: false }
);

module.exports = advisorSchema;
