import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import { FaTimes, FaSpinner } from "react-icons/fa";

export default function ApplyMentorshipModal({
  defaultCourseId = "",
  onClose,
  onApply,
}) {
  const [formData, setFormData] = useState({
    courseId: "",
    sessionCount: 5,
    preferredTimeSlots: [
      { day: "Monday", startTime: "09:00", endTime: "10:00" },
    ],
  });
  const [manualCourseId, setManualCourseId] = useState(defaultCourseId || "");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSlot, setNewSlot] = useState({
    day: "Tuesday",
    startTime: "10:00",
    endTime: "11:00",
  });

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Fetch courses you're enrolled in
      const response = await api.get("/courses/my-enrollments");
      setCourses(response.data || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSlot = () => {
    if (
      !newSlot.day ||
      !newSlot.startTime ||
      !newSlot.endTime ||
      newSlot.startTime >= newSlot.endTime
    ) {
      alert("Please enter valid times");
      return;
    }

    setFormData({
      ...formData,
      preferredTimeSlots: [...formData.preferredTimeSlots, newSlot],
    });
    setNewSlot({ day: "Tuesday", startTime: "10:00", endTime: "11:00" });
  };

  const handleRemoveSlot = (index) => {
    setFormData({
      ...formData,
      preferredTimeSlots: formData.preferredTimeSlots.filter(
        (_, i) => i !== index,
      ),
    });
  };

  useEffect(() => {
    setManualCourseId(defaultCourseId || "");
  }, [defaultCourseId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const actualCourseId = manualCourseId.trim() || formData.courseId;
    if (!actualCourseId) {
      alert("Please select or enter a course ID");
      return;
    }
    onApply({
      ...formData,
      courseId: actualCourseId,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold">Request Mentorship</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Course *
            </label>
            {loading ? (
              <div className="text-center py-2">
                <FaSpinner className="animate-spin inline mr-2" />
                Loading courses...
              </div>
            ) : (
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Choose a course --</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Or enter Course ID / Course Code
              </label>
              <input
                type="text"
                value={manualCourseId}
                onChange={(e) => setManualCourseId(e.target.value)}
                placeholder="Enter course ID or code"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                If your course uses a custom ID or code, enter it here.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Sessions
            </label>
            <input
              type="number"
              name="sessionCount"
              value={formData.sessionCount}
              onChange={handleChange}
              min="1"
              max="20"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Time Slots
            </label>

            {/* Existing Slots */}
            <div className="space-y-2 mb-3">
              {formData.preferredTimeSlots.map((slot, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
                >
                  <span>
                    {slot.day}: {slot.startTime} - {slot.endTime}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(idx)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Slot */}
            <div className="border-t pt-3">
              <h4 className="text-xs font-bold mb-2">Add New Slot</h4>
              <select
                value={newSlot.day}
                onChange={(e) =>
                  setNewSlot({ ...newSlot, day: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-2 py-1 mb-2 text-sm"
              >
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, startTime: e.target.value })
                  }
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) =>
                    setNewSlot({ ...newSlot, endTime: e.target.value })
                  }
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>

              <button
                type="button"
                onClick={handleAddSlot}
                className="w-full bg-blue-500 text-white py-1 rounded text-sm hover:bg-blue-600"
              >
                + Add Slot
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-2 rounded hover:shadow-lg transition"
            >
              Request Mentorship
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
