import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { courseApi } from "../services/courseApi";
import { demoQuizApi } from "../../quiz/services/demoQuizApi";
import { skillsApi } from "../../skills/services/skillsApi";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import "../../../styles/ModernDesign.css";

export default function CourseCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const skillIdFromQuery = searchParams.get("skillId");

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [expandQuizSection, setExpandQuizSection] = useState(false);

  const [formData, setFormData] = useState({
    skillId: skillIdFromQuery || "",
    courseCode: "",
    title: "",
    description: "",
    category: "",
    level: "beginner",
    price: 10,
    duration: 1,
    tags: [],
    thumbnail: "",
    resources: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [resourceInput, setResourceInput] = useState({
    title: "",
    url: "",
    type: "pdf",
  });

  const [demoQuizData, setDemoQuizData] = useState({
    addDemoQuiz: false,
    title: "",
    description: "",
    questions: [],
    passingScore: 70,
    timeLimit: 30,
  });

  useEffect(() => {
    // Fetch my teach skills
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const allSkills = await skillsApi.getMySkills();
        const teachSkills = allSkills.filter((skill) => skill.type === "teach");
        setSkills(teachSkills);

        // If skillId is provided, pre-select it
        if (skillIdFromQuery) {
          const skill = teachSkills.find((s) => s._id === skillIdFromQuery);
          if (skill) {
            setFormData((prev) => ({
              ...prev,
              skillId: skill._id,
              title: skill.title,
              description: skill.description,
              category: skill.category,
              level: skill.level,
              tags: skill.tags || [],
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch skills:", err);
        setError("Failed to load skills");
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [skillIdFromQuery]);

  const handleSkillChange = (e) => {
    const selectedSkill = skills.find((s) => s._id === e.target.value);
    if (selectedSkill) {
      setFormData((prev) => ({
        ...prev,
        skillId: selectedSkill._id,
        title: selectedSkill.title || "",
        description: selectedSkill.description || "",
        category: selectedSkill.category || "",
        level: selectedSkill.level || "beginner",
        tags: selectedSkill.tags || [],
      }));
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "duration" ? parseInt(value) || 0 : value,
    }));
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmed],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleResourceInputChange = (e) => {
    const { name, value } = e.target;
    setResourceInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [resourceError, setResourceError] = useState("");

  const handleAddResource = (e) => {
    e.preventDefault();
    const title = resourceInput.title.trim();
    const url = resourceInput.url.trim();
    if (!title || !url) {
      setResourceError("Resource title and URL are required.");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      resources: [
        ...prev.resources,
        {
          title,
          url,
          type: resourceInput.type,
        },
      ],
    }));
    setResourceInput({ title: "", url: "", type: "pdf" });
    setResourceError("");
  };

  const handleRemoveResource = (index) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, idx) => idx !== index),
    }));
  };

  const handleQuizFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDemoQuizData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "passingScore" || name === "timeLimit"
            ? parseInt(value) || 0
            : value,
    }));
  };

  const handleAddQuestion = () => {
    setDemoQuizData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: "",
          type: "multipleChoice",
          options: [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
          correctAnswer: "Option 1",
          explanation: "",
        },
      ],
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...demoQuizData.questions];
    updatedQuestions[index][field] = value;
    setDemoQuizData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...demoQuizData.questions];
    updatedQuestions[questionIndex].options[optionIndex][field] = value;
    setDemoQuizData((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));
  };

  const handleRemoveQuestion = (index) => {
    setDemoQuizData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    if (!formData.skillId) {
      setError("Please select a skill");
      return false;
    }
    if (!formData.title.trim()) {
      setError("Course title is required");
      return false;
    }
    if (!formData.description.trim()) {
      setError("Course description is required");
      return false;
    }
    if (formData.price < 1) {
      setError("Price must be at least 1 credit");
      return false;
    }
    if (formData.duration < 1) {
      setError("Duration must be at least 1 hour");
      return false;
    }

    if (
      demoQuizData.addDemoQuiz &&
      (!demoQuizData.title.trim() || demoQuizData.questions.length === 0)
    ) {
      setError("Quiz title and at least one question required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError("");

      // Create course first
      const newCourse = await courseApi.createCourse(formData);

      // If demo quiz is enabled, create it
      if (demoQuizData.addDemoQuiz) {
        await demoQuizApi.createDemoQuiz({
          courseId: newCourse._id,
          title: demoQuizData.title,
          description: demoQuizData.description,
          questions: demoQuizData.questions,
          passingScore: demoQuizData.passingScore,
          timeLimit: demoQuizData.timeLimit,
        });
      }

      // Success - redirect to courses list
      navigate("/skills", {
        state: { successMsg: "Course created successfully!" },
      });
    } catch (err) {
      console.error("Failed to create course:", err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.msg ||
          "Failed to create course",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="feature-page">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="feature-page">
      <div className="page-header">
        <h1 className="page-title">Create Course</h1>
        <p className="page-subtitle">
          Create a course from your teaching skill
        </p>
      </div>

      {error && (
        <div
          className="card"
          style={{
            background: "var(--coral-light)",
            borderColor: "var(--coral)",
            color: "var(--text-primary)",
            padding: "16px",
            marginBottom: "24px",
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-card">
        {/* Skill Selection */}
        <div style={{ marginBottom: "24px" }}>
          <label className="form-label">Select Teaching Skill *</label>
          {skills.length === 0 ? (
            <div
              style={{
                padding: "16px",
                backgroundColor: "var(--blue-light)",
                borderRadius: "8px",
                color: "var(--text-primary)",
              }}
            >
              <p style={{ margin: 0 }}>
                ℹ️ You need to create a "teach" skill first before creating a
                course.{" "}
                <a
                  href="/skills"
                  style={{ color: "var(--blue)", textDecoration: "underline" }}
                >
                  Go to skills
                </a>
              </p>
            </div>
          ) : (
            <select
              name="skillId"
              className="select-field"
              value={formData.skillId}
              onChange={handleSkillChange}
              required
            >
              <option value="">Choose a skill...</option>
              {skills.map((skill) => (
                <option key={skill._id} value={skill._id}>
                  {skill.title} ({skill.level})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Course Title */}
        <div style={{ marginBottom: "24px" }}>
          <label className="form-label">Course Title *</label>
          <input
            type="text"
            name="title"
            className="input-field"
            value={formData.title}
            onChange={handleFieldChange}
            placeholder="e.g., Python Programming Basics"
            required
          />
        </div>

        {/* Course Description */}
        <div style={{ marginBottom: "24px" }}>
          <label className="form-label">Course Description *</label>
          <textarea
            name="description"
            className="textarea-field"
            value={formData.description}
            onChange={handleFieldChange}
            placeholder="Describe what students will learn..."
            rows={4}
            required
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: "24px" }}>
          <label className="form-label">Category</label>
          <input
            type="text"
            name="category"
            className="input-field"
            value={formData.category}
            onChange={handleFieldChange}
            placeholder="e.g., Programming, Music"
          />
        </div>

        {/* Course ID */}
        <div style={{ marginBottom: "24px" }}>
          <label className="form-label">Course ID (optional)</label>
          <input
            type="text"
            name="courseCode"
            className="input-field"
            value={formData.courseCode}
            onChange={handleFieldChange}
            placeholder="e.g., PYTHON-BASICS-001"
          />
          <p
            style={{
              marginTop: "8px",
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
            }}
          >
            This will be used as the course identifier for referrals and
            mentorship requests.
          </p>
        </div>

        {/* Level */}
        <div style={{ marginBottom: "24px" }}>
          <label className="form-label">Level</label>
          <select
            name="level"
            className="select-field"
            value={formData.level}
            onChange={handleFieldChange}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Price */}
        <div style={{ marginBottom: "24px" }}>
          <label className="form-label">Price (Credits) *</label>
          <input
            type="number"
            name="price"
            className="input-field"
            value={formData.price}
            onChange={handleFieldChange}
            min="1"
            max="10000"
            required
          />
        </div>

        {/* Duration */}
        <div style={{ marginBottom: "24px" }}>
          <label className="form-label">Duration (hours) *</label>
          <input
            type="number"
            name="duration"
            className="input-field"
            value={formData.duration}
            onChange={handleFieldChange}
            min="1"
            max="500"
            required
          />
        </div>

        {/* Tags */}
        <div style={{ marginBottom: "24px" }}>
          <label className="form-label">Tags</label>
          <div className="tag-input-row">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a tag..."
              className="input-field"
            />
            <button
              type="button"
              className="button-secondary"
              onClick={handleAddTag}
            >
              Add
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {formData.tags.map((tag, index) => (
              <span key={index} className="tag-pill">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)}>
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Course Resources Section */}
        <div
          style={{
            backgroundColor: "#eef6ff",
            padding: "20px",
            borderRadius: "8px",
            border: "2px solid #4f7bff",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h3 style={{ margin: 0, color: "#2f4eed" }}>
              📎 Add Course Resources
            </h3>
            <span style={{ color: "#555", fontSize: "14px" }}>
              Teach-only course materials
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gap: "16px",
              gridTemplateColumns: "1fr 1fr",
              marginBottom: "16px",
            }}
          >
            <div>
              <label className="form-label">Resource Title</label>
              <input
                type="text"
                name="title"
                value={resourceInput.title}
                onChange={handleResourceInputChange}
                className="input-field"
                placeholder="e.g., Course Workbook"
              />
            </div>
            <div>
              <label className="form-label">Resource URL</label>
              <input
                type="text"
                name="url"
                value={resourceInput.url}
                onChange={handleResourceInputChange}
                className="input-field"
                placeholder="https://example.com/material.pdf"
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "flex-end",
              marginBottom: "16px",
            }}
          >
            <div style={{ flex: 1 }}>
              <label className="form-label">Resource Type</label>
              <select
                name="type"
                value={resourceInput.type}
                onChange={handleResourceInputChange}
                className="select-field"
              >
                <option value="pdf">PDF / Document</option>
                <option value="youtube">YouTube / Video</option>
                <option value="link">External Link</option>
              </select>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddResource}
              style={{ padding: "12px 16px", height: "44px" }}
            >
              Add Resource
            </button>
          </div>

          {resourceError && (
            <div
              style={{
                marginBottom: "16px",
                color: "#b91c1c",
                fontSize: "0.95rem",
              }}
            >
              {resourceError}
            </div>
          )}

          {formData.resources.length > 0 ? (
            <div style={{ display: "grid", gap: "12px" }}>
              {formData.resources.map((resource, index) => (
                <div
                  key={`${resource.url}-${index}`}
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "white",
                    border: "1px solid #d6e4ff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{resource.title}</div>
                    <div style={{ color: "#555", fontSize: "13px" }}>
                      {resource.type.toUpperCase()} • {resource.url}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveResource(index)}
                    className="button-secondary"
                    style={{ padding: "8px 12px" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                padding: "14px",
                backgroundColor: "#f7fbff",
                borderRadius: "8px",
                border: "1px dashed #4f7bff",
                color: "#4a6bff",
              }}
            >
              Add PDF links, YouTube or external resource links for students.
            </div>
          )}
        </div>

        {/* Demo Quiz Section */}
        <div
          style={{
            backgroundColor: "#f0f4ff",
            padding: "20px",
            borderRadius: "8px",
            border: "2px solid #667eea",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => setExpandQuizSection(!expandQuizSection)}
          >
            <h3 style={{ margin: 0, color: "#667eea" }}>
              📝 Add Demo Quiz (Optional)
            </h3>
            {expandQuizSection ? (
              <ChevronUp size={20} style={{ color: "#667eea" }} />
            ) : (
              <ChevronDown size={20} style={{ color: "#667eea" }} />
            )}
          </div>

          {expandQuizSection && (
            <div style={{ marginTop: "16px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  marginBottom: "16px",
                }}
              >
                <input
                  type="checkbox"
                  name="addDemoQuiz"
                  checked={demoQuizData.addDemoQuiz}
                  onChange={handleQuizFieldChange}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
                <span style={{ fontWeight: "600" }}>Include Demo Quiz</span>
              </label>

              {demoQuizData.addDemoQuiz && (
                <>
                  {/* Quiz Title */}
                  <div style={{ marginBottom: "16px" }}>
                    <label className="form-label">Quiz Title *</label>
                    <input
                      type="text"
                      name="title"
                      className="input-field"
                      value={demoQuizData.title}
                      onChange={(e) =>
                        setDemoQuizData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="e.g., Python Basics Quiz"
                    />
                  </div>

                  {/* Quiz Description */}
                  <div style={{ marginBottom: "16px" }}>
                    <label className="form-label">Quiz Description</label>
                    <textarea
                      name="description"
                      className="textarea-field"
                      value={demoQuizData.description}
                      onChange={(e) =>
                        setDemoQuizData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe what this quiz covers..."
                      rows={3}
                    />
                  </div>

                  {/* Passing Score */}
                  <div
                    style={{
                      marginBottom: "16px",
                      display: "flex",
                      gap: "16px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <label className="form-label">Passing Score (%)</label>
                      <input
                        type="number"
                        name="passingScore"
                        className="input-field"
                        value={demoQuizData.passingScore}
                        onChange={handleQuizFieldChange}
                        min="0"
                        max="100"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="form-label">Time Limit (minutes)</label>
                      <input
                        type="number"
                        name="timeLimit"
                        className="input-field"
                        value={demoQuizData.timeLimit}
                        onChange={handleQuizFieldChange}
                        min="5"
                        max="180"
                      />
                    </div>
                  </div>

                  {/* Questions */}
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <label className="form-label">Quiz Questions</label>
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="btn btn-primary"
                        style={{ fontSize: "12px", padding: "6px 12px" }}
                      >
                        + Add Question
                      </button>
                    </div>

                    {demoQuizData.questions.length === 0 ? (
                      <div
                        style={{
                          padding: "16px",
                          backgroundColor: "#fff9e6",
                          borderRadius: "4px",
                          border: "1px solid #ffe6b3",
                        }}
                      >
                        <p style={{ margin: 0, color: "#666" }}>
                          No questions added yet. Click "Add Question" to start.
                        </p>
                      </div>
                    ) : (
                      demoQuizData.questions.map((question, qIdx) => (
                        <div
                          key={qIdx}
                          style={{
                            padding: "12px",
                            backgroundColor: "white",
                            borderRadius: "4px",
                            border: "1px solid #ddd",
                            marginBottom: "12px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "start",
                              marginBottom: "8px",
                            }}
                          >
                            <strong>Question {qIdx + 1}</strong>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIdx)}
                              style={{
                                background: "var(--coral)",
                                color: "white",
                                border: "none",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                              }}
                            >
                              Remove
                            </button>
                          </div>

                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) =>
                              handleQuestionChange(
                                qIdx,
                                "question",
                                e.target.value,
                              )
                            }
                            placeholder="Enter question text"
                            style={{
                              width: "100%",
                              padding: "8px",
                              marginBottom: "8px",
                              borderRadius: "4px",
                              border: "1px solid #ddd",
                              fontSize: "14px",
                            }}
                          />

                          <div style={{ marginBottom: "8px" }}>
                            <small style={{ color: "#666" }}>Options:</small>
                            {question.options.map((option, oIdx) => (
                              <div
                                key={oIdx}
                                style={{
                                  display: "flex",
                                  gap: "8px",
                                  marginTop: "4px",
                                }}
                              >
                                <input
                                  type="text"
                                  value={option.text}
                                  onChange={(e) =>
                                    handleOptionChange(
                                      qIdx,
                                      oIdx,
                                      "text",
                                      e.target.value,
                                    )
                                  }
                                  placeholder={`Option ${oIdx + 1}`}
                                  style={{
                                    flex: 1,
                                    padding: "6px",
                                    borderRadius: "4px",
                                    border: "1px solid #ddd",
                                    fontSize: "12px",
                                  }}
                                />
                                <label
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    fontSize: "12px",
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={option.isCorrect}
                                    onChange={(e) =>
                                      handleOptionChange(
                                        qIdx,
                                        oIdx,
                                        "isCorrect",
                                        e.target.checked,
                                      )
                                    }
                                    style={{ cursor: "pointer" }}
                                  />
                                  Correct
                                </label>
                              </div>
                            ))}
                          </div>

                          <textarea
                            value={question.explanation}
                            onChange={(e) =>
                              handleQuestionChange(
                                qIdx,
                                "explanation",
                                e.target.value,
                              )
                            }
                            placeholder="Explanation (optional)"
                            style={{
                              width: "100%",
                              padding: "6px",
                              borderRadius: "4px",
                              border: "1px solid #ddd",
                              fontSize: "12px",
                              marginTop: "8px",
                              minHeight: "50px",
                            }}
                          />
                        </div>
                      ))
                    )}
                  </div>

                  <div
                    style={{
                      backgroundColor: "#fff9e6",
                      padding: "12px",
                      borderRadius: "4px",
                      border: "1px solid #ffe6b3",
                    }}
                  >
                    <small style={{ color: "#666" }}>
                      💡 Students can practice with this demo quiz before
                      purchasing the course
                    </small>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || skills.length === 0}
            style={{ opacity: submitting || skills.length === 0 ? 0.5 : 1 }}
          >
            {submitting ? "Creating..." : "Create Course"}
          </button>
          <button
            type="button"
            className="btn button-secondary"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
