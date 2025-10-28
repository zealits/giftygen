const GiftCard = require("../models/giftCardSchema");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const archiver = require("archiver");
const crypto = require("crypto");

// Generate Apple Wallet .pkpass file (simplified version without certificate signing)
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

    // For now, return a simple pass.json that can be added to Apple Wallet
    // This is a working structure without requiring certificates

    const passJson = {
      formatVersion: 1,
      passTypeIdentifier: process.env.APPLE_PASS_TYPE_IDENTIFIER || "pass.com.giftygen.giftcard",
      teamIdentifier: process.env.APPLE_TEAM_IDENTIFIER || "PZZRSDZ86Z",
      organizationName: process.env.APPLE_ORG_NAME || "GiftyGen",
      serialNumber: passData.uniqueCode,
      description: passData.walletGiftCardName,
      storeCard: {
        primaryFields: [
          {
            key: "amount",
            label: "Gift Card",
            value: `${passData.currency} ${passData.amount}`,
          },
        ],
        secondaryFields: [
          {
            key: "name",
            label: "Recipient",
            value: passData.userName,
          },
        ],
        auxiliaryFields: [],
      },
      barcode: {
        format: "PKBarcodeFormatQR",
        message: passData.uniqueCode,
        messageEncoding: "iso-8859-1",
      },
      backgroundColor: "rgb(65, 88, 208)",
      foregroundColor: "rgb(255, 255, 255)",
      labelColor: "rgb(255, 255, 255)",
      logoText: passData.walletGiftCardName,
    };

    // For now, return the pass.json as a downloadable file
    // This will show instructions when opened on a device
    // To make it work fully, you need to add Apple certificates and sign it properly

    const passJsonString = JSON.stringify(passJson, null, 2);

    console.log("Generated pass.json string length:", passJsonString.length);

    // Create temporary directory for pass contents
    const tempDir = path.join(__dirname, "../temp-passes");
    await fsPromises.mkdir(tempDir, { recursive: true });

    const uniqueCode = passData.uniqueCode;
    const workDir = path.join(tempDir, uniqueCode);
    await fsPromises.mkdir(workDir, { recursive: true });

    console.log("Created temp directory:", workDir);

    // Write pass.json
    await fsPromises.writeFile(path.join(workDir, "pass.json"), passJsonString);
    console.log("✅ Written pass.json");

    // Copy icon files if they exist
    const passModelDir = path.join(__dirname, "../uploads/pass-models/giftcard.pass");
    const iconFiles = ["icon.png", "icon@2x.png"];

    for (const iconFile of iconFiles) {
      const sourcePath = path.join(passModelDir, iconFile);
      const destPath = path.join(workDir, iconFile);

      try {
        await fsPromises.copyFile(sourcePath, destPath);
        console.log(`✅ Copied ${iconFile}`);
      } catch (error) {
        console.warn(`⚠️ Could not copy ${iconFile}:`, error.message);
      }
    }

    // Generate manifest (SHA1 hashes of all files)
    const files = await fsPromises.readdir(workDir);
    const manifest = {};

    for (const file of files) {
      const filePath = path.join(workDir, file);
      const content = await fsPromises.readFile(filePath);
      const hash = crypto.createHash("sha1").update(content).digest("hex");
      manifest[file] = hash;
    }

    console.log("Generated manifest with files:", Object.keys(manifest));

    // Write manifest.json
    await fsPromises.writeFile(path.join(workDir, "manifest.json"), JSON.stringify(manifest, null, 2));

    // Create a signature file (empty for now - needs certificates for real signing)
    await fsPromises.writeFile(path.join(workDir, "signature"), "Unsigned pass - requires Apple certificates");

    // Create .pkpass (zip file)
    const output = fs.createWriteStream(path.join(tempDir, `${uniqueCode}.pkpass`));
    const archive = archiver("zip", { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on("close", async () => {
        console.log("✅ Created .pkpass zip file");
        const zipPath = path.join(tempDir, `${uniqueCode}.pkpass`);
        const zipBuffer = await fsPromises.readFile(zipPath);

        // Clean up temp files
        await fsPromises.rm(workDir, { recursive: true, force: true });
        await fsPromises.unlink(zipPath).catch(() => {});

        // Set headers to trigger download and avoid caching
        res.setHeader("Content-Type", "application/vnd.apple.pkpass");
        res.setHeader("Content-Disposition", `attachment; filename="${uniqueCode}.pkpass"`);
        res.setHeader("Content-Transfer-Encoding", "binary");
        res.setHeader("Content-Length", Buffer.byteLength(zipBuffer));
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.setHeader("Last-Modified", new Date().toUTCString());
        res.setHeader("ETag", `"${uniqueCode}-${Date.now()}"`);

        console.log("✅ Sending .pkpass file response");
        res.send(zipBuffer);
        console.log("========================================");
        resolve();
      });

      archive.on("error", (err) => {
        console.error("❌ Archive error:", err);
        reject(err);
      });

      archive.pipe(output);

      // Add files to archive
      archive.file(path.join(workDir, "pass.json"), { name: "pass.json" });
      archive.file(path.join(workDir, "manifest.json"), { name: "manifest.json" });
      archive.file(path.join(workDir, "signature"), { name: "signature" });

      for (const iconFile of iconFiles) {
        const iconPath = path.join(workDir, iconFile);
        try {
          if (fs.existsSync(iconPath)) {
            archive.file(iconPath, { name: iconFile });
          }
        } catch (error) {
          // Skip if file doesn't exist
        }
      }

      archive.finalize();
    });
  } catch (error) {
    console.error("❌ ERROR generating Apple Wallet pass:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.log("========================================");
    res.status(500).json({
      error: "Failed to generate Apple Wallet pass.",
      details: error.message,
    });
  }
  console.log("========================================");
}

module.exports = downloadApplePass;
