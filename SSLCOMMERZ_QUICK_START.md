# SSLCommerz Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Environment Setup

Add to `.env`:

```env
SSLCOMMERZ_STORE_ID=testbox
SSLCOMMERZ_STORE_PASSWORD=qwerty
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Step 2: Install Dependencies

```bash
cd backend
npm install axios  # Add if not installed
```

### Step 3: Start Servers

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

### Step 4: Test Payment

1. Go to `http://localhost:5173/buy-credits`
2. Select a package
3. Click "Buy Now"
4. Use SSLCommerz test cards (shown on payment page)
5. Complete payment ✅
6. See success message and updated wallet

---

## 📋 Available Credit Packages

| Package           | Credits | Price (BDT) | Per Taka | Best For         |
| ----------------- | ------- | ----------- | -------- | ---------------- |
| 🌟 **Starter**    | 100     | ৳500        | 0.20     | First time       |
| 💎 **Pro**        | 500     | ৳2000       | 0.25     | Regular users    |
| 🔥 **Business**   | 1500    | ৳5000       | 0.30     | Serious learners |
| ⭐ **Enterprise** | 5000    | ৳15000      | 0.33     | Power users      |

---

## 🔗 Payment Routes

| Route                              | Method | Auth | Purpose        |
| ---------------------------------- | ------ | ---- | -------------- |
| `/api/sslcommerz/packages`         | GET    | ❌   | Get packages   |
| `/api/sslcommerz/initiate-payment` | POST   | ✅   | Start payment  |
| `/api/sslcommerz/success`          | POST   | ❌   | Handle success |
| `/api/sslcommerz/fail`             | POST   | ❌   | Handle failure |
| `/api/sslcommerz/cancel`           | POST   | ❌   | Handle cancel  |
| `/api/sslcommerz/ipn`              | POST   | ❌   | Webhook        |
| `/api/sslcommerz/payment-history`  | GET    | ✅   | User's history |
| `/api/sslcommerz/status/:id`       | GET    | ❌   | Check status   |

---

## 💳 Test Card Numbers (Sandbox)

Use these with any future expiry date and any CVV:

- **Visa**: 4000000000000002
- **Mastercard**: 5577000000000004
- **Bank Transfer**: Available in sandbox

---

## 📊 Payment Database Schema

```javascript
Payment {
  _id: ObjectId,
  userId: ObjectId,
  amount: Number,           // ৳ BDT
  creditsGranted: Number,   // Credits count
  paymentMethod: "sslcommerz",
  status: "success|pending|failed",
  transactionId: String,    // SKILLSWAP-userid-timestamp
  invoiceId: String,        // Unique invoice number
  completedAt: Date,
  rawResponse: Object,      // SSLCommerz response
  metadata: Object,         // Custom data
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 Key Features

✅ **Automatic Credit Granting** - Credits added instantly  
✅ **Dual Verification** - Both callback + webhook  
✅ **Payment History** - Track all transactions  
✅ **Beautiful UI** - Modern, responsive design  
✅ **Security** - Signature verification, idempotent processing  
✅ **Multiple Methods** - Cards, bank transfer, mobile banking  
✅ **Test Mode** - Full sandbox environment

---

## 🔒 Security Checklist

- ✅ Environment variables in `.env` (not committed)
- ✅ IPN signature verification enabled
- ✅ Status verified from gateway
- ✅ Amount validated during initiation
- ✅ User authentication required for payment
- ✅ Webhook endpoint ready for production
- ✅ Error handling for network issues
- ✅ Idempotent credit granting

---

## 🐛 Troubleshooting

**Payment not processing?**

- Check `.env` variables
- Verify backend is running
- Check browser console for errors
- Monitor server logs for gateway responses

**Credits not added?**

- Verify payment status in database
- Check wallet record exists
- Monitor server logs for credit grant logs

**Test cards not working?**

- Use cards provided above
- Ensure sandbox mode (NODE_ENV=development)
- Check SSLCommerz connection

---

## 📱 Frontend Routes

- `/buy-credits` - Main payment page (protected)
- Payment callback handled automatically
- Success/failure messages shown in UI

---

## 🚢 Go Live Checklist

- [ ] Get live SSLCommerz credentials
- [ ] Update `.env` with production credentials
- [ ] Set `NODE_ENV=production`
- [ ] Update `BACKEND_URL` to production domain
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Enable HTTPS for all URLs
- [ ] Setup webhook in SSLCommerz dashboard
- [ ] Test with real payment
- [ ] Monitor first transactions
- [ ] Backup database regularly

---

## 📞 Support

- **SSLCommerz Docs**: https://developer.sslcommerz.com/
- **Backend Service**: `backend/services/sslcommerzService.js`
- **Frontend Page**: `client/src/pages/SSLCommerzPaymentPage.jsx`

---

**Status**: ✅ Ready to Use  
**Last Updated**: April 28, 2024  
**Tested**: Sandbox Environment
