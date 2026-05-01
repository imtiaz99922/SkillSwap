import React, { useState } from "react";
import { reportsApi } from "../services/reportsApi";
import ReportModal from "../components/ReportModal";
import {
  FaPlus,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
} from "react-icons/fa";

export default function ReportsPage() {
  const [showModal, setShowModal] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmitReport = async (data) => {
    try {
      await reportsApi.submitReport(data);
      setShowModal(false);
      alert("Report submitted successfully!");
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to submit report");
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportsApi.getMyReports();
      setReports(data);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "RESOLVED":
        return <FaCheckCircle className="text-green-600" />;
      case "INVESTIGATING":
        return <FaClock className="text-blue-600" />;
      default:
        return <FaExclamationCircle className="text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "INVESTIGATING":
        return "bg-blue-100 text-blue-800";
      case "DISMISSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="feature-page">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Report System</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:shadow-lg"
          >
            <FaPlus /> Submit Report
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <p className="text-gray-600 text-lg">No reports submitted yet.</p>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Report: {report.category}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Reported User: {report.reportedUserId?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(report.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}
                    >
                      {report.status}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 my-3">{report.description}</p>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    Severity:{" "}
                    <span className="font-medium text-gray-800">
                      {report.severity}
                    </span>
                  </p>
                  <p>
                    Submitted: {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                  {report.resolution && (
                    <p className="mt-2 text-gray-700">
                      <strong>Resolution:</strong> {report.resolution}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {showModal && (
          <ReportModal
            onClose={() => setShowModal(false)}
            onSubmit={handleSubmitReport}
          />
        )}
      </div>
    </div>
  );
}
