// utils/dateUtils.js
const fs = require("fs");

function getFormattedDate(date = new Date()) {
  return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date
    .getDate()
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
}

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

module.exports = {
  getFormattedDate,
  isFileFresh,
};
