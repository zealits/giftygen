const GiftCard = require("../models/giftCardSchema");
const ApiFeatures = require("../utils/apifeatures");
const multer = require("multer");
const path = require("path");
const sendEmail = require("../utils/sendEmailRedeem.js"); // Assuming sendEmail is in the same directory
const QRCode = require("qrcode"); // For generating QR codes
const cloudinary = require("cloudinary");
const fs = require("fs");
const { google } = require("googleapis");
const auth = require("../config/googleConfig");

// Create a new gift card
// const cloudinary = require("cloudinary").v2;

const createGiftCard = async (req, res) => {
  try {
    const { giftCardName, giftCardTag, description, amount, discount, expirationDate } = req.body;
    let giftCardImgUrl = null;

    if (req.file) {
      // Generate a unique filename
      const uniqueFilename = `${Date.now()}-${req.file.originalname}`;

      // Upload the image to Cloudinary with explicit public_id including folder
      const result = await cloudinary.uploader.upload(req.file.path, {
        public_id: `gift_cards/${uniqueFilename}`, // Explicitly specify folder in public_id
        resource_type: "auto",
      });

      // Log the result to verify upload location
      console.log("Upload result:", result);

      giftCardImgUrl = result.secure_url;

      // Remove the file from the uploads folder
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Error deleting file from uploads folder:", err);
        } else {
          console.log("Temporary file deleted successfully.");
        }
      });
    }

    const giftCard = new GiftCard({
      giftCardName,
      giftCardTag,
      description,
      amount,
      discount,
      expirationDate,
      giftCardImg: giftCardImgUrl,
      businessSlug: req.user?.businessSlug || req.body.businessSlug || undefined,
    });

    console.log(giftCard);
    const savedGiftCard = await giftCard.save();
    res.status(201).json(savedGiftCard);
  } catch (error) {
    console.error("Error:", error);
    res.status(400).json({ error: error.message });
  }
};

// Get a gift card by ID
const getGiftCardById = async (req, res) => {
  try {
    const { id } = req.params;
    const giftCard = await GiftCard.findById(id);
    if (!giftCard) {
      return res.status(404).json({ message: "Gift card not found" });
    }
    res.status(200).json(giftCard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// exports.getAllVenues = catchAsyncErrors(async (req, res, next) => {
//   const venuesCount = await Venue.countDocuments();
//   const resultPerPage = 30;

//   const apiFeatures = new ApiFeatures(Venue.find(), req.query).search().pagination(resultPerPage);
//   // const venues = await Venue.find();
//   const venues = await apiFeatures.query;

//   res.status(200).json({
//     success: true,
//     venues,
//     venuesCount,
//     // resultPerPage,
//   });
// });

// Get all gift cards
const getAllGiftCards = async (req, res) => {
  try {
    const { businessSlug } = req.query || {};
    const filter = businessSlug ? { businessSlug } : {};
    const giftCardCount = await GiftCard.countDocuments(filter);
    console.log("GiftCard Count:", giftCardCount); // Debugging
    const resultPerPage = 100;

    const baseQuery = businessSlug ? GiftCard.find({ businessSlug }) : GiftCard.find();

    const apiFeatures = new ApiFeatures(baseQuery, req.query).search().pagination(resultPerPage);

    const giftCards = await apiFeatures.query;

    console.log("Gift Cards Retrieved:", giftCards.length); // Debugging
    res.status(200).json({
      giftCardCount,
      giftCards,
    });
  } catch (error) {
    console.error("Error in getAllGiftCards:", error);
    res.status(400).json({ error: error.message });
  }
};

const getTotalGiftCardsSold = async (req, res) => {
  try {
    const { businessSlug } = req.query || {};
    const filter = businessSlug ? { businessSlug } : {};
    const allGiftCards = await GiftCard.find(filter);
    const totalSold = allGiftCards.reduce((sum, card) => sum + (card.buyers?.length || 0), 0);

    res.status(200).json({ totalSold });
  } catch (error) {
    console.error("Error in getTotalGiftCardsSold:", error);
    res.status(500).json({ error: "Failed to calculate total gift cards sold" });
  }
};

const getSoldGiftCards = async (req, res) => {
  try {
    const { businessSlug } = req.query || {};
    const filter = businessSlug ? { businessSlug } : {};
    // Fetch only gift cards with buyers (indicating they are sold)
    const soldGiftCards = await GiftCard.find({ ...filter, "buyers.0": { $exists: true } });

    // Map gift cards to include only relevant details
    const giftCards = soldGiftCards.map((card) => ({
      id: card._id,
      name: card.giftCardName,
      tag: card.giftCardTag,
      description: card.description,
      image: card.giftCardImg,
      totalBuyers: card.buyers.length, // Count of buyers
    }));

    res.status(200).json({ giftCards });
  } catch (error) {
    console.error("Error in getSoldGiftCards:", error);
    res.status(500).json({ error: "Failed to fetch sold gift cards" });
  }
};

const getTotalRevenue = async (req, res) => {
  try {
    const { businessSlug } = req.query || {};
    const filter = businessSlug ? { businessSlug } : {};
    const allGiftCards = await GiftCard.find(filter);

    const totalRevenue = allGiftCards.reduce((sum, card) => {
      if (!card.amount || !card.discount) {
        console.warn(`Skipping card with missing amount or discount: ${JSON.stringify(card)}`);
        return sum;
      }

      const cardRevenue = (card.amount - card.amount * (card.discount / 100)) * (card.buyers?.length || 0);

      return sum + cardRevenue;
    }, 0);

    res.json({ totalRevenue });
  } catch (error) {
    res.status(500).json({ message: "Error calculating total revenue", error });
  }
};

const getSalesTrends = async (req, res) => {
  try {
    const { period } = req.query; // period: 'daily', 'weekly', 'monthly'
    const { businessSlug } = req.query || {};

    // Define the start of the time period
    const dateNow = new Date();
    let startDate;

    // Set startDate based on the selected period
    if (period === "daily") {
      startDate = new Date(dateNow.setHours(0, 0, 0, 0)); // Start of today
    } else if (period === "weekly") {
      const dayOfWeek = dateNow.getDay();
      const diff = dateNow.getDate() - dayOfWeek; // Get the start of the week
      startDate = new Date(dateNow.setDate(diff));
    } else if (period === "monthly") {
      startDate = new Date(dateNow.getFullYear(), dateNow.getMonth(), 1); // Start of the month
    } else {
      return res.status(400).json({ error: "Invalid period parameter" });
    }

    console.log("Period:", period); // Log the period
    console.log("Start Date:", startDate); // Log the start date for the given period

    // Fetch gift cards with buyers who have purchased after the start date
    const baseFilter = businessSlug ? { businessSlug } : {};
    const allGiftCards = await GiftCard.find({
      ...baseFilter,
      "buyers.purchaseDate": { $gte: startDate },
    });

    console.log("Fetched Gift Cards:", allGiftCards.length); // Log the number of gift cards found

    // Aggregate sales based on the selected period
    const salesData = allGiftCards.reduce((acc, card) => {
      card.buyers.forEach((buyer) => {
        if (buyer.purchaseDate >= startDate) {
          const saleDate = new Date(buyer.purchaseDate);
          const dateKey = `${saleDate.getFullYear()}-${saleDate.getMonth() + 1}-${saleDate.getDate()}`; // 'YYYY-MM-DD'

          if (!acc[dateKey]) {
            acc[dateKey] = 0;
          }
          acc[dateKey]++;
        }
      });
      return acc;
    }, {});

    console.log("Aggregated Sales Data:", salesData); // Log aggregated sales data

    res.status(200).json({ salesData });
  } catch (error) {
    console.error("Error in getSalesTrends:", error);
    res.status(500).json({ error: "Failed to fetch sales trends" });
  }
};

const getSalesData = async (req, res) => {
  try {
    const { businessSlug } = req.query || {};
    // Get the current date and 30 days ago
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30); // 30 days range

    console.log("Start Date (30 days ago):", startDate);
    console.log("End Date:", endDate);

    // Query the database for sales data in the past 30 days based on the 'purchaseDate' of buyers
    const pipeline = [];
    if (businessSlug) {
      pipeline.push({ $match: { businessSlug } });
    }
    pipeline.push(
      { $unwind: "$buyers" },
      { $match: { "buyers.purchaseDate": { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$buyers.purchaseDate" } }, sales: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    );

    const salesData = await GiftCard.aggregate(pipeline);

    console.log("Sales Data (raw aggregation):", salesData);

    // If no sales data is found, send a message indicating that
    if (!salesData.length) {
      console.log("No sales data found for the given date range.");
      return res.status(200).json([]);
    }

    // Format the data to match the expected structure for the frontend
    const formattedData = salesData.map((item) => ({
      date: item._id,
      sales: item.sales,
    }));

    console.log("Formatted Sales Data:", formattedData);
    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return res.status(500).json({ message: "Error fetching sales data" });
  }
};

// Update a gift card

// const getSalesData = async (req, res) => {
//   try {
//     // Get the current date and 30 days ago
//     const endDate = new Date();
//     const startDate = new Date();
//     startDate.setDate(endDate.getDate() - 30); // 30 days range

//     console.log("Start Date (30 days ago):", startDate);
//     console.log("End Date:", endDate);

//     // Query the database for sales data in the past 30 days based on the 'purchaseDate' of buyers
//     const salesData = await GiftCard.aggregate([
//       {
//         $unwind: "$buyers", // Unwind the 'buyers' array to work with each individual purchase
//       },
//       {
//         $match: {
//           "buyers.purchaseDate": { $gte: startDate, $lte: endDate },
//         },
//       },
//       {
//         $group: {
//           _id: { $dateToString: { format: "%Y-%m-%d", date: "$buyers.purchaseDate" } }, // Group by purchaseDate
//           sales: { $sum: 1 }, // Sum the sales for each day
//           totalRevenue: { $sum: "$buyers.paymentDetails.paymentamount" }, // Sum revenue for each day
//         },
//       },
//       {
//         $sort: { _id: 1 }, // Sort by date (ascending)
//       },
//     ]);

//     console.log("Sales Data (raw aggregation):", salesData);

//     // If no sales data is found, send a message indicating that
//     if (!salesData.length) {
//       console.log("No sales data found for the given date range.");
//       return res.status(200).json([]);
//     }

//     // Format the data to match the expected structure for the frontend
//     const formattedData = salesData.map((item) => ({
//       date: item._id,
//       sales: item.sales,
//       revenue: item.totalRevenue, // Include total revenue
//     }));

//     console.log("Formatted Sales Data:", formattedData);
//     return res.status(200).json(formattedData);
//   } catch (error) {
//     console.error("Error fetching sales data:", error);
//     return res.status(500).json({ message: "Error fetching sales data" });
//   }
// };

const updateGiftCard = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the existing gift card
    const existingGiftCard = await GiftCard.findById(id);
    if (!existingGiftCard) {
      return res.status(404).json({ message: "Gift card not found" });
    }

    // Enforce business ownership for admins
    if (req.user?.role === "Admin") {
      const userSlug = req.user.businessSlug;
      if (existingGiftCard.businessSlug && userSlug && existingGiftCard.businessSlug !== userSlug) {
        return res.status(403).json({ message: "Not authorized to update this gift card" });
      }
    }

    let giftCardImgUrl = existingGiftCard.giftCardImg; // Keep existing image by default

    if (req.file) {
      // Generate a unique filename
      const uniqueFilename = `${Date.now()}-${req.file.originalname}`;

      // Upload the new image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        public_id: `gift_cards/${uniqueFilename}`,
        resource_type: "auto",
      });
      console.log("Cloudinary Upload Result:", result);
      giftCardImgUrl = result.secure_url;

      // Delete the old image from Cloudinary (optional)
      if (existingGiftCard.giftCardImg) {
        const oldImagePublicId = existingGiftCard.giftCardImg.split("/").pop().split(".")[0]; // Extract public ID from URL
        await cloudinary.uploader.destroy(`gift_cards/${oldImagePublicId}`);
      }

      // Remove the temporary file from local storage
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        }
      });
    }

    // Update the gift card fields
    const updates = { ...req.body, giftCardImg: giftCardImgUrl };
    // Preserve businessSlug; do not allow changing businessSlug via update
    delete updates.businessSlug;
    const updatedGiftCard = await GiftCard.findByIdAndUpdate(id, updates, { new: true });
    console.log("Updated Gift Card:", updatedGiftCard);

    res.status(200).json(updatedGiftCard);
  } catch (error) {
    console.error("Error updating gift card:", error);
    res.status(400).json({ error: error.message });
  }
};

// Delete a gift card
const deleteGiftCard = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await GiftCard.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Gift card not found" });
    }
    if (req.user?.role === "Admin") {
      const userSlug = req.user.businessSlug;
      if (existing.businessSlug && userSlug && existing.businessSlug !== userSlug) {
        return res.status(403).json({ message: "Not authorized to delete this gift card" });
      }
    }
    const deletedGiftCard = await GiftCard.findByIdAndDelete(id);
    if (!deletedGiftCard) {
      return res.status(404).json({ message: "Gift card not found" });
    }
    res.status(200).json({ message: "Gift card deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Add a buyer to a gift card

// In your controller where you generate and send the email
const addBuyer = async (req, res) => {
  try {
    const { id, purchaseType, selfInfo, giftInfo, paymentDetails, barcodeUnicode, walletUrl } = req.body;

    console.log("bacode : ", barcodeUnicode);
    console.log("wallet url : ", walletUrl);
    // Validate required fields
    if (!id || !purchaseType || !paymentDetails) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (purchaseType === "self" && (!selfInfo?.name || !selfInfo?.email || !selfInfo?.phone)) {
      return res.status(400).json({ error: "Missing required fields for self purchase" });
    }

    if (
      purchaseType === "gift" &&
      (!giftInfo?.recipientName || !giftInfo?.recipientEmail || !giftInfo?.senderName || !giftInfo?.senderEmail)
    ) {
      return res.status(400).json({ error: "Missing required fields for gift purchase" });
    }

    const giftCardDetails = await GiftCard.findById(id);
    console.log("giftcard amount checking : ", giftCardDetails.amount);
    let remainingBalance = giftCardDetails.amount;

    if (!giftCardDetails) {
      return res.status(404).json({ error: "Gift card not found" });
    }

    // Generate unique code for QR
    let uniqueCode;
    if (barcodeUnicode) {
      uniqueCode = barcodeUnicode;
    } else {
      uniqueCode = `${id}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }

    // Generate QR code as Buffer
    const qrCodeBuffer = await QRCode.toBuffer(uniqueCode, {
      errorCorrectionLevel: "H",
      type: "png",
      margin: 1,
      width: 300,
    });

    // Create unique identifier for QR code image
    const qrCodeCid = `qr-${Date.now()}@giftcard.com`;

    // Save QR code data to database
    const qrCodeBase64 = qrCodeBuffer.toString("base64");
    const buyerDetails = {
      purchaseType,
      selfInfo: purchaseType === "self" ? selfInfo : undefined,
      giftInfo: purchaseType === "gift" ? giftInfo : undefined,
      paymentDetails,
      purchaseDate: new Date(),
      qrCode: {
        uniqueCode,
        // dataUrl: `data:image/png;base64,${qrCodeBase64}`,
        createdAt: new Date(),
        isUsed: false,
      },
      remainingBalance,
    };

    // Add buyer to gift card
    console.log(buyerDetails);
    giftCardDetails.buyers.push(buyerDetails);
    await giftCardDetails.save();

    const senderEmail = selfInfo?.email || giftInfo?.senderEmail;
    const recipientEmail = giftInfo?.recipientEmail;
    const { giftCardName, giftCardTag, description, amount, expirationDate } = giftCardDetails;

    // Email template function
    const createEmailTemplate = (isRecipient = false) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Virtual Gift Card</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            background-color: #f5f5f5;
            color: #333;
        }

        /* Main email container */
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
        }

        /* Virtual gift card design */
        .gift-card-container {
            max-width: 500px;
            margin: 20px auto;
            background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        /* Card header section */
        .card-header {
            padding: 25px;
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
        }

        .card-header h2 {
            color: #ffffff;
            font-size: 24px;
            margin-bottom: 10px;
            letter-spacing: 1px;
        }

        /* Card amount section */
        .card-amount {
            padding: 30px 25px;
            text-align: center;
            background: rgba(255, 255, 255, 0.05);
        }

        .amount {
            font-size: 42px;
            color: #ffffff;
            font-weight: bold;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        /* Card details section */
        .card-details {
            padding: 25px;
            background: rgba(255, 255, 255, 0.95);
            border-radius: 12px;
            margin: 0 15px 15px;
        }

        .detail-item {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid rgba(26, 35, 126, 0.1);
        }

        .detail-item:last-child {
            border-bottom: none;
        }

        .detail-label {
            color: #1a237e;
            font-weight: 600;
            font-size: 14px;
        }

        .detail-value {
            color: #333;
            font-size: 14px;
        }

        /* QR Code section */
        .qr-section {
            background: #ffffff;
            padding: 25px;
            text-align: center;
            border-radius: 12px;
            margin: 15px;
        }

        .qr-section p {
            color: #1a237e;
            font-size: 16px;
            margin-bottom: 15px;
            font-weight: 600;
        }

        .qr-code {
            width: 180px;
            height: 180px;
            margin: 0 auto;
            padding: 10px;
            background: #ffffff;
            border: 1px solid rgba(26, 35, 126, 0.1);
            border-radius: 8px;
        }


        /* Google Wallet Button Styling */
        .wallet-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background-color: #ffffff;
            border: 1px solid #dadce0;
            border-radius: 8px;
            padding: 12px 24px;
            text-decoration: none;
            transition: all 0.3s ease;
            margin: 15px 0;
            cursor: pointer;
        }

        .wallet-button:hover {
            background-color: #f8f9fa;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12);
        }

        .wallet-icon {
            width: 24px;
            height: 24px;
            margin-right: 12px;
            vertical-align: middle;
        }

        .wallet-text {
            color: #3c4043;
            font-family: 'Google Sans', Arial, sans-serif;
            font-size: 15px;
            font-weight: 500;
            letter-spacing: 0.25px;
            vertical-align: middle;
        }

        /* Apple Wallet Button Styling */
        .wallet-button.apple-wallet {
            background-color: #000000;
            border-color: #000000;
            margin-top: 10px;
        }

        .wallet-button.apple-wallet .wallet-text {
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .wallet-button.apple-wallet:hover {
            background-color: #333333;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        /* Wallet buttons container styling */
        .qr-section .wallet-button {
            display: block;
            width: 100%;
            max-width: 300px;
            margin: 15px auto;
            text-align: center;
        }

        .qr-section .wallet-button:first-child {
            margin-top: 0;
        }

        /* Instructions section */
        .instructions {
            margin-top: 25px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }

        .instructions h3 {
            color: #1a237e;
            margin-bottom: 15px;
            font-size: 18px;
        }

        .instructions ol {
            margin-left: 20px;
            color: #555;
        }

        .instructions li {
            margin-bottom: 10px;
        }

        /* Footer section */
        .footer {
            margin-top: 25px;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 13px;
            border-top: 1px solid #eee;
        }

        /* Responsive design */
        @media screen and (max-width: 480px) {
            .email-container {
                margin: 10px;
                padding: 15px;
            }

            .card-header h2 {
                font-size: 20px;
            }

            .amount {
                font-size: 36px;
            }

            .qr-code {
                width: 150px;
                height: 150px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="gift-card-container">
            <!-- Card Header -->
            <div class="card-header">
                <h2>${isRecipient ? "Virtual Gift Card" : "Gift Card Purchase"}</h2>
                <p style="color: #ffffff; opacity: 0.9;">
                    ${isRecipient ? `From: ${senderEmail}` : `To: ${recipientEmail}`}
                </p>
            </div>

            <!-- Amount Display -->
            <div class="card-amount">
                <div class="amount">$ ${amount}</div>
            </div>

            <!-- Card Details -->
            <div class="card-details">
                <div class="detail-item">
                    <span class="detail-label">Gift Card Type &nbsp; </span>
                    <span class="detail-value"> ${giftCardName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Card ID &nbsp;</span>
                    <span class="detail-value"> ${giftCardTag}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Valid Until &nbsp;</span>
                    <span class="detail-value">${
                      expirationDate ? new Date(expirationDate).toLocaleDateString() : "No Expiration"
                    }</span>
                </div>
            </div>

            <!-- QR Code Section -->
            <div class="qr-section">
                <p>Scan to Redeem</p>
                <img src="cid:${qrCodeCid}" alt="QR Code" class="qr-code"/>
            </div>
          
            
            <!-- Google Wallet Section -->
            <div class="qr-section">
                <a href="${walletUrl}" target="_blank" rel="noopener noreferrer" class="wallet-button">
                    <img src="https://res.cloudinary.com/dzmn9lnk5/image/upload/v1740297009/gift_cards/google-wallet_wfh992.png" 
                         alt="Google Wallet" 
                         class="wallet-icon" />
                    <span class="wallet-text">Add to Google Wallet</span>
                </a>
                
                <a href="${walletUrl}" target="_blank" rel="noopener noreferrer" class="wallet-button apple-wallet">
                    <img src="https://res.cloudinary.com/dzmn9lnk5/image/upload/v1755349111/gift_cards/64px-Apple_Wallet_Icon.svg_tk8gzq.png" 
                         alt="Apple Wallet" 
                         class="wallet-icon" />
                    <span class="wallet-text">Add to Apple Wallet</span>
                </a>
            </div>
        </div>

        <!-- Instructions -->
         <div class="instructions">
            <h3>How to Redeem Your Gift Card</h3>
              <ol>
                  <li>Visit the restaurant where you want to redeem your gift card.</li>
                  <li>The restaurant admin will scan the QR code on your gift card.</li>
                  <li>Inform the admin how much money you wish to redeem from the gift card balance.</li>
                  <li>An OTP will be sent to your registered email or mobile number for final confirmation.</li>
                  <li>Provide the OTP to the admin to complete the redemption process.</li>
             </ol>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>This is a secure automated message. Please do not reply to this email.</p>
            ${!isRecipient ? `<p>A copy of this gift card has been sent to ${recipientEmail}</p>` : ""}
        </div>
    </div>
</body>
</html>
`;

    try {
      // Send email to sender
      await sendEmail({
        email: senderEmail,
        subject: `Your gift card purchase: ${giftCardName}`,
        html: createEmailTemplate(false),
        attachments: [
          {
            filename: "qr-code.png",
            content: qrCodeBuffer,
            cid: qrCodeCid,
          },
        ],
      });

      // Send email to recipient if gift purchase
      if (recipientEmail) {
        await sendEmail({
          email: recipientEmail,
          subject: `You've received a gift card: ${giftCardName}`,
          html: createEmailTemplate(true),
          attachments: [
            {
              filename: "qr-code.png",
              content: qrCodeBuffer,
              cid: qrCodeCid,
            },
          ],
        });
      }
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
    }

    res.status(200).json({
      message: "Buyer added successfully",
      giftCard: giftCardDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while adding the buyer" });
  }
};

// Redeem a gift card using QR code
const redeemGiftCard = async (req, res) => {
  try {
    const { qrCode, amount } = req.body;

    console.log("Amount to redeem:", amount);
    console.log("QR Code:", qrCode);

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid redeem amount." });
    }

    // Find the gift card based on the unique QR code
    const giftCard = await GiftCard.findOne({ "buyers.qrCode.uniqueCode": qrCode });

    if (!giftCard) {
      return res.status(404).json({ message: "Invalid QR code" });
    }

    // Find the buyer using the unique QR code
    const buyer = giftCard.buyers.find((buyer) => buyer.qrCode.uniqueCode === qrCode);

    if (!buyer) {
      return res.status(400).json({ message: "Buyer not found for the given QR code" });
    }

    // Check if the redeem amount does not exceed the available balance for the buyer
    const remainingBalance = buyer.remainingBalance || giftCard.amount - (buyer.usedAmount || 0);

    if (amount > remainingBalance) {
      return res.status(400).json({ message: "Amount exceeds available balance for the buyer." });
    }

    // Update the buyer's remaining balance and used amount
    buyer.remainingBalance = remainingBalance - amount;
    buyer.usedAmount = (buyer.usedAmount || 0) + amount;

    const redemptionDetails = {
      redeemedAmount: amount,
      redemptionDate: new Date(),
      originalAmount: giftCard.amount,
      remainingAmount: buyer.remainingBalance,
    };
    buyer.redemptionHistory.push(redemptionDetails);

    // Save the updated gift card document
    await giftCard.save();
    console.log("Gift card document saved:", giftCard);
    console.log("Buyer object after redemption:", buyer);

    // Respond with success and updated data
    res.status(200).json({
      message: "Gift card redeemed successfully",
      buyer: {
        remainingBalance: buyer.remainingBalance,
        usedAmount: buyer.usedAmount,
        redemptionHistory: buyer.redemptionHistory,
      },
    });
  } catch (error) {
    console.error("Error redeeming gift card:", error);
    res.status(500).json({ error: "An error occurred while redeeming the gift card." });
  }
};

const sendOtp = async (req, res, next) => {
  const { email, redeemAmount, qrUniqueCode } = req.body;
  console.log("qrcode : ", qrUniqueCode);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("Generated OTP:", otp); // Log the plain OTP

  const message = `Your OTP for email verification is: ${otp}. Amount: ${redeemAmount}. It will expire in 10 minutes.`;

  try {
    // Find the gift card containing the buyer with the specific qrUniqueCode
    const giftCard = await GiftCard.findOne({ "buyers.qrCode.uniqueCode": qrUniqueCode });

    if (!giftCard) {
      console.log("Gift card not found for email:", email);
      return res.status(404).json({ message: "Gift card not found" });
    }

    console.log("Gift card found:", giftCard);

    // Find the specific buyer within the gift card
    const buyer = giftCard.buyers.find((b) => b.qrCode.uniqueCode === qrUniqueCode);

    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found with the provided QR code" });
    }

    // Set OTP and expiry date
    buyer.otp.code = otp;
    buyer.otp.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save the updated gift card document
    await giftCard.save();

    console.log("OTP and expiry updated successfully for buyer:", buyer);

    // Send the OTP via email
    await sendEmail({
      email: email,
      subject: "Email Verification OTP for redeem",
      message,
    });

    res.status(200).json({
      success: true,
      message: `OTP sent to ${email} successfully`,
    });
  } catch (error) {
    console.log("Error:", error);
    return next(new ErrorHander(error.message, 500));
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  const { email, otp, qrUniqueCode } = req.body;

  console.log("Email:", email);
  console.log("OTP:", otp);
  console.log("QR Unique Code:", qrUniqueCode);

  try {
    // Validate inputs
    if (!email || !otp || !qrUniqueCode) {
      return res.status(400).json({ message: "Email, OTP, and QR Unique Code are required" });
    }

    // Find the gift card with the specific QR unique code
    const giftCard = await GiftCard.findOne({ "buyers.qrCode.uniqueCode": qrUniqueCode });

    if (!giftCard) {
      return res.status(404).json({ message: "Gift card not found" });
    }

    // Locate the specific buyer within the gift card
    const buyer = giftCard.buyers.find((b) => b.qrCode.uniqueCode === qrUniqueCode);

    if (!buyer) {
      return res.status(404).json({ message: "Buyer not found with the provided QR code" });
    }

    // Validate OTP
    const isOtpValid = buyer.otp && buyer.otp.code === otp && buyer.otp.expiresAt > new Date();

    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear the OTP after successful verification
    buyer.otp = { code: null, expiresAt: null };
    await giftCard.save();

    res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

// Fetch Gift Card by ID QR unique id (id and qr id are different imp)

const fetchGiftCardById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching Gift Card for ID:", id); // Debug logging

    const giftCard = await GiftCard.findOne({ "buyers.qrCode.uniqueCode": id });

    if (!giftCard) {
      console.log("Gift card not found for ID:", id);
      return res.status(404).json({ message: "Gift card not found" });
    }

    res.status(200).json(giftCard);
  } catch (error) {
    console.error("Error fetching gift card:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getGiftCardBuyers = async (req, res) => {
  try {
    const { id } = req.params; // Gift card ID
    const { businessSlug } = req.query || {};
    const giftCard = await GiftCard.findById(id);

    if (!giftCard) {
      return res.status(404).json({ error: "Gift card not found" });
    }

    // Optional business scope check
    if (businessSlug && giftCard.businessSlug && giftCard.businessSlug !== businessSlug) {
      return res.status(403).json({ error: "Not authorized to view buyers for this gift card" });
    }

    // Sort buyers by purchase date and include remaining balance and redemption history
    const sortedBuyers = giftCard.buyers
      .sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate))
      .map((buyer) => {
        const isGift = buyer.purchaseType === "gift";
        const buyerName = isGift
          ? buyer.giftInfo?.senderName || "Unknown Buyer"
          : buyer.selfInfo?.name || "Unknown Buyer";
        const recipientName = buyer.giftInfo?.recipientName || "Recipient";

        const name = isGift ? `${buyerName} bought for ${recipientName}` : buyerName;

        return {
          name,
          purchaseDate: buyer.purchaseDate,
          remainingBalance: buyer.remainingBalance || 0,
          redemptionHistory: buyer.redemptionHistory || [],
          returnTime: buyer.purchaseDate,
        };
      });

    res.status(200).json({ buyers: sortedBuyers });
  } catch (error) {
    console.error("Error in getGiftCardBuyers:", error);
    res.status(500).json({ error: "Failed to fetch buyers" });
  }
};

const getAllBuyers = async (req, res) => {
  try {
    const { businessSlug } = req.query || {};
    const filter = businessSlug ? { businessSlug } : {};
    const giftCards = await GiftCard.find(filter, "giftCardName buyers businessSlug"); // Only fetch fields needed

    // Extract buyers from filtered gift cards and sort them by purchaseDate
    const buyers = giftCards.flatMap((card) =>
      card.buyers.map((buyer) => ({
        buyerName: buyer.purchaseType === "self" ? buyer.selfInfo.name : buyer.giftInfo.senderName,
        email: buyer.purchaseType === "self" ? buyer.selfInfo.email : buyer.giftInfo.senderEmail,
        remainingBalance: buyer.remainingBalance,
        giftCardName: card.giftCardName,
        purchaseDate: buyer.purchaseDate,
        usedAmount: buyer.usedAmount,
        redemptionHistory: (buyer.redemptionHistory || []).map((entry) => ({
          redeemedAmount: entry.redeemedAmount,
          redemptionDate: entry.redemptionDate,
          remainingAmount: entry.remainingAmount,
          originalAmount: entry.originalAmount,
        })),
      }))
    );

    // Sort buyers by purchaseDate in descending order (newest first)
    buyers.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));

    res.status(200).json({
      success: true,
      buyers,
    });
  } catch (error) {
    console.error("Error fetching buyers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch buyers.",
    });
  }
};

const totalRedemptionValue = async (req, res) => {
  try {
    const { businessSlug } = req.query || {};
    const pipeline = [];
    if (businessSlug) {
      pipeline.push({ $match: { businessSlug } });
    }
    // Use aggregation to sum up the redeemedAmount for all buyers in all gift cards
    pipeline.push(
      { $unwind: "$buyers" },
      { $unwind: "$buyers.redemptionHistory" },
      { $group: { _id: null, totalRedemption: { $sum: "$buyers.redemptionHistory.redeemedAmount" } } }
    );

    const totalRedemption = await GiftCard.aggregate(pipeline);

    if (totalRedemption.length > 0) {
      res.json({ totalRedemption: totalRedemption[0].totalRedemption });
    } else {
      res.json({ totalRedemption: 0 });
    }
  } catch (error) {
    console.error("Error fetching total redemption:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getRevenueForLast30Days = async (req, res) => {
  try {
    const { businessSlug } = req.query || {};
    // Calculate the start and end date for the last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    // Fetch gift cards sold within the last 30 days
    const baseFilter = businessSlug ? { businessSlug } : {};
    const giftCards = await GiftCard.find({
      ...baseFilter,
      "buyers.purchaseDate": { $gte: startDate, $lt: endDate },
    });

    // Calculate revenue grouped by day
    const revenueByDate = {};

    giftCards.forEach((card) => {
      const discount = card.discount ? parseFloat(card.discount) / 100 : 0;
      const cardRevenue = (card.amount || 0) * (1 - discount);

      card.buyers.forEach((buyer) => {
        const purchaseDate = new Date(buyer.purchaseDate).toISOString().split("T")[0]; // Extract date only

        if (!revenueByDate[purchaseDate]) {
          revenueByDate[purchaseDate] = 0;
        }
        revenueByDate[purchaseDate] += cardRevenue;
      });
    });

    res.json({ revenueByDate });
  } catch (error) {
    res.status(500).json({ message: "Error calculating revenue for the last 30 days", error });
  }
};

// Function to generate and save gift card to Google Wallet
const addGiftCardToWallet = async (req, res) => {
  try {
    const { userId, cardNumber } = req.body;
    console.log("Triggered");

    const walletService = google.walletobjects({
      version: "v1",
      auth: auth,
    });

    const giftCardId = `gift_card_${userId}_${Date.now()}`;
    const microsValue = 50000000; // $50 in micros

    const giftCardObject = {
      id: `${process.env.GOOGLE_WALLET_ISSUER_ID}.${giftCardId}`,
      classId: `${process.env.GOOGLE_WALLET_ISSUER_ID}.aii_hotels.giftcardclass`,
      state: "active",
      cardNumber: cardNumber,
      balance: {
        currencyCode: "USD",
        micros: microsValue, // Use only micros
      },
      barcode: {
        type: "QR_CODE",
        value: giftCardId,
      },
      issuerName: "Your Company Name",
      programName: "Gift Card Program",
    };

    console.log("Gift Card Object:", giftCardObject);

    // Insert gift card into Google Wallet
    const response = await walletService.giftcardobject.insert({ requestBody: giftCardObject });
    console.log("Gift Card Created:", response.data);

    const saveUrl = `https://pay.google.com/gp/v/save/${encodeURIComponent(giftCardObject.id)}`;

    res.status(200).json({ message: "Gift card added to wallet", saveUrl });
  } catch (error) {
    console.error("Error adding gift card:", error.response?.data || error);
    res.status(500).json({ error: "Failed to add gift card to wallet" });
  }
};

module.exports = {
  createGiftCard,
  getGiftCardById,
  getAllGiftCards,
  getTotalGiftCardsSold,
  getTotalRevenue,
  getSalesTrends,
  getSalesData,
  updateGiftCard,
  deleteGiftCard,
  addBuyer,
  redeemGiftCard,
  sendOtp,
  verifyOtp,
  fetchGiftCardById,
  getSoldGiftCards,
  getGiftCardBuyers,
  getAllBuyers,
  totalRedemptionValue,
  getRevenueForLast30Days,
  addGiftCardToWallet,
};
