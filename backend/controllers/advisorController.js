// controllers/advisorController.js
const { addAdvisorToUser, getUserById } = require("../models/User");

// POST /advisors
async function addAdvisor(req, res) {
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
    res
      .status(500)
      .json({ message: "Error adding advisor", error: error.message });
  }
}

// GET /advisors
async function getAdvisors(req, res) {
  try {
    const user = await getUserById(req.user.id);
    res.json({ advisors: user.advisors || [] });
  } catch (error) {
    console.error("Error fetching advisors:", error);
    res
      .status(500)
      .json({ message: "Error fetching advisors", error: error.message });
  }
}

module.exports = {
  addAdvisor,
  getAdvisors,
};
