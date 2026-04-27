import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Star, Users, Clock, DollarSign, Search } from "lucide-react";
import "./CoursesPage.css";

const CoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const token = localStorage.getItem("token");

  // Fetch courses
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, limit: 100 },
      });

      const coursesList = Array.isArray(response.data.courses)
        ? response.data.courses
        : [];
      setCourses(coursesList);
      setFilteredCourses(coursesList);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching courses:", err);
      setError(err.response?.data?.message || "Failed to load courses");
      setCourses([]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter courses based on search and filters
  useEffect(() => {
    let filtered = courses;

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (course) =>
          course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (course) => course.category === categoryFilter,
      );
    }

    // Level filter
    if (levelFilter !== "all") {
      filtered = filtered.filter((course) => course.level === levelFilter);
    }

    // Price range filter
    filtered = filtered.filter(
      (course) =>
        (course.price || 0) >= priceRange[0] &&
        (course.price || 0) <= priceRange[1],
    );

    setFilteredCourses(filtered);
  }, [searchTerm, categoryFilter, levelFilter, priceRange, courses]);

  if (loading) {
    return (
      <div className="courses-page loading-container">
        <div className="spinner">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="courses-page">
      {/* Header */}
      <div className="courses-header">
        <h1>📚 Explore Courses</h1>
        <p>Discover and enroll in courses to expand your skills</p>
      </div>

      {/* Search and Filters */}
      <div className="courses-controls">
        {/* Search Bar */}
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search courses by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="clear-search">
              ✕
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="filters-row">
          {/* Category Filter */}
          <div className="filter-group">
            <label>Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="programming">Programming</option>
              <option value="design">Design</option>
              <option value="business">Business</option>
              <option value="personal-development">Personal Development</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Level Filter */}
          <div className="filter-group">
            <label>Level</label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="filter-group">
            <label>
              Price Range: ₳{priceRange[0]} - ₳{priceRange[1]}
            </label>
            <input
              type="range"
              min="0"
              max="500"
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], parseInt(e.target.value)])
              }
              className="price-slider"
            />
          </div>

          {/* Reset Filters */}
          <button
            className="reset-filters-btn"
            onClick={() => {
              setSearchTerm("");
              setCategoryFilter("all");
              setLevelFilter("all");
              setPriceRange([0, 500]);
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-banner">{error}</div>}

      {/* Courses Grid */}
      <div className="courses-container">
        {filteredCourses.length > 0 ? (
          <div className="courses-grid">
            {filteredCourses.map((course) => (
              <div key={course._id} className="course-card">
                {/* Course Image */}
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

                {/* Course Info */}
                <div className="course-info">
                  <h3 className="course-title">
                    {course.title || "Untitled Course"}
                  </h3>

                  {/* Instructor */}
                  <p className="instructor">
                    👨‍🏫 {course.instructorId?.name || "Unknown Instructor"}
                  </p>

                  {/* Description */}
                  <p className="course-description">
                    {course.description?.substring(0, 100)}...
                  </p>

                  {/* Stats */}
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

                  {/* Price and Demo Quiz */}
                  <div className="course-footer">
                    <div className="price-section">
                      <DollarSign size={18} />
                      <span className="price">₳{course.price || 0}</span>
                    </div>
                    {course.hasDemoQuiz && (
                      <button
                        className="demo-quiz-btn"
                        onClick={() =>
                          navigate(`/demo-quiz/${course._id}?from=courses`)
                        }
                      >
                        📝 Demo Quiz
                      </button>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="course-actions">
                    <button
                      className="view-btn"
                      onClick={() => navigate(`/course/${course._id}`)}
                    >
                      View Details
                    </button>
                    <button
                      className="buy-btn"
                      onClick={() =>
                        navigate(
                          `/wallet?course=${course._id}&price=${course.price || 0}`,
                        )
                      }
                    >
                      🛒 Buy Course
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-courses">
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <h3>No courses found</h3>
              <p>Try adjusting your filters or search terms</p>
              <button
                className="reset-btn"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                  setLevelFilter("all");
                  setPriceRange([0, 500]);
                }}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
