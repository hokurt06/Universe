// routes/authRoutes.js
const express = require("express");
const router = express.Router();

const { requireFields } = require("../middleware/validationMiddleware");
const { authenticateToken } = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  changePassword,
} = require("../controllers/authController");

// POST /auth/register
router.post(
  "/register",
  requireFields(["username", "password", "name", "email", "universityId"]),
  registerUser
);

// POST /auth/login
router.post("/login", requireFields(["email", "password"]), loginUser);

// POST /auth/change-password
router.post(
  "/change-password",
  authenticateToken,
  requireFields(["currentPassword", "newPassword"]),
  changePassword
);

module.exports = router;
