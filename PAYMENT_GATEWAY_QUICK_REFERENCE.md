# Payment Gateway Quick Reference

## 🚀 Quick Start

### 1. Environment Setup

```bash
# .env file
PAYMENT_BASE_URL=https://sandbox.payment-aggregator.com
PAYMENT_API_KEY=your_api_key
PAYMENT_WEBHOOK_SECRET=your_webhook_secret
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

### 2. Test Payment Creation

```bash
curl -X POST http://localhost:5000/api/payment-gateway/create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 399, "creditsGranted": 500, "paymentMethod": "bKash"}'
```

### 3. Check Payment Status

```bash
curl http://localhost:5000/api/payment-gateway/status/PAYMENT_ID
```

## 📊 Payment Flow Diagram

```
User clicks "Buy"
       ↓
Frontend: POST /api/payment-gateway/create
       ↓
Backend: Create Payment (pending)
       ↓
Backend: Call gateway API
       ↓
Frontend: Redirect to paymentUrl
       ↓
User completes payment on gateway
       ↓
Gateway: Redirect to /callback?paymentID=xxx
       ↓
Backend: Finalize payment → grant credits
       ↓
Frontend: Show success
       ↓
(Also) Gateway: POST /webhook (server confirmation)
```

## 🎯 Key Endpoints

| Method | Endpoint                               | Purpose              |
| ------ | -------------------------------------- | -------------------- |
| POST   | `/api/payment-gateway/create`          | Initiate payment     |
| GET    | `/api/payment-gateway/status/:id`      | Check payment status |
| GET    | `/api/payment-gateway/history/:userId` | Payment history      |
| GET    | `/api/payment-gateway/callback`        | Gateway redirect     |
| POST   | `/api/payment-gateway/webhook`         | Gateway webhook      |
| GET    | `/api/payment-gateway/packages`        | Get packages         |

## 💰 Package Details

| Package    | Credits | Amount (BDT) | Per Credit |
| ---------- | ------- | ------------ | ---------- |
| Starter    | 100     | 99           | 0.99       |
| Pro        | 500     | 399          | 0.80       |
| Business   | 1500    | 999          | 0.67       |
| Enterprise | 5000    | 2999         | 0.60       |

## ✅ Payment Statuses

| Status  | Meaning          | Action            |
| ------- | ---------------- | ----------------- |
| pending | Awaiting payment | Show payment form |
| success | Payment received | Grant credits     |
| failed  | Payment failed   | Show error        |

## 🔒 Security Checklist

- [ ] API key in environment variables
- [ ] Webhook signature verification enabled
- [ ] HTTPS used in production
- [ ] Rate limiting on payment endpoints
- [ ] Database backups scheduled
- [ ] Payment logs enabled
- [ ] Error notifications set up
- [ ] Idempotency check in place

## 🧪 Test Credentials

Contact your payment gateway provider for:

- Sandbox API key
- Test payment cards
- Test merchant account

Example test card (varies by gateway):

- Number: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: 123

## 📝 Database Queries

### Get all payments

```javascript
db.payments.find({});
```

### Get successful payments

```javascript
db.payments.find({ status: "success" });
```

### Get user's payments

```javascript
db.payments.find({ userId: ObjectId("USER_ID") });
```

### Get total revenue

```javascript
db.payments.aggregate([
  { $match: { status: "success" } },
  { $group: { _id: null, total: { $sum: "$amount" } } },
]);
```

## 🛠️ Common Tasks

### Check if payment succeeded

```javascript
const payment = await Payment.findById(paymentId);
console.log(payment.status); // "success" or "failed" or "pending"
```

### Get user's wallet balance

```javascript
const wallet = await Wallet.findOne({ userId });
console.log(wallet.creditsBalance);
```

### Manually grant credits (for testing)

```javascript
let wallet = await Wallet.findOne({ userId });
if (!wallet) {
  wallet = await Wallet.create({ userId, creditsBalance: 0 });
}
wallet.creditsBalance += 500;
await wallet.save();
```

### Check payment history

```javascript
const payments = await Payment.find({ userId })
  .sort({ createdAt: -1 })
  .limit(10);
```

## ⚡ Performance Tips

1. **Index Optimization**
   - Indexes on userId, paymentId, status for faster lookups

2. **Webhook Optimization**
   - Process webhooks asynchronously
   - Implement idempotency keys

3. **Database Optimization**
   - Archive old payments regularly
   - Use aggregation for reports

## 🚨 Error Handling

| Error             | Cause               | Solution                      |
| ----------------- | ------------------- | ----------------------------- |
| ECONNREFUSED      | Gateway unreachable | Check PAYMENT_BASE_URL        |
| Invalid signature | Webhook tampering   | Verify PAYMENT_WEBHOOK_SECRET |
| Payment not found | Wrong paymentId     | Check database                |
| Duplicate credits | Webhook fired twice | Check idempotency             |

## 📞 Gateway Integration Steps

1. **Sign up** for payment gateway account
2. **Get API credentials** (API key, webhook secret)
3. **Configure URLs** in gateway dashboard
   - Callback URL: `https://yoursite.com/api/payment-gateway/callback`
   - Webhook URL: `https://yoursite.com/api/payment-gateway/webhook`
4. **Test in sandbox** before going live
5. **Switch to production** credentials

## 🎓 Learning Resources

### Files to Study

1. `paymentService.js` - Gateway communication
2. `paymentController.js` - Business logic
3. `payment-gateway.js` - Routes and endpoints
4. `WalletPage.jsx` - Frontend integration

### Key Concepts

- REST API integration
- Webhook handling
- Payment state management
- Error handling and recovery
- Security and validation

## 📊 Monitoring

Monitor these metrics:

- Payment success rate
- Average payment time
- Failed payments count
- Revenue by payment method
- Webhook delivery rate

## 🔄 Update Payment Status

```javascript
// Manual status update (admin only)
const payment = await Payment.findByIdAndUpdate(
  paymentId,
  { status: "success", completedAt: new Date() },
  { new: true },
);
```

## 💡 Pro Tips

1. **Always verify with gateway** before granting credits
2. **Use webhook for confirmation**, not just callback
3. **Log all payment attempts** for audit trail
4. **Implement rate limiting** to prevent abuse
5. **Test error scenarios** (timeout, network error, etc.)
6. **Backup payment data** regularly
7. **Monitor webhook delivery** to catch issues early
8. **Use unique invoice IDs** for each payment

---

**Quick Help:** Check `PAYMENT_GATEWAY_IMPLEMENTATION.md` for detailed documentation
