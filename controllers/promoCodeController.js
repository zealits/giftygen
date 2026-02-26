const PromoCode = require("../models/promoCodeSchema");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHander = require("../utils/errorhander");

// ── SuperAdmin: Create promo code ──────────────────────────────────────────
exports.createPromoCode = catchAsyncErrors(async (req, res, next) => {
    const { code, description, discountPercent, applicablePlanTypes, maxUses, expiresAt } = req.body;

    if (!code) return next(new ErrorHander("Promo code is required", 400));

    const existing = await PromoCode.findOne({ code: code.toUpperCase().trim() });
    if (existing) return next(new ErrorHander("Promo code already exists", 409));

    const promo = await PromoCode.create({
        code: code.toUpperCase().trim(),
        description: description || "",
        discountPercent: discountPercent || 60,
        applicablePlanTypes: applicablePlanTypes || [],
        maxUses: maxUses || null,
        expiresAt: expiresAt || null,
        createdBy: req.user.id,
    });

    res.status(201).json({ success: true, promoCode: promo });
});

// ── SuperAdmin: List all promo codes ───────────────────────────────────────
exports.getAllPromoCodes = catchAsyncErrors(async (req, res) => {
    const promoCodes = await PromoCode.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, promoCodes });
});

// ── SuperAdmin: Toggle active/inactive ─────────────────────────────────────
exports.togglePromoCode = catchAsyncErrors(async (req, res, next) => {
    const promo = await PromoCode.findById(req.params.id);
    if (!promo) return next(new ErrorHander("Promo code not found", 404));

    promo.isActive = !promo.isActive;
    await promo.save();

    res.status(200).json({ success: true, promoCode: promo });
});

// ── SuperAdmin: Delete promo code ──────────────────────────────────────────
exports.deletePromoCode = catchAsyncErrors(async (req, res, next) => {
    const promo = await PromoCode.findById(req.params.id);
    if (!promo) return next(new ErrorHander("Promo code not found", 404));

    await promo.deleteOne();
    res.status(200).json({ success: true, message: "Promo code deleted" });
});

// ── Public: Validate promo code ────────────────────────────────────────────
exports.validatePromoCode = catchAsyncErrors(async (req, res, next) => {
    const { code, planType } = req.body;
    if (!code) return next(new ErrorHander("Promo code is required", 400));

    const promo = await PromoCode.findOne({ code: code.toUpperCase().trim() });

    if (!promo) {
        return res.status(200).json({ success: false, message: "Invalid promo code" });
    }

    if (!promo.isActive) {
        return res.status(200).json({ success: false, message: "This promo code is no longer active" });
    }

    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
        return res.status(200).json({ success: false, message: "This promo code has expired" });
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
        return res.status(200).json({ success: false, message: "This promo code has reached its maximum usage limit" });
    }

    // Check plan type restriction
    if (promo.applicablePlanTypes.length > 0 && planType && !promo.applicablePlanTypes.includes(planType)) {
        return res.status(200).json({ success: false, message: "This promo code is not valid for the selected plan" });
    }

    res.status(200).json({
        success: true,
        message: "Promo code applied!",
        promoCode: {
            code: promo.code,
            discountPercent: promo.discountPercent,
            description: promo.description,
        },
    });
});
