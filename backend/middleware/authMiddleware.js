// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const config = require("../config");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, config.jwtSecret, (err, payload) => {
    if (err)
      return res.status(403).json({ message: "Invalid or expired token" });
    req.user = payload;
    next();
  });
}

module.exports = {
  authenticateToken,
};
