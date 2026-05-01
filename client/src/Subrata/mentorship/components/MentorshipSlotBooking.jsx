import React, { useState } from "react";
import { FaCalendarAlt, FaClock, FaPlus, FaTrash } from "react-icons/fa";

export default function MentorshipSlotBooking({ mentorship, onUpdate }) {
  const [slots, setSlots] = useState(mentorship?.preferredTimeSlots || []);
  const [newSlot, setNewSlot] = useState({
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
  });
  const [showForm, setShowForm] = useState(false);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleAddSlot = () => {
    if (!newSlot.day || !newSlot.startTime || !newSlot.endTime) {
      alert("Please fill all fields");
      return;
    }

    if (newSlot.startTime >= newSlot.endTime) {
      alert("Start time must be before end time");
      return;
    }

    setSlots([...slots, newSlot]);
    setNewSlot({ day: "Monday", startTime: "09:00", endTime: "10:00" });
    setShowForm(false);
  };

  const handleRemoveSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSaveSlots = () => {
    if (onUpdate) {
      onUpdate(slots);
    }
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: "20px",
          fontSize: "1.3rem",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <FaCalendarAlt /> Available Time Slots
      </h3>

      {/* Slots List */}
      {slots.length > 0 ? (
        <div
          style={{
            display: "grid",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          {slots.map((slot, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px",
                background: "#f5f5f5",
                borderRadius: "8px",
                border: "1px solid #e0e0e0",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "15px" }}
              >
                <div
                  style={{
                    minWidth: "100px",
                    fontWeight: "600",
                    color: "#667eea",
                  }}
                >
                  {slot.day}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#666",
                  }}
                >
                  <FaClock style={{ fontSize: "0.9rem" }} />
                  {slot.startTime} - {slot.endTime}
                </div>
              </div>
              <button
                onClick={() => handleRemoveSlot(idx)}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "0.9rem",
                }}
              >
                <FaTrash /> Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            background: "#f9f9f9",
            borderRadius: "8px",
            marginBottom: "20px",
            color: "#999",
          }}
        >
          No time slots added yet
        </div>
      )}

      {/* Add New Slot Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: "100%",
            padding: "12px",
            background: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "15px",
          }}
        >
          <FaPlus /> Add Time Slot
        </button>
      ) : (
        <div
          style={{
            padding: "16px",
            background: "#f5f5f5",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        >
          <h4 style={{ marginTop: 0, marginBottom: "12px" }}>Add New Slot</h4>

          <div style={{ display: "grid", gap: "12px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: "600",
                  marginBottom: "6px",
                }}
              >
                Day
              </label>
              <select
                value={newSlot.day}
                onChange={(e) =>
                  setNewSlot({ ...newSlot, day: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
              >
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "6px",
                  }}
                >
                  Start Time
                </label>
                <input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, startTime: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "6px",
                  }}
                >
                  End Time
                </label>
                <input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, endTime: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}
            >
              <button
                onClick={() => setShowForm(false)}
                style={{
                  padding: "8px",
                  background: "#e0e0e0",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddSlot}
                style={{
                  padding: "8px",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Add Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      {slots.length > 0 && (
        <button
          onClick={handleSaveSlots}
          style={{
            width: "100%",
            padding: "12px",
            background: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Save Slots
        </button>
      )}
    </div>
  );
}
