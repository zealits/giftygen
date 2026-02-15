import React, { useState } from "react";
import { Phone, Clock, Share2, MessageCircle, Gift, Check } from "lucide-react";
import "../user/UserLanding.css";
import "./ExampleRestaurant.css";

const giftCards = [
  {
    title: "Birthday Tasting Menu for Two",
    tag: "Birthday",
    amount: 5000,
    discount: 20,
    image:
      "https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "A curated 5-course chef's tasting menu with wine pairing, perfect for celebrating a special birthday night.",
  },
  {
    title: "Anniversary Rooftop Dinner",
    tag: "Anniversary",
    amount: 7500,
    discount: 25,
    image:
      "https://images.pexels.com/photos/5563472/pexels-photo-5563472.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "Romantic rooftop dinner with a private table, welcome drinks, and a complimentary celebration dessert.",
  },
  {
    title: "Team Celebration Feast",
    tag: "For the Team",
    amount: 12000,
    discount: 30,
    image:
      "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=1200",
    description:
      "Perfect for corporate teams—shared platters, unlimited soft beverages, and reserved seating for up to 10 guests.",
  },
];

const galleryImages = [
  "https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/5563472/pexels-photo-5563472.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/3745523/pexels-photo-3745523.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=800",
];

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "giftcards", label: "Gift Cards" },
  { id: "reviews", label: "Reviews" },
  { id: "photos", label: "Photos" },
  { id: "menu", label: "Menu" },
];

const ExampleRestaurant = () => {
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
      {/* Top info header */}
      <header className="venue-header">
        <div className="venue-header-inner">
          <div className="venue-header-left">
            <div className="venue-header-title-row">
              <img
                src={galleryImages[0]}
                alt="Grand Plaza Restaurant"
                className="venue-restaurant-logo"
              />
              <h1 className="venue-restaurant-name">Grand Plaza Restaurant</h1>
            </div>
            <p className="venue-cuisine">Fine Dining, European, Coastal Indian, BBQ</p>
            <p className="venue-address">
              First Floor, Bayview Towers, Marine Drive, Mumbai, Maharashtra 400020
            </p>
            <div className="venue-meta-row">
              <span className="venue-status-badge">Closes in 45 mins</span>
              <span className="venue-meta">
                6pm – 11pm (Today) <span className="venue-meta-i">ⓘ</span>
              </span>
              <span className="venue-meta">| ₹5,000 for two</span>
              <a href="tel:+919876543210" className="venue-phone">+91 98765 43210</a>
            </div>
            <p className="venue-disclaimer">
              * Buffet prices may vary on festive dates. Contact restaurant for details.
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
              <span className="venue-rating-count">428 Dining Ratings</span>
            </div>
            <div className="venue-rating-box">
              <span className="venue-rating-star">4.6★</span>
              <span className="venue-rating-count">156 Gift Card Reviews</span>
            </div>
          </div>
        </div>
      </header>

      {/* Image gallery */}
      <section className="venue-gallery">
        <div className="venue-gallery-main">
          <img src={galleryImages[0]} alt="Grand Plaza Restaurant" />
        </div>
        <div className="venue-gallery-top">
          <img src={galleryImages[1]} alt="Dining" />
        </div>
        <div className="venue-gallery-bottom">
          <img src={galleryImages[2]} alt="Ambience" />
          <span className="venue-gallery-overlay">View Gallery</span>
        </div>
      </section>

      {/* Tabs */}
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

      {/* Main content – two columns */}
      <main className="venue-main">
        <div className="venue-layout">
          <div className="venue-content">
            {/* Overview */}
            {activeTab === "overview" && (
              <>
                <section className="venue-card">
                  <h3 className="venue-card-title">People Say This Place Is Known For</h3>
                  <p className="venue-card-text">
                    Host, Great Buffet Spread, Friendly Service, Amazing Ambience, Comfortable Seating, Good for Large
                    Groups, Perfect for Celebrations, Rooftop Views
                  </p>
                </section>
                <section className="venue-card">
                  <h3 className="venue-card-title">Average Cost</h3>
                  <p className="venue-cost">₹5,000 for two people (approx.)</p>
                  <p className="venue-card-muted">Exclusive of applicable taxes and charges, if any</p>
                  <p className="venue-card-muted">Cash and Cards accepted · Digital payments accepted</p>
                </section>
                <section className="venue-card">
                  <h3 className="venue-card-title">More Info</h3>
                  <div className="venue-more-info">
                    {["Dinner", "Lunch", "Indoor seating", "Rooftop", "Buffet", "Table reservation", "Valet parking"].map(
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

            {/* Gift Cards */}
            {activeTab === "giftcards" && (
              <section className="venue-giftcards">
                <h3 className="venue-card-title">Gift Cards from Grand Plaza Restaurant</h3>
                <p className="venue-card-muted" style={{ marginBottom: 20 }}>
                  For birthdays, anniversaries, and team celebrations—delivered instantly as digital cards.
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
                          <span className="business-badge-text">Grand Plaza Restaurant</span>
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

            {/* Reviews placeholder */}
            {activeTab === "reviews" && (
              <section className="venue-card">
                <h3 className="venue-card-title">Reviews</h3>
                <p className="venue-card-text">
                  "Amazing fine dining experience by the bay. The tasting menu was exceptional." — Priya M.
                </p>
                <p className="venue-card-text">
                  "Perfect for our anniversary. Staff went above and beyond to make it special." — Rahul K.
                </p>
                <p className="venue-card-muted">See all 428 reviews</p>
              </section>
            )}

            {/* Photos */}
            {activeTab === "photos" && (
              <section className="venue-photos">
                <h3 className="venue-photos-title">Grand Plaza Restaurant Photos</h3>
                <div className="venue-photo-filters">
                  {["All (24)", "Food (18)", "Ambience (6)"].map((f) => (
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

            {/* Menu */}
            {activeTab === "menu" && (
              <section className="venue-card">
                <h3 className="venue-card-title">Menu</h3>
                <div className="venue-cuisine-tags">
                  <span className="venue-cuisine-tag">North Indian</span>
                  <span className="venue-cuisine-tag">European</span>
                  <span className="venue-cuisine-tag">BBQ</span>
                  <span className="venue-cuisine-tag">Desserts</span>
                </div>
                <div className="venue-menu-preview">
                  <div className="venue-menu-list">
                    <p><strong>STARTERS (VEG)</strong> — Sindhi Paneer Tikka, Stuffed Cheese Mushroom</p>
                    <p><strong>STARTERS (NON VEG)</strong> — Chicken Chutneywala, Coastal Fish Curry</p>
                    <p><strong>MAIN COURSE</strong> — Charcoal-roasted burrata, Hand-rolled gnocchi, Peri-peri chicken</p>
                    <p><strong>DESSERTS</strong> — Baked cheesecake, 72% chocolate fondant, Cassata</p>
                  </div>
                </div>
                <a href="#" className="venue-see-all">See all menus ►</a>
              </section>
            )}

          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-bottom">
          <p>© 2025 Grand Plaza Restaurant. All rights reserved. Powered by Giftygen.</p>
        </div>
      </footer>
    </div>
  );
};

export default ExampleRestaurant;
