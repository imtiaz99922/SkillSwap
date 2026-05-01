import React from "react";
import {
  FaPlay,
  FaStop,
  FaCheckCircle,
  FaTimes,
  FaCheck,
  FaClock,
} from "react-icons/fa";

export default function SessionCard({
  session,
  onStart,
  onEnd,
  onConfirm,
  onCancel,
}) {
  const getStatusBadge = () => {
    switch (session.status) {
      case "SCHEDULED":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold">
            SCHEDULED
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
            IN PROGRESS
          </span>
        );
      case "COMPLETED":
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
            COMPLETED
          </span>
        );
      case "CANCELLED":
        return (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold">
            CANCELLED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {session.skillId?.title}
          </h3>
          <p className="text-sm text-gray-600">{session.skillId?.category}</p>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-700">
        <p>
          <strong>Mentor:</strong> {session.mentorId?.name}
        </p>
        <p>
          <strong>Mentee:</strong> {session.menteeId?.name}
        </p>
        <p>
          <strong>Start:</strong> {new Date(session.startTime).toLocaleString()}
        </p>
        {session.duration && (
          <p>
            <strong>Duration:</strong> {session.duration} minutes
          </p>
        )}
      </div>

      {/* Verification Status */}
      {session.completionVerified && (
        <div className="bg-green-50 border border-green-200 rounded p-2 mb-4 flex items-center gap-2">
          <FaCheckCircle className="text-green-600" />
          <span className="text-sm text-green-800">Verification Complete</span>
        </div>
      )}

      {session.status === "COMPLETED" && !session.completionVerified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-4 flex items-center gap-2">
          <FaClock className="text-yellow-600" />
          <span className="text-sm text-yellow-800">
            {session.mentorConfirmed || session.menteeConfirmed
              ? "Awaiting confirmation..."
              : "Awaiting both confirmations..."}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {session.status === "SCHEDULED" && (
          <>
            <button
              onClick={onStart}
              className="flex-1 flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition text-sm"
            >
              <FaPlay /> Start
            </button>
            <button
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded transition text-sm"
            >
              <FaTimes /> Cancel
            </button>
          </>
        )}

        {session.status === "IN_PROGRESS" && (
          <button
            onClick={onEnd}
            className="w-full flex items-center justify-center gap-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded transition"
          >
            <FaStop /> End Session
          </button>
        )}

        {session.status === "COMPLETED" && !session.completionVerified && (
          <button
            onClick={onConfirm}
            className="w-full flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded transition"
          >
            <FaCheck /> Confirm Completion
          </button>
        )}

        {session.completionVerified && (
          <div className="w-full bg-green-100 text-green-800 py-2 rounded text-center font-semibold">
            <FaCheckCircle className="inline mr-2" />
            Credits Awarded: {session.creditsAwarded}
          </div>
        )}
      </div>
    </div>
  );
}
