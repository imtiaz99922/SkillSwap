import React, { useState, useEffect } from "react";
import SkillCard from "../components/SkillCard";
import SkillForm from "../components/SkillForm";
import { skillsApi } from "../services/skillsApi";

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const data = await skillsApi.getMySkills();
      setSkills(data);
    } catch (err) {
      console.error("Failed to fetch skills:", err);
      setError("Failed to load skills");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSkill = async (skillData) => {
    try {
      setFormLoading(true);
      setError("");
      const newSkill = await skillsApi.createSkill(skillData);
      setSkills((prev) => [newSkill, ...prev]);
      setShowForm(false);
    } catch (err) {
      console.error("Failed to create skill:", err);
      setError(err?.response?.data?.msg || "Failed to create skill");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateSkill = async (skillData) => {
    try {
      setFormLoading(true);
      setError("");
      const updatedSkill = await skillsApi.updateSkill(
        editingSkill._id,
        skillData,
      );
      setSkills((prev) =>
        prev.map((skill) =>
          skill._id === editingSkill._id ? updatedSkill : skill,
        ),
      );
      setShowForm(false);
      setEditingSkill(null);
    } catch (err) {
      console.error("Failed to update skill:", err);
      setError(err?.response?.data?.msg || "Failed to update skill");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) {
      return;
    }

    try {
      await skillsApi.deleteSkill(skillId);
      setSkills((prev) => prev.filter((skill) => skill._id !== skillId));
    } catch (err) {
      console.error("Failed to delete skill:", err);
      setError("Failed to delete skill");
    }
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSkill(null);
    setError("");
  };

  const handleFormSubmit = (skillData) => {
    if (editingSkill) {
      handleUpdateSkill(skillData);
    } else {
      handleCreateSkill(skillData);
    }
  };

  if (showForm) {
    return (
      <div className="page-shell">
        <div className="hero-panel">
          <button className="button-secondary" onClick={handleCancel}>
            ← Back to Skills
          </button>
          <h1>{editingSkill ? "Edit Skill" : "Add New Skill"}</h1>
          <p className="section-copy">
            Create a beautifully designed skill card and share what you can
            teach or want to learn.
          </p>
        </div>

        {error && <div className="field-error">{error}</div>}

        <SkillForm
          skill={editingSkill}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          loading={formLoading}
        />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="hero-panel">
        <h1>🎯 My Skills</h1>
        <p className="section-copy">
          Manage the skills you want to learn or can teach to others with a
          clean, expressive interface.
        </p>
        <button className="button-primary" onClick={() => setShowForm(true)}>
          ➕ Add Skill
        </button>
      </div>

      {error && <div className="field-error">{error}</div>}

      {loading ? (
        <div className="empty-state-card">Loading your skills...</div>
      ) : skills.length === 0 ? (
        <div className="empty-state-card">
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎯</div>
          <h3>No skills yet</h3>
          <p>
            Start by adding skills you want to learn or can teach to others.
          </p>
          <button className="button-primary" onClick={() => setShowForm(true)}>
            Add Your First Skill
          </button>
        </div>
      ) : (
        <div className="card-grid">
          {skills.map((skill) => (
            <SkillCard
              key={skill._id}
              skill={skill}
              onEdit={handleEdit}
              onDelete={handleDeleteSkill}
            />
          ))}
        </div>
      )}
    </div>
  );
}
