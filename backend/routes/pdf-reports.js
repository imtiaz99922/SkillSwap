const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const PDFDocument = require("pdfkit");
const Transaction = require("../models/Transaction");
const Session = require("../models/Session");
const Mentorship = require("../models/Mentorship");
const User = require("../models/User");

// Generate transaction history PDF
router.get("/transactions", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(100);

    const user = await User.findById(req.userId);

    // Create PDF
    const doc = new PDFDocument();

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="transaction_history.pdf"',
    );

    doc.pipe(res);

    // Title
    doc.fontSize(20).font("Helvetica-Bold").text("Transaction History", {
      align: "center",
      margin: 20,
    });

    // User info
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`User: ${user.name} (${user.email})`, { margin: 10 });
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
    );

    // Summary
    const earned = transactions
      .filter((t) => t.type === "EARN")
      .reduce((sum, t) => sum + t.amount, 0);
    const spent = transactions
      .filter((t) => t.type === "SPEND")
      .reduce((sum, t) => sum + t.amount, 0);

    doc.fontSize(12).font("Helvetica-Bold").text("\nSummary", { margin: 10 });
    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Total Earned: ${earned} credits`)
      .text(`Total Spent: ${spent} credits`)
      .text(`Net: ${earned - spent} credits`);

    // Table header
    doc.fontSize(11).font("Helvetica-Bold");
    const tableTop = 200;
    const col1 = 50;
    const col2 = 150;
    const col3 = 280;
    const col4 = 400;

    doc.text("Date", col1, tableTop);
    doc.text("Type", col2, tableTop);
    doc.text("Reason", col3, tableTop);
    doc.text("Amount", col4, tableTop);

    // Draw line
    doc
      .moveTo(50, tableTop + 20)
      .lineTo(550, tableTop + 20)
      .stroke();

    // Table rows
    doc.fontSize(10).font("Helvetica");
    let y = tableTop + 30;

    for (const transaction of transactions) {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      const date = new Date(transaction.createdAt).toLocaleDateString();
      const amount =
        (transaction.type === "EARN" ? "+" : "-") + transaction.amount;

      doc.text(date, col1, y);
      doc.text(transaction.type, col2, y);
      doc.text(transaction.reason, col3, y, { width: 100 });
      doc.text(amount, col4, y);

      y += 30;
    }

    doc.end();
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Generate session history PDF
router.get("/sessions", auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ mentorId: req.userId }, { menteeId: req.userId }],
    })
      .populate("mentorId", "name")
      .populate("menteeId", "name")
      .populate("skillId", "title")
      .sort({ createdAt: -1 })
      .limit(100);

    const user = await User.findById(req.userId);

    // Create PDF
    const doc = new PDFDocument();

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="session_history.pdf"',
    );

    doc.pipe(res);

    // Title
    doc.fontSize(20).font("Helvetica-Bold").text("Session History", {
      align: "center",
      margin: 20,
    });

    // User info
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`User: ${user.name} (${user.email})`, { margin: 10 });
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
    );

    // Summary
    const completed = sessions.filter(
      (s) => s.status === "COMPLETED" && s.completionVerified,
    ).length;
    const asMentor = sessions.filter(
      (s) => s.mentorId._id.toString() === req.userId,
    ).length;
    const asMentee = sessions.filter(
      (s) => s.menteeId._id.toString() === req.userId,
    ).length;
    const totalCredits = sessions
      .filter((s) => s.completionVerified)
      .reduce((sum, s) => sum + (s.creditsAwarded || 0), 0);

    doc.fontSize(12).font("Helvetica-Bold").text("\nSummary", { margin: 10 });
    doc
      .fontSize(11)
      .font("Helvetica")
      .text(`Total Sessions: ${sessions.length}`)
      .text(`Completed & Verified: ${completed}`)
      .text(`As Mentor: ${asMentor}`)
      .text(`As Mentee: ${asMentee}`)
      .text(`Total Credits Earned: ${totalCredits}`);

    // Table header
    doc.fontSize(11).font("Helvetica-Bold");
    const tableTop = 250;
    const col1 = 50;
    const col2 = 120;
    const col3 = 200;
    const col4 = 300;
    const col5 = 420;

    doc.text("Date", col1, tableTop);
    doc.text("Skill", col2, tableTop);
    doc.text("Mentor", col3, tableTop);
    doc.text("Mentee", col4, tableTop);
    doc.text("Status", col5, tableTop);

    // Draw line
    doc
      .moveTo(50, tableTop + 20)
      .lineTo(550, tableTop + 20)
      .stroke();

    // Table rows
    doc.fontSize(10).font("Helvetica");
    let y = tableTop + 30;

    for (const session of sessions) {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      const date = new Date(session.startTime).toLocaleDateString();
      const status = session.completionVerified ? "✓ Verified" : session.status;

      doc.text(date, col1, y);
      doc.text(session.skillId.title, col2, y, { width: 70 });
      doc.text(session.mentorId.name, col3, y, { width: 90 });
      doc.text(session.menteeId.name, col4, y, { width: 100 });
      doc.text(status, col5, y);

      y += 30;
    }

    doc.end();
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Generate comprehensive user report
router.get("/user-report", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const transactions = await Transaction.find({ userId: req.userId });
    const sessions = await Session.find({
      $or: [{ mentorId: req.userId }, { menteeId: req.userId }],
    });
    const mentorships = await Mentorship.find({
      $or: [{ mentorId: req.userId }, { menteeId: req.userId }],
    });

    // Create PDF
    const doc = new PDFDocument();

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="user_report.pdf"',
    );

    doc.pipe(res);

    // Title
    doc.fontSize(20).font("Helvetica-Bold").text("SkillSwap User Report", {
      align: "center",
      margin: 20,
    });

    // User info
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("User Information", { margin: 10 });
    doc.fontSize(11).font("Helvetica");
    doc.text(`Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Member Since: ${new Date(user.createdAt).toLocaleDateString()}`);
    doc.text(
      `Report Generated: ${new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
    );

    // Activity Summary
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("\nActivity Summary", { margin: 10 });
    doc.fontSize(11).font("Helvetica");
    doc.text(`Total Transactions: ${transactions.length}`);
    doc.text(`Total Sessions: ${sessions.length}`);
    doc.text(`Active Mentorships: ${mentorships.length}`);

    // Earnings summary
    const earned = transactions
      .filter((t) => t.type === "EARN")
      .reduce((sum, t) => sum + t.amount, 0);
    const spent = transactions
      .filter((t) => t.type === "SPEND")
      .reduce((sum, t) => sum + t.amount, 0);

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("\nCredit Summary", { margin: 10 });
    doc.fontSize(11).font("Helvetica");
    doc.text(`Total Earned: ${earned} credits`);
    doc.text(`Total Spent: ${spent} credits`);
    doc.text(`Balance: ${earned - spent} credits`);

    doc.end();
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
