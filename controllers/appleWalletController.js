const GiftCard = require("../models/giftCardSchema");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
const https = require("https");
const http = require("http");
const { PKPass } = require("passkit-generator");

// Helper function to detect certificate type
function detectCertificateType(certPath) {
  try {
    const certPem = fs.readFileSync(certPath, "utf8");

    // Try using Node.js X509Certificate (Node 15.6.0+)
    if (crypto.X509Certificate) {
      try {
        const cert = new crypto.X509Certificate(certPem);
        const publicKey = cert.publicKey;

        if (publicKey.asymmetricKeyType === "rsa") {
          return "RSA";
        } else if (publicKey.asymmetricKeyType === "ec") {
          return "ECDSA";
        }
      } catch (x509Error) {
        // Fall through to node-forge method
      }
    }

    // Fallback: try to parse with node-forge to see what error we get
    const forge = require("node-forge");
    forge.pki.certificateFromPem(certPem);
    return "RSA"; // If it works, it's RSA
  } catch (error) {
    // If node-forge throws "OID is not RSA", it's ECDSA
    if (error.message && error.message.includes("OID is not RSA")) {
      return "ECDSA";
    }
    // Try to detect from error or certificate content
    const certPem = fs.readFileSync(certPath, "utf8");
    if (certPem.includes("BEGIN CERTIFICATE")) {
      // If we can't determine, try to use openssl command if available
      return "UNKNOWN";
    }
    return "UNKNOWN";
  }
}

// Lazy load certificates to avoid errors at module load time
let key, cert, wwdr;
let certificatesLoaded = false;

function loadCertificates() {
  if (certificatesLoaded) return { key, cert, wwdr };

  const certDir = path.join(__dirname, "../certs/apple");

  // Try to find certificate file
  const possibleCertNames = ["certificate.pem", "cert.pem", "GiftyGen.cer"];
  let certPath = null;
  for (const name of possibleCertNames) {
    const pathToCheck = path.join(certDir, name);
    if (fs.existsSync(pathToCheck)) {
      certPath = pathToCheck;
      break;
    }
  }

  const keyPath = path.join(certDir, "key.pem");

  if (certPath && fs.existsSync(keyPath)) {
    key = fs.readFileSync(keyPath, "utf8");

    // Read certificate file
    // Note: .cer files are typically in DER format (binary) and need to be converted to PEM first
    if (certPath.endsWith(".cer")) {
      console.warn("⚠️ Warning: .cer file detected. .cer files are typically in DER format (binary).");
      console.warn(
        "⚠️ Please convert to PEM format using: openssl x509 -inform DER -in " + certPath + " -out certificate.pem"
      );
      // Try to read as text first (in case it's already PEM)
      try {
        cert = fs.readFileSync(certPath, "utf8");
        if (!cert.includes("BEGIN CERTIFICATE")) {
          throw new Error("Certificate appears to be in DER format");
        }
      } catch (error) {
        throw new Error(
          `Certificate file ${certPath} is in DER format (binary). Please convert to PEM format using: openssl x509 -inform DER -in ${certPath} -out ${certDir}/certificate.pem`
        );
      }
    } else {
      // .pem file, read as text
      cert = fs.readFileSync(certPath, "utf8");
    }

    // Validate certificate format
    if (!cert.includes("BEGIN CERTIFICATE") || !cert.includes("END CERTIFICATE")) {
      throw new Error(
        `Certificate file ${certPath} does not appear to be in PEM format. Expected "-----BEGIN CERTIFICATE-----" and "-----END CERTIFICATE-----" markers. If it's a .cer file, convert it using: openssl x509 -inform DER -in ${certPath} -out ${certDir}/certificate.pem`
      );
    }

    // Try to find WWDR certificate
    const possibleWWDRNames = ["wwdr.pem", "AppleWWDRCA.pem", "AppleAAICAG3.cer"];
    let wwdrPath = null;
    for (const name of possibleWWDRNames) {
      const pathToCheck = path.join(certDir, name);
      if (fs.existsSync(pathToCheck)) {
        wwdrPath = pathToCheck;
        break;
      }
    }

    if (wwdrPath) {
      if (wwdrPath.endsWith(".cer")) {
        console.warn("⚠️ Warning: .cer WWDR file detected. Please convert to PEM format.");
        // Try to read as text first (in case it's already PEM)
        try {
          wwdr = fs.readFileSync(wwdrPath, "utf8");
          if (!wwdr.includes("BEGIN CERTIFICATE")) {
            throw new Error("WWDR certificate appears to be in DER format");
          }
        } catch (error) {
          throw new Error(
            `WWDR certificate file ${wwdrPath} is in DER format (binary). Please convert to PEM format using: openssl x509 -inform DER -in ${wwdrPath} -out ${certDir}/wwdr.pem`
          );
        }
      } else {
        wwdr = fs.readFileSync(wwdrPath, "utf8");
      }

      // Validate WWDR certificate format
      if (!wwdr.includes("BEGIN CERTIFICATE") || !wwdr.includes("END CERTIFICATE")) {
        throw new Error(
          `WWDR certificate file ${wwdrPath} does not appear to be in PEM format. If it's a .cer file, convert it using: openssl x509 -inform DER -in ${wwdrPath} -out ${certDir}/wwdr.pem`
        );
      }
    }

    // Validate key format
    if (!key.includes("BEGIN") || !key.includes("END")) {
      throw new Error(`Private key file ${keyPath} does not appear to be in PEM format.`);
    }

    certificatesLoaded = true;
  }

  return { key, cert, wwdr, certPath };
}

// Helper function to fetch image buffer from URL or local path
async function fetchImageBuffer(imageSource) {
  if (!imageSource) {
    return null;
  }

  try {
    // Check if it's a URL
    if (imageSource.startsWith("http://") || imageSource.startsWith("https://")) {
      return new Promise((resolve, reject) => {
        const client = imageSource.startsWith("https://") ? https : http;
        client
          .get(imageSource, (response) => {
            if (response.statusCode !== 200) {
              reject(new Error(`Failed to fetch image: ${response.statusCode}`));
              return;
            }

            const chunks = [];
            response.on("data", (chunk) => chunks.push(chunk));
            response.on("end", () => resolve(Buffer.concat(chunks)));
            response.on("error", reject);
          })
          .on("error", reject);
      });
    } else {
      // Local file path
      if (fs.existsSync(imageSource)) {
        return fs.readFileSync(imageSource);
      } else {
        console.warn(`Image file not found: ${imageSource}`);
        return null;
      }
    }
  } catch (error) {
    console.error(`Error fetching image from ${imageSource}:`, error.message);
    return null;
  }
}

// Generate Apple Wallet .pkpass file with proper signing
async function downloadApplePass(req, res) {
  try {
    const { passId } = req.params;
    console.log("========== APPLE WALLET DOWNLOAD REQUEST ==========");
    console.log("Pass ID received:", passId);
    console.log("Request headers:", req.headers);

    // Get the pass data from the store
    const applePassStore = require("./walletController").applePassStore;
    console.log("Total passes in store:", applePassStore.size);
    console.log("Available pass IDs:", Array.from(applePassStore.keys()));

    const passData = applePassStore.get(passId);
    console.log("Pass data found:", !!passData);

    if (!passData) {
      console.error("❌ Pass not found in store");
      console.error("Looking for passId:", passId);
      console.error("Available keys:", Array.from(applePassStore.keys()));
      return res.status(404).json({
        error: "Pass not found or expired",
        requestedPassId: passId,
        availableKeys: Array.from(applePassStore.keys()),
      });
    }

    console.log("✅ Pass data found:", {
      uniqueCode: passData.uniqueCode,
      userName: passData.userName,
      amount: passData.amount,
      currency: passData.currency,
    });

    // Check if certificates exist (try multiple possible filenames)
    const certDir = path.join(__dirname, "../certs/apple");

    // Try to find certificate file (check multiple possible names)
    const possibleCertNames = ["certificate.pem", "cert.pem", "GiftyGen.cer"];
    let certPath = null;
    for (const name of possibleCertNames) {
      const pathToCheck = path.join(certDir, name);
      if (fs.existsSync(pathToCheck)) {
        certPath = pathToCheck;
        console.log(`✅ Found certificate: ${name}`);
        break;
      }
    }

    // Try to find WWDR certificate (check multiple possible names)
    const possibleWWDRNames = ["wwdr.pem", "AppleWWDRCA.pem", "AppleAAICAG3.cer"];
    let wwdrPath = null;
    for (const name of possibleWWDRNames) {
      const pathToCheck = path.join(certDir, name);
      if (fs.existsSync(pathToCheck)) {
        wwdrPath = pathToCheck;
        console.log(`✅ Found WWDR certificate: ${name}`);
        break;
      }
    }

    // Check for key file
    const keyPath = path.join(certDir, "key.pem");
    const hasKey = fs.existsSync(keyPath);

    // Check if we have all required certificates
    if (!certPath || !hasKey || !wwdrPath) {
      console.error("❌ Apple Wallet certificates not found!");
      console.error("Looking in:", certDir);
      console.error("Found files:");
      try {
        const files = fs.readdirSync(certDir);
        files.forEach((file) => console.error(`  - ${file}`));
      } catch (err) {
        console.error("  (could not read directory)");
      }
      console.error("");
      console.error("Required files:");
      if (!certPath) console.error("  ❌ Certificate file (cert.pem or certificate.pem)");
      if (!hasKey) console.error("  ❌ Private key (key.pem)");
      if (!wwdrPath) console.error("  ❌ WWDR certificate (AppleWWDRCA.pem or wwdr.pem)");
      console.error("");
      console.error("Please see APPLE_WALLET_SETUP.md for instructions on obtaining certificates.");
      return res.status(500).json({
        error: "Apple Wallet certificates not configured",
        message:
          "To add passes to Apple Wallet, you need to configure Apple Developer certificates. See APPLE_WALLET_SETUP.md for details.",
        requiredFiles: {
          certificate: "cert.pem or certificate.pem",
          key: "key.pem",
          wwdr: "AppleWWDRCA.pem or wwdr.pem",
        },
        certificateDirectory: certDir,
      });
    }

    console.log("✅ Certificates found, generating signed pass...");

    // Load certificates
    const certs = loadCertificates();
    if (!certs.key || !certs.cert || !certs.wwdr) {
      throw new Error("Certificates not loaded properly");
    }

    // Detect certificate type
    const certType = detectCertificateType(certPath);
    console.log(`📋 Certificate type detected: ${certType}`);

    // Check if certificate is ECDSA (which passkit-generator doesn't support)
    if (certType === "ECDSA") {
      const errorMsg = `Your certificate is ECDSA, but passkit-generator only supports RSA certificates. 
      
SOLUTION OPTIONS:
1. Request an RSA certificate from Apple Developer Portal (if available)
2. Use a different library that supports ECDSA certificates
3. Convert your certificate (if you have the original .p12, you may be able to export as RSA)

For more information, see: https://github.com/alexandercerutti/passkit-generator/issues`;

      console.error("❌ ECDSA Certificate Detected:");
      console.error(errorMsg);

      return res.status(500).json({
        error: "Certificate type not supported",
        message:
          "Your Apple Wallet certificate is ECDSA, but the current library (passkit-generator) only supports RSA certificates.",
        certificateType: "ECDSA",
        solution:
          "You need to either obtain an RSA certificate from Apple Developer Portal or use a library that supports ECDSA certificates.",
        helpfulLinks: [
          "https://github.com/alexandercerutti/passkit-generator",
          "https://developer.apple.com/documentation/walletpasses",
        ],
      });
    }

    // Get pass model directory
    const passModelDir = path.join(__dirname, "../uploads/pass-models/giftcard.pass");

    // Verify pass model directory exists
    if (!fs.existsSync(passModelDir)) {
      throw new Error(`Pass model directory not found: ${passModelDir}`);
    }

    console.log("📁 Pass model directory:", passModelDir);
    console.log("📋 Pass data:", {
      serialNumber: passData.uniqueCode,
      description: passData.walletGiftCardName || "Gift Card",
      organizationName: process.env.APPLE_ORG_NAME || "GiftyGen",
      teamIdentifier: process.env.APPLE_TEAM_IDENTIFIER || process.env.APPLE_TEAM_ID || "PZZRSDZ86Z",
      passTypeIdentifier: process.env.APPLE_PASS_TYPE_IDENTIFIER || "pass.com.giftygen.giftcard",
    });

    // Create pass using passkit-generator
    console.log("🔨 Creating pass with passkit-generator...");
    let pass;
    try {
      pass = await PKPass.from(
        {
          model: passModelDir,
          certificates: {
            wwdr: certs.wwdr,
            signerCert: certs.cert,
            signerKey: certs.key,
          },
        },
        {
          // Pass data
          serialNumber: passData.uniqueCode,
          description: passData.walletGiftCardName || "Gift Card",
          organizationName: process.env.APPLE_ORG_NAME || "GiftyGen",
          teamIdentifier: process.env.APPLE_TEAM_IDENTIFIER || process.env.APPLE_TEAM_ID || "PZZRSDZ86Z",
          passTypeIdentifier: process.env.APPLE_PASS_TYPE_IDENTIFIER || "pass.com.giftygen.giftcard",
        }
      );
      console.log("✅ Pass created successfully");
    } catch (passCreationError) {
      console.error("❌ Error creating pass:", passCreationError.message);
      console.error("Error details:", passCreationError);
      throw new Error(`Failed to create pass: ${passCreationError.message}`);
    }

    // Set storeCard fields dynamically
    console.log("🔧 Setting storeCard fields dynamically...");
    console.log("📊 Pass data values:", {
      currency: passData.currency,
      amount: passData.amount,
      userName: passData.userName,
    });

    // Prepare dynamic values with proper formatting
    // Currency: If USD use $, otherwise default to ₹ (Indian Rupee)
    const currencySymbol = passData.currency === "INR" ? "$" : "₹";
    const amountValue = `${currencySymbol} ${passData.amount || "0"}`;
    const recipientValue = passData.userName || "Recipient";
    const giftCardTypeValue = passData.walletGiftCardName || "Gift Card";
    
    // Format expiry date
    let validUntilValue = "No Expiry";
    if (passData.expiryDate) {
      try {
        const expiryDate = new Date(passData.expiryDate);
        if (!isNaN(expiryDate.getTime())) {
          // Format as M/D/YYYY (e.g., 5/7/2026)
          validUntilValue = `${expiryDate.getMonth() + 1}/${expiryDate.getDate()}/${expiryDate.getFullYear()}`;
        }
      } catch (e) {
        console.warn("Could not format expiry date:", e);
      }
    }
    
    // Format Card ID (use a shortened version of uniqueCode for display)
    const cardIdValue = passData.uniqueCode ? passData.uniqueCode.substring(0, 20) + "..." : "N/A";

    // Debug: Inspect pass object structure
    console.log("🔍 Pass object keys:", Object.keys(pass));
    console.log("🔍 Pass object structure:", {
      hasStoreCard: !!pass.storeCard,
      hasPass: !!pass.pass,
      hasPassData: !!pass.passData,
      hasModel: !!pass.model,
      hasPassTypeFields: !!pass.passTypeFields,
    });

    // Try to access internal structure - passkit-generator might use different property names
    let internalPass = null;
    if (pass.pass) {
      internalPass = pass.pass;
      console.log("✅ Found pass.pass");
    } else if (pass.passData) {
      internalPass = pass.passData;
      console.log("✅ Found pass.passData");
    } else if (pass.model) {
      internalPass = pass.model;
      console.log("✅ Found pass.model");
    } else {
      // Try to access via getter or inspect the object
      console.log("⚠️ Trying to find internal structure...");
      for (const key of Object.keys(pass)) {
        if (typeof pass[key] === "object" && pass[key] !== null && pass[key].storeCard) {
          internalPass = pass[key];
          console.log(`✅ Found internal structure at pass.${key}`);
          break;
        }
      }
    }

    // Update storeCard in the internal structure
    if (internalPass && internalPass.storeCard) {
      console.log("📝 Updating internalPass.storeCard");
      if (!internalPass.storeCard.primaryFields) {
        internalPass.storeCard.primaryFields = [];
      }
      const primaryIndex = internalPass.storeCard.primaryFields.findIndex((f) => f && f.key === "amount");
      if (primaryIndex >= 0) {
        internalPass.storeCard.primaryFields[primaryIndex].value = amountValue;
        console.log(`✅ Updated internal primaryField[${primaryIndex}]`);
      } else {
        internalPass.storeCard.primaryFields.push({
          key: "amount",
          label: "Gift Card",
          value: amountValue,
        });
        console.log("✅ Added internal primaryField");
      }

      if (!internalPass.storeCard.secondaryFields) {
        internalPass.storeCard.secondaryFields = [];
      }
      const secondaryIndex = internalPass.storeCard.secondaryFields.findIndex((f) => f && f.key === "name");
      if (secondaryIndex >= 0) {
        internalPass.storeCard.secondaryFields[secondaryIndex].value = recipientValue;
        console.log(`✅ Updated internal secondaryField[${secondaryIndex}]`);
      } else {
        internalPass.storeCard.secondaryFields.push({
          key: "name",
          label: "Recipient",
          value: recipientValue,
        });
        console.log("✅ Added internal secondaryField");
      }

      // Add or update giftCardType field in internal structure
      const giftCardTypeIndex = internalPass.storeCard.secondaryFields.findIndex((f) => f && f.key === "giftCardType");
      if (giftCardTypeIndex >= 0) {
        internalPass.storeCard.secondaryFields[giftCardTypeIndex].value = giftCardTypeValue;
        console.log(`✅ Updated internal secondaryField giftCardType[${giftCardTypeIndex}]`);
      } else {
        internalPass.storeCard.secondaryFields.push({
          key: "giftCardType",
          label: "Gift Card Type",
          value: giftCardTypeValue,
        });
        console.log("✅ Added internal secondaryField giftCardType");
      }

      // Add or update validUntil field in internal structure
      const validUntilIndex = internalPass.storeCard.secondaryFields.findIndex((f) => f && f.key === "validUntil");
      if (validUntilIndex >= 0) {
        internalPass.storeCard.secondaryFields[validUntilIndex].value = validUntilValue;
        console.log(`✅ Updated internal secondaryField validUntil[${validUntilIndex}]`);
      } else {
        internalPass.storeCard.secondaryFields.push({
          key: "validUntil",
          label: "Valid Until",
          value: validUntilValue,
          textAlignment: "PKTextAlignmentRight"
        });
        console.log("✅ Added internal secondaryField validUntil");
      }
    }

    // Also update pass.storeCard directly (for compatibility)
    if (!pass.storeCard) {
      pass.storeCard = {};
    }
    if (!pass.storeCard.primaryFields) {
      pass.storeCard.primaryFields = [];
    }
    const primaryFieldIndex = pass.storeCard.primaryFields.findIndex((f) => f && f.key === "amount");
    if (primaryFieldIndex >= 0) {
      pass.storeCard.primaryFields[primaryFieldIndex].value = amountValue;
    } else {
      pass.storeCard.primaryFields.push({
        key: "amount",
        label: "Gift Card",
        value: amountValue,
      });
    }

    if (!pass.storeCard.secondaryFields) {
      pass.storeCard.secondaryFields = [];
    }
    const secondaryFieldIndex = pass.storeCard.secondaryFields.findIndex((f) => f && f.key === "name");
    if (secondaryFieldIndex >= 0) {
      pass.storeCard.secondaryFields[secondaryFieldIndex].value = recipientValue;
    } else {
      pass.storeCard.secondaryFields.push({
        key: "name",
        label: "Recipient",
        value: recipientValue,
      });
    }

    // Add or update giftCardType field
    const giftCardTypeFieldIndex = pass.storeCard.secondaryFields.findIndex((f) => f && f.key === "giftCardType");
    if (giftCardTypeFieldIndex >= 0) {
      pass.storeCard.secondaryFields[giftCardTypeFieldIndex].value = giftCardTypeValue;
    } else {
      pass.storeCard.secondaryFields.push({
        key: "giftCardType",
        label: "Gift Card Type",
        value: giftCardTypeValue,
      });
    }

    // Add or update validUntil field
    const validUntilFieldIndex = pass.storeCard.secondaryFields.findIndex((f) => f && f.key === "validUntil");
    if (validUntilFieldIndex >= 0) {
      pass.storeCard.secondaryFields[validUntilFieldIndex].value = validUntilValue;
    } else {
      pass.storeCard.secondaryFields.push({
        key: "validUntil",
        label: "Valid Until",
        value: validUntilValue,
        textAlignment: "PKTextAlignmentRight"
      });
    }

    console.log("📋 Final pass.storeCard:", JSON.stringify(pass.storeCard, null, 2));

    // CRITICAL: Create a temporary modified template and recreate the pass
    // passkit-generator reads from the template file, so we need to update it
    const passJsonPath = path.join(passModelDir, "pass.json");
    let tempPassModelDir = null;
    let originalPassJson = null;
    let passRecreated = false;

    try {
      // Read the original template
      originalPassJson = JSON.parse(fs.readFileSync(passJsonPath, "utf8"));

      // Create a modified copy
      const modifiedPassJson = JSON.parse(JSON.stringify(originalPassJson));

      // Update the storeCard fields in the modified template
      if (modifiedPassJson.storeCard) {
        // Update header fields
        if (modifiedPassJson.storeCard.headerFields) {
          const titleField = modifiedPassJson.storeCard.headerFields.find((f) => f && f.key === "title");
          if (titleField) {
            titleField.value = "Gift Card Purchase";
            console.log("✅ Updated template headerField title");
          }
        }
        
        // Update primary fields (amount)
        if (modifiedPassJson.storeCard.primaryFields) {
          const amountField = modifiedPassJson.storeCard.primaryFields.find((f) => f && f.key === "amount");
          if (amountField) {
            amountField.value = amountValue;
            console.log("✅ Updated template primaryField amount:", amountField);
          }
        }
        
        // Update secondary fields (recipient, giftCardType, cardId, validUntil)
        if (modifiedPassJson.storeCard.secondaryFields) {
          // Update recipient field
          const recipientField = modifiedPassJson.storeCard.secondaryFields.find((f) => f && f.key === "recipient");
          if (recipientField) {
            recipientField.value = recipientValue;
            console.log("✅ Updated template secondaryField recipient");
          }
          
          // Update or add gift card type field
          const giftCardTypeField = modifiedPassJson.storeCard.secondaryFields.find((f) => f && f.key === "giftCardType");
          if (giftCardTypeField) {
            giftCardTypeField.value = giftCardTypeValue;
            console.log("✅ Updated template secondaryField giftCardType");
          } else {
            // Add giftCardType field if it doesn't exist
            modifiedPassJson.storeCard.secondaryFields.push({
              key: "giftCardType",
              label: "Gift Card Type",
              value: giftCardTypeValue,
            });
            console.log("✅ Added template secondaryField giftCardType");
          }
          
          // Update card ID field
          const cardIdField = modifiedPassJson.storeCard.secondaryFields.find((f) => f && f.key === "cardId");
          if (cardIdField) {
            cardIdField.value = cardIdValue;
            console.log("✅ Updated template secondaryField cardId");
          }
          
          // Update or add valid until field
          const validUntilField = modifiedPassJson.storeCard.secondaryFields.find((f) => f && f.key === "validUntil");
          if (validUntilField) {
            validUntilField.value = validUntilValue;
            console.log("✅ Updated template secondaryField validUntil");
          } else {
            // Add validUntil field if it doesn't exist
            modifiedPassJson.storeCard.secondaryFields.push({
              key: "validUntil",
              label: "Valid Until",
              value: validUntilValue,
              textAlignment: "PKTextAlignmentRight"
            });
            console.log("✅ Added template secondaryField validUntil");
          }
        }

        // Create temporary directory and copy all template files
        // passkit-generator expects the directory to have .pass extension
        tempPassModelDir = path.join(__dirname, "../temp-passes", `${passData.uniqueCode}.pass`);
        if (!fs.existsSync(tempPassModelDir)) {
          fs.mkdirSync(tempPassModelDir, { recursive: true });
        }

        // Copy all files from the template directory
        const templateFiles = fs.readdirSync(passModelDir);
        for (const file of templateFiles) {
          const srcPath = path.join(passModelDir, file);
          const destPath = path.join(tempPassModelDir, file);
          if (fs.statSync(srcPath).isFile()) {
            if (file === "pass.json") {
              // Write the modified pass.json
              fs.writeFileSync(destPath, JSON.stringify(modifiedPassJson, null, 2), "utf8");
            } else {
              // Copy other files as-is
              fs.copyFileSync(srcPath, destPath);
            }
          }
        }

        // Add dynamic gift card image to temporary directory if available
        try {
          // Get image source from passData - prioritize passData.image
          const imageSource = passData.image || 
            passData.giftCardDetails?.giftCardImg || 
            passData.giftCardImg || 
            passData.giftCardImage;

          if (imageSource) {
            console.log("📥 Fetching image for temporary template:", imageSource);
            const imageBuffer = await fetchImageBuffer(imageSource);
            
            if (imageBuffer) {
              // Write strip.png to the temporary template directory
              const stripImagePath = path.join(tempPassModelDir, "strip.png");
              fs.writeFileSync(stripImagePath, imageBuffer);
              console.log("✅ Added strip.png to temporary template directory");
            }
          }
        } catch (imageError) {
          console.warn("⚠️ Could not add image to temporary template:", imageError.message);
        }

        console.log("✅ Created temporary pass model with dynamic values");

        // Recreate the pass with the updated template
        pass = await PKPass.from(
          {
            model: tempPassModelDir,
            certificates: {
              wwdr: certs.wwdr,
              signerCert: certs.cert,
              signerKey: certs.key,
            },
          },
          {
            serialNumber: passData.uniqueCode,
            description: passData.walletGiftCardName || "Gift Card",
            organizationName: process.env.APPLE_ORG_NAME || "GiftyGen",
            teamIdentifier: process.env.APPLE_TEAM_IDENTIFIER || process.env.APPLE_TEAM_ID || "PZZRSDZ86Z",
            passTypeIdentifier: process.env.APPLE_PASS_TYPE_IDENTIFIER || "pass.com.giftygen.giftcard",
          }
        );

        // Update other pass properties
        pass.barcodes = [
          {
            format: "PKBarcodeFormatQR",
            message: passData.uniqueCode,
            messageEncoding: "iso-8859-1",
            altText: "Scan to Redeem",
          },
        ];
        pass.backgroundColor = "rgb(65, 88, 208)";
        pass.foregroundColor = "rgb(255, 255, 255)";
        pass.labelColor = "rgb(255, 255, 255)";
        pass.logoText = "Gift Card Purchase";

        console.log("✅ Recreated pass with dynamic template");
        passRecreated = true;
      }
    } catch (templateError) {
      console.error("⚠️ Error creating temporary template:", templateError.message);
      // Continue with the original pass object modifications as fallback
    }

    // Add dynamic gift card image (strip.png)
    console.log("🖼️ Adding dynamic gift card image...");
    try {
      // Get image source from passData - prioritize passData.image
      const imageSource = passData.image || 
        passData.giftCardDetails?.giftCardImg || 
        passData.giftCardImg || 
        passData.giftCardImage;

      if (imageSource) {
        console.log("📥 Fetching image from:", imageSource);
        const imageBuffer = await fetchImageBuffer(imageSource);
        
        if (imageBuffer) {
          // Add the image as strip.png to override the template's default image
          pass.addBuffer("strip.png", imageBuffer);
          console.log("✅ Added dynamic gift card image (strip.png)");
        } else {
          console.warn("⚠️ Could not fetch image buffer, using template default");
        }
      } else {
        console.log("ℹ️ No image source found in passData, using template default");
      }
    } catch (imageError) {
      console.error("⚠️ Error adding gift card image:", imageError.message);
      // Continue without the image - template default will be used
    }

    // Set barcode and colors (only if we didn't recreate the pass above)
    if (!passRecreated) {
      pass.barcodes = [
        {
          format: "PKBarcodeFormatQR",
          message: passData.uniqueCode,
          messageEncoding: "iso-8859-1",
        },
      ];
      pass.backgroundColor = "rgb(65, 88, 208)";
      pass.foregroundColor = "rgb(255, 255, 255)";
      pass.labelColor = "rgb(255, 255, 255)";
      pass.logoText = passData.walletGiftCardName || "Gift Card";
    }

    // Generate the .pkpass buffer
    const buffer = pass.getAsBuffer();

    console.log("✅ Generated signed .pkpass file, size:", buffer.length, "bytes");

    // Cleanup: Remove temporary directory if it was created
    if (tempPassModelDir && fs.existsSync(tempPassModelDir)) {
      try {
        fs.rmSync(tempPassModelDir, { recursive: true, force: true });
        console.log("✅ Cleaned up temporary pass model directory");
      } catch (cleanupError) {
        console.warn("⚠️ Could not clean up temporary directory:", cleanupError.message);
      }
    }

    // Set headers to trigger download and avoid caching
    res.setHeader("Content-Type", "application/vnd.apple.pkpass");
    res.setHeader("Content-Disposition", `attachment; filename="${passData.uniqueCode}.pkpass"`);
    res.setHeader("Content-Transfer-Encoding", "binary");
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Last-Modified", new Date().toUTCString());
    res.setHeader("ETag", `"${passData.uniqueCode}-${Date.now()}"`);

    // iOS Safari specific headers
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Download-Options", "noopen");

    // Check if request is from iOS Safari
    const userAgent = req.headers["user-agent"] || "";
    const isIOSSafari = /iPad|iPhone|iPod/.test(userAgent) && /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);

    if (isIOSSafari || isIOS) {
      console.log("📱 iOS device detected - adjusting headers for Wallet app");
      // For iOS, use inline to trigger Wallet app directly
      res.setHeader("Content-Disposition", `inline; filename="${passData.uniqueCode}.pkpass"`);
      // Ensure proper MIME type for iOS
      res.setHeader("Content-Type", "application/vnd.apple.pkpass");
    }

    console.log("✅ Sending signed .pkpass file response");
    res.send(buffer);
    console.log("========================================");
  } catch (error) {
    console.error("❌ ERROR generating Apple Wallet pass:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.log("========================================");

    // Provide helpful error messages
    let errorMessage = "Failed to generate Apple Wallet pass.";
    let errorDetails = error.message;
    let certificateTypeIssue = false;

    // Check for ECDSA certificate error
    if (error.message.includes("OID is not RSA") || error.message.includes("Cannot read public key")) {
      errorMessage =
        "Certificate type error: Your certificate is ECDSA, but passkit-generator only supports RSA certificates.";
      errorDetails = `The certificate you're using is ECDSA (Elliptic Curve), but the passkit-generator library only supports RSA certificates. Apple now issues ECDSA certificates by default for Pass Type ID certificates.

SOLUTIONS:
1. Request an RSA certificate from Apple Developer Portal (if available)
2. Use a library that supports ECDSA certificates
3. Check if you can export your certificate as RSA from Keychain Access

For more help, see: https://github.com/alexandercerutti/passkit-generator/issues`;
      certificateTypeIssue = true;
    } else if (error.message.includes("certificate") || error.message.includes("cert")) {
      errorMessage = "Certificate error. Please verify your Apple Wallet certificates are valid.";
    } else if (error.message.includes("model") || error.message.includes("template")) {
      errorMessage = "Pass template error. Please verify the pass model files exist.";
    }

    res.status(500).json({
      error: errorMessage,
      details: errorDetails,
      ...(certificateTypeIssue && {
        certificateType: "ECDSA",
        solution:
          "You need to either obtain an RSA certificate from Apple Developer Portal or use a library that supports ECDSA certificates.",
        helpfulLinks: [
          "https://github.com/alexandercerutti/passkit-generator",
          "https://developer.apple.com/documentation/walletpasses",
        ],
      }),
    });
  }
}

module.exports = downloadApplePass;
