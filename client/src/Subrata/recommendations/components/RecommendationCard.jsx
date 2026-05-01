import React from "react";
import { FaCheck, FaEye, FaTrash } from "react-icons/fa";

export default function RecommendationCard({
  recommendation,
  onAccept,
  onView,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {recommendation.recommendedSkillId?.title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Category: {recommendation.recommendedSkillId?.category}
        </p>
        <p className="text-sm text-gray-600">
          Level: {recommendation.recommendedSkillId?.level}
        </p>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-700">
          <strong>Mentor:</strong> {recommendation.recommendedUserId?.name}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Reason: {recommendation.reason}
        </p>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
          style={{ width: `${recommendation.score}%` }}
        />
      </div>
      <p className="text-xs text-gray-600 mt-1">
        Match Score: {recommendation.score}%
      </p>

      <div className="flex gap-2 mt-4">
        <button
          onClick={onAccept}
          className="flex-1 flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded transition"
        >
          <FaCheck /> Accept
        </button>
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
        >
          <FaEye /> View
        </button>
        <button
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
        >
          <FaTrash /> Delete
        </button>
      </div>
    </div>
  );
}
