// Gmail setup helper script
require("dotenv").config({ path: "./config/config.env" });

console.log("=== Gmail Setup for GiftyGen ===\n");

console.log("📧 Current Configuration:");
console.log("Service:", process.env.SMPT_SERVICE);
console.log("Email:", process.env.SMPT_MAIL);
console.log("Password:", process.env.SMPT_PASSWORD ? "***" + process.env.SMPT_PASSWORD.slice(-3) : "undefined");
console.log("Host:", process.env.SMPT_HOST);
console.log("Port:", process.env.SMPT_PORT);

console.log("\n🚀 Quick Setup Steps:\n");

console.log("1. Create Gmail Account:");
console.log("   - Go to https://gmail.com");
console.log("   - Create account: giftygen.app@gmail.com (or any name you prefer)");
console.log("   - Complete the setup");

console.log("\n2. Enable 2-Factor Authentication:");
console.log("   - Go to https://myaccount.google.com/security");
console.log("   - Enable 2-Step Verification");
console.log("   - This is required for app passwords");

console.log("\n3. Generate App Password:");
console.log("   - Go to https://myaccount.google.com/apppasswords");
console.log("   - Select 'Mail' and 'Other (custom name)'");
console.log("   - Enter 'GiftyGen App'");
console.log("   - Copy the 16-character password");

console.log("\n4. Update config.env:");
console.log("   - Replace 'your-gmail-app-password-here' with your app password");
console.log("   - The email will be sent FROM: contact@giftygen.com");
console.log("   - But authenticated WITH: your Gmail account");

console.log("\n5. Test the Configuration:");
console.log("   - Run: node test-email.js");
console.log("   - This will test if Gmail SMTP works");

console.log("\n📝 Important Notes:");
console.log("   - Emails will appear to come FROM: contact@giftygen.com");
console.log("   - But they're sent THROUGH: Gmail's SMTP servers");
console.log("   - This is a common and accepted practice");
console.log("   - Recipients will see 'contact@giftygen.com' as the sender");

console.log("\n🔧 If you want to use a different Gmail address:");
console.log("   - Update SMPT_MAIL in config.env");
console.log("   - Make sure to use the app password for that account");

console.log("\n✅ Ready to test? Run: node test-email.js");

