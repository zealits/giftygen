const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Create transporter for IONOS SMTP
  const transporter = nodemailer.createTransport({
    host: "smtp.ionos.com",
    port: 587,
    secure: false, // true for 465, false for other ports like 587
    auth: {
      user: "contact@giftygen.com",
      pass: "@u9aG!pX7Fb#",
    },
  });

  // Create email content with embedded image using cid
  const mailOptions = {
    from: `"GiftyGen" <contact@giftygen.com>`, // Use your domain email as sender
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
    attachments: options.attachments, // For QR code attachment
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
