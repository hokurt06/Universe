// controllers/eventController.js
const axios = require("axios");
const https = require("https");
const fs = require("fs");
const path = require("path");
const { getFormattedDate, isFileFresh } = require("../utils/dateUtils");

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

    const eventsDir = path.join(__dirname, "..", "scape");
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

// GET /events
async function getEvents(req, res) {
  const eventsFilePath = path.join(__dirname, "..", "scape", "events.json");
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
}

module.exports = {
  getEvents,
};
