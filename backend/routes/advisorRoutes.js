// routes/advisorRoutes.js
const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const { requireFields } = require("../middleware/validationMiddleware");
const { addAdvisor, getAdvisors } = require("../controllers/advisorController");

// POST /advisors
router.post(
  "/",
  authenticateToken,
  requireFields(["title", "name"]),
  addAdvisor
);

// GET /advisors
router.get("/", authenticateToken, getAdvisors);

module.exports = router;
