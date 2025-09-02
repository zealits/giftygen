// Test script to verify email functionality
require("dotenv").config({ path: "./config/config.env" });

const { sendEmail, sendRegistrationConfirmationEmail } = require("./utils/sendEmail");

async function testEmails() {
  console.log("Testing email functionality...");

  try {
    // Test 1: Basic email (using your own email for testing)
    console.log("Test 1: Sending basic email...");
    await sendEmail({
      email: "contact@giftygen.com", // Using your own email for testing
      subject: "Test Email from GiftyGen",
      html: "<h1>This is a test email</h1><p>If you receive this, the email system is working!</p>",
    });
    console.log("✅ Basic email sent successfully");

    // Test 2: Registration confirmation email
    console.log("Test 2: Sending registration confirmation email...");
    await sendRegistrationConfirmationEmail("contact@giftygen.com", "Test Restaurant", "John Doe");
    console.log("✅ Registration confirmation email sent successfully");

    console.log("\n🎉 All email tests passed!");
  } catch (error) {
    console.error("❌ Email test failed:", error.message);
    console.error("Make sure your IONOS SMTP settings are correct in config/config.env");
    console.error("Check that your IONOS email credentials are valid and SMTP is enabled");
  }
}

// Run the test
testEmails();
