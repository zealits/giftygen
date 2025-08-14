// controllers/paymentController.js
const paymentsApi = require("../config/square.js");
const { Client, Environment } = require("square");
const RestaurantAdmin = require("../models/restaurantAdminSchema");
const jwt = require("jsonwebtoken");

exports.createPayment = async (req, res) => {
  console.log("Trigger createPayment");
  const { sourceId, amount, businessSlug } = req.body;
  console.log(sourceId, amount);

  try {
    // Determine which Square credentials to use
    let clientToUse = null;
    if (businessSlug) {
      const admin = await RestaurantAdmin.findOne({ businessSlug });
      if (admin && admin.squareAccessToken) {
        const client = new Client({ accessToken: admin.squareAccessToken, environment: Environment.Sandbox });
        clientToUse = client.paymentsApi;
      }
    }
    const api = clientToUse || paymentsApi;

    const response = await api.createPayment({
      sourceId,
      idempotencyKey: `${Date.now()}`,
      amountMoney: {
        amount: amount,
        currency: "USD",
      },
    });

    // Handle BigInt serialization
    const result = JSON.parse(
      JSON.stringify(response.result, (key, value) => (typeof value === "bigint" ? value.toString() : value))
    );

    console.log("Response: ", response);
    console.log("Result: ", result);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error: ", error);
    res.status(500).json({ error: error.message });
  }
};
