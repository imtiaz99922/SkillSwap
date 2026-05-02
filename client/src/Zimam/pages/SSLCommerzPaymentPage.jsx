import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaCreditCard,
  FaTimes,
} from "react-icons/fa";
import sslcommerzApi from "../../services/sslcommerzApi";
import api from "../../services/api";
import "./SSLCommerzPaymentPage.css";

const SSLCommerzPaymentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const [requiredCredits, setRequiredCredits] = useState(0);
  const [coursePurchaseProcessed, setCoursePurchaseProcessed] = useState(false);

  // Handle payment callback from SSLCommerz
  useEffect(() => {
    const status = searchParams.get("status");
    const paymentId = searchParams.get("paymentId");
    const credits = searchParams.get("credits");
    const error = searchParams.get("error");
    const courseQueryId =
      searchParams.get("courseId") || searchParams.get("course");
    const required = parseInt(searchParams.get("requiredCredits"), 10) || 0;

    setCourseId(courseQueryId);
    setRequiredCredits(required);

    if (status === "success") {
      setPaymentStatus({
        type: "success",
        message: `🎉 Payment successful! ${credits} credits have been added to your wallet.`,
        paymentId: paymentId,
        credits: credits,
      });
      // Reload wallet data after 2 seconds
      setTimeout(() => {
        loadWalletData();
      }, 2000);
    } else if (status === "failed") {
      setPaymentStatus({
        type: "error",
        message: error
          ? `❌ Payment failed: ${decodeURIComponent(error)}`
          : "❌ Payment was failed.",
      });
    } else if (status === "cancelled") {
      setPaymentStatus({
        type: "warning",
        message: "⚠️ Payment was cancelled.",
      });
    }
  }, [searchParams]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (
      paymentStatus?.type === "success" &&
      courseId &&
      !coursePurchaseProcessed
    ) {
      attemptCourseAutoPurchase();
    }
  }, [paymentStatus, courseId, coursePurchaseProcessed, wallet]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [packagesRes, userRes] = await Promise.all([
        sslcommerzApi.getPackages(),
        api.get("/auth/me"),
      ]);
      setPackages(packagesRes.packages || packagesRes);
      setUser(userRes.data);
      loadWalletData();
      loadPaymentHistory();
    } catch (error) {
      console.error("Failed to load initial data:", error);
      setPaymentStatus({
        type: "error",
        message: "Failed to load payment packages. Please refresh the page.",
      });
    } finally {
      setLoading(false);
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

  const attemptCourseAutoPurchase = async () => {
    if (!courseId || coursePurchaseProcessed) {
      return;
    }

    let currentCredits = wallet?.credits;
    if (currentCredits === undefined || currentCredits === null) {
      try {
        const response = await api.get("/wallet");
        setWallet(response.data);
        currentCredits = response.data?.credits ?? 0;
      } catch (error) {
        console.error("Failed to reload wallet for course purchase:", error);
      }
    }

    const missingCredits = requiredCredits;

    if (currentCredits < missingCredits) {
      setPaymentStatus({
        type: "warning",
        message:
          "Payment succeeded, but your wallet still does not have enough credits for the course. Please try again after your balance updates.",
      });
      setCoursePurchaseProcessed(true);
      return;
    }

    try {
      setPaymentStatus({
        type: "info",
        message: "Finishing your course purchase using your updated credits...",
      });
      await api.post(`/courses/${courseId}/purchase`);
      setPaymentStatus({
        type: "success",
        message:
          "🎉 Your course purchase is complete! Redirecting to course page...",
      });
      setCoursePurchaseProcessed(true);
      setTimeout(() => {
        navigate(`/course/${courseId}`);
      }, 1500);
    } catch (error) {
      console.error("❌ Auto course purchase failed:", error);
      setPaymentStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Payment succeeded, but course enrollment failed. Please try again.",
      });
      setCoursePurchaseProcessed(true);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      const response = await sslcommerzApi.getPaymentHistory();
      setPaymentHistory(response.payments || []);
    } catch (error) {
      console.error("Failed to load payment history:", error);
    }
  };

  const handlePayment = async (packageId) => {
    try {
      setPaymentLoading(true);
      const pkg = packages.find((p) => p.id === packageId);

      if (!pkg) {
        setPaymentStatus({
          type: "error",
          message: "Package not found",
        });
        return;
      }

      // Directly initiate payment and redirect to SSLCommerz
      const result = await sslcommerzApi.initiatePayment(
        packageId,
        "card",
        "",
        courseId,
        requiredCredits,
      );

      if (result.redirectUrl) {
        // Redirect to SSLCommerz payment gateway
        window.location.href = result.redirectUrl;
      } else {
        setPaymentStatus({
          type: "error",
          message: "Failed to initiate payment. Please try again.",
        });
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      setPaymentStatus({
        type: "error",
        message:
          error.response?.data?.msg ||
          "Failed to initiate payment. Please try again.",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="feature-page sslcommerz-payment-page">
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading payment packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feature-page sslcommerz-payment-page">
      <div className="payment-container">
        {/* Header */}
        <div className="payment-header">
          <h1>💰 Buy Credits</h1>
          <p>Boost your skills with our credit packages</p>
        </div>

        {/* User Info & Current Balance */}
        {user && wallet && (
          <div className="user-wallet-info">
            <div className="info-card">
              <h3>Current Balance</h3>
              <div className="balance-display">
                <span className="balance-amount">{wallet.credits || 0}</span>
                <span className="balance-label">Credits</span>
              </div>
            </div>
            <div className="info-card">
              <h3>Total Earned</h3>
              <div className="balance-display">
                <span className="earned-amount">
                  {wallet.totalCreditsEarned || 0}
                </span>
                <span className="earned-label">All Time</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Status Messages */}
        {paymentStatus && (
          <div className={`payment-status ${paymentStatus.type}`}>
            {paymentStatus.type === "success" && <FaCheckCircle />}
            {paymentStatus.type === "error" && <FaExclamationTriangle />}
            {paymentStatus.type === "warning" && <FaExclamationTriangle />}
            <div>
              <p>{paymentStatus.message}</p>
              {paymentStatus.credits && (
                <p className="credit-added">
                  Your wallet has been updated with {paymentStatus.credits}{" "}
                  credits! 🎊
                </p>
              )}
            </div>
          </div>
        )}

        {/* Packages Grid */}
        <div className="packages-section">
          <h2>Choose Your Package</h2>
          <p className="section-description">
            All prices are in BDT (Bangladesh Taka)
          </p>

          <div className="packages-grid">
            {packages && packages.length > 0 ? (
              packages.map((pkg) => (
                <div key={pkg.id} className="package-card">
                  <div className="package-badge">
                    {pkg.id === "enterprise" && "⭐ BEST VALUE"}
                    {pkg.id === "business" && "🔥 POPULAR"}
                    {pkg.id === "starter" && "✨ START HERE"}
                  </div>

                  <h3>{pkg.name}</h3>

                  <div className="package-credits">
                    <span className="credits-number">{pkg.credits}</span>
                    <span className="credits-label">Credits</span>
                  </div>

                  <div className="package-price">
                    <span className="price">৳{pkg.amount}</span>
                    <span className="price-label">BDT</span>
                  </div>

                  <div className="credits-per-taka">
                    <small>
                      {(pkg.credits / pkg.amount).toFixed(2)} credits per ৳
                    </small>
                  </div>

                  <button
                    className="buy-button"
                    onClick={() => handlePayment(pkg.id)}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? (
                      <>
                        <FaSpinner className="spinner-small" /> Processing...
                      </>
                    ) : (
                      <>
                        <FaCreditCard /> Buy Now
                      </>
                    )}
                  </button>
                </div>
              ))
            ) : (
              <div className="no-packages">
                <p>No packages available at the moment.</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Info */}
        <div className="payment-methods-info">
          <h3>💳 Accepted Payment Methods</h3>
          <div className="methods-list">
            <div className="method">
              <span className="method-icon">💳</span>
              <span>Visa / Mastercard</span>
            </div>
            <div className="method">
              <span className="method-icon">🏦</span>
              <span>Bank Transfer</span>
            </div>
            <div className="method">
              <span className="method-icon">📱</span>
              <span>Mobile Banking</span>
            </div>
            <div className="method">
              <span className="method-icon">🎯</span>
              <span>Other Payment Methods</span>
            </div>
          </div>
        </div>

        <div className="tab-buttons-container">
          <button
            className={`tab-button ${!showHistory ? "active" : ""}`}
            onClick={() => setShowHistory(false)}
          >
            How It Works
          </button>
          <button
            className={`tab-button ${showHistory ? "active" : ""}`}
            onClick={() => setShowHistory(true)}
          >
            Payment History ({paymentHistory.length})
          </button>
        </div>

        {/* How It Works */}
        {!showHistory && (
          <div className="how-it-works">
            <h3>How It Works</h3>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Choose Package</h4>
                  <p>Select a credit package that fits your needs</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Secure Payment</h4>
                  <p>Complete the payment through SSLCommerz secure gateway</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Credits Added</h4>
                  <p>Credits are instantly added to your wallet</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Start Learning</h4>
                  <p>Use credits to participate in challenges and courses</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        {showHistory && (
          <div className="payment-history">
            <h3>Recent Transactions</h3>
            {paymentHistory.length > 0 ? (
              <div className="history-table">
                <div className="table-header">
                  <div className="col-invoice">Invoice</div>
                  <div className="col-date">Date</div>
                  <div className="col-amount">Amount (৳)</div>
                  <div className="col-credits">Credits</div>
                  <div className="col-status">Status</div>
                </div>
                {paymentHistory.map((payment) => (
                  <div key={payment._id} className="table-row">
                    <div className="col-invoice">{payment.invoiceId}</div>
                    <div className="col-date">
                      {formatDate(payment.createdAt)}
                    </div>
                    <div className="col-amount">৳{payment.amount}</div>
                    <div className="col-credits">+{payment.creditsGranted}</div>
                    <div className={`col-status ${payment.status}`}>
                      {payment.status === "success" && "✅ Completed"}
                      {payment.status === "pending" && "⏳ Pending"}
                      {payment.status === "failed" && "❌ Failed"}
                      {payment.status === "cancelled" && "⚠️ Cancelled"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-history">
                <p>No payment history yet. Buy your first package today!</p>
              </div>
            )}
          </div>
        )}

        {/* Security Info */}
        <div className="security-info">
          <h4>🔒 Your Payment is Secure</h4>
          <p>
            We use SSLCommerz, a trusted payment gateway, to process all
            transactions securely. Your card information is never stored on our
            servers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SSLCommerzPaymentPage;
