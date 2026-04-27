const axios = require("axios");
(async () => {
  try {
    console.log("Registering user...");
    try {
      const r = await axios.post("http://localhost:5000/api/auth/register", {
        name: "Test Runner",
        email: "testrunner@example.com",
        password: "password123",
      });
      console.log("Register response:", r.data);
    } catch (e) {
      console.log(
        "Register error (may already exist):",
        e.response ? e.response.data : e.message,
      );
    }

    console.log("Logging in...");
    const login = await axios.post("http://localhost:5000/api/auth/login", {
      email: "testrunner@example.com",
      password: "password123",
    });

    const token = login.data.token;
    console.log("Token received:", !!token);

    console.log("Creating payment...");
    const res = await axios.post(
      "http://localhost:5000/api/payment-gateway/create",
      { amount: 99, creditsGranted: 100, paymentMethod: "bKash", metadata: {} },
      { headers: { Authorization: token }, timeout: 20000 },
    );

    console.log("Create payment response:", res.data);
  } catch (err) {
    console.error(
      "Test script error:",
      err && err.response ? err.response.data : (err && err.message) || err,
    );
    if (err && err.stack) console.error(err.stack);
  }
})();
