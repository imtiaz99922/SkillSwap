import React, { useState } from "react";
import axios from "axios";
import { FaDownload, FaFile, FaSpinner } from "react-icons/fa";

export default function PDFReportsPage() {
  const [downloading, setDownloading] = useState({});
  const [error, setError] = useState("");

  const downloadPDF = async (type) => {
    try {
      setDownloading({ ...downloading, [type]: true });
      const token = localStorage.getItem("token");

      const config = {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      };

      let url = "http://localhost:5000/api/pdf-reports";
      let filename = "report.pdf";

      if (type === "transactions") {
        url += "/transactions";
        filename = "transaction_history.pdf";
      } else if (type === "sessions") {
        url += "/sessions";
        filename = "session_history.pdf";
      } else if (type === "user") {
        url += "/user-report";
        filename = "user_report.pdf";
      }

      const response = await axios.get(url, config);

      // Create blob and download
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to download PDF");
    } finally {
      setDownloading({ ...downloading, [type]: false });
    }
  };

  return (
    <div className="feature-page">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Download Reports
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Transaction History */}
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-8">
            <div className="text-center">
              <FaFile className="text-4xl text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Transaction History
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Download all your credit transactions and payment history
              </p>
              <button
                onClick={() => downloadPDF("transactions")}
                disabled={downloading.transactions}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg disabled:opacity-50 transition"
              >
                {downloading.transactions ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaDownload />
                )}
                {downloading.transactions ? "Downloading..." : "Download PDF"}
              </button>
            </div>
          </div>

          {/* Session History */}
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-8">
            <div className="text-center">
              <FaFile className="text-4xl text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Session History
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Download all your mentoring sessions and completion records
              </p>
              <button
                onClick={() => downloadPDF("sessions")}
                disabled={downloading.sessions}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:shadow-lg disabled:opacity-50 transition"
              >
                {downloading.sessions ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaDownload />
                )}
                {downloading.sessions ? "Downloading..." : "Download PDF"}
              </button>
            </div>
          </div>

          {/* Comprehensive User Report */}
          <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-8">
            <div className="text-center">
              <FaFile className="text-4xl text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                User Report
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Download your comprehensive account report and activity summary
              </p>
              <button
                onClick={() => downloadPDF("user")}
                disabled={downloading.user}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg disabled:opacity-50 transition"
              >
                {downloading.user ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaDownload />
                )}
                {downloading.user ? "Downloading..." : "Download PDF"}
              </button>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            About PDF Reports
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                <strong>Transaction History:</strong> Contains detailed records
                of all credits earned, spent, and current balance
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600 font-bold">•</span>
              <span>
                <strong>Session History:</strong> Shows all mentoring sessions,
                completion status, and credits awarded
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-purple-600 font-bold">•</span>
              <span>
                <strong>User Report:</strong> Comprehensive summary of your
                account activity, skills, and achievements
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-orange-600 font-bold">•</span>
              <span>
                All reports are generated on-demand and include current data as
                of the download date
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
