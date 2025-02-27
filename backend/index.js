require("dotenv").config();

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const fs = require("fs");
const csvParser = require("csv-parser");
const https = require("https"); // <-- Added https module
const app = express();
const cors = require("cors");

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
app.use(cors());

// ================================================
// Helper Middleware: Field Validation
// ================================================
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

  // Course Offerings table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS course_offerings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      quarter TEXT NOT NULL,
      location_name TEXT,
      location_address TEXT,
      professor_name TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )
  `,
    (err) => {
      if (err) console.error("Error creating course_offerings table:", err);
      else console.log("Course offerings table ensured.");
    }
  );

  // Sections table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_offering_id INTEGER NOT NULL,
      section_identifier TEXT,
      class_type TEXT,
      meeting_time TEXT,
      professor_name TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id)
    )
  `,
    (err) => {
      if (err) console.error("Error creating sections table:", err);
      else console.log("Sections table ensured.");
    }
  );

  // Enrollments table
  db.run(
    `
    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_offering_id INTEGER NOT NULL,
      grade REAL,
      enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (course_offering_id) REFERENCES course_offerings(id)
    )
  `,
    (err) => {
      if (err) console.error("Error creating enrollments table:", err);
      else console.log("Enrollments table ensured.");
    }
  );

  // Advisors table – Updated to include the "title" column
  db.run(
    `
    CREATE TABLE IF NOT EXISTS advisors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      name TEXT NOT NULL,
      phone_number TEXT,
      office_address TEXT,
      office_hours TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `,
    (err) => {
      if (err) console.error("Error creating advisors table:", err);
      else console.log("Advisors table ensured.");
    }
  );
});

// ================================================
// JWT Authentication Middleware
// ================================================
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
 * 1. POST /register - Register a new user.
 * 2. POST /login - Log in and receive a JWT token.
 * 3. GET /profile - Get the logged-in user's profile.
 * 4. POST /courses - Create a new course.
 * 5. GET /courses - Retrieve all courses.
 * 6. GET /courses/:id - Retrieve a specific course by its ID.
 * 7. POST /course_offerings - Create a course offering.
 * 8. GET /course_offerings - Retrieve all course offerings.
 * 9. GET /course_offerings/:id - Retrieve a specific course offering.
 * 10. POST /sections - Create a new section.
 * 11. GET /sections - Retrieve sections.
 * 12. GET /sections/:id - Retrieve a specific section.
 * 13. POST /enrollments - Enroll the user in a course offering.
 * 14. GET /enrollments - Retrieve the user's enrollments with detailed info.
 * 15. POST /advisors - Create a new advisor (with title).
 * 16. GET /advisors - Retrieve the user's advisors.
 * 17. GET /terms - Get distinct terms where the user has enrollments.
 * 18. POST /sample_data - Insert sample advisor and course data.
 * 19. GET /protected - Protected test endpoint.
 */

// --- User Endpoints ---

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
      const payload = { id: user.id, email: user.email, role: user.role };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1w" });
      res.json({ message: "Login successful", token });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
});

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

router.post(
  "/courses",
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

// --- Course Offerings Endpoints ---

router.post(
  "/course_offerings",
  authenticateToken,
  requireFields(["course_id", "quarter"]),
  (req, res) => {
    const {
      course_id,
      quarter,
      location_name,
      location_address,
      professor_name,
    } = req.body;
    const sql = `INSERT INTO course_offerings (course_id, quarter, location_name, location_address, professor_name)
                 VALUES (?, ?, ?, ?, ?)`;
    const params = [
      course_id,
      quarter,
      location_name || null,
      location_address || null,
      professor_name || null,
    ];
    db.run(sql, params, function (err) {
      if (err) {
        console.error("Error inserting course offering:", err);
        return res.status(500).json({
          message: "Error creating course offering",
          error: err.message,
        });
      }
      res.status(201).json({
        message: "Course offering created successfully",
        courseOfferingId: this.lastID,
      });
    });
  }
);

router.get("/course_offerings", (req, res) => {
  const sql = `
    SELECT co.*, c.course_code, c.title, c.description, c.credits
    FROM course_offerings co
    JOIN courses c ON co.course_id = c.id
  `;
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error("Error fetching course offerings:", err);
      return res.status(500).json({
        message: "Error fetching course offerings",
        error: err.message,
      });
    }
    res.json({ course_offerings: rows });
  });
});

router.get("/course_offerings/:id", (req, res) => {
  const sql = `
    SELECT co.*, c.course_code, c.title, c.description, c.credits
    FROM course_offerings co
    JOIN courses c ON co.course_id = c.id
    WHERE co.id = ?
  `;
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      console.error("Error fetching course offering:", err);
      return res.status(500).json({
        message: "Error fetching course offering",
        error: err.message,
      });
    }
    if (!row)
      return res.status(404).json({ message: "Course offering not found" });
    res.json({ course_offering: row });
  });
});

// --- Sections Endpoints ---

router.post(
  "/sections",
  authenticateToken,
  requireFields(["course_offering_id"]),
  (req, res) => {
    const {
      course_offering_id,
      section_identifier,
      class_type,
      meeting_time,
      professor_name,
    } = req.body;
    const sql = `INSERT INTO sections (course_offering_id, section_identifier, class_type, meeting_time, professor_name)
                 VALUES (?, ?, ?, ?, ?)`;
    const params = [
      course_offering_id,
      section_identifier || null,
      class_type || null,
      meeting_time || null,
      professor_name || null,
    ];
    db.run(sql, params, function (err) {
      if (err) {
        console.error("Error inserting section:", err);
        return res.status(500).json({
          message: "Error creating section",
          error: err.message,
        });
      }
      res.status(201).json({
        message: "Section created successfully",
        sectionId: this.lastID,
      });
    });
  }
);

router.get("/sections", (req, res) => {
  let sql = `SELECT * FROM sections`;
  let params = [];
  if (req.query.course_offering_id) {
    sql += ` WHERE course_offering_id = ?`;
    params.push(req.query.course_offering_id);
  }
  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error("Error fetching sections:", err);
      return res.status(500).json({
        message: "Error fetching sections",
        error: err.message,
      });
    }
    res.json({ sections: rows });
  });
});

router.get("/sections/:id", (req, res) => {
  const sql = `SELECT * FROM sections WHERE id = ?`;
  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      console.error("Error fetching section:", err);
      return res
        .status(500)
        .json({ message: "Error fetching section", error: err.message });
    }
    if (!row) return res.status(404).json({ message: "Section not found" });
    res.json({ section: row });
  });
});

// --- Enrollments Endpoints ---

router.post(
  "/enrollments",
  authenticateToken,
  requireFields(["course_offering_id"]),
  (req, res) => {
    const { course_offering_id, grade } = req.body;
    const user_id = req.user.id;
    const sql = `INSERT INTO enrollments (user_id, course_offering_id, grade) VALUES (?, ?, ?)`;
    const params = [user_id, course_offering_id, grade || null];
    db.run(sql, params, function (err) {
      if (err) {
        console.error("Error inserting enrollment:", err);
        return res.status(500).json({
          message: "Error enrolling",
          error: err.message,
        });
      }
      res.status(201).json({
        message: "Enrollment added successfully",
        enrollmentId: this.lastID,
      });
    });
  }
);

router.get("/enrollments", authenticateToken, (req, res) => {
  const user_id = req.user.id;
  const sql = `
    SELECT 
      e.id as enrollment_id, 
      e.grade, 
      e.enrolled_at,
      co.id as course_offering_id, 
      co.quarter, 
      co.location_name, 
      co.location_address, 
      co.professor_name as offering_professor,
      c.course_code, 
      c.title, 
      c.description, 
      c.credits,
      s.section_identifier, 
      s.meeting_time, 
      s.class_type, 
      s.professor_name as section_professor
    FROM enrollments e
    JOIN course_offerings co ON e.course_offering_id = co.id
    JOIN courses c ON co.course_id = c.id
    LEFT JOIN sections s ON co.id = s.course_offering_id
    WHERE e.user_id = ?
  `;
  db.all(sql, [user_id], (err, rows) => {
    if (err) {
      console.error("Error fetching enrollments:", err);
      return res.status(500).json({
        message: "Error fetching enrollments",
        error: err.message,
      });
    }
    res.json({ enrollments: rows });
  });
});

// --- Advisors Endpoints ---

router.post(
  "/advisors",
  authenticateToken,
  requireFields(["title", "name"]),
  (req, res) => {
    const user_id = req.user.id;
    const { title, name, phone_number, office_address, office_hours } =
      req.body;
    const sql = `INSERT INTO advisors (user_id, title, name, phone_number, office_address, office_hours)
               VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [
      user_id,
      title,
      name,
      phone_number || null,
      office_address || null,
      office_hours || null,
    ];
    db.run(sql, params, function (err) {
      if (err) {
        console.error("Error inserting advisor:", err);
        return res.status(500).json({
          message: "Error adding advisor",
          error: err.message,
        });
      }
      res.status(201).json({
        message: "Advisor added successfully",
        advisorId: this.lastID,
      });
    });
  }
);

router.get("/advisors", authenticateToken, (req, res) => {
  const user_id = req.user.id;
  const sql = `SELECT * FROM advisors WHERE user_id = ?`;
  db.all(sql, [user_id], (err, rows) => {
    if (err) {
      console.error("Error fetching advisors:", err);
      return res.status(500).json({
        message: "Error fetching advisors",
        error: err.message,
      });
    }
    res.json({ advisors: rows });
  });
});

// --- Terms Endpoint ---

router.get("/terms", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = `
    SELECT DISTINCT co.quarter AS term
    FROM enrollments e
    JOIN course_offerings co ON e.course_offering_id = co.id
    WHERE e.user_id = ?
  `;
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Error fetching terms:", err);
      return res.status(500).json({
        message: "Error fetching terms",
        error: err.message,
      });
    }
    const terms = rows.map((row) => row.term);
    res.json({ terms });
  });
});

// --- Sample Data Endpoint ---

router.post("/sample_data", authenticateToken, (req, res) => {
  const userId = req.user.id;
  let responseSent = false;

  const sendResponse = (result) => {
    if (!responseSent) {
      responseSent = true;
      res.json(result);
    }
  };

  const sendError = (message, err) => {
    if (!responseSent) {
      responseSent = true;
      res.status(500).json({ message, error: err.message });
    }
  };

  // Sample courses data with different terms
  const sampleCourses = [
    {
      course_code: "CS101",
      title: "Introduction to Computer Science",
      term: "Fall 2024",
      location_name: "Main Campus",
      location_address: "123 University Ave",
      professor: "Prof. Alice",
      section: "A",
      meeting_time: "MWF 9:00-10:00",
    },
    {
      course_code: "MATH101",
      title: "Calculus I",
      term: "Winter 2025",
      location_name: "North Campus",
      location_address: "456 College Blvd",
      professor: "Prof. Bob",
      section: "B",
      meeting_time: "TTh 10:00-11:30",
    },
    {
      course_code: "PHYS101",
      title: "Physics I",
      term: "Spring 2025",
      location_name: "South Campus",
      location_address: "789 Science Rd",
      professor: "Prof. Carol",
      section: "C",
      meeting_time: "MWF 11:00-12:00",
    },
  ];

  // Insert sample advisor for user with title​
  db.run(
    `INSERT INTO advisors (user_id, title, name, phone_number, office_address, office_hours)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId,
      "Academic Advisor",
      "Dr. John Doe",
      "555-1234",
      "Room 101, Admin Building",
      "MWF 12:00-1:00 PM",
    ],
    function (err) {
      if (err) {
        console.error("Error inserting advisor:", err);
        return sendError("Error adding sample advisor", err);
      }
      // Process sample courses
      let completed = 0;
      sampleCourses.forEach((sample) => {
        db.get(
          `SELECT id FROM courses WHERE course_code = ?`,
          [sample.course_code],
          (err, row) => {
            if (err) {
              console.error(
                `Error fetching course ${sample.course_code}:`,
                err
              );
              return sendError(
                `Error fetching course ${sample.course_code}`,
                err
              );
            }
            const processCourse = (courseId) => {
              db.run(
                `INSERT INTO course_offerings (course_id, quarter, location_name, location_address, professor_name)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                  courseId,
                  sample.term,
                  sample.location_name,
                  sample.location_address,
                  sample.professor,
                ],
                function (err) {
                  if (err) {
                    console.error(
                      `Error inserting course offering for ${sample.course_code}:`,
                      err
                    );
                    return sendError(
                      `Error adding sample course offering for ${sample.course_code}`,
                      err
                    );
                  }
                  const courseOfferingId = this.lastID;
                  db.run(
                    `INSERT INTO enrollments (user_id, course_offering_id) VALUES (?, ?)`,
                    [userId, courseOfferingId],
                    (err) => {
                      if (err) {
                        console.error(
                          `Error enrolling in ${sample.course_code}:`,
                          err
                        );
                        return sendError(
                          `Error enrolling sample course ${sample.course_code}`,
                          err
                        );
                      }
                      db.run(
                        `INSERT INTO sections (course_offering_id, section_identifier, class_type, meeting_time, professor_name)
                         VALUES (?, ?, ?, ?, ?)`,
                        [
                          courseOfferingId,
                          sample.section,
                          "Lecture",
                          sample.meeting_time,
                          sample.professor,
                        ],
                        (err) => {
                          if (err) {
                            console.error(
                              `Error inserting section for ${sample.course_code}:`,
                              err
                            );
                            return sendError(
                              `Error adding sample section for ${sample.course_code}`,
                              err
                            );
                          }
                          completed++;
                          if (completed === sampleCourses.length) {
                            sendResponse({
                              message: "Sample data added successfully",
                            });
                          }
                        }
                      );
                    }
                  );
                }
              );
            };

            if (row) {
              processCourse(row.id);
            } else {
              db.run(
                `INSERT OR IGNORE INTO courses (course_code, title, description, credits)
                 VALUES (?, ?, ?, ?)`,
                [sample.course_code, sample.title, "Fallback sample course", 3],
                function (err) {
                  if (err) {
                    console.error(
                      `Error inserting fallback course ${sample.course_code}:`,
                      err
                    );
                    return sendError(
                      `Error adding fallback sample course ${sample.course_code}`,
                      err
                    );
                  }
                  db.get(
                    `SELECT id FROM courses WHERE course_code = ?`,
                    [sample.course_code],
                    (err, row2) => {
                      if (err || !row2) {
                        console.error(
                          `Error fetching fallback course ${sample.course_code}:`,
                          err
                        );
                        return sendError(
                          `Error fetching fallback sample course ${sample.course_code}`,
                          err || new Error("Course not found")
                        );
                      }
                      processCourse(row2.id);
                    }
                  );
                }
              );
            }
          }
        );
      });
    }
  );
});

// --- Protected Test Endpoint ---
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
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ error: message });
});

function importCoursesFromCSV(filePath) {
  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", (row) => {
      // Extract data from the CSV row. Adjust key names if your CSV header differs.
      const courseCode = row["Course Code"];
      const title = row["Title"];
      const credits = row["Credits"]; // If credits are not a pure number, consider storing as TEXT.
      const description = row["Description"];
      // Optionally, you can also use the "College" field if desired:
      // const college = row["College"];

      const sql = `INSERT OR IGNORE INTO courses (course_code, title, description, credits)
                   VALUES (?, ?, ?, ?)`;

      db.run(sql, [courseCode, title, description, credits], function (err) {
        if (err) {
          console.error(`Error inserting course ${courseCode}:`, err);
        } else {
          console.log(`Inserted course ${courseCode}`);
        }
      });
    })
    .on("end", () => {
      console.log("CSV file successfully processed.");
    })
    .on("error", (error) => {
      console.error("Error reading CSV file:", error);
    });
}

// ================================================
// Start the HTTPS Server using SSL Keys
// ================================================

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
      process.exit(1);
    }
    return null;
  }
}

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT} in ${config.environment} mode (HTTPS).`
  );
  console.log(`API endpoints are prefixed with "${API_PREFIX}"`);
  // import courses
  // importCoursesFromCSV("./courses.csv");
});
