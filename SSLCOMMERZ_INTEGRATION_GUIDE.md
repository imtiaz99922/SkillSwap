# SSLCommerz Payment Gateway Integration Guide

## Overview

This document provides a complete guide to the SSLCommerz payment gateway integration for the SkillSwap platform. SSLCommerz is a leading payment gateway in South Asia that supports multiple payment methods including credit cards, debit cards, mobile banking, and more.

**Official Website**: https://sslcommerz.com/
**Developer Documentation**: https://developer.sslcommerz.com/

---

## Features Implemented

### ✅ Complete Payment Flow

- **Payment Initiation**: Secure payment session creation with SSLCommerz
- **Callback Handling**: Redirect-based payment confirmation (user redirect after payment)
- **IPN (Instant Payment Notification)**: Server-to-server payment verification (webhook)
- **Payment Status Checking**: Query payment status at any time
- **Payment History**: Track all user transactions

### ✅ Credit System

- **4 Credit Packages**:
  - **Starter**: 100 Credits for ৳500 (0.20 credits per ৳)
  - **Pro**: 500 Credits for ৳2000 (0.25 credits per ৳)
  - **Business**: 1500 Credits for ৳5000 (0.30 credits per ৳)
  - **Enterprise**: 5000 Credits for ৳15000 (0.33 credits per ৳)

- **Automatic Credit Granting**: Credits instantly added to wallet after successful payment
- **Transaction Recording**: All payments recorded with detailed metadata

### ✅ Multiple Payment Methods Supported

- 💳 Visa / Mastercard
- 🏦 Bank Transfer
- 📱 Mobile Banking (bKash, Nagad, Rocket, etc.)
- 🎯 Other payment methods available in SSLCommerz gateway

---

## Architecture

### Backend Structure

```
backend/
├── services/
│   └── sslcommerzService.js          # SSLCommerz API integration
├── routes/
│   └── sslcommerz.js                 # SSLCommerz payment routes
├── controllers/
│   └── paymentController.js          # Payment logic (existing)
├── models/
│   └── Payment.js                    # Payment schema (updated)
└── server.js                         # Main server (updated)
```

### Frontend Structure

```
client/src/
├── services/
│   └── sslcommerzApi.js              # Frontend API service
└── pages/
    ├── SSLCommerzPaymentPage.jsx     # Payment UI
    └── SSLCommerzPaymentPage.css     # Payment styling
```

---

## Backend Implementation Details

### 1. SSLCommerz Service (`backend/services/sslcommerzService.js`)

#### Key Methods

**`initiate(params)`**

- Creates a payment session with SSLCommerz
- Returns gateway URL for payment
- Parameters: `amount`, `currency`, `invoiceNumber`, `customerEmail`, `customerName`, `successUrl`, `failUrl`, `cancelUrl`

```javascript
const result = await SSLCommerzService.initiate({
  amount: 500,
  currency: "BDT",
  invoiceNumber: "SKILLSWAP-userid-timestamp",
  productName: "100 Credits Package",
  customerEmail: "user@example.com",
  customerName: "User Name",
  successUrl: "http://localhost:5000/api/sslcommerz/success",
  failUrl: "http://localhost:5000/api/sslcommerz/fail",
  cancelUrl: "http://localhost:5000/api/sslcommerz/cancel",
});
```

**`validateCallback(callbackData)`**

- Validates callback data from SSLCommerz
- Checks if payment status is VALID or APPROVED

**`queryTransactionStatus(transactionId, amount)`**

- Query transaction status from SSLCommerz API
- Used for verification and reconciliation

**`verifyIPNSignature(data, signature)`**

- Verifies IPN (Instant Payment Notification) signature using MD5 hash
- Ensures webhook data is genuine

### 2. SSLCommerz Routes (`backend/routes/sslcommerz.js`)

#### Available Endpoints

| Method | Endpoint                                | Description           | Auth |
| ------ | --------------------------------------- | --------------------- | ---- |
| GET    | `/api/sslcommerz/packages`              | Get credit packages   | ❌   |
| POST   | `/api/sslcommerz/initiate-payment`      | Start payment         | ✅   |
| POST   | `/api/sslcommerz/success`               | Success callback      | ❌   |
| POST   | `/api/sslcommerz/fail`                  | Failure callback      | ❌   |
| POST   | `/api/sslcommerz/cancel`                | Cancellation callback | ❌   |
| POST   | `/api/sslcommerz/ipn`                   | Webhook IPN           | ❌   |
| GET    | `/api/sslcommerz/payment-history`       | Payment history       | ✅   |
| GET    | `/api/sslcommerz/status/:transactionId` | Check status          | ❌   |

#### Response Examples

**Initiate Payment (POST /api/sslcommerz/initiate-payment)**

```json
{
  "success": true,
  "paymentId": "64a7b9c2d1e5f6g7h8i9j0k1",
  "invoiceId": "SKILLSWAP-userid-1234567890",
  "redirectUrl": "https://sandbox.sslcommerz.com/gwprocess/v4/...",
  "gatewayPageUrl": "https://sandbox.sslcommerz.com/gwprocess/v4/...",
  "package": {
    "id": "pro",
    "name": "Pro",
    "credits": 500,
    "amount": 2000
  }
}
```

**Success Callback**

- Redirects to: `http://localhost:5173/payment?status=success&paymentId=xxx&credits=500`
- Credits automatically added to wallet
- Payment marked as "success" in database

**Payment History (GET /api/sslcommerz/payment-history)**

```json
{
  "success": true,
  "payments": [
    {
      "_id": "...",
      "userId": "...",
      "amount": 2000,
      "creditsGranted": 500,
      "status": "success",
      "transactionId": "SKILLSWAP-...",
      "invoiceId": "SKILLSWAP-...",
      "completedAt": "2024-04-28T10:30:00Z",
      "createdAt": "2024-04-28T10:25:00Z"
    }
  ],
  "count": 1
}
```

### 3. Payment Model Updates

Updated `enum` for `paymentMethod` to include:

- `"sslcommerz"` - SSLCommerz payments
- `"stripe"` - Stripe payments
- `"demo"` - Demo mode

---

## Frontend Implementation

### 1. SSLCommerz API Service (`client/src/services/sslcommerzApi.js`)

```javascript
// Get packages
const result = await sslcommerzApi.getPackages();

// Initiate payment
const paymentData = await sslcommerzApi.initiatePayment("pro");
// Redirects to: paymentData.redirectUrl

// Get payment history
const history = await sslcommerzApi.getPaymentHistory();

// Check payment status
const status = await sslcommerzApi.checkPaymentStatus(transactionId);
```

### 2. Payment Page (`client/src/pages/SSLCommerzPaymentPage.jsx`)

**Features:**

- ✨ Beautiful, responsive UI with gradient backgrounds
- 💰 Display current wallet balance
- 📦 Package selection cards with pricing
- 🔒 Security information
- 📊 Payment history table
- 📱 Mobile-friendly design

**Key Sections:**

1. **Header** - Title and description
2. **User Wallet Info** - Current balance and total earned
3. **Payment Status** - Success/failure/warning messages
4. **Packages Grid** - 4 credit packages with pricing
5. **Payment Methods** - Accepted payment method icons
6. **How It Works** - 4-step process explanation
7. **Payment History** - Table of past transactions
8. **Security Info** - Trust and security messaging

**Route:** `/buy-credits` (requires authentication)

---

## Environment Configuration

### Required Environment Variables

Add these to your `.env` file:

```env
# SSLCommerz Credentials
SSLCOMMERZ_STORE_ID=testbox                    # From SSLCommerz developer account
SSLCOMMERZ_STORE_PASSWORD=qwerty               # Store password

# URLs for SSLCommerz Callbacks
BACKEND_URL=http://localhost:5000              # Backend URL for callbacks
FRONTEND_URL=http://localhost:5173             # Frontend URL for redirects

# Other settings
NODE_ENV=development                           # 'development' = sandbox, 'production' = live
```

### Getting SSLCommerz Credentials

1. **Create Account**:
   - Visit: https://sslcommerz.com/
   - Sign up for a merchant account

2. **Get Test Credentials**:
   - Login to: https://developer.sslcommerz.com/
   - Navigate to Integration Settings
   - Copy `Store ID` and `Store Password` for sandbox

3. **For Production**:
   - Complete verification process
   - Get live `Store ID` and `Store Password`
   - Change `NODE_ENV=production` in .env

### Testing with Demo Credentials

```env
NODE_ENV=development
SSLCOMMERZ_STORE_ID=testbox
SSLCOMMERZ_STORE_PASSWORD=qwerty
```

These are the default SSLCommerz test credentials for sandbox environment.

---

## Payment Flow Diagrams

### Complete Payment Flow

```
1. User clicks "Buy Now"
   ↓
2. Frontend: POST /api/sslcommerz/initiate-payment
   ↓
3. Backend: Create Payment record (status: pending)
   ↓
4. Backend: Call SSLCommerzService.initiate()
   ↓
5. SSLCommerz: Returns gateway URL
   ↓
6. Frontend: Redirect to SSLCommerz payment page
   ↓
7. User: Complete payment on SSLCommerz
   ↓
8. SSLCommerz: Callback to success/fail/cancel URL
   ↓
9. Backend: Process callback, update Payment status
   ↓
10. Backend: Grant credits to wallet
    ↓
11. Backend: Redirect to frontend success page
    ↓
12. User: Sees success message, wallet updated ✅
```

### Dual Verification System

```
Method 1: CALLBACK (Redirect)
├─ User completes payment
├─ SSLCommerz redirects to /api/sslcommerz/success
├─ Backend verifies and processes
└─ Credits granted immediately

Method 2: IPN (Webhook)
├─ SSLCommerz sends server-to-server notification
├─ Backend receives at /api/sslcommerz/ipn
├─ Verify IPN signature
├─ Process payment again (double-check)
└─ Credits already granted (idempotent)
```

---

## Testing Guide

### 1. Local Testing Setup

```bash
# Start backend
cd backend
npm install axios  # Add axios if not installed
npm run dev

# Start frontend
cd client
npm run dev
```

### 2. Test Payment Flow

1. **Navigate** to `http://localhost:5173/buy-credits`
2. **Select** a package (e.g., "Pro" - 500 credits)
3. **Click** "Buy Now"
4. **You'll be redirected** to SSLCommerz sandbox
5. **Use test credentials** (provided on sandbox page)
6. **Complete payment** (will always succeed in sandbox)
7. **You'll be redirected** back with success message
8. **Check wallet** - credits should be added ✅

### 3. Test Credentials (Sandbox)

SSLCommerz provides test cards on their sandbox payment page:

- **Visa**: 4000000000000002
- **Mastercard**: 5577000000000004
- **Expiry**: Any future date
- **CVV**: Any 3 digits

### 4. Monitoring Payments

```bash
# Check payment records in MongoDB
db.payments.find({ paymentMethod: "sslcommerz" })

# Monitor browser console for logs
# Monitor server logs for gateway responses
```

---

## Security Considerations

### ✅ Implemented Security Features

1. **Signature Verification**: IPN signature verified using MD5 hash
2. **Status Verification**: Payment status queried from SSLCommerz API
3. **Idempotent Processing**: Same payment won't grant credits twice
4. **Amount Verification**: Amount stored during initiation
5. **User Verification**: Payment linked to authenticated user
6. **Transaction IDs**: Unique invoice numbers prevent duplicate payments

### 🔒 Best Practices

1. **Never store card information** - SSLCommerz handles this
2. **Verify callbacks** - Always verify IPN signatures
3. **Log all transactions** - Maintain audit trail
4. **Handle edge cases** - Network failures, timeouts, etc.
5. **Use HTTPS** - In production, all URLs must be HTTPS
6. **Secure credentials** - Never commit `.env` files

---

## Troubleshooting

### Problem: "SSLCommerz credentials not configured"

**Solution**:

```env
SSLCOMMERZ_STORE_ID=testbox
SSLCOMMERZ_STORE_PASSWORD=qwerty
```

### Problem: Payment gateway returns error

**Check**:

- Store ID and password are correct
- NODE_ENV is set correctly (development vs production)
- Amount is in correct currency (BDT)
- All required fields are provided

### Problem: Credits not added after payment

**Check**:

- Payment status in MongoDB: `db.payments.findOne(...)`
- Wallet updated: `db.wallets.findOne({userId: ...})`
- Check server logs for errors
- Verify IPN was processed (check logs)

### Problem: "No payment gateway URL received"

**Solution**:

- Ensure backend can reach SSLCommerz servers
- Check firewall/network settings
- Verify API endpoint URL is correct
- Try sandbox URL if production fails

### Problem: Webhook/IPN not working

**Setup**:

1. Public HTTPS URL for backend
2. Add webhook URL to SSLCommerz dashboard:
   - `https://yourdomain.com/api/sslcommerz/ipn`
3. Test webhook from dashboard
4. Monitor server logs

---

## Production Deployment

### 1. Get Live Credentials

- Complete merchant verification with SSLCommerz
- Get live Store ID and Store Password
- Setup HTTPS for all URLs

### 2. Update Environment Variables

```env
NODE_ENV=production
SSLCOMMERZ_STORE_ID=your_live_store_id
SSLCOMMERZ_STORE_PASSWORD=your_live_store_password
BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

### 3. Update Credit Packages (Optional)

Edit `backend/routes/sslcommerz.js` to adjust:

- Credit amounts
- Prices in BDT
- Package names and descriptions

### 4. Add Webhook to SSLCommerz Dashboard

1. Login to SSLCommerz merchant dashboard
2. Go to Integration Settings → Webhooks
3. Add webhook URL: `https://api.yourdomain.com/api/sslcommerz/ipn`
4. Select payment events to monitor

### 5. Database Backup

Before going live:

```bash
# Backup MongoDB
mongodump --uri "your_connection_string" --out ./backup

# Test restoration
```

---

## API Reference

### Complete API Documentation

#### 1. Get Packages

```
GET /api/sslcommerz/packages

Response:
{
  "success": true,
  "packages": [
    { "id": "starter", "name": "Starter", "credits": 100, "amount": 500 },
    { "id": "pro", "name": "Pro", "credits": 500, "amount": 2000 },
    { "id": "business", "name": "Business", "credits": 1500, "amount": 5000 },
    { "id": "enterprise", "name": "Enterprise", "credits": 5000, "amount": 15000 }
  ],
  "currency": "BDT"
}
```

#### 2. Initiate Payment

```
POST /api/sslcommerz/initiate-payment
Authorization: Bearer {token}

Request Body:
{ "packageId": "pro" }

Response:
{
  "success": true,
  "paymentId": "64a7b9c2d1e5f6g7h8i9j0k1",
  "invoiceId": "SKILLSWAP-userid-1234567890",
  "redirectUrl": "https://sandbox.sslcommerz.com/gwprocess/v4/...",
  "package": { "id": "pro", "name": "Pro", "credits": 500, "amount": 2000 }
}
```

#### 3. Get Payment History

```
GET /api/sslcommerz/payment-history
Authorization: Bearer {token}

Response:
{
  "success": true,
  "payments": [...],
  "count": 5
}
```

#### 4. Check Payment Status

```
GET /api/sslcommerz/status/{transactionId}

Response:
{
  "success": true,
  "status": "success",
  "amount": 2000,
  "creditsGranted": 500,
  "completedAt": "2024-04-28T10:30:00Z"
}
```

---

## Monitoring & Analytics

### Database Queries

```javascript
// Total revenue by date
db.payments.aggregate([
  { $match: { status: "success", paymentMethod: "sslcommerz" } },
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      total: { $sum: "$amount" },
    },
  },
]);

// Top packages purchased
db.payments.aggregate([
  { $match: { status: "success" } },
  {
    $group: {
      _id: "$packageId",
      count: { $sum: 1 },
      revenue: { $sum: "$amount" },
    },
  },
]);

// Failed payments
db.payments.find({ status: "failed", paymentMethod: "sslcommerz" });
```

### Logging

All critical events are logged:

- Payment initiation
- Callback received
- IPN received
- Signature verification
- Status updates
- Error messages

Check logs:

```bash
# View recent logs
tail -f server.log

# Search for SSLCommerz transactions
grep "SSLCommerz\|sslcommerz" server.log
```

---

## Support & Resources

### SSLCommerz Resources

- **Documentation**: https://developer.sslcommerz.com/
- **Test Sandbox**: https://sandbox.sslcommerz.com/
- **API Playground**: https://developer.sslcommerz.com/api/
- **Support**: https://sslcommerz.com/contact/

### Our Implementation

- **Backend Service**: `/backend/services/sslcommerzService.js`
- **Backend Routes**: `/backend/routes/sslcommerz.js`
- **Frontend Service**: `/client/src/services/sslcommerzApi.js`
- **Frontend Page**: `/client/src/pages/SSLCommerzPaymentPage.jsx`

---

## Changelog

### Version 1.0 (April 28, 2024)

- ✅ SSLCommerz service implementation
- ✅ Backend routes for payment processing
- ✅ Frontend payment page UI
- ✅ Callback and IPN handling
- ✅ Credit package system
- ✅ Payment history tracking
- ✅ Security verification

---

## FAQ

**Q: Can I change credit package prices?**
A: Yes, edit `PACKAGES` array in `backend/routes/sslcommerz.js`

**Q: How long does payment take to confirm?**
A: Usually 1-2 seconds. Credits added immediately after callback/IPN.

**Q: Can users use credits right away?**
A: Yes, wallet updated instantly after payment confirmation.

**Q: What happens if payment callback fails?**
A: IPN (webhook) will process it, so credits won't be lost. IPN is more reliable.

**Q: Can I refund payments?**
A: Yes, SSLCommerz dashboard allows manual refunds. Deduct credits manually from user wallet.

**Q: How do I test webhook locally?**
A: Use ngrok to expose localhost to internet: `ngrok http 5000`

---

## Next Steps

1. ✅ Get SSLCommerz account and credentials
2. ✅ Add credentials to `.env`
3. ✅ Test payment flow locally
4. ✅ Deploy to production
5. ✅ Configure webhook in SSLCommerz dashboard
6. ✅ Monitor transactions
7. ✅ Handle edge cases

---

**Integration Completed**: April 28, 2024  
**Status**: Production Ready ✅  
**Last Updated**: April 28, 2024
