// config/index.js
const requiredVars = [
  "ENVIRONMENT",
  "PORT",
  "MDBSTRING",
  "JWT_SECRET",
  "API_PREFIX",
];
const missing = requiredVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error(`Missing configuration for: ${missing.join(", ")}`);
  process.exit(1);
}

module.exports = {
  environment: process.env.ENVIRONMENT,
  port: process.env.PORT,
  database: process.env.MDBSTRING,
  jwtSecret: process.env.JWT_SECRET,
  apiPrefix: process.env.API_PREFIX,
};
