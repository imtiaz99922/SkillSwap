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
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <div>
          <h1
            style={{
              marginBottom: "24px",
              fontSize: "28px",
              fontWeight: "700",
            }}
          >
            {isBookingView ? "📅 Book a Time Slot" : "📅 Manage Availability"}
          </h1>
          {isBookingView && (
            <div style={{ color: "#475569", maxWidth: "720px" }}>
              Select an available slot from the listed time windows. Once you
              book a slot, the owner will be notified.
            </div>
          )}
        </div>
        {isBookingView && (
          <button
            onClick={() => navigate("/availability")}
            style={{
              padding: "12px 18px",
              backgroundColor: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 600,
              height: "48px",
            }}
          >
            Back to my availability
          </button>
        )}
      </div>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            borderRadius: "6px",
          }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            backgroundColor: "#d1fae5",
            color: "#065f46",
            borderRadius: "6px",
          }}
        >
          {success}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "48px", color: "#9ca3af" }}>
          Loading time slots...
        </div>
      ) : isBookingView ? (
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          {slots && slots.length > 0 ? (
            slots.map((slot) => (
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
                  <div style={{ fontWeight: "600" }}>
                    {new Date(slot.date).toLocaleDateString()}
                  </div>
                  <div style={{ color: "#475569", marginTop: "6px" }}>
                    {slot.startTime} - {slot.endTime}
                  </div>
                </div>
                <button
                  onClick={() => handleBookSlot(slot._id)}
                  style={{
                    padding: "10px 18px",
                    backgroundColor: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Book Slot
                </button>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                color: "#9ca3af",
              }}
            >
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
