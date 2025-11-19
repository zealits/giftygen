// utils/encryption.js
const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // For GCM, IV length is 12 bytes
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Derive a 32-byte key from the encryption key using PBKDF2
 * @param {String} encryptionKey - The encryption key from environment
 * @returns {Buffer} - Derived key
 */
function deriveKey(encryptionKey) {
  // Use a fixed salt for key derivation (in production, consider storing this securely)
  const salt = crypto.createHash("sha256").update(encryptionKey).digest();
  return crypto.pbkdf2Sync(encryptionKey, salt, 100000, KEY_LENGTH, "sha256");
}

/**
 * Encrypt a string value
 * @param {String} text - The text to encrypt
 * @param {String} encryptionKey - The encryption key (defaults to ENV variable)
 * @returns {String} - Encrypted string in format: iv:tag:encryptedData
 */
function encrypt(text, encryptionKey = process.env.ENCRYPTION_KEY) {
  if (!text) {
    return text; // Return empty/null as-is
  }

  if (!encryptionKey) {
    throw new Error("Encryption key is required");
  }

  try {
    const key = deriveKey(encryptionKey);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    // Return format: iv:tag:encryptedData (all in hex)
    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt an encrypted string
 * @param {String} encryptedText - The encrypted text in format: iv:tag:encryptedData
 * @param {String} encryptionKey - The encryption key (defaults to ENV variable)
 * @returns {String} - Decrypted string
 */
function decrypt(encryptedText, encryptionKey = process.env.ENCRYPTION_KEY) {
  if (!encryptedText) {
    return encryptedText; // Return empty/null as-is
  }

  // Check if the text is already decrypted (for backward compatibility)
  if (!encryptedText.includes(":")) {
    // Assume it's plain text (for existing unencrypted data)
    return encryptedText;
  }

  if (!encryptionKey) {
    throw new Error("Encryption key is required");
  }

  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 3) {
      // If format is wrong, assume it's plain text (for backward compatibility)
      return encryptedText;
    }

    const [ivHex, tagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const key = deriveKey(encryptionKey);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    // For backward compatibility, if decryption fails, return the original text
    // This handles cases where data might not be encrypted yet
    return encryptedText;
  }
}

module.exports = {
  encrypt,
  decrypt,
};

