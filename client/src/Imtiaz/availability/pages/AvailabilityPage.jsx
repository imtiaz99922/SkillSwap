import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AvailabilityManager from "../components/AvailabilityManager";
import { availabilityApi } from "../services/availabilityApi";
import "../../../styles/ModernDesign.css";

export default function AvailabilityPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const queryParams = new URLSearchParams(location.search);
  const targetUserId = queryParams.get("user");
  const isBookingView = Boolean(targetUserId);

  useEffect(() => {
    fetchSlots();
  }, [targetUserId]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const data = isBookingView
        ? await availabilityApi.getUserAvailability(targetUserId)
        : await availabilityApi.getMyAvailability();
      const slotList = Array.isArray(data) ? data : data.slots || [];
      setSlots(slotList);
    } catch (err) {
      console.error("Failed to fetch slots:", err);
      setError("Failed to load time slots");
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (slotId) => {
    try {
      setError("");
      setSuccess("");
      await availabilityApi.bookSlot(slotId);
      setSuccess("Slot booked successfully.");
      fetchSlots();
    } catch (err) {
      console.error("Failed to book slot:", err);
      setError(err?.response?.data?.msg || "Failed to book slot");
    }
  };

  const handleCreateSlot = async (date, startTime, endTime) => {
    try {
      setError("");
      await availabilityApi.createSlot(date, startTime, endTime);
      fetchSlots();
    } catch (err) {
      console.error("Failed to create slot:", err);
      setError(err?.response?.data?.msg || "Failed to create time slot");
    }
  };

  const handleUpdateSlot = async (slotId, date, startTime, endTime) => {
    try {
      setError("");
      await availabilityApi.updateSlot(slotId, date, startTime, endTime);
      fetchSlots();
    } catch (err) {
      console.error("Failed to update slot:", err);
      setError(err?.response?.data?.msg || "Failed to update time slot");
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (window.confirm("Are you sure you want to delete this time slot?")) {
      try {
        setError("");
        await availabilityApi.deleteSlot(slotId);
        fetchSlots();
      } catch (err) {
        console.error("Failed to delete slot:", err);
        setError(err?.response?.data?.msg || "Failed to delete time slot");
      }
    }
  };

  return (
    <div className="feature-page">
      <div className="section-header">
        <div>
          <h1 className="section-title">
            {isBookingView ? "📅 Book a Time Slot" : "📅 Manage Availability"}
          </h1>
          {isBookingView && (
            <p className="section-copy">
              Select an available slot from the listed time windows. Once you
              book a slot, the owner will be notified.
            </p>
          )}
        </div>
        {isBookingView && (
          <button
            className="button-secondary"
            onClick={() => navigate("/availability")}
          >
            Back to my availability
          </button>
        )}
      </div>

      {error && <div className="field-error">{error}</div>}
      {success && (
        <div
          className="status-chip"
          style={{
            background: "rgba(16,185,129,0.14)",
            borderColor: "rgba(16,185,129,0.32)",
            color: "#a7f3d0",
          }}
        >
          {success}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading time slots...</div>
      ) : isBookingView ? (
        <div className="card">
          {slots && slots.length > 0 ? (
            slots.map((slot) => (
              <div
                key={slot._id}
                style={{
                  padding: "18px",
                  borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: "600", color: "#e2e8f0" }}>
                    {new Date(slot.date).toLocaleDateString()}
                  </div>
                  <div style={{ color: "#94a3b8", marginTop: "6px" }}>
                    {slot.startTime} - {slot.endTime}
                  </div>
                </div>
                <button
                  className="button-primary"
                  onClick={() => handleBookSlot(slot._id)}
                >
                  Book Slot
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state-card">
              No available time slots were found for this user. Please try again
              later.
            </div>
          )}
        </div>
      ) : (
        <AvailabilityManager
          slots={slots}
          onCreateSlot={handleCreateSlot}
          onUpdateSlot={handleUpdateSlot}
          onDeleteSlot={handleDeleteSlot}
          loading={loading}
        />
      )}
    </div>
  );
}
