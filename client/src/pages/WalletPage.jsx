import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./WalletPage.css";

const WalletPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [tab, setTab] = useState("packages");

  // Handle payment callback
  useEffect(() => {
    const status = searchParams.get("status");
    const error = searchParams.get("error");

    if (status === "success") {
      setPaymentStatus({
        type: "success",
        message: "Payment successful! Credits added to your wallet.",
      });
      // Reload wallet data
      loadWalletData();
    } else if (status === "failed") {
      setPaymentStatus({
        type: "error",
        message: error
          ? `Payment failed: ${error}`
          : "Payment was cancelled or failed.",
      });
    }
  }, [searchParams]);

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
      loadWalletData();
      loadPackages();
      loadPaymentHistory(response.data._id);
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const loadWalletData = async () => {
    try {
      const response = await api.get("/wallet");
      setWallet(response.data);
    } catch (error) {
      console.error("Failed to load wallet data:", error);
    }
  };

  const loadPackages = async () => {
    try {
      const response = await api.get("/payment/packages");
      // Ensure packages is an array
      const packagesList = Array.isArray(response.data)
        ? response.data
        : response.data.packages || [];
      setPackages(packagesList);
    } catch (error) {
      console.error("Failed to load packages:", error);
      setPackages([]); // Set empty array on error
    }
  };

  const loadPaymentHistory = async (userId) => {
    try {
      const response = await api.get(`/payment/history/${userId}`);
      // Handle different response formats
      const history = Array.isArray(response.data)
        ? response.data
        : response.data.payments || [];
      setPaymentHistory(history);
    } catch (error) {
      // Silently handle errors - payment history is optional
      setPaymentHistory([]); // Set empty array on error
    }
  };

  /**
   * 🟢 Create Payment Intent with Stripe
   */
  const handleBuyCredits = async (pkg) => {
    if (!user) {
      alert("Please log in first");
      return;
    }

    setLoading(true);
    setPaymentStatus(null);

    try {
      console.log("📝 Creating payment intent for package:", pkg);

      // Create Stripe payment intent
      const response = await api.post("/payment/create-payment-intent", {
        packageId: pkg.id,
      });

      console.log("✅ Payment intent created:", response.data);

      if (response.data.clientSecret) {
        // For demo/test mode, just show success
        if (response.data.isDemo) {
          setPaymentStatus({
            type: "success",
            message: `Demo payment for ${pkg.name} - ৳${pkg.amount}`,
          });
          // In real app, would integrate with Stripe Elements here
        } else {
          // Would integrate with real Stripe here
          setPaymentStatus({
            type: "success",
            message: `Payment intent created - ${pkg.name}`,
          });
        }
      } else {
        setPaymentStatus({
          type: "error",
          message: "Failed to create payment intent",
        });
      }
    } catch (error) {
      console.error("❌ Payment creation failed:", error);
      setPaymentStatus({
        type: "error",
        message: error.response?.data?.msg || "Failed to create payment",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-page">
      {/* Header */}
      <div className="wallet-header">
        <h1>💳 Wallet & Credits</h1>
        <p>Purchase credits to unlock premium features</p>
      </div>

      {/* Payment Status Alert */}
      {paymentStatus && (
        <div className={`payment-alert ${paymentStatus.type}`}>
          <p>{paymentStatus.message}</p>
          <button onClick={() => setPaymentStatus(null)}>✕</button>
        </div>
      )}

      {/* Current Balance */}
      {wallet && (
        <div className="balance-card">
          <div className="balance-info">
            <span className="label">Current Balance</span>
            <span className="amount">{wallet.creditsBalance} 💰</span>
          </div>
          <div className="balance-stats">
            <div>
              <span className="stat-label">Total Earned</span>
              <span className="stat-value">{wallet.totalCreditsEarned}</span>
            </div>
            <div>
              <span className="stat-label">Total Spent</span>
              <span className="stat-value">
                {wallet.totalCreditsSpent || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="wallet-tabs">
        <button
          className={`tab ${tab === "packages" ? "active" : ""}`}
          onClick={() => setTab("packages")}
        >
          📦 Buy Packages
        </button>
        <button
          className={`tab ${tab === "history" ? "active" : ""}`}
          onClick={() => setTab("history")}
        >
          📋 Payment History
        </button>
      </div>

      {/* Tab Content */}
      {tab === "packages" && (
        <div className="packages-grid">
          {packages.map((pkg) => (
            <div key={pkg.id} className="package-card">
              <div className="package-header">
                <h3>{pkg.name}</h3>
                <span className="credits-badge">{pkg.credits} 💰</span>
              </div>

              <div className="package-details">
                <p className="amount">৳{pkg.amount}</p>
                <p className="price-per-credit">
                  ৳{(pkg.amount / pkg.credits).toFixed(2)} per credit
                </p>
              </div>

              <ul className="features">
                <li>✅ {pkg.credits} Credits</li>
                <li>✅ Instant Delivery</li>
                <li>✅ Never Expires</li>
                <li>✅ {pkg.paymentMethod} Payment</li>
              </ul>

              <button
                className="buy-button"
                onClick={() => handleBuyCredits(pkg)}
                disabled={loading}
              >
                {loading ? "Processing..." : `Buy for ৳${pkg.amount}`}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Payment History */}
      {tab === "history" && (
        <div className="payment-history">
          {paymentHistory.length > 0 ? (
            <div className="history-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Credits</th>
                    <th>Status</th>
                    <th>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentHistory.map((payment) => (
                    <tr key={payment._id}>
                      <td>
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td>৳{payment.amount}</td>
                      <td>{payment.creditsGranted} 💰</td>
                      <td>
                        <span
                          className={`status ${payment.status.toLowerCase()}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td>{payment.paymentMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-history">
              <p>No payment history yet</p>
              <button className="cta-button" onClick={() => setTab("packages")}>
                Buy Your First Credits
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletPage;
