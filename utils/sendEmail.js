const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // Only for development
    },
  });

  // Create email content with embedded image using cid
  const mailOptions = {
    from: process.env.SMPT_MAIL,
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
                    <p>📧 Email: support@giftygen.com</p>
                    <p>📞 Phone: +1 (555) 123-4567</p>
                    
                </div>
            </div>
            
            <div class="footer">
                <p>Thank you for choosing GiftyGen!</p>
                <p>© 2024 GiftyGen. All rights reserved.</p>
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

module.exports = { sendEmail, sendRegistrationConfirmationEmail };
