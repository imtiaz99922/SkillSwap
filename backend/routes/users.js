const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");

const router = express.Router();

// GET /api/users - List users for recommendations and other social flows
router.get("/", auth, async (req, res) => {
  try {
    const { search = "", limit = 200 } = req.query;
    const filter = { _id: { $ne: req.userId } };

    if (search.trim()) {
      const searchValue = search.trim();
      filter.$or = [
        { name: { $regex: searchValue, $options: "i" } },
        { email: { $regex: searchValue, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("name email mentorProfile.isActiveMentor")
      .sort({ name: 1 })
      .limit(parseInt(limit, 10));

    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
