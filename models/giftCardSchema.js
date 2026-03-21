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
    tags: {
      type: [String],
      default: undefined,
    },
    quantity: {
      type: Number,
      default: null,
    },
    soldQuantity: {
      type: Number,
      default: 0,
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
    templateType: {
      type: String,
      enum: ["standard", "dailyFree"],
      default: "standard",
      index: true,
    },
    currency: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "draft", "redeemed", "expired", "sold"],
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
    // Optional brand color for Google Wallet pass background
    walletColor: {
      type: String,
    },
    businessSlug: {
      type: String, // which business owns this gift card
      index: true,
    },
    // Configuration flags for campaigns that auto-issue free passes or run promotions
    isFreeClaimable: {
      // when true, this template can be used to issue zero-priced passes
      type: Boolean,
      default: false,
    },
    claimPrice: {
      // amount charged when claiming; keep 0 for Daily Free Pass
      type: Number,
      default: 0,
      min: 0,
    },
    dailyFreeConfig: {
      dailyQuota: {
        type: Number,
        min: 1,
      },
      validDaysFromIssue: {
        type: Number,
        min: 1,
      },
      minCartValue: {
        type: Number,
        min: 0,
      },
      rewardType: {
        type: String,
        enum: ["PERCENT", "FIXED", "FREE_ITEM"],
      },
      rewardPercent: {
        type: Number,
        min: 0,
        max: 100,
      },
      rewardFixedAmount: {
        type: Number,
        min: 0,
      },
      rewardItemSku: {
        type: String,
      },
      customerSegment: {
        type: String,
        enum: ["ALL", "NEW_CUSTOMERS", "APP_ONLY"],
      },
      campaignStartDate: {
        type: Date,
      },
      campaignEndDate: {
        type: Date,
      },
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
        orderSource: {
          type: String,
          enum: ["marketplace", "direct"],
          default: "direct", // Default to direct for existing orders
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
