// Test script to verify email functionality
require("dotenv").config({ path: "./config/config.env" });

const { sendEmail, sendRegistrationConfirmationEmail } = require("./utils/sendEmail");

async function testEmails() {
  console.log("Testing email functionality...");

  try {
    // Test 1: Basic email
    console.log("Test 1: Sending basic email...");
    await sendEmail({
      email: "test@example.com",
      subject: "Test Email from GiftyGen",
      html: "<h1>This is a test email</h1><p>If you receive this, the email system is working!</p>",
    });
    console.log("✅ Basic email sent successfully");

    // Test 2: Registration confirmation email
    console.log("Test 2: Sending registration confirmation email...");
    await sendRegistrationConfirmationEmail("test@example.com", "Test Restaurant", "John Doe");
    console.log("✅ Registration confirmation email sent successfully");

    console.log("\n🎉 All email tests passed!");
  } catch (error) {
    console.error("❌ Email test failed:", error.message);
    console.error("Make sure your SMTP settings are correct in config/config.env");
  }
}

// Run the test
testEmails();
