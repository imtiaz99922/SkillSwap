import React, { useState, useEffect } from "react";
import { leaderboardApi } from "../services/leaderboardApi";
import { FaSpinner, FaMedal, FaTrophy, FaStar } from "react-icons/fa";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("leaderboard");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "leaderboard") {
        const data = await leaderboardApi.getLeaderboard();
        setLeaderboard(data);
      } else {
        const data = await leaderboardApi.getAllBadges();
        setBadges(data);
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const getMedalIcon = (rank) => {
    if (rank === 1) return <FaTrophy className="text-yellow-500 text-2xl" />;
    if (rank === 2) return <FaMedal className="text-gray-400 text-2xl" />;
    if (rank === 3) return <FaMedal className="text-orange-600 text-2xl" />;
    return <span className="text-xl font-bold text-gray-600">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Leaderboard & Badges
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === "leaderboard"
                ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white"
                : "bg-white text-gray-800 hover:bg-gray-50"
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              activeTab === "badges"
                ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white"
                : "bg-white text-gray-800 hover:bg-gray-50"
            }`}
          >
            Badges
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <FaSpinner className="animate-spin text-4xl text-yellow-600 mx-auto" />
          </div>
        ) : activeTab === "leaderboard" ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white">
                <tr>
                  <th className="py-4 px-6 text-left font-semibold">Rank</th>
                  <th className="py-4 px-6 text-left font-semibold">User</th>
                  <th className="py-4 px-6 text-center font-semibold">
                    Skills
                  </th>
                  <th className="py-4 px-6 text-center font-semibold">
                    Mentorships
                  </th>
                  <th className="py-4 px-6 text-center font-semibold">
                    Rating
                  </th>
                  <th className="py-4 px-6 text-right font-semibold">
                    Credits
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, idx) => (
                  <tr
                    key={user.userId}
                    className="border-b hover:bg-yellow-50 transition"
                  >
                    <td className="py-4 px-6 flex items-center gap-3">
                      {getMedalIcon(idx + 1)}
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-700">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                        {user.skills}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-gray-700">
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
                        {user.mentorships}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FaStar className="text-yellow-500" />
                        <span className="font-semibold text-gray-800">
                          {user.rating}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-bold text-green-600 text-lg">
                        {user.credits}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge) => (
              <div
                key={badge._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 text-center"
              >
                <div className="text-4xl mb-3">{badge.icon || "🏆"}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {badge.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {badge.description}
                </p>
                <span className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">
                  {badge.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
