import React, { useState } from "react";
import { Share2, MessageCircle, Gift, Check } from "lucide-react";
import "../user/UserLanding.css";
import "./ExampleRestaurant.css";

const giftCards = [
  {
    title: "Diwali Celebration Pack",
    tag: "Diwali",
    amount: 5000,
    discount: 20,
    image:
      "https://images.pexels.com/photos/1667859/pexels-photo-1667859.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "Curated festive experiences—dining, shopping, or spa—redeemable across partner brands during the Diwali season.",
  },
  {
    title: "New Year's Eve Experience",
    tag: "New Year",
    amount: 9000,
    discount: 22,
    image:
      "https://images.pexels.com/photos/2608519/pexels-photo-2608519.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "Entry to New Year celebrations at select venues with food, beverages, and live entertainment included.",
  },
  {
    title: "Corporate Festive Bundle",
    tag: "Corporate",
    amount: 25000,
    discount: 30,
    image:
      "https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "Bulk‑friendly card designed for teams and clients—redeemable on multiple partner brands across categories.",
  },
];

const galleryImages = [
  "https://images.pexels.com/photos/1667859/pexels-photo-1667859.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/2608519/pexels-photo-2608519.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1619172/pexels-photo-1619172.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=800",
];

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "giftcards", label: "Gift Cards" },
  { id: "reviews", label: "Reviews" },
  { id: "photos", label: "Photos" },
  { id: "campaigns", label: "Campaigns" },
];

const ExampleSeasonal = () => {
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
                alt="Festive Favourites"
                className="venue-restaurant-logo"
              />
              <h1 className="venue-restaurant-name">Festive Favourites by Giftygen</h1>
            </div>
            <p className="venue-cuisine">Multi-brand · Perfect for Festivals · Great for Corporate Gifting</p>
            <p className="venue-address">
              Pan-India · Multi-brand digital experiences
            </p>
            <div className="venue-meta-row">
              <span className="venue-status-badge">Seasonal campaign</span>
              <span className="venue-meta">
                2–8 week campaigns <span className="venue-meta-i">ⓘ</span>
              </span>
              <span className="venue-meta">| 3–6 months validity</span>
            </div>
            <p className="venue-disclaimer">
              * Curated experiences from restaurants, hotels, salons, fitness & retail. Supports 10–10,000 recipients.
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
              <span className="venue-rating-star">4.8★</span>
              <span className="venue-rating-count">2.1k Campaign Ratings</span>
            </div>
            <div className="venue-rating-box">
              <span className="venue-rating-star">4.9★</span>
              <span className="venue-rating-count">Bulk enquiry support</span>
            </div>
          </div>
        </div>
      </header>

      <section className="venue-gallery">
        <div className="venue-gallery-main">
          <img src={galleryImages[0]} alt="Festive Favourites" />
        </div>
        <div className="venue-gallery-top">
          <img src={galleryImages[1]} alt="New Year" />
        </div>
        <div className="venue-gallery-bottom">
          <img src={galleryImages[2]} alt="Corporate" />
          <button
            type="button"
            className="venue-gallery-overlay"
            onClick={() => handleTabClick("photos")}
          >
            View Gallery
          </button>
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
                  <h3 className="venue-card-title">What's Included</h3>
                  <p className="venue-card-text">
                    Pre-curated bundles for Diwali, Christmas, New Year, Eid and more, seasonal microsite for email
                    and social campaigns, individual and bulk corporate orders, instant digital delivery, clear
                    validity and branding
                  </p>
                </section>
                <section className="venue-card">
                  <h3 className="venue-card-title">Campaign Scale</h3>
                  <p className="venue-cost">10 – 10,000 recipients</p>
                  <p className="venue-card-muted">Ideal for HR teams, CX campaigns, and brand promos</p>
                  <p className="venue-card-muted">White-label options for corporate clients</p>
                </section>
                <section className="venue-card">
                  <h3 className="venue-card-title">Details</h3>
                  <div className="venue-more-info">
                    {["Multi-brand redemption", "Limited-time campaigns", "Bulk enquiry", "Scheduled delivery", "Corporate branding", "3–6 month validity"].map(
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
                <h3 className="venue-card-title">Seasonal Gift Cards from Festive Favourites</h3>
                <p className="venue-card-muted" style={{ marginBottom: 20 }}>
                  Curated gift cards for festivals, year-end rewards, and special campaigns—redeemable across partner brands.
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
                          <span className="business-badge-text">Festive Favourites</span>
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
                  "Used Festive Favourites for our Diwali client gifting—smooth bulk order and recipients loved the variety." — HR Team, Tech Corp
                </p>
                <p className="venue-card-text">
                  "Sent the New Year experience card to friends. They could pick from multiple venues—super flexible." — Anisha T.
                </p>
                <p className="venue-card-muted">See all campaign feedback</p>
              </section>
            )}

            {activeTab === "photos" && (
              <section className="venue-photos">
                <h3 className="venue-photos-title">Festive Favourites Campaigns</h3>
                <div className="venue-photo-filters">
                  {["All (18)", "Diwali (6)", "New Year (12)"].map((f) => (
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

            {activeTab === "campaigns" && (
              <section className="venue-card">
                <h3 className="venue-card-title">Current & Upcoming Campaigns</h3>
                <div className="venue-cuisine-tags">
                  <span className="venue-cuisine-tag">Diwali</span>
                  <span className="venue-cuisine-tag">Christmas</span>
                  <span className="venue-cuisine-tag">New Year</span>
                  <span className="venue-cuisine-tag">Corporate</span>
                </div>
                <div className="venue-menu-preview">
                  <div className="venue-menu-list">
                    <p><strong>DIWALI</strong> — Dining, shopping, spa redeemable across partner brands</p>
                    <p><strong>CHRISTMAS</strong> — Festive bundles for gifting and rewards</p>
                    <p><strong>NEW YEAR</strong> — Celebration experiences, parties, dinners</p>
                    <p><strong>YEAR-END CORPORATE</strong> — Bulk orders for HR, CX, employee appreciation</p>
                  </div>
                </div>
                <a href="#" className="venue-see-all">Request bulk enquiry ►</a>
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-bottom">
          <p>© 2025 Festive Favourites by Giftygen. All rights reserved. Powered by Giftygen.</p>
        </div>
      </footer>
    </div>
  );
};

export default ExampleSeasonal;
