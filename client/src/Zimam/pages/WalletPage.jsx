import React, { useState, useEffect } from "react";
import api from "../../services/api";
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
  const [courseToRegularize, setCourseToRegularize] = useState(null);
  const [courseLoading, setCourseLoading] = useState(false);
  const [couponCode, setCouponCode] = useState(
    searchParams.get("coupon") || "",
  );
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  // Handle course purchase flow
  useEffect(() => {
    const courseId = searchParams.get("courseId") || searchParams.get("course");
    if (courseId) {
      const priceParam = searchParams.get("price");
      const price = priceParam !== null ? parseInt(priceParam, 10) : null;
      const title = searchParams.get("courseTitle") || "";
      setCourseToRegularize({
        courseId,
        price,
        title,
        priceFromQuery: priceParam !== null,
      });
      setTab("course-purchase");
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseToRegularize?.courseId) return;
      if (
        courseToRegularize.price !== null &&
        courseToRegularize.price !== undefined
      ) {
        return;
      }

      setCourseLoading(true);
      try {
        const response = await api.get(
          `/courses/${courseToRegularize.courseId}`,
        );
        const course = response.data.course;
        if (course) {
          setCourseToRegularize((prev) => ({
            ...prev,
            price: course.price,
            title: prev?.title || course.title || "",
          }));
        }
      } catch (error) {
        console.error("Failed to load course details for purchase:", error);
      } finally {
        setCourseLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseToRegularize]);

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
   * ✅ Apply Coupon Code
   */
  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !selectedPackage) {
      setCouponError("Please enter a coupon code and select a package");
      return;
    }

    setCouponLoading(true);
    setCouponError(null);

    try {
      const response = await api.post("/payment/apply-coupon", {
        packageId: selectedPackage.id,
        couponCode: couponCode.trim(),
      });

      setAppliedCoupon(response.data.coupon);
      setPaymentStatus({
        type: "success",
        message: `✅ Coupon applied! You save $${response.data.coupon.discountAmount}`,
      });
    } catch (error) {
      console.error("❌ Coupon application failed:", error);
      setCouponError(
        error.response?.data?.msg || "Invalid or expired coupon code",
      );
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  /**
   * 🟢 Redirect to SSLCommerz Payment Page
   */
  const handleBuyCredits = async (pkg) => {
    if (!user) {
      alert("Please log in first");
      return;
    }

    // Redirect to SSLCommerz payment page
    window.location.href = "/buy-credits";
  };

  const handleCourseTopUp = () => {
    if (!courseToRegularize || !wallet) {
      alert("Missing course or wallet information");
      return;
    }

    const missingCredits = Math.max(
      0,
      courseToRegularize.price - (wallet?.credits || 0),
    );
    if (missingCredits <= 0) {
      return handlePurchaseCourse();
    }

    const params = new URLSearchParams({
      courseId: courseToRegularize.courseId,
      requiredCredits: missingCredits.toString(),
    });

    window.location.href = `/buy-credits?${params.toString()}`;
  };

  /**
   * 💳 Purchase Course with Credits
   */
  const handlePurchaseCourse = async () => {
    if (!courseToRegularize || !wallet) {
      alert("Missing course or wallet information");
      return;
    }

    if (wallet.credits < courseToRegularize.price) {
      const missingCredits = courseToRegularize.price - wallet.credits;
      setPaymentStatus({
        type: "warning",
        message: `You have ${wallet.credits} credits. Pay the remaining ${missingCredits} credits with money to finish your purchase. Redirecting to credit top-up...`,
      });
      const params = new URLSearchParams({
        courseId: courseToRegularize.courseId,
        requiredCredits: missingCredits.toString(),
      });
      window.location.href = `/buy-credits?${params.toString()}`;
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(
        `/courses/${courseToRegularize.courseId}/purchase`,
      );

      setPaymentStatus({
        type: "success",
        message:
          "Course purchased successfully! Redirecting to course materials...",
      });

      // Reload wallet
      loadWalletData();

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/course/${courseToRegularize.courseId}`);
      }, 2000);
    } catch (error) {
      console.error("❌ Course purchase failed:", error);
      const backendMessage =
        error.response?.data?.message || "Failed to purchase course";

      if (
        error.response?.status === 400 &&
        backendMessage.toLowerCase().includes("insufficient credits")
      ) {
        const missingCredits = Math.max(
          0,
          courseToRegularize.price - (wallet?.credits || 0),
        );
        setPaymentStatus({
          type: "warning",
          message: `${backendMessage} Redirecting to top-up...`,
        });
        const params = new URLSearchParams({
          courseId: courseToRegularize.courseId,
          requiredCredits: missingCredits.toString(),
        });
        window.location.href = `/buy-credits?${params.toString()}`;
        return;
      }

      setPaymentStatus({
        type: "error",
        message: backendMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-page wallet-page">
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
            <span className="amount">{wallet.credits} 💰</span>
          </div>
          <div className="balance-stats">
            <div>
              <span className="stat-label">Total Earned</span>
              <span className="stat-value">{wallet.totalEarned}</span>
            </div>
            <div>
              <span className="stat-label">Total Spent</span>
              <span className="stat-value">{wallet.totalSpent || 0}</span>
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
        {courseToRegularize && (
          <button
            className={`tab ${tab === "course-purchase" ? "active" : ""}`}
            onClick={() => setTab("course-purchase")}
          >
            🎓 Buy Course
          </button>
        )}
      </div>

      {/* Tab Content */}
      {tab === "packages" && (
        <div className="packages-container">
          {/* Coupon Application Section */}
          <div
            className="coupon-section"
            style={{
              marginBottom: "30px",
              padding: "20px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "15px" }}>
              💳 Have a Coupon Code?
            </h3>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1, minWidth: "200px" }}>
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <button
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                style={{
                  padding: "10px 20px",
                  backgroundColor:
                    couponLoading || !couponCode.trim() ? "#ccc" : "#667eea",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor:
                    couponLoading || !couponCode.trim()
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: "600",
                }}
              >
                {couponLoading ? "Validating..." : "Apply Coupon"}
              </button>
            </div>
            {couponError && (
              <p
                style={{
                  color: "#d32f2f",
                  fontSize: "0.9rem",
                  marginTop: "10px",
                  marginBottom: 0,
                }}
              >
                ❌ {couponError}
              </p>
            )}
            {appliedCoupon && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "12px",
                  backgroundColor: "#d4edda",
                  borderRadius: "4px",
                  color: "#155724",
                }}
              >
                <strong>✅ Coupon Applied!</strong>
                <p style={{ margin: "5px 0 0 0" }}>
                  Save {appliedCoupon.value}% - You'll save approximately ৳
                  {Math.floor(
                    (packages[0]?.amount * appliedCoupon.value) / 100,
                  ) || 0}
                </p>
              </div>
            )}
          </div>

          <div className="packages-grid">
            {packages.map((pkg) => {
              const discountAmount = appliedCoupon
                ? Math.floor((pkg.amount * appliedCoupon.value) / 100)
                : 0;
              const finalAmount = pkg.amount - discountAmount;

              return (
                <div key={pkg.id} className="package-card">
                  <div className="package-header">
                    <h3>{pkg.name}</h3>
                    <span className="credits-badge">{pkg.credits} 💰</span>
                  </div>

                  <div className="package-details">
                    {appliedCoupon ? (
                      <>
                        <p
                          style={{
                            textDecoration: "line-through",
                            color: "#999",
                            fontSize: "0.9rem",
                            margin: 0,
                          }}
                        >
                          ৳{pkg.amount}
                        </p>
                        <p className="amount" style={{ color: "#10b981" }}>
                          ৳{finalAmount}
                        </p>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "#d32f2f",
                            margin: "5px 0 0 0",
                          }}
                        >
                          Save ৳{discountAmount} ({appliedCoupon.value}% off)
                        </p>
                      </>
                    ) : (
                      <p className="amount">৳{pkg.amount}</p>
                    )}
                    <p className="price-per-credit">
                      ৳{(finalAmount / pkg.credits).toFixed(2)} per credit
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
                    style={{
                      backgroundColor: appliedCoupon ? "#10b981" : undefined,
                    }}
                  >
                    {loading ? "Processing..." : `Buy for ৳${finalAmount}`}
                  </button>
                </div>
              );
            })}
          </div>
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

      {/* Course Purchase */}
      {tab === "course-purchase" && courseToRegularize && (
        <div className="course-purchase-section">
          <div className="course-purchase-card">
            <div className="course-info">
              <h3>
                {courseToRegularize.title
                  ? `Purchase Course: ${courseToRegularize.title}`
                  : "Purchase Course"}
              </h3>
              <div className="course-cost">
                <span className="label">Course Price:</span>
                <span className="price">
                  {courseLoading || courseToRegularize.price === null
                    ? "Loading..."
                    : `${courseToRegularize.price} 💰`}
                </span>
              </div>
            </div>

            <div className="wallet-info">
              <span className="label">Your Balance:</span>
              <span
                className={`balance ${
                  wallet?.credits >= (courseToRegularize.price || 0)
                    ? "sufficient"
                    : "insufficient"
                }`}
              >
                {wallet?.credits || 0} 💰
              </span>
            </div>

            {courseLoading || courseToRegularize.price === null ? (
              <div className="loading-course-details">
                <p>Loading course details...</p>
              </div>
            ) : wallet && wallet.credits >= courseToRegularize.price ? (
              <div className="sufficient-balance">
                <p>✅ You have enough credits to purchase this course.</p>
                <button
                  className="purchase-button"
                  onClick={handlePurchaseCourse}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "✅ Confirm Purchase"}
                </button>
              </div>
            ) : (
              <div className="insufficient-balance">
                <p>❌ Insufficient credits to purchase this course.</p>
                <p className="needed-credits">
                  You need {courseToRegularize.price - (wallet?.credits || 0)}{" "}
                  more credits.
                </p>
                {wallet && wallet.credits > 0 && (
                  <p>
                    We will use your current {wallet.credits} credits and pay
                    the remaining amount with money.
                  </p>
                )}
                <button className="top-up-button" onClick={handleCourseTopUp}>
                  💳 Pay Remaining Credits with Money
                </button>
                <button
                  className="buy-credits-button"
                  onClick={() => setTab("packages")}
                >
                  💳 Buy More Credits Packages
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
