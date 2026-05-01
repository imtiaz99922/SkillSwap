import React, { useState } from "react";
import { FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";

export default function AvailabilityManager({
  slots,
  onCreateSlot,
  onDeleteSlot,
  onUpdateSlot,
  loading,
}) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });
  const [editingId, setEditingId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      onUpdateSlot(
        editingId,
        formData.date,
        formData.startTime,
        formData.endTime,
      );
      setEditingId(null);
    } else {
      onCreateSlot(formData.date, formData.startTime, formData.endTime);
    }
    setFormData({ date: "", startTime: "", endTime: "" });
    setShowForm(false);
  };

  const handleEdit = (slot) => {
    setFormData({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
    setEditingId(slot._id);
    setShowForm(true);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Add Slot Button */}
      <button
        onClick={() => {
          setShowForm(!showForm);
          setEditingId(null);
          setFormData({ date: "", startTime: "", endTime: "" });
        }}
        style={{
          marginBottom: "24px",
          padding: "12px 24px",
          backgroundColor: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "500",
        }}
      >
        {showForm ? "Cancel" : "+ Add Time Slot"}
      </button>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: "#f9fafb",
            padding: "24px",
            borderRadius: "8px",
            marginBottom: "24px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h3 style={{ marginBottom: "16px", fontWeight: "600" }}>
            {editingId ? "Edit Time Slot" : "Create New Time Slot"}
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                Start Time
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                End Time
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "10px 24px",
              backgroundColor: loading ? "#d1d5db" : "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "500",
            }}
          >
            {loading ? "Saving..." : editingId ? "Update Slot" : "Create Slot"}
          </button>
        </form>
      )}

      {/* Slots List */}
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #e5e7eb",
            fontWeight: "600",
          }}
        >
          Your Time Slots
        </div>

        {slots && slots.length > 0 ? (
          <div>
            {slots.map((slot) => (
              <div
                key={slot._id}
                style={{
                  padding: "16px",
                  borderBottom: "1px solid #f3f4f6",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: "500" }}>
                    {new Date(slot.date).toLocaleDateString()}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      marginTop: "4px",
                    }}
                  >
                    {slot.startTime} - {slot.endTime}
                  </div>
                  {slot.booked && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#ef4444",
                        marginTop: "4px",
                        fontWeight: "500",
                      }}
                    >
                      ⚠️ Booked
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleEdit(slot)}
                    disabled={slot.booked}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: slot.booked ? "#d1d5db" : "#2563eb",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: slot.booked ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <FaEdit size={14} />
                  </button>
                  <button
                    onClick={() => onDeleteSlot(slot._id)}
                    disabled={slot.booked || loading}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: slot.booked ? "#d1d5db" : "#ef4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: slot.booked ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              color: "#9ca3af",
            }}
          >
            No time slots created yet
          </div>
        )}
      </div>
    </div>
  );
}
