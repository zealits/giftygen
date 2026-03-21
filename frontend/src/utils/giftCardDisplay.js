import { formatCurrency } from "./currency";

/**
 * Mirrors backend `isDailyPassGiftCard` so listing/detail UI and wallet POST
 * stay consistent when Mongo docs lack templateType (legacy) but have tags/config.
 */
export function isDailyPassCard(card) {
  if (!card) return false;
  if (card.templateType === "dailyFree") return true;
  if (card.isFreeClaimable === true) return true;
  const cfg = card.dailyFreeConfig;
  if (cfg && typeof cfg === "object" && !Array.isArray(cfg)) {
    if (cfg.rewardType && ["PERCENT", "FIXED", "FREE_ITEM"].includes(cfg.rewardType)) return true;
    if (cfg.minCartValue != null && cfg.minCartValue !== "") return true;
    if (cfg.dailyQuota != null) return true;
  }
  const tagSources = [...(Array.isArray(card.tags) ? card.tags : []), card.giftCardTag]
    .filter(Boolean)
    .map((t) => String(t).toLowerCase());
  if (tagSources.some((t) => t.includes("daily"))) return true;

  const amountNum = card.amount != null && card.amount !== "" ? Number(card.amount) : NaN;
  const claimPriceNum = Number(card.claimPrice);
  const looksLikePassText = `${card.giftCardName || ""} ${card.giftCardTag || ""} ${card.description || ""}`
    .toLowerCase()
    .match(/\bdaily\b|\bpass\b|\bfree pass\b/);
  if (Number.isFinite(amountNum) && amountNum <= 0) {
    if ((Number.isFinite(claimPriceNum) && claimPriceNum === 0) || looksLikePassText) return true;
  }
  if ((!Number.isFinite(amountNum) || amountNum <= 0) && card.isFreeClaimable === true) return true;
  return false;
}

/** Offer line for cards / wallet-style copy (uses site currency formatter). */
export function getDailyPassOfferText(card) {
  const cfg = card?.dailyFreeConfig || {};
  const minCart = Number(cfg.minCartValue) || 0;
  if (cfg.rewardType === "PERCENT" && cfg.rewardPercent != null && cfg.rewardPercent !== "") {
    return `${cfg.rewardPercent}% OFF on orders above ${formatCurrency(minCart, "INR")}`;
  }
  if (cfg.rewardType === "FIXED" && cfg.rewardFixedAmount != null && cfg.rewardFixedAmount !== "") {
    return `Flat ${formatCurrency(cfg.rewardFixedAmount, "INR")} OFF on orders above ${formatCurrency(minCart, "INR")}`;
  }
  if (cfg.rewardType === "FREE_ITEM" && cfg.rewardItemSku) {
    return `Free ${cfg.rewardItemSku} on orders above ${formatCurrency(minCart, "INR")}`;
  }
  return "Daily Pass offer";
}
