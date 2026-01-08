import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import logo from "../../assets/giftygen_logo.svg";
import logoWhiteBg from "../../assets/giftgen_whitebg_logo.png";
import { useTranslation } from "react-i18next";
import "../../i18n";

import LanguageDropdown from "../../components/LanguageDropdown";
import { detectAndSetLanguage, getDetailedLocation } from "../../utils/geolocationLanguage";
import { formatCurrency } from "../../utils/currency";
import SEO from "../../components/SEO";
import { getOrganizationSchema, getWebsiteSchema } from "../../utils/structuredData";
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
  CreditCard,
  Wifi,
  Settings,
  PieChart,
  Clock,
  Lock,
  Send,
  Layers,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    businessName: false,
    businessType: false,
    contactName: false,
    email: false,
  });
  const [isCardsVisible, setIsCardsVisible] = useState(false);
  const cardsGridRef = useRef(null);
  const SuccessModal = ({ isOpen, onClose, message, type = "success" }) => {
    if (!isOpen) return null;

    return (
      <div className="lp-modal-overlay" onClick={onClose}>
        <div
          className="lp-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`lp-modal__icon lp-modal__icon--${type}`}>
            {type === "success" ? <CheckCircle size={48} /> : <X size={48} />}
          </div>
          <h3 id="modal-title" className="lp-modal__title">
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

  const BusinessModal = ({ isOpen, onClose, businessType }) => {
    if (!isOpen || !businessType) return null;

    const businessData = t(`businessCategories.${businessType}`, { returnObjects: true });

    return (
      <div className="lp-modal-overlay" onClick={onClose}>
        <div
          className="lp-business-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="business-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="lp-business-modal__close" onClick={onClose} aria-label="Close modal">
            <X size={24} />
          </button>
          <div className="lp-business-modal__header">
            <h2 id="business-modal-title" className="lp-business-modal__title">
              {businessData.title}
            </h2>
            <p className="lp-business-modal__subtitle">{businessData.subtitle}</p>
          </div>
          <div className="lp-business-modal__content">
            <p className="lp-business-modal__description">{businessData.description}</p>
            <div className="lp-business-modal__features">
              <h3 className="lp-business-modal__features-title">{businessData.featuresTitle}</h3>
              <ul className="lp-business-modal__features-list">
                {businessData.features.map((feature, index) => (
                  <li key={index}>
                    <CheckCircle size={18} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lp-business-modal__benefits">
              <h3 className="lp-business-modal__benefits-title">{businessData.benefitsTitle}</h3>
              <ul className="lp-business-modal__benefits-list">
                {businessData.benefits.map((benefit, index) => (
                  <li key={index}>
                    <Star size={16} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="lp-business-modal__actions">
            <button
              className="lp-btn"
              onClick={() => {
                onClose();
                handleScrollTo("register");
              }}
            >
              {t("businessCategories.cta.register")}
            </button>
            <button className="lp-btn lp-btn--ghost" onClick={onClose}>
              {t("businessCategories.cta.close")}
            </button>
          </div>
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
        console.log("Detected language:", detectedLang);

        // Optionally get detailed location info
        const locationData = await getDetailedLocation();
        setUserLocation(locationData);

        if (locationData) {
          console.log("User location:", locationData.country, locationData.city);
        }
      } catch (error) {
        console.error("Error initializing language:", error);
      } finally {
        setIsLoadingLanguage(false);
      }
    };

    initializeLanguage();
  }, [i18n]);

  const [modalState, setModalState] = useState({
    isOpen: false,
    message: "",
    type: "success",
  });

  const [businessModalState, setBusinessModalState] = useState({
    isOpen: false,
    selectedBusiness: null,
  });

  // Animation states for the gift card reveal section
  // Phases: initial -> scanning -> laptop-appear -> zoom-in -> revealed
  const [animationPhase, setAnimationPhase] = useState("initial");
  const [hasAnimated, setHasAnimated] = useState(false);
  const animationSectionRef = useRef(null);

  // Animation phases: initial -> scanning -> laptop-appear -> zoom-in -> revealed
  const startAnimation = useCallback(() => {
    if (hasAnimated) return;
    setHasAnimated(true);

    // Phase 1: Start scanning animation
    setAnimationPhase("scanning");

    // Phase 2: After scan completes (2 seconds), laptop appears
    setTimeout(() => {
      setAnimationPhase("laptop-appear");
    }, 2000);

    // Phase 3: After laptop appears (1.5 seconds), zoom into laptop screen
    setTimeout(() => {
      setAnimationPhase("zoom-in");
    }, 3500);

    // Phase 4: After zoom completes (1.5 seconds), reveal categories
    setTimeout(() => {
      setAnimationPhase("revealed");
    }, 5000);
  }, [hasAnimated]);

  // Intersection Observer for scroll-triggered animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            startAnimation();
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "-50px 0px",
      }
    );

    if (animationSectionRef.current) {
      observer.observe(animationSectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, startAnimation]);

  // Business category images mapping
  // Place images in: frontend/public/images/business-categories/
  // Supported formats: .jpg, .jpeg, .png, .webp
  // Image names should match: restaurants.jpg, hotels.jpg, retail.jpg, salons.jpg, fitness.jpg, seasonal.jpg
  const businessCategoryImages = {
    restaurants: "/images/business-categories/restaurants.jpg",
    hotels: "/images/business-categories/hotels.jpg",
    retail: "/images/business-categories/retail.jpg",
    salons: "/images/business-categories/salons.jpg",
    fitness: "/images/business-categories/fitness.jpg",
    seasonal: "/images/business-categories/seasonal.jpeg",
  };

  const benefitsData = useMemo(
    () => [
      {
        id: "seasonal",
        icon: <TrendingUp size={24} />,
        title: t("benefits.items.seasonal.title"),
        description: t("benefits.items.seasonal.description"),
        color: "var(--success)",
      },
      {
        id: "revenue",
        icon: <DollarSign size={24} />,
        title: t("benefits.items.revenue.title"),
        description: t("benefits.items.revenue.description"),
        color: "var(--primary)",
      },
      {
        id: "loyalty",
        icon: <Users size={24} />,
        title: t("benefits.items.loyalty.title"),
        description: t("benefits.items.loyalty.description"),
        color: "var(--primary-2)",
      },
      {
        id: "repeat",
        icon: <Repeat size={24} />,
        title: t("benefits.items.repeat.title"),
        description: t("benefits.items.repeat.description"),
        color: "var(--success)",
      },
      {
        id: "attract",
        icon: <Target size={24} />,
        title: t("benefits.items.attract.title"),
        description: t("benefits.items.attract.description"),
        color: "var(--primary)",
      },
      {
        id: "trackable",
        icon: <BarChart3 size={24} />,
        title: t("benefits.items.trackable.title"),
        description: t("benefits.items.trackable.description"),
        color: "var(--primary-2)",
      },
      {
        id: "visibility",
        icon: <Eye size={24} />,
        title: t("benefits.items.visibility.title"),
        description: t("benefits.items.visibility.description"),
        color: "var(--success)",
      },
      {
        id: "orderValue",
        icon: <DollarSign size={24} />,
        title: t("benefits.items.orderValue.title"),
        description: t("benefits.items.orderValue.description"),
        color: "var(--primary)",
      },
      {
        id: "flexible",
        icon: <Gift size={24} />,
        title: t("benefits.items.flexible.title"),
        description: t("benefits.items.flexible.description"),
        color: "var(--primary-2)",
      },
    ],
    [t]
  );

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

  // Intersection Observer for cards animation
  useEffect(() => {
    // Check if mobile device
    const isMobile = window.innerWidth <= 768;

    // On mobile, show cards immediately
    if (isMobile) {
      setIsCardsVisible(true);
      return;
    }

    let observer;
    let fallbackTimeout;

    // Check if section is already in view on mount
    const checkInitialVisibility = () => {
      if (cardsGridRef.current) {
        const rect = cardsGridRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
          setIsCardsVisible(true);
          return true;
        }
      }
      return false;
    };

    // Check immediately
    const alreadyVisible = checkInitialVisibility();

    // If not visible, set up observer
    if (!alreadyVisible) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsCardsVisible(true);
              if (observer) {
                observer.unobserve(entry.target);
              }
            }
          });
        },
        {
          threshold: 0.05, // Trigger when 5% of the section is visible
          rootMargin: "100px 0px 0px 0px", // Trigger 100px before it enters viewport
        }
      );

      if (cardsGridRef.current) {
        observer.observe(cardsGridRef.current);
      }

      // Fallback: Show cards after 2 seconds if observer hasn't triggered
      fallbackTimeout = setTimeout(() => {
        setIsCardsVisible(true);
      }, 2000);
    }

    return () => {
      if (observer && cardsGridRef.current) {
        observer.unobserve(cardsGridRef.current);
      }
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
      }
    };
  }, []);

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const formatIndianPhone = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);

    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5)}`;
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

  /* // Show loading state while detecting language
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
  } */

  // SEO structured data
  const structuredData = [getOrganizationSchema(), getWebsiteSchema()];

  return (
    <div className="lp-root" data-theme={theme}>
      <SEO
        title="GiftyGen - Digital Gift Cards for Restaurants & Businesses"
        description="Create, manage, and sell digital gift cards for your restaurant or business. Increase revenue, build customer loyalty, and offer flexible gift card solutions with GiftyGen."
        keywords="digital gift cards, restaurant gift cards, business gift cards, gift card platform, gift card management, e-gift cards, digital vouchers"
        url="https://giftygen.com"
        structuredData={structuredData}
      />
      {/* Navbar */}
      <header className="lp-nav">
        <div className="lp-nav__brand" onClick={() => navigate("/")}>
          <img
            src={theme === "light" ? logoWhiteBg : logo}
            alt="GiftyGen digital gift card platform logo"
            width={120}
            height={40}
            className="lp-nav__logo"
          />
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
          <a href="/explore" className="lp-btn">
            {t("nav.explore")}
          </a>
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
            <img src={theme === "light" ? logoWhiteBg : logo} alt="giftygen logo" className="lp-mobile-header__logo" />
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
              {t("hero.startFreeTrial")}
            </button>
            <button className="lp-btn" onClick={() => handleScrollTo("register")}>
              {t("hero.scheduleDemo")}
            </button>
          </div>
        </div>
        <div className="lp-hero__visual" aria-hidden>
          <div className="lp-giftcard" role="img" aria-label="Digital gift card illustration">
            <div className="lp-giftcard__ribbon" />
            <div className="lp-giftcard__brand">{t("giftCard.Brand")}</div>
            <div className="lp-giftcard__title">{t("giftCard.digitalGiftCard")}</div>
            <div className="lp-giftcard__amount">{formatCurrency(499, "INR")}</div>
            <div className="lp-giftcard__meta">
              <span>{t("giftCard.to")}</span>
              <span>{t("giftCard.from")}</span>
            </div>
            <div className="lp-giftcard__pixels" />
          </div>
        </div>
      </section>

      {/* Animated Business Offer Section */}
      <section
        className={`lp-offer lp-animated-section lp-animated-section--${animationPhase}`}
        ref={animationSectionRef}
      >
        <h2 className="lp-section__title lp-h2">{t("offer.title")}</h2>
        <p className="lp-lead">{t("offer.description")}</p>

        {/* Animated Gift Card Container */}
        <div className="lp-gift-animation-container">
          {/* The scanning gift card - visible only in initial and scanning phases */}
          <div
            className={`lp-scan-giftcard ${
              animationPhase === "laptop-appear" || animationPhase === "zoom-in" || animationPhase === "revealed"
                ? "lp-scan-giftcard--hidden"
                : ""
            }`}
          >
            {/* Floating particles background */}
            <div className="lp-particles">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="lp-particle"
                  style={{
                    "--delay": `${Math.random() * 2}s`,
                    "--x": `${Math.random() * 100}%`,
                    "--y": `${Math.random() * 100}%`,
                    "--duration": `${2 + Math.random() * 3}s`,
                  }}
                />
              ))}
            </div>

            {/* The gift card */}
            <div className="lp-scan-card">
              <div className="lp-scan-card__glow" />
              <div className="lp-scan-card__inner">
                <div className="lp-scan-card__header">
                  <CreditCard className="lp-scan-card__icon" size={24} />
                  <span className="lp-scan-card__brand">GiftyGen</span>
                </div>
                <div className="lp-scan-card__chip" />
                <div className="lp-scan-card__nfc">
                  <Wifi size={18} />
                </div>
                <div className="lp-scan-card__title">{t("giftCard.digitalGiftCard")}</div>
                <div className="lp-scan-card__amount">{formatCurrency(500, "INR")}</div>
                <div className="lp-scan-card__qr">
                  <div className="lp-qr-pattern">
                    {[...Array(25)].map((_, i) => (
                      <div
                        key={i}
                        className="lp-qr-cell"
                        style={{
                          opacity: Math.random() > 0.5 ? 1 : 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Scan line animation - only during scanning phase */}
              {animationPhase === "scanning" && (
                <>
                  <div className="lp-scan-line" />
                  <div className="lp-scan-glow" />
                  <div className="lp-scan-pulse" />
                  {/* NFC wave animation */}
                  <div className="lp-nfc-waves">
                    <div className="lp-nfc-wave" />
                    <div className="lp-nfc-wave" style={{ animationDelay: "0.3s" }} />
                    <div className="lp-nfc-wave" style={{ animationDelay: "0.6s" }} />
                  </div>
                </>
              )}
            </div>

            {/* Scanning status text */}
            {animationPhase === "scanning" && (
              <div className="lp-scan-status">
                <div className="lp-scan-status__dot" />
                <span>Scanning gift card...</span>
              </div>
            )}
          </div>

          {/* Laptop with category cards inside - appears after scan */}
          <div
            className={`lp-laptop-container ${
              animationPhase === "laptop-appear" || animationPhase === "zoom-in" || animationPhase === "revealed"
                ? "lp-laptop-container--visible"
                : ""
            } ${animationPhase === "zoom-in" || animationPhase === "revealed" ? "lp-laptop-container--zoomed" : ""}`}
          >
            {/* Laptop body */}
            <div className="lp-laptop">
              {/* Laptop screen */}
              <div className="lp-laptop__screen">
                <div className="lp-laptop__screen-bezel">
                  {/* Camera dot */}
                  <div className="lp-laptop__camera" />
                  {/* Screen content - Category cards grid inside */}
                  <div className="lp-laptop__display">
                    {/* Header bar */}
                    <div className="lp-laptop__header-bar">
                      <div className="lp-laptop__logo">
                        <CreditCard size={14} />
                        <span>GiftyGen</span>
                      </div>
                      <div className="lp-laptop__nav-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                    {/* Category cards grid */}
                    <div className="lp-laptop__categories">
                      {["restaurants", "hotels", "retail", "salons", "fitness", "seasonal"].map((category, index) => (
                        <div
                          key={category}
                          className="lp-laptop__category-card"
                          style={{ "--card-delay": `${index * 0.1}s` }}
                        >
                          <div
                            className="lp-laptop__category-img"
                            style={{ backgroundImage: `url(${businessCategoryImages[category]})` }}
                          />
                          <div className="lp-laptop__category-name">{t(`businessCategories.${category}.title`)}</div>
                        </div>
                      ))}
                    </div>
                    {/* Screen glow effect */}
                    <div className="lp-laptop__screen-glow" />
                  </div>
                </div>
              </div>
              {/* Laptop base/keyboard */}
              <div className="lp-laptop__base">
                <div className="lp-laptop__trackpad" />
              </div>
              {/* Laptop shadow */}
              <div className="lp-laptop__shadow" />
            </div>
          </div>

          {/* Burst particles during zoom transition */}
          {animationPhase === "zoom-in" && (
            <div className="lp-burst-container">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="lp-burst-particle"
                  style={{
                    "--angle": `${(i / 20) * 360}deg`,
                    "--distance": `${80 + Math.random() * 100}px`,
                    "--delay": `${Math.random() * 0.3}s`,
                    "--size": `${3 + Math.random() * 6}px`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Business Category Cards - revealed after animation, in same position */}
          <div
            className={`lp-business-categories lp-business-categories--animated ${
              animationPhase === "revealed" ? "lp-business-categories--visible" : ""
            }`}
          >
            <div className="lp-business-categories__grid">
              {["restaurants", "hotels", "retail", "salons", "fitness", "seasonal"].map((category, index) => (
                <div
                  key={category}
                  className={`lp-business-card lp-business-card--${category} lp-business-card--animated`}
                  style={{ "--reveal-delay": `${index * 0.12}s` }}
                  onClick={() => setBusinessModalState({ isOpen: true, selectedBusiness: category })}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setBusinessModalState({ isOpen: true, selectedBusiness: category });
                    }
                  }}
                  aria-label={`Learn how GiftyGen helps ${t(`businessCategories.${category}.title`)}`}
                >
                  <div className="lp-business-card__image">
                    <img
                      src={businessCategoryImages[category]}
                      alt={t(`businessCategories.${category}.title`)}
                      className="lp-business-card__img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = "none";
                        const gradient = e.target.nextElementSibling;
                        if (gradient) {
                          gradient.style.display = "block";
                        }
                      }}
                    />
                    <div className="lp-business-card__gradient" style={{ display: "none" }}></div>
                    {/* Button overlaid on image */}
                    <div className="lp-business-card__overlay">
                      <button className="lp-business-card__button">{t(`businessCategories.${category}.title`)}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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

      {/* Gift Card Management Features */}
      <section className="lp-section lp-book-features-section" id="features">
        <div className="lp-section__header">
          <h2 className="lp-section__title lp-h2">
            Gift Card Management Features That Drive Revenue & Customer Loyalty
          </h2>
        </div>

        <div className="lp-book-cards-grid" ref={cardsGridRef}>
          {/* Card 1 - Apple Wallet & Google Pay */}
          <div
            className={`lp-book-card ${isCardsVisible ? "lp-book-card--animate" : ""}`}
            style={{ "--card-index": 0 }}
          >
            <div className="lp-flip-card">
              <div className="lp-flip-card__container">
                <div className="lp-card-front">
                  <div className="lp-card-front__tp lp-card-front__tp--pink">
                    <span className="lp-card-front__category lp-card-front__category--pink">For data-driven</span>
                    <img
                      src="/images/feature-cards/apple-wallet-google-pay.png"
                      alt="Apple Wallet & Google Pay Integration"
                      className="lp-card-front__image"
                    />
                    <h3 className="lp-card-front__heading">
                      Apple Wallet & Google Pay Integration for Digital Gift Cards
                    </h3>
                    <button
                      className="lp-card-mobile-btn lp-card-mobile-btn--pink"
                      onClick={() => handleScrollTo("register")}
                    >
                      Know More
                    </button>
                  </div>
                </div>
                <div className="lp-card-back lp-card-back--pink"></div>
              </div>
            </div>
            <div className="lp-inside-page">
              <div className="lp-inside-page__container">
                <h3 className="lp-inside-page__heading lp-inside-page__heading--pink">
                  Apple Wallet & Google Pay Integration for Digital Gift Cards
                </h3>
                <button
                  className="lp-inside-page__btn lp-inside-page__btn--pink"
                  onClick={() => handleScrollTo("register")}
                >
                  View details
                </button>
              </div>
            </div>
          </div>

          {/* Card 2 - Seasonal Campaigns */}
          <div
            className={`lp-book-card ${isCardsVisible ? "lp-book-card--animate" : ""}`}
            style={{ "--card-index": 1 }}
          >
            <div className="lp-flip-card">
              <div className="lp-flip-card__container">
                <div className="lp-card-front">
                  <div className="lp-card-front__tp lp-card-front__tp--cyan">
                    <span className="lp-card-front__category lp-card-front__category--cyan">For instant</span>
                    <img
                      src="/images/feature-cards/seasonal-campaigns.png"
                      alt="Seasonal Gift Card Campaigns"
                      className="lp-card-front__image"
                    />
                    <h3 className="lp-card-front__heading">Seasonal Gift Card Campaigns & Promotion Management</h3>
                    <button
                      className="lp-card-mobile-btn lp-card-mobile-btn--cyan"
                      onClick={() => handleScrollTo("register")}
                    >
                      Know More
                    </button>
                  </div>
                </div>
                <div className="lp-card-back lp-card-back--cyan"></div>
              </div>
            </div>
            <div className="lp-inside-page">
              <div className="lp-inside-page__container">
                <h3 className="lp-inside-page__heading lp-inside-page__heading--cyan">
                  Seasonal Gift Card Campaigns & Promotion Management
                </h3>
                <button
                  className="lp-inside-page__btn lp-inside-page__btn--cyan"
                  onClick={() => handleScrollTo("register")}
                >
                  View details
                </button>
              </div>
            </div>
          </div>

          {/* Card 3 - Customer Acquisition */}
          <div
            className={`lp-book-card ${isCardsVisible ? "lp-book-card--animate" : ""}`}
            style={{ "--card-index": 2 }}
          >
            <div className="lp-flip-card">
              <div className="lp-flip-card__container">
                <div className="lp-card-front">
                  <div className="lp-card-front__tp lp-card-front__tp--orange">
                    <img
                      src="/images/feature-cards/customer-acquisition.png"
                      alt="Customer Acquisition"
                      className="lp-card-front__image"
                    />
                    <h3 className="lp-card-front__heading">Customer Acquisition Through Branded Digital Gift Cards</h3>
                    <button
                      className="lp-card-mobile-btn lp-card-mobile-btn--orange"
                      onClick={() => handleScrollTo("register")}
                    >
                      Know More
                    </button>
                  </div>
                </div>
                <div className="lp-card-back lp-card-back--orange"></div>
              </div>
            </div>
            <div className="lp-inside-page">
              <div className="lp-inside-page__container">
                <h3 className="lp-inside-page__heading lp-inside-page__heading--orange">
                  Customer Acquisition Through Branded Digital Gift Cards
                </h3>
                <button
                  className="lp-inside-page__btn lp-inside-page__btn--orange"
                  onClick={() => handleScrollTo("register")}
                >
                  View details
                </button>
              </div>
            </div>
          </div>

          {/* Card 4 - Increase Revenue */}
          <div
            className={`lp-book-card ${isCardsVisible ? "lp-book-card--animate" : ""}`}
            style={{ "--card-index": 3 }}
          >
            <div className="lp-flip-card">
              <div className="lp-flip-card__container">
                <div className="lp-card-front">
                  <div className="lp-card-front__tp lp-card-front__tp--green">
                    <img
                      src="/images/feature-cards/increase-revenue.jpg"
                      alt="Increase Revenue"
                      className="lp-card-front__image"
                    />
                    <h3 className="lp-card-front__heading">Increase Revenue With Upfront Cash Flow & Breakage</h3>
                    <button
                      className="lp-card-mobile-btn lp-card-mobile-btn--green"
                      onClick={() => handleScrollTo("register")}
                    >
                      Know More
                    </button>
                  </div>
                </div>
                <div className="lp-card-back lp-card-back--green"></div>
              </div>
            </div>
            <div className="lp-inside-page">
              <div className="lp-inside-page__container">
                <h3 className="lp-inside-page__heading lp-inside-page__heading--green">
                  Increase Revenue With Upfront Cash Flow & Breakage
                </h3>
                <button
                  className="lp-inside-page__btn lp-inside-page__btn--green"
                  onClick={() => handleScrollTo("register")}
                >
                  View details
                </button>
              </div>
            </div>
          </div>

          {/* Card 5 - Average Order Value */}
          <div
            className={`lp-book-card ${isCardsVisible ? "lp-book-card--animate" : ""}`}
            style={{ "--card-index": 4 }}
          >
            <div className="lp-flip-card">
              <div className="lp-flip-card__container">
                <div className="lp-card-front">
                  <div className="lp-card-front__tp lp-card-front__tp--purple">
                    <img
                      src="/images/feature-cards/average-order-value.png"
                      alt="Average Order Value"
                      className="lp-card-front__image"
                    />
                    <h3 className="lp-card-front__heading">Increase Average Order Value With Digital Gift Cards</h3>
                    <button
                      className="lp-card-mobile-btn lp-card-mobile-btn--purple"
                      onClick={() => handleScrollTo("register")}
                    >
                      Know More
                    </button>
                  </div>
                </div>
                <div className="lp-card-back lp-card-back--purple"></div>
              </div>
            </div>
            <div className="lp-inside-page">
              <div className="lp-inside-page__container">
                <h3 className="lp-inside-page__heading lp-inside-page__heading--purple">
                  Increase Average Order Value With Digital Gift Cards
                </h3>
                <button
                  className="lp-inside-page__btn lp-inside-page__btn--purple"
                  onClick={() => handleScrollTo("register")}
                >
                  View details
                </button>
              </div>
            </div>
          </div>

          {/* Card 6 - Real-Time Analytics */}
          <div
            className={`lp-book-card ${isCardsVisible ? "lp-book-card--animate" : ""}`}
            style={{ "--card-index": 5 }}
          >
            <div className="lp-flip-card">
              <div className="lp-flip-card__container">
                <div className="lp-card-front">
                  <div className="lp-card-front__tp lp-card-front__tp--blue">
                    <span className="lp-card-front__category lp-card-front__category--blue">For omnichannel</span>
                    <img
                      src="/images/feature-cards/real-time-analytics.jpg"
                      alt="Real-Time Analytics"
                      className="lp-card-front__image"
                    />
                    <h3 className="lp-card-front__heading">Real-Time Gift Card Analytics & Business Insights</h3>
                    <button
                      className="lp-card-mobile-btn lp-card-mobile-btn--blue"
                      onClick={() => handleScrollTo("register")}
                    >
                      Know More
                    </button>
                  </div>
                </div>
                <div className="lp-card-back lp-card-back--blue"></div>
              </div>
            </div>
            <div className="lp-inside-page">
              <div className="lp-inside-page__container">
                <h3 className="lp-inside-page__heading lp-inside-page__heading--blue">
                  Real-Time Gift Card Analytics & Business Insights
                </h3>
                <button
                  className="lp-inside-page__btn lp-inside-page__btn--blue"
                  onClick={() => handleScrollTo("register")}
                >
                  View details
                </button>
              </div>
            </div>
          </div>

          {/* Card 7 - Customer Retention */}
          <div
            className={`lp-book-card ${isCardsVisible ? "lp-book-card--animate" : ""}`}
            style={{ "--card-index": 6 }}
          >
            <div className="lp-flip-card">
              <div className="lp-flip-card__container">
                <div className="lp-card-front">
                  <div className="lp-card-front__tp lp-card-front__tp--teal">
                    <img
                      src="/images/feature-cards/customer-retention.jpg"
                      alt="Customer Retention"
                      className="lp-card-front__image"
                    />
                    <h3 className="lp-card-front__heading">
                      Increase Customer Retention With Gift Card Loyalty Programs
                    </h3>
                    <button
                      className="lp-card-mobile-btn lp-card-mobile-btn--teal"
                      onClick={() => handleScrollTo("register")}
                    >
                      Know More
                    </button>
                  </div>
                </div>
                <div className="lp-card-back lp-card-back--teal"></div>
              </div>
            </div>
            <div className="lp-inside-page">
              <div className="lp-inside-page__container">
                <h3 className="lp-inside-page__heading lp-inside-page__heading--teal">
                  Increase Customer Retention With Gift Card Loyalty Programs
                </h3>
                <button
                  className="lp-inside-page__btn lp-inside-page__btn--teal"
                  onClick={() => handleScrollTo("register")}
                >
                  View details
                </button>
              </div>
            </div>
          </div>

          {/* Card 8 - Multi-Channel Campaigns */}
          <div
            className={`lp-book-card ${isCardsVisible ? "lp-book-card--animate" : ""}`}
            style={{ "--card-index": 7 }}
          >
            <div className="lp-flip-card">
              <div className="lp-flip-card__container">
                <div className="lp-card-front">
                  <div className="lp-card-front__tp lp-card-front__tp--coral">
                    <img
                      src="/images/feature-cards/multi-channel-campaigns.jpg"
                      alt="Multi-Channel Campaigns"
                      className="lp-card-front__image"
                    />
                    <h3 className="lp-card-front__heading">Multi-Channel Promotional Campaigns</h3>
                    <button
                      className="lp-card-mobile-btn lp-card-mobile-btn--coral"
                      onClick={() => handleScrollTo("register")}
                    >
                      Know More
                    </button>
                  </div>
                </div>
                <div className="lp-card-back lp-card-back--coral"></div>
              </div>
            </div>
            <div className="lp-inside-page">
              <div className="lp-inside-page__container">
                <h3 className="lp-inside-page__heading lp-inside-page__heading--coral">
                  Multi-Channel Promotional Campaigns
                </h3>
                <button
                  className="lp-inside-page__btn lp-inside-page__btn--coral"
                  onClick={() => handleScrollTo("register")}
                >
                  View details
                </button>
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
                <div
                  key={index}
                  className="lp-benefit-card"
                  onClick={() => navigate(`/benefit/${benefit.id}`)}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/benefit/${benefit.id}`);
                    }
                  }}
                  aria-label={`Learn more about ${benefit.title}`}
                >
                  <div className="lp-benefit-icon" style={{ color: benefit.color }}>
                    {benefit.icon}
                  </div>
                  <h3 className="lp-benefit-title">{benefit.title}</h3>
                  <p className="lp-benefit-description">{benefit.description}</p>
                  <div className="lp-benefit-link">
                    <span>Learn more</span>
                    <ArrowRight size={16} />
                  </div>
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
                const cleanedPhone = payload.phone.replace(/\s/g, "");
                if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
                  setModalState({
                    isOpen: true,
                    type: "error",
                    message: "Please enter a valid Indian mobile number (10 digits).",
                  });
                  return;
                }
                payload.phone = `+91${cleanedPhone}`;
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
                message:
                  "Registration submitted successfully! Please check your email for confirmation and next steps. We'll be in touch within 24 hours.",
              });
              form.reset();
              setPhone("");
              setErrors({ businessName: false, businessType: false, contactName: false, email: false });
              setTimeout(() => setNotice(null), 60000);
            } catch (err) {
              setModalState({
                isOpen: true,
                type: "error",
                message: "Sorry, something went wrong. Please try again later.",
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
                onChange={(e) => setPhone(formatIndianPhone(e.target.value))}
                maxLength={11}
                aria-label="Indian mobile number"
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
            <p className="lp-contact__lead">{t("contact.description")}</p>
            <div className="lp-contact__actions">
              <a className="lp-btn" href="https://giftygen.com" target="_blank" rel="noreferrer">
                {t("contact.visitWebsite")}
              </a>
              <a href="/explore" className="lp-btn">
                {t("contact.exploreCards")}
              </a>
            </div>
          </div>
          {/* <div className="lp-qr">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                "https://giftygen.com"
              )}&size=160x160`}
              alt="QR code for giftygen.com"
            />
            <span>{t("contact.scanText")}</span>
          </div> */}
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer__brand">
          <img src={logo} alt="giftygen logo" />
          <span>giftygen</span>
        </div>
        <div className="lp-footer__links">
          <button onClick={() => navigate("/privacy-policy")}>Privacy Policy</button>
          <button onClick={() => navigate("/terms-of-service")}>Terms of Service</button>
        </div>
        <div className="lp-footer__right">
          © {new Date().getFullYear()} {t("footer.rights")}
        </div>
      </footer>
      <SuccessModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        message={modalState.message}
        type={modalState.type}
      />
      <BusinessModal
        isOpen={businessModalState.isOpen}
        onClose={() => setBusinessModalState({ isOpen: false, selectedBusiness: null })}
        businessType={businessModalState.selectedBusiness}
      />
    </div>
  );
}

export default LandingPage;
