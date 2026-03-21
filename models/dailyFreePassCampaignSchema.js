const mongoose = require("mongoose");

const dailyFreePassCampaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    businessSlug: {
      type: String,
      index: true,
    },
    type: {
      type: String,
      enum: ["DAILY_FREE_PASS"],
      default: "DAILY_FREE_PASS",
      immutable: true,
    },
    dailyQuota: {
      type: Number,
      required: true,
      min: 1,
    },
    maxPerCustomerPerDay: {
      type: Number,
      default: 1,
      min: 1,
    },
    globalStartDate: {
      type: Date,
      required: true,
    },
    globalEndDate: {
      type: Date,
      required: true,
    },
    validDaysFromIssue: {
      type: Number,
      required: true,
      min: 1,
    },
    minCartValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    rewardType: {
      type: String,
      enum: ["PERCENT", "FIXED", "FREE_ITEM"],
      required: true,
    },
    rewardValue: {
      // percentage for PERCENT, amount for FIXED
      type: Number,
      required: function () {
        return this.rewardType === "PERCENT" || this.rewardType === "FIXED";
      },
      min: 0,
    },
    rewardItemSku: {
      // identifier for the free item, when rewardType === "FREE_ITEM"
      type: String,
    },
    eligibleSegment: {
      type: String,
      enum: ["ALL", "NEW_CUSTOMERS", "APP_ONLY"],
      default: "ALL",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "PAUSED", "ENDED"],
      default: "ACTIVE",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

dailyFreePassCampaignSchema.index({ businessSlug: 1, status: 1 });
dailyFreePassCampaignSchema.index({ globalStartDate: 1, globalEndDate: 1 });

module.exports = mongoose.model("DailyFreePassCampaign", dailyFreePassCampaignSchema);

