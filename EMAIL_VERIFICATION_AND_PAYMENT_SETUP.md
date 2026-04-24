# Email Verification & Payment Gateway Integration

## Overview

This document explains how to set up and use the Email Verification API and Stripe Payment Gateway integration in the SkillSwap application.

## 1. Email Verification API

### Features

- ✅ Email verification on user registration
- ✅ 24-hour token expiration
- ✅ HTML email templates
- ✅ Automatic Stripe customer creation
- ✅ Login blocked until email is verified

### Setup Instructions

#### 1.1 Gmail SMTP Configuration

To send verification emails using Gmail:

1. **Enable 2-Step Verification**
   - Go to https://myaccount.google.com/security
   - Enable 2-step verification

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select Mail and Windows Computer
   - Copy the 16-character password

3. **Update `.env` file**
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   BASE_URL=http://localhost:5173
   ```

#### Alternative: Use Other Email Services

For SendGrid, Mailgun, or other services, update the transporter in `backend/utils/emailService.js`

### API Endpoints

#### Register User (with Email Verification)

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

Response:
{
  "msg": "Registration successful! Please check your email to verify your account.",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "requiresVerification": true
}
```

#### Verify Email

```bash
GET /api/auth/verify-email?token=<verification_token>

Response:
{
  "msg": "Email verified successfully! You can now log in.",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login (with Email Verification Check)

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

Response (if email verified):
{
  "token": "jwt_token...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}

Response (if email NOT verified):
{
  "msg": "Please verify your email before logging in",
  "requiresVerification": true
}
```

### Frontend Registration Flow

1. User fills registration form
2. Clicks "Create Account"
3. Server sends verification email
4. Success message shows with email address
5. User clicks verification link in email
6. Redirects to `/verify-email` page
7. Email verified successfully
8. User can now login

### User Model Updates

```javascript
{
  name: String,
  email: String (unique),
  password: String,
  isEmailVerified: Boolean (default: false),
  emailVerificationToken: String,
  emailVerificationTokenExpires: Date,
  stripeCustomerId: String,
  createdAt: Date
}
```

---

## 2. Stripe Payment Gateway

### Features

- ✅ Secure payment processing with Stripe
- ✅ Multiple payment packages (Starter, Pro, Business, Enterprise)
- ✅ Payment intent creation and confirmation
- ✅ Webhook support for payment events
- ✅ Payment history and receipts
- ✅ Automatic credit allocation

### Setup Instructions

#### 2.1 Get Stripe Credentials

1. **Create Stripe Account**
   - Go to https://dashboard.stripe.com
   - Sign up for a free account

2. **Get API Keys**
   - Go to Dashboard → API keys
   - Copy Publishable Key and Secret Key
   - For testing, use test keys (start with `pk_test_` and `sk_test_`)

3. **Get Webhook Secret**
   - Go to Developers → Webhooks
   - Add endpoint: `http://your-domain/api/payment/webhook`
   - Copy webhook signing secret

4. **Update `.env` file**
   ```
   STRIPE_PUBLIC_KEY=pk_test_your_key_here
   STRIPE_SECRET_KEY=sk_test_your_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

#### 2.2 Stripe CLI for Local Testing (Optional)

```bash
# Download and install Stripe CLI from https://stripe.com/docs/stripe-cli

# Login to Stripe account
stripe login

# Forward webhook events to local server
stripe listen --forward-to localhost:5000/api/payment/webhook

# You'll get a webhook signing secret - add to .env
```

### API Endpoints

#### Get Payment Packages

```bash
GET /api/payment/packages

Response:
[
  { id: "starter", name: "Starter", credits: 100, amount: 9.99 },
  { id: "pro", name: "Pro", credits: 500, amount: 39.99 },
  { id: "business", name: "Business", credits: 1500, amount: 99.99 },
  { id: "enterprise", name: "Enterprise", credits: 5000, amount: 299.99 }
]
```

#### Create Payment Intent

```bash
POST /api/payment/create-payment-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "packageId": "pro"
}

Response:
{
  "clientSecret": "pi_1234567890_secret_...",
  "paymentIntentId": "pi_1234567890...",
  "amount": 39.99,
  "currency": "USD",
  "package": {
    "id": "pro",
    "name": "Pro",
    "credits": 500,
    "amount": 39.99
  }
}
```

#### Confirm Payment

```bash
POST /api/payment/confirm-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentIntentId": "pi_1234567890...",
  "packageId": "pro"
}

Response:
{
  "msg": "Successfully purchased Pro package! 500 credits added to your wallet.",
  "payment": { ... },
  "wallet": {
    "userId": "...",
    "credits": 500,
    "totalEarned": 500
  },
  "transaction": { ... }
}
```

#### Get Payment History

```bash
GET /api/payment/history
Authorization: Bearer <token>

Response:
[
  {
    "_id": "...",
    "userId": "...",
    "packageId": "pro",
    "amount": 39.99,
    "creditsGranted": 500,
    "paymentMethod": "stripe",
    "status": "Completed",
    "transactionId": "pi_1234567890...",
    "createdAt": "2026-04-23T..."
  }
]
```

#### Get Payment Receipt

```bash
GET /api/payment/:id/receipt
Authorization: Bearer <token>

Response:
{
  "id": "...",
  "date": "2026-04-23T...",
  "transactionId": "pi_1234567890...",
  "package": "Pro",
  "amount": 39.99,
  "credits": 500,
  "paymentMethod": "stripe",
  "status": "Completed"
}
```

### Frontend Payment Flow

1. User navigates to Payment page
2. Selects a package
3. Clicks "Buy Now"
4. Payment modal opens with Stripe Elements
5. User enters card details (test: 4242 4242 4242 4242)
6. Clicks "Pay"
7. Payment intent is created on backend
8. Stripe processes payment
9. Backend confirms payment
10. Credits are added to wallet
11. Success message shown
12. Payment history updated

### Test Cards

```
Visa: 4242 4242 4242 4242
Mastercard: 5555 5555 5555 4444
Amex: 3782 822463 10005

Exp: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
```

### Payment Models

#### Payment Model

```javascript
{
  userId: ObjectId,
  packageId: String,
  amount: Number,
  creditsGranted: Number,
  paymentMethod: String, // "stripe", "paypal", etc.
  status: String, // "Pending", "Completed", "Failed"
  transactionId: String, // Stripe PI ID
  createdAt: Date
}
```

#### Transaction Model

```javascript
{
  userId: ObjectId,
  type: String, // "EARN", "SPEND"
  amount: Number,
  reason: String,
  description: String,
  status: String, // "Completed", "Pending"
  createdAt: Date
}
```

---

## 3. Integration with Frontend

### Install Stripe.js in Frontend

```bash
cd client
npm install @stripe/react-stripe-js @stripe/js
```

### Update Vite Config (if needed)

The frontend already includes stripe configuration in the payment service.

### Payment Page Component

The payment page integrates with:

- `paymentApi.createPaymentIntent()` - Create payment intent
- `paymentApi.confirmPayment()` - Confirm and process payment
- Stripe Elements for card input

---

## 4. Environment Variables Summary

### Backend .env

```
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
BASE_URL=http://localhost:5173

# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Existing
JWT_SECRET=...
MONGO_URI=...
```

### Frontend .env (if needed)

```
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_API_URL=http://localhost:5000/api
```

---

## 5. Troubleshooting

### Email Not Sending

- ✓ Check EMAIL_USER and EMAIL_PASSWORD in .env
- ✓ Enable "Less secure app access" (Gmail)
- ✓ Check email service provider settings
- ✓ Check server logs for error messages

### Stripe Payment Issues

- ✓ Verify Stripe keys are correct
- ✓ Check if using test vs live keys
- ✓ Ensure webhook secret is configured
- ✓ Check network requests in browser DevTools
- ✓ Test with provided test card numbers

### Email Verification Link Not Working

- ✓ Verify BASE_URL is correct in .env
- ✓ Check token expiration (24 hours)
- ✓ Ensure token is passed correctly in query param

---

## 6. Production Checklist

- [ ] Use production Stripe keys
- [ ] Configure production email service (SendGrid, AWS SES, etc.)
- [ ] Set secure JWT_SECRET
- [ ] Update BASE_URL to production domain
- [ ] Configure CORS properly
- [ ] Set NODE_ENV=production
- [ ] Add webhook endpoint to Stripe dashboard
- [ ] Enable HTTPS
- [ ] Set up email backup/retry logic
- [ ] Implement payment error handling and retries

---

## 7. Future Enhancements

- [ ] PayPal integration
- [ ] Apple Pay / Google Pay support
- [ ] Subscription billing
- [ ] Invoice generation
- [ ] Payment refunds API
- [ ] Email templates customization
- [ ] SMS verification option
- [ ] Two-factor authentication
- [ ] Payment analytics
- [ ] Fraud detection
