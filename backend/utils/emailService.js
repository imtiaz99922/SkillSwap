const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Configure email service based on environment
let transporter;

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  console.log(
    "✅ Email service configured:",
    process.env.EMAIL_SERVICE || "gmail",
  );
} else {
  console.warn(
    "⚠️  Email credentials not configured. Email features will be disabled. Set EMAIL_USER and EMAIL_PASSWORD to enable.",
  );
  transporter = null;
}

// Generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Send verification email
const sendVerificationEmail = async (email, name, token, baseURL) => {
  if (!transporter) {
    console.log("📧 Email sending disabled (demo mode). Token:", token);
    console.log(
      "📧 Verification link would be:",
      `${baseURL}/verify-email?token=${token}`,
    );
    return true; // Return true to allow registration to continue in dev mode
  }

  const verificationLink = `${baseURL}/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your SkillSwap Email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to SkillSwap, ${name}!</h2>
        <p style="color: #666; font-size: 16px;">Thank you for registering. Please verify your email address to complete your account setup.</p>
        
        <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <a href="${verificationLink}" 
             style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Verify Email
          </a>
        </div>

        <p style="color: #999; font-size: 14px;">Or copy and paste this link in your browser:</p>
        <p style="color: #999; font-size: 14px; word-break: break-all;">${verificationLink}</p>

        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          This link will expire in 24 hours. If you didn't register for this account, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, token, baseURL) => {
  if (!transporter) {
    console.log("📧 Email sending disabled. Reset token:", token);
    return true;
  }

  const resetLink = `${baseURL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your SkillSwap Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="color: #666; font-size: 16px;">We received a request to reset your password. Click the link below to proceed.</p>
        
        <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <a href="${resetLink}" 
             style="background-color: #007BFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>

        <p style="color: #999; font-size: 14px;">Or copy and paste this link in your browser:</p>
        <p style="color: #999; font-size: 14px; word-break: break-all;">${resetLink}</p>

        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          This link will expire in 1 hour. If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    return false;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
