# Payment Gateway System Diagram & Visual Guide

## 🌐 Complete System Visualization

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                          SKILLSWAP PAYMENT SYSTEM                     ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (React)                           │
│                        http://localhost:5175                           │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                     Wallet Page Component                      │    │
│  │  ┌────────────────────────────────────────────────────────┐   │    │
│  │  │ Header: "💳 Wallet & Credits"                          │   │    │
│  │  ├────────────────────────────────────────────────────────┤   │    │
│  │  │ Balance Card: ₹5000 💰                                 │   │    │
│  │  │ - Total Earned: ₹5000                                  │   │    │
│  │  │ - Total Spent: ₹0                                      │   │    │
│  │  ├────────────────────────────────────────────────────────┤   │    │
│  │  │ Tabs: 📦 Packages | 📋 History                         │   │    │
│  │  ├────────────────────────────────────────────────────────┤   │    │
│  │  │ Package Cards Grid:                                     │   │    │
│  │  │ ┌──────────────┐  ┌──────────────┐                     │   │    │
│  │  │ │  Starter     │  │    Pro       │                     │   │    │
│  │  │ │ 100 Credits  │  │ 500 Credits  │                     │   │    │
│  │  │ │    ₹99       │  │   ₹399       │                     │   │    │
│  │  │ │  [Buy Now]   │  │  [Buy Now]   │                     │   │    │
│  │  │ └──────────────┘  └──────────────┘                     │   │    │
│  │  └────────────────────────────────────────────────────────┘   │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                        │
│                            USER ACTIONS                                │
│                              ↓                                         │
│                      [Clicks "Buy Now"]                                │
│                              ↓                                         │
└────────────────────────────────────────────────────────────────────────┘

                     HTTP POST Request
                          ↓
┌────────────────────────────────────────────────────────────────────────┐
│                       SERVER LAYER (Express)                           │
│                        http://localhost:5000                           │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │              Payment Gateway Routes                           │    │
│  │  POST /api/payment-gateway/create                            │    │
│  │   ├─ Extract: amount, creditsGranted, paymentMethod          │    │
│  │   ├─ Check: User exists, valid amount                        │    │
│  │   ├─ Generate: Unique invoiceId                              │    │
│  │   └─ Create: Payment record (status: pending)                │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                           ↓                                            │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │           Payment Service Layer                               │    │
│  │  createPaymentGateway({amount, invoiceId})                   │    │
│  │   ├─ Build: Request body with callbackURL, webhookURL        │    │
│  │   ├─ Set: Headers with Authorization token                   │    │
│  │   ├─ Call: axios.post(PAYMENT_BASE_URL/payment/create)       │    │
│  │   └─ Return: { paymentID, payment_url, ... }                 │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                           ↓                                            │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │            Database Layer                                     │    │
│  │  Save: Payment{                                               │    │
│  │    userId, amount, creditsGranted,                           │    │
│  │    status: "pending",                                        │    │
│  │    paymentId: "gateway_id",                                  │    │
│  │    invoiceId: "INV-123456",                                  │    │
│  │    rawResponse: { ... gateway response ... }                 │    │
│  │  }                                                            │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                           ↓                                            │
│            Response: { paymentUrl, paymentId, invoiceId }             │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘

                     window.location.href = paymentUrl
                              ↓
┌────────────────────────────────────────────────────────────────────────┐
│                   PAYMENT GATEWAY (bKash/Nagad)                        │
│                  https://gateway.payment.com/pay                       │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                    Payment Form                               │    │
│  │  Enter Payment Details:                                       │    │
│  │  - Phone Number: 01xxxxxxxxx                                 │    │
│  │  - Pin: ••••••                                               │    │
│  │  - Amount: ₹399                                              │    │
│  │  [Submit Payment]                                            │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                           ↓                                            │
│                   Process Payment                                      │
│                           ↓                                            │
│              Payment Successful ✓                                      │
│                           ↓                                            │
│           ┌─────────────────────────────────┐                         │
│           │ Redirect to callback URL        │                         │
│           │ + Send Webhook                  │                         │
│           └─────────────────────────────────┘                         │
│              ↓                            ↓                            │
└────────────────────────────────────────────────────────────────────────┘
              │                            │
              │ Callback                   │ Webhook (Server→Server)
              ↓                            ↓
    GET /callback?               POST /webhook
    paymentID=xxx                Body: {paymentID, status}
    status=success               Headers: X-Signature
              │                            │
              └────────────┬───────────────┘
                           ↓
┌────────────────────────────────────────────────────────────────────────┐
│                       FINALIZATION LOGIC                               │
│                                                                        │
│  1️⃣  Find Payment by paymentId                                        │
│  2️⃣  Check: Is status already "success"? → Skip if yes (idempotency) │
│  3️⃣  Verify: Call gateway API to confirm payment                      │
│  4️⃣  Update: Payment.status = "success"                               │
│  5️⃣  Grant: Add credits to Wallet                                    │
│  6️⃣  Create: UserSkill record (if applicable)                         │
│  7️⃣  Return: Success response                                         │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
                           ↓
              Database Updated Successfully
                           ↓
        ┌──────────────────────────────────────┐
        │  Wallet: creditsBalance +500         │
        │  Payment: status = "success"         │
        │  UserSkill: created                  │
        └──────────────────────────────────────┘
                           ↓
         Callback: Redirect to success page
                           ↓
┌────────────────────────────────────────────────────────────────────────┐
│                      CLIENT: Success Page                              │
│                                                                        │
│  ✅ Payment Successful!                                               │
│     Your ₹399 payment has been processed                              │
│     500 credits have been added to your wallet                        │
│                                                                        │
│     [View Wallet]  [Continue Shopping]                                │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Diagram

```
User Input Data
├─ amount: 399
├─ creditsGranted: 500
└─ paymentMethod: "bKash"
        │
        ↓
Backend Validation
├─ Check: userId exists
├─ Check: amount > 0
├─ Check: creditsGranted > 0
└─ Generate: invoiceId
        │
        ↓
Payment Creation
├─ Create: Payment record (pending)
├─ Store: userId, amount, creditsGranted
├─ Store: invoiceId (unique)
└─ Store: metadata
        │
        ↓
Gateway Request
├─ Prepare: { amount, invoiceId, callbackURL }
├─ Sign: Request with API_KEY
├─ Send: POST to PAYMENT_BASE_URL/payment/create
└─ Receive: { paymentID, payment_url }
        │
        ↓
Database Update
├─ Update: Payment.paymentId = gateway_paymentID
├─ Store: Payment.rawResponse (full gateway response)
└─ Status: "pending" → waiting for confirmation
        │
        ↓
User Redirect
└─ Frontend: window.location.href = payment_url
        │
        ↓
Gateway Processing
├─ User enters payment details
├─ Gateway processes payment
├─ Payment confirmed/failed
└─ Gateway initiates callback + webhook
        │
        ├─────────────────────┬─────────────────────┐
        ↓                     ↓                     ↓
    Callback            Webhook              User Sees
  (User Redirect)   (Server Notification)   (Success/Error)
        │                     │
        ├─────────────────────┤
        │                     │
        ↓ (Both reach backend)

Verification
├─ Find Payment record
├─ Check: Not already processed (idempotency)
├─ Verify: Call gateway API to confirm
└─ Confirm: Status = "success"
        │
        ↓
Credit Grant
├─ Find/Create: Wallet for userId
├─ Update: creditsBalance += creditsGranted
├─ Update: totalCreditsEarned += creditsGranted
└─ Create: UserSkill record
        │
        ↓
Final State
├─ Payment.status = "success"
├─ Payment.completedAt = now
├─ Wallet.creditsBalance = updated
└─ UserSkill.purchasedAt = now
```

## 🔐 Security Flow

```
Payment Creation
       ↓
API Key Validation
├─ Check: Authorization header present
├─ Extract: Bearer token
└─ Verify: Token valid
       ↓
Request Signing
├─ Add: Headers: { Authorization: "Bearer API_KEY" }
└─ Set: Content-Type: application/json
       ↓
Gateway Response Storage
├─ Save: Full response in Payment.rawResponse
├─ Extract: paymentID, payment_url
└─ Log: For audit trail
       ↓
Webhook Reception
├─ Extract: X-Signature header
├─ Calculate: HMAC of request body
├─ Compare: Signature === calculated HMAC
└─ Process: Only if signature valid
       ↓
Database Validation
├─ Check: Payment exists
├─ Check: Status = "pending" (prevent duplicate)
└─ Check: userId matches
       ↓
Gateway Reverification
├─ Call: verifyPaymentGateway(paymentID)
├─ Confirm: Gateway confirms success
└─ Store: Gateway verification response
       ↓
Transaction Complete
└─ Update: Payment.status = "success"
```

## 💾 Database State Transitions

```
Payment Lifecycle:
┌───────────────┐
│   CREATED     │
│   (pending)   │
│ invoiceId: ✓  │
│ paymentId: ✓  │
└───────┬───────┘
        │
        │ (User completes payment)
        ↓
┌───────────────┐
│  VERIFIED     │
│  (success)    │
│ rawResponse:✓ │
│ transactionId:✓
└───────┬───────┘
        │
        │ (Credits granted)
        ↓
┌───────────────────────┐
│  COMPLETED            │
│  ✓ Payment captured   │
│  ✓ Credits granted    │
│  ✓ Wallet updated     │
│  ✓ UserSkill created  │
│  completedAt: now     │
└───────────────────────┘

Wallet Lifecycle:
┌──────────────────┐
│  INITIAL STATE   │
│ creditsBalance:0 │
│ totalEarned: 0   │
│ totalSpent: 0    │
└──────────┬───────┘
           │
      (Payment success)
           ↓
┌──────────────────────────┐
│  UPDATED STATE           │
│ creditsBalance: 500 ↑    │
│ totalEarned: 500 ↑       │
│ totalSpent: 0            │
└──────────┬───────────────┘
           │
    (User spends credits)
           ↓
┌──────────────────────────┐
│  FINAL STATE             │
│ creditsBalance: 100 ↓    │
│ totalEarned: 500         │
│ totalSpent: 400 ↑        │
└──────────────────────────┘
```

## 🚦 Status Indicators

```
✅ Success States
├─ Payment.status = "success"
├─ HTTP 200 OK
├─ Wallet updated
└─ Credits available

⏳ Pending States
├─ Payment.status = "pending"
├─ Awaiting gateway callback
└─ Credits not yet granted

❌ Failed States
├─ Payment.status = "failed"
├─ HTTP error response
├─ Credits not granted
└─ User notified

🔄 Processing States
├─ Verification in progress
├─ Webhook being processed
└─ No duplicate action
```

## 📱 Frontend Component States

```
WalletPage States:
┌─────────────────┐
│  LOADING        │ → Fetching user data, packages
├─────────────────┤
│  DISPLAY        │ → Show packages, wallet balance
├─────────────────┤
│  PROCESSING     │ → Payment creation in progress
├─────────────────┤
│  REDIRECTING    │ → Sending to gateway
├─────────────────┤
│  CALLBACK       │ → Handling return from gateway
├─────────────────┤
│  SUCCESS        │ → Display success message
├─────────────────┤
│  ERROR          │ → Display error message
└─────────────────┘

Alert States:
┌──────────────────────┐
│ None                 │ → No alert shown
├──────────────────────┤
│ Processing...        │ → Payment creating
├──────────────────────┤
│ ✅ Success!          │ → Credits added
├──────────────────────┤
│ ❌ Error             │ → Show error details
└──────────────────────┘
```

## 🔄 Request/Response Cycle

```
REQUEST CYCLE:
Frontend        Backend         Gateway
   │              │              │
   ├─POST create─>│              │
   │              ├─validate───┐ │
   │              ├─prepare──┐ │ │
   │              ├─POST────────>│
   │              │              ├─process
   │              │<─response────┤
   │              ├─store───────┐│
   │<─paymentUrl──┤              │
   │              │              │
   └─redirect──────────────────────>
                  │              │
                  │          ├─process
                  │          │  payment
                  │<─callback───┤
                  ├─verify───┐  │
                  ├─grant────┐  │
                  ├─update───┐  │
                  │          │  │
                  ├─POST webhook──>
                  │          │  │
                  │          │<─response
                  │<─callback────┤
                  │              │
   <─redirect────┤              │
   success page
```

---

**Note:** This visualization shows the complete payment flow from user interaction through database updates. Each component is responsible for its part of the flow while ensuring data consistency and security.
