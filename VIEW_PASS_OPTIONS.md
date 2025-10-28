# Viewing Apple Wallet Pass Without iPhone

## Current Status

✅ Your .pkpass file is downloading correctly
⚠️ It's unsigned (won't work in Apple Wallet without certificates)
📄 It's just JSON data, not a signed pass

## Options to See the Pass

### 1. PassJSON Viewer (Web Tool)

Go to: https://wpass.pkpass.net/

Steps:

1. Download your `.pkpass` file
2. Extract the `pass.json` file (unzip it)
3. Upload the `pass.json` to the viewer
4. See a preview of how it will look

### 2. iOS Simulator (Mac Only)

If you have a Mac:

```bash
# Install Xcode from App Store (free)
# Then use iOS Simulator
open -a Simulator
```

Then:

1. Open Safari in simulator
2. Navigate to your pass URL
3. Download the pass
4. Add to Wallet in simulator

### 3. Send to iPhone/iPad

Even though the pass won't open in Apple Wallet (unsigned), you can:

1. Email the file to yourself
2. Open on iPhone
3. It will show an error about being unsigned

### 4. Install Certificates (For Real Passes)

To make the pass work in Apple Wallet:

1. **Get Apple Developer Account** ($99/year)
2. **Create Pass Type ID**
3. **Add certificates** to `certs/apple/`:
   - `cert.pem`
   - `key.pem`
   - `AppleWWDRCA.pem`
4. **Install `passkit-generator`**:
   ```bash
   npm install passkit-generator
   ```
5. **Update controller** to use the library (see `INTEGRATION_SUMMARY.md`)

## Next Steps

### To See the Pass Data Now:

1. Download the `.pkpass` file
2. Extract it (rename to `.zip`)
3. Open `pass.json` to see the structure
4. OR upload to https://wpass.pkpass.net/

### To Make it Work:

Follow steps in `INTEGRATION_SUMMARY.md` to add certificates

## File Structure of .pkpass

```
giftcard.pkpass (zip file)
├── pass.json       (pass data)
├── manifest.json   (file hashes)
├── signature       (cryptographic signature)
├── icon.png        (icons)
└── icon@2x.png     (2x icons)
```

## Testing Checklist

- ✅ Download works
- ✅ File is valid ZIP
- ✅ Contains pass.json
- ✅ Contains manifest.json
- ⏸️ Waiting for certificates for signing
- ⏸️ Waiting for iPhone to test



