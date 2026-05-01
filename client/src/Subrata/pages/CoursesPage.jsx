import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Users, Clock } from "lucide-react";
import { courseApi } from "../features/courses/services/courseApi";
import "./CoursesPage.css";

const CoursesPage = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      const data = await courseApi.getMyEnrolledCourses();
      setEnrollments(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching enrolled courses:", err);
      setError(err.response?.data?.message || "Failed to load current courses");
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = (progress) => {
    const value = Math.min(Math.max(progress || 0, 0), 100);
    return (
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="courses-page loading-container">
        <div className="spinner">Loading your current courses...</div>
      </div>
    );
  }

  return (
    <div className="courses-page feature-page">
      <div className="courses-header page-header">
        <h1>📚 My Current Courses</h1>
        <p>
          Track the courses you are enrolled in and resume progress anytime.
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="courses-container">
        {enrollments.length > 0 ? (
          <div className="courses-grid">
            {enrollments.map((enrollment) => {
              const course = enrollment.courseId || {};
              const progress = enrollment.progressPercentage || 0;
              return (
                <div key={enrollment._id || course._id} className="course-card">
                  <div className="course-image">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/300x200?text=Course";
                        }}
                      />
                    ) : (
                      <div className="placeholder-image">📚</div>
                    )}
                    {course.level && (
                      <span className="level-badge">{course.level}</span>
                    )}
                  </div>

                  <div className="course-info">
                    <h3 className="course-title">
                      {course.title || "Untitled Course"}
                    </h3>
                    <p className="instructor">
                      👨‍🏫 {course.instructorId?.name || "Your Instructor"}
                    </p>
                    <p className="course-description">
                      {course.description?.substring(0, 120) ||
                        "Continue learning where you left off."}
                    </p>

                    <div className="course-stats">
                      <div className="stat">
                        <Star size={16} />
                        <span>
                          {course.rating ? course.rating.toFixed(1) : "N/A"} (
                          {course.ratingCount || 0})
                        </span>
                      </div>
                      <div className="stat">
                        <Users size={16} />
                        <span>{course.enrollmentCount || 0} students</span>
                      </div>
                      <div className="stat">
                        <Clock size={16} />
                        <span>{course.duration || 0} hours</span>
                      </div>
                    </div>

                    <div
                      className="course-footer"
                      style={{
                        flexDirection: "column",
                        gap: "1rem",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <div className="price-section">
                          <span className="price">Progress: {progress}%</span>
                        </div>
                        {renderProgressBar(progress)}
                      </div>
                      <div
                        className="course-actions"
                        style={{ width: "100%", gridTemplateColumns: "1fr" }}
                      >
                        <button
                          className="buy-btn"
                          onClick={() =>
                            navigate(`/courses/${course._id}/materials`)
                          }
                        >
                          ▶️ Resume Course
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-courses">
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <h3>No active enrollments found</h3>
              <p>
                You are not currently enrolled in any courses. Visit Find
                Partners to discover new courses and get started.
              </p>
              <button className="reset-btn" onClick={() => navigate("/search")}>
                Find Courses
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
