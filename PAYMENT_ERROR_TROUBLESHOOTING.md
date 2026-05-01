# 🔧 Payment Error Troubleshooting - MissingTransactionId

## ❌ Problem

When making a payment, you get error: `MissingTransactionId` and the page shows:

```
localhost:5177/payment?status=failed&error=MissingTransactionId
```

---

## ✅ Fixes Applied

### Fix #1: Frontend URL Port (Already Fixed)

**Problem:** `.env` was pointing to `localhost:5177` but frontend runs on `localhost:5174`

**Fix Applied:**

```env
# OLD: FRONTEND_URL=http://localhost:5177
# NEW: FRONTEND_URL=http://localhost:5174
```

### Fix #2: Transaction ID Matching (Already Fixed)

**Problem:** Payment record wasn't storing transactionId, so callback couldn't find it

**Fix Applied:**

```javascript
// Added to payment creation:
transactionId: invoiceNumber,  // ✅ Now matches callback tran_id
```

---

## 🚀 How to Test After Fixes

### Step 1: Restart Backend

Close your backend terminal and start fresh:

```bash
cd backend
npm run dev
```

**Expected Log Output:**

```
✅ MongoDB connected
🚀 Server running on port 5000
✅ SSLCommerz payment gateway (ONLY)
```

### Step 2: Check Configuration

Verify `.env` has correct port:

```bash
# Open: backend/.env
# Look for: FRONTEND_URL=http://localhost:5174
# If not, update it now
```

### Step 3: Restart Frontend (if needed)

If frontend not running on 5174:

```bash
cd client
npm run dev
```

Check terminal output for port:

```
➜ Local: http://localhost:5174/
```

### Step 4: Test Payment Again

1. Go to: http://localhost:5174
2. Login
3. Go to Wallet → Buy Credits
4. Click "Buy Now" on a package
5. You should now be redirected to SSLCommerz payment form

### Step 5: Complete Test Payment

1. On SSLCommerz form, select payment method
2. If using **bKash/Nagad:** Use test credentials from SSLCommerz
3. If using **Card:**
   - Card: `4111111111111111`
   - Expiry: `12/25`
   - CVC: `123`

### Step 6: Monitor Backend Logs

While paying, watch backend console for:

**Success Flow:**

```
📝 Payment record created (pending): 650f...
✅ SSLCommerz payment session created: SKILLSWAP-...
📤 Sending SSLCommerz request...
✅ SSLCommerz response: { status: "VALID", GatewayPageURL: "..." }
📨 SSLCommerz success callback received: { tran_id: "SKILLSWAP-...", ... }
✅ Payment marked successful
✅ Credits granted: +500
```

**Error Flow (Debugging):**

```
❌ Missing transaction ID in success callback
📧 Request body: { ... }   ← This shows what SSLCommerz sent
```

---

## 🔍 Debug Endpoint (For Verification)

### Check Recent Payments

```bash
curl http://localhost:5000/api/sslcommerz/debug/payments
```

**Expected Response:**

```json
{
  "success": true,
  "count": 5,
  "payments": [
    {
      "_id": "650f1a...",
      "invoiceId": "SKILLSWAP-user123-1234567890",
      "transactionId": "SKILLSWAP-user123-1234567890",
      "status": "pending|success|failed",
      "amount": 2000,
      "creditsGranted": 500,
      "createdAt": "2024-..."
    }
  ]
}
```

**Check for:**

- ✅ `invoiceId` and `transactionId` should match
- ✅ `status` should change from "pending" to "success" after payment
- ✅ `createdAt` should show recent timestamp

---

## 🎯 Complete Payment Test Scenario

### Scenario 1: Using Test Card (Recommended for Quick Testing)

**Step 1: Initiate Payment**

```
Backend logs:
📝 Payment record created (pending): 650f1a2b4c8d
   invoiceId: SKILLSWAP-user123-1234567890
   transactionId: SKILLSWAP-user123-1234567890
```

**Step 2: Redirect to Gateway**

```
✅ You see SSLCommerz payment form
```

**Step 3: Enter Test Card**

```
Card Number: 4111111111111111
Expiry: 12/25
CVC: 123
Click: Pay Now
```

**Step 4: Confirm Payment**

```
Backend logs:
📨 SSLCommerz success callback received: {
  tran_id: "SKILLSWAP-user123-1234567890",
  status: "VALID",
  amount: "2000",
  ...
}
✅ Payment marked successful: 650f1a2b4c8d
✅ Credits granted: +500 to user
```

**Step 5: See Success**

```
Frontend shows:
✅ Payment Successful!
💰 500 Credits Added
💳 New Balance: 500 Credits
```

---

## ❓ Still Getting Error?

### Error: Still MissingTransactionId?

**Check #1: Did you restart backend?**

```bash
# Kill old backend (Ctrl+C in terminal)
cd backend
npm run dev
```

**Check #2: Is transactionId in database?**

```bash
# Use debug endpoint:
curl http://localhost:5000/api/sslcommerz/debug/payments

# Look for payments with invoiceId and transactionId
```

**Check #3: Check backend logs for full error**

```
Watch for: "❌ Missing transaction ID in success callback"
Look at next line: "📧 Request body: { ... }"
This shows what SSLCommerz actually sent
```

### Error: "Payment record not found"?

**This means:**

- SSLCommerz sent a transaction ID
- But no payment record matches it

**Fix:**

1. Check payment was created: `curl http://localhost:5000/api/sslcommerz/debug/payments`
2. Compare `tran_id` from callback with `transactionId` in payment record
3. They should match exactly

### Error: "ValidationFailed"?

**This means:**

- Payment signature verification failed
- Check your SSLCommerz credentials in `.env`

```env
SSLCOMMERZ_STORE_ID=testbox
SSLCOMMERZ_STORE_PASSWORD=qwerty
```

---

## ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5174 (not 5177)
- [ ] `.env` has `FRONTEND_URL=http://localhost:5174`
- [ ] `.env` has correct SSLCommerz credentials
- [ ] Can see SSLCommerz payment form after clicking "Buy"
- [ ] Backend logs show payment initiation
- [ ] Can complete test payment
- [ ] Backend logs show success callback
- [ ] See success page on frontend
- [ ] Wallet balance updated

---

## 🎯 What Happens Now (Complete Flow)

### When You Click "Buy Now":

```
Frontend:
  POST /api/sslcommerz/initiate-payment { packageId: "pro" }
    ↓
Backend:
  ✅ Create Payment record with:
     - invoiceId: SKILLSWAP-user-timestamp
     - transactionId: SKILLSWAP-user-timestamp
     - status: pending
  ✅ Call SSLCommerz API
  ✅ Return gatewayPageUrl
    ↓
Frontend:
  Redirect to SSLCommerz payment form
    ↓
SSLCommerz:
  Customer enters payment details
  Processes payment
    ↓
SSLCommerz Callback:
  POST /api/sslcommerz/success
  Body: { tran_id: "SKILLSWAP-...", status: "VALID", ... }
    ↓
Backend:
  ✅ Find payment by transactionId
  ✅ Verify signature ✓
  ✅ Update status → "success"
  ✅ Add credits to wallet
  ✅ Redirect to frontend success page
    ↓
Frontend:
  Show: ✅ Payment Successful! +500 Credits
    ↓
You can now use credits immediately!
```

---

## 📞 Quick Commands

### Restart Everything

```bash
# Terminal 1: Stop backend (Ctrl+C)
cd backend
npm run dev

# Terminal 2: Stop frontend (Ctrl+C)
cd client
npm run dev

# Browser: Refresh
http://localhost:5174
```

### Check Payment Status

```bash
# Check last 20 payments
curl http://localhost:5000/api/sslcommerz/debug/payments
```

### View Logs

```bash
# Backend logs show in terminal running: npm run dev
# Frontend logs show in browser console (F12)
```

---

## 🚀 Now Try Payment Again!

After these fixes:

1. Restart backend
2. Go to http://localhost:5174
3. Click Wallet → Buy Credits
4. Complete payment
5. ✅ Should work now!

**If still having issues, check backend logs carefully for the actual error message.**

---

**Last Updated:** April 30, 2026
**Fixes Applied:** Port mismatch + transactionId matching
