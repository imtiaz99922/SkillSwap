# ======================================

# Payment Gateway Configuration Guide

# ======================================

# This file documents all required environment variables for the payment gateway system

# Copy these variables to your .env file and fill in the values

# ======================================

# 1. PAYMENT GATEWAY API

# ======================================

# Choose your payment gateway provider

# For bKash/Nagad via Aggregator (Recommended for Bangladesh)

PAYMENT_BASE_URL=https://sandbox.payment-aggregator.com
PAYMENT_API_KEY=your_api_key_here
PAYMENT_WEBHOOK_SECRET=your_webhook_secret_here

# Alternative: For real bKash direct integration

# BKASH_APP_KEY=your_app_key

# BKASH_APP_SECRET=your_app_secret

# BKASH_USERNAME=your_username

# BKASH_PASSWORD=your_password

# BKASH_SANDBOX_MODE=true (set to false for production)

# ======================================

# 2. SERVER CONFIGURATION

# ======================================

BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173

# Port the Express server runs on

PORT=5000

# ======================================

# 3. DATABASE

# ======================================

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skillswap

# ======================================

# 4. STRIPE (Legacy - Optional)

# ======================================

# Only needed if you want to support Stripe as a payment method

STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# ======================================

# 5. JWT AUTHENTICATION

# ======================================

JWT_SECRET=your_super_secret_jwt_key

# ======================================

# 6. EMAIL (for payment notifications)

# ======================================

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@skillswap.com

# ======================================

# 7. CORS

# ======================================

CLIENT_ORIGIN=http://localhost:5173

# ======================================

# PAYMENT FLOW ARCHITECTURE

# ======================================

#

# 1. User clicks "Buy Credits" button

# 2. Frontend calls POST /api/payment-gateway/create

# 3. Backend creates Payment record (status: pending)

# 4. Backend calls payment gateway to create payment

# 5. Gateway returns payment URL

# 6. Frontend redirects user to payment gateway

#

# Payment Gateway:

# - User enters payment details

# - Gateway processes payment

#

# 7. Gateway redirects to GET /api/payment-gateway/callback?paymentID=xxx&status=success

# 8. Backend finalizes payment (updates to success)

# 9. Backend grants credits to user

# 10. Backend redirects to frontend success page

#

# Also: Gateway sends webhook to POST /api/payment-gateway/webhook (server-to-server)

# This is the MOST RELIABLE confirmation method

#

# ======================================

# TESTING FLOW

# ======================================

#

# Local Testing:

# 1. Set PAYMENT_BASE_URL to sandbox URL (provided by gateway)

# 2. Use test API keys provided by gateway

# 3. Gateway usually provides test card numbers

#

# Test Flow:

# - Click "Buy Credits"

# - Enter test card: 4111 1111 1111 1111 (example)

# - Expiry: Any future date

# - CVV: 123 (example)

# - Click Pay

# - Check Database:

# - Payment.status should be "success"

# - Wallet.creditsBalance should be increased

#

# ======================================

# PRODUCTION CHECKLIST

# ======================================

#

# ✅ Use HTTPS (not HTTP)

# ✅ Set PAYMENT_BASE_URL to production URL

# ✅ Use production API keys

# ✅ Verify webhook signatures (PAYMENT_WEBHOOK_SECRET)

# ✅ Set NODE_ENV=production

# ✅ Implement logging/monitoring

# ✅ Add rate limiting on payment endpoints

# ✅ Set up error notifications

# ✅ Test full payment flow end-to-end

# ✅ Backup database regularly

# ✅ Monitor for duplicate transactions

#

# ======================================

# SUPPORTED PAYMENT METHODS

# ======================================

#

# Via Aggregator:

# - bKash

# - Nagad

# - Credit/Debit Card

#

# Via Stripe:

# - Credit Card

# - Apple Pay

# - Google Pay

#

# ======================================

# SECURITY BEST PRACTICES

# ======================================

#

# 1. Never store payment card data (use gateway's hosted solution)

# 2. Always validate webhook signatures

# 3. Verify payments with gateway before granting credits

# 4. Implement idempotency to prevent duplicate credits

# 5. Use HTTPS for all communication

# 6. Keep API keys in environment variables (NEVER in code)

# 7. Implement rate limiting on payment endpoints

# 8. Add audit logging for all payments

# 9. Monitor for unusual payment patterns

# 10. Regular security audits

#

# ======================================

# API ENDPOINTS

# ======================================

#

# Payment Creation:

# POST /api/payment-gateway/create

# Body: { amount, creditsGranted, paymentMethod, metadata }

# Response: { paymentUrl, paymentId, invoiceId }

#

# Get Payment Status:

# GET /api/payment-gateway/status/:paymentId

#

# Get Payment History:

# GET /api/payment-gateway/history/:userId

#

# Payment Callback (from gateway):

# GET /api/payment-gateway/callback?paymentID=xxx&status=success

#

# Webhook (from gateway):

# POST /api/payment-gateway/webhook

# Headers: X-Signature: <webhook_signature>

# Body: { paymentID, status, ... }

#

# ======================================

# DATABASE MODELS

# ======================================

#

# Payment:

# - userId: ObjectId (ref: User)

# - amount: Number

# - creditsGranted: Number

# - paymentMethod: String (bKash/Nagad/Stripe)

# - status: String (pending/success/failed)

# - paymentId: String (gateway payment ID)

# - invoiceId: String (unique invoice number)

# - transactionId: String (gateway transaction ID)

# - rawResponse: Object (gateway response)

# - metadata: Object (custom data)

# - createdAt: Date

# - completedAt: Date

#

# Wallet:

# - userId: ObjectId (ref: User)

# - creditsBalance: Number

# - totalCreditsEarned: Number

# - totalCreditsSpent: Number

#

# UserSkill:

# - userId: ObjectId (ref: User)

# - skillId: ObjectId (ref: Skill)

# - paymentId: ObjectId (ref: Payment)

# - accessLevel: String

# - purchasedAt: Date

# - expiresAt: Date (optional)

#
