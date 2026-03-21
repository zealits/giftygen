/**
 * Shared helpers for Google Wallet + Apple Wallet pass copy.
 * Daily Pass cards may omit templateType on legacy docs — use multiple signals.
 */

function isDailyPassGiftCard(doc) {
  if (!doc) return false;
  if (doc.templateType === "dailyFree") return true;
  if (doc.isFreeClaimable === true) return true;
  const cfg = doc.dailyFreeConfig;
  if (cfg && typeof cfg === "object") {
    if (cfg.rewardType && ["PERCENT", "FIXED", "FREE_ITEM"].includes(cfg.rewardType)) return true;
    if (cfg.minCartValue != null && cfg.minCartValue !== "") return true;
    if (cfg.dailyQuota != null) return true;
  }
  // UI often tags Daily Pass with a "Daily" badge even when templateType was not saved.
  const tagSources = [...(Array.isArray(doc.tags) ? doc.tags : []), doc.giftCardTag]
    .filter(Boolean)
    .map((t) => String(t).toLowerCase());
  if (tagSources.some((t) => t.includes("daily"))) return true;

  // Legacy fallback: many early Daily Pass docs were saved without template fields.
  const amountNum = doc.amount != null && doc.amount !== "" ? Number(doc.amount) : NaN;
  const claimPriceNum = Number(doc.claimPrice);
  const looksLikePassText = `${doc.giftCardName || ""} ${doc.giftCardTag || ""} ${doc.description || ""}`
    .toLowerCase()
    .match(/\bdaily\b|\bpass\b|\bfree pass\b/);
  if (Number.isFinite(amountNum) && amountNum <= 0) {
    if ((Number.isFinite(claimPriceNum) && claimPriceNum === 0) || looksLikePassText) return true;
  }
  // amount omitted / NaN but clearly a free-claim pass
  if ((!Number.isFinite(amountNum) || amountNum <= 0) && doc.isFreeClaimable === true) return true;
  return false;
}

function formatInrPlain(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return String(n ?? "");
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * One-line offer text for wallet UI (matches product copy).
 */
function formatDailyPassOfferText(dailyCfg) {
  if (!dailyCfg || typeof dailyCfg !== "object") return "Daily Pass offer";
  const minCart = Number(dailyCfg.minCartValue) || 0;
  const minStr = formatInrPlain(minCart);
  if (dailyCfg.rewardType === "PERCENT" && dailyCfg.rewardPercent != null && dailyCfg.rewardPercent !== "") {
    return `${dailyCfg.rewardPercent}% OFF on orders above ${minStr}`;
  }
  if (dailyCfg.rewardType === "FIXED" && dailyCfg.rewardFixedAmount != null && dailyCfg.rewardFixedAmount !== "") {
    return `Flat ${formatInrPlain(dailyCfg.rewardFixedAmount)} OFF on orders above ${minStr}`;
  }
  if (dailyCfg.rewardType === "FREE_ITEM" && dailyCfg.rewardItemSku) {
    return `Free ${dailyCfg.rewardItemSku} on orders above ${minStr}`;
  }
  return `Offer unlocks on orders above ${minStr}`;
}

/**
 * Shorter line for tight Apple / Google subheaders.
 */
function formatDailyPassOfferShort(dailyCfg) {
  const full = formatDailyPassOfferText(dailyCfg);
  return full.length > 90 ? `${full.slice(0, 87)}…` : full;
}

/**
 * Merge DB gift card with optional client hints from POST /generate-wallet-pass.
 * Fixes cases where Mongo doc was created before templateType/dailyFreeConfig existed.
 */
function mergeGiftCardForWalletPass(mongooseDoc, body = {}) {
  const plain =
    mongooseDoc && typeof mongooseDoc.toObject === "function"
      ? mongooseDoc.toObject({ flattenMaps: true })
      : mongooseDoc
        ? JSON.parse(JSON.stringify(mongooseDoc))
        : {};
  let dfc = body.dailyFreeConfig;
  if (typeof dfc === "string") {
    try {
      dfc = JSON.parse(dfc);
    } catch {
      dfc = undefined;
    }
  }
  const merged = { ...plain };
  if (body.templateType === "dailyFree") {
    merged.templateType = "dailyFree";
    merged.isFreeClaimable = true;
  }
  if (dfc && typeof dfc === "object" && !Array.isArray(dfc)) {
    merged.dailyFreeConfig = { ...(plain.dailyFreeConfig || {}), ...dfc };
    const cfgLooksDaily =
      (dfc.rewardType && ["PERCENT", "FIXED", "FREE_ITEM"].includes(dfc.rewardType)) ||
      (dfc.minCartValue != null && dfc.minCartValue !== "") ||
      dfc.dailyQuota != null;
    if (cfgLooksDaily) {
      merged.templateType = "dailyFree";
      merged.isFreeClaimable = true;
    }
  }
  return merged;
}

module.exports = {
  isDailyPassGiftCard,
  formatDailyPassOfferText,
  formatDailyPassOfferShort,
  formatInrPlain,
  mergeGiftCardForWalletPass,
};
