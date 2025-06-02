// controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const University = require("../models/University");
const { User } = require("../models/User");
const config = require("../config");

const SALT_ROUNDS = 10;

// POST /register
async function registerUser(req, res) {
  const { username, password, name, email, role, universityId } = req.body;
  try {
    // Look up the university by its “id” field
    const universityDoc = await University.findOne({ id: universityId });
    if (!universityDoc) {
      return res
        .status(400)
        .json({ message: "Invalid university id provided." });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({
      username,
      password_hash,
      name,
      email,
      role: role || "student",
      university: universityDoc._id,
    });

    await user.save();
    res
      .status(201)
      .json({ message: "User registered successfully", userId: user._id });
  } catch (error) {
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
}

// POST /login
async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid)
      return res.status(400).json({ message: "Invalid email or password" });

    const payload = { id: user._id, email: user.email, role: user.role };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: "1w" });

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// POST /auth/change-password
async function changePassword(req, res) {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password_hash = newHash;
    user.password_reset = null; // optional
    await user.save();

    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Error in change-password:", err);
    return res
      .status(500)
      .json({ message: "Could not change password", error: err.message });
  }
}

module.exports = {
  registerUser,
  loginUser,
  changePassword,
};
