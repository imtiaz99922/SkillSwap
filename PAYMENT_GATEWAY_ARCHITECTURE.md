# Payment Gateway Architecture & Deployment Checklist

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SkillSwap Frontend                         │
│                    (React @ localhost:5173)                       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Wallet Page Component                        │   │
│  │  - Package Selection                                      │   │
│  │  - Buy Button Handler                                    │   │
│  │  - Success/Error Display                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────┬──────────────────────────────────────────┘
                      │
                      │ HTTP POST
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SkillSwap Backend                              │
│                  (Express @ localhost:5000)                       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Payment Gateway Routes                            │   │
│  │  POST   /create          → createPayment()               │   │
│  │  GET    /callback        → paymentCallback()             │   │
│  │  POST   /webhook         → paymentWebhook()              │   │
│  │  GET    /status/:id      → getPaymentStatus()            │   │
│  │  GET    /history/:userId → getUserPayments()             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                      │                                            │
│  ┌──────────────────┴──────────────────────────────────────┐   │
│  │        Payment Service Layer                             │   │
│  │  - createPaymentGateway()                               │   │
│  │  - verifyPaymentGateway()                               │   │
│  │  - verifyWebhookSignature()                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                      │                                            │
│  ┌──────────────────┴──────────────────────────────────────┐   │
│  │        Database Layer                                    │   │
│  │  - Payment Model (status, amount, paymentId)            │   │
│  │  - Wallet Model (creditsBalance, totalEarned)           │   │
│  │  - UserSkill Model (access tracking)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────┬──────────────────────────┬─────────────────────────┘
              │                          │
              │ HTTP Request             │ Webhook
              │ (Payment Creation)       │ (Confirmation)
              ▼                          ▼
┌──────────────────────────────────────────────────────────────────┐
│           Payment Gateway (bKash/Nagad via Aggregator)            │
│                                                                   │
│  1. Receive payment creation request                             │
│  2. Generate payment URL                                         │
│  3. Return payment URL to backend                                │
│                                                                   │
│  [User redirects to this URL]                                    │
│                                                                   │
│  4. User enters payment details                                  │
│  5. Process payment                                              │
│  6. Generate callback to our callback endpoint                   │
│  7. Send webhook to our webhook endpoint                         │
└──────────────────────────────────────────────────────────────────┘
```

## 🔄 Detailed Payment Flow

```
STEP 1: Payment Initiation
┌─────────────────────────────────────────────────────────────────┐
│ Frontend                      Backend          Gateway           │
│                                                                   │
│ Click "Buy"                                                      │
│    │                                                             │
│    ├─POST /create──────────>                                   │
│    │                         │                                   │
│    │                         ├─Check user & amount               │
│    │                         ├─Generate invoiceId                │
│    │                         ├─Create Payment (pending)          │
│    │                         │                                   │
│    │                         ├─Call gateway API────────────────>│
│    │                         │                                   │
│    │                         │  <─────payment_url────────────────│
│    │                         │                                   │
│    │<─response with URL──────┤                                   │
│    │                                                             │
│    └─window.location.href────────────────────────────────────────>│
│          (redirect)                                              │
└─────────────────────────────────────────────────────────────────┘

STEP 2: Payment Processing (On Gateway)
┌─────────────────────────────────────────────────────────────────┐
│                        Gateway                                   │
│                                                                   │
│ User submits payment details                                    │
│ Gateway processes payment                                       │
│ Payment confirmation sent to:                                   │
│   1. Callback URL (user redirect)                               │
│   2. Webhook URL (server notification)                          │
└─────────────────────────────────────────────────────────────────┘

STEP 3: Callback Processing (User Redirect)
┌─────────────────────────────────────────────────────────────────┐
│ Gateway                    Backend                  Frontend     │
│                                                                   │
│ Redirect to callback URL                                        │
│    │                                                             │
│    ├─GET /callback?paymentID=xxx&status=success────────────────>│
│    │                                                 │           │
│    │                                                 │           │
│    │                                     ├─Verify payment       │
│    │                                     ├─Update Payment       │
│    │                                     ├─Grant credits        │
│    │                                     ├─Update Wallet        │
│    │                                     │                      │
│    │<────────Redirect to /success─────────┤                     │
│    │                                                 │           │
│    └─────────────────────────────────────────────────>           │
│                                         (User sees success page) │
└─────────────────────────────────────────────────────────────────┘

STEP 4: Webhook Confirmation (Most Reliable - Server to Server)
┌─────────────────────────────────────────────────────────────────┐
│ Gateway                    Backend                              │
│                                                                   │
│ Send webhook notification                                       │
│    │                                                             │
│    ├─POST /webhook────────────────────────────────────────────>│
│    │   Headers: X-Signature                                    │
│    │   Body: { paymentID, status, ... }                        │
│    │                        │                                   │
│    │                        ├─Verify signature                 │
│    │                        ├─Find Payment record              │
│    │                        ├─Check idempotency (skip if done) │
│    │                        ├─Verify with gateway API          │
│    │                        ├─Grant credits                    │
│    │                        │                                   │
│    │<───────────OK (200)────┤                                   │
│    │                                                             │
│    (Webhook processed successfully)                             │
└─────────────────────────────────────────────────────────────────┘
```

## ✅ Testing Checklist

### Pre-Deployment Testing

- [ ] **Setup**
  - [ ] All environment variables configured
  - [ ] Database connection working
  - [ ] Payment gateway sandbox account active
  - [ ] Sandbox credentials obtained

- [ ] **Backend Tests**
  - [ ] Payment creation endpoint works
  - [ ] Payment status endpoint works
  - [ ] Payment history endpoint works
  - [ ] Callback endpoint responds
  - [ ] Webhook endpoint responds
  - [ ] Error handling for invalid inputs
  - [ ] Database records created correctly

- [ ] **Frontend Tests**
  - [ ] Wallet page loads
  - [ ] Packages display correctly
  - [ ] Buy button triggers payment
  - [ ] Redirect to gateway works
  - [ ] Success page displays after payment
  - [ ] Error page displays on failure
  - [ ] Payment history displays
  - [ ] Credit balance updates

- [ ] **Integration Tests**
  - [ ] Full payment flow works (sandbox)
  - [ ] Callback received and processed
  - [ ] Webhook received and processed
  - [ ] Credits granted after payment
  - [ ] Wallet balance updated
  - [ ] Payment record created with correct status
  - [ ] No duplicate credits granted

- [ ] **Security Tests**
  - [ ] Webhook signature validation works
  - [ ] Invalid signatures rejected
  - [ ] API key not exposed in code
  - [ ] Webhook secret not exposed in code
  - [ ] No sensitive data in logs
  - [ ] HTTPS enforced in production

- [ ] **Error Scenarios**
  - [ ] Payment timeout handled
  - [ ] Network error handled
  - [ ] Invalid amount rejected
  - [ ] Duplicate payment detected
  - [ ] User not found handled
  - [ ] Gateway unreachable handled
  - [ ] Webhook retry handled

### Sandbox Testing Commands

```bash
# Test 1: Create payment
curl -X POST http://localhost:5000/api/payment-gateway/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 99,
    "creditsGranted": 100,
    "paymentMethod": "bKash"
  }'

# Test 2: Get payment status
curl http://localhost:5000/api/payment-gateway/status/PAYMENT_ID

# Test 3: Get packages
curl http://localhost:5000/api/payment-gateway/packages

# Test 4: Get user payments
curl http://localhost:5000/api/payment-gateway/history/USER_ID
```

## 🚀 Deployment Checklist

### Before Going Live

- [ ] **Configuration**
  - [ ] Update PAYMENT_BASE_URL to production
  - [ ] Update PAYMENT_API_KEY to production key
  - [ ] Update PAYMENT_WEBHOOK_SECRET to production secret
  - [ ] Set BASE_URL to production domain
  - [ ] Set FRONTEND_URL to production domain
  - [ ] Enable HTTPS
  - [ ] Set NODE_ENV=production

- [ ] **Database**
  - [ ] MongoDB Atlas configured
  - [ ] Database backup strategy in place
  - [ ] Indexes created on Payment collection
  - [ ] Data retention policy set

- [ ] **Security**
  - [ ] SSL certificate installed
  - [ ] CORS properly configured
  - [ ] Rate limiting enabled
  - [ ] API key rotation policy
  - [ ] Webhook secret rotation policy
  - [ ] No debug logs in production

- [ ] **Monitoring**
  - [ ] Error logging configured
  - [ ] Payment failure alerts set
  - [ ] Webhook failure alerts set
  - [ ] Database backup alerts
  - [ ] API performance monitoring
  - [ ] Transaction audit logging

- [ ] **Documentation**
  - [ ] API documentation updated
  - [ ] Admin guide created
  - [ ] Support runbook prepared
  - [ ] Disaster recovery plan ready

- [ ] **Payment Gateway Setup**
  - [ ] Production API keys obtained
  - [ ] Callback URL configured in gateway
  - [ ] Webhook URL configured in gateway
  - [ ] IP whitelist updated (if required)
  - [ ] Webhook signature secret configured
  - [ ] Test payment made successfully

- [ ] **Testing**
  - [ ] End-to-end payment flow tested
  - [ ] Error scenarios tested
  - [ ] Load testing completed
  - [ ] Security penetration testing done
  - [ ] User acceptance testing passed

## 📋 Production Rollout Plan

### Phase 1: Preparation (2 days)

- [ ] Prepare production environment
- [ ] Get production API credentials
- [ ] Deploy code to staging
- [ ] Run full test suite on staging
- [ ] Train support team

### Phase 2: Soft Launch (1 week)

- [ ] Deploy to production (limited users)
- [ ] Monitor 24/7 for issues
- [ ] Collect user feedback
- [ ] Fix any critical bugs
- [ ] Monitor payment success rate

### Phase 3: Full Launch (1 day)

- [ ] Expand to all users
- [ ] Monitor success metrics
- [ ] Have rollback plan ready
- [ ] Schedule follow-up review

### Phase 4: Optimization (Ongoing)

- [ ] Monitor payment metrics
- [ ] Optimize user experience
- [ ] Add new payment methods
- [ ] Improve error messages
- [ ] Regular security audits

## 📊 Success Metrics

Track these after deployment:

| Metric                | Target | Monitor   |
| --------------------- | ------ | --------- |
| Payment Success Rate  | >98%   | Daily     |
| Average Payment Time  | <2 min | Weekly    |
| Failed Payment Rate   | <2%    | Daily     |
| Webhook Delivery Rate | >99%   | Daily     |
| API Response Time     | <500ms | Real-time |
| Database Query Time   | <100ms | Real-time |
| Error Rate            | <1%    | Daily     |
| User Satisfaction     | >4.5/5 | Weekly    |

## 🆘 Troubleshooting Guide

### Payment Not Processing

**Symptoms:** Payment stuck in "pending"

**Diagnosis:**

```javascript
// Check payment record
db.payments.findOne({ invoiceId: "INV-xxx" });

// Check gateway response
db.payments.findOne({ invoiceId: "INV-xxx" }, { rawResponse: 1 });
```

**Solutions:**

1. Verify PAYMENT_API_KEY is correct
2. Check gateway API status
3. Verify PAYMENT_BASE_URL is reachable
4. Check network connectivity

### Webhook Not Received

**Symptoms:** Payment success in gateway but not reflected in app

**Diagnosis:**

```javascript
// Check payment in database
db.payments.find({ status: "pending" });

// Check webhook logs
// Review server logs for webhook endpoint
```

**Solutions:**

1. Verify webhook URL in gateway settings
2. Check firewall/security groups
3. Verify webhook signature secret
4. Check server logs for errors

### Duplicate Credits Granted

**Symptoms:** User received credits twice

**Diagnosis:**

```javascript
// Check for multiple payment records
db.payments.find({ userId: ObjectId("xxx"), status: "success" });

// Check wallet balance
db.wallets.findOne({ userId: ObjectId("xxx") });
```

**Solutions:**

1. Verify idempotency logic in code
2. Check webhook retry settings
3. Implement deduplication
4. Manual wallet adjustment if needed

---

**Last Updated:** April 27, 2026  
**Status:** ✅ Ready for Production
