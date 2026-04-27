import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Users,
  Clock,
  DollarSign,
  AlertCircle,
  Check,
} from "lucide-react";
import "./CoursePage.css";

const CoursePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [hasQuiz, setHasQuiz] = useState(false);

  // Fetch course details
  useEffect(() => {
    fetchCourseDetails();
  }, [courseId, token]);

  // Update final price when discount changes
  useEffect(() => {
    if (course) {
      const discountedPrice = Math.max(0, (course.price || 0) - discount);
      setFinalPrice(discountedPrice);
    }
  }, [course, discount]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/courses/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCourse(response.data.course);
      setEnrollmentStatus(response.data.enrollmentStatus);
      setHasQuiz(response.data.course?.hasDemoQuiz || false);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching course:", err);
      setError(err.response?.data?.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    try {
      setCouponError(null);
      setCouponSuccess(null);

      const response = await axios.post(
        "http://localhost:5000/api/coupons/validate",
        {
          code: couponCode.toUpperCase(),
          courseId: courseId,
          purchaseAmount: course.price || 0,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.valid) {
        setDiscount(response.data.discountAmount || 0);
        setCouponSuccess(
          `✅ Coupon applied! Discount: ₳${response.data.discountAmount || 0}`,
        );
      } else {
        setCouponError(response.data.message || "Invalid coupon code");
        setDiscount(0);
      }
    } catch (err) {
      console.error("❌ Coupon validation error:", err);
      setCouponError(
        err.response?.data?.message || "Failed to validate coupon",
      );
      setDiscount(0);
    }
  };

  const handlePurchase = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setPurchasing(true);
      setPurchaseStatus({ type: "loading", message: "Processing purchase..." });

      const response = await axios.post(
        `http://localhost:5000/api/courses/${courseId}/purchase`,
        {
          couponCode: couponCode || null,
          paymentMethod: "credits",
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        setPurchaseStatus({
          type: "success",
          message: "🎉 Course purchased successfully! Redirecting...",
        });

        // Show success message and redirect after 2 seconds
        setTimeout(() => {
          navigate(`/courses/${courseId}/materials`);
        }, 2000);
      } else {
        setPurchaseStatus({
          type: "error",
          message: response.data.message || "Purchase failed",
        });
      }
    } catch (err) {
      console.error("❌ Purchase error:", err);
      setPurchaseStatus({
        type: "error",
        message: err.response?.data?.message || "Purchase failed. Try again.",
      });
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="course-page loading-container">
        <div className="spinner">Loading course details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-page error-container">
        <div className="error-message">
          <AlertCircle size={48} />
          <h2>Error Loading Course</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/courses")}>Back to Courses</button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-page error-container">
        <div className="error-message">
          <AlertCircle size={48} />
          <h2>Course Not Found</h2>
          <button onClick={() => navigate("/courses")}>Back to Courses</button>
        </div>
      </div>
    );
  }

  const isEnrolled = enrollmentStatus?.status === "active";

  return (
    <div className="course-page">
      {/* Purchase Status Alert */}
      {purchaseStatus && (
        <div className={`purchase-alert ${purchaseStatus.type}`}>
          <p>{purchaseStatus.message}</p>
          {purchaseStatus.type === "error" && (
            <button onClick={() => setPurchaseStatus(null)}>✕ Close</button>
          )}
        </div>
      )}

      <div className="course-container">
        {/* Main Content */}
        <div className="course-main">
          {/* Course Header */}
          <div className="course-header">
            <div className="course-hero">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="hero-image"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/800x400?text=Course";
                  }}
                />
              ) : (
                <div className="hero-placeholder">📚 Course</div>
              )}
            </div>

            <div className="course-header-content">
              <h1>{course.title}</h1>
              <p className="course-description">{course.description}</p>

              <div className="course-meta">
                <div className="meta-item">
                  <span className="label">Instructor</span>
                  <span className="value">
                    {course.instructorId?.name || "Unknown"}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="label">Level</span>
                  <span className="value">{course.level || "N/A"}</span>
                </div>
                <div className="meta-item">
                  <span className="label">Category</span>
                  <span className="value">{course.category || "N/A"}</span>
                </div>
                <div className="meta-item">
                  <span className="label">Duration</span>
                  <span className="value">{course.duration || 0} hours</span>
                </div>
              </div>

              <div className="course-stats-row">
                <div className="stat">
                  <Star size={20} />
                  <div>
                    <div className="stat-value">
                      {course.rating ? course.rating.toFixed(1) : "N/A"}
                    </div>
                    <div className="stat-label">
                      ({course.ratingCount || 0} reviews)
                    </div>
                  </div>
                </div>
                <div className="stat">
                  <Users size={20} />
                  <div>
                    <div className="stat-value">
                      {course.enrollmentCount || 0}
                    </div>
                    <div className="stat-label">Students enrolled</div>
                  </div>
                </div>
                <div className="stat">
                  <Clock size={20} />
                  <div>
                    <div className="stat-value">{course.duration || 0}</div>
                    <div className="stat-label">Hours of content</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Content Sections */}
          <div className="course-sections">
            {/* What You'll Learn */}
            <div className="course-section">
              <h2>📚 What You'll Learn</h2>
              <ul className="learning-objectives">
                <li>
                  Comprehensive curriculum covering all basics to advanced
                  topics
                </li>
                <li>Hands-on projects and real-world applications</li>
                <li>Video lectures and interactive content</li>
                <li>Lifetime access to course materials</li>
                <li>Certificate of completion</li>
                <li>Personal mentorship support available</li>
              </ul>
            </div>

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <div className="course-section">
                <h2>🏷️ Topics</h2>
                <div className="tags-list">
                  {course.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Demo Quiz */}
            {hasQuiz && (
              <div className="course-section demo-section">
                <h2>📝 Try Demo Quiz</h2>
                <p>
                  Test your knowledge with our demo quiz before enrolling. You
                  can see the correct answers and explanations.
                </p>
                <button
                  className="demo-quiz-btn"
                  onClick={() =>
                    navigate(`/demo-quiz/${courseId}?from=course-details`)
                  }
                >
                  Take Demo Quiz →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Purchase Section */}
        <div className="course-sidebar">
          {isEnrolled ? (
            <div className="enrollment-card">
              <div className="enrolled-badge">
                <Check size={24} />
                <h3>You're Enrolled!</h3>
              </div>
              <p>You have access to all course materials and mentorship.</p>
              <button
                className="access-btn primary"
                onClick={() => navigate(`/courses/${courseId}/materials`)}
              >
                Access Course Materials →
              </button>
              <button
                className="access-btn secondary"
                onClick={() => {
                  navigate(`/mentorship?courseId=${courseId}`);
                }}
              >
                Book a Mentor →
              </button>
            </div>
          ) : (
            <div className="purchase-card">
              {/* Price Display */}
              <div className="price-display">
                <span className="original-price">
                  ₳{course.price || 0} Credits
                </span>
                {discount > 0 && (
                  <>
                    <span className="discount-badge">
                      -{((discount / (course.price || 1)) * 100).toFixed(0)}%
                    </span>
                    <span className="final-price">₳{finalPrice} Credits</span>
                  </>
                )}
              </div>

              {/* Coupon Input */}
              <div className="coupon-section">
                <label>Have a coupon or referral code?</label>
                <div className="coupon-input-group">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError(null);
                      setCouponSuccess(null);
                    }}
                    className={couponError ? "error" : ""}
                  />
                  <button
                    className="validate-btn"
                    onClick={validateCoupon}
                    disabled={!couponCode.trim()}
                  >
                    Apply
                  </button>
                </div>

                {couponError && (
                  <div className="coupon-error">{couponError}</div>
                )}
                {couponSuccess && (
                  <div className="coupon-success">{couponSuccess}</div>
                )}
              </div>

              {/* Purchase Button */}
              <button
                className="purchase-btn"
                onClick={handlePurchase}
                disabled={purchasing}
              >
                {purchasing ? "Processing..." : `Buy Now - ₳${finalPrice}`}
              </button>

              {/* Payment Info */}
              <div className="payment-info">
                <p>💳 Pay with credits from your wallet</p>
                <p>🔄 Instant access after purchase</p>
                <p>✅ Lifetime course access</p>
                <p>👨‍🏫 Mentorship available after purchase</p>
              </div>

              {/* Wallet Link */}
              <button
                className="wallet-link"
                onClick={() =>
                  navigate(
                    `/wallet?course=${courseId}&price=${finalPrice || course.price || 0}`,
                  )
                }
              >
                Need credits? Go to Wallet →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
