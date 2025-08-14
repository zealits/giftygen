const mongoose = require("mongoose");

const giftCardSchema = new mongoose.Schema(
  {
    giftCardName: {
      type: String,
      required: true,
    },
    giftCardTag: {
      type: String,
    },
    description: {
      type: String,
    },
    amount: {
      type: Number, // Changed to Number for proper revenue calculation
    },
    discount: {
      type: String,
    },
    currency: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "redeemed", "expired", "sold"], // Added 'sold' status
      default: "active",
    },
    expirationDate: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    giftCardImg: {
      type: String,
    },
    businessSlug: {
      type: String, // which business owns this gift card
      index: true,
    },
    buyers: [
      {
        purchaseType: {
          type: String,
        },
        selfInfo: {
          name: {
            type: String,
          },
          email: {
            type: String,
          },
          phone: {
            type: String,
          },
        },
        giftInfo: {
          recipientName: {
            type: String,
          },
          recipientEmail: {
            type: String,
          },
          message: {
            type: String,
          },
          senderName: {
            type: String,
          },
          senderEmail: {
            type: String,
          },
          senderPhone: {
            type: String,
          },
        },
        paymentDetails: {
          // add here payment details
          transactionId: {
            type: String,
          },
          paymentMethod: {
            type: String,
          },
          paymentamount: {
            type: Number,
          },
          currency: {
            type: String,
          },
          status: {
            type: String,
          },
          receiptNumber: {
            type: String,
          },
          receiptUrl: {
            type: String,
          },
          paymentdAt: {
            type: Date,
          },
        },
        purchaseDate: {
          type: Date,
          default: Date.now,
        },
        qrCode: {
          uniqueCode: {
            type: String,
          },
          // dataUrl: {
          //   type: String,
          // },
          createdAt: {
            type: Date,
            default: Date.now,
          },
          isUsed: {
            type: Boolean,
            default: false,
          },
        },
        otp: {
          code: {
            type: String, // OTP code
          },
          expiresAt: {
            type: Date, // Expiry of OTP
          },
        },
        usedAmount: {
          type: Number, // Tracks the total amount redeemed by this buyer
          default: 0,
        },
        remainingBalance: {
          type: Number, // Tracks the balance after redeeming an amount
        },
        redemptionHistory: [
          {
            redeemedAmount: {
              type: Number,
              required: true,
            },
            redemptionDate: {
              type: Date,
              default: Date.now,
            },
            originalAmount: {
              type: Number,
              required: true,
            },
            remainingAmount: {
              type: Number, // New field for tracking remaining balance
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GiftCard", giftCardSchema);
