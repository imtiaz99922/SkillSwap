const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const auth = require("../middleware/auth");
const {
  generateVerificationToken,
  sendVerificationEmail,
} = require("../utils/emailService");

// Stripe removed - using SSLCommerz only

// Check if email is properly configured (not placeholder values)
const isEmailConfigured = () => {
  return (
    process.env.EMAIL_USER &&
    process.env.EMAIL_USER !== "your_email@gmail.com" &&
    process.env.EMAIL_PASSWORD &&
    process.env.EMAIL_PASSWORD !== "your_app_password_here"
  );
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res
      .status(400)
      .json({ msg: "Please provide name, email and password" });
  if (password.length < 6)
    return res
      .status(400)
      .json({ msg: "Password must be at least 6 characters" });

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Generate verification token
    const emailVerificationToken = generateVerificationToken();
    const emailVerificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // In demo mode (no email configured), auto-verify email
    const isDemoMode = !isEmailConfigured();

    const user = new User({
      name,
      email,
      password: hashed,
      emailVerificationToken: isDemoMode ? undefined : emailVerificationToken,
      emailVerificationTokenExpiry: isDemoMode
        ? undefined
        : emailVerificationTokenExpiry,
      isEmailVerified: isDemoMode ? true : false,
    });
    await user.save();

    // Send verification email only if configured
    if (!isDemoMode) {
      try {
        await sendVerificationEmail(
          email,
          name,
          emailVerificationToken,
          process.env.BASE_URL,
        );
        return res.status(201).json({
          msg: "Registration successful! Check your email to verify your account.",
          user: { id: user._id, name: user.name, email: user.email },
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
        // Delete user if email fails
        await User.deleteOne({ _id: user._id });
        return res
          .status(500)
          .json({ msg: "Failed to send verification email" });
      }
    } else {
      // Demo mode - auto-verified
      console.log(
        "🧪 DEMO MODE: Registration successful (email auto-verified)",
      );
      console.log(`📧 User email: ${email}`);
      console.log(`🔑 Verification token: ${emailVerificationToken}`);

      return res.status(201).json({
        msg: "✅ Demo Registration successful! Email auto-verified. You can now login.",
        user: { id: user._id, name: user.name, email: user.email },
        isDemoMode: true,
        verificationToken: emailVerificationToken, // For testing purposes
      });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ msg: "Please provide email and password" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isDemoMode = !isEmailConfigured();

    // Check if email is verified (skip in demo mode)
    if (!user.isEmailVerified && !isDemoMode) {
      return res
        .status(403)
        .json({ msg: "Please verify your email before logging in" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    if (isDemoMode) {
      console.log("🧪 DEMO MODE LOGIN: User logged in successfully");
    }

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
      isDemoMode,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/auth/me  (protected)
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/auth/verify-email
router.post("/verify-email", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ msg: "Verification token required" });
  }

  try {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ msg: "Invalid or expired verification token" });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;
    await user.save();

    res.json({ msg: "Email verified successfully! You can now login." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/auth/resend-verification
router.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "Email required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ msg: "Email already verified" });
    }

    // Generate new token
    const emailVerificationToken = generateVerificationToken();
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await sendVerificationEmail(
      email,
      user.name,
      emailVerificationToken,
      process.env.BASE_URL,
    );
    res.json({ msg: "Verification email resent successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
