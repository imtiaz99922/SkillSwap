const assert = require("assert");

/**
 * Unit tests for payment service fallback behavior
 * Tests that dev mode gracefully falls back to mock responses when gateway is unavailable
 */

describe("PaymentService - Dev Mode Fallback", () => {
  // Mock the environment variable
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  test("should return mock payment response in development when gateway fails", async () => {
    process.env.NODE_ENV = "development";
    process.env.FRONTEND_URL = "http://localhost:5173";

    // Mock axios to simulate gateway error
    const axios = require("axios");
    const originalPost = axios.post;
    axios.post = jest
      .fn()
      .mockRejectedValue(new Error("Request failed with status code 404"));

    const { createPaymentGateway } = require("./paymentService");

    const result = await createPaymentGateway({
      amount: 99,
      invoiceId: "TEST-INV-123",
      description: "Test payment",
      customerEmail: "test@example.com",
    });

    // Restore original axios
    axios.post = originalPost;

    assert.strictEqual(result.success, true, "Should return success");
    assert(
      result.paymentID.startsWith("MOCK-"),
      "Should generate mock payment ID",
    );
    assert(
      result.payment_url.includes("localhost:5173"),
      "Should use frontend URL from env",
    );
    assert.strictEqual(result.currency, "BDT", "Should set currency to BDT");
  });

  test("should throw error in production when gateway fails", async () => {
    process.env.NODE_ENV = "production";

    const axios = require("axios");
    const originalPost = axios.post;
    axios.post = jest
      .fn()
      .mockRejectedValue(new Error("Request failed with status code 404"));

    const { createPaymentGateway } = require("./paymentService");

    try {
      await createPaymentGateway({
        amount: 99,
        invoiceId: "TEST-INV-123",
        description: "Test payment",
        customerEmail: "test@example.com",
      });
      axios.post = originalPost;
      throw new Error("Should have thrown an error in production");
    } catch (err) {
      axios.post = originalPost;
      assert(
        err.message.includes("Payment gateway error"),
        "Should throw payment gateway error in production",
      );
    }
  });

  test("should return mock verification response in development when verification fails", async () => {
    process.env.NODE_ENV = "development";

    const axios = require("axios");
    const originalPost = axios.post;
    axios.post = jest
      .fn()
      .mockRejectedValue(new Error("Request failed with status code 404"));

    const { verifyPaymentGateway } = require("./paymentService");

    const result = await verifyPaymentGateway("MOCK-123");

    axios.post = originalPost;

    assert.strictEqual(
      result.status,
      "success",
      "Should return success status",
    );
    assert.strictEqual(
      result.transactionId,
      "MOCK-123",
      "Should use payment ID as transaction ID",
    );
  });
});
