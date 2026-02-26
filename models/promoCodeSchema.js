const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Promo code is required"],
            unique: true,
            uppercase: true,
            trim: true,
            index: true,
        },
        description: { type: String, default: "" },
        discountPercent: {
            type: Number,
            required: true,
            min: 1,
            max: 100,
            default: 60,
        },
        // Which plan type this promo applies to (null = any plan)
        applicablePlanTypes: {
            type: [String],
            default: [],
        },
        maxUses: { type: Number, default: null }, // null = unlimited
        usedCount: { type: Number, default: 0 },
        usedBy: [
            {
                businessSlug: String,
                usedAt: { type: Date, default: Date.now },
            },
        ],
        isActive: { type: Boolean, default: true },
        expiresAt: { type: Date, default: null },
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: "SuperAdmin",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("PromoCode", promoCodeSchema);
