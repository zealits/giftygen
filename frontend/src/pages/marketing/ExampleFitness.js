import React, { useState } from "react";
import { Phone, Share2, MessageCircle, Gift, Check } from "lucide-react";
import "../user/UserLanding.css";
import "./ExampleRestaurant.css";

const giftCards = [
  {
    title: "14‑Day Trial Membership",
    tag: "Starter",
    amount: 2499,
    discount: 40,
    image:
      "https://images.pexels.com/photos/3837781/pexels-photo-3837781.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "Unlimited gym floor access, 4 group classes, and one complimentary fitness assessment with a certified coach.",
  },
  {
    title: "3‑Month Transformation Pack",
    tag: "Most Popular",
    amount: 11999,
    discount: 28,
    image:
      "https://images.pexels.com/photos/7991652/pexels-photo-7991652.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "Full gym membership with personalized workout plan, nutrition guidance, and progress tracking every 4 weeks.",
  },
  {
    title: "Wellness & Recovery Pack",
    tag: "Wellness",
    amount: 6999,
    discount: 25,
    image:
      "https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "Yoga, mobility, and guided stretching sessions designed for stress relief, posture correction, and recovery.",
  },
];

const galleryImages = [
  "https://images.pexels.com/photos/7991652/pexels-photo-7991652.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/3837781/pexels-photo-3837781.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=800",
];

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "giftcards", label: "Gift Cards" },
  { id: "reviews", label: "Reviews" },
  { id: "photos", label: "Photos" },
  { id: "classes", label: "Classes" },
];

const ExampleFitness = () => {
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
                alt="PulseFit Studio"
                className="venue-restaurant-logo"
              />
              <h1 className="venue-restaurant-name">PulseFit Studio</h1>
            </div>
            <p className="venue-cuisine">Strength Training · Yoga & Mobility · Coach-Led Sessions</p>
            <p className="venue-address">
              Koramangala, Bengaluru, Karnataka 560034
            </p>
            <div className="venue-meta-row">
              <span className="venue-status-badge">Open now</span>
              <span className="venue-meta">
                6am – 10pm (Today) <span className="venue-meta-i">ⓘ</span>
              </span>
              <span className="venue-meta">| ₹2,499 onwards</span>
              <a href="tel:+918012345678" className="venue-phone">+91 80123 45678</a>
            </div>
            <p className="venue-disclaimer">
              * KYC required at first visit. Membership validity starts from activation date.
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
              <span className="venue-rating-count">312 Member Ratings</span>
            </div>
            <div className="venue-rating-box">
              <span className="venue-rating-star">4.9★</span>
              <span className="venue-rating-count">78 Gift Card Reviews</span>
            </div>
          </div>
        </div>
      </header>

      <section className="venue-gallery">
        <div className="venue-gallery-main">
          <img src={galleryImages[0]} alt="PulseFit Studio" />
        </div>
        <div className="venue-gallery-top">
          <img src={galleryImages[1]} alt="Gym" />
        </div>
        <div className="venue-gallery-bottom">
          <img src={galleryImages[2]} alt="Yoga" />
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
                  <h3 className="venue-card-title">Members Love This Studio For</h3>
                  <p className="venue-card-text">
                    Certified coaches, small class sizes, form correction, goal-based programming, locker rooms,
                    recovery routines, beginner-friendly onboarding, personalised plans
                  </p>
                </section>
                <section className="venue-card">
                  <h3 className="venue-card-title">Starting From</h3>
                  <p className="venue-cost">₹2,499 for 14-day trial (approx.)</p>
                  <p className="venue-card-muted">Sessions 45–60 mins · Coach-led small groups & personal training</p>
                  <p className="venue-card-muted">Peak hours: 6–9 AM & 6–9 PM</p>
                </section>
                <section className="venue-card">
                  <h3 className="venue-card-title">Amenities</h3>
                  <div className="venue-more-info">
                    {["Strength training", "Yoga", "Mobility", "Group classes", "Locker rooms", "Showers", "Assessment", "Nutrition guidance"].map(
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
                <h3 className="venue-card-title">Gift Cards from PulseFit Studio</h3>
                <p className="venue-card-muted" style={{ marginBottom: 20 }}>
                  Membership-style gift cards for fitness enthusiasts—delivered instantly as digital vouchers.
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
                          <span className="business-badge-text">PulseFit Studio</span>
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
                  "Best fitness studio in Koramangala. Coaches are knowledgeable and the small groups mean real attention." — Meera K.
                </p>
                <p className="venue-card-text">
                  "Gifted the 3-month pack to my husband—he loves it. The transformation plan is genuinely personalised." — Arjun S.
                </p>
                <p className="venue-card-muted">See all 312 reviews</p>
              </section>
            )}

            {activeTab === "photos" && (
              <section className="venue-photos">
                <h3 className="venue-photos-title">PulseFit Studio Photos</h3>
                <div className="venue-photo-filters">
                  {["All (20)", "Gym (8)", "Classes (12)"].map((f) => (
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

            {activeTab === "classes" && (
              <section className="venue-card">
                <h3 className="venue-card-title">Class Types</h3>
                <div className="venue-cuisine-tags">
                  <span className="venue-cuisine-tag">Strength</span>
                  <span className="venue-cuisine-tag">Yoga</span>
                  <span className="venue-cuisine-tag">Mobility</span>
                  <span className="venue-cuisine-tag">HIIT</span>
                </div>
                <div className="venue-menu-preview">
                  <div className="venue-menu-list">
                    <p><strong>STRENGTH & CONDITIONING</strong> — Full-body workouts, progressive overload, form-focused</p>
                    <p><strong>YOGA & MOBILITY</strong> — Flexibility, recovery, posture correction, guided stretching</p>
                    <p><strong>HIIT & CIRCUITS</strong> — 45-min high-intensity intervals for fat loss and conditioning</p>
                    <p><strong>PERSONAL TRAINING</strong> — 1-on-1 sessions with certified coaches, custom programs</p>
                  </div>
                </div>
                <a href="#" className="venue-see-all">See full class schedule ►</a>
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-bottom">
          <p>© 2025 PulseFit Studio. All rights reserved. Powered by Giftygen.</p>
        </div>
      </footer>
    </div>
  );
};

export default ExampleFitness;
