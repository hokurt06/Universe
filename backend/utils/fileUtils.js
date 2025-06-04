// utils/fileUtils.js
const fs = require("fs");

function readFileSafe(filePath, breakOnError, errorMessage) {
  try {
    return fs.readFileSync(filePath);
  } catch (error) {
    console.error(errorMessage);
    if (breakOnError) {
      console.error(error);
      process.exit(1);
    }
    return null;
  }
}

module.exports = {
  readFileSafe,
};
