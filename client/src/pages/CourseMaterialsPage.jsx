import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  CheckCircle,
  Play,
  FileText,
  AlertCircle,
  BookMarked,
} from "lucide-react";
import "./CourseMaterialsPage.css";

const CourseMaterialsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [courseContent, setCourseContent] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedContent, setSelectedContent] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);

  // Fetch course materials
  useEffect(() => {
    fetchCourseMaterials();
  }, [courseId, token]);

  const fetchCourseMaterials = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/courses/${courseId}/content`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.content) {
        // Organize content by section
        const organizedSections = {};
        response.data.content.forEach((item) => {
          const section = item.section || "General";
          if (!organizedSections[section]) {
            organizedSections[section] = [];
          }
          organizedSections[section].push(item);
        });

        // Convert to array format
        const sectionsArray = Object.keys(organizedSections)
          .map((section) => ({
            title: section,
            items: organizedSections[section],
          }))
          .sort((a, b) => a.title.localeCompare(b.title));

        setSections(sectionsArray);

        // Initialize expanded sections (first section expanded)
        if (sectionsArray.length > 0) {
          setExpandedSections({ [sectionsArray[0].title]: true });
          setSelectedContent(sectionsArray[0].items[0]);
        }

        // Set overall progress
        setOverallProgress(response.data.progressPercentage || 0);
      }

      setError(null);
    } catch (err) {
      console.error("❌ Error fetching course materials:", err);
      setError(
        err.response?.data?.message || "Failed to load course materials",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionTitle) => {
    setExpandedSections({
      ...expandedSections,
      [sectionTitle]: !expandedSections[sectionTitle],
    });
  };

  const handleSelectContent = async (item) => {
    setSelectedContent(item);
  };

  const handleMarkViewed = async (contentId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/course-content/${contentId}/viewed`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Update progress
      if (response.data.progressPercentage !== undefined) {
        setOverallProgress(response.data.progressPercentage);
      }

      // Mark as viewed in UI
      if (selectedContent) {
        setSelectedContent({ ...selectedContent, viewed: true });
      }
    } catch (err) {
      console.error("❌ Error marking content as viewed:", err);
    }
  };

  const getContentIcon = (contentType) => {
    switch (contentType) {
      case "video":
        return <Play size={18} />;
      case "document":
      case "pdf":
        return <FileText size={18} />;
      case "text":
        return <BookMarked size={18} />;
      default:
        return <FileText size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="course-materials-page loading-container">
        <div className="spinner">Loading course materials...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-materials-page error-container">
        <div className="error-message">
          <AlertCircle size={48} />
          <h2>Error Loading Materials</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/courses")}>Back to Courses</button>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="course-materials-page error-container">
        <div className="error-message">
          <AlertCircle size={48} />
          <h2>No Materials Available</h2>
          <button onClick={() => navigate("/courses")}>Back to Courses</button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-materials-page feature-page">
      <div className="materials-container">
        {/* Sidebar - Content List */}
        <div className="materials-sidebar">
          {/* Progress Header */}
          <div className="progress-header">
            <h3>📚 Course Content</h3>
            <div className="progress-section">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className="progress-text">
                {Math.round(overallProgress)}% Complete
              </span>
            </div>
          </div>

          {/* Sections List */}
          <div className="sections-list">
            {sections.map((section) => (
              <div key={section.title} className="section-group">
                <button
                  className="section-header"
                  onClick={() => toggleSection(section.title)}
                >
                  <ChevronDown
                    size={20}
                    className={`chevron ${expandedSections[section.title] ? "expanded" : ""}`}
                  />
                  <span>{section.title}</span>
                  <span className="item-count">({section.items.length})</span>
                </button>

                {expandedSections[section.title] && (
                  <div className="section-items">
                    {section.items.map((item) => (
                      <button
                        key={item._id}
                        className={`content-item ${
                          selectedContent?._id === item._id ? "active" : ""
                        } ${item.viewed ? "viewed" : ""}`}
                        onClick={() => handleSelectContent(item)}
                      >
                        <div className="item-icon">
                          {item.viewed ? (
                            <CheckCircle size={16} className="viewed-icon" />
                          ) : (
                            getContentIcon(item.contentType)
                          )}
                        </div>
                        <div className="item-info">
                          <span className="item-title">{item.title}</span>
                          {item.duration && (
                            <span className="item-duration">
                              {item.duration} min
                            </span>
                          )}
                        </div>
                        {item.isRequired && (
                          <span className="required-badge">Required</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="materials-main">
          {selectedContent ? (
            <div className="content-viewer">
              {/* Content Header */}
              <div className="content-header">
                <h1>{selectedContent.title}</h1>
                <div className="content-metadata">
                  <span className="content-type">
                    {getContentIcon(selectedContent.contentType)}
                    {selectedContent.contentType}
                  </span>
                  {selectedContent.duration && (
                    <span className="content-duration">
                      ⏱️ {selectedContent.duration} minutes
                    </span>
                  )}
                  {selectedContent.fileSize && (
                    <span className="content-size">
                      📦 {(selectedContent.fileSize / 1024 / 1024).toFixed(2)}{" "}
                      MB
                    </span>
                  )}
                  {selectedContent.viewed ? (
                    <span className="viewed-badge">✅ Completed</span>
                  ) : (
                    <span className="not-viewed-badge">Not Completed</span>
                  )}
                </div>
              </div>

              {/* Content Display */}
              <div className="content-display">
                {selectedContent.contentType === "video" && (
                  <div className="video-container">
                    {selectedContent.content?.includes("youtube") ||
                    selectedContent.content?.includes("youtu.be") ? (
                      <iframe
                        src={
                          selectedContent.content.replace(
                            "watch?v=",
                            "embed/",
                          ) || "https://www.youtube.com/embed/dQw4w9WgXcQ"
                        }
                        title={selectedContent.title}
                        allowFullScreen
                        className="video-player"
                      />
                    ) : (
                      <video controls className="video-player">
                        <source
                          src={selectedContent.content}
                          type="video/mp4"
                        />
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                )}

                {selectedContent.contentType === "document" && (
                  <div className="document-container">
                    {selectedContent.content?.includes(".pdf") ? (
                      <iframe
                        src={selectedContent.content}
                        title={selectedContent.title}
                        className="pdf-viewer"
                      />
                    ) : (
                      <div className="document-placeholder">
                        <p>📄 {selectedContent.title}</p>
                        <a
                          href={selectedContent.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="download-link"
                        >
                          Download Document
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {selectedContent.contentType === "text" && (
                  <div className="text-content">
                    <p>
                      {selectedContent.content || selectedContent.description}
                    </p>
                  </div>
                )}

                {selectedContent.contentType === "link" && (
                  <div className="link-container">
                    <p>📎 External Resource</p>
                    <a
                      href={selectedContent.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="external-link"
                    >
                      {selectedContent.content}
                    </a>
                  </div>
                )}

                {selectedContent.thumbnail && (
                  <div className="image-container">
                    <img
                      src={selectedContent.thumbnail}
                      alt={selectedContent.title}
                      className="content-image"
                    />
                  </div>
                )}
              </div>

              {/* Content Description */}
              {selectedContent.description && (
                <div className="content-description">
                  <h3>About This Content</h3>
                  <p>{selectedContent.description}</p>
                </div>
              )}

              {/* Mark as Viewed Button */}
              {!selectedContent.viewed && (
                <button
                  className="mark-viewed-btn"
                  onClick={() => handleMarkViewed(selectedContent._id)}
                >
                  ✅ Mark as Completed
                </button>
              )}

              {/* Navigation */}
              <div className="content-navigation">
                <button className="nav-btn" disabled>
                  ← Previous
                </button>
                <span className="nav-info">Viewing Course Content</span>
                <button className="nav-btn" disabled>
                  Next →
                </button>
              </div>
            </div>
          ) : (
            <div className="no-content-selected">
              <p>👈 Select a content item from the left to view it</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="materials-actions">
        <button
          className="mentorship-btn"
          onClick={() => navigate(`/mentorship?courseId=${courseId}`)}
        >
          👨‍🏫 Book a Mentor
        </button>
        <button className="back-btn" onClick={() => navigate("/courses")}>
          Back to Courses
        </button>
      </div>
    </div>
  );
};

export default CourseMaterialsPage;
