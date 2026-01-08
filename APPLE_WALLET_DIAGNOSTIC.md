# Apple Wallet Pass Diagnostic Guide

## Current Issue

Your `.pkpass` file is being generated, but iPhone is showing it as a generic "zip" file instead of opening it in Apple Wallet. This indicates the pass is **not properly signed**.

## What I've Fixed

1. ✅ Removed `README.txt` from pass bundle (it was being included incorrectly)
2. ✅ Added better certificate format validation
3. ✅ Added detailed error logging
4. ✅ Added support for `.cer` to `.pem` conversion (if needed)

## Diagnostic Steps

### Step 1: Check Server Logs

When you download a pass, check your server console logs. You should see:

**✅ Good signs:**

```
✅ Found certificate: certificate.pem
✅ Found WWDR certificate: wwdr.pem
✅ Certificates found, generating signed pass...
📋 Certificate type detected: RSA
✅ Pass created successfully
✅ Generated signed .pkpass file, size: X bytes
```

**❌ Bad signs:**

```
❌ Apple Wallet certificates not found!
❌ ECDSA Certificate Detected
❌ Error creating pass: [error message]
❌ Certificates not loaded properly
```

### Step 2: Verify Certificate Format

Your certificates must be in **PEM format** (text format with `-----BEGIN CERTIFICATE-----` markers).

**Check certificate format:**

1. Open `certs/apple/certificate.pem` in a text editor
2. It should start with: `-----BEGIN CERTIFICATE-----`
3. It should end with: `-----END CERTIFICATE-----`
4. If it looks like binary/gibberish, it's in DER format and needs conversion

**If certificate is in DER format (.cer file):**

Convert using OpenSSL:

```bash
# Convert certificate
openssl x509 -inform DER -in certs/apple/GiftyGen.cer -out certs/apple/certificate.pem

# Convert WWDR certificate
openssl x509 -inform DER -in certs/apple/AppleAAICAG3.cer -out certs/apple/wwdr.pem
```

### Step 3: Verify Certificate Type

The `passkit-generator` library **only supports RSA certificates**. If your certificate is ECDSA, you'll see an error in the logs.

**Check certificate type:**

```bash
# On Windows (with OpenSSL installed)
openssl x509 -in certs/apple/certificate.pem -text -noout | findstr "Public Key Algorithm"

# On Mac/Linux
openssl x509 -in certs/apple/certificate.pem -text -noout | grep "Public Key Algorithm"
```

**If it says "ECDSA":**

- You need to either:
  1. Request an RSA certificate from Apple Developer Portal
  2. Use a different library that supports ECDSA (like `@walletpass/passkit`)

### Step 4: Verify Certificate Files

Make sure these files exist in `certs/apple/`:

- ✅ `certificate.pem` or `cert.pem` (your Pass Type ID certificate)
- ✅ `key.pem` (your private key)
- ✅ `wwdr.pem` or `AppleWWDRCA.pem` (Apple WWDR certificate)

### Step 5: Check Certificate Validity

**Verify certificate is not expired:**

```bash
openssl x509 -in certs/apple/certificate.pem -text -noout | findstr "Not After"
```

**Verify certificate matches your Pass Type ID:**

```bash
openssl x509 -in certs/apple/certificate.pem -text -noout | findstr "Subject"
```

The certificate should be for: `pass.com.giftygen.giftcard`

### Step 6: Test Pass Generation

1. **Restart your server** (to reload certificates)
2. **Download a pass** from your application
3. **Check server logs** for any errors
4. **Try opening the pass on iPhone**

### Step 7: Verify Pass Structure

If the pass downloads but doesn't open, check its structure:

1. **Rename `.pkpass` to `.zip`**
2. **Extract the zip file**
3. **Check contents:**
   - ✅ `pass.json` (should exist)
   - ✅ `manifest.json` (should exist - contains file hashes)
   - ✅ `signature` (should exist - PKCS#7 signature)
   - ✅ `icon.png` (should exist)
   - ✅ `icon@2x.png` (should exist)
   - ❌ `README.txt` (should NOT exist - we removed it)

**If `manifest.json` or `signature` is missing:**

- The pass is not being signed properly
- Check server logs for signing errors

## Common Issues & Solutions

### Issue 1: "Certificate type not supported" (ECDSA)

**Solution:** Your certificate is ECDSA, but `passkit-generator` only supports RSA.

**Options:**

1. Request an RSA certificate from Apple Developer Portal
2. Switch to a library that supports ECDSA:
   ```bash
   npm install @walletpass/passkit
   ```
   Then update the controller to use this library instead.

### Issue 2: "Certificates not loaded properly"

**Possible causes:**

- Certificate files are in wrong format (DER instead of PEM)
- Certificate files are corrupted
- File permissions issue

**Solution:**

- Convert `.cer` files to `.pem` using OpenSSL
- Verify files are readable
- Check file paths are correct

### Issue 3: Pass downloads but shows as "zip" on iPhone

**This means:**

- Pass is not properly signed
- Missing `manifest.json` or `signature` file
- Invalid signature

**Solution:**

- Check server logs for signing errors
- Verify certificates are valid and not expired
- Ensure certificate matches your Pass Type ID

### Issue 4: "Error creating pass"

**Check:**

- Pass model directory exists: `uploads/pass-models/giftcard.pass`
- `pass.json` exists and is valid JSON
- Image files (`icon.png`, `icon@2x.png`) exist
- Certificate files are in correct format

## Next Steps

1. **Check your server logs** when downloading a pass
2. **Verify certificate format** (must be PEM, not DER)
3. **Check certificate type** (must be RSA, not ECDSA)
4. **Restart server** after any certificate changes
5. **Test again** on iPhone

## Still Not Working?

If after checking all of the above it still doesn't work:

1. **Share server logs** from when you download a pass
2. **Check certificate expiration date**
3. **Verify Pass Type ID matches** in certificate and code
4. **Try a different certificate** (if you have one)

## Environment Variables

Make sure these are set in your `.env` file:

```env
APPLE_PASS_TYPE_IDENTIFIER=pass.com.giftygen.giftcard
APPLE_TEAM_IDENTIFIER=65467889
APPLE_ORG_NAME=GiftyGen
```

These should match:

- Your Apple Developer account
- Your Pass Type ID certificate
- Your pass.json file









