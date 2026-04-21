const express = require("express");
const Availability = require("../../models/Availability");
const auth = require("../../middleware/auth");

const router = express.Router();

// GET /api/availability - Get user's availability slots
router.get("/", auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { userId: req.userId };
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const availability = await Availability.find(filter).sort({
      date: 1,
      startTime: 1,
    });

    res.json(availability);
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/availability - Create availability slot
router.post("/", auth, async (req, res) => {
  const { date, startTime, endTime } = req.body;

  if (!date || !startTime || !endTime) {
    return res.status(400).json({ msg: "Missing required fields" });
  }

  try {
    // Check for conflicts
    const conflict = await Availability.findOne({
      userId: req.userId,
      date: new Date(date),
      $or: [
        {
          $and: [
            { startTime: { $lt: endTime } },
            { endTime: { $gt: startTime } },
          ],
        },
      ],
    });

    if (conflict) {
      return res
        .status(400)
        .json({ msg: "Time slot conflicts with existing availability" });
    }

    const availability = new Availability({
      userId: req.userId,
      date: new Date(date),
      startTime,
      endTime,
    });

    await availability.save();
    res.status(201).json(availability);
  } catch (error) {
    console.error("Error creating availability:", error);
    if (error.message.includes("End time must be after start time")) {
      return res.status(400).json({ msg: error.message });
    }
    res.status(500).json({ msg: "Server error" });
  }
});

// PUT /api/availability/:id - Update availability slot
router.put("/:id", auth, async (req, res) => {
  const { date, startTime, endTime } = req.body;

  try {
    const availability = await Availability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({ msg: "Availability slot not found" });
    }

    if (availability.userId.toString() !== req.userId) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    if (availability.isBooked) {
      return res.status(400).json({ msg: "Cannot modify booked slot" });
    }

    // Check for conflicts (excluding current slot)
    if (date || startTime || endTime) {
      const newDate = date ? new Date(date) : availability.date;
      const newStart = startTime || availability.startTime;
      const newEnd = endTime || availability.endTime;

      const conflict = await Availability.findOne({
        userId: req.userId,
        date: newDate,
        _id: { $ne: req.params.id },
        $or: [
          {
            $and: [
              { startTime: { $lt: newEnd } },
              { endTime: { $gt: newStart } },
            ],
          },
        ],
      });

      if (conflict) {
        return res
          .status(400)
          .json({ msg: "Time slot conflicts with existing availability" });
      }
    }

    if (date) availability.date = new Date(date);
    if (startTime) availability.startTime = startTime;
    if (endTime) availability.endTime = endTime;

    await availability.save();
    res.json(availability);
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// DELETE /api/availability/:id - Delete availability slot
router.delete("/:id", auth, async (req, res) => {
  try {
    const availability = await Availability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({ msg: "Availability slot not found" });
    }

    if (availability.userId.toString() !== req.userId) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    if (availability.isBooked) {
      return res.status(400).json({ msg: "Cannot delete booked slot" });
    }

    await Availability.findByIdAndDelete(req.params.id);
    res.json({ msg: "Availability slot deleted" });
  } catch (error) {
    console.error("Error deleting availability:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/availability/user/:userId - Get another user's available slots
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {
      userId: req.params.userId,
      isBooked: false,
    };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const availability = await Availability.find(filter).sort({
      date: 1,
      startTime: 1,
    });

    res.json(availability);
  } catch (error) {
    console.error("Error fetching user availability:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/availability/:id/book - Book an availability slot
router.post("/:id/book", auth, async (req, res) => {
  try {
    const availability = await Availability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({ msg: "Availability slot not found" });
    }

    if (availability.isBooked) {
      return res.status(400).json({ msg: "Slot is already booked" });
    }

    availability.isBooked = true;
    availability.bookedBy = req.userId;
    await availability.save();

    res.json({ msg: "Slot booked successfully", availability });
  } catch (error) {
    console.error("Error booking slot:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
