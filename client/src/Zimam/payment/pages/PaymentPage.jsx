import React, { useEffect, useMemo, useState } from "react";
import { paymentApi } from "../services/paymentApi";
import "../../../styles/ModernDesign.css";

const PAYMENT_METHODS = [
  "Credit Card",
  "Debit Card",
  "PayPal",
  "Apple Pay",
  "Google Pay",
];

export default function PaymentPage() {
  const [packages, setPackages] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [history, setHistory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [cardNumber, setCardNumber] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [latestPayment, setLatestPayment] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [activeReceiptId, setActiveReceiptId] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const [packagesData, walletData, paymentHistory, walletTransactions] =
          await Promise.all([
            paymentApi.getPackages(),
            paymentApi.getWallet(),
            paymentApi.getHistory(),
            paymentApi.getWalletTransactions(),
          ]);
        if (!active) return;
        setPackages(packagesData);
        setWallet(walletData);
        setHistory(paymentHistory);
        setTransactions(walletTransactions);
        setSelectedPackageId(packagesData?.[0]?.id || null);
      } catch (err) {
        console.error(err);
        if (active) setError("Unable to load payment data.");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, []);

  const selectedPackage = useMemo(
    () => packages.find((item) => item.id === selectedPackageId),
    [packages, selectedPackageId],
  );

  const isCardMethod = paymentMethod.includes("Card");
  const normalizedCardDigits = cardNumber.replace(/\D/g, "");

  const getQrSvg = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" fill="#0f172a"/><rect x="10" y="10" width="36" height="36" fill="#fff"/><rect x="18" y="18" width="20" height="20" fill="#0f172a"/><rect x="114" y="10" width="36" height="36" fill="#fff"/><rect x="122" y="18" width="20" height="20" fill="#0f172a"/><rect x="10" y="114" width="36" height="36" fill="#fff"/><rect x="18" y="122" width="20" height="20" fill="#0f172a"/><rect x="64" y="64" width="18" height="18" fill="#fff"/><rect x="90" y="64" width="18" height="18" fill="#fff"/><rect x="64" y="90" width="18" height="18" fill="#fff"/><rect x="90" y="90" width="18" height="18" fill="#0f172a"/></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };

  const validatePaymentDetails = () => {
    if (isCardMethod) {
      if (!normalizedCardDigits || normalizedCardDigits.length < 12) {
        setError("Please enter a valid card number.");
        return false;
      }
      if (!billingAddress.trim() || !zipCode.trim()) {
        setError("Please enter your billing address and ZIP code.");
        return false;
      }
    } else {
      if (!accountEmail.trim()) {
        setError("Please enter your payment account email.");
        return false;
      }
    }
    return true;
  };

  const refreshWallet = async () => {
    try {
      const walletData = await paymentApi.getWallet();
      setWallet(walletData);
      const walletTransactions = await paymentApi.getWalletTransactions();
      setTransactions(walletTransactions);
    } catch (err) {
      console.error(err);
    }
  };

  const refreshHistory = async () => {
    try {
      const paymentHistory = await paymentApi.getHistory();
      setHistory(paymentHistory);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPaymentDetails = async (paymentId) => {
    try {
      const paymentData = await paymentApi.getPaymentDetails(paymentId);
      setLatestPayment(paymentData);
      return paymentData;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const fetchReceipt = async (paymentId) => {
    try {
      const data = await paymentApi.getReceipt(paymentId);
      const receiptData = data.receipt || data;
      setReceipt(receiptData);
      setActiveReceiptId(paymentId);
      return receiptData;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const pollPaymentStatus = async (paymentId, attempt = 0) => {
    if (attempt >= 6) {
      return;
    }

    const payment = await fetchPaymentDetails(paymentId);
    if (!payment) return;

    if (payment.status === "Pending") {
      setStatus("Finalizing transaction...");
      setTimeout(() => pollPaymentStatus(paymentId, attempt + 1), 1800);
      return;
    }

    await refreshWallet();
    await refreshHistory();
    await fetchReceipt(paymentId);
    setStatus(
      payment.status === "Completed"
        ? "Payment confirmed and credits are live."
        : "Payment could not be completed.",
    );
  };

  const handlePurchase = async (event) => {
    event.preventDefault();
    if (!selectedPackage) {
      setError("Please choose a package before continuing.");
      return;
    }
    setError(null);
    setSubmitting(true);
    setStatus("Processing your payment...");
    setReceipt(null);
    setLatestPayment(null);
    setActiveReceiptId(null);

    try {
      if (!validatePaymentDetails()) {
        setSubmitting(false);
        return;
      }

      const response = await paymentApi.processPayment({
        packageId: selectedPackage.id,
        amount: selectedPackage.amount,
        creditsGranted: selectedPackage.credits,
        paymentMethod,
        paymentDetails: {
          cardNumber: isCardMethod ? normalizedCardDigits : undefined,
          billingAddress: isCardMethod ? billingAddress.trim() : undefined,
          zipCode: isCardMethod ? zipCode.trim() : undefined,
          accountEmail: !isCardMethod ? accountEmail.trim() : undefined,
        },
      });

      const payment = response.payment;
      setLatestPayment(payment);
      setStatus(response.msg || "Payment started. Please wait...");
      await fetchReceipt(payment._id);

      if (payment.status === "Pending") {
        pollPaymentStatus(payment._id);
      } else {
        await refreshWallet();
        await refreshHistory();
      }
    } catch (err) {
      console.error(err);
      setError("Payment failed. Please try again.");
      setStatus(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewReceipt = async (paymentId) => {
    setError(null);
    setStatus("Loading receipt...");
    await fetchPaymentDetails(paymentId);
    await fetchReceipt(paymentId);
    setStatus("Receipt ready.");
  };

  const downloadReceipt = () => {
    if (!receipt) return;

    const receiptText = [
      `SkillSwap Receipt #${receipt.receiptId}`,
      "----------------------------------------",
      `Date: ${new Date(receipt.date).toLocaleString()}`,
      `Status: ${receipt.status}`,
      `Payment Reference: ${receipt.paymentReference}`,
      `Transaction ID: ${receipt.transactionId}`,
      "",
      `Customer: ${receipt.customerName}`,
      `Email: ${receipt.customerEmail}`,
      "",
      `Payment Method: ${receipt.paymentMethod}`,
      receipt.cardLastDigits
        ? `Card ending: **** **** **** ${receipt.cardLastDigits}`
        : null,
      "",
      `Package: ${receipt.packageId || "Credit bundle"}`,
      `Credits Earned: ${receipt.creditsGranted}`,
      `Amount Paid: $${receipt.amount.toFixed(2)} ${receipt.currency}`,
      "",
      `Merchant: ${receipt.merchantName}`,
      "Thank you for choosing SkillSwap!",
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `skillswap-receipt-${receipt.receiptId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm text-center">
        Loading payment options...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold">Credit Wallet & Payment</h1>
        <p className="mt-2 text-slate-600">
          Purchase credits and track your balance to unlock more learning and
          teaching time.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-semibold">Available Packages</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {packages.map((pack) => (
                <button
                  type="button"
                  key={pack.id}
                  className={`w-full rounded-3xl border p-5 text-left transition ${
                    pack.id === selectedPackageId
                      ? "border-slate-900 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-900 hover:border-slate-900"
                  }`}
                  onClick={() => setSelectedPackageId(pack.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{pack.name}</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {pack.discount} discount
                      </p>
                    </div>
                    <span className="text-xl font-bold">${pack.amount}</span>
                  </div>
                  <p className="mt-4 text-slate-600">{pack.credits} credits</p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-semibold">Payment Method</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
              <div className="grid gap-3 sm:grid-cols-2">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method}
                    className={`cursor-pointer rounded-3xl border p-4 text-sm transition ${
                      paymentMethod === method
                        ? "border-slate-900 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-900"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      className="mr-2 h-4 w-4"
                    />
                    {method}
                  </label>
                ))}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-950 p-4 text-white flex flex-col items-center justify-center gap-3">
                <img
                  src={getQrSvg()}
                  alt="Payment QR code"
                  className="h-36 w-36 rounded-3xl border border-slate-700 bg-white p-2"
                />
                <div className="text-center">
                  <p className="font-semibold">Quick scan payment</p>
                  <p className="text-sm text-slate-300">
                    Scan to pay with your selected method.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-semibold">Payment confirmation</h2>
            <div className="mt-4 grid gap-4">
              {isCardMethod ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Card number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(event) => setCardNumber(event.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none transition focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Billing address
                    </label>
                    <input
                      type="text"
                      value={billingAddress}
                      onChange={(event) =>
                        setBillingAddress(event.target.value)
                      }
                      placeholder="123 Main St, Apt 4B"
                      className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none transition focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      ZIP code
                    </label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(event) => setZipCode(event.target.value)}
                      placeholder="10001"
                      className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none transition focus:border-slate-900"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Account email
                  </label>
                  <input
                    type="email"
                    value={accountEmail}
                    onChange={(event) => setAccountEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none transition focus:border-slate-900"
                  />
                  <p className="mt-2 text-sm text-slate-500">
                    We’ll use this email to confirm your PayPal / Apple Pay /
                    Google Pay account.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-semibold">Checkout</h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-3xl bg-slate-50 p-4 text-slate-700">
                <p>
                  Selected package:{" "}
                  <strong>{selectedPackage?.name || "None"}</strong>
                </p>
                <p>
                  Credits: <strong>{selectedPackage?.credits || 0}</strong>
                </p>
                <p>
                  Price:{" "}
                  <strong>
                    ${selectedPackage?.amount?.toFixed(2) || "0.00"}
                  </strong>
                </p>
                <p>
                  Payment method: <strong>{paymentMethod}</strong>
                </p>
                {isCardMethod ? (
                  <p className="text-sm text-slate-500 mt-2">
                    Card ending: **** **** **** {normalizedCardDigits.slice(-4)}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 mt-2">
                    Confirming account:{" "}
                    <strong>{accountEmail || "enter email above"}</strong>
                  </p>
                )}
              </div>
              {error ? (
                <div className="rounded-3xl bg-rose-50 border border-rose-200 p-4 text-rose-700">
                  {error}
                </div>
              ) : null}
              {status ? (
                <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-700">
                  {status}
                </div>
              ) : null}
              <button
                onClick={handlePurchase}
                disabled={submitting || !selectedPackage}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting payment..." : "Purchase Credits"}
              </button>
            </div>
          </section>

          {receipt ? (
            <section className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200 animate-fadeIn">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Receipt Preview</h2>
                  <p className="mt-2 text-slate-600">
                    Download your payment receipt and review transaction
                    details.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadReceipt}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700"
                >
                  Download Receipt
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-950 p-5 text-white">
                  <div className="text-sm uppercase tracking-[0.2em] text-slate-400">
                    Receipt ID
                  </div>
                  <div className="mt-2 text-xl font-semibold">
                    {receipt.receiptId}
                  </div>
                  <div className="mt-3 text-sm text-slate-300">
                    {receipt.merchantName}
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-50 p-5 text-slate-700">
                  <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
                    Transaction
                  </div>
                  <div className="mt-2 text-xl font-semibold text-slate-900">
                    {receipt.transactionId}
                  </div>
                  <div className="mt-3 text-sm text-slate-500">
                    {receipt.status} • {new Date(receipt.date).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Customer</p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {receipt.customerName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {receipt.customerEmail}
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">Payment</p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {receipt.paymentMethod}
                  </p>
                  {receipt.cardLastDigits ? (
                    <p className="text-sm text-slate-500">
                      Card ending: **** **** **** {receipt.cardLastDigits}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Amount Paid</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                      ${receipt.amount.toFixed(2)} {receipt.currency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Credits Earned</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                      {receipt.creditsGranted}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-semibold">Wallet Balance</h2>
            <div className="mt-5 rounded-3xl bg-slate-950 p-6 text-white">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Current Credits
              </p>
              <p className="mt-4 text-4xl font-semibold">
                {wallet?.credits ?? 0}
              </p>
              <div className="mt-4 grid gap-3 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>Total earned</span>
                  <span>{wallet?.totalEarned ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total spent</span>
                  <span>{wallet?.totalSpent ?? 0}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-semibold">Recent Purchases</h2>
            <div className="mt-4 space-y-3">
              {history.length === 0 ? (
                <p className="text-slate-600">No payments yet.</p>
              ) : (
                history.slice(0, 4).map((payment) => (
                  <div
                    key={payment._id}
                    className="rounded-3xl border border-slate-200 p-4 bg-slate-50"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {payment.paymentMethod}
                        </p>
                        <p className="text-sm text-slate-600">
                          {payment.status} · {payment.creditsGranted} credits
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-700">
                          ${payment.amount}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleViewReceipt(payment._id)}
                          className="text-sm text-slate-700 underline hover:text-slate-900"
                        >
                          View receipt
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-sm border border-slate-200">
            <h2 className="text-2xl font-semibold">Recent Transactions</h2>
            <div className="mt-4 space-y-3">
              {transactions.length === 0 ? (
                <p className="text-slate-600">No wallet transactions yet.</p>
              ) : (
                transactions.slice(0, 4).map((tx) => (
                  <div
                    key={tx._id}
                    className="rounded-3xl border border-slate-200 p-4 bg-slate-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {tx.reason}
                        </p>
                        <p className="text-sm text-slate-600">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-slate-700">{tx.amount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
