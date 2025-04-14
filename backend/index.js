require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const fs = require("fs");
const https = require("https");

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
// User Schema including embedded enrollments/advisors and reference to University
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
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  role: { type: String, required: true, default: "student" },
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
// `enrollmentData` should include a `course` object (with course_code, title, etc.) plus additional fields.
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
  requireFields(["username", "password", "first_name", "last_name", "email"]),
  async (req, res) => {
    const { username, password, first_name, last_name, email, role } = req.body;
    try {
      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
      const user = new User({
        username,
        password_hash,
        first_name,
        last_name,
        email,
        role: role || "student",
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
      // addCourse encapsulates the logic
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
// Add an enrollment (class) to the authenticated user.
router.post(
  "/enrollments",
  authenticateToken,
  requireFields(["course_code", "quarter", "section", "professor"]),
  async (req, res) => {
    try {
      // Pull the provided enrollment info.
      const {
        course_code,
        quarter,
        section,
        professor,
        meeting_time,
        class_type,
        grade,
      } = req.body;
      // Look up the course from the catalog.
      const course = await Course.findOne({ course_code });
      if (!course)
        return res.status(404).json({ message: "Course not found in catalog" });

      // Compose the enrollment object.
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

      // Use helper function to add enrollment to user.
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

// Get enrollments for the authenticated user.
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
// Add an advisor to the authenticated user.
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
    // Retrieve the user along with embedded enrollments.
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Build a set of unique terms (quarters) from the enrollments.
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

// Get advisors for the authenticated user.
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
  // Get the number of courses to enroll from the request body; default to 3 if not provided.
  const count = req.body.count || 3;

  try {
    // Pick n random courses from the catalog.
    const courses = await Course.aggregate([{ $sample: { size: count } }]);

    if (courses.length === 0) {
      return res
        .status(404)
        .json({ message: "No courses found in the catalog" });
    }

    // Add a sample advisor for demonstration purposes.
    const advisorData = {
      title: "Academic Advisor",
      name: "Dr. John Doe",
      phone_number: "555-1234",
      office_address: "Room 101, Admin Building",
      office_hours: "MWF 12:00-1:00 PM",
    };
    await addAdvisorToUser(userId, advisorData);

    // Helper function to convert a credits value to a number.
    function parseCredits(credits) {
      // If it's already a number, just return it.
      if (typeof credits === "number") return credits;

      if (typeof credits === "string") {
        // Check if the string contains a hyphen (e.g., "0.0-12.0")
        if (credits.includes("-")) {
          const parts = credits
            .split("-")
            .map((part) => parseFloat(part.trim()));
          if (parts.every((num) => !isNaN(num))) {
            // Return the average of the two numbers.
            return parts.reduce((a, b) => a + b, 0) / parts.length;
          }
        } else {
          const num = parseFloat(credits);
          if (!isNaN(num)) return num;
        }
      }
      // Fallback value if parsing fails.
      return 0;
    }

    // A helper function to map course properties.
    function mapCourse(course) {
      return {
        course_code: course["Course Code"] || course.course_code,
        title: course["Title"] || course.title,
        credits: parseCredits(course["Credits"] || course.credits),
        description: course["Description"] || course.description,
        college: course["College"] || course.college,
      };
    }

    // For each randomly selected course, add an enrollment.
    for (const course of courses) {
      // Generate a random grade between 50 and 100.
      const randomGrade = (Math.floor(Math.random() * 51) + 50).toString();

      const enrollmentData = {
        course: mapCourse(course),
        quarter: "Fall 2024", // Customize or randomize as needed.
        section: "A", // Default section value.
        professor: "Prof. Random", // Default professor value.
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

// app.listen(PORT, () => {
//   console.log(
//     `Server is running on port ${PORT} in ${config.environment} mode.`
//   );
//   console.log(`API endpoints are prefixed with "${config.apiPrefix}"`);
// });

https.createServer(sslOptions, app).listen(PORT, "0.0.0.0", () => {
  console.log(
    `Server is running on port ${PORT} in ${config.environment} mode (HTTPS).`
  );
  console.log(`API endpoints are prefixed with "${API_PREFIX}"`);
  // import courses
  // importCoursesFromCSV("./courses.csv");
});
