import React, { useState, useEffect } from "react";
import { mentorshipApi } from "../services/mentorshipApi";
import MentorshipCard from "../components/MentorshipCard";
import ApplyMentorshipModal from "../components/ApplyMentorshipModal";
import { FaPlus, FaSpinner } from "react-icons/fa";

export default function MentorshipPage() {
  const [mentorships, setMentorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMentorships();
  }, []);

  const fetchMentorships = async () => {
    try {
      setLoading(true);
      const data = await mentorshipApi.getMentorships();
      setMentorships(data);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch mentorships");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (data) => {
    try {
      await mentorshipApi.applyForMentorship(data);
      setShowModal(false);
      fetchMentorships();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to apply for mentorship");
    }
  };

  const handleAccept = async (id) => {
    try {
      await mentorshipApi.acceptMentorship(id);
      fetchMentorships();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to accept mentorship");
    }
  };

  const handleReject = async (id) => {
    try {
      await mentorshipApi.rejectMentorship(id);
      fetchMentorships();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to reject mentorship");
    }
  };

  const handleComplete = async (id, rating) => {
    try {
      await mentorshipApi.completeMentorship(id, { rating });
      fetchMentorships();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to complete mentorship");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Mentorship Programs
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-lg hover:shadow-lg"
          >
            <FaPlus /> Apply for Mentorship
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <FaSpinner className="animate-spin text-4xl text-purple-600 mx-auto" />
          </div>
        ) : mentorships.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">
              No mentorships yet. Apply to start learning!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mentorships.map((mentorship) => (
              <MentorshipCard
                key={mentorship._id}
                mentorship={mentorship}
                onAccept={() => handleAccept(mentorship._id)}
                onReject={() => handleReject(mentorship._id)}
                onComplete={(rating) => handleComplete(mentorship._id, rating)}
              />
            ))}
          </div>
        )}

        {showModal && (
          <ApplyMentorshipModal
            onClose={() => setShowModal(false)}
            onApply={handleApply}
          />
        )}
      </div>
    </div>
  );
}
