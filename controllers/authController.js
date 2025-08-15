const User = require("../models/userModel");
const { generateSecret, generateQRCode, verifyToken } = require("../config/totpConfig");
const bcrypt = require("bcryptjs");

exports.enable2FA = async (req, res) => {
  try {
    // Retrieve the user from req.user
    const user = await User.findById(req.user._id); // or req.user.id
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a new 2FA secret
    const secret = generateSecret();
    user.twoFASecret = secret.base32; // Save the secret, but don't enable 2FA yet
    await user.save();

    // Generate the QR code URL for the 2FA secret
    const qrCodeUrl = await generateQRCode(secret);

    res.json({ qrCodeUrl, secret: secret.base32 });
  } catch (error) {
    // console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify 2FA token
exports.verify2FA = async (req, res) => {
  const { token } = req.body;

  const user = await User.findById(req.user._id); // Adjust based on your authentication middleware

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Verify the 2FA token using the stored secret
  if (verifyToken(user.twoFASecret, token)) {
    if (!user.is2FAEnabled) {
      user.is2FAEnabled = true; // Enable 2FA for the first successful verification
      await user.save();
    }

    res.json({ message: "2FA verified successfully" });
  } else {
    res.status(400).json({ message: "Invalid 2FA token" });
  }
};

// Update 2FA Status
exports.update2FAStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { enable2FA } = req.body; // { enable2FA: true } or { enable2FA: false }

    user.is2FAEnabled = enable2FA;

    if (!enable2FA) {
      user.twoFASecret = null; // Optionally clear the 2FA secret if disabling
    }

    await user.save();

    res.json({ message: "2FA status updated successfully", is2FAEnabled: user.is2FAEnabled });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
