import React, { useState } from "react";
import { Upload, AlertCircle } from "lucide-react";

export default function SkillForm({ skill, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    title: skill?.title || "",
    description: skill?.description || "",
    category: skill?.category || "",
    type: skill?.type || "learn",
    level: skill?.level || "beginner",
    tags: skill?.tags || [],
    // Course teaching fields
    price: skill?.price || 0,
    duration: skill?.duration || 1,
    courseDescription: skill?.courseDescription || "",
  });
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});
  const [materialsFile, setMaterialsFile] = useState(null);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [quizDetails, setQuizDetails] = useState({
    title: "",
    questions: [],
    timeLimit: 30,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 150) {
      newErrors.title = "Title must be 150 characters or less";
    }

    if (!formData.type) {
      newErrors.type = "Type is required";
    }

    if (!formData.level) {
      newErrors.level = "Level is required";
    }

    if (formData.category && formData.category.length > 80) {
      newErrors.category = "Category must be 80 characters or less";
    }

    // Teaching-specific validation
    if (formData.type === "teach") {
      if (!formData.price || formData.price < 0) {
        newErrors.price = "Price must be greater than 0";
      }
      if (!formData.duration || formData.duration < 1) {
        newErrors.duration = "Duration must be at least 1 hour";
      }
      if (!formData.courseDescription.trim()) {
        newErrors.courseDescription =
          "Course description is required for teaching";
      }
      if (hasQuiz && !quizDetails.title.trim()) {
        newErrors.quizTitle =
          "Quiz title is required if you want to include a quiz";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = { ...formData };

      // If it's a teaching course, add quiz info
      if (formData.type === "teach" && hasQuiz) {
        submitData.hasDemoQuiz = true;
        submitData.quizTitle = quizDetails.title;
        submitData.quizTimeLimit = quizDetails.timeLimit;
      }

      // Include materials file if provided
      if (materialsFile && formData.type === "teach") {
        submitData.materialsFile = materialsFile;
      }

      onSubmit(submitData);
    }
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <div style={{ marginBottom: "24px" }}>
        <label className="form-label">Title *</label>
        <input
          type="text"
          name="title"
          className="input-field"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g., Python Programming, Guitar Lessons"
        />
        {errors.title && <p className="field-error">{errors.title}</p>}
      </div>

      <div style={{ marginBottom: "24px" }}>
        <label className="form-label">Description</label>
        <textarea
          name="description"
          className="textarea-field"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe what you can teach or want to learn..."
          rows={4}
        />
      </div>

      <div style={{ marginBottom: "24px" }}>
        <label className="form-label">Category</label>
        <input
          type="text"
          name="category"
          className="input-field"
          value={formData.category}
          onChange={handleChange}
          placeholder="e.g., Programming, Music, Languages"
        />
        {errors.category && <p className="field-error">{errors.category}</p>}
      </div>

      <div style={{ marginBottom: "24px" }}>
        <label className="form-label">Type *</label>
        <select
          name="type"
          className="select-field"
          value={formData.type}
          onChange={handleChange}
        >
          <option value="learn">I want to learn this</option>
          <option value="teach">I can teach this</option>
        </select>
        {errors.type && <p className="field-error">{errors.type}</p>}
      </div>

      <div style={{ marginBottom: "24px" }}>
        <label className="form-label">Level *</label>
        <select
          name="level"
          className="select-field"
          value={formData.level}
          onChange={handleChange}
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        {errors.level && <p className="field-error">{errors.level}</p>}
      </div>

      {/* Teaching-Specific Fields */}
      {formData.type === "teach" && (
        <div
          style={{
            backgroundColor: "#f0f4ff",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "24px",
            border: "2px solid #667eea",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#667eea", marginBottom: "16px" }}>
            📚 Course Setup (I can teach this)
          </h3>

          {/* Price */}
          <div style={{ marginBottom: "20px" }}>
            <label className="form-label">💰 Course Price (Credits) *</label>
            <input
              type="number"
              name="price"
              className="input-field"
              value={formData.price}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  price: parseInt(e.target.value) || 0,
                }));
                if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
              }}
              placeholder="Enter course price in credits"
              min="1"
              max="10000"
            />
            <small style={{ color: "#666" }}>
              💡 Set your custom price for this course
            </small>
            {errors.price && <p className="field-error">{errors.price}</p>}
          </div>

          {/* Duration */}
          <div style={{ marginBottom: "20px" }}>
            <label className="form-label">⏱️ Course Duration (hours) *</label>
            <input
              type="number"
              name="duration"
              className="input-field"
              value={formData.duration}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  duration: parseInt(e.target.value) || 1,
                }));
                if (errors.duration)
                  setErrors((prev) => ({ ...prev, duration: "" }));
              }}
              placeholder="How many hours to complete this course?"
              min="1"
              max="500"
            />
            <small style={{ color: "#666" }}>
              ⏰ Total estimated time for students to complete the course
            </small>
            {errors.duration && (
              <p className="field-error">{errors.duration}</p>
            )}
          </div>

          {/* Course Description */}
          <div style={{ marginBottom: "20px" }}>
            <label className="form-label">📝 Course Description *</label>
            <textarea
              name="courseDescription"
              className="textarea-field"
              value={formData.courseDescription}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  courseDescription: e.target.value,
                }));
                if (errors.courseDescription)
                  setErrors((prev) => ({ ...prev, courseDescription: "" }));
              }}
              placeholder="Describe what students will learn in this course..."
              rows={4}
            />
            <small style={{ color: "#666" }}>
              📢 This will be shown to potential students
            </small>
            {errors.courseDescription && (
              <p className="field-error">{errors.courseDescription}</p>
            )}
          </div>

          {/* Upload Materials */}
          <div style={{ marginBottom: "20px" }}>
            <label className="form-label">📂 Course Materials (Optional)</label>
            <div
              style={{
                border: "2px dashed #667eea",
                borderRadius: "8px",
                padding: "16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.backgroundColor = "#f0f4ff";
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.backgroundColor = "transparent";
                if (e.dataTransfer.files[0]) {
                  setMaterialsFile(e.dataTransfer.files[0]);
                }
              }}
            >
              <Upload
                size={24}
                style={{ marginBottom: "8px", color: "#667eea" }}
              />
              <p style={{ marginBottom: "8px" }}>
                Drag and drop materials here or click to browse
              </p>
              <input
                type="file"
                onChange={(e) => setMaterialsFile(e.target.files?.[0] || null)}
                style={{ display: "none" }}
                id="materials-upload"
              />
              <label
                htmlFor="materials-upload"
                style={{
                  display: "inline-block",
                  padding: "8px 16px",
                  background: "#667eea",
                  color: "white",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Choose File
              </label>
              {materialsFile && (
                <p style={{ marginTop: "8px", color: "#2ecc71" }}>
                  ✅ {materialsFile.name}
                </p>
              )}
            </div>
            <small style={{ color: "#666" }}>
              Upload PDF, videos, documents, or resources for your course
            </small>
          </div>

          {/* Add Quiz */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={hasQuiz}
                onChange={(e) => setHasQuiz(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
              <span style={{ fontWeight: "600" }}>📝 Add a Demo Quiz</span>
            </label>
            <small
              style={{ color: "#666", display: "block", marginTop: "4px" }}
            >
              Students can practice before purchasing
            </small>
          </div>

          {/* Quiz Setup */}
          {hasQuiz && (
            <div
              style={{
                backgroundColor: "white",
                padding: "16px",
                borderRadius: "6px",
                border: "1px solid #ddd",
                marginBottom: "16px",
              }}
            >
              <h4 style={{ marginTop: 0, color: "#333" }}>Quiz Details</h4>

              <div style={{ marginBottom: "12px" }}>
                <label className="form-label">Quiz Title *</label>
                <input
                  type="text"
                  className="input-field"
                  value={quizDetails.title}
                  onChange={(e) => {
                    setQuizDetails((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }));
                    if (errors.quizTitle)
                      setErrors((prev) => ({ ...prev, quizTitle: "" }));
                  }}
                  placeholder="e.g., Python Basics Quiz"
                />
                {errors.quizTitle && (
                  <p className="field-error">{errors.quizTitle}</p>
                )}
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label className="form-label">Time Limit (minutes)</label>
                <input
                  type="number"
                  className="input-field"
                  value={quizDetails.timeLimit}
                  onChange={(e) => {
                    setQuizDetails((prev) => ({
                      ...prev,
                      timeLimit: parseInt(e.target.value) || 30,
                    }));
                  }}
                  placeholder="Minutes to complete quiz"
                  min="5"
                  max="180"
                />
              </div>

              <div
                style={{
                  backgroundColor: "#fff9e6",
                  padding: "12px",
                  borderRadius: "4px",
                  border: "1px solid #ffe6b3",
                  display: "flex",
                  gap: "8px",
                }}
              >
                <AlertCircle
                  size={18}
                  style={{ color: "#ff9800", flexShrink: 0 }}
                />
                <small style={{ color: "#666" }}>
                  You can add detailed quiz questions after creating the course
                </small>
              </div>
            </div>
          )}

          <div
            style={{
              backgroundColor: "white",
              padding: "12px",
              borderRadius: "4px",
              border: "1px solid #e0e0e0",
              marginTop: "12px",
            }}
          >
            <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
              ✅ Course will be published and visible to students
            </p>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#666" }}>
              ✅ You can edit materials and quiz later
            </p>
          </div>
        </div>
      )}

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

      <div style={{ display: "flex", gap: "14px", justifyContent: "flex-end" }}>
        <button type="button" className="button-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button-primary" disabled={loading}>
          {loading ? "Saving..." : skill ? "Update Skill" : "Create Skill"}
        </button>
      </div>
    </form>
  );
}
