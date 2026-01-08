const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const certPath = path.join(__dirname, "../certs/apple/certificate.pem");

console.log("🔍 Verifying Apple Wallet Certificate...\n");

if (!fs.existsSync(certPath)) {
  console.error("❌ Certificate file not found:", certPath);
  process.exit(1);
}

try {
  const certPem = fs.readFileSync(certPath, "utf8");
  
  // Check if it's PEM format
  if (!certPem.includes("BEGIN CERTIFICATE")) {
    console.error("❌ Certificate is not in PEM format!");
    console.error("Please convert it using: openssl x509 -inform DER -in certificate.cer -out certificate.pem");
    process.exit(1);
  }

  // Parse certificate
  const cert = new crypto.X509Certificate(certPem);
  
  console.log("✅ Certificate is valid PEM format\n");
  console.log("📋 Certificate Details:");
  console.log("─────────────────────────────────────────");
  console.log("Subject:", cert.subject);
  console.log("Issuer:", cert.issuer);
  console.log("Valid From:", cert.validFrom);
  console.log("Valid To:", cert.validTo);
  console.log("─────────────────────────────────────────\n");

  // Extract Pass Type ID from subject
  const subject = cert.subject;
  const passTypeIdMatch = subject.match(/CN=([^,]+)/);
  
  if (passTypeIdMatch) {
    const passTypeId = passTypeIdMatch[1];
    console.log("🎫 Pass Type ID from certificate:", passTypeId);
    
    // Check against expected
    const expectedPassTypeId = process.env.APPLE_PASS_TYPE_IDENTIFIER || "pass.com.giftygen.giftcard";
    console.log("📝 Expected Pass Type ID:", expectedPassTypeId);
    
    if (passTypeId === expectedPassTypeId) {
      console.log("✅ Pass Type ID matches!\n");
    } else {
      console.log("⚠️  WARNING: Pass Type ID does NOT match!\n");
      console.log("   Your certificate is for:", passTypeId);
      console.log("   Your code expects:", expectedPassTypeId);
      console.log("\n   You need to either:");
      console.log("   1. Create a new certificate for:", expectedPassTypeId);
      console.log("   2. Update your code to use:", passTypeId);
    }
  } else {
    console.log("⚠️  Could not extract Pass Type ID from certificate");
  }

  // Check expiration
  const validTo = new Date(cert.validTo);
  const now = new Date();
  if (validTo < now) {
    console.log("\n❌ Certificate has EXPIRED!");
    console.log("   Expired on:", validTo.toLocaleDateString());
    console.log("   You need to create a new certificate.");
  } else {
    const daysUntilExpiry = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));
    console.log("\n✅ Certificate is valid");
    console.log("   Expires in:", daysUntilExpiry, "days");
  }

} catch (error) {
  console.error("❌ Error reading certificate:", error.message);
  process.exit(1);
}









