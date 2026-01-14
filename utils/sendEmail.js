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

// Function to send professional registration confirmation email
const sendRegistrationConfirmationEmail = async (email, restaurantName, adminName) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmation - GiftyGen</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .email-container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e9ecef;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 10px;
            }
            .tagline {
                color: #6c757d;
                font-size: 16px;
            }
            .content {
                margin-bottom: 30px;
            }
            .greeting {
                font-size: 20px;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 20px;
            }
            .message {
                font-size: 16px;
                line-height: 1.8;
                color: #495057;
                margin-bottom: 20px;
            }
            .highlight-box {
                background-color: #e3f2fd;
                border-left: 4px solid #2196f3;
                padding: 20px;
                margin: 25px 0;
                border-radius: 5px;
            }
            .highlight-title {
                font-weight: 600;
                color: #1976d2;
                margin-bottom: 10px;
                font-size: 16px;
            }
            .highlight-text {
                color: #1565c0;
                font-size: 15px;
            }
            .next-steps {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 25px;
                margin: 25px 0;
            }
            .next-steps h3 {
                color: #495057;
                margin-bottom: 15px;
                font-size: 18px;
            }
            .next-steps ul {
                margin: 0;
                padding-left: 20px;
            }
            .next-steps li {
                margin-bottom: 8px;
                color: #6c757d;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                color: #6c757d;
                font-size: 14px;
            }
            .contact-info {
                background-color: #f1f3f4;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
                text-align: center;
            }
            .contact-info h4 {
                color: #495057;
                margin-bottom: 10px;
                font-size: 16px;
            }
            .contact-info p {
                color: #6c757d;
                margin: 5px 0;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">GiftyGen</div>
                <div class="tagline">Digital Gift Card Management Platform</div>
            </div>
            
            <div class="content">
                <div class="greeting">Dear ${adminName || "Valued Partner"},</div>
                
                <div class="message">
                    Thank you for choosing GiftyGen as your digital gift card management solution! We're excited to welcome you to our platform.
                </div>
                
                <div class="highlight-box">
                    <div class="highlight-title">✅ Registration Request Received</div>
                    <div class="highlight-text">
                        We have successfully received your registration request for <strong>${
                          restaurantName || "your restaurant"
                        }</strong>. 
                        Our team is currently reviewing your application to ensure everything is set up perfectly for your business needs.
                    </div>
                </div>
                
                <div class="next-steps">
                    <h3>What Happens Next?</h3>
                    <ul>
                        <li><strong>Within few hours:</strong> You will receive your admin account credentials via email</li>
                        <li><strong>Within 24 hours:</strong> Our dedicated team will reach out to you for onboarding</li>
                        <li><strong>Setup assistance:</strong> We'll help you configure your gift card system and train your team</li>
                    </ul>
                </div>
                
                <div class="message">
                    We're committed to making your transition to digital gift cards as smooth as possible. 
                    Our team of experts will work closely with you to ensure you get the most out of the GiftyGen platform.
                </div>
                
                <div class="contact-info">
                    <h4>Need Immediate Assistance?</h4>
                    <p>📧 Email: contact@giftygen.com</p>
                    <p>📞 Phone: +1 (312) 927-8404</p>
                    
                </div>
            </div>
            
            <div class="footer">
                <p>Thank you for choosing GiftyGen!</p>
                <p>© 2026 GiftyGen. All rights reserved.</p>
                <p>This is an automated message, please do not reply directly to this email.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  try {
    await sendEmail({
      email: email,
      subject: "Registration Confirmation - GiftyGen Admin Account Setup",
      html: htmlContent,
    });
  } catch (error) {
    console.error("Error sending registration confirmation email:", error);
    throw error;
  }
};

// Function to send admin notification email with registration form details
const sendAdminNotificationEmail = async (formData) => {
  const { businessName, businessType, contactName, email, phone, website, notes } = formData;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Registration Request - GiftyGen</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .email-container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e9ecef;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 10px;
            }
            .tagline {
                color: #6c757d;
                font-size: 16px;
            }
            .content {
                margin-bottom: 30px;
            }
            .title {
                font-size: 22px;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 20px;
            }
            .info-section {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 25px;
                margin: 20px 0;
            }
            .info-row {
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid #e9ecef;
            }
            .info-row:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }
            .info-label {
                font-weight: 600;
                color: #495057;
                font-size: 14px;
                margin-bottom: 5px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .info-value {
                color: #212529;
                font-size: 16px;
                word-break: break-word;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                color: #6c757d;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">GiftyGen</div>
                <div class="tagline">Digital Gift Card Management Platform</div>
            </div>
            
            <div class="content">
                <div class="title">📋 New Registration Request</div>
                
                <div class="info-section">
                    <div class="info-row">
                        <div class="info-label">Business Name</div>
                        <div class="info-value">${businessName || "Not provided"}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Business Type</div>
                        <div class="info-value">${businessType || "Not provided"}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Contact Name</div>
                        <div class="info-value">${contactName || "Not provided"}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Email</div>
                        <div class="info-value">${email || "Not provided"}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Phone</div>
                        <div class="info-value">${phone || "Not provided"}</div>
                    </div>
                    
                    ${
                      website
                        ? `
                    <div class="info-row">
                        <div class="info-label">Website</div>
                        <div class="info-value">${website}</div>
                    </div>
                    `
                        : ""
                    }
                    
                    ${
                      notes
                        ? `
                    <div class="info-row">
                        <div class="info-label">Notes</div>
                        <div class="info-value">${notes}</div>
                    </div>
                    `
                        : ""
                    }
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated notification from GiftyGen Registration System</p>
                <p>© 2026 GiftyGen. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  try {
    await sendEmail({
      email: "aniketkhillare17@gmail.com, contact@giftygen.com",
      subject: `New Registration Request - ${businessName || "Business Registration"}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Error sending admin notification email:", error);
    throw error;
  }
};

// Function to send contact form notification email
const sendContactFormEmail = async (formData) => {
  const { name, email, message } = formData;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission - GiftyGen</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .email-container {
                background-color: #ffffff;
                border-radius: 10px;
                padding: 40px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e9ecef;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 10px;
            }
            .tagline {
                color: #6c757d;
                font-size: 16px;
            }
            .content {
                margin-bottom: 30px;
            }
            .title {
                font-size: 22px;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 20px;
            }
            .info-section {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 25px;
                margin: 20px 0;
            }
            .info-row {
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid #e9ecef;
            }
            .info-row:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }
            .info-label {
                font-weight: 600;
                color: #495057;
                font-size: 14px;
                margin-bottom: 5px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .info-value {
                color: #212529;
                font-size: 16px;
                word-break: break-word;
            }
            .message-box {
                background-color: #ffffff;
                border-left: 4px solid #007bff;
                padding: 15px;
                margin-top: 10px;
                border-radius: 4px;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e9ecef;
                color: #6c757d;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">GiftyGen</div>
                <div class="tagline">Digital Gift Card Management Platform</div>
            </div>
            
            <div class="content">
                <div class="title">📧 New Contact Form Submission</div>
                
                <div class="info-section">
                    <div class="info-row">
                        <div class="info-label">Name</div>
                        <div class="info-value">${name || "Not provided"}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Email</div>
                        <div class="info-value"><a href="mailto:${email}">${email || "Not provided"}</a></div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Message</div>
                        <div class="message-box">${message ? message.replace(/\n/g, '<br>') : "Not provided"}</div>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated notification from GiftyGen Contact Form</p>
                <p>© ${new Date().getFullYear()} GiftyGen. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  try {
    await sendEmail({
      email: "aniketkhillare17@gmail.com, contact@giftygen.com",
      subject: `New Contact Form Submission from ${name || "Visitor"}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Error sending contact form email:", error);
    throw error;
  }
};

module.exports = { sendEmail, sendRegistrationConfirmationEmail, sendAdminNotificationEmail, sendContactFormEmail };
