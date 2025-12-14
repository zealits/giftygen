const jwt = require("jsonwebtoken");
const { GoogleAuth } = require("google-auth-library");
const path = require("path");
const GiftCard = require("../models/giftCardSchema");
const credentials = require("../config/wallet-api-key.json");

const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
const baseUrl = "https://walletobjects.googleapis.com/walletobjects/v1";

// In-memory store for Apple Wallet passes
const applePassStore = new Map();

// Initialize Google Auth Client
const httpClient = new GoogleAuth({
  credentials: credentials,
  scopes: "https://www.googleapis.com/auth/wallet_object.issuer",
});

// Helper function to convert Cloudinary URLs to Google Wallet compatible format
function optimizeImageForWallet(imageUrl) {
  if (!imageUrl) return null;
  
  try {
    // Check if it's a Cloudinary URL
    if (imageUrl.includes('cloudinary.com')) {
      // Extract the parts of the URL
      const urlParts = imageUrl.split('/upload/');
      if (urlParts.length === 2) {
        // Add transformations: convert to JPG, add white background, optimize quality, set size
        const transformations = 'c_pad,b_white,f_jpg,q_auto:good,w_1032,h_660';
        const imagePath = urlParts[1].replace(/\.(png|webp|gif)$/i, '.jpg');
        return `${urlParts[0]}/upload/${transformations}/${imagePath}`;
      }
    }
    
    // If not Cloudinary or can't be transformed, return original
    return imageUrl;
  } catch (error) {
    console.error("Error optimizing image:", error);
    return imageUrl; // Return original on error
  }
}

async function createGiftCardClass(giftCardName) {
  console.log("Creating/checking gift card class for:", giftCardName);
  const formattedName = giftCardName.replace(/\s+/g, "_").toLowerCase();
  const classId = `${issuerId}.${formattedName}_class`;

  try {
    await httpClient.request({ 
      url: `${baseUrl}/genericClass/${classId}`, 
      method: "GET" 
    });
    console.log(`✓ Gift Card Class '${formattedName}' already exists.`);
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
      };

      await httpClient.request({ 
        url: `${baseUrl}/genericClass`, 
        method: "POST", 
        data: giftCardClass 
      });
      console.log(`✓ Gift Card Class '${giftCardName}' created successfully.`);
    } else {
      console.error("❌ Error checking/creating class:", err.response?.data || err.message);
      throw err;
    }
  }

  return classId;
}

async function generateWalletPass(req, res) {
  try {
    console.log("\n========== WALLET PASS GENERATION STARTED ==========");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
    const { id, purchaseType, selfInfo, giftInfo, paymentDetails } = req.body;

    // Validate required fields
    if (!id) {
      return res.status(400).json({ error: "Gift card ID is required" });
    }

    const giftCardDetails = await GiftCard.findById(id);
    if (!giftCardDetails) {
      return res.status(404).json({ error: "Gift card not found" });
    }

    const walletGiftCardName = giftCardDetails.giftCardName;
    const expiryDate = giftCardDetails.expirationDate;

    const userEmail = purchaseType === "self" 
      ? selfInfo?.email 
      : giftInfo?.recipientEmail || "default@example.com";
    const userName = purchaseType === "self" 
      ? selfInfo?.name 
      : giftInfo?.recipientName || "Gift Card Holder";
    const amount = giftCardDetails.amount || 0;
    const currency = paymentDetails?.currency || "USD";

    console.log("Gift Card Details:", {
      name: walletGiftCardName,
      amount,
      currency,
      userEmail,
      userName
    });

    // Generate unique QR code
    const uniqueCode = `${id}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    console.log("Generated unique code:", uniqueCode);

    console.log("\n--- Creating Gift Card Class ---");
    const classId = await createGiftCardClass(walletGiftCardName);
    
    // Create sanitized object ID
    const sanitizedEmail = userEmail.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const objectId = `${issuerId}.${sanitizedEmail}_${uniqueSuffix}`;

    console.log("IDs:", {
      classId,
      objectId
    });

    // Optimize images for Google Wallet
    console.log("\n--- Optimizing Images ---");
    
    // TEMPORARY: Use Google's test image that is guaranteed to work
    // Replace this with your actual Cloudinary URL once it's fixed
    const logoUrl = "https://res.cloudinary.com/dl2r1xehq/image/upload/v1765698911/giftygen_logo_doy96y.png";
    
    
    // Your original logo URL (currently not accessible by Google Wallet):
    //const logoUrl = "https://res.cloudinary.com/dl2r1xehq/image/upload/v1765698903/Aii_logo_ew1zic.png";
    
    const optimizedLogo = logoUrl; // Use directly without optimization for testing
    const optimizedHeroImage = optimizeImageForWallet(giftCardDetails.giftCardImg);

    console.log("Original Logo:", logoUrl);
    console.log("Optimized Logo:", optimizedLogo);
    console.log("Original Hero:", giftCardDetails.giftCardImg);
    console.log("Optimized Hero:", optimizedHeroImage);

    // Build the gift card object
    let giftCardObject = {
      id: objectId,
      classId: classId,
      genericType: "GENERIC_TYPE_UNSPECIFIED",
      hexBackgroundColor: "#4158D0",
      cardTitle: { 
        defaultValue: { language: "en-US", value: walletGiftCardName } 
      },
      subheader: { 
        defaultValue: { language: "en-US", value: `${currency} ${amount}` } 
      },
      header: { 
        defaultValue: { language: "en-US", value: userName } 
      },
      barcode: {
        type: "QR_CODE",
        value: uniqueCode,
      },
      textModulesData: [
        {
          header: "Gift Card Details",
          body: `Value: ${currency} ${amount}\nScan QR code to redeem`,
          id: "giftcard_info",
        },
        {
          header: "Expiration Date",
          body: `Expires on: ${expiryDate ? new Date(expiryDate).toLocaleDateString() : "No Expiry"}`,
          id: "expiry_date",
        },
      ],
    };

    // Add logo if available
    if (optimizedLogo) {
      giftCardObject.logo = {
        sourceUri: { uri: optimizedLogo },
        contentDescription: {
          defaultValue: { language: "en-US", value: "Logo" },
        },
      };
      console.log("✓ Logo added to card object");
    } else {
      console.log("⚠ No logo available");
    }

    // TEMPORARILY SKIP HERO IMAGE - Add it back once logo works
    console.log("⚠ Hero image temporarily disabled for testing");
    
    /*
    // Uncomment this once logo works:
    if (optimizedHeroImage) {
      giftCardObject.heroImage = {
        sourceUri: { uri: optimizedHeroImage },
        contentDescription: {
          defaultValue: {
            language: "en-US",
            value: `${walletGiftCardName} Gift Card`,
          },
        },
      };
      console.log("✓ Hero image added to card object");
    }
    */

    // Create the object in Google Wallet
    console.log("\n--- Creating Object in Google Wallet ---");
    try {
      await httpClient.request({
        url: `${baseUrl}/genericObject`,
        method: 'POST',
        data: giftCardObject
      });
      console.log("✓ Object created successfully in Google Wallet");
    } catch (createError) {
      if (createError.response?.status === 409) {
        console.log("⚠ Object already exists (409), continuing...");
      } else {
        console.error("❌ Error creating object:");
        console.error("Status:", createError.response?.status);
        console.error("Error:", JSON.stringify(createError.response?.data, null, 2));
        throw createError;
      }
    }

    // Create JWT Token for Google Wallet
    console.log("\n--- Generating JWT Token ---");
    const claims = {
      iss: credentials.client_email,
      aud: "google",
      typ: "savetowallet",
      payload: {
        genericObjects: [giftCardObject]
      },
      origins: ["https://giftygen.com"],
    };

    const token = jwt.sign(claims, credentials.private_key, { algorithm: "RS256" });
    const googleWalletUrl = `https://pay.google.com/gp/v/save/${token}`;
    console.log("✓ Google Wallet URL generated");

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
      console.log(`Apple pass ${applePassId} expired and removed from store`);
    }, 24 * 60 * 60 * 1000);

    const appleWalletUrl = `/api/wallet/download-apple-pass/${applePassId}`;

    console.log("\n========== WALLET PASS GENERATION SUCCESS ==========");
    console.log("Google Wallet URL:", googleWalletUrl);
    console.log("Apple Wallet URL:", appleWalletUrl);
    console.log("Unique Code:", uniqueCode);
    console.log("====================================================\n");

    res.json({
      googleWalletUrl,
      appleWalletUrl,
      uniqueCode,
    });
  } catch (error) {
    console.error("\n========== WALLET PASS GENERATION FAILED ==========");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    if (error.response?.data) {
      console.error("API Error details:", JSON.stringify(error.response.data, null, 2));
    }
    console.error("====================================================\n");
    
    res.status(500).json({ 
      error: "Failed to generate wallet pass.",
      details: error.response?.data || error.message 
    });
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
  applePassStore,
};