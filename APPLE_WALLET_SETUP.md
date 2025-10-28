# Apple Wallet Integration Setup Guide

## Current Status

✅ **Completed:**

- Frontend buttons for both Google Wallet and Apple Wallet
- Backend endpoint to generate wallet passes
- Separate URL handling for each wallet type
- Pass data storage and retrieval

⚠️ **Remaining:**

- Apple Wallet pass signing with certificates
- Full .pkpass file generation

## What You Need to Complete

### 1. Apple Developer Account Setup

1. **Create an Apple Developer Account** (if you don't have one)

   - Sign up at https://developer.apple.com/
   - Cost: $99/year

2. **Create a Pass Type ID**

   - Go to Certificates, Identifiers & Profiles
   - Click on "Identifiers"
   - Click the "+" button
   - Select "Pass Type IDs"
   - Enter a description and identifier (e.g., `pass.com.giftygen.giftcard`)
   - Click "Continue" and "Register"

3. **Create a Pass Type ID Certificate**
   - Go to "Certificates"
   - Click the "+" button
   - Select "Pass Type ID Certificate"
   - Choose your Pass Type ID
   - Upload a Certificate Signing Request (CSR)

### 2. Export Certificates

Once you have the certificate:

1. **Download the certificate** from Apple Developer Portal
2. **Export as .p12 file** (with a password)
3. **Convert to .pem format**:

```bash
# Convert .p12 to .pem (you'll need to enter the password)
openssl pkcs12 -in certificate.p12 -out cert.pem -clcerts -nokeys -passin pass:YOUR_PASSWORD
openssl pkcs12 -in certificate.p12 -out key.pem -nocerts -nodes -passin pass:YOUR_PASSWORD
```

4. **Download Apple WWDR Certificate**:

```bash
curl -O https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer
openssl x509 -inform DER -in AppleWWDRCAG4.cer -out AppleWWDRCA.pem
```

### 3. Add Certificates to Project

Place the following files in the `certs/apple/` directory:

- `cert.pem` - Your certificate
- `key.pem` - Your private key
- `AppleWWDRCA.pem` - Apple WWDR certificate

### 4. Environment Variables

Add these to your `.env` file:

```env
APPLE_PASS_TYPE_IDENTIFIER=pass.com.giftygen.giftcard
APPLE_TEAM_IDENTIFIER=YOUR_TEAM_ID
APPLE_ORG_NAME=GiftyGen
```

### 5. Alternative: Use a Library

Instead of implementing signing yourself, you can use a library:

#### Option A: Use `node-apple-wallet`

```bash
npm install @walletpass/passkit
```

Then update `controllers/appleWalletController.js` to use the library:

```javascript
const { Pass } = require("@walletpass/passkit");

async function downloadApplePass(req, res) {
  try {
    const { passId } = req.params;
    const applePassStore = require("./walletController").applePassStore;
    const passData = applePassStore.get(passId);

    if (!passData) {
      return res.status(404).json({ error: "Pass not found or expired" });
    }

    const pass = new Pass({
      model: path.join(__dirname, "../uploads/pass-models/giftcard.pass"),
      certificates: {
        wwdr: path.join(__dirname, "../certs/apple/AppleWWDRCA.pem"),
        signerCert: path.join(__dirname, "../certs/apple/cert.pem"),
        signerKey: path.join(__dirname, "../certs/apple/key.pem"),
      },
    });

    // Update pass data
    pass.type = "storeCard";
    pass.serialNumber = passData.uniqueCode;
    pass.description = passData.walletGiftCardName;
    pass.organizationName = process.env.APPLE_ORG_NAME || "GiftyGen";

    const buffer = await pass.render();

    res.setHeader("Content-Type", "application/vnd.apple.pkpass");
    res.setHeader("Content-Disposition", `attachment; filename="${passData.uniqueCode}.pkpass"`);
    res.send(buffer);
  } catch (error) {
    console.error("Error generating Apple Wallet pass:", error);
    res.status(500).json({ error: "Failed to generate Apple Wallet pass." });
  }
}
```

#### Option B: Use `passkit-generator` (more popular)

```bash
npm install passkit-generator
```

## Testing

1. **Test with iOS Simulator:**

   - Install the .pkpass file on iOS
   - Verify the pass appears in Wallet app

2. **Test with a real device:**
   - Email the .pkpass file to yourself
   - Open the email on iPhone
   - Tap to add to Apple Wallet

## Current Implementation

The current implementation in `controllers/appleWalletController.js` returns a JSON response with the pass structure. This is for testing purposes and will show instructions to add certificates.

Once you add the certificates and implement proper signing, the button will work correctly.

## File Structure

```
certs/
  apple/
    cert.pem          # Your Pass Type ID certificate
    key.pem           # Your private key
    AppleWWDRCA.pem   # Apple WWDR certificate

controllers/
  appleWalletController.js  # Handles Apple Wallet pass generation
  walletController.js      # Handles Google Wallet (and stores Apple pass data)

routes/
  walletRoutes.js     # Routes for wallet endpoints

frontend/src/pages/user/
  GiftCardForm.js    # Frontend with both wallet buttons
```

## API Endpoints

- `POST /api/wallet/generate-wallet-pass` - Generates both Google and Apple wallet URLs
- `GET /api/wallet/download-apple-pass/:passId` - Downloads Apple Wallet .pkpass file

## Next Steps

1. Set up Apple Developer account
2. Create Pass Type ID and certificate
3. Add certificates to `certs/apple/`
4. Install signing library (recommended: `passkit-generator`)
5. Update `appleWalletController.js` with proper signing
6. Test with real iOS device

## Resources

- [Apple Wallet Developer Documentation](https://developer.apple.com/documentation/passkit)
- [Pass Type ID Setup](https://developer.apple.com/documentation/passkit)
- [node-passkit-generator](https://github.com/alexandercerutti/passkit-generator)
- [@walletpass/passkit](https://www.npmjs.com/package/@walletpass/passkit)

