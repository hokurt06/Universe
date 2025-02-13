require("dotenv").config();

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

require("dotenv").config();

const app = express();

// ================================================
// Environment Configuration
// ================================================

const config = {
  environment: process.env.ENVIRONMENT,
  port: process.env.PORT,
  database: process.env.DATABASE,
  jwtSecret: process.env.JWT_SECRET,
  apiPrefix: process.env.API_PREFIX,
};

// Ensure config has been set for all keys.
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

app.use(express.json());

// ================================================
// Helper Middleware: Field Validation
// ================================================

/**
 * requireFields(fields: Array<string>)
 *
 * Middleware that checks if the request body contains all required fields.
 * If any field is missing, responds with a 400 error listing the missing fields.
 */
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

// ================================================
// Initialize SQLite Database
// ================================================

console.log(`Connecting to the SQLite database (${config.database})...`);

const db = new sqlite3.Database(config.database, (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log(`Connected to the SQLite database (${config.database}).`);
  }
});

// Create necessary tables if they do not exist.
db.serialize(() => {
  // Users table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      password_reset TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
    (err) => {
      if (err) console.error("Error creating users table:", err);
      else console.log("Users table ensured.");
    }
  );

  // Courses table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_code TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      credits INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
    (err) => {
      if (err) console.error("Error creating courses table:", err);
      else console.log("Courses table ensured.");
    }
  );

  // Grades table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      grade TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )
  `,
    (err) => {
      if (err) console.error("Error creating grades table:", err);
      else console.log("Grades table ensured.");
    }
  );

  // Enrollments table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )
  `,
    (err) => {
      if (err) console.error("Error creating enrollments table:", err);
      else console.log("Enrollments table ensured.");
    }
  );
});

// ================================================
// JWT Authentication Middleware
// ================================================

/**
 * authenticateToken
 *
 * Middleware that checks for a JWT token in the Authorization header.
 * If valid, the decoded payload is attached to req.user.
 */
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

// ================================================
// API Router
// ================================================

const router = express.Router();

/**
 * API Documentation:
 *
 * 1. POST /register
 *    - Description: Register a new user.
 *    - Required Fields: username, password, first_name, last_name, email.
 *
 * 2. POST /login
 *    - Description: Log in an existing user using email and password.
 *    - Required Fields: email, password.
 *
 * 3. GET /profile
 *    - Description: Retrieve the profile of the currently logged-in user.
 *    - Authentication: Required.
 *
 * 4. POST /courses
 *    - Description: Create a new course.
 *    - Required Fields: course_code, title, credits.
 *    - Authentication: Required.
 *
 * 5. GET /courses
 *    - Description: Retrieve all courses.
 *
 * 6. GET /courses/:id
 *    - Description: Retrieve a specific course by its ID.
 *
 * 7. POST /grades
 *    - Description: Add a grade for a user in a course.
 *    - Required Fields: user_id, course_id, grade.
 *    - Authentication: Required.
 *
 * 8. GET /grades
 *    - Description: Retrieve all grades.
 *    - Authentication: Required.
 *
 * 9. GET /enrollments
 *    - Description: Retrieve the courses the logged-in user is enrolled in.
 *    - Authentication: Required.
 *
 * 10. GET /protected
 *    - Description: A test endpoint to verify token validity.
 *    - Authentication: Required.
 */

// --- User Endpoints ---

// Register a new user.
router.post(
  "/register",
  requireFields(["username", "password", "first_name", "last_name", "email"]),
  async (req, res) => {
    const { username, password, first_name, last_name, email, role } = req.body;

    try {
      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
      const sql = `INSERT INTO users (username, password_hash, first_name, last_name, email, role)
                 VALUES (?, ?, ?, ?, ?, ?)`;
      const params = [
        username,
        password_hash,
        first_name,
        last_name,
        email,
        role || "student",
      ];

      db.run(sql, params, function (err) {
        if (err) {
          console.error("Error inserting user:", err);
          return res
            .status(500)
            .json({ message: "Error registering user", error: err.message });
        }
        res.status(201).json({
          message: "User registered successfully",
          userId: this.lastID,
        });
      });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Login an existing user and return a JWT token using email and password.
router.post("/login", requireFields(["email", "password"]), (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT * FROM users WHERE email = ?`;
  db.get(sql, [email], async (err, user) => {
    if (err) {
      console.error("Error querying user:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    try {
      const passwordValid = await bcrypt.compare(password, user.password_hash);
      if (!passwordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      // Create a JWT token (expires in 1 week)
      const payload = { id: user.id, email: user.email, role: user.role };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1w" });
      res.json({ message: "Login successful", token });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
});

// Get the profile of the logged-in user.
router.get("/profile", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = `SELECT id, username, first_name, last_name, email, role, created_at FROM users WHERE id = ?`;
  db.get(sql, [userId], (err, user) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });
});

// --- Courses Endpoints ---

// Create a new course.
router.post(
  "/courses",
  authenticateToken,
  requireFields(["course_code", "title", "credits"]),
  (req, res) => {
    const { course_code, title, description, credits } = req.body;
    const sql = `INSERT INTO courses (course_code, title, description, credits) VALUES (?, ?, ?, ?)`;
    const params = [course_code, title, description, credits];
    db.run(sql, params, function (err) {
      if (err) {
        console.error("Error inserting course:", err);
        return res
          .status(500)
          .json({ message: "Error creating course", error: err.message });
      }
      res.status(201).json({
        message: "Course created successfully",
        courseId: this.lastID,
      });
    });
  }
);

// Retrieve all courses.
router.get("/courses", (req, res) => {
  const sql = `SELECT * FROM courses`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Error fetching courses:", err);
      return res
        .status(500)
        .json({ message: "Error fetching courses", error: err.message });
    }
    res.json({ courses: rows });
  });
});

// Retrieve a specific course by its ID.
router.get("/courses/:id", (req, res) => {
  const sql = `SELECT * FROM courses WHERE id = ?`;
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      console.error("Error fetching course:", err);
      return res
        .status(500)
        .json({ message: "Error fetching course", error: err.message });
    }
    if (!row) return res.status(404).json({ message: "Course not found" });
    res.json({ course: row });
  });
});

// --- Grades Endpoints ---

// Add a grade for a user in a course.
router.post(
  "/grades",
  authenticateToken,
  requireFields(["user_id", "course_id", "grade"]),
  (req, res) => {
    const { user_id, course_id, grade } = req.body;
    const sql = `INSERT INTO grades (user_id, course_id, grade) VALUES (?, ?, ?)`;
    const params = [user_id, course_id, grade];
    db.run(sql, params, function (err) {
      if (err) {
        console.error("Error inserting grade:", err);
        return res
          .status(500)
          .json({ message: "Error adding grade", error: err.message });
      }
      res
        .status(201)
        .json({ message: "Grade added successfully", gradeId: this.lastID });
    });
  }
);

// Retrieve all grades.
router.get("/grades", authenticateToken, (req, res) => {
  const sql = `SELECT * FROM grades`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Error fetching grades:", err);
      return res
        .status(500)
        .json({ message: "Error fetching grades", error: err.message });
    }
    res.json({ grades: rows });
  });
});

// --- Enrollments Endpoints ---

// Retrieve the courses the logged-in user is enrolled in.
router.get("/enrollments", authenticateToken, (req, res) => {
  const user_id = req.user.id;
  const sql = `
    SELECT e.id AS enrollment_id, c.*
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE e.user_id = ?
  `;
  db.all(sql, [user_id], (err, rows) => {
    if (err) {
      console.error("Error fetching enrollments:", err);
      return res
        .status(500)
        .json({ message: "Error fetching enrollments", error: err.message });
    }
    res.json({ enrollments: rows });
  });
});

// --- Test Endpoint ---

// A simple protected endpoint to test token validity.
router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "You have accessed a protected route!", user: req.user });
});

// ================================================
// Mount the API Router with a Prefix
// ================================================
app.use(API_PREFIX, router);

// ================================================
// Generic JSON Error Handlers
// ================================================

// Catch-all for 404 - Not Found
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

// Global error handler for 400 and 500 errors.
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

// ================================================
// Start the Server
// ================================================
app.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT} in ${config.environment} mode.`
  );
  console.log(`API endpoints are prefixed with "${API_PREFIX}"`);
});
