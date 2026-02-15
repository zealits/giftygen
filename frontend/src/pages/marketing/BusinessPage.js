import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Share2, MessageCircle, Gift, Check } from "lucide-react";
import { fetchBusinessBySlug } from "../../services/Actions/authActions";
import { listGiftCards } from "../../services/Actions/giftCardActions";
import { formatCurrency } from "../../utils/currency";
import SEO from "../../components/SEO";
import GiftCardForm from "../user/GiftCardForm";
import "../user/UserLanding.css";
import "./ExampleRestaurant.css";

const INDUSTRY_TAB_MAP = {
  "Restaurant And Fine Dining": { id: "menu", label: "Menu" },
  "Hotels & Resorts": { id: "rooms", label: "Rooms" },
  "Fitness and Wellness memberships": { id: "classes", label: "Classes" },
  "Retail & E-commerce": { id: "collections", label: "Collections" },
  "Beauty and Personal care": { id: "services", label: "Services" },
  "Seasonal Gifting": { id: "campaigns", label: "Campaigns" },
};

const BusinessPage = () => {
  const { businessSlug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { business, loading: businessLoading } = useSelector((state) => state.business);
  const { giftCards, loading: cardsLoading } = useSelector((state) => state.giftCardList);

  const [activeTab, setActiveTab] = useState("giftcards");
  const [photoFilter, setPhotoFilter] = useState("all");
  const [showGiftCardForm, setShowGiftCardForm] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    if (businessSlug) {
      dispatch(fetchBusinessBySlug(businessSlug));
      dispatch(listGiftCards("", businessSlug));
    }
  }, [dispatch, businessSlug]);

  const scrollToMain = () => {
    const el = document.querySelector(".venue-main");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleTabClick = (id) => {
    setActiveTab(id);
    scrollToMain();
  };

  const handleBuyNow = (e, giftCardName, amount, discount, id) => {
    e.stopPropagation();
    setSelectedCard({ giftCardName, amount, discount, id });
    setShowGiftCardForm(true);
  };

  const handleCardClick = (cardId, event) => {
    if (event.target.closest(".purchase-card-button")) return;
    navigate(`/${businessSlug}/gift-card/${cardId}`);
  };

  const pc = business?.pageCustomization || {};
  const customTab = business?.industry ? INDUSTRY_TAB_MAP[business.industry] : null;
  const baseTabs = [
    { id: "overview", label: "Overview" },
    { id: "giftcards", label: "Gift Cards" },
    { id: "reviews", label: "Reviews" },
    { id: "photos", label: "Photos" },
  ];
  const tabs = customTab ? [...baseTabs, customTab] : baseTabs;

  const galleryImages = business?.galleryImages?.length
    ? business.galleryImages
    : business?.logoUrl
      ? [business.logoUrl]
      : [];

  const addressParts = [
    business?.address?.street,
    business?.address?.city,
    business?.address?.state,
    business?.address?.zipCode,
  ].filter(Boolean);
  const addressText = addressParts.join(", ");

  const activeCards =
    giftCards && Array.isArray(giftCards)
      ? giftCards.filter((c) => c.status !== "expired" && (!c.expirationDate || new Date(c.expirationDate) >= new Date()))
      : [];

  if (businessLoading && !business) {
    return (
      <div className="venue-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="venue-page" style={{ padding: 40, textAlign: "center" }}>
        <h2>Business not found</h2>
        <p>This business page could not be loaded.</p>
      </div>
    );
  }

  const pageTitle = `${business.name} - Gift Cards | GiftyGen`;
  const pageDescription = `Browse and purchase digital gift cards from ${business.name}.`;
  const pageUrl = `${window.location.origin}/${businessSlug}/giftcards`;

  return (
    <div className="venue-page">
      <SEO title={pageTitle} description={pageDescription} url={pageUrl} />

      <header className="venue-header">
        <div className="venue-header-inner">
          <div className="venue-header-left">
            <div className="venue-header-title-row">
              {(business.logoUrl || galleryImages[0]) && (
                <img
                  src={business.logoUrl || galleryImages[0]}
                  alt={business.name}
                  className="venue-restaurant-logo"
                />
              )}
              <h1 className="venue-restaurant-name">{business.name}</h1>
            </div>
            {pc.subtitle && <p className="venue-cuisine">{pc.subtitle}</p>}
            {addressText && <p className="venue-address">{addressText}</p>}
            <div className="venue-meta-row">
              {pc.statusBadge && <span className="venue-status-badge">{pc.statusBadge}</span>}
              {pc.timings && (
                <span className="venue-meta">
                  {pc.timings} <span className="venue-meta-i">ⓘ</span>
                </span>
              )}
              {pc.priceRange && <span className="venue-meta">| {pc.priceRange}</span>}
              {business.phone && (
                <a href={`tel:${business.phone.replace(/\s/g, "")}`} className="venue-phone">
                  {business.phone}
                </a>
              )}
            </div>
            {pc.disclaimer && <p className="venue-disclaimer">{pc.disclaimer}</p>}
            <div className="venue-actions">
              <button type="button" className="venue-action-btn">
                <Share2 size={18} />
                Share
              </button>
              <button type="button" className="venue-action-btn" onClick={() => handleTabClick("reviews")}>
                <MessageCircle size={18} />
                Reviews
              </button>
            </div>
          </div>
          <div className="venue-header-right">
            {pc.ratingPrimary && (
              <div className="venue-rating-box">
                <span className="venue-rating-star">{pc.ratingPrimary}</span>
                <span className="venue-rating-count">{pc.ratingPrimaryCount || ""}</span>
              </div>
            )}
            {pc.ratingSecondary && (
              <div className="venue-rating-box">
                <span className="venue-rating-star">{pc.ratingSecondary}</span>
                <span className="venue-rating-count">{pc.ratingSecondaryCount || ""}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {galleryImages.length > 0 && (
        <section className={`venue-gallery ${galleryImages.length === 1 ? "venue-gallery-single" : ""}`}>
          <div className="venue-gallery-main">
            <img src={galleryImages[0]} alt={business.name} />
          </div>
          {galleryImages.length >= 2 && (
            <div className="venue-gallery-top">
              <img src={galleryImages[1]} alt="" />
            </div>
          )}
          {galleryImages.length >= 3 && (
            <div className="venue-gallery-bottom">
              <img src={galleryImages[2]} alt="" />
              <span className="venue-gallery-overlay">View Gallery</span>
            </div>
          )}
        </section>
      )}

      <nav className="venue-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`venue-tab ${activeTab === tab.id ? "venue-tab--active" : ""}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="venue-main">
        <div className="venue-layout">
          <div className="venue-content">
            {activeTab === "overview" && (
              <>
                {pc.knownFor && (
                  <section className="venue-card">
                    <h3 className="venue-card-title">Known For</h3>
                    <p className="venue-card-text">{pc.knownFor}</p>
                  </section>
                )}
                {pc.priceRange && (
                  <section className="venue-card">
                    <h3 className="venue-card-title">Starting From</h3>
                    <p className="venue-cost">{pc.priceRange}</p>
                  </section>
                )}
                {Array.isArray(pc.amenities) && pc.amenities.length > 0 && (
                  <section className="venue-card">
                    <h3 className="venue-card-title">Amenities</h3>
                    <div className="venue-more-info">
                      {pc.amenities.map((item) => (
                        <span key={item} className="venue-more-info-item">
                          <Check size={16} />
                          {item}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
                {business.description && !pc.knownFor && (
                  <section className="venue-card">
                    <h3 className="venue-card-title">About</h3>
                    <p className="venue-card-text">{business.description}</p>
                  </section>
                )}
              </>
            )}

            {activeTab === "giftcards" && (
              <section className="venue-giftcards">
                <h3 className="venue-card-title">Gift Cards from {business.name}</h3>
                <p className="venue-card-muted" style={{ marginBottom: 20 }}>
                  Delivered instantly as digital cards.
                </p>
                {cardsLoading && activeCards.length === 0 ? (
                  <p>Loading gift cards...</p>
                ) : activeCards.length === 0 ? (
                  <p className="venue-card-muted">No gift cards available yet.</p>
                ) : (
                  <div className="purchase-card-container venue-giftcards-grid">
                    {activeCards.map((card) => (
                      <article
                        key={card._id}
                        className="purchase-card modern-card venue-giftcard"
                        onClick={(e) => handleCardClick(card._id, e)}
                      >
                        <div className="purchase-card-image modern-card-image">
                          <img src={card.giftCardImg} alt={card.giftCardName} loading="lazy" />
                          <div className="card-image-overlay" />
                          {card.giftCardTag && (
                            <div className="purchase-card-tag modern-tag">{card.giftCardTag}</div>
                          )}
                          <div className="business-card-badge modern-badge">
                            <span className="business-badge-text">{business.name}</span>
                          </div>
                        </div>
                        <div className="purchase-card-content modern-card-content">
                          <h3 className="purchase-card-title modern-card-title">{card.giftCardName}</h3>
                          <p className="purchase-card-description modern-card-description">{card.description}</p>
                          <div className="purchase-card-info modern-card-info">
                            <div className="price-section">
                              <span className="purchase-card-price modern-price">
                                {formatCurrency(card.amount, "INR")}
                              </span>
                              <span className="price-label">Gift value</span>
                            </div>
                            <div className="discount-section">
                              <span className="purchase-card-discount modern-discount">{card.discount}% OFF</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="purchase-card-button modern-card-button venue-buy-btn"
                            onClick={(e) => handleBuyNow(e, card.giftCardName, card.amount, card.discount, card._id)}
                          >
                            <Gift size={18} />
                            Buy now
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === "reviews" && (
              <section className="venue-card">
                <h3 className="venue-card-title">Reviews</h3>
                <p className="venue-card-muted">Reviews coming soon.</p>
              </section>
            )}

            {activeTab === "photos" && (
              <section className="venue-photos">
                <h3 className="venue-photos-title">{business.name} Photos</h3>
                {Array.isArray(pc.photoFilterLabels) && pc.photoFilterLabels.length > 0 && (
                  <div className="venue-photo-filters">
                    {pc.photoFilterLabels.map((f) => (
                      <button
                        key={f}
                        type="button"
                        className={`venue-photo-filter ${photoFilter === f.split(" ")[0].toLowerCase() ? "venue-photo-filter--active" : ""}`}
                        onClick={() => setPhotoFilter(f.split(" ")[0].toLowerCase())}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
                <div className="venue-photos-grid">
                  {galleryImages.map((src, i) => (
                    <div key={i} className="venue-photo-item">
                      <img src={src} alt={`Gallery ${i + 1}`} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {customTab && activeTab === customTab.id && (
              <section className="venue-card">
                <h3 className="venue-card-title">{customTab.label}</h3>
                {Array.isArray(pc.tags) && pc.tags.length > 0 && (
                  <div className="venue-cuisine-tags">
                    {pc.tags.map((tag) => (
                      <span key={tag} className="venue-cuisine-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {pc.customTabContent ? (
                  <div className="venue-menu-preview">
                    <div className="venue-menu-list">
                      {pc.customTabContent.split("\n").map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="venue-card-muted">Content coming soon.</p>
                )}
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-bottom">
          <p>© 2025 {business.name}. All rights reserved. Powered by Giftygen.</p>
        </div>
      </footer>

      {showGiftCardForm && selectedCard && (
        <GiftCardForm
          giftCardName={selectedCard.giftCardName}
          amount={selectedCard.amount}
          discount={selectedCard.discount}
          id={selectedCard.id}
          onClose={() => {
            setShowGiftCardForm(false);
            setSelectedCard(null);
          }}
        />
      )}
    </div>
  );
};

export default BusinessPage;
