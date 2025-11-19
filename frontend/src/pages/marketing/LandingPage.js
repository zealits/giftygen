import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import logo from "../../assets/giftygen_logo.png";
import { useTranslation } from "react-i18next";
import "../../i18n";
import LanguageDropdown from "../../components/LanguageDropdown";
import { detectAndSetLanguage, getDetailedLocation } from "../../utils/geolocationLanguage";
import { formatCurrency } from "../../utils/currency";
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
  const { t, i18n } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoadingLanguage, setIsLoadingLanguage] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [errors, setErrors] = useState({
    businessName: false,
    businessType: false,
    contactName: false,
    email: false,
  });
  const SuccessModal = ({ isOpen, onClose, message, type = "success" }) => {
  if (!isOpen) return null;

  return (
    <div className="lp-modal-overlay" onClick={onClose}>
      <div className="lp-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`lp-modal__icon lp-modal__icon--${type}`}>
          {type === "success" ? (
            <CheckCircle size={48} />
          ) : (
            <X size={48} />
          )}
        </div>
        <h3 className="lp-modal__title">
          {type === "success" ? t("modal.successTitle") : t("modal.errorTitle")}
        </h3>
        <p className="lp-modal__message">{message}</p>
        <button className="lp-btn lp-modal__btn" onClick={onClose}>
          {t("modal.close")}
        </button>
      </div>
    </div>
  );
};

  // Detect and set language based on geolocation
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        setIsLoadingLanguage(true);
        
        // Detect and set language based on user's location
        const detectedLang = await detectAndSetLanguage(i18n);
        console.log('Detected language:', detectedLang);

        // Optionally get detailed location info
        const locationData = await getDetailedLocation();
        setUserLocation(locationData);
        
        if (locationData) {
          console.log('User location:', locationData.country, locationData.city);
        }
      } catch (error) {
        console.error('Error initializing language:', error);
      } finally {
        setIsLoadingLanguage(false);
      }
    };

    initializeLanguage();
  }, [i18n]);
  
  const [modalState, setModalState] = useState({
  isOpen: false,
  message: "",
  type: "success"
});

  const benefitsData = [
    {
      icon: <TrendingUp size={24} />,
      title: t("benefits.items.seasonal.title"),
      description: t("benefits.items.seasonal.description"),
      color: "var(--success)",
    },
    {
      icon: <DollarSign size={24} />,
      title: t("benefits.items.revenue.title"),
      description: t("benefits.items.revenue.description"),
      color: "var(--primary)",
    },
    {
      icon: <Users size={24} />,
      title: t("benefits.items.loyalty.title"),
      description: t("benefits.items.loyalty.description"),
      color: "var(--primary-2)",
    },
    {
      icon: <Repeat size={24} />,
      title: t("benefits.items.repeat.title"),
      description: t("benefits.items.repeat.description"),
      color: "var(--success)",
    },
    {
      icon: <Target size={24} />,
      title: t("benefits.items.attract.title"),
      description: t("benefits.items.attract.description"),
      color: "var(--primary)",
    },
    {
      icon: <BarChart3 size={24} />,
      title: t("benefits.items.trackable.title"),
      description: t("benefits.items.trackable.description"),
      color: "var(--primary-2)",
    },
    {
      icon: <Eye size={24} />,
      title: t("benefits.items.visibility.title"),
      description: t("benefits.items.visibility.description"),
      color: "var(--success)",
    },
    {
      icon: <DollarSign size={24} />,
      title: t("benefits.items.orderValue.title"),
      description: t("benefits.items.orderValue.description"),
      color: "var(--primary)",
    },
    {
      icon: <Gift size={24} />,
      title: t("benefits.items.flexible.title"),
      description: t("benefits.items.flexible.description"),
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

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.classList.add("mobile-menu-open");
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.classList.remove("mobile-menu-open");
    }

    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.classList.remove("mobile-menu-open");
    };
  }, [isMobileMenuOpen]);

  // Show loading state while detecting language
  if (isLoadingLanguage) {
    return (
      <div className="lp-root" data-theme={theme}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="lp-root" data-theme={theme}>
      {/* Navbar */}
      <header className="lp-nav">
        <div className="lp-nav__brand" onClick={() => navigate("/")}>
          <img src={logo} alt="giftygen logo" className="lp-nav__logo" />
        </div>

        {/* Desktop Navigation */}
        <nav className="lp-nav__links">
          <button onClick={() => handleScrollTo("about")}>{t("nav.about")}</button>
          <button onClick={() => handleScrollTo("highlights")}>{t("nav.highlights")}</button>
          <button onClick={() => handleScrollTo("benefits")}>{t("nav.benefits")}</button>
          <button onClick={() => handleScrollTo("register")}>{t("nav.register")}</button>
          <button onClick={() => handleScrollTo("contact")}>{t("nav.contact")}</button>
        </nav>

        {/* Desktop CTA */}
        <div className="lp-nav__cta">
          
          <button className="lp-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button className="lp-btn lp-btn--ghost" onClick={() => navigate("/login")}>
            {t("nav.signIn")}
          </button>
          <button className="lp-btn" onClick={() => navigate("/explore")}>
            {t("nav.explore")}
          </button>
          <LanguageDropdown variant="desktop" />
        </div>

        {/* Mobile Menu Button */}
        <button className="lp-nav__mobile-toggle" onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Navigation Menu */}
      <div className={`lp-mobile-menu ${isMobileMenuOpen ? "lp-mobile-menu--open" : ""}`}>
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
          <button onClick={() => handleMobileNavClick("about")}>{t("nav.about")}</button>
          <button onClick={() => handleMobileNavClick("highlights")}>{t("nav.highlights")}</button>
          <button onClick={() => handleMobileNavClick("benefits")}>{t("nav.benefits")}</button>
          <button onClick={() => handleMobileNavClick("register")}>{t("nav.register")}</button>
          <button onClick={() => handleMobileNavClick("contact")}>{t("nav.contact")}</button>
        </nav>
        <div className="lp-mobile-cta">
          <button className="lp-btn lp-btn--ghost" onClick={() => navigate("/login")}>
            {t("nav.signIn")}
          </button>
          <button className="lp-btn" onClick={() => navigate("/explore")}>
            {t("nav.explore")}
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
          <div className="lp-kicker">{t("hero.kicker")}</div>
          <h1 className="lp-hero__title">{t("hero.title")}</h1>
          <p className="lp-hero__subtitle">{t("hero.subtitle")}</p>
          <p className="lp-hero__desc">{t("hero.description")}</p>
          <div className="lp-hero__actions">
            <button className="lp-btn" onClick={() => handleScrollTo("register")}>
              {t("hero.getStarted")}
            </button>
            <button className="lp-btn lp-btn--ghost" onClick={() => navigate("/explore")}>
              {t("hero.buyGiftCard")}
            </button>
          </div>
        </div>
        <div className="lp-hero__visual" aria-hidden>
          <div className="lp-giftcard" role="img" aria-label="Digital gift card illustration">
            <div className="lp-giftcard__ribbon" />
            <div className="lp-giftcard__brand">{t("giftCard.Brand")}</div>
            <div className="lp-giftcard__title">{t("giftCard.digitalGiftCard")}</div>
            <div className="lp-giftcard__amount">{formatCurrency(50, 'INR')}</div>
            <div className="lp-giftcard__meta">
              <span>{t("giftCard.to")}</span>
              <span>{t("giftCard.from")}</span>
            </div>
            <div className="lp-giftcard__pixels" />
          </div>
        </div>
      </section>

      {/* Business Offer */}
      <section className="lp-offer">
        <h2 className="lp-section__title lp-h2">{t("offer.title")}</h2>
        <p className="lp-lead">{t("offer.description")}</p>
      </section>

      {/* Product Highlights */}
      <section className="lp-section" id="highlights">
        <div className="lp-section__header">
          <h2 className="lp-section__title lp-h2">{t("highlights.title")}</h2>
        </div>

        <div className="lp-grid lp-grid--4">
          <div className="lp-feature-card">
            <div className="lp-feature-card__icon">
              <Zap className="lp-feature-icon" />
            </div>
            <div className="lp-feature-card__content">
              <h3 className="lp-h3">{t("highlights.smartDelivery.title")}</h3>
              <p>{t("highlights.smartDelivery.description")}</p>
              <div className="lp-feature-card__benefits">
                <span className="lp-feature-benefit">
                  <CheckCircle size={16} />
                  {t("highlights.smartDelivery.benefit1")}
                </span>
                <span className="lp-feature-benefit">
                  <CheckCircle size={16} />
                  {t("highlights.smartDelivery.benefit2")}
                </span>
              </div>
            </div>
          </div>

          <div className="lp-feature-card">
            <div className="lp-feature-card__icon">
              <Smartphone className="lp-feature-icon" />
            </div>
            <div className="lp-feature-card__content">
              <h3 className="lp-h3">{t("highlights.integration.title")}</h3>
              <p>{t("highlights.integration.description")}</p>
              <div className="lp-feature-card__benefits">
                <span className="lp-feature-benefit">
                  <CheckCircle size={16} />
                  {t("highlights.integration.benefit1")}
                </span>
                <span className="lp-feature-benefit">
                  <CheckCircle size={16} />
                  {t("highlights.integration.benefit2")}
                </span>
              </div>
            </div>
          </div>

          <div className="lp-feature-card">
            <div className="lp-feature-card__icon">
              <Shield className="lp-feature-icon" />
            </div>
            <div className="lp-feature-card__content">
              <h3 className="lp-h3">{t("highlights.security.title")}</h3>
              <p>{t("highlights.security.description")}</p>
              <div className="lp-feature-card__benefits">
                <span className="lp-feature-benefit">
                  <CheckCircle size={16} />
                  {t("highlights.security.benefit1")}
                </span>
                <span className="lp-feature-benefit">
                  <CheckCircle size={16} />
                  {t("highlights.security.benefit2")}
                </span>
              </div>
            </div>
          </div>

          <div className="lp-feature-card">
            <div className="lp-feature-card__icon">
              <Palette className="lp-feature-icon" />
            </div>
            <div className="lp-feature-card__content">
              <h3 className="lp-h3">{t("highlights.branding.title")}</h3>
              <p>{t("highlights.branding.description")}</p>
              <div className="lp-feature-card__benefits">
                <span className="lp-feature-benefit">
                  <CheckCircle size={16} />
                  {t("highlights.branding.benefit1")}
                </span>
                <span className="lp-feature-benefit">
                  <CheckCircle size={16} />
                  {t("highlights.branding.benefit2")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why giftygen / Benefits */}
      <section className="lp-section" id="benefits">
        <div className="lp-section__header">
          <h2 className="lp-section__title lp-h2">{t("benefits.title")}</h2>
          <p className="lp-section__subtitle">{t("benefits.subtitle")}</p>
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
          <h2 className="lp-section__title lp-h2">{t("register.title")}</h2>
          <p className="lp-lead">{t("register.subtitle")}</p>
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
            const nextErrors = {
              businessName: !payload.businessName?.trim(),
              businessType: !payload.businessType?.trim(),
              contactName: !payload.contactName?.trim(),
              email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(payload.email || ""),
            };
            setErrors(nextErrors);
            if (Object.values(nextErrors).some(Boolean)) {
              setNotice({ type: "error", text: "Please fix the highlighted fields." });
              setTimeout(() => setNotice(null), 8000);
              return;
            }
            try {
              if (payload.phone) {
                const phoneRegex = /^\([0-9]{3}\)\s[0-9]{3}-[0-9]{4}$/;
                if (!phoneRegex.test(payload.phone)) {
                  setNotice({ type: "error", text: "Please enter a valid phone number like (555) 123-4567." });
                  setTimeout(() => setNotice(null), 8000);
                  return;
                }
              }
              const res = await fetch("/api/v1/admin/registration-interest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              if (!res.ok) throw new Error("Failed to submit");
              setModalState({    
                 isOpen: true,
                 type: "success",
                 message: "Registration submitted successfully! Please check your email for confirmation and next steps. We'll be in touch within 24 hours."
               });            
               form.reset();
              setPhone("");
              setErrors({ businessName: false, businessType: false, contactName: false, email: false });
              setTimeout(() => setNotice(null), 60000);
            } catch (err) {
              setModalState({
                isOpen: true,
                type: "error",
                message: "Sorry, something went wrong. Please try again later."
              });

              setTimeout(() => setNotice(null), 8000);
            }
          }}
        >
          <div className="lp-form__grid">
            <div className="lp-field">
              <label>{t("register.form.businessName")}</label>
              <input
                type="text"
                name="businessName"
                placeholder={t("register.form.businessNamePlaceholder")}
                className={errors.businessName ? "lp-input--error" : undefined}
                onInput={() => setErrors((e) => ({ ...e, businessName: false }))}
              />
            </div>
            <div className="lp-field">
              <label>{t("register.form.businessType")}</label>
              <input
                type="text"
                name="businessType"
                placeholder={t("register.form.businessTypePlaceholder")}
                className={errors.businessType ? "lp-input--error" : undefined}
                onInput={() => setErrors((e) => ({ ...e, businessType: false }))}
              />
            </div>
            <div className="lp-field">
              <label>{t("register.form.contactName")}</label>
              <input
                type="text"
                name="contactName"
                placeholder={t("register.form.contactNamePlaceholder")}
                className={errors.contactName ? "lp-input--error" : undefined}
                onInput={() => setErrors((e) => ({ ...e, contactName: false }))}
              />
            </div>
            <div className="lp-field">
              <label>{t("register.form.email")}</label>
              <input
                type="email"
                name="email"
                placeholder={t("register.form.emailPlaceholder")}
                className={errors.email ? "lp-input--error" : undefined}
                onInput={() => setErrors((e) => ({ ...e, email: false }))}
              />
            </div>
            <div className="lp-field">
              <label>{t("register.form.phone")}</label>
              <input
                type="tel"
                name="phone"
                inputMode="numeric"
                autoComplete="tel"
                placeholder={t("register.form.phonePlaceholder")}
                value={phone}
                onChange={(e) => setPhone(formatUSPhone(e.target.value))}
                maxLength={14}
                aria-label="US phone number"
              />
            </div>
            <div className="lp-field">
              <label>{t("register.form.website")}</label>
              <input type="url" name="website" placeholder={t("register.form.websitePlaceholder")} />
            </div>
            <div className="lp-field lp-field--full">
              <label>{t("register.form.notes")}</label>
              <textarea name="notes" rows="4" placeholder={t("register.form.notesPlaceholder")}></textarea>
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
            {t("register.form.submit")}
          </button>
        </form>
      </section>

      {/* Contact */}
      <section className="lp-section lp-contact" id="contact">
        <div className="lp-contact__content">
          <div>
            <h2>{t("nav.contact")}</h2>
            <p className="lp-contact__lead">
              {t("contact.description")}
            </p>
            <div className="lp-contact__actions">
              <a className="lp-btn" href="https://giftygen.com" target="_blank" rel="noreferrer">
                {t("contact.visitWebsite")}
              </a>
              <button className="lp-btn lp-btn--ghost" onClick={() => navigate("/explore")}>
                {t("contact.exploreCards")}
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
            <span>{t("contact.scanText")}</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer__brand">
          <img src={logo} alt="giftygen logo" />
          <span>giftygen</span>
        </div>
        <div className="lp-footer__right">© {new Date().getFullYear()} {t("footer.rights")}</div>
      </footer>
      <SuccessModal
      isOpen={modalState.isOpen}
      onClose={() => setModalState({ ...modalState, isOpen: false })}
      message={modalState.message}
      type={modalState.type}
/>
    </div>
  );
}

export default LandingPage;