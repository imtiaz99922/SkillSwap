# Email Verification & Payment Gateway - Quick Start Guide

## ⚡ Quick Setup (5 minutes)

### 1. Configure Gmail SMTP (Email Verification)

```bash
# .env file - Add these lines:
EMAIL_SERVICE=gmail
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
BASE_URL=http://localhost:5173
```

Get app password from: https://myaccount.google.com/apppasswords

### 2. Configure Stripe Keys (Payment Gateway)

```bash
# .env file - Add these lines:
STRIPE_PUBLIC_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

Get keys from: https://dashboard.stripe.com/apikeys

### 3. Restart Servers

```bash
# Kill and restart both servers
npm run dev (in both backend and client)
```

---

## 🧪 Test Email Verification

1. Go to http://localhost:5173/register
2. Fill form with test data:
   - Name: Test User
   - Email: test@example.com
   - Password: 123456
3. Click "Create Account"
4. See success message: "Check your email to verify"
5. Check your email inbox for verification link
6. Click the link
7. See "Email verified successfully!"
8. Go to http://localhost:5173/login
9. Try login - it should work now

### Test with Fake Email (Development Only)

To see emails without real SMTP:

- Use https://mailtrap.io (free email sandbox)
- Or use temporary email: https://tempmail.com

---

## 💳 Test Stripe Payments

### Option A: Stripe Dashboard (Easiest)

1. Go to http://localhost:5173/payment
2. Click "Buy Now" on any package
3. Enter test card: `4242 4242 4242 4242`
4. Exp: `12/25` CVC: `123`
5. See "Payment successful"
6. Check payment history

### Option B: Stripe CLI (Advanced)

```bash
# Download from https://stripe.com/docs/stripe-cli
# Then run:
stripe login
stripe listen --forward-to localhost:5000/api/payment/webhook

# Copy webhook secret to .env
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 📋 Test Cards

**Success Cards:**

- Visa: `4242 4242 4242 4242`
- Mastercard: `5555 5555 5555 4444`
- Amex: `3782 822463 10005`

**Failure Cards:**

- Decline: `4000 0000 0000 0002`
- Expired: `4000 0000 0000 0069`

All use: Exp `12/25`, CVC `123`

---

## 📊 Database Changes

### New User Fields

```javascript
isEmailVerified: false; // Initially false
emailVerificationToken: "..."; // 24-hour token
emailVerificationTokenExpires: Date; // Token expiry
stripeCustomerId: "cus_..."; // Stripe customer ID
```

### New Collections (Unchanged)

- Payment (existing, no changes)
- Transaction (existing, no changes)
- Wallet (existing, no changes)

---

## 🔗 API Reference

### Email Verification

```
POST /api/auth/register
GET /api/auth/verify-email?token=TOKEN
POST /api/auth/login (now checks isEmailVerified)
```

### Payments

```
POST /api/payment/create-payment-intent
POST /api/payment/confirm-payment
GET /api/payment/packages
GET /api/payment/history
GET /api/payment/:id/receipt
```

---

## ⚠️ Common Issues & Fixes

### Issue: Email not sending

**Solution:**

1. Check EMAIL_USER and EMAIL_PASSWORD in .env
2. Verify app password (not regular password)
3. Check email service is "gmail"
4. Check server logs for errors

### Issue: Stripe payment fails

**Solution:**

1. Verify STRIPE*SECRET_KEY starts with `sk_test*`
2. Check payment intent creation logs
3. Use test cards from above list
4. Verify BASE_URL in .env is correct

### Issue: "Email verified successfully" but still can't login

**Solution:**

1. Clear browser cache/cookies
2. Check database: `db.users.findOne({email: "..."})` should have `isEmailVerified: true`
3. Restart backend server

### Issue: Stripe keys appear but payment fails

**Solution:**

1. Make sure you're using TEST keys (not live)
2. Verify webhook secret matches .env
3. Check if Stripe CLI is running (for webhooks)
4. Test with `4242 4242 4242 4242` card

---

## 📁 Files Modified/Created

**Backend:**

- ✅ `/backend/models/User.js` - Added email verification fields
- ✅ `/backend/routes/auth.js` - Updated register, login, added verify-email
- ✅ `/backend/routes/payment.js` - Added Stripe integration
- ✅ `/backend/utils/emailService.js` - NEW - Email sending service
- ✅ `/backend/.env` - Updated with new variables

**Frontend:**

- ✅ `/client/src/pages/Register.jsx` - Updated with email verification flow
- ✅ `/client/src/pages/Login.jsx` - Added email verification check
- ✅ `/client/src/App.jsx` - Added /verify-email route
- ✅ `/client/src/features/auth/pages/EmailVerificationPage.jsx` - NEW
- ✅ `/client/src/features/auth/services/authApi.js` - NEW
- ✅ `/client/src/features/payment/services/paymentApi.js` - Added Stripe methods

---

## ✅ Verification Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] Gmail/Email credentials in .env
- [ ] Stripe test keys in .env
- [ ] Can register with email
- [ ] Can receive verification email
- [ ] Can verify email via link
- [ ] Cannot login without verification
- [ ] Can login after verification
- [ ] Payment page loads correctly
- [ ] Can create Stripe payment intent
- [ ] Test payment succeeds with test card
- [ ] Credits added to wallet after payment
- [ ] Payment history shows transaction

---

## 🚀 Next Steps

1. **Test locally** with the steps above
2. **Read full guide** at `EMAIL_VERIFICATION_AND_PAYMENT_SETUP.md`
3. **Integrate payment UI** into PaymentPage component
4. **Set up webhooks** for production (using Stripe CLI locally or ngrok)
5. **Add retry logic** for failed payments
6. **Monitor logs** and set up alerting

---

## 📞 Support

For issues, check:

1. Backend logs: `npm run dev` output
2. Browser console: F12 → Console tab
3. Network tab: F12 → Network tab
4. Email provider logs (Gmail, SendGrid, etc.)
5. Stripe dashboard logs
