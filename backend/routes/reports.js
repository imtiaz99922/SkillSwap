const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Report = require("../models/Report");
const User = require("../models/User");

// Submit a report
router.post("/", auth, async (req, res) => {
  try {
    const { reportedUserId, category, description, severity, evidence } =
      req.body;

    if (!reportedUserId || !category || !description) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    if (reportedUserId === req.userId) {
      return res.status(400).json({ msg: "Cannot report yourself" });
    }

    const user = await User.findById(reportedUserId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const report = new Report({
      reporterId: req.userId,
      reportedUserId,
      category,
      description,
      severity: severity || "MEDIUM",
      evidence: evidence || [],
    });

    await report.save();

    res.status(201).json({
      msg: "Report submitted successfully",
      report: await report.populate("reporterId reportedUserId", "name email"),
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get user's submitted reports
router.get("/my-reports", auth, async (req, res) => {
  try {
    const reports = await Report.find({ reporterId: req.userId })
      .populate("reportedUserId", "name email")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get reports about user (admin view)
router.get("/about/:userId", auth, async (req, res) => {
  try {
    const reports = await Report.find({ reportedUserId: req.params.userId })
      .populate("reporterId", "name email")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get all reports (admin only - in real implementation, check admin role)
router.get("/", auth, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporterId reportedUserId", "name email")
      .populate("resolvedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(reports);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Update report status (admin)
router.put("/:id", auth, async (req, res) => {
  try {
    const { status, adminNotes, resolution } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) return res.status(404).json({ msg: "Report not found" });

    if (status) report.status = status;
    if (adminNotes) report.adminNotes = adminNotes;
    if (resolution) report.resolution = resolution;

    if (status === "RESOLVED" || status === "DISMISSED") {
      report.resolvedBy = req.userId;
      report.resolvedAt = new Date();
    }

    await report.save();

    res.json({ msg: "Report updated", report });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Delete report
router.delete("/:id", auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) return res.status(404).json({ msg: "Report not found" });

    if (
      report.reporterId.toString() !== req.userId &&
      report.status === "OPEN"
    ) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await Report.findByIdAndDelete(req.params.id);
    res.json({ msg: "Report deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
