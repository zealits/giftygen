// app.js
const express = require("express");
const path = require("path");
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const paymentRoutes = require("./routes/paymentRoutes");
const walletRoutes = require("./routes/walletRoutes.js");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
// Import the routes for the API
const restaurantAdminRoutes = require("./routes/restaurantAdminRoutes");
const giftCardRoutes = require("./routes/giftCardRoutes");
const superAdminRoutes = require("./routes/superAdminRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Make sure to add your dashboard routes here

// Create an Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes

app.use("/api/v1/admin", restaurantAdminRoutes); // Your restaurant admin API routes
app.use("/api/v1/admin", giftCardRoutes); // Your gift card API routes
app.use("/api/v1/admin/reports", reportRoutes); // Report routes
app.use("/api/superadmin", superAdminRoutes); // Super admin routes
app.use("/api/payments", paymentRoutes);
app.use("/api/v1/payment", paymentRoutes); // Alias for new subscription module
app.use("/api/v1/subscription", subscriptionRoutes);
app.use("/api/wallet", walletRoutes);

const { GoogleAuth } = require("google-auth-library");
const jwt = require("jsonwebtoken");

const credentials = {
  type: "service_account",
  project_id: "turing-reach-420001",
  private_key_id: "f02df85cb5e9b0de49207c7659d3231e9b44b0f1",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDXzlbZggQUn7lB\n5YA/Fjtfo/qGiiuwmr/UlT23yOrNJBhl1widmK5srejAhas/fZnY078crpznaY6y\nLcHucuMXw37GiFBhQsuwS6an17u4Z9Ttsw7dsoYP/dkh5YZ619Kk1REZKQE8evtR\nx+eVFEhOvMyUrUS2dvqYMK5rkyfAdxRTkbT1sCnTtHYgD+wQpaD/Qoel13GZlkr6\nB/bZz3Zqphr2KYxaXqbfCvV00o4SCLD1Qy5CR1r7pSZ/5ROgQ8IS1ZGEOwYIfFA8\nc6NYEExuzi8PRm/tsJbTA8buuCli/Lc5KEUBXrKHd2fy5gXClaGIiFnFBBZP57Tl\nIZwgd3HnAgMBAAECggEAB92l16b9KIqOMs1oHipcjXg6yoGvfIdQKNTmRvz58fJm\nflh/wypmlvd+UcMwaCy/zbNnMJWIW/zCa3WdUiKLsNA6nlhtO2nxTwhtC7kWu0Ah\n9rIu/3CP0DBQGKa8rYtieQkGuFXd6mVVgYmWrMC99N3Uz9UIM8K74byQJMOiJ6ce\nUIBfIaMo4iG/6yA+rZPy3vKDCrHm2gZBcTT1cZTsO6vgH1a0m0K7oBo5FUE6gj96\nbVIvRR5caPwI0OaEI674U7FhOJPCyaaFEBYDPlExI//m4e8Skifz53jM0QPG4EJI\n3XMJeN8QsHGVNee2Gu9nzDn6Ke0tCJyAir8IORkyAQKBgQD33kJG9O76SMyyaZ+n\n0GU4IJXScgMaU7xzJcTZAjT2z1afsFa7oAeuEZOX/Cu8RWkD59QUh2ul8RRSeoEw\nTZJOblt+wB8m4wp0UcY6cQnZQ4eZVo7AfiERkK5efVUR41UKqy5sY98GdQocYoW8\nW1tbrG6WGlRwaHUljc4DbzdmQQKBgQDe4s2yJISqoVfb5c9HfC4fhydUvKwS9vjX\n2Qg4YcZNWTRDURhEdKcPQfxw0V/g+ePNge4zBM5fBk8qAfRR17frdyplkHvs1Gao\nCjna22d3t8VmLNYRRuqR1JgOa6I8hGbmnF3iGFEDOYFOCPhjnq1fdtHhLZUQfi2n\nE7f6prteJwKBgQD1M6ndB/BhKCNXW6XVHRMEszeDN8ZaBPwn7PUOuGAsyG+pCYjD\nk0wFpt2bPJsHZKK+elgS9uRHBHZWIVorrpFNhV59xREMJw3wg/TVW32isGs0Bayy\nQBP2jGnyj4nYaEt4gl8qWqIGgUG/Urd53eZCihHb67AcgzlgLSffveXQAQKBgQC3\nSt8Lu9paE/sTvGZ8jBPGG7htiAceRXoYz8Nh0o5od45yOZNyYFguRP6brKNjeT0s\neMhxrmckYCTkD91jHLqEamg0Q+CVv4p4cIhpgfsRydANGZwlcyNeL+2oFj3B9MRG\nq5rNX1/n/fdnPBtAmXJMSoOI4ZpviMR0XNP0zf7SCwKBgQDOX5ZgXoK/3XvTLZV2\nZNfyVnVu4CUa1I5YQk1v0C+kw92IZVfq3rHwTLfsC8Ux4TCiamwZmQH73B2RB0TD\nm6xh/bDQtY70dF/vGMouA/InaRevCeXIg5cSZex55gCiXBdhDpLGIZsQUB+JANSD\nQqU68v0UZWD7oBxVVhA3Bo/LEg==\n-----END PRIVATE KEY-----\n",
  client_email: "giftcard-wallet-service-accoun@turing-reach-420001.iam.gserviceaccount.com",
  client_id: "116194697722166493678",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/giftcard-wallet-service-accoun%40turing-reach-420001.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

const issuerId = "3388000000022844023"; // Replace with your Google Wallet Issuer ID
const baseUrl = "https://walletobjects.googleapis.com/walletobjects/v1";

const httpClient = new GoogleAuth({
  credentials: credentials,
  scopes: "https://www.googleapis.com/auth/wallet_object.issuer",
});

async function createGiftCardClass(giftCardName) {
  const formattedName = "Aii";
  const classId = `${issuerId}.${formattedName}_class`;

  try {
    await httpClient.request({
      url: `${baseUrl}/genericClass/${classId}`,
      method: "GET",
    });
    console.log(`Gift Card Class '${formattedName}' already exists.`);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      console.log(`Creating new Gift Card Class: ${formattedName}`);

      const giftCardClass = {
        id: classId,
        classTemplateInfo: {
          cardTemplateOverride: {
            cardRowTemplateInfos: [
              {
                twoItems: {
                  startItem: {
                    firstValue: {
                      fields: [{ fieldPath: 'object.textModulesData["giftcard_info"]' }],
                    },
                  },
                  endItem: {
                    firstValue: {
                      fields: [{ fieldPath: 'object.textModulesData["expiry_date"]' }],
                    },
                  },
                },
              },
            ],
          },
        },
        textModulesData: [
          {
            header: "Gift Card Details",
            body: `Use this gift card for purchases.`,
            id: "giftcard_info",
          },
          {
            header: "Expiration Date",
            body: "Valid until specified date.",
            id: "expiry_date",
          },
        ],
        imageModulesData: [
          {
            mainImage: {
              sourceUri: {
                uri: "https://www.concordaerospace.com/cdn/shop/products/GIFTCARD-50.png?v=1639062508",
              },
              contentDescription: {
                defaultValue: { language: "en-US", value: `${giftCardName} Gift Card` },
              },
            },
            id: "giftcard_image",
          },
        ],
      };

      await httpClient.request({
        url: `${baseUrl}/genericClass`,
        method: "POST",
        data: giftCardClass,
      });

      console.log(`Gift Card Class '${giftCardName}' created successfully.`);
    } else {
      console.error("Error checking/creating class:", err);
      throw err;
    }
  }

  return classId;
}

app.post("/generate-wallet-pass", async (req, res) => {
  console.log(req.body);
  const { purchaseType, selfInfo, giftInfo, paymentDetails, giftCardName, expiryDate } = req.body;
  console.log(purchaseType);
  console.log(selfInfo);
  console.log(paymentDetails);
  console.log(giftCardName);
  console.log(expiryDate);

  const userEmail = purchaseType === "self" ? selfInfo.email : giftInfo.recipientEmail;
  const userName = purchaseType === "self" ? selfInfo.name : giftInfo.recipientName;
  const transactionId = paymentDetails.transactionId;
  const amount = paymentDetails.paymentamount;
  const currency = paymentDetails.currency;

  console.log(transactionId);
  console.log(amount);
  console.log(currency);
  // const formattedName = giftCardName.replace(/\s+/g, "_").toLowerCase();

  const credentials = {
    type: "service_account",
    project_id: "turing-reach-420001",
    private_key_id: "f02df85cb5e9b0de49207c7659d3231e9b44b0f1",
    private_key:
      "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDXzlbZggQUn7lB\n5YA/Fjtfo/qGiiuwmr/UlT23yOrNJBhl1widmK5srejAhas/fZnY078crpznaY6y\nLcHucuMXw37GiFBhQsuwS6an17u4Z9Ttsw7dsoYP/dkh5YZ619Kk1REZKQE8evtR\nx+eVFEhOvMyUrUS2dvqYMK5rkyfAdxRTkbT1sCnTtHYgD+wQpaD/Qoel13GZlkr6\nB/bZz3Zqphr2KYxaXqbfCvV00o4SCLD1Qy5CR1r7pSZ/5ROgQ8IS1ZGEOwYIfFA8\nc6NYEExuzi8PRm/tsJbTA8buuCli/Lc5KEUBXrKHd2fy5gXClaGIiFnFBBZP57Tl\nIZwgd3HnAgMBAAECggEAB92l16b9KIqOMs1oHipcjXg6yoGvfIdQKNTmRvz58fJm\nflh/wypmlvd+UcMwaCy/zbNnMJWIW/zCa3WdUiKLsNA6nlhtO2nxTwhtC7kWu0Ah\n9rIu/3CP0DBQGKa8rYtieQkGuFXd6mVVgYmWrMC99N3Uz9UIM8K74byQJMOiJ6ce\nUIBfIaMo4iG/6yA+rZPy3vKDCrHm2gZBcTT1cZTsO6vgH1a0m0K7oBo5FUE6gj96\nbVIvRR5caPwI0OaEI674U7FhOJPCyaaFEBYDPlExI//m4e8Skifz53jM0QPG4EJI\n3XMJeN8QsHGVNee2Gu9nzDn6Ke0tCJyAir8IORkyAQKBgQD33kJG9O76SMyyaZ+n\n0GU4IJXScgMaU7xzJcTZAjT2z1afsFa7oAeuEZOX/Cu8RWkD59QUh2ul8RRSeoEw\nTZJOblt+wB8m4wp0UcY6cQnZQ4eZVo7AfiERkK5efVUR41UKqy5sY98GdQocYoW8\nW1tbrG6WGlRwaHUljc4DbzdmQQKBgQDe4s2yJISqoVfb5c9HfC4fhydUvKwS9vjX\n2Qg4YcZNWTRDURhEdKcPQfxw0V/g+ePNge4zBM5fBk8qAfRR17frdyplkHvs1Gao\nCjna22d3t8VmLNYRRuqR1JgOa6I8hGbmnF3iGFEDOYFOCPhjnq1fdtHhLZUQfi2n\nE7f6prteJwKBgQD1M6ndB/BhKCNXW6XVHRMEszeDN8ZaBPwn7PUOuGAsyG+pCYjD\nk0wFpt2bPJsHZKK+elgS9uRHBHZWIVorrpFNhV59xREMJw3wg/TVW32isGs0Bayy\nQBP2jGnyj4nYaEt4gl8qWqIGgUG/Urd53eZCihHb67AcgzlgLSffveXQAQKBgQC3\nSt8Lu9paE/sTvGZ8jBPGG7htiAceRXoYz8Nh0o5od45yOZNyYFguRP6brKNjeT0s\neMhxrmckYCTkD91jHLqEamg0Q+CVv4p4cIhpgfsRydANGZwlcyNeL+2oFj3B9MRG\nq5rNX1/n/fdnPBtAmXJMSoOI4ZpviMR0XNP0zf7SCwKBgQDOX5ZgXoK/3XvTLZV2\nZNfyVnVu4CUa1I5YQk1v0C+kw92IZVfq3rHwTLfsC8Ux4TCiamwZmQH73B2RB0TD\nm6xh/bDQtY70dF/vGMouA/InaRevCeXIg5cSZex55gCiXBdhDpLGIZsQUB+JANSD\nQqU68v0UZWD7oBxVVhA3Bo/LEg==\n-----END PRIVATE KEY-----\n",
    client_email: "giftcard-wallet-service-accoun@turing-reach-420001.iam.gserviceaccount.com",
    client_id: "116194697722166493678",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url:
      "https://www.googleapis.com/robot/v1/metadata/x509/giftcard-wallet-service-accoun%40turing-reach-420001.iam.gserviceaccount.com",
    universe_domain: "googleapis.com",
  };
  const issuerId = "3388000000022844023"; // Replace with your Google Wallet Issuer ID

  console.log("creating giftcard");
  const classId = await createGiftCardClass(giftCardName);
  const baseUrl = "https://walletobjects.googleapis.com/walletobjects/v1";
  console.log("creating ending");

  const httpClient = new GoogleAuth({
    credentials: credentials,
    scopes: "https://www.googleapis.com/auth/wallet_object.issuer",
  });

  const objectId = `${issuerId}.${userEmail.replace(/[^\w.-]/g, "_")}`;

  console.log("class id ::: ", classId);
  console.log("object id ::: ", objectId);
  let giftCardObject = {
    id: objectId,
    classId: classId,
    genericType: "GENERIC_TYPE_UNSPECIFIED",
    hexBackgroundColor: "#FFD700", // Gold color for gift card
    logo: {
      sourceUri: {
        uri: "https://www.concordaerospace.com/cdn/shop/products/GIFTCARD-50.png?v=1639062508",
      },
    },
    cardTitle: {
      defaultValue: { language: "en", value: "testing giftcard name" },
    },
    subheader: {
      defaultValue: { language: "en", value: "₹ 50" },
    },
    header: {
      defaultValue: { language: "en", value: "Testing User" },
    },
    barcode: {
      type: "QR_CODE",
      value: `${transactionId}`,
    },
    textModulesData: [
      {
        header: "Gift Card Details",
        body: `Value: ${currency} ${amount}\nTransaction ID: ${transactionId}`,
        id: "giftcard_info",
      },
      {
        header: "Expiration Date",
        body: `Expires on: ${expiryDate}`,
        id: "expiry_date",
      },
    ],
  };

  // Create JWT Token for Google Wallet
  const claims = {
    iss: credentials.client_email,
    aud: "google",
    typ: "savetowallet",
    payload: {
      genericObjects: [giftCardObject],
    },
  };

  const token = jwt.sign(claims, credentials.private_key, { algorithm: "RS256" });
  const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

  console.log(saveUrl);
  res.json({ saveUrl });
});

// Serve React app (if you're serving a frontend from the backend)
app.use(express.static(path.join(__dirname, "./frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./frontend/build/index.html"));
});

// Error handling middleware
app.use(errorMiddleware);

module.exports = app;
