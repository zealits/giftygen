import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import logo from "../../assets/giftygen_logo.png";
import {
  Zap,
  Smartphone,
  Shield,
  Palette,
  ArrowRight,
  Star,
  CheckCircle,
  TrendingUp,
  Users,
  Repeat,
  Target,
  BarChart3,
  Eye,
  DollarSign,
  Gift,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

function LandingPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("giftygen_theme") || "dark");
  const [phone, setPhone] = useState("");
  const [notice, setNotice] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [errors, setErrors] = useState({
    businessName: false,
    businessType: false,
    contactName: false,
    email: false,
  });

  const benefitsData = [
    {
      icon: <TrendingUp size={24} />,
      title: "Seasonal Promotions",
      description: "Perfect for holidays and events with targeted campaigns.",
      color: "var(--success)",
    },
    {
      icon: <DollarSign size={24} />,
      title: "Boosts Revenue",
      description: "Upfront cash flow; often redeemed for more than face value.",
      color: "var(--primary)",
    },
    {
      icon: <Users size={24} />,
      title: "Improves Loyalty",
      description: "Power referral and rewards programs for customer retention.",
      color: "var(--primary-2)",
    },
    {
      icon: <Repeat size={24} />,
      title: "Encourages Repeat Visits",
      description: "Drives return traffic and upsell opportunities.",
      color: "var(--success)",
    },
    {
      icon: <Target size={24} />,
      title: "Attracts New Customers",
      description: "Gifts bring first-time buyers and brand discovery.",
      color: "var(--primary)",
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Trackable",
      description: "Usage data for smarter forecasting and insights.",
      color: "var(--primary-2)",
    },
    {
      icon: <Eye size={24} />,
      title: "Enhances Visibility",
      description: "Branded cards act as mini ads for your business.",
      color: "var(--success)",
    },
    {
      icon: <DollarSign size={24} />,
      title: "Higher Order Value",
      description: "Customers spend beyond the card amount.",
      color: "var(--primary)",
    },
    {
      icon: <Gift size={24} />,
      title: "Flexible Marketing",
      description: "Promotions, contests, and refunds for various campaigns.",
      color: "var(--primary-2)",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(benefitsData.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(benefitsData.length / 3)) % Math.ceil(benefitsData.length / 3));
  };

  useEffect(() => {
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

  const formatUSPhone = (value) => {
    const digits = (value || "").replace(/\D/g, "").slice(0, 10);
    if (digits.length === 0) return "";
    if (digits.length < 4) return `(${digits}`;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleMobileNavClick = (scrollToId) => {
    handleScrollTo(scrollToId);
    closeMobileMenu();
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.classList.add("mobile-menu-open");
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.classList.remove("mobile-menu-open");
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.classList.remove("mobile-menu-open");
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="lp-root" data-theme={theme}>
      {/* Navbar */}
      <header className="lp-nav">
        <div className="lp-nav__brand" onClick={() => navigate("/")}>
          <img src={logo} alt="giftygen logo" className="lp-nav__logo" />
        </div>

        {/* Desktop Navigation */}
        <nav className="lp-nav__links">
          <button onClick={() => handleScrollTo("about")}>About</button>
          <button onClick={() => handleScrollTo("highlights")}>Highlights</button>
          <button onClick={() => handleScrollTo("benefits")}>Benefits</button>
          <button onClick={() => handleScrollTo("register")}>Register</button>
          <button onClick={() => handleScrollTo("contact")}>Contact</button>
        </nav>

        {/* Desktop CTA */}
        <div className="lp-nav__cta">
          <button className="lp-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button className="lp-btn lp-btn--ghost" onClick={() => navigate("/login")}>
            Sign in
          </button>
          <button className="lp-btn" onClick={() => navigate("/explore")}>
            Explore gift cards
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className="lp-nav__mobile-toggle" onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Navigation Menu */}
      <div className={`lp-mobile-menu ${isMobileMenuOpen ? "lp-mobile-menu--open" : ""}`}>
        {/* Mobile Menu Header with Close Button */}
        <div className="lp-mobile-header">
          <div className="lp-mobile-header__brand">
            <img src={logo} alt="giftygen logo" className="lp-mobile-header__logo" />
            <span className="lp-mobile-header__title">giftygen</span>
          </div>
          <button className="lp-mobile-close" onClick={closeMobileMenu} aria-label="Close mobile menu">
            <X size={24} />
          </button>
        </div>

        <nav className="lp-mobile-nav">
          <button onClick={() => handleMobileNavClick("about")}>About</button>
          <button onClick={() => handleMobileNavClick("highlights")}>Highlights</button>
          <button onClick={() => handleMobileNavClick("benefits")}>Benefits</button>
          <button onClick={() => handleMobileNavClick("register")}>Register</button>
          <button onClick={() => handleMobileNavClick("contact")}>Contact</button>
        </nav>
        <div className="lp-mobile-cta">
          <button className="lp-btn lp-btn--ghost" onClick={() => navigate("/login")}>
            Sign in
          </button>
          <button className="lp-btn" onClick={() => navigate("/explore")}>
            Explore gift cards
          </button>
        </div>
        <div className="lp-mobile-theme">
          <button className="lp-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "☀️ Switch to Light" : "🌙 Switch to Dark"}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && <div className="lp-mobile-overlay" onClick={closeMobileMenu} />}

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
        <div className="lp-hero__visual" aria-hidden>
          <div className="lp-giftcard" role="img" aria-label="Digital gift card illustration">
            <div className="lp-giftcard__ribbon" />
            <div className="lp-giftcard__brand">giftygen</div>
            <div className="lp-giftcard__title">Digital Gift Card</div>
            <div className="lp-giftcard__amount">$ 50</div>
            <div className="lp-giftcard__meta">
              <span>To: You</span>
              <span>From: Sender</span>
            </div>
            <div className="lp-giftcard__pixels" />
          </div>
        </div>
      </section>

      {/* Business Offer */}
      <section className="lp-offer">
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
        <div className="lp-section__header">
          <h2 className="lp-section__title lp-h2">Product Highlights</h2>
        </div>

        <div className="lp-grid lp-grid--4">
          <div className="lp-feature-card">
            <div className="lp-feature-card__icon">
              <Zap className="lp-feature-icon" />
            </div>
            <div className="lp-feature-card__content">
              <h3 className="lp-h3">Smart Delivery</h3>
              <p>
                Send and receive gift cards instantly via email or messaging with our lightning-fast delivery system.
              </p>
              <div className="lp-feature-card__benefits">
                <span className="lp-feature-benefit">
                  <CheckCircle size={16} />
                  Instant delivery
                </span>
                <span className="lp-feature-benefit">
                  <CheckCircle size={16} />
                  Multiple channels
                </span>
              </div>
            </div>
          </div>

          <div className="lp-feature-card">
            <div className="lp-feature-card__icon">
              <Smartphone className="lp-feature-icon" />
            </div>
            <div className="lp-feature-card__content">
              <h3 className="lp-h3">Seamless Integration</h3>
              <p>Works across all platforms and devices with our responsive design and cross-platform compatibility.</p>
              <div className="lp-feature-card__benefits">
                <span className="lp-feature-benefit">
                  <CheckCircle size={16} />
                  Cross-platform
                </span>
                <span className="lp-feature-benefit">
                  <CheckCircle size={16} />
                  Responsive design
                </span>
              </div>
            </div>
          </div>

          <div className="lp-feature-card">
            <div className="lp-feature-card__icon">
              <Shield className="lp-feature-icon" />
            </div>
            <div className="lp-feature-card__content">
              <h3 className="lp-h3">Secure Redemption</h3>
              <p>Advanced QR code technology and fraud-resistant flows ensure your gift cards are always secure.</p>
              <div className="lp-feature-card__benefits">
                <span className="lp-feature-benefit">
                  <CheckCircle size={16} />
                  QR technology
                </span>
                <span className="lp-feature-benefit">
                  <CheckCircle size={16} />
                  Fraud protection
                </span>
              </div>
            </div>
          </div>

          <div className="lp-feature-card">
            <div className="lp-feature-card__icon">
              <Palette className="lp-feature-icon" />
            </div>
            <div className="lp-feature-card__content">
              <h3 className="lp-h3">Custom Branding</h3>
              <p>Your business logo, colors, and themes on every card for a professional, branded experience.</p>
              <div className="lp-feature-card__benefits">
                <span className="lp-feature-benefit">
                  <CheckCircle size={16} />
                  Brand customization
                </span>
                <span className="lp-feature-benefit">
                  <CheckCircle size={16} />
                  Professional look
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why giftygen / Benefits */}
      <section className="lp-section" id="benefits">
        <div className="lp-section__header">
          <h2 className="lp-section__title lp-h2">Why giftygen? Business benefits of gift card promotions</h2>
          <p className="lp-section__subtitle">Discover how digital gift cards can transform your business strategy</p>
        </div>

        <div className="lp-benefits-slider">
          <button className="lp-slider-btn lp-slider-btn--prev" onClick={prevSlide} aria-label="Previous slide">
            <ChevronLeft size={24} />
          </button>

          <div className="lp-benefits-container">
            <div className="lp-benefits-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {benefitsData.map((benefit, index) => (
                <div key={index} className="lp-benefit-card">
                  <div className="lp-benefit-icon" style={{ color: benefit.color }}>
                    {benefit.icon}
                  </div>
                  <h3 className="lp-benefit-title">{benefit.title}</h3>
                  <p className="lp-benefit-description">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          <button className="lp-slider-btn lp-slider-btn--next" onClick={nextSlide} aria-label="Next slide">
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="lp-slider-dots">
          {Array.from({ length: Math.ceil(benefitsData.length / 3) }).map((_, index) => (
            <button
              key={index}
              className={`lp-dot ${index === currentSlide ? "lp-dot--active" : ""}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Registration */}
      <section className="lp-section lp-register" id="register">
        <div className="lp-register__intro">
          <h2 className="lp-section__title lp-h2">Register your business</h2>
          <p className="lp-lead">
            Restaurants, hotels, and stores can create and manage digital gift cards on giftygen.
          </p>
        </div>
        <form
          className="lp-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const payload = {
              businessName: form.businessName?.value,
              businessType: form.businessType?.value,
              contactName: form.contactName?.value,
              email: form.email?.value,
              phone,
              website: form.website?.value,
              notes: form.notes?.value,
            };
            // Client-side validation displayed only on submit
            const nextErrors = {
              businessName: !payload.businessName?.trim(),
              businessType: !payload.businessType?.trim(),
              contactName: !payload.contactName?.trim(),
              email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(payload.email || ""),
            };
            setErrors(nextErrors);
            if (Object.values(nextErrors).some(Boolean)) {
              setNotice({ type: "error", text: "Please fix the highlighted fields." });
              setTimeout(() => setNotice(null), 5000);
              return;
            }
            try {
              // Validate phone if provided
              if (payload.phone) {
                const phoneRegex = /^\([0-9]{3}\)\s[0-9]{3}-[0-9]{4}$/;
                if (!phoneRegex.test(payload.phone)) {
                  setNotice({ type: "error", text: "Please enter a valid phone number like (555) 123-4567." });
                  return;
                }
              }
              const res = await fetch("/api/v1/admin/registration-interest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              if (!res.ok) throw new Error("Failed to submit");
              setNotice({ type: "success", text: "Thanks! We will reach out shortly." });
              form.reset();
              setPhone("");
              setErrors({ businessName: false, businessType: false, contactName: false, email: false });
              setTimeout(() => setNotice(null), 5000);
            } catch (err) {
              setNotice({ type: "error", text: "Sorry, something went wrong. Please try again later." });
              setTimeout(() => setNotice(null), 5000);
            }
          }}
        >
          <div className="lp-form__grid">
            <div className="lp-field">
              <label>Business name</label>
              <input
                type="text"
                name="businessName"
                placeholder="e.g., Ocean View Bistro"
                className={errors.businessName ? "lp-input--error" : undefined}
                onInput={() => setErrors((e) => ({ ...e, businessName: false }))}
              />
            </div>
            <div className="lp-field">
              <label>Business type</label>
              <input
                type="text"
                name="businessType"
                placeholder="e.g., Restaurant, Salon, Retail"
                className={errors.businessType ? "lp-input--error" : undefined}
                onInput={() => setErrors((e) => ({ ...e, businessType: false }))}
              />
            </div>
            <div className="lp-field">
              <label>Contact name</label>
              <input
                type="text"
                name="contactName"
                placeholder="Your name"
                className={errors.contactName ? "lp-input--error" : undefined}
                onInput={() => setErrors((e) => ({ ...e, contactName: false }))}
              />
            </div>
            <div className="lp-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="name@business.com"
                className={errors.email ? "lp-input--error" : undefined}
                onInput={() => setErrors((e) => ({ ...e, email: false }))}
              />
            </div>
            <div className="lp-field">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(formatUSPhone(e.target.value))}
                maxLength={14}
                aria-label="US phone number"
              />
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
          {notice && (
            <div
              className={`lp-alert ${notice.type === "success" ? "lp-alert--success" : "lp-alert--error"}`}
              role="status"
              aria-live="polite"
            >
              {notice.text}
            </div>
          )}
          <button className="lp-btn lp-btn--block lp-form__submit" type="submit">
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
