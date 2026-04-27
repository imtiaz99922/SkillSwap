import React, { useState, useEffect } from "react";
import { recommendationsApi } from "../services/recommendationsApi";
import RecommendationCard from "../components/RecommendationCard";
import { FaSync, FaSpinner } from "react-icons/fa";

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const data = await recommendationsApi.getRecommendations();
      setRecommendations(data);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const result = await recommendationsApi.generateRecommendations();
      setRecommendations(result.recommendations);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to generate recommendations");
    } finally {
      setGenerating(false);
    }
  };

  const handleViewedOrAccept = async (id, action) => {
    try {
      if (action === "accept") {
        await recommendationsApi.acceptRecommendation(id);
      } else {
        await recommendationsApi.markAsViewed(id);
      }
      fetchRecommendations();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to update recommendation");
    }
  };

  const handleDelete = async (id) => {
    try {
      await recommendationsApi.deleteRecommendation(id);
      fetchRecommendations();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to delete recommendation");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Skill Recommendations
          </h1>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg hover:shadow-lg disabled:opacity-50"
          >
            {generating ? <FaSpinner className="animate-spin" /> : <FaSync />}
            {generating ? "Generating..." : "Generate New"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <FaSpinner className="animate-spin text-4xl text-indigo-600 mx-auto" />
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">
              No recommendations yet. Click "Generate New" to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec._id}
                recommendation={rec}
                onAccept={() => handleViewedOrAccept(rec._id, "accept")}
                onView={() => handleViewedOrAccept(rec._id, "view")}
                onDelete={() => handleDelete(rec._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
