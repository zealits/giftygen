const SuperAdmin = require("../models/superAdminSchema");
const RegistrationRequest = require("../models/registrationRequestSchema");
const RestaurantAdmin = require("../models/restaurantAdminSchema");
const sendToken = require("../utils/jwtToken");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHander = require("../utils/errorhander");

// Login Super Admin
exports.loginSuperAdmin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password is entered by user
  if (!email || !password) {
    return next(new ErrorHander("Please Enter Email & Password", 400));
  }

  // Finding user in database
  const superAdmin = await SuperAdmin.findOne({ email }).select("+password");

  if (!superAdmin) {
    return next(new ErrorHander("Invalid Email or Password", 401));
  }

  // Check if password is correct
  const isPasswordMatched = await superAdmin.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Invalid Email or Password", 401));
  }

  // Check if super admin is active
  if (!superAdmin.isActive) {
    return next(new ErrorHander("Account is deactivated", 401));
  }

  // Update last login
  superAdmin.lastLogin = new Date();
  await superAdmin.save();

  // For super admin, we'll send the token directly since they might not use cookies
  const token = superAdmin.getJWTToken();
  res.status(200).json({
    success: true,
    token,
    superAdmin: {
      id: superAdmin._id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role,
    },
  });
});

// Get Super Admin Profile
exports.getSuperAdminProfile = catchAsyncErrors(async (req, res, next) => {
  const superAdmin = await SuperAdmin.findById(req.user.id);
  res.status(200).json({
    success: true,
    superAdmin,
  });
});

// Logout Super Admin
exports.logoutSuperAdmin = catchAsyncErrors(async (req, res, next) => {
  // For super admin, we don't need to clear cookies since they use Bearer tokens
  // The frontend will handle token removal from localStorage

  res.status(200).json({
    success: true,
    message: "Logged Out Successfully",
  });
});

// Get All Registration Requests
exports.getAllRegistrationRequests = catchAsyncErrors(async (req, res, next) => {
  const requests = await RegistrationRequest.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: requests.length,
    requests,
  });
});

// Get Single Registration Request
exports.getRegistrationRequest = catchAsyncErrors(async (req, res, next) => {
  const request = await RegistrationRequest.findById(req.params.id);

  if (!request) {
    return next(new ErrorHander("Registration request not found", 404));
  }

  res.status(200).json({
    success: true,
    request,
  });
});

// Update Registration Request Status
exports.updateRegistrationRequestStatus = catchAsyncErrors(async (req, res, next) => {
  const { status, notes } = req.body;

  const request = await RegistrationRequest.findById(req.params.id);

  if (!request) {
    return next(new ErrorHander("Registration request not found", 404));
  }

  request.status = status;
  request.notes = notes;
  request.reviewedBy = req.user.id;
  request.reviewedAt = new Date();

  await request.save();

  res.status(200).json({
    success: true,
    message: "Registration request status updated successfully",
    request,
  });
});

// Get Registration Request Statistics
exports.getRegistrationStats = catchAsyncErrors(async (req, res, next) => {
  const total = await RegistrationRequest.countDocuments();
  const pending = await RegistrationRequest.countDocuments({ status: "pending" });
  const approved = await RegistrationRequest.countDocuments({ status: "approved" });
  const rejected = await RegistrationRequest.countDocuments({ status: "rejected" });

  res.status(200).json({
    success: true,
    stats: {
      total,
      pending,
      approved,
      rejected,
    },
  });
});

// Create Business Admin (generate password and email)
exports.createBusinessAdmin = catchAsyncErrors(async (req, res, next) => {
  const { email, restaurantName, name, phone, businessSlug, password } = req.body;

  if (!email || !restaurantName) {
    return next(new ErrorHander("Email and restaurantName are required", 400));
  }

  const existing = await RestaurantAdmin.findOne({ email });
  if (existing) {
    return next(new ErrorHander("Restaurant admin already exists for this email", 409));
  }

  // generate slug if not provided
  const slugFromName = (restaurantName || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const finalSlug = (businessSlug || slugFromName).substring(0, 60);

  // optional: ensure slug uniqueness by appending counter
  let uniqueSlug = finalSlug;
  let counter = 1;
  while (await RestaurantAdmin.findOne({ businessSlug: uniqueSlug })) {
    uniqueSlug = `${finalSlug}-${counter++}`;
  }

  const generatedPassword = password || Math.random().toString(36).slice(-10) + "A1!";

  const admin = new RestaurantAdmin({
    name: name || restaurantName,
    email,
    password: generatedPassword,
    phone: phone || undefined,
    restaurantName,
    businessSlug: uniqueSlug,
    isVerified: true,
  });

  await admin.save();

  // Send professional credentials email to the new business admin
  try {
    const { sendEmail } = require("../utils/sendEmail");

    const credentialsHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your GiftyGen Admin Account is Ready!</title>
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
              .credentials-box {
                  background-color: #e8f5e8;
                  border: 2px solid #28a745;
                  border-radius: 8px;
                  padding: 25px;
                  margin: 25px 0;
                  text-align: center;
              }
              .credentials-title {
                  font-weight: 600;
                  color: #155724;
                  margin-bottom: 15px;
                  font-size: 18px;
              }
              .credential-item {
                  background-color: #ffffff;
                  border: 1px solid #d4edda;
                  border-radius: 5px;
                  padding: 15px;
                  margin: 10px 0;
                  font-family: 'Courier New', monospace;
                  font-size: 16px;
                  color: #155724;
              }
              .login-button {
                  display: inline-block;
                  background-color: #007bff;
                  color: #ffffff;
                  padding: 15px 30px;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 600;
                  margin: 20px 0;
                  font-size: 16px;
              }
              .login-button:hover {
                  background-color: #0056b3;
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
                  <div class="greeting">Dear ${name || "Valued Partner"},</div>
                  
                  <div class="message">
                      Great news! Your GiftyGen admin account has been approved and is now ready for use. 
                      You can now access your dashboard and start managing your digital gift cards.
                  </div>
                  
                  <div class="credentials-box">
                      <div class="credentials-title">🔐 Your Login Credentials</div>
                      <div class="credential-item">
                          <strong>Email:</strong> ${email}
                      </div>
                      <div class="credential-item">
                          <strong>Password:</strong> ${generatedPassword}
                      </div>
                      <div class="credential-item">
                          <strong>Restaurant:</strong> ${restaurantName}
                      </div>
                  </div>
                  
                  <div style="text-align: center;">
                      <a href="${
                        process.env.FRONTEND_URL || "https://yourdomain.com"
                      }/admin/login" class="login-button">
                          🚀 Access Your Dashboard
                      </a>
                  </div>
                  
                  <div class="next-steps">
                      <h3>What You Can Do Now:</h3>
                      <ul>
                          <li><strong>Login:</strong> Use your credentials above to access your admin dashboard</li>
                          <li><strong>Configure Settings:</strong> Set up your business profile and payment settings</li>
                          <li><strong>Create Gift Cards:</strong> Start designing and managing your gift card inventory</li>
                          <li><strong>Team Training:</strong> Our team will contact you within 24 hours for onboarding</li>
                      </ul>
                  </div>
                  
                  <div class="message">
                      <strong>Security Note:</strong> Please change your password after your first login for security purposes.
                  </div>
                  
                  <div class="contact-info">
                      <h4>Need Help Getting Started?</h4>
                      <p>📧 Email: support@giftygen.com</p>
                      <p>📞 Phone: +1 (555) 123-4567</p>
                      <p>💬 Live Chat: Available on our website</p>
                  </div>
              </div>
              
              <div class="footer">
                  <p>Welcome to the GiftyGen family!</p>
                  <p>© 2024 GiftyGen. All rights reserved.</p>
                  <p>This is an automated message, please do not reply directly to this email.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    await sendEmail({
      email: email,
      subject: "Your GiftyGen Admin Account is Ready! 🎉",
      html: credentialsHtml,
    });
  } catch (emailError) {
    console.error("Failed to send credentials email:", emailError);
    // Don't fail the admin creation if email fails
  }

  res.status(201).json({
    success: true,
    message: "Business admin created",
    admin: {
      id: admin._id,
      email: admin.email,
      restaurantName: admin.restaurantName,
      businessSlug: admin.businessSlug,
    },
    credentials: { email: admin.email, password: generatedPassword },
  });
});
