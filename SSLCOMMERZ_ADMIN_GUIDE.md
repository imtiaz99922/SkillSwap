# SSLCommerz Admin & Developer Guide

**For**: Developers, DevOps, and System Administrators  
**Purpose**: Configure, monitor, and maintain SSLCommerz integration  
**Version**: 1.0

---

## 🔧 Configuration Management

### Development Environment Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd CSE\ 471\ Project

# 2. Install backend dependencies
cd backend
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and add:
# SSLCOMMERZ_STORE_ID=testbox
# SSLCOMMERZ_STORE_PASSWORD=qwerty
```

### Environment Variables Reference

```env
# REQUIRED for SSLCommerz
SSLCOMMERZ_STORE_ID=testbox                    # Store ID from SSLCommerz
SSLCOMMERZ_STORE_PASSWORD=qwerty               # Store password
BACKEND_URL=http://localhost:5000              # Backend for callbacks
FRONTEND_URL=http://localhost:5173             # Frontend for redirects
NODE_ENV=development                           # Use 'development' for sandbox

# OPTIONAL for Production
NODE_ENV=production                            # Switch to production
SSLCOMMERZ_STORE_ID=your_live_store_id         # Live credentials
SSLCOMMERZ_STORE_PASSWORD=your_live_password
BACKEND_URL=https://api.yourdomain.com         # Production backend
FRONTEND_URL=https://yourdomain.com            # Production frontend
```

### Credential Sources

**For Sandbox Testing:**

- Use provided test credentials: `testbox` / `qwerty`
- Website: https://sandbox.sslcommerz.com/

**For Live Deployment:**

1. Get account: https://sslcommerz.com/
2. Complete verification
3. Get credentials from: https://merchant.sslcommerz.com/
4. Update `.env` and redeploy

---

## 📊 Monitoring & Analytics

### Database Queries

#### Total Revenue by Date

```javascript
db.payments.aggregate([
  { $match: { status: "success", paymentMethod: "sslcommerz" } },
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      revenue: { $sum: "$amount" },
      transactions: { $sum: 1 },
      credits: { $sum: "$creditsGranted" },
    },
  },
  { $sort: { _id: -1 } },
]);
```

#### Most Popular Package

```javascript
db.payments.aggregate([
  { $match: { status: "success" } },
  {
    $group: {
      _id: "$packageId",
      count: { $sum: 1 },
      revenue: { $sum: "$amount" },
      totalCredits: { $sum: "$creditsGranted" },
    },
  },
  { $sort: { count: -1 } },
]);
```

#### Failed Payments (Last 7 Days)

```javascript
db.payments
  .find({
    status: "failed",
    paymentMethod: "sslcommerz",
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  })
  .sort({ createdAt: -1 });
```

#### User Credit Distribution

```javascript
db.wallets.aggregate([
  {
    $group: {
      _id: null,
      totalCredits: { $sum: "$creditsBalance" },
      avgCredits: { $avg: "$creditsBalance" },
      maxCredits: { $max: "$creditsBalance" },
      minCredits: { $min: "$creditsBalance" },
      userCount: { $sum: 1 },
    },
  },
]);
```

#### Top Spenders

```javascript
db.wallets.find().sort({ totalCreditsSpent: -1 }).limit(10);
```

---

## 🔍 Troubleshooting

### Common Issues & Solutions

#### Issue: "SSLCommerz credentials not configured"

```
Error: SSLCommerz credentials not configured. Set SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD

Solution:
1. Check .env file exists: backend/.env
2. Verify variables are set:
   SSLCOMMERZ_STORE_ID=testbox
   SSLCOMMERZ_STORE_PASSWORD=qwerty
3. Restart backend server: npm run dev
4. Check backend logs for initialization
```

#### Issue: "Payment gateway connection failed"

```
Error: Failed to connect to SSLCommerz gateway

Causes & Solutions:
1. Network connectivity
   - Check internet connection
   - Verify firewall allows outbound HTTPS

2. Wrong endpoint
   - Development: https://sandbox.sslcommerz.com
   - Production: https://securepay.sslcommerz.com
   - Check NODE_ENV setting

3. Wrong credentials
   - Verify Store ID and Password are correct
   - Ensure no typos or extra spaces
   - Check credentials on SSLCommerz dashboard
```

#### Issue: "IPN/Webhook not being called"

```
Solution:
1. Local development (ngrok required):
   ngrok http 5000
   Add webhook URL to SSLCommerz dashboard

2. Production deployment:
   - Backend must be accessible publicly via HTTPS
   - Add webhook URL: https://api.yourdomain.com/api/sslcommerz/ipn
   - Configure in SSLCommerz dashboard
   - Test webhook from dashboard

3. Verify endpoint:
   curl -X POST https://yourdomain.com/api/sslcommerz/ipn \
     -H "Content-Type: application/json" \
     -d '{"test": "webhook"}'
```

#### Issue: "Payment callback but credits not granted"

```
Debugging steps:
1. Check payment record:
   db.payments.findOne({ transactionId: "SKILLSWAP-..." })

2. Check wallet:
   db.wallets.findOne({ userId: "userIdHex" })

3. Check server logs:
   grep "SSLCommerz\|Payment" server.log

4. Manual verification:
   - Verify payment status in SSLCommerz dashboard
   - Check if callback was received
   - Check if IPN was processed

5. Manual credit grant (if needed):
   db.wallets.updateOne(
     { userId: ObjectId("...") },
     { $inc: { creditsBalance: 500 } }
   )
```

#### Issue: "Transaction ID mismatch"

```
Problem: Payment recorded but transaction ID doesn't match

Solution:
1. Check payment record structure:
   {
     transactionId: "SKILLSWAP-userid-timestamp",
     invoiceId: "...",
     paymentId: "..."
   }

2. Ensure uniqueness:
   - transactionId must be globally unique
   - invoiceId must be globally unique
   - Format: SKILLSWAP-{userId}-{timestamp}

3. Handle duplicates:
   db.payments.aggregate([
     { $group: { _id: "$transactionId", count: { $sum: 1 } } },
     { $match: { count: { $gt: 1 } } }
   ])
```

---

## 🚀 Deployment

### Pre-Production Checklist

```
Preparation
□ Test all payment flows locally
□ Test with real SSLCommerz sandbox account
□ Verify all environment variables
□ Test IPN webhook locally (using ngrok)
□ Review all logs and error handling
□ Backup current database

Backend Deployment
□ Update BACKEND_URL in .env
□ Update FRONTEND_URL in .env
□ Keep NODE_ENV=development (sandbox) for testing
□ Deploy to staging environment
□ Run npm install to install axios
□ Restart backend service
□ Verify services are running

Frontend Deployment
□ Update API endpoints if changed
□ Verify /buy-credits route works
□ Test payment button works
□ Verify redirect URLs are correct
□ Deploy to staging environment

Verification
□ Test payment flow end-to-end
□ Verify IPN is being called
□ Check database for payment records
□ Monitor logs for errors
□ Verify wallet updates correctly
```

### Production Deployment

```
1. Get SSLCommerz Live Credentials
   - Contact SSLCommerz sales team
   - Complete merchant verification
   - Get live Store ID and Password

2. Update Environment (.env)
   NODE_ENV=production
   SSLCOMMERZ_STORE_ID=your_live_store_id
   SSLCOMMERZ_STORE_PASSWORD=your_live_store_password
   BACKEND_URL=https://api.yourdomain.com
   FRONTEND_URL=https://yourdomain.com

3. Configure Webhook (Important!)
   - Login to SSLCommerz merchant dashboard
   - Go to Integration → Webhooks
   - Add endpoint: https://api.yourdomain.com/api/sslcommerz/ipn
   - Test webhook from dashboard
   - Verify logs show successful webhook

4. Deploy and Monitor
   - Deploy backend with production env
   - Deploy frontend
   - Monitor first 24 hours for issues
   - Check payment records in database
   - Verify IPN is processing

5. Enable Monitoring & Alerts
   - Setup logging to external service
   - Monitor failed payments
   - Alert on unusual patterns
   - Track revenue metrics
```

---

## 📈 Performance Monitoring

### Key Metrics to Track

```javascript
// Payment success rate
const successRate =
  (successCount / totalCount) * 100

// Average transaction value
const avgTransaction =
  totalRevenue / transactionCount

// Credits per user
const creditsPerUser =
  totalCreditsGranted / uniqueUsers

// Revenue trend
const dailyRevenue = [...]  // Chart over time

// Package popularity
const packageDistribution = {...}  // Pie chart
```

### Logging Configuration

All critical events are automatically logged:

```
✅ Payment initiation
✅ SSLCommerz API calls
✅ Callback received
✅ IPN received
✅ Signature verification
✅ Status updates
✅ Credit grants
❌ Error messages
```

View logs:

```bash
# Recent logs
tail -f /var/log/app.log

# Filter by SSLCommerz
grep "sslcommerz\|SSLCommerz" /var/log/app.log

# Filter by error
grep "ERROR\|error" /var/log/app.log | grep -i payment
```

---

## 🔐 Security Hardening

### Before Going Live

```
□ Enable HTTPS for all URLs
□ Verify SSL certificates valid
□ Enable firewall rules
□ Rate limit payment endpoint
□ Monitor for suspicious activity
□ Enable CORS properly
□ Validate all inputs
□ Use environment variables (not hardcoded)
□ Rotate secrets regularly
□ Enable access logging
```

### Ongoing Maintenance

```
Weekly
□ Review payment logs
□ Check for failed transactions
□ Monitor for suspicious patterns

Monthly
□ Audit webhook calls
□ Verify IPN signatures
□ Update dependencies
□ Review security logs
□ Test recovery procedures

Quarterly
□ Penetration testing
□ Security audit
□ Update SSLCommerz SDK (if available)
□ Review all configurations
```

---

## 💾 Backup & Recovery

### Database Backup

```bash
# Full backup
mongodump --uri "mongodb+srv://user:pass@cluster.mongodb.net/skillswap" \
  --out ./backup-$(date +%Y%m%d)

# Backup just payments
mongodump --uri "..." --collection payments --out ./backup-payments

# Restore from backup
mongorestore --uri "..." ./backup-20240428
```

### Payment History Preservation

```javascript
// Export all payments
db.payments.find({ paymentMethod: "sslcommerz" }).toArray()
  .forEach(p => print(JSON.stringify(p)))

// Export to CSV
mongoexport --uri "..." --collection payments \
  --fields "invoiceId,amount,status,createdAt" \
  --csv --out payments.csv
```

---

## 📋 Maintenance Tasks

### Daily

- [ ] Monitor payment logs
- [ ] Check for errors in logs
- [ ] Verify system is responsive

### Weekly

- [ ] Review transaction metrics
- [ ] Audit payment records
- [ ] Backup database
- [ ] Review failed payments

### Monthly

- [ ] Generate revenue report
- [ ] Reconcile with SSLCommerz
- [ ] Update documentation
- [ ] Test disaster recovery

### Quarterly

- [ ] Security audit
- [ ] Performance review
- [ ] Dependency updates
- [ ] Capacity planning

---

## 🆘 Emergency Procedures

### Payment System Down

```
1. Immediate Actions
   - Alert users to wait
   - Check backend logs
   - Verify SSLCommerz status (https://status.sslcommerz.com)
   - Restart backend service if needed

2. Investigation
   - Check database connectivity
   - Verify environment variables
   - Test SSLCommerz API directly
   - Review error logs

3. Resolution
   - Fix identified issue
   - Restart services
   - Monitor for recurring issues
   - Notify affected users

4. Post-Incident
   - Document what happened
   - Update runbooks
   - Improve monitoring
```

### Webhook Not Processing

```
1. Verify Webhook Endpoint
   curl -X POST https://yourdomain.com/api/sslcommerz/ipn \
     -H "Content-Type: application/json" \
     -d '{"test": true}'

2. Check Firewall/Security
   - Verify port 443 is open
   - Check firewall rules
   - Verify SSL certificate

3. Resend from Dashboard
   - Login to SSLCommerz dashboard
   - Find transaction
   - Resend webhook manually

4. Manual Processing
   - Find pending payment in database
   - Manually verify with SSLCommerz
   - Grant credits if verified
   - Update payment status
```

---

## 📚 Reference

### Important URLs

- **SSLCommerz Merchant Panel**: https://merchant.sslcommerz.com/
- **Developer Documentation**: https://developer.sslcommerz.com/
- **Sandbox Gateway**: https://sandbox.sslcommerz.com/
- **Production Gateway**: https://securepay.sslcommerz.com/

### File Locations

- **Service**: `backend/services/sslcommerzService.js`
- **Routes**: `backend/routes/sslcommerz.js`
- **Frontend**: `client/src/pages/SSLCommerzPaymentPage.jsx`
- **Configuration**: `backend/.env`

### Database Collections

- **Payments**: `db.payments`
- **Wallets**: `db.wallets`
- **Users**: `db.users`

---

## Support & Escalation

### Level 1: Self Help

- Check documentation
- Review logs
- Verify configuration
- Test manually

### Level 2: SSLCommerz Support

- Open ticket on developer portal
- Provide transaction ID
- Provide error logs
- Provide store ID

### Level 3: Internal Team

- Escalate to senior developer
- Review source code
- Debug with production logs
- Coordinate with DevOps

---

**Last Updated**: April 28, 2024  
**Version**: 1.0  
**Maintainer**: Development Team  
**Status**: Active ✅
