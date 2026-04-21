import React, { useState, useEffect } from "react";
import SearchSkillCard from "../components/SearchSkillCard.jsx";
import BookSlotModal from "../../availability/components/BookSlotModal";
import { searchApi } from "../services/searchApi";
import { useNavigate } from "react-router-dom";
import "../../../styles/ModernDesign.css";

export default function SearchPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [bookSlotModal, setBookSlotModal] = useState({
    isOpen: false,
    userId: null,
    userName: null,
  });
  const currentUserId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const data = await searchApi.getAllSkills();
      const skillList = Array.isArray(data) ? data : data.skills || [];
      setSkills(skillList);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const data = await searchApi.searchSkills(query);
        const skillList = Array.isArray(data) ? data : data.skills || [];
        setSkills(skillList);
      } catch (err) {
        console.error("Search failed:", err);
      }
    } else {
      fetchSkills();
    }
  };

  const handleMessage = (userId, userName) => {
    navigate(`/chat?user=${userId}`, {
      state: { userName },
    });
  };

  const handleBookSlot = (userId, userName) => {
    setBookSlotModal({
      isOpen: true,
      userId,
      userName,
    });
  };

  const handleViewReviews = (userId) => {
    navigate(`/reviews/${userId}`);
  };

  const filteredSkills = skills.filter(
    (skill) => skill.userId !== currentUserId,
  );

  return (
    <div className="feature-page">
      {/* PAGE HEADER */}
      <div className="page-header">
        <h1 className="page-title">Find Partners</h1>
        <p className="page-subtitle">
          Discover available skills and connect with mentors in our community
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="card" style={{ padding: "20px", marginBottom: "0" }}>
        <input
          type="text"
          placeholder="🔍 Search courses, skills, categories, or tags..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="form-input"
          style={{
            width: "100%",
            padding: "13px 16px",
            fontSize: "14px",
          }}
        />
      </div>

      {/* SKILLS GRID */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : filteredSkills.length > 0 ? (
        <div className="grid-3">
          {filteredSkills.map((skill, i) => (
            <div
              key={skill._id}
              className="card"
              style={{
                animationDelay: `${0.1 + i * 0.05}s`,
              }}
            >
              <SearchSkillCard
                skill={skill}
                onMessage={() => handleMessage(skill.userId, skill.owner?.name)}
                onBookSlot={() =>
                  handleBookSlot(skill.userId, skill.owner?.name)
                }
                onViewReviews={() => handleViewReviews(skill.userId)}
                onTakeQuiz={() =>
                  skill.quizId && navigate(`/quizzes/${skill.quizId}`)
                }
                onViewCourse={() => navigate(`/courses/${skill._id}`)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>No available skills found</p>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Try a broader search or add your own skill listing
          </p>
        </div>
      )}

      {/* BOOKING MODAL */}
      <BookSlotModal
        isOpen={bookSlotModal.isOpen}
        userId={bookSlotModal.userId}
        userName={bookSlotModal.userName}
        onClose={() =>
          setBookSlotModal({
            isOpen: false,
            userId: null,
            userName: null,
          })
        }
        onSlotBooked={fetchSkills}
      />
    </div>
  );
}
