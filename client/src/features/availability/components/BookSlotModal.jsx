import React, { useState, useEffect } from "react";
import { FaTimes, FaClock, FaCheckCircle } from "react-icons/fa";
import { availabilityApi } from "../services/availabilityApi";

export default function BookSlotModal({
  userId,
  userName,
  isOpen,
  onClose,
  onSlotBooked,
}) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bookingSlotId, setBookingSlotId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableSlots();
    }
  }, [isOpen, userId]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await availabilityApi.getUserAvailability(userId);
      const slotList = Array.isArray(data) ? data : data.slots || [];
      // Filter only available (not booked) slots
      const availableSlots = slotList.filter(
        (slot) => slot.status === "available" || !slot.status,
      );
      setSlots(availableSlots);
    } catch (err) {
      console.error("Failed to fetch slots:", err);
      setError("Failed to load available time slots");
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async (slotId) => {
    try {
      setBookingSlotId(slotId);
      setError("");
      await availabilityApi.bookSlot(slotId);
      setSuccess("Slot booked successfully!");
      setTimeout(() => {
        onSlotBooked?.();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Failed to book slot:", err);
      setError(
        err?.response?.data?.msg || "Failed to book slot. Please try again.",
      );
      setBookingSlotId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":").slice(0, 2);
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          maxWidth: "500px",
          width: "100%",
          maxHeight: "80vh",
          overflow: "auto",
          padding: "32px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: "2px solid #f3f4f6",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 8px 0",
                fontSize: "24px",
                fontWeight: "700",
              }}
            >
              Book a Time Slot
            </h2>
            <p style={{ margin: "0", color: "#6b7280", fontSize: "14px" }}>
              with {userName}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#6b7280",
              padding: "0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "16px",
              color: "#991b1b",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            style={{
              backgroundColor: "#d1fae5",
              border: "1px solid #a7f3d0",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "16px",
              color: "#065f46",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaCheckCircle /> {success}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div
            style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}
          >
            Loading available time slots...
          </div>
        ) : slots.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}
          >
            <FaClock size={32} style={{ marginBottom: "16px", opacity: 0.5 }} />
            <p>No available time slots at the moment.</p>
            <p style={{ fontSize: "14px", marginTop: "8px" }}>
              Please check back later or try another instructor.
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {slots.map((slot) => (
              <div
                key={slot._id}
                style={{
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s ease",
                  backgroundColor: "#f9fafb",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#3b82f6";
                  e.currentTarget.style.backgroundColor = "#eff6ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: "16px",
                      marginBottom: "6px",
                    }}
                  >
                    {formatDate(slot.date)}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      color: "#4b5563",
                      fontSize: "14px",
                    }}
                  >
                    <FaClock size={14} />
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </div>
                </div>
                <button
                  onClick={() => handleBookSlot(slot._id)}
                  disabled={bookingSlotId === slot._id}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    cursor:
                      bookingSlotId === slot._id ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    opacity: bookingSlotId === slot._id ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (bookingSlotId !== slot._id) {
                      e.target.style.backgroundColor = "#059669";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#10b981";
                  }}
                >
                  {bookingSlotId === slot._id ? "Booking..." : "Book"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <button
          onClick={onClose}
          style={{
            width: "100%",
            marginTop: "24px",
            padding: "12px 16px",
            backgroundColor: "#f3f4f6",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
            fontSize: "14px",
            color: "#374151",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#e5e7eb";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#f3f4f6";
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
