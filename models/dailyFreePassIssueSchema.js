const mongoose = require("mongoose");

const dailyFreePassIssueSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyFreePassCampaign",
      required: true,
      index: true,
    },
    businessSlug: {
      type: String,
      index: true,
    },
    customerIdentifier: {
      // flexible identifier: userId, email, or phone as decided by the caller
      type: String,
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "USED", "EXPIRED", "CANCELLED"],
      default: "ACTIVE",
      index: true,
    },
    // Snapshot of reward configuration at time of issue
    rewardType: {
      type: String,
      enum: ["PERCENT", "FIXED", "FREE_ITEM"],
      required: true,
    },
    rewardValue: {
      type: Number,
    },
    rewardItemSku: {
      type: String,
    },
    minCartValue: {
      type: Number,
      default: 0,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

dailyFreePassIssueSchema.index(
  { campaign: 1, customerIdentifier: 1, issuedAt: 1 },
  { name: "campaign_customer_issued_idx" }
);

module.exports = mongoose.model("DailyFreePassIssue", dailyFreePassIssueSchema);

