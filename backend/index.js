require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const fs = require("fs");
const https = require("https");
const path = require("path");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

// -------------------------------------------------
// Environment Configuration
// -------------------------------------------------
const config = {
  environment: process.env.ENVIRONMENT,
  port: process.env.PORT,
  database: process.env.MDBSTRING,
  jwtSecret: process.env.JWT_SECRET,
  apiPrefix: process.env.API_PREFIX,
};

const sslNotFoundError =
  "Error reading SSL certificate.\n\nHint: you no longer need to run the backend server on your local machine!\nJust run the app.";
const sslOptions = {
  key: readFileSafe(
    "/etc/letsencrypt/live/universe.terabytecomputing.com/privkey.pem",
    true,
    sslNotFoundError
  ),
  cert: readFileSafe(
    "/etc/letsencrypt/live/universe.terabytecomputing.com/fullchain.pem",
    true,
    sslNotFoundError
  ),
};

const LOGS_BASE = path.join(__dirname, "logs");

if (!fs.existsSync(LOGS_BASE)) {
  fs.mkdirSync(LOGS_BASE);
}

function readFileSafe(path, breakOnError, errorMessage) {
  try {
    return fs.readFileSync(path);
  } catch (error) {
    console.error(errorMessage);
    if (breakOnError) {
      console.error(error);
      process.exit(1);
    }
    return null;
  }
}

for (const key in config) {
  if (!config[key]) {
    console.error(`Missing configuration for ${key}`);
    process.exit(1);
  }
}

const PORT = config.port;
const JWT_SECRET = config.jwtSecret;
const API_PREFIX = config.apiPrefix;
const SALT_ROUNDS = 10;

// -------------------------------------------------
// Connect to MongoDB
// -------------------------------------------------
mongoose
  .connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB."))
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

// -------------------------------------------------
// Define Schemas & Models with Embedded Data
// -------------------------------------------------

// An enrollment (or “class”) now lives inside a user.
const enrollmentSchema = new mongoose.Schema(
  {
    course: {
      course_code: { type: String, required: true },
      title: { type: String, required: true },
      credits: { type: Number, required: true },
      description: String,
      college: String,
    },
    quarter: { type: String },
    section: { type: String },
    professor: { type: String },
    meeting_time: { type: String },
    class_type: { type: String },
    grade: { type: Number },
    enrolled_at: { type: Date, default: Date.now },
  },
  { _id: false }
);

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

// Courses collection: just a catalog of courses offered.
const courseSchema = new mongoose.Schema({
  course_code: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  credits: { type: Number, required: true },
  description: { type: String },
  college: { type: String },
  created_at: { type: Date, default: Date.now },
});
const Course = mongoose.model("Course", courseSchema);

// University Schema & Model
const universitySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
});

const University = mongoose.model("University", universitySchema);

// -------------------------------------------------
// Helper Functions for Data Operations
// -------------------------------------------------

// Get a user by ID.
async function getUser(userId) {
  return await User.findById(userId).lean();
}

// Add an enrollment (class) to a user.
async function addEnrollmentToUser(userId, enrollmentData) {
  return await User.findByIdAndUpdate(
    userId,
    { $push: { enrollments: enrollmentData } },
    { new: true }
  );
}

// Remove an enrollment (by course_code) from a user.
async function removeEnrollmentFromUser(userId, courseCode) {
  return await User.findByIdAndUpdate(
    userId,
    { $pull: { enrollments: { "course.course_code": courseCode } } },
    { new: true }
  );
}

// Add an advisor to a user.
async function addAdvisorToUser(userId, advisorData) {
  return await User.findByIdAndUpdate(
    userId,
    { $push: { advisors: advisorData } },
    { new: true }
  );
}

// Get a list of all available courses.
async function getAllCourses() {
  return await Course.find({}).lean();
}

// Add a new course to the course catalog.
async function addCourse(courseData) {
  const course = new Course(courseData);
  return await course.save();
}

// -------------------------------------------------
// Helper Functions for Fetching & Caching Events
// -------------------------------------------------

// Format today's date as mm/dd/yyyy.
function getFormattedDate(date = new Date()) {
  return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
    .getDate()
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
}

// Check if the file exists and is fresh (modified today).
function isFileFresh(filePath) {
  if (!fs.existsSync(filePath)) return false;

  const stats = fs.statSync(filePath);
  const modifiedDate = new Date(stats.mtime);
  const now = new Date();

  return (
    modifiedDate.getFullYear() === now.getFullYear() &&
    modifiedDate.getMonth() === now.getMonth() &&
    modifiedDate.getDate() === now.getDate()
  );
}

// Fetch events from the remote API and cache them.
async function fetchAndCacheEvents() {
  const formattedDate = getFormattedDate();
  try {
    const response = await axios.get(
      "https://d1m.drexel.edu/api/v2.0/Calendar/Events/Upcoming/7",
      {
        params: {
          today: formattedDate,
          maxevents: 100,
          requireImages: false,
        },
        headers: {
          Host: "d1m.drexel.edu",
          Accept: "*/*",
          Connection: "keep-alive",
          "User-Agent": "UniVerse D1 Scraper",
          "Accept-Language": "en-US;q=1",
          "Accept-Encoding": "gzip, deflate, br",
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      }
    );
    const eventsDir = path.join(__dirname, "scape");
    if (!fs.existsSync(eventsDir)) {
      fs.mkdirSync(eventsDir, { recursive: true });
    }
    const filePath = path.join(eventsDir, "events.json");
    fs.writeFileSync(filePath, JSON.stringify(response.data, null, 2), "utf8");
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error.message);
    throw error;
  }
}

// -------------------------------------------------
// JWT Middleware & Field Validation
// -------------------------------------------------
function requireFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter(
      (field) =>
        req.body[field] === undefined ||
        req.body[field] === null ||
        req.body[field] === ""
    );
    if (missing.length > 0) {
      console.log(`Missing fields: ${missing.join(", ")}`);
      console.log(`Received fields: ${Object.values(req.body).join(", ")}`);
      return res.status(400).json({
        message: "Missing required fields",
        missing_fields: missing,
      });
    }
    next();
  };
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err)
      return res.status(403).json({ message: "Invalid or expired token" });
    req.user = payload;
    next();
  });
}

// -------------------------------------------------
// API Endpoints
// -------------------------------------------------
const router = express.Router();

// ----- User Registration & Login -----
router.post(
  "/register",
  requireFields(["username", "password", "name", "email", "universityId"]),
  async (req, res) => {
    // log all fields received
    const { username, password, name, email, role, universityId } = req.body;
    try {
      // Look up the university based on the provided universityId.
      const universityDoc = await University.findOne({ id: universityId });
      if (!universityDoc) {
        return res
          .status(400)
          .json({ message: "Invalid university id provided." });
      }

      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
      // Create the new user including the university reference.
      const user = new User({
        username,
        password_hash,
        name,
        email,
        role: role || "student",
        university: universityDoc._id, // assign the ObjectId reference from the University document
      });

      await user.save();
      res.status(201).json({
        message: "User registered successfully",
        userId: user._id,
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res
        .status(500)
        .json({ message: "Error registering user", error: error.message });
    }
  }
);

router.post(
  "/login",
  requireFields(["email", "password"]),
  async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ message: "Invalid email or password" });
      const passwordValid = await bcrypt.compare(password, user.password_hash);
      if (!passwordValid)
        return res.status(400).json({ message: "Invalid email or password" });
      const payload = { id: user._id, email: user.email, role: user.role };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1w" });
      res.json({ message: "Login successful", token });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("university").lean();
    delete user.password_hash;
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ----- Courses Endpoints (Catalog) -----
router.post(
  "/courses",
  requireFields(["course_code", "title", "credits", "college"]),
  async (req, res) => {
    try {
      const { course_code, title, credits, description, college } = req.body;
      const course = await addCourse({
        course_code,
        title,
        credits,
        description: description || "",
        college,
      });
      res.status(201).json({
        message: "Course added successfully",
        courseId: course._id,
      });
    } catch (error) {
      console.error("Error creating course:", error);
      res
        .status(500)
        .json({ message: "Error creating course", error: error.message });
    }
  }
);

router.get("/courses", async (req, res) => {
  try {
    const courses = await getAllCourses();
    res.json({ courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res
      .status(500)
      .json({ message: "Error fetching courses", error: error.message });
  }
});

// ----- Enrollment Endpoints (Embedded in User) -----
router.post(
  "/enrollments",
  authenticateToken,
  requireFields(["course_code", "quarter", "section", "professor"]),
  async (req, res) => {
    try {
      const {
        course_code,
        quarter,
        section,
        professor,
        meeting_time,
        class_type,
        grade,
      } = req.body;
      const course = await Course.findOne({ course_code });
      if (!course)
        return res.status(404).json({ message: "Course not found in catalog" });

      const enrollmentData = {
        course: {
          course_code: course.course_code,
          title: course.title,
          credits: course.credits,
          description: course.description,
          college: course.college,
        },
        quarter,
        section,
        professor,
        meeting_time: meeting_time || "",
        class_type: class_type || "",
        grade: grade || null,
      };

      const updatedUser = await addEnrollmentToUser(
        req.user.id,
        enrollmentData
      );
      res.status(201).json({
        message: "Enrollment added successfully",
        enrollments: updatedUser.enrollments,
      });
    } catch (error) {
      console.error("Error adding enrollment:", error);
      res
        .status(500)
        .json({ message: "Error adding enrollment", error: error.message });
    }
  }
);

router.get("/enrollments", authenticateToken, async (req, res) => {
  try {
    const user = await getUser(req.user.id);
    res.json({ enrollments: user.enrollments || [] });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    res.status(500).json({
      message: "Error fetching enrollments",
      error: error.message,
    });
  }
});

// ----- Advisor Endpoints (Embedded in User) -----
router.post(
  "/advisors",
  authenticateToken,
  requireFields(["title", "name"]),
  async (req, res) => {
    try {
      const { title, name, phone_number, office_address, office_hours } =
        req.body;
      const advisorData = {
        title,
        name,
        phone_number: phone_number || "",
        office_address: office_address || "",
        office_hours: office_hours || "",
      };

      const updatedUser = await addAdvisorToUser(req.user.id, advisorData);
      res.status(201).json({
        message: "Advisor added successfully",
        advisors: updatedUser.advisors,
      });
    } catch (error) {
      console.error("Error adding advisor:", error);
      res.status(500).json({
        message: "Error adding advisor",
        error: error.message,
      });
    }
  }
);

router.get("/terms", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const termsSet = new Set(
      user.enrollments.map((enrollment) => enrollment.quarter)
    );
    const terms = Array.from(termsSet);
    res.json({ terms });
  } catch (err) {
    console.error("Error fetching terms:", err);
    res.status(500).json({
      message: "Error fetching terms",
      error: err.message,
    });
  }
});

router.get("/advisors", authenticateToken, async (req, res) => {
  try {
    const user = await getUser(req.user.id);
    res.json({ advisors: user.advisors || [] });
  } catch (error) {
    console.error("Error fetching advisors:", error);
    res.status(500).json({
      message: "Error fetching advisors",
      error: error.message,
    });
  }
});

router.post("/sample_data", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const count = req.body.count || 3;

  try {
    const courses = await Course.aggregate([{ $sample: { size: count } }]);

    if (courses.length === 0) {
      return res
        .status(404)
        .json({ message: "No courses found in the catalog" });
    }

    const advisorData = {
      title: "Academic Advisor",
      name: "Dr. John Doe",
      phone_number: "555-1234",
      office_address: "Room 101, Admin Building",
      office_hours: "MWF 12:00-1:00 PM",
    };
    await addAdvisorToUser(userId, advisorData);

    function parseCredits(credits) {
      if (typeof credits === "number") return credits;
      if (typeof credits === "string") {
        if (credits.includes("-")) {
          const parts = credits
            .split("-")
            .map((part) => parseFloat(part.trim()));
          if (parts.every((num) => !isNaN(num))) {
            return parts.reduce((a, b) => a + b, 0) / parts.length;
          }
        } else {
          const num = parseFloat(credits);
          if (!isNaN(num)) return num;
        }
      }
      return 0;
    }

    function mapCourse(course) {
      return {
        course_code: course["Course Code"] || course.course_code,
        title: course["Title"] || course.title,
        credits: parseCredits(course["Credits"] || course.credits),
        description: course["Description"] || course.description,
        college: course["College"] || course.college,
      };
    }

    for (const course of courses) {
      const randomGrade = (Math.floor(Math.random() * 51) + 50).toString();

      const enrollmentData = {
        course: mapCourse(course),
        quarter: "Fall 2024",
        section: "A",
        professor: "Prof. Random",
        meeting_time: "MWF 9:00-10:00",
        class_type: "Lecture",
        grade: randomGrade,
      };

      await addEnrollmentToUser(userId, enrollmentData);
    }

    res.json({
      message: "Sample data added successfully",
      enrolledCourses: courses.map((c) => mapCourse(c).course_code),
    });
  } catch (error) {
    console.error("Error adding sample data:", error);
    res
      .status(500)
      .json({ message: "Error adding sample data", error: error.message });
  }
});

// ----- Events Endpoint -----
// This route serves events from a cached JSON file at ./scape/events.json.
// It downloads fresh events from the external API if the cached file is missing or outdated.
router.get("/events", async (req, res) => {
  const eventsFilePath = path.join(__dirname, "scape", "events.json");
  try {
    let eventsData;
    if (isFileFresh(eventsFilePath)) {
      eventsData = JSON.parse(fs.readFileSync(eventsFilePath, "utf8"));
    } else {
      eventsData = await fetchAndCacheEvents();
    }
    res.json(eventsData);
  } catch (error) {
    console.error("Error in /events route:", error.message);
    res
      .status(500)
      .json({ message: "Failed to retrieve events.", error: error.message });
  }
});

router.get("/universities", async (req, res) => {
  try {
    const universities = await University.find({}).lean();
    // for each one delete _id
    universities.forEach((uni) => {
      delete uni._id;
    });
    if (universities.length === 0) {
      return res.status(404).json({ message: "No universities found" });
    }
    res.json({ universities });
  } catch (error) {
    console.error("Error fetching universities:", error);
    res.status(500).json({
      message: "Error fetching universities",
      error: error.message,
    });
  }
});

// Update any editable profile fields:
//   name, pronouns, bio, gender, birthday (string "MM/DD/YYYY" or ISO), contactInfo,
//   and OPTIONAL universityId to switch schools.
router.patch("/profile", authenticateToken, async (req, res) => {
  try {
    const allowed = [
      "name",
      "pronouns",
      "bio",
      "gender",
      "birthday",
      "contactInfo",
    ];
    const updates = {};

    // copy over any allowed simple fields
    for (let field of allowed) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // handle birthday → Date
    if (updates.birthday) {
      // attempt to parse MM/DD/YYYY or ISO
      const parsed = new Date(updates.birthday);
      if (isNaN(parsed)) {
        return res.status(400).json({ message: "Invalid birthday format" });
      }
      updates.birthday = parsed;
    }

    // optionally change university
    if (req.body.universityId) {
      const uni = await University.findOne({ id: req.body.universityId });
      if (!uni) {
        return res.status(400).json({ message: "Unknown universityId" });
      }
      updates.university = uni._id;
    }

    // perform the update
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
});

router.post(
  "/auth/change-password",
  authenticateToken,
  requireFields(["currentPassword", "newPassword"]),
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      // 1) fetch the user
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // 2) verify their current password
      const match = await bcrypt.compare(currentPassword, user.password_hash);
      if (!match) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }

      // 3) hash & save the new one
      const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      user.password_hash = newHash;
      // optional: clear any reset-token field
      user.password_reset = null;
      await user.save();

      return res.json({ message: "Password changed successfully" });
    } catch (err) {
      console.error("Error in change-password:", err);
      return res
        .status(500)
        .json({ message: "Could not change password", error: err.message });
    }
  }
);

// -------------------------------------------------
// Mount the API Router with a Prefix & Start Server
// -------------------------------------------------
app.use(config.apiPrefix, router);

app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

app.use((req, res, next) => {
  const start = Date.now();

  // after response is sent:
  res.on("finish", () => {
    const status = res.statusCode;

    let filename = `${status}.log`;

    // yyyy-mm-dd
    const date = new Date().toISOString().slice(0, 10);
    const folder = path.join(LOGS_BASE, date);

    // make sure today’s folder exists
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    // e.g. logs/2025-05-18/404.log
    const filePath = path.join(folder, filename);

    const entry =
      [
        new Date().toISOString(),
        req.method,
        req.originalUrl,
        status,
        `${Date.now() - start}ms`,
      ].join(" ") + "\n";

    fs.appendFileSync(filePath, entry);
  });

  next();
});

https.createServer(sslOptions, app).listen(PORT, "0.0.0.0", () => {
  console.log(
    `Server is running on port ${PORT} in ${config.environment} mode (HTTPS).`
  );
  console.log(`API endpoints are prefixed with "${API_PREFIX}"`);
});
