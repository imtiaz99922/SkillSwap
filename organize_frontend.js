const fs = require("fs");
const path = require("path");

const base = path.join(process.cwd(), "client", "src");
const members = ["Subrata", "Adib", "Zimam", "Imtiaz"];

// Create member directories
for (const m of members) {
  const p = path.join(base, m);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
    console.log(`✓ Created ${p}`);
  }
}

// Feature moves mapping
const moves = {
  "features/chat": "Subrata/chat",
  "features/mentorship": "Subrata/mentorship",
  "features/recommendations": "Subrata/recommendations",
  "features/skills": "Subrata/skills",
  "features/courses": "Subrata/courses",
  "features/search": "Adib/search",
  "features/reviews": "Adib/reviews",
  "features/referral": "Adib/referral",
  "features/reports": "Adib/reports",
  "features/payment": "Zimam/payment",
  "features/notifications": "Zimam/notifications",
  "features/sessions": "Zimam/sessions",
  "features/leaderboard": "Zimam/leaderboard",
  "features/quiz": "Imtiaz/quiz",
  "features/availability": "Imtiaz/availability",
};

// Helper function to copy directories recursively
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

// Helper function to remove directories recursively
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

// Move features (copy then delete)
for (const [src, dst] of Object.entries(moves)) {
  const s = path.join(base, src);
  const d = path.join(base, dst);
  if (fs.existsSync(s)) {
    if (fs.existsSync(d)) {
      removeSync(d);
    }
    copyDirSync(s, d);
    removeSync(s);
    console.log(`✓ Moved ${src} → ${dst}`);
  } else {
    console.log(`⊘ Source not found: ${src}`);
  }
}

// Page moves mapping
const pageMoves = {
  "pages/WalletPage.jsx": "Zimam/pages/WalletPage.jsx",
  "pages/WalletPage.css": "Zimam/pages/WalletPage.css",
  "pages/SSLCommerzPaymentPage.jsx": "Zimam/pages/SSLCommerzPaymentPage.jsx",
  "pages/SSLCommerzPaymentPage.css": "Zimam/pages/SSLCommerzPaymentPage.css",
  "pages/Dashboard.jsx": "Imtiaz/pages/Dashboard.jsx",
  "pages/Dashboard.css": "Imtiaz/pages/Dashboard.css",
  "pages/DemoQuizPage.jsx": "Imtiaz/pages/DemoQuizPage.jsx",
  "pages/DemoQuizPage.css": "Imtiaz/pages/DemoQuizPage.css",
  "pages/CoursesPage.jsx": "Subrata/pages/CoursesPage.jsx",
  "pages/CoursesPage.css": "Subrata/pages/CoursesPage.css",
};

// Move pages
for (const [src, dst] of Object.entries(pageMoves)) {
  const s = path.join(base, src);
  const d = path.join(base, dst);
  const dir = path.dirname(d);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (fs.existsSync(s)) {
    fs.copyFileSync(s, d);
    fs.unlinkSync(s);
    console.log(`✓ Moved ${src} → ${dst}`);
  } else {
    console.log(`⊘ Source not found: ${src}`);
  }
}

console.log("\n✅ Frontend reorganization complete!");
