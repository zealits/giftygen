const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const passModelDir = path.join(__dirname, "../uploads/pass-models/giftcard.pass");
const iconPath = path.join(passModelDir, "icon.png");
const icon2xPath = path.join(passModelDir, "icon@2x.png");

async function resizeIcons() {
  try {
    console.log("🖼️  Resizing Apple Wallet icons...");
    
    // Check if files exist
    if (!fs.existsSync(iconPath)) {
      throw new Error(`icon.png not found at: ${iconPath}`);
    }
    if (!fs.existsSync(icon2xPath)) {
      throw new Error(`icon@2x.png not found at: ${icon2xPath}`);
    }

    // Get original file sizes
    const originalIconSize = fs.statSync(iconPath).size;
    const originalIcon2xSize = fs.statSync(icon2xPath).size;
    
    console.log(`📊 Original icon.png: ${(originalIconSize / 1024).toFixed(2)} KB`);
    console.log(`📊 Original icon@2x.png: ${(originalIcon2xSize / 1024).toFixed(2)} KB`);

    // Resize icon.png to 29x29
    await sharp(iconPath)
      .resize(29, 29, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(iconPath + ".tmp");

    // Resize icon@2x.png to 58x58
    await sharp(icon2xPath)
      .resize(58, 58, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png({ quality: 90, compressionLevel: 9 })
      .toFile(icon2xPath + ".tmp");

    // Replace original files
    fs.renameSync(iconPath + ".tmp", iconPath);
    fs.renameSync(icon2xPath + ".tmp", icon2xPath);

    // Get new file sizes
    const newIconSize = fs.statSync(iconPath).size;
    const newIcon2xSize = fs.statSync(icon2xPath).size;

    console.log(`✅ Resized icon.png to 29x29: ${(newIconSize / 1024).toFixed(2)} KB (was ${(originalIconSize / 1024).toFixed(2)} KB)`);
    console.log(`✅ Resized icon@2x.png to 58x58: ${(newIcon2xSize / 1024).toFixed(2)} KB (was ${(originalIcon2xSize / 1024).toFixed(2)} KB)`);
    console.log(`📉 Total size reduction: ${((originalIconSize + originalIcon2xSize - newIconSize - newIcon2xSize) / 1024).toFixed(2)} KB`);
    console.log("✅ Icons resized successfully!");
    
  } catch (error) {
    console.error("❌ Error resizing icons:", error.message);
    process.exit(1);
  }
}

resizeIcons();





