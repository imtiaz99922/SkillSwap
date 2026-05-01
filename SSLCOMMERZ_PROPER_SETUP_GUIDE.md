# 🔐 SSLCommerz Proper Payment System Setup Guide

## Overview

Your SkillSwap platform now has a **production-ready SSLCommerz payment gateway** integrated. This guide explains the complete system and how to use it properly.

---

## 🎯 System Architecture

```
┌─────────────┐
│   Frontend  │ (React/Vite)
└──────┬──────┘
       │ POST /api/sslcommerz/initiate-payment
       ▼
┌──────────────────────┐
│  Backend Express     │
│  (Payment Routes)    │
└──────┬───────────────┘
       │ Creates pending payment
       │ Calls SSLCommerz API
       ▼
┌──────────────────────┐
│   SSLCommerz API     │ (Sandbox/Production)
│   (Payment Gateway)  │
└──────┬───────────────┘
       │ Returns payment page URL
       ▼
┌──────────────────────┐
│  Customer Browser    │
│  (Payment Form)      │
└──────┬───────────────┘
       │ Customer pays
       ▼
┌──────────────────────┐
│ SSLCommerz Callback  │ (POST /api/sslcommerz/success)
│ + IPN Webhook        │ (POST /api/sslcommerz/ipn)
└──────┬───────────────┘
       │ Updates payment status
       │ Grants credits to wallet
       ▼
┌──────────────────────┐
│   User Wallet        │
│ (Credits Added)      │
└──────────────────────┘
```

---

## 📋 Current Configuration

### Backend Environment Variables (`.env`)

```env
# SSLCommerz Configuration
SSLCOMMERZ_STORE_ID=testbox
SSLCOMMERZ_STORE_PASSWORD=qwerty

# For SANDBOX testing (development)
NODE_ENV=development

# Backend & Frontend URLs
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

### Available Credit Packages

| Package    | Credits | Amount (BDT) | Description       |
| ---------- | ------- | ------------ | ----------------- |
| Starter    | 100     | 500          | For beginners     |
| Pro        | 500     | 2000         | For active users  |
| Business   | 1500    | 5000         | For professionals |
| Enterprise | 5000    | 15000        | For teams         |

---

## 🚀 How to Use the Payment System

### Step 1: User Initiates Payment

The frontend calls:

```javascript
POST / api / sslcommerz / initiate - payment;
Body: {
  packageId: "pro";
}
```

Response:

```json
{
  "success": true,
  "paymentId": "650f1a2b4c8d9e1f2g3h4i5j",
  "invoiceId": "SKILLSWAP-user123-1234567890",
  "redirectUrl": "https://sandbox.sslcommerz.com/gw/v4/checkout/...",
  "package": {
    "id": "pro",
    "name": "Pro",
    "credits": 500,
    "amount": 2000
  }
}
```

### Step 2: Backend Creates Pending Payment Record

A `Payment` document is created with status: `pending`

```
{
  userId: "user123",
  packageId: "pro",
  amount: 2000,
  creditsGranted: 500,
  paymentMethod: "sslcommerz",
  invoiceId: "SKILLSWAP-user123-1234567890",
  status: "pending",
  transactionId: "SKILLSWAP-user123-1234567890"
}
```

### Step 3: Backend Calls SSLCommerz API

The system sends the payment details to SSLCommerz with:

- Store ID & Password (credentials)
- Amount & Currency (BDT)
- Customer email & phone
- Success/Fail/Cancel callback URLs
- Custom metadata (userId, creditsGranted)

### Step 4: Customer Payment

- User is redirected to SSLCommerz payment page
- Customer selects payment method (bKash, Nagad, Card, etc.)
- Payment is processed

### Step 5: SSLCommerz Callbacks

After payment, SSLCommerz sends **TWO** callbacks:

#### A. Server-Side: IPN (Instant Payment Notification)

```
POST /api/sslcommerz/ipn
Verifies signature and updates payment status
```

#### B. Client-Side: Redirect Callback

```
POST /api/sslcommerz/success (if successful)
POST /api/sslcommerz/fail (if failed)
POST /api/sslcommerz/cancel (if cancelled)
```

### Step 6: Credits Granted

When payment is confirmed:

1. Payment status is updated to `success`
2. **Wallet credits are instantly added** to user's account
3. User is redirected to frontend with success message

```javascript
Wallet Update:
- credits += 500
- totalEarned += 500
```

### Step 7: User Sees Updated Wallet

Frontend shows:

```
✅ Payment Successful!
💰 +500 Credits Added
💳 Wallet Balance: 750 credits
```

---

## 🔧 API Endpoints

### 1. Get Available Packages

```
GET /api/sslcommerz/packages
Response: { success: true, packages: [...], currency: "BDT" }
```

### 2. Initiate Payment (Protected)

```
POST /api/sslcommerz/initiate-payment
Auth: Required (JWT Token)
Body: { packageId: "pro" }
Response: { success: true, paymentId, invoiceId, redirectUrl, package }
```

### 3. Get Payment History (Protected)

```
GET /api/sslcommerz/payment-history
Auth: Required
Response: { success: true, payments: [...], count: N }
```

### 4. Check Payment Status

```
GET /api/sslcommerz/status/:transactionId
Response: { success: true, status: "success|failed", amount, creditsGranted }
```

### 5. Success Callback (Auto)

```
POST /api/sslcommerz/success
Auto-called by SSLCommerz after successful payment
```

### 6. IPN Webhook (Auto)

```
POST /api/sslcommerz/ipn
Server-to-server verification and credit granting
```

---

## 💾 Payment Flow Data Models

### Payment Record

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  packageId: String,
  amount: Number (BDT),
  creditsGranted: Number,
  paymentMethod: "sslcommerz",
  status: "pending|success|failed",
  invoiceId: String (unique),
  transactionId: String,
  completedAt: Date (only if success),
  rawResponse: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### Wallet Record

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, unique),
  credits: Number (current balance),
  totalEarned: Number (lifetime earned),
  totalSpent: Number (lifetime spent),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing the Payment System

### Option A: Sandbox Testing (Current Setup)

```env
SSLCOMMERZ_STORE_ID=testbox
SSLCOMMERZ_STORE_PASSWORD=qwerty
NODE_ENV=development
```

**Test Card Details:**

- Card Number: `4111111111111111`
- Expiry: Any future date (e.g., `12/25`)
- CVC: `123`
- Or use: bKash/Nagad test credentials from SSLCommerz docs

### Option B: Production Setup

1. Get live credentials from https://developer.sslcommerz.com/
2. Update `.env`:

```env
SSLCOMMERZ_STORE_ID=your_live_store_id
SSLCOMMERZ_STORE_PASSWORD=your_live_store_password
NODE_ENV=production
```

3. Update URLs to use HTTPS

---

## 📊 Payment Status Lifecycle

```
pending → (user completes payment) → success ✅
       → (user cancels)          → cancelled ⚠️
       → (payment fails)         → failed ❌
```

### Status Definitions

| Status      | Meaning                                | Action        |
| ----------- | -------------------------------------- | ------------- |
| `pending`   | Payment initiated, awaiting completion | Monitoring    |
| `success`   | Payment confirmed, credits granted     | Complete      |
| `failed`    | Payment rejected or declined           | Retry allowed |
| `cancelled` | User cancelled payment                 | Can retry     |

---

## 🔐 Security Features Implemented

✅ **Transaction Verification**

- Validates SSLCommerz callback signature
- Matches invoice amount with stored amount
- Prevents double-processing (idempotent)

✅ **User Protection**

- JWT authentication required for payment initiation
- User can only view their own payment history
- Credits only granted after verified success

✅ **Error Handling**

- Detailed logging for debugging
- Graceful failure handling
- Automatic retry mechanisms

✅ **Data Integrity**

- Unique invoice IDs prevent duplicates
- Payment records are immutable once success
- Wallet balance is atomic

---

## 🐛 Troubleshooting

### Issue: "Payment gateway error"

**Solution:**

- Check `.env` file has correct STORE_ID & STORE_PASSWORD
- Verify BACKEND_URL & FRONTEND_URL are correct
- Ensure backend is running on port 5000

### Issue: "Credits not granted after payment"

**Solution:**

- Check backend logs for IPN webhook errors
- Verify Wallet record exists for user
- Check Payment record shows status: "success"

### Issue: "Invalid signature" IPN error

**Solution:**

- Verify SSLCommerz credentials are correct
- Check that callback URLs are publicly accessible
- Ensure request body is not modified

### Issue: "Redirect URL not working"

**Solution:**

- Verify FRONTEND_URL in `.env` is correct
- Check CORS settings in backend
- Ensure frontend payment page exists

---

## 📈 Production Deployment Checklist

- [ ] Update `.env` with production credentials
- [ ] Set `NODE_ENV=production`
- [ ] Update `BACKEND_URL` to production domain (HTTPS)
- [ ] Update `FRONTEND_URL` to production domain (HTTPS)
- [ ] Set up MongoDB backup strategy
- [ ] Enable SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up payment monitoring/alerts
- [ ] Test with real payments
- [ ] Enable payment logging/audits
- [ ] Set up customer support process
- [ ] Create payment reconciliation reports

---

## 📞 Support Resources

- **SSLCommerz Documentation:** https://developer.sslcommerz.com/
- **API Reference:** https://developer.sslcommerz.com/doc/
- **Sandbox Testing:** Use credentials above
- **Get Live Credentials:** https://developer.sslcommerz.com/registration/

---

## ✅ Verification Checklist

Your system is now production-ready with:

✅ **Full Payment Processing**

- Initiate payment with any package
- Customer payment page integration
- Automatic credit granting

✅ **Complete Callbacks**

- IPN webhook for server verification
- Redirect callbacks for user experience
- Error handling for failed payments

✅ **Secure Transactions**

- Payment signature verification
- Duplicate prevention
- User authentication

✅ **Proper Data Models**

- Payment records with full history
- User wallet with credit tracking
- Transaction logging

---

## 🎉 Next Steps

1. **Test Payment Flow:**
   - Go to wallet page
   - Select a package
   - Complete a test payment
   - Verify credits are added

2. **Monitor in Production:**
   - Check backend logs for payment events
   - Track payment history in database
   - Monitor wallet balance changes

3. **Customize (Optional):**
   - Add more packages
   - Adjust prices for BDT market
   - Add payment method filters
   - Create referral bonuses

---

**Your SSLCommerz payment system is now properly configured and ready for production use! 🚀**
