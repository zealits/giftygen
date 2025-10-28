const jwt = require("jsonwebtoken");
const { GoogleAuth } = require("google-auth-library");
const path = require("path");
const GiftCard = require("../models/giftCardSchema");
const credentials = require("../config/wallet-api-key.json");

const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID; // Replace with actual issuer ID
const baseUrl = "https://walletobjects.googleapis.com/walletobjects/v1";

// In-memory store for Apple Wallet passes (in production, use database)
const applePassStore = new Map();

// Initialize Google Auth Client
const httpClient = new GoogleAuth({
  credentials: credentials,
  scopes: "https://www.googleapis.com/auth/wallet_object.issuer",
});

async function createGiftCardClass(giftCardName) {
  console.log("hit hitted");
  const formattedName = giftCardName.replace(/\s+/g, "_").toLowerCase();
  const classId = `${issuerId}.${formattedName}_class`;

  try {
    await httpClient.request({ url: `${baseUrl}/genericClass/${classId}`, method: "GET" });
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
            body: "Use this gift card for purchases.",
            id: "giftcard_info",
          },
          {
            header: "Expiration Date",
            body: "Valid until specified date.",
            id: "expiry_date",
          },
        ],
      };

      await httpClient.request({ url: `${baseUrl}/genericClass`, method: "POST", data: giftCardClass });
      console.log(`Gift Card Class '${giftCardName}' created successfully.`);
    } else {
      console.error("Error checking/creating class:", err);
      throw err;
    }
  }

  return classId;
}
async function generateWalletPass(req, res) {
  try {
    console.log("Received request body1223:", req.body);
    const { id, purchaseType, selfInfo, giftInfo, paymentDetails } = req.body;

    const giftCardDetails = await GiftCard.findById(id);
    const walletGiftCardName = giftCardDetails.giftCardName;
    const expiryDate = giftCardDetails.expirationDate;

    const userEmail = purchaseType === "self" ? selfInfo.email : giftInfo.recipientEmail || "default@example.com";
    const userName = purchaseType === "self" ? selfInfo.name : giftInfo.recipientName || "Gift Card Holder";
    const amount = giftCardDetails.amount || "0";
    const currency = paymentDetails.currency || "USD";

    // Generate the same unique QR code as used in email
    const uniqueCode = `${id}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    const aiiLogo = "https://res.cloudinary.com/dzmn9lnk5/image/upload/v1739316421/Aii/Aii_nobackground_ym8wyn.png";

    console.log("Creating gift card...");
    const classId = await createGiftCardClass(walletGiftCardName);
    const uniqueSuffix = `${giftCardDetails._id}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const objectId = `${issuerId}.${userEmail.replace(/[^\w.-]/g, "_")}_${uniqueSuffix}`;

    let giftCardObject = {
      id: objectId,
      classId: classId,
      genericType: "GENERIC_TYPE_UNSPECIFIED",
      hexBackgroundColor: "#4158D0",
      hexForegroundColor: "#FFFFFF",
      logo: {
        sourceUri: { uri: aiiLogo },
        contentDescription: {
          defaultValue: { language: "en-US", value: "Aii Logo" },
        },
      },
      cardTitle: { defaultValue: { language: "en", value: walletGiftCardName } },
      subheader: { defaultValue: { language: "en", value: `${currency} ${amount}` } },
      header: { defaultValue: { language: "en", value: userName } },
      barcode: {
        type: "QR_CODE",
        value: uniqueCode, // Using the same unique code format as email QR
      },
      heroImage: {
        sourceUri: { uri: giftCardDetails.giftCardImg },
        contentDescription: {
          defaultValue: {
            language: "en-US",
            value: `${walletGiftCardName} Gift Card`,
          },
        },
        dimensions: {
          height: "130px",
          width: "100%",
        },
      },
      textModulesData: [
        {
          header: "Gift Card Details",
          body: `Value: ${currency} ${amount}\nScan QR code to redeem`,
          id: "giftcard_info",
        },
        {
          header: "Expiration Date",
          body: `Expires on: ${expiryDate || "No Expiry"}`,
          id: "expiry_date",
        },
      ],
    };

    console.log("Class ID:", classId);
    console.log("Object ID:", objectId);

    // Create JWT Token for Google Wallet
    const claims = {
      iss: "giftcard-wallet-service-accoun@turing-reach-420001.iam.gserviceaccount.com",
      aud: "google",
      typ: "savetowallet",
      payload: { genericObjects: [giftCardObject] },
    };

    const token = jwt.sign(claims, credentials.private_key, { algorithm: "RS256" });
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

    // Save the QR code details to the gift card document
    const buyerDetails = {
      purchaseType,
      selfInfo: purchaseType === "self" ? selfInfo : undefined,
      giftInfo: purchaseType === "gift" ? giftInfo : undefined,
      paymentDetails,
      purchaseDate: new Date(),
      qrCode: {
        uniqueCode,
        createdAt: new Date(),
        isUsed: false,
      },
      remainingBalance: amount,
    };

    // Add buyer to gift card
    giftCardDetails.buyers.push(buyerDetails);
    // await giftCardDetails.save();

    // console.log("Generated Save URL:", saveUrl);
    console.log("unicode generated:", uniqueCode);

    // Store Apple Wallet pass data
    const applePassId = uniqueCode;
    applePassStore.set(applePassId, {
      id,
      giftCardDetails,
      purchaseType,
      selfInfo,
      giftInfo,
      paymentDetails,
      uniqueCode,
      walletGiftCardName,
      userName,
      amount,
      currency,
      expiryDate,
    });

    // Set expiration for stored data (24 hours)
    setTimeout(() => {
      applePassStore.delete(applePassId);
    }, 24 * 60 * 60 * 1000);

    const appleWalletUrl = `/api/wallet/download-apple-pass/${applePassId}`;

    res.json({
      googleWalletUrl: saveUrl,
      appleWalletUrl: appleWalletUrl,
      uniqueCode,
    });
  } catch (error) {
    console.error("Error generating wallet pass:", error);
    res.status(500).json({ error: "Failed to generate wallet pass." });
  }
}

function getApplePassData(req, res) {
  try {
    const { passId } = req.params;
    const passData = applePassStore.get(passId);

    if (!passData) {
      return res.status(404).json({ error: "Pass not found or expired" });
    }

    res.json(passData);
  } catch (error) {
    console.error("Error retrieving Apple pass data:", error);
    res.status(500).json({ error: "Failed to retrieve pass data" });
  }
}

module.exports = {
  generateWalletPass,
  getApplePassData,
  applePassStore, // Export the store so appleWalletController can access it
};
