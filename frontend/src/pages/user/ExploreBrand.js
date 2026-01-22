import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Explore.css";
import logo from "../../assets/giftygen_logo.svg";
import logoWhiteBg from "../../assets/giftgen_whitebg_logo.png";
import { getIndustryData } from "../../data/exploreData";
import {
  ArrowLeft,
  Gift,
  CreditCard,
  Sparkles,
  CheckCircle,
  Star,
} from "lucide-react";

// Static gift card data - in production, this would come from an API
const generateGiftCards = (brandId, brandName) => {
  const amounts = [500, 1000, 2000, 5000, 10000];
  return amounts.map((amount, index) => ({
    id: `${brandId}-gc-${index + 1}`,
    name: `${brandName} Gift Card`,
    amount: amount,
    description: `Perfect gift for any occasion. Valid for 12 months.`,
    image: null, // You can add images later
    validUntil: "12 months from purchase",
    features: [
      "Instant delivery via email",
      "No expiration date",
      "Redeemable at all locations",
      "Perfect for gifting",
    ],
  }));
};

function ExploreBrand() {
  const { categoryId, brandId } = useParams();
  const navigate = useNavigate();
  const [theme] = useState(() => localStorage.getItem("giftygen_theme") || "dark");

  const categoryData = getIndustryData(categoryId);

  if (!categoryData) {
    return (
      <div className="explore-page" data-theme={theme}>
        <div className="explore-empty">
          <p>Category not found</p>
          <button onClick={() => navigate("/explore")} className="explore-btn">
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  // Find the brand in the data
  let brand = null;
  const locations = categoryData.locations || categoryData.categories || {};
  
  for (const locationKey of Object.keys(locations)) {
    brand = locations[locationKey].find((b) => b.id === brandId);
    if (brand) break;
  }

  if (!brand) {
    return (
      <div className="explore-page" data-theme={theme}>
        <div className="explore-empty">
          <p>Brand not found</p>
          <button
            onClick={() => navigate(`/explore/${categoryId}`)}
            className="explore-btn"
          >
            Back to {categoryData.name}
          </button>
        </div>
      </div>
    );
  }

  const giftCards = generateGiftCards(brand.id, brand.name);

  const handleGiftCardClick = (giftCardId) => {
    // Navigate to gift card details page
    navigate(`/gift-card/${giftCardId}`);
  };

  return (
    <div className="explore-page" data-theme={theme}>
      {/* Navigation */}
      <nav className="explore-nav">
        <div className="explore-nav__container">
          <div
            className="explore-nav__brand"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            <img
              src={theme === "light" ? logoWhiteBg : logo}
              alt="GiftyGen"
              className="explore-nav__logo"
            />
          </div>
          <div className="explore-nav__actions">
            <button
              className="explore-nav__link"
              onClick={() => navigate("/explore")}
            >
              Explore
            </button>
            <button
              className="explore-nav__link"
              onClick={() => navigate("/")}
            >
              Home
            </button>
            <button
              className="explore-nav__link explore-nav__link--primary"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Brand Header */}
      <section className="explore-brand-header">
        <div className="explore-brand-header__container">
          <button
            className="explore-back-btn"
            onClick={() => navigate(`/explore/${categoryId}`)}
          >
            <ArrowLeft size={20} />
            Back to {categoryData.name}
          </button>

          <div className="explore-brand-header__content">
            <div className="explore-brand-header__info">
              <h1 className="explore-brand-header__title">{brand.name}</h1>
              {brand.description && (
                <p className="explore-brand-header__description">
                  {brand.description}
                </p>
              )}
              {brand.location && (
                <div className="explore-brand-header__location">
                  <span>{brand.location}</span>
                </div>
              )}
            </div>
            <div className="explore-brand-header__badge">
              <Gift size={32} />
            </div>
          </div>
        </div>
      </section>

      {/* Gift Cards Section */}
      <section className="explore-giftcards">
        <div className="explore-giftcards__container">
          <div className="explore-section__header">
            <h2 className="explore-section__title">Available Gift Cards</h2>
            <p className="explore-section__subtitle">
              Choose the perfect gift card amount for your needs
            </p>
          </div>

          <div className="explore-giftcards__grid">
            {giftCards.map((giftCard) => (
              <div
                key={giftCard.id}
                className="explore-giftcard-card"
                onClick={() => handleGiftCardClick(giftCard.id)}
              >
                <div className="explore-giftcard-card__header">
                  <div className="explore-giftcard-card__icon">
                    <CreditCard size={24} />
                  </div>
                  <div className="explore-giftcard-card__amount">
                    <span className="explore-giftcard-card__currency">₹</span>
                    <span className="explore-giftcard-card__value">
                      {giftCard.amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="explore-giftcard-card__body">
                  <h3 className="explore-giftcard-card__title">
                    {giftCard.name}
                  </h3>
                  <p className="explore-giftcard-card__description">
                    {giftCard.description}
                  </p>

                  <div className="explore-giftcard-card__features">
                    {giftCard.features.map((feature, index) => (
                      <div
                        key={index}
                        className="explore-giftcard-card__feature"
                      >
                        <CheckCircle size={16} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="explore-giftcard-card__validity">
                    <span className="explore-giftcard-card__validity-label">
                      Valid for:
                    </span>
                    <span className="explore-giftcard-card__validity-value">
                      {giftCard.validUntil}
                    </span>
                  </div>
                </div>

                <div className="explore-giftcard-card__footer">
                  <button className="explore-giftcard-card__btn">
                    View Details
                    <ArrowLeft size={16} style={{ transform: "rotate(180deg)" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ExploreBrand;
