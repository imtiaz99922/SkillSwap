const fs = require("fs");
const path = require("path");

function copyDirSync(src, dst) {
  if (!fs.existsSync(dst)) {
    fs.mkdirSync(dst, { recursive: true });
  }
  const files = fs.readdirSync(src);
  for (const file of files) {
    const srcPath = path.join(src, file);
    const dstPath = path.join(dst, file);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirSync(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

function copyFileSync(src, dst) {
  const dir = path.dirname(dst);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.copyFileSync(src, dst);
}

function removeSync(p) {
  if (!fs.existsSync(p)) return;
  if (fs.statSync(p).isDirectory()) {
    const files = fs.readdirSync(p);
    for (const file of files) {
      removeSync(path.join(p, file));
    }
    fs.rmdirSync(p);
  } else {
    fs.unlinkSync(p);
  }
}

const base = path.join(process.cwd(), "backend");
const members = ["Subrata", "Adib", "Zimam", "Imtiaz"];

// Create member directories
for (const m of members) {
  const p = path.join(base, m);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
    console.log(`✓ Created ${p}`);
  }
}

// Routes to move
const routeMoves = {
  "routes/chat": "Subrata/routes/chat",
  "routes/mentorship.js": "Subrata/routes/mentorship.js",
  "routes/recommendations.js": "Subrata/routes/recommendations.js",
  "routes/skills.js": "Subrata/routes/skills.js",
  "routes/courses.js": "Subrata/routes/courses.js",
  "routes/course-content.js": "Subrata/routes/course-content.js",
  "routes/search.js": "Adib/routes/search.js",
  "routes/reviews": "Adib/routes/reviews",
  "routes/referral.js": "Adib/routes/referral.js",
  "routes/reports.js": "Adib/routes/reports.js",
  "routes/payment.js": "Zimam/routes/payment.js",
  "routes/sslcommerz.js": "Zimam/routes/sslcommerz.js",
  "routes/wallet.js": "Zimam/routes/wallet.js",
  "routes/notifications": "Zimam/routes/notifications",
  "routes/sessions.js": "Zimam/routes/sessions.js",
  "routes/leaderboard.js": "Zimam/routes/leaderboard.js",
  "routes/demo-quizzes.js": "Imtiaz/routes/demo-quizzes.js",
  "routes/challenges.js": "Imtiaz/routes/challenges.js",
};

// Move routes
for (const [src, dst] of Object.entries(routeMoves)) {
  const s = path.join(base, src);
  const d = path.join(base, dst);
  if (fs.existsSync(s)) {
    if (fs.statSync(s).isDirectory()) {
      if (fs.existsSync(d)) removeSync(d);
      copyDirSync(s, d);
      removeSync(s);
      console.log(`✓ Moved ${src} → ${dst}`);
    } else {
      copyFileSync(s, d);
      removeSync(s);
      console.log(`✓ Moved ${src} → ${dst}`);
    }
  } else {
    console.log(`⊘ Source not found: ${src}`);
  }
}

// Models to move
const modelMoves = {
  "models/ChatMessage.js": "Subrata/models/ChatMessage.js",
  "models/Mentorship.js": "Subrata/models/Mentorship.js",
  "models/Recommendation.js": "Subrata/models/Recommendation.js",
  "models/Skill.js": "Subrata/models/Skill.js",
  "models/Course.js": "Subrata/models/Course.js",
  "models/CourseContent.js": "Subrata/models/CourseContent.js",
  "models/CourseEnrollment.js": "Subrata/models/CourseEnrollment.js",
  "models/Review.js": "Adib/models/Review.js",
  "models/Referral.js": "Adib/models/Referral.js",
  "models/Report.js": "Adib/models/Report.js",
  "models/Payment.js": "Zimam/models/Payment.js",
  "models/Transaction.js": "Zimam/models/Transaction.js",
  "models/Notification.js": "Zimam/models/Notification.js",
  "models/Session.js": "Zimam/models/Session.js",
  "models/DemoQuiz.js": "Imtiaz/models/DemoQuiz.js",
  "models/Challenge.js": "Imtiaz/models/Challenge.js",
  "models/ChallengeAttempt.js": "Imtiaz/models/ChallengeAttempt.js",
};

// Move models
for (const [src, dst] of Object.entries(modelMoves)) {
  const s = path.join(base, src);
  const d = path.join(base, dst);
  if (fs.existsSync(s)) {
    copyFileSync(s, d);
    removeSync(s);
    console.log(`✓ Moved ${src} → ${dst}`);
  } else {
    console.log(`⊘ Source not found: ${src}`);
  }
}

// Controllers
const controllerMoves = {
  "controllers/paymentController.js": "Zimam/controllers/paymentController.js",
};

// Move controllers
for (const [src, dst] of Object.entries(controllerMoves)) {
  const s = path.join(base, src);
  const d = path.join(base, dst);
  if (fs.existsSync(s)) {
    copyFileSync(s, d);
    removeSync(s);
    console.log(`✓ Moved ${src} → ${dst}`);
  } else {
    console.log(`⊘ Source not found: ${src}`);
  }
}

// Services
const serviceMoves = {
  "services/sslcommerzService.js": "Zimam/services/sslcommerzService.js",
  "services/notificationService.js": "Zimam/services/notificationService.js",
};

// Move services
for (const [src, dst] of Object.entries(serviceMoves)) {
  const s = path.join(base, src);
  const d = path.join(base, dst);
  if (fs.existsSync(s)) {
    copyFileSync(s, d);
    removeSync(s);
    console.log(`✓ Moved ${src} → ${dst}`);
  } else {
    console.log(`⊘ Source not found: ${src}`);
  }
}

console.log("\n✅ Backend reorganization complete!");
