import React, { useState } from "react";
import { Phone, Share2, MessageCircle, Gift, Check } from "lucide-react";
import "../user/UserLanding.css";
import "./ExampleRestaurant.css";

const giftCards = [
  {
    title: "Weekend Staycation for Two",
    tag: "Staycation",
    amount: 15000,
    discount: 22,
    image:
      "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "1 night / 2 days in a premium room with breakfast, late checkout, and access to pool and fitness centre.",
  },
  {
    title: "Anniversary Suite Escape",
    tag: "Anniversary",
    amount: 28000,
    discount: 28,
    image:
      "https://images.pexels.com/photos/1579258/pexels-photo-1579258.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "Suite upgrade, candle‑light dinner, room décor, and special amenities curated for milestone celebrations.",
  },
  {
    title: "Corporate Retreat Credit",
    tag: "For the Team",
    amount: 50000,
    discount: 18,
    image:
      "https://images.pexels.com/photos/2581540/pexels-photo-2581540.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "Flexible credit redeemable against stays, meeting rooms, and F&B for teams and offsite workshops.",
  },
];

const galleryImages = [
  "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1579258/pexels-photo-1579258.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/2581540/pexels-photo-2581540.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=800",
];

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "giftcards", label: "Gift Cards" },
  { id: "reviews", label: "Reviews" },
  { id: "photos", label: "Photos" },
  { id: "rooms", label: "Rooms" },
];

const ExampleHotel = () => {
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
                alt="Oceanfront Grand Resort"
                className="venue-restaurant-logo"
              />
              <h1 className="venue-restaurant-name">Oceanfront Grand Resort</h1>
            </div>
            <p className="venue-cuisine">Beachfront Resort · Spa · Pool · Fine Dining</p>
            <p className="venue-address">
              Candolim Beach, Goa 403515
            </p>
            <div className="venue-meta-row">
              <span className="venue-status-badge">Check-in 2:00 PM</span>
              <span className="venue-meta">
                24-hour front desk <span className="venue-meta-i">ⓘ</span>
              </span>
              <span className="venue-meta">| ₹12,000 onwards</span>
              <a href="tel:+911234567890" className="venue-phone">+91 12345 67890</a>
            </div>
            <p className="venue-disclaimer">
              * Peak season rates may apply. Contact resort for availability.
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
              <span className="venue-rating-star">4.9★</span>
              <span className="venue-rating-count">512 Stay Ratings</span>
            </div>
            <div className="venue-rating-box">
              <span className="venue-rating-star">4.8★</span>
              <span className="venue-rating-count">89 Gift Card Reviews</span>
            </div>
          </div>
        </div>
      </header>

      <section className="venue-gallery">
        <div className="venue-gallery-main">
          <img src={galleryImages[0]} alt="Oceanfront Grand Resort" />
        </div>
        <div className="venue-gallery-top">
          <img src={galleryImages[1]} alt="Suite" />
        </div>
        <div className="venue-gallery-bottom">
          <img src={galleryImages[2]} alt="Pool" />
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
                  <h3 className="venue-card-title">Guests Love This Place For</h3>
                  <p className="venue-card-text">
                    Private beach, lagoon pools, full-service spa, kids club, sunset deck, pool bar, curated family
                    activities, banquet spaces, concierge service
                  </p>
                </section>
                <section className="venue-card">
                  <h3 className="venue-card-title">Starting From</h3>
                  <p className="venue-cost">₹12,000 per night (approx.)</p>
                  <p className="venue-card-muted">Rates vary by season and room type</p>
                  <p className="venue-card-muted">Check-in 2:00 PM · Check-out 12:00 PM</p>
                </section>
                <section className="venue-card">
                  <h3 className="venue-card-title">Amenities</h3>
                  <div className="venue-more-info">
                    {["Private beach", "Pool", "Spa", "Fitness centre", "Free WiFi", "Room service", "Restaurant", "Kids club"].map(
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
                <h3 className="venue-card-title">Gift Cards from Oceanfront Grand Resort</h3>
                <p className="venue-card-muted" style={{ marginBottom: 20 }}>
                  For staycations, anniversaries, and corporate retreats—delivered instantly as digital vouchers.
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
                          <span className="business-badge-text">Oceanfront Grand Resort</span>
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
                  "Stunning beachfront property. The spa and pool were highlights of our stay." — Anita S.
                </p>
                <p className="venue-card-text">
                  "Perfect for our anniversary. The suite upgrade and candlelit dinner were magical." — Vikram R.
                </p>
                <p className="venue-card-muted">See all 512 reviews</p>
              </section>
            )}

            {activeTab === "photos" && (
              <section className="venue-photos">
                <h3 className="venue-photos-title">Oceanfront Grand Resort Photos</h3>
                <div className="venue-photo-filters">
                  {["All (32)", "Rooms (12)", "Amenities (20)"].map((f) => (
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

            {activeTab === "rooms" && (
              <section className="venue-card">
                <h3 className="venue-card-title">Room Types</h3>
                <div className="venue-cuisine-tags">
                  <span className="venue-cuisine-tag">Sea View</span>
                  <span className="venue-cuisine-tag">Pool View</span>
                  <span className="venue-cuisine-tag">Suite</span>
                  <span className="venue-cuisine-tag">Family Room</span>
                </div>
                <div className="venue-menu-preview">
                  <div className="venue-menu-list">
                    <p><strong>OCEAN VIEW DELUXE</strong> — King bed, private balcony, minibar, 42" TV</p>
                    <p><strong>LAGOON SUITE</strong> — Separate living area, plunge pool access, butler service</p>
                    <p><strong>FAMILY CONNECTING</strong> — Two rooms, kids amenities, interconnecting door</p>
                    <p><strong>BEACH VILLA</strong> — Private villa, garden, direct beach access</p>
                  </div>
                </div>
                <a href="#" className="venue-see-all">See all room types ►</a>
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-bottom">
          <p>© 2025 Oceanfront Grand Resort. All rights reserved. Powered by Giftygen.</p>
        </div>
      </footer>
    </div>
  );
};

export default ExampleHotel;
