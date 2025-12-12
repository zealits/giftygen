# Apple Pass Type ID Setup Guide

## ⚠️ Important: You Need BOTH

For Apple Wallet passes to work, you need **TWO things**:

1. ✅ **Pass Type ID (Identifier)** - Registered in Apple Developer Portal
2. ✅ **Pass Type ID Certificate** - Created FOR that identifier

## Current Configuration

Your code is using:

- **Pass Type Identifier**: `pass.com.giftygen.giftcard`
- **Team Identifier**: `65467889` (from your .env file)

## Step-by-Step Setup

### Step 1: Create Pass Type ID (Identifier)

**If you haven't created this yet, do it now:**

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click on **"Identifiers"** in the left sidebar
4. Click the **"+"** button (top left)
5. Select **"Pass Type IDs"**
6. Click **"Continue"**
7. Fill in:
   - **Description**: `GiftyGen Gift Card` (or any description)
   - **Identifier**: `pass.com.giftygen.giftcard` (must match exactly!)
8. Click **"Continue"**
9. Review and click **"Register"**

**✅ Important:** The identifier must be exactly: `pass.com.giftygen.giftcard`

### Step 2: Verify Your Certificate

**Your certificate MUST be created FOR this Pass Type ID:**

1. Go to **"Certificates"** in Apple Developer Portal
2. Find your Pass Type ID certificate
3. Check that it's associated with: `pass.com.giftygen.giftcard`
4. If it's for a different identifier, you need to:
   - Create a new certificate for the correct Pass Type ID, OR
   - Update your code to use the identifier your certificate is for

### Step 3: Verify Everything Matches

**Check these three places match:**

1. **Apple Developer Portal:**

   - Pass Type ID: `pass.com.giftygen.giftcard`
   - Certificate is for: `pass.com.giftygen.giftcard`

2. **Your .env file:**

   ```env
   APPLE_PASS_TYPE_IDENTIFIER=pass.com.giftygen.giftcard
   APPLE_TEAM_IDENTIFIER=65467889
   ```

3. **Your pass.json file:**
   ```json
   "passTypeIdentifier": "pass.com.giftygen.giftcard"
   ```

**All three must match exactly!**

## Common Issues

### Issue 1: Certificate is for Different Identifier

**Symptom:** Pass generates but iPhone rejects it

**Solution:**

- Check what identifier your certificate is for in Apple Developer Portal
- Either:
  - Create a new certificate for `pass.com.giftygen.giftcard`, OR
  - Change your code to use the identifier your certificate is for

### Issue 2: Pass Type ID Not Created

**Symptom:** Can't create certificate or certificate doesn't work

**Solution:**

- Create the Pass Type ID first (Step 1 above)
- Then create the certificate for that identifier

### Issue 3: Identifier Mismatch

**Symptom:** Pass doesn't work even with valid certificate

**Solution:**

- Ensure identifier in code matches identifier in certificate
- Check all three places (Portal, .env, pass.json) match

## How to Check Your Certificate's Identifier

1. Open your certificate file: `certs/apple/certificate.pem`
2. Look for the "Subject" field
3. It should contain your Pass Type ID identifier

Or use OpenSSL:

```bash
openssl x509 -in certs/apple/certificate.pem -text -noout | findstr "Subject"
```

## Quick Checklist

- [ ] Pass Type ID `pass.com.giftygen.giftcard` is registered in Apple Developer Portal
- [ ] Certificate is created FOR `pass.com.giftygen.giftcard`
- [ ] `.env` file has `APPLE_PASS_TYPE_IDENTIFIER=pass.com.giftygen.giftcard`
- [ ] `pass.json` has `"passTypeIdentifier": "pass.com.giftygen.giftcard"`
- [ ] Team Identifier matches (check in Apple Developer Portal)
- [ ] Certificate files are in `certs/apple/` directory
- [ ] Certificate is in PEM format (not DER)

## Next Steps

1. **Verify Pass Type ID exists** in Apple Developer Portal
2. **Check certificate is for correct identifier**
3. **If certificate is for different identifier:**
   - Option A: Create new certificate for `pass.com.giftygen.giftcard`
   - Option B: Update code to use the identifier your certificate is for
4. **Restart server** after any changes
5. **Test pass download**

## Need to Change the Identifier?

If you need to use a different identifier:

1. Update `.env`:

   ```env
   APPLE_PASS_TYPE_IDENTIFIER=your.new.identifier
   ```

2. Update `pass.json`:

   ```json
   "passTypeIdentifier": "your.new.identifier"
   ```

3. Make sure you have a certificate for that identifier

4. Restart server



