// controllers/profileController.js
const University = require("../models/University");
const { User } = require("../models/User");

// GET /profile
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).populate("university").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    delete user.password_hash;
    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// PATCH /profile
async function updateProfile(req, res) {
  try {
    const allowedFields = [
      "name",
      "pronouns",
      "bio",
      "gender",
      "birthday",
      "contactInfo",
    ];
    const updates = {};

    // Copy over allowed fields if present
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Parse birthday if provided
    if (updates.birthday) {
      const parsed = new Date(updates.birthday);
      if (isNaN(parsed)) {
        return res.status(400).json({ message: "Invalid birthday format" });
      }
      updates.birthday = parsed;
    }

    // Switch university if requested
    if (req.body.universityId) {
      const uni = await University.findOne({ id: req.body.universityId });
      if (!uni) {
        return res.status(400).json({ message: "Unknown universityId" });
      }
      updates.university = uni._id;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    )
      .populate("university")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    delete user.password_hash;
    res.json(user);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Could not update profile" });
  }
}

module.exports = {
  getProfile,
  updateProfile,
};
