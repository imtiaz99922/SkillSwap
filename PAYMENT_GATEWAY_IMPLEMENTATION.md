# Payment Gateway Implementation Guide

## 🎯 Overview

This guide documents the complete payment gateway integration for SkillSwap wallet feature. The system supports bKash, Nagad, and other payment methods via an aggregator API.

## 📁 Files Created/Modified

### Backend Files

1. **`services/paymentService.js`** (NEW)
   - `createPaymentGateway()` - Create payment with gateway
   - `verifyPaymentGateway()` - Verify payment status
   - `verifyWebhookSignature()` - Validate webhook authenticity

2. **`controllers/paymentController.js`** (NEW)
   - `createPayment()` - Initiate payment
   - `finalizePayment()` - Verify and grant credits
   - `paymentCallback()` - Handle user redirect after payment
   - `paymentWebhook()` - Handle gateway webhook
   - `getPaymentStatus()` - Get payment details
   - `getUserPayments()` - Get payment history

3. **`routes/payment-gateway.js`** (NEW)
   - Complete payment gateway routes
   - Callback handling
   - Webhook processing
   - Legacy Stripe support

4. **`models/Payment.js`** (UPDATED)
   - Enhanced with gateway fields
   - New indexes for performance
   - Support for multiple payment methods

5. **`models/UserSkill.js`** (NEW)
   - Track purchased skills per user
   - Access level management
   - Expiration dates (optional)

6. **`server.js`** (UPDATED)
   - Registered payment gateway routes

### Frontend Files

1. **`pages/WalletPage.jsx`** (NEW)
   - Buy credits interface
   - Payment status display
   - Payment history table
   - Package selection

2. **`pages/WalletPage.css`** (NEW)
   - Modern gradient design
   - Responsive layout
   - Smooth animations

### Documentation

1. **`PAYMENT_GATEWAY_ENV_GUIDE.md`** (NEW)
   - Environment variables guide
   - API configuration
   - Testing instructions

## 🔄 Payment Flow

### Step 1: User Initiates Payment

```javascript
// Frontend
const response = await axios.post("/api/payment-gateway/create", {
  amount: 399, // Amount in BDT
  creditsGranted: 500, // Credits to grant
  paymentMethod: "bKash",
  metadata: { packageId: "pro" },
});

// Backend creates payment with status: pending
// Calls gateway API to create payment
// Returns payment URL
```

### Step 2: User Redirected to Payment Gateway

```javascript
// Frontend
window.location.href = response.data.paymentUrl;

// Gateway shows payment form
// User enters payment details
// Gateway processes payment
```

### Step 3: Payment Callback (User Redirect)

```javascript
// Gateway redirects user to:
// GET /api/payment-gateway/callback?paymentID=xxx&status=success

// Backend:
// - Verifies payment with gateway
// - Updates Payment.status = "success"
// - Creates UserSkill record
// - Grants credits to Wallet
// - Redirects to frontend success page
```

### Step 4: Webhook Confirmation (Server-to-Server) ⭐ MOST IMPORTANT

```javascript
// Gateway sends to:
// POST /api/payment-gateway/webhook

// Backend:
// - Verifies webhook signature
// - Confirms payment is success
// - Grants credits (if not already done)
// - Logs for audit trail
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install axios
```

### 2. Set Environment Variables

Create/update `.env` file:

```env
# Payment Gateway
PAYMENT_BASE_URL=https://sandbox.payment-aggregator.com
PAYMENT_API_KEY=your_api_key
PAYMENT_WEBHOOK_SECRET=your_webhook_secret

# Server
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

### 3. Update Seed Script

If you want to populate sample payment data during seeding:

```javascript
// In seed.js
const paymentData = {
  userId: users[0]._id,
  amount: 399,
  creditsGranted: 500,
  paymentMethod: "bKash",
  status: "success",
  invoiceId: `INV-${Date.now()}`,
  completedAt: new Date(),
};
const payment = await Payment.create(paymentData);
```

### 4. Update Frontend Routes

Add WalletPage to your App.jsx:

```javascript
import WalletPage from "./pages/WalletPage";

// In your routes
<Route path="/wallet" element={<WalletPage />} />;
```

### 5. Update Navbar

Add wallet link to navigation:

```javascript
// In Sidebar.jsx or Navbar.jsx
{ icon: FaWallet, label: "Wallet", path: "/wallet" }
```

## 🧪 Testing

### Local Testing

1. **Create Payment:**

```bash
curl -X POST http://localhost:5000/api/payment-gateway/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 399,
    "creditsGranted": 500,
    "paymentMethod": "bKash"
  }'
```

2. **Check Payment Status:**

```bash
curl http://localhost:5000/api/payment-gateway/status/PAYMENT_ID
```

3. **Get Payment History:**

```bash
curl http://localhost:5000/api/payment-gateway/history/USER_ID
```

### Full Payment Flow Test

1. Navigate to `/wallet` page
2. Click "Buy" on a package
3. You'll be redirected to payment gateway
4. Complete payment with test credentials
5. You'll be redirected back to success page
6. Check database:
   - `Payment.status` should be "success"
   - `Wallet.creditsBalance` should be increased
   - `UserSkill` record should exist (if applicable)

## 🔐 Security Features

### 1. Webhook Signature Verification

```javascript
// verifyWebhookSignature() validates HMAC signature
// Prevents forged payment notifications
```

### 2. Idempotency

```javascript
// if (payment.status === "success") return;
// Prevents granting credits twice for same payment
```

### 3. Database Constraints

```javascript
// Unique indexes on paymentId, invoiceId
// Prevents duplicate payment records
```

### 4. Status Validation

```javascript
// Only allow "success" status to grant credits
// Verify with gateway before marking success
```

## 📊 Database Schema

### Payment Model

```javascript
{
  userId: ObjectId,
  amount: Number,
  creditsGranted: Number,
  paymentMethod: String, // "bKash", "Nagad", etc.
  status: String, // "pending", "success", "failed"
  paymentId: String, // from gateway
  invoiceId: String, // unique invoice number
  transactionId: String, // gateway transaction ID
  rawResponse: Object, // full gateway response
  metadata: Object, // custom data
  createdAt: Date,
  completedAt: Date
}
```

### Wallet Model

```javascript
{
  userId: ObjectId,
  creditsBalance: Number,
  totalCreditsEarned: Number,
  totalCreditsSpent: Number
}
```

### UserSkill Model

```javascript
{
  userId: ObjectId,
  skillId: ObjectId,
  paymentId: ObjectId,
  accessLevel: String,
  purchasedAt: Date,
  expiresAt: Date
}
```

## 🛣️ API Endpoints

### Payment Management

- `POST /api/payment-gateway/create` - Create payment
- `GET /api/payment-gateway/status/:paymentId` - Get status
- `GET /api/payment-gateway/history/:userId` - Get history
- `GET /api/payment-gateway/packages` - Get packages

### Gateway Callbacks

- `GET /api/payment-gateway/callback` - User redirect after payment
- `POST /api/payment-gateway/webhook` - Server webhook

## 📝 Logging

All payment operations are logged:

```javascript
console.log("📝 Payment created (pending):", payment._id);
console.log("✅ Gateway payment created:", payment.paymentId);
console.log("✅ Payment marked successful:", payment._id);
console.log("✅ Credits granted:", payment.creditsGranted);
```

## ⚠️ Common Issues & Solutions

### Issue: "Payment gateway error: ECONNREFUSED"

**Solution:** Check PAYMENT_BASE_URL is correct and gateway server is running

### Issue: "Invalid webhook signature"

**Solution:** Verify PAYMENT_WEBHOOK_SECRET matches gateway setting

### Issue: "Payment not found after redirect"

**Solution:** Check database for Payment record with correct paymentId

### Issue: Duplicate credits granted

**Solution:** Webhook processed twice. Check idempotency logic in finalizePayment()

## 🚀 Production Deployment

1. **Use HTTPS**
   - All payment endpoints must be HTTPS

2. **Update URLs**

   ```env
   PAYMENT_BASE_URL=https://api.payment-gateway.com (production)
   BASE_URL=https://api.skillswap.com
   FRONTEND_URL=https://skillswap.com
   ```

3. **Use Production API Keys**
   - Get production API keys from payment gateway

4. **Enable Webhook Signature Verification**
   - Set PAYMENT_WEBHOOK_SECRET to production secret

5. **Monitor Payment Failures**
   - Implement error notifications
   - Log all payment attempts

6. **Backup Database**
   - Ensure regular database backups
   - Payment data is critical

## 📱 Frontend Integration

### Buy Button Implementation

```javascript
const handleBuy = async (package) => {
  const response = await axios.post("/api/payment-gateway/create", {
    amount: package.amount,
    creditsGranted: package.credits,
    paymentMethod: "bKash",
  });

  // Redirect to payment gateway
  window.location.href = response.data.paymentUrl;
};
```

### Success Page

```javascript
// Handle success callback
const status = searchParams.get("status");
if (status === "success") {
  // Show success message
  // Reload wallet balance
  // Redirect to wallet page
}
```

## 🔗 Related Documentation

- [PAYMENT_GATEWAY_ENV_GUIDE.md](./PAYMENT_GATEWAY_ENV_GUIDE.md) - Environment setup
- [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) - Implementation checklist

## 📞 Support

For issues or questions about the payment gateway:

1. Check environment variables
2. Verify database connections
3. Check payment gateway API status
4. Review logs for error messages
5. Test with curl commands

---

**Last Updated:** April 27, 2026
**Status:** ✅ Implementation Complete
