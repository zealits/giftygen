const fs = require("fs");
const path = require("path");

function patchUserLanding(s) {
  if (!s.includes('from "../../utils/giftCardDisplay"')) {
    s = s.replace(
      `import { formatCurrency } from "../../utils/currency";`,
      `import { formatCurrency } from "../../utils/currency";
import { isDailyPassCard, getDailyPassOfferText } from "../../utils/giftCardDisplay";`
    );
  }
  const removeBlock = `  const getDailyPassOfferText = (card) => {
    const cfg = card?.dailyFreeConfig || {};
    const minCart = Number(cfg.minCartValue) || 0;
    if (cfg.rewardType === "PERCENT" && cfg.rewardPercent) {
      return \`\${cfg.rewardPercent}% OFF on orders above \${formatCurrency(minCart, "INR")}\`;
    }
    if (cfg.rewardType === "FIXED" && cfg.rewardFixedAmount) {
      return \`Flat \${formatCurrency(cfg.rewardFixedAmount, "INR")} OFF on orders above \${formatCurrency(minCart, "INR")}\`;
    }
    if (cfg.rewardType === "FREE_ITEM" && cfg.rewardItemSku) {
      return \`Free \${cfg.rewardItemSku} on orders above \${formatCurrency(minCart, "INR")}\`;
    }
    return "Daily Pass offer";
  };

  const { giftCards, loading, error } = useSelector((state) => state.giftCardList);`;

  const replaceBlock = `  const { giftCards, loading, error } = useSelector((state) => state.giftCardList);`;

  if (s.includes(removeBlock)) {
    s = s.replace(removeBlock, replaceBlock);
  }

  s = s.replace(
    `    setSelectedCard({
      giftCardName: card.giftCardName,
      amount: card.amount,
      discount: card.discount,
      id: card._id,
      templateType: card.templateType,
    });`,
    `    setSelectedCard({
      giftCardName: card.giftCardName,
      amount: card.amount,
      discount: card.discount,
      id: card._id,
      templateType: card.templateType,
      dailyFreeConfig: card.dailyFreeConfig,
      isFreeClaimable: card.isFreeClaimable,
      claimPrice: card.claimPrice,
      giftCardTag: card.giftCardTag,
      tags: card.tags,
      description: card.description,
    });`
  );

  s = s.replace(
    `                        if (card.templateType === "dailyFree") {
                          return <span className="purchase-card-price modern-price">Daily Pass</span>;
                        }`,
    `                        if (isDailyPassCard(card)) {
                          return <span className="purchase-card-price modern-price">Daily Pass</span>;
                        }`
  );
  s = s.replace(
    `                      <span className="price-label">{card.templateType === "dailyFree" ? getDailyPassOfferText(card) : "Gift Value"}</span>`,
    `                      <span className="price-label">{isDailyPassCard(card) ? getDailyPassOfferText(card) : "Gift Value"}</span>`
  );
  s = s.replace(
    `                      {card.templateType !== "dailyFree" && card.discount > 0 && (`,
    `                      {!isDailyPassCard(card) && card.discount > 0 && (`
  );
  s = s.replace(
    `                        <span>{outOfStock ? "Out of stock" : card.templateType === "dailyFree" ? "Claim Pass" : "Buy Now"}</span>`,
    `                        <span>{outOfStock ? "Out of stock" : isDailyPassCard(card) ? "Claim Pass" : "Buy Now"}</span>`
  );
  return s;
}

function patchBusinessPage(s) {
  if (!s.includes('from "../../utils/giftCardDisplay"')) {
    s = s.replace(
      `import { formatCurrency } from "../../utils/currency";`,
      `import { formatCurrency } from "../../utils/currency";
import { isDailyPassCard, getDailyPassOfferText } from "../../utils/giftCardDisplay";`
    );
  }
  const oldPrice = `                            <div className="price-section">
                              {(() => {
                                const base = Number(card.amount) || 0;
                                const disc = Number(card.discount) || 0;
                                const hasDiscount = disc > 0 && disc < 100;
                                const final = hasDiscount ? base * (1 - disc / 100) : base;
                                const baseText = formatCurrency(base, "INR");
                                const finalText = formatCurrency(final, "INR");
                                return hasDiscount ? (
                                  <div className="venue-price-row">
                                    <span className="purchase-card-price modern-price modern-price-original">
                                      {baseText}
                                    </span>
                                    <span className="purchase-card-price modern-price modern-price-final">
                                      {finalText}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="purchase-card-price modern-price">{baseText}</span>
                                );
                              })()}
                              <span className="price-label">Gift value</span>
                            </div>`;

  const newPrice = `                            <div className="price-section">
                              {(() => {
                                if (isDailyPassCard(card)) {
                                  return <span className="purchase-card-price modern-price">Daily Pass</span>;
                                }
                                const base = Number(card.amount) || 0;
                                const disc = Number(card.discount) || 0;
                                const hasDiscount = disc > 0 && disc < 100;
                                const final = hasDiscount ? base * (1 - disc / 100) : base;
                                const baseText = formatCurrency(base, "INR");
                                const finalText = formatCurrency(final, "INR");
                                return hasDiscount ? (
                                  <div className="venue-price-row">
                                    <span className="purchase-card-price modern-price modern-price-original">
                                      {baseText}
                                    </span>
                                    <span className="purchase-card-price modern-price modern-price-final">
                                      {finalText}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="purchase-card-price modern-price">{baseText}</span>
                                );
                              })()}
                              <span className="price-label">{isDailyPassCard(card) ? getDailyPassOfferText(card) : "Gift value"}</span>
                            </div>`;

  if (s.includes(oldPrice)) {
    s = s.replace(oldPrice, newPrice);
  } else {
    console.warn("BusinessPage: price block pattern not found — skip or check file");
  }
  s = s.replace(
    `                            <div className="discount-section">
                              {card.discount > 0 && (
                                <span className="purchase-card-discount modern-discount">{card.discount}% OFF</span>
                              )}
                            </div>`,
    `                            <div className="discount-section">
                              {!isDailyPassCard(card) && card.discount > 0 && (
                                <span className="purchase-card-discount modern-discount">{card.discount}% OFF</span>
                              )}
                            </div>`
  );
  return s;
}

function patchGiftCardDetails(s) {
  if (!s.includes('from "../../utils/giftCardDisplay"')) {
    s = s.replace(
      `import { formatCurrency } from "../../utils/currency";`,
      `import { formatCurrency } from "../../utils/currency";
import { isDailyPassCard, getDailyPassOfferText } from "../../utils/giftCardDisplay";`
    );
  }
  s = s.replace(
    `    setSelectedCard({
      giftCardName: giftCard.giftCardName,
      amount: giftCard.amount,
      discount: giftCard.discount,
      id: giftCard._id,
      templateType: giftCard.templateType,
    });`,
    `    setSelectedCard({
      giftCardName: giftCard.giftCardName,
      amount: giftCard.amount,
      discount: giftCard.discount,
      id: giftCard._id,
      templateType: giftCard.templateType,
      dailyFreeConfig: giftCard.dailyFreeConfig,
      isFreeClaimable: giftCard.isFreeClaimable,
      claimPrice: giftCard.claimPrice,
      giftCardTag: giftCard.giftCardTag,
      tags: giftCard.tags,
      description: giftCard.description,
    });`
  );

  const removeLocal = `  const getDailyPassOfferText = (card) => {
    const cfg = card?.dailyFreeConfig || {};
    const minCart = Number(cfg.minCartValue) || 0;
    if (cfg.rewardType === "PERCENT" && cfg.rewardPercent) {
      return \`\${cfg.rewardPercent}% OFF on orders above \${formatCurrency(minCart, "INR")}\`;
    }
    if (cfg.rewardType === "FIXED" && cfg.rewardFixedAmount) {
      return \`Flat \${formatCurrency(cfg.rewardFixedAmount, "INR")} OFF on orders above \${formatCurrency(minCart, "INR")}\`;
    }
    if (cfg.rewardType === "FREE_ITEM" && cfg.rewardItemSku) {
      return \`Free \${cfg.rewardItemSku} on orders above \${formatCurrency(minCart, "INR")}\`;
    }
    return "Daily Pass offer";
  };

  // Handle parallax effect on image`;

  if (s.includes(removeLocal)) {
    s = s.replace(removeLocal, `  // Handle parallax effect on image`);
  }

  s = s.replace(
    `                if (giftCard.templateType === "dailyFree") {
                  return <span className="amount">Daily Pass</span>;
                }`,
    `                if (isDailyPassCard(giftCard)) {
                  return <span className="amount">Daily Pass</span>;
                }`
  );
  s = s.replace(
    `              {giftCard.templateType !== "dailyFree" && giftCard.discount > 0 && (`,
    `              {!isDailyPassCard(giftCard) && giftCard.discount > 0 && (`
  );
  s = s.replace(
    `            {giftCard.templateType === "dailyFree" ? (`,
    `            {isDailyPassCard(giftCard) ? (`
  );
  s = s.replace(
    `              <span className="btn-text">{giftCard.templateType === "dailyFree" ? "Claim Pass" : "Buy Now"}</span>`,
    `              <span className="btn-text">{isDailyPassCard(giftCard) ? "Claim Pass" : "Buy Now"}</span>`
  );
  s = s.replace(
    `                    {card.templateType === "dailyFree"
                      ? getDailyPassOfferText(card)
                      : \`\${formatCurrency(card.amount, "INR")}\${card.discount > 0 ? \` · \${card.discount}% Off\` : ""}\`}`,
    `                    {isDailyPassCard(card)
                      ? getDailyPassOfferText(card)
                      : \`\${formatCurrency(card.amount, "INR")}\${card.discount > 0 ? \` · \${card.discount}% Off\` : ""}\`}`
  );
  return s;
}

function writeFile(rel, content) {
  const full = path.join(__dirname, "..", rel);
  try {
    fs.writeFileSync(full, content);
    console.log("OK", rel);
  } catch (e) {
    const alt = full.replace(/\.js$/, ".updated.js");
    fs.writeFileSync(alt, content);
    console.warn("LOCKED", rel, "-> wrote", path.basename(alt), e.message);
  }
}

const root = path.join(__dirname, "..");

writeFile(
  "frontend/src/pages/user/UserLanding.js",
  patchUserLanding(fs.readFileSync(path.join(root, "frontend/src/pages/user/UserLanding.js"), "utf8"))
);
writeFile(
  "frontend/src/pages/marketing/BusinessPage.js",
  patchBusinessPage(fs.readFileSync(path.join(root, "frontend/src/pages/marketing/BusinessPage.js"), "utf8"))
);
writeFile(
  "frontend/src/pages/user/GiftCardDetails.js",
  patchGiftCardDetails(fs.readFileSync(path.join(root, "frontend/src/pages/user/GiftCardDetails.js"), "utf8"))
);
