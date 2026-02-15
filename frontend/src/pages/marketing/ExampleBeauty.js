import React, { useState } from "react";
import { Phone, Share2, MessageCircle, Gift, Check } from "lucide-react";
import "../user/UserLanding.css";
import "./ExampleRestaurant.css";

const giftCards = [
  {
    title: "Signature Spa Day",
    tag: "Relax",
    amount: 6000,
    discount: 20,
    image:
      "https://images.pexels.com/photos/3738340/pexels-photo-3738340.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "Full‑body massage, steam session, and herbal tea service designed to reset mind and body in one visit.",
  },
  {
    title: "Salon Makeover Session",
    tag: "Makeover",
    amount: 4500,
    discount: 18,
    image:
      "https://images.pexels.com/photos/3738348/pexels-photo-3738348.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "Premium haircut, nourishing hair spa, and finishing style—ideal before events, shoots, or celebrations.",
  },
  {
    title: "Bridal & Occasion Prep",
    tag: "Occasion",
    amount: 11000,
    discount: 25,
    image:
      "https://images.pexels.com/photos/3762653/pexels-photo-3762653.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "Pre‑event facial, hair styling, and makeup session with advance consultation included for the bride or main guest.",
  },
];

const galleryImages = [
  "https://images.pexels.com/photos/3738340/pexels-photo-3738340.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/3738348/pexels-photo-3738348.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/3762653/pexels-photo-3762653.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/3997377/pexels-photo-3997377.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/3997378/pexels-photo-3997378.jpeg?auto=compress&cs=tinysrgb&w=800",
];

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "giftcards", label: "Gift Cards" },
  { id: "reviews", label: "Reviews" },
  { id: "photos", label: "Photos" },
  { id: "services", label: "Services" },
];

const ExampleBeauty = () => {
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
                alt="Aura Salon & Spa"
                className="venue-restaurant-logo"
              />
              <h1 className="venue-restaurant-name">Aura Salon & Spa</h1>
            </div>
            <p className="venue-cuisine">Unisex Salon & Spa · Dermat-approved Products · Great Gift for Her & Him</p>
            <p className="venue-address">
              Bandra West, Mumbai, Maharashtra 400050
            </p>
            <div className="venue-meta-row">
              <span className="venue-status-badge">Appointment required</span>
              <span className="venue-meta">
                10am – 8pm (Today) <span className="venue-meta-i">ⓘ</span>
              </span>
              <span className="venue-meta">| ₹4,500 onwards</span>
              <a href="tel:+912234567890" className="venue-phone">+91 22 3456 7890</a>
            </div>
            <p className="venue-disclaimer">
              * Patch test recommended for colour services. Same-day slots subject to availability.
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
              <span className="venue-rating-count">892 Client Ratings</span>
            </div>
            <div className="venue-rating-box">
              <span className="venue-rating-star">4.9★</span>
              <span className="venue-rating-count">234 Gift Card Reviews</span>
            </div>
          </div>
        </div>
      </header>

      <section className="venue-gallery">
        <div className="venue-gallery-main">
          <img src={galleryImages[0]} alt="Aura Salon & Spa" />
        </div>
        <div className="venue-gallery-top">
          <img src={galleryImages[1]} alt="Salon" />
        </div>
        <div className="venue-gallery-bottom">
          <img src={galleryImages[2]} alt="Bridal" />
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
                  <h3 className="venue-card-title">Clients Love This Salon For</h3>
                  <p className="venue-card-text">
                    Expert stylists, dermat-approved products, separate hair/skin/spa zones, bridal packages,
                    hygiene-first approach, personalised treatments, international techniques
                  </p>
                </section>
                <section className="venue-card">
                  <h3 className="venue-card-title">Starting From</h3>
                  <p className="venue-cost">₹4,500 per session (approx.)</p>
                  <p className="venue-card-muted">Session length 60–150 mins depending on package</p>
                  <p className="venue-card-muted">Best availability weekdays</p>
                </section>
                <section className="venue-card">
                  <h3 className="venue-card-title">Services</h3>
                  <div className="venue-more-info">
                    {["Hair", "Skin", "Spa", "Makeup", "Bridal", "Pre-wedding", "Men's grooming", "Kids"].map(
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
                <h3 className="venue-card-title">Gift Cards from Aura Salon & Spa</h3>
                <p className="venue-card-muted" style={{ marginBottom: 20 }}>
                  Salon-style gift experiences for relaxation, makeovers, and special occasions—delivered instantly.
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
                          <span className="business-badge-text">Aura Salon & Spa</span>
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
                  "Best spa day I've had. The massage and steam left me completely relaxed." — Diya M.
                </p>
                <p className="venue-card-text">
                  "Gifted the bridal package to my cousin—the team was so attentive and the results were stunning." — Rhea K.
                </p>
                <p className="venue-card-muted">See all 892 reviews</p>
              </section>
            )}

            {activeTab === "photos" && (
              <section className="venue-photos">
                <h3 className="venue-photos-title">Aura Salon & Spa Photos</h3>
                <div className="venue-photo-filters">
                  {["All (24)", "Spa (10)", "Salon (14)"].map((f) => (
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

            {activeTab === "services" && (
              <section className="venue-card">
                <h3 className="venue-card-title">Treatments</h3>
                <div className="venue-cuisine-tags">
                  <span className="venue-cuisine-tag">Hair</span>
                  <span className="venue-cuisine-tag">Skin</span>
                  <span className="venue-cuisine-tag">Spa</span>
                  <span className="venue-cuisine-tag">Makeup</span>
                </div>
                <div className="venue-menu-preview">
                  <div className="venue-menu-list">
                    <p><strong>HAIR</strong> — Premium haircut, hair spa, colour, keratin, styling</p>
                    <p><strong>SKIN</strong> — Facials, clean-up, chemical peels, LED therapy</p>
                    <p><strong>SPA</strong> — Full-body massage, steam, herbal tea, relaxation</p>
                    <p><strong>BRIDAL & OCCASION</strong> — Pre-event facial, hair styling, makeup, consultation</p>
                  </div>
                </div>
                <a href="#" className="venue-see-all">View all services & book ►</a>
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-bottom">
          <p>© 2025 Aura Salon & Spa. All rights reserved. Powered by Giftygen.</p>
        </div>
      </footer>
    </div>
  );
};

export default ExampleBeauty;
