import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import logo from "../../assets/giftygen_logo.png";

function LandingPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("giftygen_theme") || "dark");

  useEffect(() => {
    // Scroll to top on mount for better first impression
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    localStorage.setItem("giftygen_theme", theme);
  }, [theme]);

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <div className="lp-root" data-theme={theme}>
      {/* Navbar */}
      <header className="lp-nav">
        <div className="lp-nav__brand" onClick={() => navigate("/")}>
          <img src={logo} alt="giftygen logo" className="lp-nav__logo" />
          {/* <span className="lp-nav__name">giftygen</span> */}
        </div>
        <nav className="lp-nav__links">
          <button onClick={() => handleScrollTo("about")}>About</button>
          <button onClick={() => handleScrollTo("highlights")}>Highlights</button>
          <button onClick={() => handleScrollTo("benefits")}>Benefits</button>
          <button onClick={() => handleScrollTo("register")}>Register</button>
          <button onClick={() => handleScrollTo("contact")}>Contact</button>
        </nav>
        <div className="lp-nav__cta">
          <button className="lp-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
          </button>
          <button className="lp-btn lp-btn--ghost" onClick={() => navigate("/login")}>
            Sign in
          </button>
          <button className="lp-btn" onClick={() => navigate("/explore")}>
            Explore gift cards
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="lp-hero" id="about">
        <div className="lp-hero__content">
          <div className="lp-kicker">Introducing giftygen</div>
          <h1 className="lp-hero__title">The Future of Gifting Is Digital</h1>
          <p className="lp-hero__subtitle">Elegant. Instant. Memorable.</p>
          <p className="lp-hero__desc">giftygen transforms traditional gift cards into sleek, digital experiences.</p>
          <div className="lp-hero__actions">
            <button className="lp-btn" onClick={() => handleScrollTo("register")}>
              Get started
            </button>
            <button className="lp-btn lp-btn--ghost" onClick={() => navigate("/explore")}>
              Buy a gift card
            </button>
          </div>
        </div>
        <div className="lp-hero__visual">
          <div className="lp-card-mockup">
            <div className="lp-card__chip" />
            <div className="lp-card__brand">giftygen</div>
            <div className="lp-card__number">•••• •••• •••• 2025</div>
            <div className="lp-card__badge">Digital</div>
            <div className="lp-card__pixels" />
          </div>
        </div>
      </section>

      {/* Business Offer */}
      <section className="lp-offer">
        <div className="lp-section__kicker">Business Offer</div>
        <h2 className="lp-section__title lp-h2">A complete platform for creating and selling gift cards</h2>
        <p className="lp-lead">
          Transform the way you engage customers with our innovative Digital Gift Card platform – designed for easy
          creation, sale, and redemption of gift card promotions. Perfect for boosting sales, attracting new customers,
          and enhancing brand loyalty. Works seamlessly for in-store and online businesses. Fast, secure, and
          customizable.
        </p>
      </section>

      {/* Product Highlights */}
      <section className="lp-section" id="highlights">
        <div className="lp-section__kicker">Product</div>
        <h2 className="lp-section__title lp-h2">Product Highlights</h2>
        <div className="lp-grid lp-grid--3">
          <div className="lp-card">
            <h3 className="lp-h3">Modern Design</h3>
            <p>Debit-card inspired layout with a minimalist aesthetic.</p>
          </div>
          <div className="lp-card">
            <h3 className="lp-h3">Smart Delivery</h3>
            <p>Send and receive gift cards instantly via email or messaging.</p>
          </div>
          <div className="lp-card">
            <h3 className="lp-h3">Seamless Integration</h3>
            <p>Works across platforms and devices.</p>
          </div>
          <div className="lp-card">
            <h3 className="lp-h3">Digital Pixel Effect</h3>
            <p>Symbolizing the transition from physical to digital gifting.</p>
          </div>
          <div className="lp-card">
            <h3 className="lp-h3">Secure Redemption</h3>
            <p>QR code redemption and fraud-resistant flows.</p>
          </div>
          <div className="lp-card">
            <h3 className="lp-h3">Custom Branding</h3>
            <p>Your logo, colors, and themes on every card.</p>
          </div>
        </div>
      </section>

      {/* Why giftygen / Benefits */}
      <section className="lp-section" id="benefits">
        <div className="lp-section__kicker">Why giftygen?</div>
        <h2 className="lp-section__title lp-h2">Business benefits of gift card promotions</h2>
        <ul className="lp-benefits">
          <li>
            <strong>Boosts Revenue:</strong> Upfront cash flow; often redeemed for more than face value.
          </li>
          <li>
            <strong>Attracts New Customers:</strong> Gifts bring first-time buyers and brand discovery.
          </li>
          <li>
            <strong>Encourages Repeat Visits:</strong> Drives return traffic and upsell opportunities.
          </li>
          <li>
            <strong>Reduces Returns:</strong> Recipients choose what they love.
          </li>
          <li>
            <strong>Enhances Visibility:</strong> Branded cards act as mini ads.
          </li>
          <li>
            <strong>Improves Loyalty:</strong> Power referral and rewards programs.
          </li>
          <li>
            <strong>Seasonal Promotions:</strong> Perfect for holidays and events.
          </li>
          <li>
            <strong>Higher Order Value:</strong> Customers spend beyond the card amount.
          </li>
          <li>
            <strong>Flexible Marketing:</strong> Promotions, contests, and refunds.
          </li>
          <li>
            <strong>Low Overhead:</strong> Digital distribution, minimal maintenance.
          </li>
          <li>
            <strong>Trackable:</strong> Usage data for smarter forecasting.
          </li>
          <li>
            <strong>Delightful UX:</strong> Convenient, personalized gifting.
          </li>
        </ul>
      </section>

      {/* Registration */}
      <section className="lp-section lp-register" id="register">
        <div className="lp-register__intro">
          <div className="lp-section__kicker">Get started</div>
          <h2 className="lp-section__title lp-h2">Register your business</h2>
          <p className="lp-lead">
            Restaurants, hotels, and stores can create and manage digital gift cards on giftygen.
          </p>
        </div>
        <form
          className="lp-form"
          onSubmit={(e) => {
            e.preventDefault();
            alert("Thanks! We will reach out shortly.");
          }}
        >
          <div className="lp-form__grid">
            <div className="lp-field">
              <label>Business name</label>
              <input type="text" name="businessName" placeholder="e.g., Ocean View Bistro" required />
            </div>
            <div className="lp-field">
              <label>Business type</label>
              <select name="businessType" defaultValue="Restaurant">
                <option>Restaurant</option>
                <option>Hotel</option>
                <option>Retail store</option>
                <option>Spa / Wellness</option>
                <option>Other</option>
              </select>
            </div>
            <div className="lp-field">
              <label>Contact name</label>
              <input type="text" name="contactName" placeholder="Your name" required />
            </div>
            <div className="lp-field">
              <label>Email</label>
              <input type="email" name="email" placeholder="name@business.com" required />
            </div>
            <div className="lp-field">
              <label>Phone</label>
              <input type="tel" name="phone" placeholder="+1 555 000 0000" />
            </div>
            <div className="lp-field">
              <label>Website</label>
              <input type="url" name="website" placeholder="https://" />
            </div>
            <div className="lp-field lp-field--full">
              <label>Notes</label>
              <textarea name="notes" rows="4" placeholder="Tell us about your gift card goals"></textarea>
            </div>
          </div>
          <button className="lp-btn lp-btn--block" type="submit">
            Request demo
          </button>
        </form>
      </section>

      {/* Contact */}
      <section className="lp-section lp-contact" id="contact">
        <div className="lp-contact__content">
          <div>
            <h2>Contact us</h2>
            <p className="lp-contact__lead">
              Visit giftygen.com to learn more or scan the QR code below to explore our platform.
            </p>
            <div className="lp-contact__actions">
              <a className="lp-btn" href="https://giftygen.com" target="_blank" rel="noreferrer">
                Visit website
              </a>
              <button className="lp-btn lp-btn--ghost" onClick={() => navigate("/explore")}>
                Explore gift cards
              </button>
            </div>
          </div>
          <div className="lp-qr">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                "https://giftygen.com"
              )}&size=160x160`}
              alt="QR code for giftygen.com"
            />
            <span>Scan to learn more</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer__brand">
          <img src={logo} alt="giftygen logo" />
          <span>giftygen</span>
        </div>
        <div className="lp-footer__right">© {new Date().getFullYear()} giftygen. All rights reserved.</div>
      </footer>
    </div>
  );
}

export default LandingPage;
