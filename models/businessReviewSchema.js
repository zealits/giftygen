const mongoose = require("mongoose");

const businessReviewSchema = new mongoose.Schema(
  {
    businessSlug: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    reviewerName: { type: String, default: "" },
  },
  { timestamps: true }
);

// Compound index for listing reviews by business
businessReviewSchema.index({ businessSlug: 1, createdAt: -1 });

module.exports = mongoose.model("BusinessReview", businessReviewSchema);
