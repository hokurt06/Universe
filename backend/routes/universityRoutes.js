// routes/universityRoutes.js
const express = require("express");
const router = express.Router();

const { listUniversities } = require("../controllers/universityController");

router.get("/", listUniversities);

module.exports = router;
