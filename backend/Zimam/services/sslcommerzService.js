/**
 * SSLCommerz Payment Gateway Service
 * https://developer.sslcommerz.com/
 */

const axios = require("axios");
const crypto = require("crypto");

// SSLCommerz API endpoints
const SANDBOX_URL = "https://sandbox.sslcommerz.com";
const PRODUCTION_URL = "https://securepay.sslcommerz.com";

const isProduction = process.env.NODE_ENV === "production";
const API_URL = isProduction ? PRODUCTION_URL : SANDBOX_URL;
const STORE_ID = process.env.SSLCOMMERZ_STORE_ID;
const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD;

class SSLCommerzService {
  /**
   * Initialize payment - Create payment session
   * @param {Object} params - Payment parameters
   * @returns {Promise<Object>} - Gateway payment response
   */
  static async initiate(params) {
    try {
      if (!STORE_ID || !STORE_PASSWORD) {
        throw new Error(
          "SSLCommerz credentials not configured. Set SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD",
        );
      }

      const {
        amount,
        currency = "BDT",
        invoiceNumber,
        productName,
        productCategory,
        customerEmail,
        customerPhone,
        customerName,
        successUrl,
        failUrl,
        cancelUrl,
        metadata = {},
      } = params;

      if (!amount || !invoiceNumber) {
        throw new Error("Amount and invoiceNumber are required");
      }

      // Prepare SSLCommerz request payload
      const payload = {
        // Required credentials
        store_id: STORE_ID,
        store_passwd: STORE_PASSWORD,

        // Transaction details
        total_amount: amount,
        currency: currency,
        tran_id: invoiceNumber, // Unique transaction ID

        // Product details
        product_name: productName || "Credits Package",
        product_category: productCategory || "Digital",
        product_profile: "digital-goods",

        // Customer details
        cus_name: customerName || "Customer",
        cus_email: customerEmail,
        cus_phone: customerPhone || "",
        cus_add1: metadata.address || "N/A",
        cus_city: metadata.city || "N/A",
        cus_state: metadata.state || "N/A",
        cus_postcode: metadata.postcode || "N/A",
        cus_country: metadata.country || "Bangladesh",

        // Shipping details (same as customer for digital goods)
        ship_name: customerName || "Customer",
        ship_add1: metadata.address || "N/A",
        ship_city: metadata.city || "N/A",
        ship_state: metadata.state || "N/A",
        ship_postcode: metadata.postcode || "N/A",
        ship_country: metadata.country || "Bangladesh",

        // URLs
        success_url: successUrl,
        fail_url: failUrl,
        cancel_url: cancelUrl,

        // Additional optional fields
        value_a: metadata.userId || "", // Store userId for reference
        value_b: metadata.packageId || "", // Store packageId
        value_c: metadata.creditsGranted || "", // Credits to grant
        value_d: "skillswap", // App identifier

        // Multi-card payment
        multi_card_name: "",

        // Multi-currency processing
        base_fair: 0,

        // Request type
        request_type: "xmldata",

        // Response type
        response_type: "json",

        // Multi-currency 2
        emi_option: 0,
        emi_max_install_period: 0,
      };

      console.log(
        "📤 Sending SSLCommerz request for transaction:",
        invoiceNumber,
      );

      // Send POST request to SSLCommerz
      const response = await axios.post(
        `${API_URL}/gwprocess/v4/api.php`,
        payload,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 10000,
        },
      );

      console.log("✅ SSLCommerz response:", response.data);

      // Check if payment gateway URL was generated successfully
      if (response.data.status === "FAILED") {
        throw new Error(
          `Payment initiation failed: ${response.data.failedreason || "Unknown error"}`,
        );
      }

      if (!response.data.GatewayPageURL) {
        throw new Error("No payment gateway URL received from SSLCommerz");
      }

      return {
        success: true,
        status: response.data.status,
        gatewayPageUrl: response.data.GatewayPageURL,
        sessionKey: response.data.sessionkey || "", // Some responses include sessionkey
        transactionId: invoiceNumber,
        redirectUrl: response.data.GatewayPageURL, // Alias for clarity
        rawResponse: response.data,
      };
    } catch (error) {
      console.error("❌ SSLCommerz initiation error:", error.message);
      throw error;
    }
  }

  /**
   * Validate payment callback/IPN (Instant Payment Notification)
   * @param {Object} callbackData - Data received from SSLCommerz callback
   * @returns {Promise<Object>} - Validation result
   */
  static async validateCallback(callbackData) {
    try {
      const {
        tran_id,
        status,
        currency,
        amount,
        card_type,
        store_amount,
        bank_tran_id,
        val_id,
      } = callbackData;

      console.log(
        `📨 Validating callback for transaction: ${tran_id}, Status: ${status}`,
      );

      // Verify the amount is correct
      // In production, verify against your database record

      // Check if payment was successful
      const isSuccessful = status === "VALID" || status === "APPROVED";

      if (!isSuccessful) {
        console.log(`⚠️ Payment status not successful: ${status}`);
        return {
          success: false,
          status: status,
          transactionId: tran_id,
          message: `Payment ${status}`,
        };
      }

      console.log(`✅ Payment validated successfully: ${tran_id}`);

      return {
        success: true,
        status: status,
        transactionId: tran_id,
        amount: amount,
        currency: currency,
        bankTransactionId: bank_tran_id,
        validationId: val_id,
        cardType: card_type,
      };
    } catch (error) {
      console.error("❌ Callback validation error:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Query transaction status from SSLCommerz
   * @param {string} transactionId - Transaction ID to check
   * @param {number} amount - Transaction amount (required for validation)
   * @returns {Promise<Object>} - Transaction status
   */
  static async queryTransactionStatus(transactionId, amount) {
    try {
      if (!STORE_ID || !STORE_PASSWORD) {
        throw new Error("SSLCommerz credentials not configured");
      }

      const payload = {
        store_id: STORE_ID,
        store_passwd: STORE_PASSWORD,
        tran_id: transactionId,
        request_type: "TRANSACTIONQUERY",
        response_type: "json",
      };

      console.log(`🔍 Querying transaction status: ${transactionId}`);

      const response = await axios.post(
        `${API_URL}/gwprocess/v4/api.php`,
        payload,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 10000,
        },
      );

      console.log("✅ Transaction query response:", response.data);

      if (
        response.data.element[0].status === "VALID" ||
        response.data.element[0].status === "APPROVED"
      ) {
        return {
          success: true,
          status: response.data.element[0].status,
          transactionId: transactionId,
          amount: response.data.element[0].amount,
          bankTransactionId: response.data.element[0].bank_tran_id,
        };
      } else {
        return {
          success: false,
          status: response.data.element[0].status,
          transactionId: transactionId,
        };
      }
    } catch (error) {
      console.error("❌ Transaction query error:", error.message);
      throw error;
    }
  }

  /**
   * Verify IPN (Instant Payment Notification) signature
   * @param {Object} data - IPN data
   * @param {string} signature - Signature from IPN
   * @returns {boolean} - Whether signature is valid
   */
  static verifyIPNSignature(data, signature) {
    try {
      // SSLCommerz uses MD5 hash for IPN verification
      const verifyString = data.verify_sign;
      const expectedSignature = crypto
        .createHash("md5")
        .update(
          `${data.store_id},${data.tran_id},${data.status},${data.amount},${data.currency},${data.value_a},${data.value_b},${data.value_c},${data.value_d}`,
        )
        .digest("hex");

      const isValid = verifyString === expectedSignature;
      console.log(
        `${isValid ? "✅" : "❌"} IPN signature verification: ${isValid}`,
      );
      return isValid;
    } catch (error) {
      console.error("❌ IPN verification error:", error.message);
      return false;
    }
  }

  /**
   * Get payment status message
   * @param {string} status - SSLCommerz status code
   * @returns {string} - Human-readable status
   */
  static getStatusMessage(status) {
    const messages = {
      VALID: "Payment successful",
      APPROVED: "Payment approved",
      FAILED: "Payment failed",
      PENDING: "Payment pending",
      CANCELLED: "Payment cancelled",
      EXPIRED: "Payment expired",
    };
    return messages[status] || `Unknown status: ${status}`;
  }
}

module.exports = SSLCommerzService;
