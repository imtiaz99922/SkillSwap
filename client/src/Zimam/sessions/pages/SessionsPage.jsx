import React, { useState, useEffect } from "react";
import { sessionsApi } from "../services/sessionsApi";
import SessionCard from "../components/SessionCard";
import { FaPlus, FaSpinner } from "react-icons/fa";

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionsApi.getSessions();
      setSessions(data);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (id) => {
    try {
      await sessionsApi.startSession(id);
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to start session");
    }
  };

  const handleEndSession = async (id) => {
    try {
      await sessionsApi.endSession(id, new Date().toISOString());
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to end session");
    }
  };

  const handleConfirmSession = async (id) => {
    try {
      await sessionsApi.confirmSession(id);
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to confirm session");
    }
  };

  const handleCancelSession = async (id) => {
    try {
      await sessionsApi.cancelSession(id);
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to cancel session");
    }
  };

  const filteredSessions =
    filter === "all"
      ? sessions
      : filter === "verified"
        ? sessions.filter((s) => s.completionVerified)
        : sessions.filter((s) => s.status === filter);

  return (
    <div className="feature-page">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Sessions</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "verified"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === status
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                    : "bg-white text-gray-800 hover:bg-gray-50"
                }`}
              >
                {status === "verified" ? "Verified" : status}
              </button>
            ),
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <FaSpinner className="animate-spin text-4xl text-cyan-600 mx-auto" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">No sessions found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session._id}
                session={session}
                onStart={() => handleStartSession(session._id)}
                onEnd={() => handleEndSession(session._id)}
                onConfirm={() => handleConfirmSession(session._id)}
                onCancel={() => handleCancelSession(session._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
