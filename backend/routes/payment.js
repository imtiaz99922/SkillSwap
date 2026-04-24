const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const auth = require("../middleware/auth");

// Initialize Stripe only if secret key is provided
const stripe = process.env.STRIPE_SECRET_KEY
  ? require("stripe")(process.env.STRIPE_SECRET_KEY)
  : null;

if (stripe) {
  console.log("✅ Stripe payment gateway configured");
} else {
  console.warn(
    "⚠️  Stripe not configured. Payment processing will use demo mode. Set STRIPE_SECRET_KEY to enable.",
  );
}

// Payment packages/products
const PACKAGES = [
  { id: "starter", name: "Starter", credits: 100, amount: 9.99 },
  { id: "pro", name: "Pro", credits: 500, amount: 39.99 },
  { id: "business", name: "Business", credits: 1500, amount: 99.99 },
  { id: "enterprise", name: "Enterprise", credits: 5000, amount: 299.99 },
];

// GET /api/payment/packages - Get all payment packages
router.get("/packages", async (req, res) => {
  try {
    res.json(PACKAGES);
  } catch (err) {
    console.error("Error fetching packages:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/payment/create-payment-intent - Create Stripe payment intent (protected)
router.post("/create-payment-intent", auth, async (req, res) => {
  try {
    const { packageId } = req.body;

    if (!packageId) {
      return res.status(400).json({ msg: "Package ID is required" });
    }

    const pkg = PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      return res.status(404).json({ msg: "Package not found" });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // If Stripe is not configured, return demo response
    if (!stripe) {
      console.log("📦 Demo payment intent created for", packageId);
      return res.json({
        clientSecret: "demo_secret_" + packageId + "_" + Date.now(),
        paymentIntentId: "demo_pi_" + packageId + "_" + Date.now(),
        amount: pkg.amount,
        currency: "USD",
        package: pkg,
        isDemo: true,
      });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(pkg.amount * 100), // Convert to cents
      currency: "usd",
      customer: user.stripeCustomerId,
      metadata: {
        userId: req.userId.toString(),
        packageId: packageId,
        packageName: pkg.name,
        credits: pkg.credits,
      },
      description: `Purchase ${pkg.name} package - ${pkg.credits} credits`,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: pkg.amount,
      currency: "USD",
      package: pkg,
    });
  } catch (err) {
    console.error("Error creating payment intent:", err);
    res.status(500).json({ msg: "Failed to create payment intent" });
  }
});

// POST /api/payment/confirm-payment - Confirm and process payment (protected)
router.post("/confirm-payment", auth, async (req, res) => {
  try {
    const { paymentIntentId, packageId } = req.body;

    if (!paymentIntentId || !packageId) {
      return res
        .status(400)
        .json({ msg: "Payment intent ID and package ID are required" });
    }

    const pkg = PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      return res.status(404).json({ msg: "Package not found" });
    }

    // Retrieve payment intent from Stripe (if available)
    if (stripe) {
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({
          msg: "Payment was not successful",
          status: paymentIntent.status,
        });
      }
    } else {
      console.log("📦 Demo payment confirmation for", packageId);
    }

    // Create payment record
    const payment = new Payment({
      userId: req.userId,
      packageId,
      amount: pkg.amount,
      creditsGranted: pkg.credits,
      paymentMethod: stripe ? "stripe" : "demo",
      status: "Completed",
      transactionId: paymentIntentId,
    });

    await payment.save();

    // Update wallet
    let wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      wallet = new Wallet({
        userId: req.userId,
        credits: pkg.credits,
        totalEarned: pkg.credits,
      });
    } else {
      wallet.credits += pkg.credits;
      wallet.totalEarned += pkg.credits;
    }
    await wallet.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: req.userId,
      type: "EARN",
      amount: pkg.credits,
      reason: "Purchase",
      description: `Purchased ${pkg.name} package via Stripe`,
      status: "Completed",
    });
    await transaction.save();

    res.status(201).json({
      msg: `Successfully purchased ${pkg.name} package! ${pkg.credits} credits added to your wallet.`,
      payment,
      wallet,
      transaction,
    });
  } catch (err) {
    console.error("Error confirming payment:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/payment/process - Legacy process payment (protected) - for simple payments
router.post("/process", auth, async (req, res) => {
  try {
    const { packageId, paymentMethod, paymentDetails } = req.body;

    if (!packageId || !paymentMethod) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const pkg = PACKAGES.find((p) => p.id === packageId);
    if (!pkg) {
      return res.status(404).json({ msg: "Package not found" });
    }

    // Create payment record
    const payment = new Payment({
      userId: req.userId,
      packageId,
      amount: pkg.amount,
      creditsGranted: pkg.credits,
      paymentMethod,
      status: "Completed",
      transactionId: `TXN-${Date.now()}`,
    });

    await payment.save();

    // Update wallet
    let wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      wallet = new Wallet({
        userId: req.userId,
        credits: pkg.credits,
        totalEarned: pkg.credits,
      });
    } else {
      wallet.credits += pkg.credits;
      wallet.totalEarned += pkg.credits;
    }
    await wallet.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: req.userId,
      type: "EARN",
      amount: pkg.credits,
      reason: "Purchase",
      description: `Purchased ${pkg.name} package`,
      status: "Completed",
    });
    await transaction.save();

    res.status(201).json({
      message: `Successfully purchased ${pkg.name} package! ${pkg.credits} credits added to your wallet.`,
      payment,
      wallet,
    });
  } catch (err) {
    console.error("Error processing payment:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/payment/history - Get user's payment history (protected)
router.get("/history", auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(payments);
  } catch (err) {
    console.error("Error fetching payment history:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/payment/:id - Get specific payment details (protected)
router.get("/:id", auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ msg: "Payment not found" });
    }

    if (payment.userId.toString() !== req.userId) {
      return res.status(403).json({ msg: "Access denied" });
    }

    res.json(payment);
  } catch (err) {
    console.error("Error fetching payment:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/payment/:id/receipt - Get payment receipt (protected)
router.get("/:id/receipt", auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ msg: "Payment not found" });
    }

    if (payment.userId.toString() !== req.userId) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const pkg = PACKAGES.find((p) => p.id === payment.packageId);

    res.json({
      id: payment._id,
      date: payment.createdAt,
      transactionId: payment.transactionId,
      package: pkg?.name,
      amount: payment.amount,
      credits: payment.creditsGranted,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
    });
  } catch (err) {
    console.error("Error fetching receipt:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/payment/webhook - Stripe webhook for payment updates
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    // Skip if Stripe is not configured
    if (!stripe) {
      console.log("⏭️  Webhook skipped (Stripe not configured)");
      return res.json({ received: true });
    }

    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle different event types
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      console.log("✅ Payment succeeded:", paymentIntent.id);
      // Payment is already processed in confirm-payment endpoint
    } else if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      console.log("❌ Payment failed:", paymentIntent.id);
    }

    res.json({ received: true });
  },
);

module.exports = router;
