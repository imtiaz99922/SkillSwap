import React, { useState } from "react";

export default function SkillForm({ skill, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    title: skill?.title || "",
    description: skill?.description || "",
    category: skill?.category || "",
    type: skill?.type || "learn",
    level: skill?.level || "beginner",
    tags: skill?.tags || [],
  });
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
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
