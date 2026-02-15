import React, { useState } from "react";
import { Share2, MessageCircle, Gift, Check } from "lucide-react";
import "../user/UserLanding.css";
import "./ExampleRestaurant.css";

const giftCards = [
  {
    title: "Everyday Fashion Gift Card",
    tag: "All Occasions",
    amount: 3000,
    discount: 18,
    image:
      "https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "Perfect for birthdays, quick surprises, or just‑because gifts—valid across all casual and workwear collections.",
  },
  {
    title: "Festive Shopping Gift Card",
    tag: "Festive",
    amount: 7000,
    discount: 22,
    image:
      "https://images.pexels.com/photos/5632403/pexels-photo-5632403.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "Ideal for Diwali, Christmas, and wedding seasons; redeemable on outfits, accessories, and curated festive edits.",
  },
  {
    title: "Premium Wardrobe Upgrade",
    tag: "Premium",
    amount: 12000,
    discount: 25,
    image:
      "https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "High‑value card for statement pieces, occasion wear, or complete wardrobe refresh sessions with an in‑store stylist.",
  },
];

const galleryImages = [
  "https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/5632403/pexels-photo-5632403.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/3965545/pexels-photo-3965545.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1081685/pexels-photo-1081685.jpeg?auto=compress&cs=tinysrgb&w=800",
];

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "giftcards", label: "Gift Cards" },
  { id: "reviews", label: "Reviews" },
  { id: "photos", label: "Photos" },
  { id: "collections", label: "Collections" },
];

const ExampleRetail = () => {
  const [activeTab, setActiveTab] = useState("giftcards");
  const [photoFilter, setPhotoFilter] = useState("all");

  const scrollToMain = () => {
    const el = document.querySelector(".venue-main");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleTabClick = (id) => {
    setActiveTab(id);
    scrollToMain();
  };

  return (
    <div className="venue-page">
      <header className="venue-header">
        <div className="venue-header-inner">
          <div className="venue-header-left">
            <div className="venue-header-title-row">
              <img
                src={galleryImages[0]}
                alt="Nova Streetwear Co."
                className="venue-restaurant-logo"
              />
              <h1 className="venue-restaurant-name">Nova Streetwear Co.</h1>
            </div>
            <p className="venue-cuisine">Online + In-store · Free Size Exchanges · Easy Gifting</p>
            <p className="venue-address">
              Pan-India · Flagship stores in Mumbai & Bengaluru
            </p>
            <div className="venue-meta-row">
              <span className="venue-status-badge">Free delivery above ₹999</span>
              <span className="venue-meta">
                Instant digital delivery <span className="venue-meta-i">ⓘ</span>
              </span>
              <span className="venue-meta">| ₹2,500 avg order</span>
            </div>
            <p className="venue-disclaimer">
              * Redeemable on website, app, and flagship stores. Standard return policy applies.
            </p>
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
            <div className="venue-rating-box">
              <span className="venue-rating-star">4.7★</span>
              <span className="venue-rating-count">1.2k Customer Ratings</span>
            </div>
            <div className="venue-rating-box">
              <span className="venue-rating-star">4.8★</span>
              <span className="venue-rating-count">456 Gift Card Reviews</span>
            </div>
          </div>
        </div>
      </header>

      <section className="venue-gallery">
        <div className="venue-gallery-main">
          <img src={galleryImages[0]} alt="Nova Streetwear Co." />
        </div>
        <div className="venue-gallery-top">
          <img src={galleryImages[1]} alt="Festive" />
        </div>
        <div className="venue-gallery-bottom">
          <img src={galleryImages[2]} alt="Premium" />
          <span className="venue-gallery-overlay">View Gallery</span>
        </div>
      </section>

      <nav className="venue-tabs">
        {TABS.map((tab) => (
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
                <section className="venue-card">
                  <h3 className="venue-card-title">Shoppers Love This Brand For</h3>
                  <p className="venue-card-text">
                    Redeemable online & in-store, free first exchange, new drops every month, gift cards across
                    clothing, footwear & accessories, instant digital delivery, size-friendly policies
                  </p>
                </section>
                <section className="venue-card">
                  <h3 className="venue-card-title">Average Order</h3>
                  <p className="venue-cost">₹2,500 – ₹4,500 per transaction</p>
                  <p className="venue-card-muted">Usable across website, app, and flagship stores</p>
                  <p className="venue-card-muted">No additional convenience fee</p>
                </section>
                <section className="venue-card">
                  <h3 className="venue-card-title">Details</h3>
                  <div className="venue-more-info">
                    {["Online shopping", "In-store redeem", "Free exchanges", "Digital delivery", "Scheduled gifting", "Balance carries over"].map(
                      (item) => (
                        <span key={item} className="venue-more-info-item">
                          <Check size={16} />
                          {item}
                        </span>
                      )
                    )}
                  </div>
                </section>
              </>
            )}

            {activeTab === "giftcards" && (
              <section className="venue-giftcards">
                <h3 className="venue-card-title">Gift Cards from Nova Streetwear Co.</h3>
                <p className="venue-card-muted" style={{ marginBottom: 20 }}>
                  Retail-style gift cards that work like store credit—delivered instantly as digital cards.
                </p>
                <div className="purchase-card-container venue-giftcards-grid">
                  {giftCards.map((card) => (
                    <article key={card.title} className="purchase-card modern-card venue-giftcard">
                      <div className="purchase-card-image modern-card-image">
                        <img src={card.image} alt={card.title} loading="lazy" />
                        <div className="card-image-overlay" />
                        {card.tag && (
                          <div className="purchase-card-tag modern-tag">{card.tag}</div>
                        )}
                        <div className="business-card-badge modern-badge">
                          <span className="business-badge-text">Nova Streetwear Co.</span>
                        </div>
                      </div>
                      <div className="purchase-card-content modern-card-content">
                        <h3 className="purchase-card-title modern-card-title">{card.title}</h3>
                        <p className="purchase-card-description modern-card-description">{card.description}</p>
                        <div className="purchase-card-info modern-card-info">
                          <div className="price-section">
                            <span className="purchase-card-price modern-price">
                              ₹ {card.amount.toLocaleString("en-IN")}
                            </span>
                            <span className="price-label">Gift value</span>
                          </div>
                          <div className="discount-section">
                            <span className="purchase-card-discount modern-discount">{card.discount}% OFF</span>
                          </div>
                        </div>
                        <button type="button" className="purchase-card-button modern-card-button venue-buy-btn">
                          <Gift size={18} />
                          Buy now
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "reviews" && (
              <section className="venue-card">
                <h3 className="venue-card-title">Reviews</h3>
                <p className="venue-card-text">
                  "Love the quality and fits. Gift cards are so easy—sent one to my sister for her birthday." — Kavya R.
                </p>
                <p className="venue-card-text">
                  "Used the festive card during Diwali sale. Redeemed online and the balance carried over." — Nikhil P.
                </p>
                <p className="venue-card-muted">See all 1.2k reviews</p>
              </section>
            )}

            {activeTab === "photos" && (
              <section className="venue-photos">
                <h3 className="venue-photos-title">Nova Streetwear Co. Collections</h3>
                <div className="venue-photo-filters">
                  {["All (28)", "Casual (12)", "Festive (16)"].map((f) => (
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
                <div className="venue-photos-grid">
                  {galleryImages.map((src, i) => (
                    <div key={i} className="venue-photo-item">
                      <img src={src} alt={`Gallery ${i + 1}`} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "collections" && (
              <section className="venue-card">
                <h3 className="venue-card-title">Shop by Category</h3>
                <div className="venue-cuisine-tags">
                  <span className="venue-cuisine-tag">Tees</span>
                  <span className="venue-cuisine-tag">Jackets</span>
                  <span className="venue-cuisine-tag">Cargos</span>
                  <span className="venue-cuisine-tag">Accessories</span>
                </div>
                <div className="venue-menu-preview">
                  <div className="venue-menu-list">
                    <p><strong>CASUAL & WORKWEAR</strong> — Minimal silhouettes, everyday comfort, bold colours</p>
                    <p><strong>FESTIVE EDITS</strong> — Diwali, Christmas, wedding season—outfits & accessories</p>
                    <p><strong>FOOTWEAR</strong> — Sneakers, loafers, and lifestyle shoes to complete the look</p>
                    <p><strong>PREMIUM</strong> — Statement pieces, occasion wear, in-store stylist sessions</p>
                  </div>
                </div>
                <a href="#" className="venue-see-all">Browse all collections ►</a>
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-bottom">
          <p>© 2025 Nova Streetwear Co. All rights reserved. Powered by Giftygen.</p>
        </div>
      </footer>
    </div>
  );
};

export default ExampleRetail;
