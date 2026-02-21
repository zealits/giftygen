const BusinessReview = require("../models/businessReviewSchema");
const RestaurantAdmin = require("../models/restaurantAdminSchema");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHander = require("../utils/errorhander");

// GET /api/v1/admin/business/:businessSlug/reviews – list reviews + summary (public)
exports.getReviewsByBusinessSlug = catchAsyncErrors(async (req, res, next) => {
  const { businessSlug } = req.params;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const exists = await RestaurantAdmin.findOne({
    businessSlug,
    isVerified: true,
  }).select("_id");
  if (!exists) {
    return next(new ErrorHander("Business not found", 404));
  }

  const [reviews, total, agg] = await Promise.all([
    BusinessReview.find({ businessSlug })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    BusinessReview.countDocuments({ businessSlug }),
    BusinessReview.aggregate([
      { $match: { businessSlug } },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
  ]);

  const summary = agg[0]
    ? {
        averageRating: Math.round(agg[0].avg * 10) / 10,
        totalCount: agg[0].count,
      }
    : { averageRating: null, totalCount: 0 };

  res.status(200).json({
    success: true,
    reviews,
    summary,
    pagination: { page, limit, total },
  });
});

// POST /api/v1/admin/business/:businessSlug/reviews – create review (public, end-user)
exports.createReview = catchAsyncErrors(async (req, res, next) => {
  const { businessSlug } = req.params;
  const { rating, comment, reviewerName } = req.body;

  const numRating = typeof rating === "string" ? parseInt(rating, 10) : rating;
  if (!Number.isInteger(numRating) || numRating < 1 || numRating > 5) {
    return next(new ErrorHander("Rating must be between 1 and 5", 400));
  }

  const exists = await RestaurantAdmin.findOne({
    businessSlug,
    isVerified: true,
  }).select("_id");
  if (!exists) {
    return next(new ErrorHander("Business not found", 404));
  }

  const review = await BusinessReview.create({
    businessSlug,
    rating: numRating,
    comment: typeof comment === "string" ? comment.trim().slice(0, 2000) : "",
    reviewerName: typeof reviewerName === "string" ? reviewerName.trim().slice(0, 120) : "",
  });

  res.status(201).json({
    success: true,
    review: {
      _id: review._id,
      businessSlug: review.businessSlug,
      rating: review.rating,
      comment: review.comment,
      reviewerName: review.reviewerName,
      createdAt: review.createdAt,
    },
  });
});
