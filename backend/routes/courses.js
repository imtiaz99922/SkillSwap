const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Course = require("../models/Course");
const Skill = require("../models/Skill");
const CourseEnrollment = require("../models/CourseEnrollment");
const CourseContent = require("../models/CourseContent");
const DemoQuiz = require("../models/DemoQuiz");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Coupon = require("../models/Coupon");
const Wallet = require("../models/Wallet");

// Create a new course (from teach skill)
router.post("/create", auth, async (req, res) => {
  try {
    const {
      skillId,
      title,
      description,
      category,
      level,
      price,
      duration,
      tags,
      thumbnail,
    } = req.body;

    // Validate skill exists and belongs to user
    const skill = await Skill.findOne({
      _id: skillId,
      userId: req.user.id,
      type: "teach",
    });
    if (!skill) {
      return res
        .status(404)
        .json({ message: "Skill not found or not a teach skill" });
    }

    // Create course
    const course = new Course({
      instructorId: req.user.id,
      skillId,
      title: title || skill.title,
      description: description || skill.description,
      category: category || skill.category,
      level: level || skill.level,
      price, // in credits
      duration,
      tags: tags || skill.tags,
      thumbnail,
    });

    await course.save();

    // Update skill with course reference
    skill.coursePrice = price;
    skill.courseDuration = duration;
    skill.courseId = course._id;
    await skill.save();

    // Add to user's published courses
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { publishedCourses: course._id },
    });

    // Create notification
    await Notification.create({
      userId: req.user.id,
      type: "course_created",
      message: `Your course "${title}" has been created`,
      relatedId: course._id,
      relatedModel: "Course",
    });

    res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res
      .status(500)
      .json({ message: "Error creating course", error: error.message });
  }
});

// Get all published courses
router.get("/", async (req, res) => {
  try {
    const {
      category,
      level,
      minPrice,
      maxPrice,
      search,
      instructorId,
      page = 1,
      limit = 10,
    } = req.query;

    let query = { isPublished: true, isActive: true };

    if (category) query.category = category;
    if (level) query.level = level;
    if (instructorId) query.instructorId = instructorId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = parseInt(minPrice);
      if (maxPrice !== undefined) query.price.$lte = parseInt(maxPrice);
    }

    const skip = (page - 1) * limit;
    const courses = await Course.find(query)
      .populate("instructorId", "name email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.json({
      courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res
      .status(500)
      .json({ message: "Error fetching courses", error: error.message });
  }
});

// Get course details
router.get("/:courseId", async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate("instructorId", "name email mentorProfile")
      .populate("skillId");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Get demo quiz
    const demoQuiz = await DemoQuiz.findOne({ courseId: course._id });

    // Get enrollment count
    const enrollmentCount = await CourseEnrollment.countDocuments({
      courseId: course._id,
      enrollmentStatus: "active",
    });

    res.json({
      course,
      demoQuiz: demoQuiz
        ? {
            _id: demoQuiz._id,
            title: demoQuiz.title,
            questionCount: demoQuiz.questions.length,
          }
        : null,
      enrollmentCount,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    res
      .status(500)
      .json({ message: "Error fetching course", error: error.message });
  }
});

// Get course content (only for enrolled users)
router.get("/:courseId/content", auth, async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if user is enrolled
    const enrollment = await CourseEnrollment.findOne({
      userId: req.user.id,
      courseId,
      paymentStatus: "completed",
      enrollmentStatus: "active",
    });

    if (!enrollment) {
      return res
        .status(403)
        .json({ message: "You are not enrolled in this course" });
    }

    // Get course contents
    const contents = await CourseContent.find({ courseId }).sort({
      section: 1,
      order: 1,
    });

    // Get user progress
    const userProgress = {};
    contents.forEach((content) => {
      const progress = content.userProgress.find(
        (p) => p.userId.toString() === req.user.id,
      );
      userProgress[content._id] = progress || { viewed: false };
    });

    res.json({
      contents,
      userProgress,
      enrollmentProgress: enrollment.progressPercentage,
    });
  } catch (error) {
    console.error("Error fetching course content:", error);
    res
      .status(500)
      .json({ message: "Error fetching course content", error: error.message });
  }
});

// Purchase course
router.post("/:courseId/purchase", auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { couponCode } = req.body;

    // Get course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if already enrolled
    const existingEnrollment = await CourseEnrollment.findOne({
      userId: req.user.id,
      courseId,
      paymentStatus: "completed",
    });

    if (existingEnrollment) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    // Get user wallet
    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) {
      return res.status(400).json({ message: "Wallet not found" });
    }

    let discountAmount = 0;
    let finalPrice = course.price;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
      });

      if (!coupon) {
        return res.status(400).json({ message: "Invalid or expired coupon" });
      }

      // Check max uses
      if (coupon.maxUses && coupon.usageCount >= coupon.maxUses) {
        return res.status(400).json({ message: "Coupon usage limit reached" });
      }

      // Check minimum purchase amount
      if (course.price < coupon.minPurchaseAmount) {
        return res
          .status(400)
          .json({
            message: `Minimum purchase amount ${coupon.minPurchaseAmount} required`,
          });
      }

      // Check applicable courses
      if (
        coupon.applicableCourses.length > 0 &&
        !coupon.applicableCourses.includes(courseId)
      ) {
        return res
          .status(400)
          .json({ message: "Coupon not applicable to this course" });
      }

      // Calculate discount
      if (coupon.type === "percentage") {
        discountAmount = Math.floor((course.price * coupon.value) / 100);
      } else if (coupon.type === "fixed") {
        discountAmount = Math.min(coupon.value, course.price);
      } else if (coupon.type === "referral") {
        // Referral code is 20% discount
        discountAmount = Math.floor((course.price * 20) / 100);
      }

      finalPrice = Math.max(0, course.price - discountAmount);

      // Record coupon usage
      coupon.usageCount += 1;
      coupon.usedBy.push({
        userId: req.user.id,
        courseId,
      });
      await coupon.save();

      // If referral code, add credits to referrer
      if (coupon.type === "referral" && coupon.createdBy) {
        const referrerWallet = await Wallet.findOne({
          userId: coupon.createdBy,
        });
        if (referrerWallet) {
          referrerWallet.balance += discountAmount;
          await referrerWallet.save();

          // Notify referrer
          await Notification.create({
            userId: coupon.createdBy,
            type: "referral_earned",
            message: `You earned ${discountAmount} credits from referral`,
            relatedId: req.user.id,
            relatedModel: "User",
          });
        }
      }
    }

    // Check balance
    if (wallet.balance < finalPrice) {
      return res
        .status(400)
        .json({ message: "Insufficient credits. Please buy more credits." });
    }

    // Deduct credits
    wallet.balance -= finalPrice;
    await wallet.save();

    // Create enrollment
    const enrollment = new CourseEnrollment({
      userId: req.user.id,
      courseId,
      instructorId: course.instructorId,
      purchasePrice: course.price,
      discountApplied: discountAmount,
      finalPrice,
      couponCode: couponCode || null,
      paymentStatus: "completed",
      enrollmentStatus: "active",
      transactionId: `TXN-${Date.now()}`,
    });

    await enrollment.save();

    // Update course enrollment count
    course.enrollmentCount += 1;
    await course.save();

    // Add to user's enrolled courses
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { enrolledCourses: courseId },
    });

    // Create notification for student
    await Notification.create({
      userId: req.user.id,
      type: "course_purchased",
      message: `You have successfully purchased "${course.title}"`,
      relatedId: courseId,
      relatedModel: "Course",
    });

    // Create notification for instructor
    const student = await User.findById(req.user.id);
    await Notification.create({
      userId: course.instructorId,
      type: "new_enrollment",
      message: `${student.name} enrolled in your course "${course.title}"`,
      relatedId: req.user.id,
      relatedModel: "User",
    });

    res.status(200).json({
      message: "Course purchased successfully",
      enrollment,
      creditsRemaining: wallet.balance,
    });
  } catch (error) {
    console.error("Error purchasing course:", error);
    res
      .status(500)
      .json({ message: "Error purchasing course", error: error.message });
  }
});

// Get user's enrolled courses
router.get("/user/enrolled", auth, async (req, res) => {
  try {
    const enrollments = await CourseEnrollment.find({
      userId: req.user.id,
      paymentStatus: "completed",
      enrollmentStatus: "active",
    })
      .populate("courseId")
      .sort({ createdAt: -1 });

    res.json(enrollments);
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res
      .status(500)
      .json({
        message: "Error fetching enrolled courses",
        error: error.message,
      });
  }
});

// Get user's published courses
router.get("/user/published", auth, async (req, res) => {
  try {
    const courses = await Course.find({
      instructorId: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(courses);
  } catch (error) {
    console.error("Error fetching published courses:", error);
    res
      .status(500)
      .json({
        message: "Error fetching published courses",
        error: error.message,
      });
  }
});

module.exports = router;
