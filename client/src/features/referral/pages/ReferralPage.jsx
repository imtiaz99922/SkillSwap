import React, { useState, useEffect } from "react";
import { referralApi } from "../services/referralApi";
import { FaCopy, FaSpinner } from "react-icons/fa";

export default function ReferralPage() {
  const [referralCode, setReferralCode] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const codeData = await referralApi.getReferralCode();
      setReferralCode(codeData.referralCode);
      setShareUrl(codeData.shareUrl);

      const statsData = await referralApi.getReferralStats();
      setStats(statsData);

      const referralsData = await referralApi.getReferrals();
      setReferrals(referralsData);
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to fetch referral data");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Referral Program
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <FaSpinner className="animate-spin text-4xl text-green-600 mx-auto" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Referral Code Card */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Your Referral Code
              </h2>
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white mb-4">
                <p className="text-sm opacity-90 mb-2">
                  Share this code with friends:
                </p>
                <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-3 rounded">
                  <code className="text-2xl font-mono font-bold flex-1">
                    {referralCode}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    className="bg-white text-green-600 px-4 py-2 rounded hover:bg-opacity-90 transition"
                  >
                    <FaCopy /> {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">
                  Or share this link:
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition"
                  >
                    <FaCopy />
                  </button>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-medium">
                  Total Invited
                </h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats?.totalInvited}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-medium">Accepted</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {stats?.accepted}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-medium">Completed</h3>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {stats?.completed}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-600 text-sm font-medium">
                  Bonus Earned
                </h3>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {stats?.bonusEarned}
                </p>
              </div>
            </div>

            {/* Referrals List */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Your Referrals
              </h2>
              {referrals.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No referrals yet. Start sharing!
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="py-2 text-gray-700 font-medium">
                          Email
                        </th>
                        <th className="py-2 text-gray-700 font-medium">
                          Status
                        </th>
                        <th className="py-2 text-gray-700 font-medium">
                          Bonus Credited
                        </th>
                        <th className="py-2 text-gray-700 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map((ref) => (
                        <tr key={ref._id} className="border-b hover:bg-gray-50">
                          <td className="py-3 text-gray-800">{ref.email}</td>
                          <td className="py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                ref.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : ref.status === "ACCEPTED"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {ref.status}
                            </span>
                          </td>
                          <td className="py-3 text-gray-800">
                            {ref.bonusRedeemed ? "✓" : "-"}
                          </td>
                          <td className="py-3 text-gray-600 text-sm">
                            {new Date(ref.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
