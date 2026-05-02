import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { notificationApi } from "../../../Zimam/notifications/services/notificationApi";
import NotificationList from "../../../Zimam/notifications/components/NotificationList";
import { FaSpinner } from "react-icons/fa";

export default function RecommendationsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const courseId = query.get("courseId");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [course, setCourse] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [recipientSearch, setRecipientSearch] = useState("");
  const [sendStatusByUser, setSendStatusByUser] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (courseId) {
      fetchCourseAndUsers();
    } else {
      fetchReceivedRecommendations();
    }
  }, [courseId, page]);

  const fetchReceivedRecommendations = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getNotifications(
        page,
        20,
        "recommendation",
      );
      setNotifications(data.notifications || []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.msg || "Failed to fetch course recommendations",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseAndUsers = async () => {
    setUsersLoading(true);
    setUsersError("");

    try {
      const token = localStorage.getItem("token");
      const [courseResponse, usersResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 200 },
        }),
      ]);

      setCourse(courseResponse.data.course);
      setUsers(usersResponse.data.users || []);
    } catch (err) {
      console.error("Recommendation page error:", err);
      setUsersError(
        err.response?.data?.msg || "Failed to load users for recommendation",
      );
    } finally {
      setUsersLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      fetchReceivedRecommendations();
    } catch (err) {
      console.error("Failed to mark recommendation as read:", err);
      setError(
        err.response?.data?.msg || "Failed to update recommendation status",
      );
    }
  };

  const handleDeleteRecommendation = async (notificationId) => {
    try {
      await notificationApi.deleteNotification(notificationId);
      fetchReceivedRecommendations();
    } catch (err) {
      console.error("Failed to delete recommendation:", err);
      setError(err.response?.data?.msg || "Failed to delete recommendation");
    }
  };

  const handleSendRecommendation = async (user) => {
    const token = localStorage.getItem("token");
    if (!course) return;

    setSendStatusByUser((prev) => ({
      ...prev,
      [user._id]: { loading: true, success: false, error: null },
    }));

    try {
      await axios.post(
        "http://localhost:5000/api/notifications/send",
        {
          userId: user._id,
          title: `Course recommendation: ${course.title}`,
          body: `I recommend you check out ${course.title}. Click to view the course details.`,
          type: "recommendation",
          data: {
            courseId: course._id,
            courseTitle: course.title,
            courseUrl: `/course/${course._id}`,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSendStatusByUser((prev) => ({
        ...prev,
        [user._id]: { loading: false, success: true, error: null },
      }));
    } catch (err) {
      console.error("Send recommendation error:", err);
      setSendStatusByUser((prev) => ({
        ...prev,
        [user._id]: {
          loading: false,
          success: false,
          error: err.response?.data?.msg || "Failed to send recommendation",
        },
      }));
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!recipientSearch.trim()) return true;
    const term = recipientSearch.toLowerCase();
    return (
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="feature-page">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              {courseId ? "Recommend Course" : "Course Recommendations"}
            </h1>
            <p className="mt-2 text-gray-600 max-w-2xl">
              {courseId
                ? "Choose users to recommend this course to. Each recipient will get a live notification."
                : "Browse course recommendations sent to you and open the recommended course directly."}
            </p>
          </div>
          {courseId ? (
            <button
              onClick={() => navigate("/recommendations")}
              className="bg-white border border-indigo-200 text-indigo-700 px-5 py-2 rounded-lg shadow-sm hover:bg-indigo-50"
            >
              Back to recommendations
            </button>
          ) : null}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {courseId ? (
          <div className="space-y-6">
            {usersError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {usersError}
              </div>
            )}

            {usersLoading ? (
              <div className="text-center py-12">
                <FaSpinner className="animate-spin text-4xl text-indigo-600 mx-auto" />
              </div>
            ) : (
              <>
                {course && (
                  <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold text-gray-900">
                          {course.title}
                        </h2>
                        <p className="text-gray-600 mt-2">
                          {course.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Price</div>
                        <div className="text-xl font-bold text-indigo-700">
                          ₳{course.price || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Send course recommendation
                      </h3>
                      <p className="text-gray-600 mt-1">
                        Search for a user and click the send button next to
                        their name.
                      </p>
                    </div>
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={recipientSearch}
                      onChange={(e) => setRecipientSearch(e.target.value)}
                      className="w-full sm:w-72 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 shadow-sm focus:border-indigo-400 focus:outline-none"
                    />
                  </div>

                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-gray-600">
                      No users found. Try a different search term.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredUsers.map((user) => {
                        const status = sendStatusByUser[user._id] || {};
                        return (
                          <div
                            key={user._id}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-5"
                          >
                            <div>
                              <div className="text-lg font-semibold text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {user.email}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {status.error && (
                                <span className="text-sm text-red-600">
                                  {status.error}
                                </span>
                              )}
                              <button
                                onClick={() => handleSendRecommendation(user)}
                                disabled={status.loading || status.success}
                                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {status.loading
                                  ? "Sending..."
                                  : status.success
                                    ? "Sent"
                                    : "Send Recommendation"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <FaSpinner className="animate-spin text-4xl text-indigo-600 mx-auto" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">
              No course recommendations found. Ask someone to recommend a course
              or check back later.
            </p>
          </div>
        ) : (
          <>
            <NotificationList
              notifications={notifications}
              loading={loading}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDeleteRecommendation}
            />
            <div className="mt-6 flex justify-center gap-3">
              {page > 1 && (
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  Previous
                </button>
              )}
              <button
                onClick={() => setPage((prev) => prev + 1)}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                Load More
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
