// middleware/validationMiddleware.js
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

module.exports = {
  requireFields,
};
