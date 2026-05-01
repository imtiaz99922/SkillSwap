import React, { useState } from "react";
import { FaCheck, FaTimes, FaCheckCircle } from "react-icons/fa";

export default function MentorshipCard({
  mentorship,
  onAccept,
  onReject,
  onComplete,
}) {
  const [rating, setRating] = useState(5);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const handleCompleteClick = () => {
    if (mentorship.status === "COMPLETED") return;
    setShowRatingModal(true);
  };

  const handleSubmitRating = () => {
    onComplete(rating);
    setShowRatingModal(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
      <div className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">
            {mentorship.skillId?.title}
          </h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              mentorship.status === "ACTIVE"
                ? "bg-green-100 text-green-800"
                : mentorship.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : mentorship.status === "COMPLETED"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-red-100 text-red-800"
            }`}
          >
            {mentorship.status}
          </span>
        </div>
        <p className="text-sm text-gray-600">
          Category: {mentorship.skillId?.category}
        </p>
      </div>

      <div className="mb-4 text-sm text-gray-700 space-y-1">
        <p>
          <strong>Mentor:</strong> {mentorship.mentorId?.name}
        </p>
        <p>
          <strong>Mentee:</strong> {mentorship.menteeId?.name}
        </p>
        <p>
          <strong>Sessions:</strong> {mentorship.sessionsCompleted}/
          {mentorship.totalSessions}
        </p>
        <p>
          <strong>Progress:</strong> {mentorship.progress}%
        </p>
      </div>

      {mentorship.progress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
            style={{ width: `${mentorship.progress}%` }}
          />
        </div>
      )}

      {mentorship.status === "PENDING" && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={onAccept}
            className="flex-1 flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded transition"
          >
            <FaCheck /> Accept
          </button>
          <button
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
          >
            <FaTimes /> Reject
          </button>
        </div>
      )}

      {mentorship.status === "ACTIVE" && (
        <button
          onClick={handleCompleteClick}
          className="w-full flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition mt-4"
        >
          <FaCheckCircle /> Complete
        </button>
      )}

      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h2 className="text-xl font-bold mb-4">Rate Mentorship</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Rating (1-5 stars)
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSubmitRating}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
              >
                Submit
              </button>
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
