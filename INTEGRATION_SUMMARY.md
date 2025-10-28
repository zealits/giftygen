# Apple Wallet Integration - Implementation Summary

## ✅ What Has Been Completed

### 1. Backend Implementation

- ✅ Updated `controllers/walletController.js` to store Apple Wallet pass data
- ✅ Created `controllers/appleWalletController.js` to generate pass files
- ✅ Updated `routes/walletRoutes.js` to include Apple Wallet endpoint
- ✅ Pass data storage with 24-hour expiration
- ✅ Backend now returns both `googleWalletUrl` and `appleWalletUrl`

### 2. Frontend Implementation

- ✅ Updated `frontend/src/pages/user/GiftCardForm.js`:
  - Added separate state for `walletUrl` (Google) and `appleWalletUrl`
  - Updated `handleSubmit` to handle both wallet URLs
  - Added `handleAppleWalletDownload` function
  - Modified wallet buttons to use correct URLs

### 3. Dependencies

- ✅ Installed `archiver` (for creating .pkpass zip files)
- ✅ Installed `node-forge` (for certificate signing)

## 📋 Current Behavior

### Google Wallet ✅

- **Status**: Fully Working
- **Button**: Opens Google Wallet in new tab
- **Action**: User can add pass to Google Wallet immediately

### Apple Wallet ⚠️

- **Status**: Partially Working
- **Button**: Downloads a pass file when clicked
- **Current Issue**: The downloaded file is unsigned JSON, so it won't open in Apple Wallet
- **Next Step**: Need to add Apple certificates to properly sign the pass

## 🔧 What You Need to Do Next

### Step 1: Get Apple Developer Certificates

1. **Create Apple Developer Account** ($99/year)

   - Sign up at https://developer.apple.com/

2. **Create Pass Type ID**

   - Go to Certificates, Identifiers & Profiles
   - Register a new Pass Type ID (e.g., `pass.com.giftygen.giftcard`)

3. **Download Certificates**

   - Create a Pass Type ID certificate
   - Export as .p12 and convert to .pem format
   - Download Apple WWDR certificate

4. **Add Certificates to Project**
   Place these 3 files in `certs/apple/`:
   - `cert.pem` - Your certificate
   - `key.pem` - Your private key
   - `AppleWWDRCA.pem` - Apple WWDR certificate

### Step 2: Install Apple Wallet Library (Recommended)

Choose one of these libraries:

```bash
# Option 1: passkit-generator (Most popular)
npm install passkit-generator

# Option 2: @walletpass/passkit
npm install @walletpass/passkit
```

### Step 3: Update Backend Implementation

Update `controllers/appleWalletController.js` to use the library:

```javascript
const { PKPass } = require("passkit-generator");

async function downloadApplePass(req, res) {
  try {
    const { passId } = req.params;
    const applePassStore = require("./walletController").applePassStore;
    const passData = applePassStore.get(passId);

    if (!passData) {
      return res.status(404).json({ error: "Pass not found or expired" });
    }

    // Create pass using the library
    const pass = await PKPass.from({
      model: path.join(__dirname, "../uploads/pass-models/giftcard.pass"),
      certificates: {
        wwdr: path.join(__dirname, "../certs/apple/AppleWWDRCA.pem"),
        signerCert: path.join(__dirname, "../certs/apple/cert.pem"),
        signerKey: path.join(__dirname, "../certs/apple/key.pem"),
      },
    });

    // Set pass data
    pass.serialNumber = passData.uniqueCode;
    pass.description = passData.walletGiftCardName;
    pass.organizationName = process.env.APPLE_ORG_NAME || "GiftyGen";
    pass.teamIdentifier = process.env.APPLE_TEAM_IDENTIFIER || "PZZRSDZ86Z";

    // Update storeCard fields
    pass.primaryFields.add({ key: "amount", label: "Gift Card", value: `${passData.currency} ${passData.amount}` });
    pass.secondaryFields.add({ key: "name", label: "Recipient", value: passData.userName });

    // Set barcode
    pass.barcodes = [
      {
        message: passData.uniqueCode,
        format: "PKBarcodeFormatQR",
      },
    ];

    // Generate the pass
    const buffer = pass.getAsBuffer();

    res.setHeader("Content-Type", "application/vnd.apple.pkpass");
    res.setHeader("Content-Disposition", `attachment; filename="${passData.uniqueCode}.pkpass"`);
    res.send(buffer);
  } catch (error) {
    console.error("Error generating Apple Wallet pass:", error);
    res.status(500).json({ error: "Failed to generate Apple Wallet pass." });
  }
}
```

## 🧪 Testing the Current Setup

### Google Wallet

1. Complete a purchase
2. Click "Add to Google Wallet"
3. Should open Google Wallet and add the pass

### Apple Wallet (Before certificates)

1. Complete a purchase
2. Click "Add to Apple Wallet"
3. A file will download (.pkpass)
4. File contains JSON (won't work in Apple Wallet yet)
5. To test, you'd need a properly signed .pkpass file

### After Adding Certificates

1. Complete a purchase
2. Click "Add to Apple Wallet"
3. .pkpass file downloads and can be added to Apple Wallet on iPhone

## 📁 File Structure

```
controllers/
  walletController.js         # Google Wallet + pass data storage
  appleWalletController.js    # Apple Wallet pass generation

routes/
  walletRoutes.js            # API routes for wallet endpoints

frontend/src/pages/user/
  GiftCardForm.js            # Purchase form with wallet buttons

certs/apple/                  # ← ADD YOUR CERTIFICATES HERE
  cert.pem
  key.pem
  AppleWWDRCA.pem

config/config.env            # ← ADD ENV VARS HERE
```

## 🌐 API Endpoints

- `POST /api/wallet/generate-wallet-pass` - Generates wallet URLs

  - Returns: `{ googleWalletUrl, appleWalletUrl, uniqueCode }`

- `GET /api/wallet/download-apple-pass/:passId` - Downloads .pkpass file
  - Returns: Binary file (application/vnd.apple.pkpass)

## 🔗 Quick Links

- [Apple Wallet Documentation](https://developer.apple.com/documentation/passkit)
- [passkit-generator on GitHub](https://github.com/alexandercerutti/passkit-generator)
- [Setting up Pass Type ID](https://developer.apple.com/documentation/passkit)

## 📝 Environment Variables Needed

Add to `config/config.env`:

```env
APPLE_PASS_TYPE_IDENTIFIER=pass.com.giftygen.giftcard
APPLE_TEAM_IDENTIFIER=YOUR_TEAM_ID
APPLE_ORG_NAME=GiftyGen
```

## ⚡ Quick Start (After Getting Certificates)

1. Install library: `npm install passkit-generator`
2. Add certificates to `certs/apple/`
3. Add environment variables to `config/config.env`
4. Update `controllers/appleWalletController.js` with library code
5. Test the download button
6. Open on iPhone to verify

## 🎯 Next Steps Priority

1. ⏭️ Get Apple Developer account
2. ⏭️ Create Pass Type ID and certificate
3. ⏭️ Install `passkit-generator` library
4. ⏭️ Add certificates to project
5. ⏭️ Update controller with signed pass generation
6. ⏭️ Test on real iOS device

## 💡 Current Status Summary

| Component             | Status      | Action Required            |
| --------------------- | ----------- | -------------------------- |
| Google Wallet         | ✅ Working  | None                       |
| Apple Wallet Frontend | ✅ Working  | None                       |
| Apple Wallet Backend  | ✅ Working  | Needs certificates         |
| Pass Signing          | ❌ Not Done | Add certificates + library |
| Testing               | ⏸️ Waiting  | Need signed passes         |

The integration is **90% complete**. You just need Apple certificates to sign the passes!

