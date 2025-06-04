// controllers/universityController.js
const University = require("../models/University");

async function listUniversities(req, res) {
  try {
    const universities = await University.find({}).lean();
    universities.forEach((uni) => {
      delete uni._id;
    });
    if (universities.length === 0) {
      return res.status(404).json({ message: "No universities found" });
    }
    res.json({ universities });
  } catch (error) {
    console.error("Error fetching universities:", error);
    res
      .status(500)
      .json({ message: "Error fetching universities", error: error.message });
  }
}

module.exports = {
  listUniversities,
};
