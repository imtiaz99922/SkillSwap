# 🎨 Frontend Payment Integration - User Guide

## 📱 User Interface Flow

```
┌─────────────────────────────────────┐
│      SkillSwap Dashboard            │
│  (After Login)                      │
└──────────────┬──────────────────────┘
               │
               ▼
        [Wallet Button]
        in Top Navigation
               │
               ▼
┌─────────────────────────────────────┐
│    Wallet Page                      │
│  ✅ Current Balance: 0 credits      │
│  ✅ Lifetime Earned: 0 credits      │
│  ✅ Lifetime Spent: 0 credits       │
│                                     │
│  [View Tabs]                        │
│  • My Credits  (current)            │
│  • Buy Credits                      │
│  • History                          │
│  • Transactions                     │
└──────────────┬──────────────────────┘
               │
               ▼
    Click "Buy Credits" Tab
               │
               ▼
┌─────────────────────────────────────┐
│    Available Packages               │
│                                     │
│  📦 Starter                         │
│     100 Credits | 500 BDT           │
│     [Buy Now]                       │
│                                     │
│  📦 Pro ⭐                          │
│     500 Credits | 2000 BDT          │
│     [Buy Now]  ← Most Popular       │
│                                     │
│  📦 Business                        │
│     1500 Credits | 5000 BDT         │
│     [Buy Now]                       │
│                                     │
│  📦 Enterprise                      │
│     5000 Credits | 15000 BDT        │
│     [Buy Now]                       │
└──────────────┬──────────────────────┘
               │
               ▼
   User clicks [Buy Now] button
   on desired package
               │
               ▼
┌─────────────────────────────────────┐
│  Payment Processing...              │
│  Creating payment session...        │
│  Connecting to SSLCommerz...        │
│                                     │
│  ⏳ Please wait...                  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  🔗 Redirecting to SSLCommerz       │
│                                     │
│  (Browser is taken to payment       │
│   gateway page)                     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    SSLCommerz Payment Gateway       │
│                                     │
│  Select Payment Method:             │
│  ◯ bKash                           │
│  ◯ Nagad                           │
│  ◯ Card/Visa/Mastercard            │
│  ◯ Bank Transfer                    │
│  ◯ Apple Pay / Google Pay           │
│                                     │
│  Transaction: 2000 BDT              │
│  Amount: 500 Credits                │
│                                     │
│  [Proceed to Payment]               │
└──────────────┬──────────────────────┘
               │
               ▼
   Customer completes payment
   (e.g., enters OTP, confirms)
               │
               ▼
┌─────────────────────────────────────┐
│  ✅ Payment Successful!             │
│                                     │
│  Your transaction has been          │
│  processed successfully.            │
│                                     │
│  You will be redirected shortly...  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  SkillSwap - Success Page          │
│                                     │
│  ✅ Payment Successful!             │
│  💰 500 Credits Added               │
│                                     │
│  Your New Balance:                  │
│  💳 500 Credits                     │
│                                     │
│  Transaction ID:                    │
│  SKILLSWAP-xxx-xxx                  │
│                                     │
│  [View Receipt] [Go to Wallet]      │
│  [Continue Shopping]                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    Wallet Page - Updated            │
│  ✅ Current Balance: 500 credits    │
│  ✅ Lifetime Earned: 500 credits    │
│                                     │
│  Payment History:                   │
│  📝 Pro Package Purchase            │
│     500 Credits | 2000 BDT          │
│     Status: ✅ Success              │
│     Date: Today                     │
│                                     │
│  Credits are ready to use!          │
└─────────────────────────────────────┘
```

---

## 🖼️ UI Components

### Wallet Page Layout

```
┌───────────────────────────────────────────────┐
│  Wallet                                       │
├───────────────────────────────────────────────┤
│                                               │
│  Quick Stats:                                 │
│  ┌──────────────┬──────────────┬────────────┐│
│  │ Balance      │ Total Earned │ Total Used ││
│  │ 500 credits  │ 500 credits  │ 0 credits  ││
│  └──────────────┴──────────────┴────────────┘│
│                                               │
│  Tabs:                                        │
│  [ My Credits ] [ Buy Credits ] [ History ]  │
│                                               │
│  Content Area (Changes per tab):              │
│  ─────────────────────────────────────────    │
│  Tab: My Credits (Default View)               │
│  ─────────────────────────────────────────    │
│                                               │
│  Your Credit Balance: 500                     │
│  Total Earned: 500                            │
│  Total Spent: 0                               │
│                                               │
│  Recent Transactions:                         │
│  • Pro Package Purchase (+500) - 2 days ago   │
│  • Daily Login Bonus (+10) - today            │
│                                               │
│  ─────────────────────────────────────────    │
│  Tab: Buy Credits (Selected View)             │
│  ─────────────────────────────────────────    │
│                                               │
│  Credit Packages:                             │
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │  📦 Starter                             │ │
│  │  100 Credits for 500 BDT                │ │
│  │  Best for: First-time users             │ │
│  │  [Buy Now] [More Info]                  │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │  📦 Pro ⭐ (Most Popular)                │ │
│  │  500 Credits for 2000 BDT               │ │
│  │  Best for: Active users                 │ │
│  │  [Buy Now] [More Info]                  │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │  📦 Business                            │ │
│  │  1500 Credits for 5000 BDT              │ │
│  │  Best for: Power users                  │ │
│  │  [Buy Now] [More Info]                  │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  ┌─────────────────────────────────────────┐ │
│  │  📦 Enterprise                          │ │
│  │  5000 Credits for 15000 BDT             │ │
│  │  Best for: Teams & Organizations        │ │
│  │  [Buy Now] [More Info]                  │ │
│  └─────────────────────────────────────────┘ │
│                                               │
│  💳 Accepted Payment Methods:                 │
│     bKash | Nagad | Card | Bank Transfer    │
│                                               │
└───────────────────────────────────────────────┘
```

---

## 💻 Code Examples

### How Frontend Initiates Payment

**File:** `client/src/pages/WalletPage.jsx`

```javascript
// When user clicks "Buy Now" on a package
const handleBuyPackage = async (packageId) => {
  try {
    setPaymentLoading(true);

    // Call backend to initiate payment
    const response = await api.post("/sslcommerz/initiate-payment", {
      packageId,
    });

    // Extract redirect URL from response
    const { redirectUrl } = response.data;

    // Redirect user to SSLCommerz payment page
    window.location.href = redirectUrl;
  } catch (error) {
    console.error("Payment initiation failed:", error);
    setPaymentStatus({
      type: "error",
      message: "Failed to initiate payment. Please try again.",
    });
  }
};
```

### How Frontend Handles Payment Callback

**File:** `client/src/pages/WalletPage.jsx`

```javascript
// After SSLCommerz redirects back
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");
  const credits = params.get("credits");

  if (status === "success") {
    // Payment successful!
    setPaymentStatus({
      type: "success",
      message: `🎉 Payment successful! ${credits} credits added.`,
    });

    // Reload wallet data
    loadWalletData();

    // Show success notification
    setTimeout(() => {
      navigate("/wallet");
    }, 2000);
  } else if (status === "failed") {
    // Payment failed
    setPaymentStatus({
      type: "error",
      message: "❌ Payment failed. Please try again.",
    });
  } else if (status === "cancelled") {
    // User cancelled
    setPaymentStatus({
      type: "warning",
      message: "⚠️ Payment was cancelled.",
    });
  }
}, [window.location.search]);
```

---

## 📲 Mobile View

```
┌─────────────────────┐
│  Wallet             │
├─────────────────────┤
│                     │
│ Balance: 500 cr     │
│                     │
│ [My Credits]        │
│ [Buy Credits]       │
│ [History]           │
│                     │
├─────────────────────┤
│ Buy Credits:        │
│                     │
│ ┌─────────────────┐ │
│ │ 📦 Starter      │ │
│ │ 100 Cr - 500 Tk │ │
│ │ [Buy Now]       │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ 📦 Pro ⭐       │ │
│ │ 500 Cr - 2K Tk  │ │
│ │ [Buy Now]       │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ 📦 Business     │ │
│ │ 1.5K Cr - 5K Tk │ │
│ │ [Buy Now]       │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ 📦 Enterprise   │ │
│ │ 5K Cr - 15K Tk  │ │
│ │ [Buy Now]       │ │
│ └─────────────────┘ │
│                     │
│ 💳 Payment Methods: │
│ bKash Nagad Card    │
│                     │
└─────────────────────┘
```

---

## 🎯 User Journey - Complete Example

### Scenario: New User's First Purchase

**Step 1: Discover Credit System**

- User navigates to Wallet page
- Sees current balance: 0 credits
- Reads about credit packages

**Step 2: Select Package**

- Reviews package options
- Chooses "Pro" (500 credits for 2000 BDT)
- Clicks [Buy Now]

**Step 3: Payment Initiation**

```
Frontend sends:
POST /api/sslcommerz/initiate-payment
{ packageId: "pro" }

Backend returns:
{
  paymentId: "650f1a2b4c8d...",
  invoiceId: "SKILLSWAP-user123-1234567890",
  redirectUrl: "https://sandbox.sslcommerz.com/...",
  package: { id: "pro", credits: 500, amount: 2000 }
}

Frontend redirects user to redirectUrl
```

**Step 4: SSLCommerz Payment**

- User sees SSLCommerz payment form
- Selects payment method (e.g., Card)
- Enters payment details
- Completes payment

**Step 5: Payment Processing**

```
SSLCommerz processes:
1. Validates payment ✅
2. Sends IPN to backend
3. Backend verifies & grants credits
4. Redirects user to success page
```

**Step 6: Success**

```
User sees:
✅ Payment Successful!
💰 500 Credits Added
💳 New Balance: 500 Credits
📜 Transaction ID: SKILLSWAP-...
```

**Step 7: Credit Usage**

- User can now enroll in courses
- Use credits for mentorship
- Purchase course materials
- etc.

---

## 🔄 How Credits Flow in System

```
┌──────────────────────────────────────────────┐
│            User Earns Credits                │
├──────────────────────────────────────────────┤
│                                              │
│  Ways to Get Credits:                        │
│  1. Buy packages (via SSLCommerz)            │
│  2. Daily login bonus (system-generated)     │
│  3. Course completion rewards (system)       │
│  4. Referral bonuses (from referrals)        │
│  5. Contest winnings (system)                │
│                                              │
│  ↓ All added to Wallet ↓                    │
│                                              │
│  Wallet { credits: 500, totalEarned: 500 }  │
│                                              │
└────────────────────┬─────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│         User Spends Credits                  │
├──────────────────────────────────────────────┤
│                                              │
│  Ways to Spend Credits:                      │
│  1. Enroll in courses                        │
│  2. Book mentorship sessions                 │
│  3. Access premium content                   │
│  4. Buy course materials                     │
│  5. Special features                         │
│                                              │
│  ↓ All deducted from Wallet ↓               │
│                                              │
│  Wallet { credits: 480, totalSpent: 20 }    │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 📊 Payment Methods Available

### On SSLCommerz Gateway:

| Method        | Speed | Required | Bangladesh |
| ------------- | ----- | -------- | ---------- |
| bKash         | Fast  | Account  | ✅ Yes     |
| Nagad         | Fast  | Account  | ✅ Yes     |
| Visa          | Fast  | Card     | ✅ Yes     |
| Mastercard    | Fast  | Card     | ✅ Yes     |
| Bank Transfer | Slow  | Account  | ✅ Yes     |
| Apple Pay     | Fast  | Device   | ✅ iOS     |
| Google Pay    | Fast  | Device   | ✅ Android |

---

## 🛡️ User Security Features

✅ **Secure Payment Gateway**

- SSL/TLS encryption
- PCI DSS compliant
- No credit card stored on our servers

✅ **User Data Protection**

- JWT token authentication
- User can only see their own payments
- Email verification required

✅ **Fraud Prevention**

- Transaction verification
- Amount matching
- Duplicate prevention

✅ **Privacy**

- Payment details encrypted
- Receipt available anytime
- History viewable by user only

---

## 💬 User Support Scenarios

### Q1: "How do I buy credits?"

**Answer:**

1. Go to Wallet section
2. Click "Buy Credits" tab
3. Choose a package
4. Click "Buy Now"
5. Complete payment on SSLCommerz
6. Credits added automatically ✅

### Q2: "How long does it take to get credits?"

**Answer:**

- Instant! Credits are added immediately after successful payment.

### Q3: "What payment methods do you accept?"

**Answer:**

- bKash, Nagad, Cards (Visa/Mastercard), Bank Transfer, Apple Pay, Google Pay

### Q4: "Can I see my payment history?"

**Answer:**

- Yes! Go to Wallet → History tab to see all transactions.

### Q5: "Is my payment secure?"

**Answer:**

- Yes! We use SSLCommerz which is SSL/TLS encrypted and PCI compliant.

### Q6: "I completed payment but credits didn't appear"

**Answer:**

1. Refresh your page
2. Check payment status (might be processing)
3. Wait 1-2 minutes
4. Contact support if still not received

### Q7: "Can I refund my purchase?"

**Answer:**

- Refunds are processed within 3-5 business days
- Please contact support team

---

## 🎨 UI/UX Best Practices

✅ **Clear Call-to-Action**

- "Buy Now" buttons are prominent
- Pricing is clearly visible
- No hidden fees

✅ **Progress Indication**

- Loading states during payment processing
- Success/error messages are clear
- Redirect happens automatically

✅ **Mobile-Friendly**

- Responsive design
- Touch-friendly buttons
- Works on all devices

✅ **Accessibility**

- Clear text labels
- Color-coded status (green=success, red=error)
- Keyboard navigation supported

---

## 🚀 Ready to Purchase!

The frontend payment system is fully integrated and ready for users to:

1. View credit packages
2. Initiate payments
3. Complete transactions
4. See confirmations
5. Use credits immediately

**All pages are production-ready! 🎉**
