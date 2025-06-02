// routes/profileRoutes.js
const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

router.get("/", authenticateToken, getProfile);
router.patch("/", authenticateToken, updateProfile);

module.exports = router;
