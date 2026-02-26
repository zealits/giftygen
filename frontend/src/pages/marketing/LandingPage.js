import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import logo from "../../assets/giftygen_logo_1.png";
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
  Info,
  Sparkles,
  Mail,
  Home,
  ChevronDown,
  Check,
} from "lucide-react";

function LandingPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("giftygen_theme") || "dark");
  const [phone, setPhone] = useState("");
  const [notice, setNotice] = useState(null);
  const { t, i18n } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSolutionsDropdownOpen, setIsSolutionsDropdownOpen] = useState(false);
  const [isLoadingLanguage, setIsLoadingLanguage] = useState(true);
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const stored = typeof localStorage !== "undefined" ? localStorage.getItem("giftygen_user_location") : null;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.country === "string") return parsed;
      }
    } catch (_) {}
    return null;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mobileMenuRef = useRef(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Determine currency and amount based on user location
  const getCurrencyConfig = useMemo(() => {
    if (!userLocation || !userLocation.country) {
      // Default to INR if location not detected yet
      return { currency: "INR", amount: 499, displayAmount: 499, locale: "en-IN" };
    }

    const isIndia = userLocation.country === "IN";
    if (isIndia) {
      return { currency: "INR", amount: 499, displayAmount: 499, locale: "en-IN" };
    } else {
      // For USA and all other non-India countries, use USD
      return { currency: "USD", amount: 50, displayAmount: 50, locale: "en-US" };
    }
  }, [userLocation]);
  const [errors, setErrors] = useState({
    businessName: false,
    businessType: false,
    contactName: false,
    email: false,
  });
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [isCardsVisible, setIsCardsVisible] = useState(false);
  const cardsGridRef = useRef(null);
  const creativeCardsRef = useRef(null);
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

  const FeatureModal = ({ isOpen, onClose, feature }) => {
    if (!isOpen || !feature) return null;

    return (
      <div className="lp-modal-overlay" onClick={onClose}>
        <div
          className="lp-feature-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feature-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="lp-feature-modal__close" onClick={onClose} aria-label="Close modal">
            <X size={24} />
          </button>
          <div className="lp-feature-modal__header">
            <div className="lp-feature-modal__icon-wrapper">{feature.icon}</div>
            <h2 id="feature-modal-title" className="lp-feature-modal__title">
              {feature.title}
            </h2>
            <div className="lp-feature-modal__keywords">
              {feature.keywords.split(", ").map((keyword, index) => (
                <span key={index} className="lp-feature-modal__keyword-tag">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div className="lp-feature-modal__content">
            <div className="lp-feature-modal__description">
              <p>{feature.description}</p>
            </div>
            <div className="lp-feature-modal__benefits">
              <h3 className="lp-feature-modal__benefits-title">Key Benefits</h3>
              <ul className="lp-feature-modal__benefits-list">
                {feature.benefits.map((benefit, index) => (
                  <li key={index}>
                    <CheckCircle size={18} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="lp-feature-modal__actions">
            <button
              className="lp-btn"
              onClick={() => {
                onClose();
                handleScrollTo("register");
              }}
            >
              Get Started
            </button>
            <button className="lp-btn lp-btn--ghost" onClick={onClose}>
              Close
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

  const [featureModalState, setFeatureModalState] = useState({
    isOpen: false,
    selectedFeature: null,
  });

  // Feature data structure
  const featuresData = useMemo(
    () => [
      {
        id: 1,
        title: t("features.items.walletIntegration"),
        keywords: "Apple Wallet, Google Wallet, digital gift cards, mobile wallet",
        description:
          "Deliver gift cards directly to Apple Wallet and Google Wallet in seconds. Customers can save, share, and redeem from their phone—increasing redemption rates and eliminating lost cards.",
        benefits: [
          "Instant delivery via email, SMS, or mobile wallet",
          "One-tap redemption from customer's phone",
          "Cross-device compatibility (iOS, Android, desktop)",
          "Reduces physical card waste and processing costs",
        ],
        icon: <Smartphone size={45} />,
      },
      {
        id: 2,
        title: t("features.items.seasonalPromotions"),
        keywords: "seasonal campaigns, promotion management, automated campaigns",
        description:
          "Launch, schedule, and automate promotional gift card campaigns for holidays, events, and seasonal peaks. Adjust pricing, limits, and messaging in real-time without code.",
        benefits: [
          "Pre-built templates for holidays (Christmas, Mother's Day, Black Friday)",
          "A/B test promotion messaging and designs",
          "Set expiration dates, purchase limits, and bulk discounts",
          "Track promotion performance in real-time",
        ],
        icon: <Gift size={45} />,
      },
      {
        id: 3,
        title: t("features.items.customerAcquisition"),
        keywords: "customer acquisition, branded gift cards, viral sharing",
        description:
          "Convert gift givers into brand advocates. Branded digital gift cards introduce new customers to your business through personal recommendations and viral sharing—at lower acquisition cost than paid ads.",
        benefits: [
          "Personalized recipient experience drives 40%+ first purchase conversion",
          "Shareable gift cards extend reach beyond initial buyer",
          "Track acquisition source to optimize future campaigns",
          "Lower CAC than paid advertising",
        ],
        icon: <Target size={45} />,
      },
      {
        id: 4,
        title: t("features.items.revenueBoost"),
        keywords: "increase revenue, cash flow, breakage, customer spending",
        description:
          "Receive upfront payment when customers purchase gift cards. Studies show 71% of customers spend beyond the card value (breakage)—turning gift cards into pure profit. Plus, unredeemed balances create additional revenue.",
        benefits: [
          "Average customer overspend: 70%+ beyond card value",
          "Improve cash flow by 15-30% with advance payments",
          "Capitalize on breakage (2-5% of total gift card sales)",
          "Reduce dependency on discounts (better margins)",
        ],
        icon: <TrendingUp size={45} />,
      },
      {
        id: 5,
        title: t("features.items.aovIncrease"),
        keywords: "average order value, increase AOV, customer spending",
        description:
          "Increase average order value by 30-50%. Customers using gift cards typically spend beyond the card value, and bundling gift cards with other products drives larger baskets and higher margins.",
        benefits: [
          "Smart bundling: gift card + premium product = higher AOV",
          "Track AOV by gift card value to optimize pricing",
          "Upsell complementary items at redemption time",
          "Mobile wallet display drives impulse purchases",
        ],
        icon: <DollarSign size={45} />,
      },
      {
        id: 6,
        title: t("features.items.analytics"),
        keywords: "real-time analytics, gift card tracking, business insights",
        description:
          "Access real-time analytics on gift card sales, redemption rates, customer behavior, and revenue impact. Track redemption by location, channel, and customer segment. Use data-driven insights to forecast inventory, optimize campaigns, and measure ROI.",
        benefits: [
          "Dashboard shows sales, redemptions, revenue impact, and breakage",
          "Export reports for CFO/board presentations",
          "Track redemption by: location, channel, customer segment, time period",
          "Measure campaign ROI and optimize future promotions",
          "Forecast cash flow based on historical redemption patterns",
        ],
        icon: <BarChart3 size={45} />,
      },
      {
        id: 7,
        title: t("features.items.repeatVisits"),
        keywords: "customer retention, loyalty programs, repeat visits",
        description:
          "Drive repeat visits and build customer loyalty with gift cards. Customers who receive gift cards return 51% more often and spend 40% more per visit. Create referral programs where customers earn gift card rewards for advocacy.",
        benefits: [
          "51% repeat visit rate among gift card recipients vs. 12% baseline",
          "Integrate with loyalty program to automate tier rewards",
          "Create referral bonuses (gift card incentives for new customers)",
          "Personalized offers based on purchase history",
        ],
        icon: <Users size={45} />,
      },
      {
        id: 8,
        title: t("features.items.multiChannel"),
        keywords: "multi-channel, promotional campaigns, A/B testing",
        description:
          "Run multi-channel gift card campaigns across email, SMS, social media, and in-store. Test different designs, messages, and pricing with A/B testing. Pause, refund, or adjust campaigns instantly based on real-time performance data.",
        benefits: [
          "Create SMS campaigns for flash sales and seasonal promotions",
          "Run contests where customers win gift cards",
          "A/B test card designs and messaging for conversion",
          "Refund or modify campaigns without technical support",
        ],
        icon: <Send size={45} />,
      },
    ],
    [t],
  );

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
      },
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
    restaurants: "/images/business-categories/restaurants.png",
    hotels: "/images/business-categories/hotels.png",
    retail: "/images/business-categories/retail.png",
    salons: "/images/business-categories/salons.jpg",
    fitness: "/images/business-categories/fitness.png",
    seasonal: "/images/business-categories/seasonal.png",
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
    [t],
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
        },
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

  // Intersection Observer for creative cards animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add animation class to all card columns
            const cardColumns = entry.target.querySelectorAll(".lp-creative-column");
            cardColumns.forEach((col) => {
              col.classList.add("lp-creative-animate");
            });
            // Unobserve after animation is triggered
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of section is visible
        rootMargin: "0px 0px -50px 0px", // Trigger 50px before bottom of viewport
      },
    );

    if (creativeCardsRef.current) {
      observer.observe(creativeCardsRef.current);
    }

    return () => {
      if (creativeCardsRef.current) {
        observer.unobserve(creativeCardsRef.current);
      }
    };
  }, []);

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // Format phone number based on location
  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "");
    const isIndia = userLocation?.country === "IN";

    if (isIndia) {
      // Indian format: 98765 43210 (10 digits)
      const limitedDigits = digits.slice(0, 10);
      if (limitedDigits.length <= 5) return limitedDigits;
      return `${limitedDigits.slice(0, 5)} ${limitedDigits.slice(5)}`;
    } else {
      // US format: (555) 123-4567 (10 digits)
      const limitedDigits = digits.slice(0, 10);
      if (limitedDigits.length === 0) return "";
      if (limitedDigits.length <= 3) return `(${limitedDigits}`;
      if (limitedDigits.length <= 6) return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3)}`;
      return `(${limitedDigits.slice(0, 3)}) ${limitedDigits.slice(3, 6)}-${limitedDigits.slice(6)}`;
    }
  };

  // Get phone placeholder based on location
  const getPhonePlaceholder = () => {
    if (!userLocation || !userLocation.country) {
      // Default to Indian format if location not detected
      return "98765 43210";
    }
    const isIndia = userLocation.country === "IN";
    return isIndia ? "98765 43210" : "(555) 123-4567";
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

  // Swipe to close functionality
  const handleTouchStart = (e) => {
    // Only start tracking if touch starts near the right edge (within 30px)
    const touchX = e.touches[0].clientX;
    const menuElement = mobileMenuRef.current;
    if (menuElement) {
      const menuRect = menuElement.getBoundingClientRect();
      // Check if touch starts near the right edge of the menu
      if (touchX >= menuRect.right - 30) {
        touchStartX.current = touchX;
      }
    }
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current !== null) {
      touchEndX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // Minimum distance for swipe

    // Swipe right to close (swiping from right edge to left)
    if (distance > minSwipeDistance && isMobileMenuOpen) {
      closeMobileMenu();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Navigation items with icons
  const mobileNavItems = [
    { id: "about", label: t("nav.about"), icon: <Info size={20} /> },
    { id: "features", label: t("nav.features"), icon: <Sparkles size={20} /> },
    { id: "solutions", label: t("nav.solutions"), icon: <Star size={20} /> },
    { id: "register", label: t("nav.register"), icon: <CreditCard size={20} /> },
    { id: "contact", label: t("nav.contact"), icon: <Mail size={20} /> },
  ];

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSolutionsDropdownOpen && !event.target.closest(".lp-nav__dropdown")) {
        setIsSolutionsDropdownOpen(false);
      }
    };

    if (isSolutionsDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSolutionsDropdownOpen]);

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
          <button onClick={() => handleScrollTo("features")}>{t("nav.features")}</button>
          <div
            className="lp-nav__dropdown"
            onMouseEnter={() => setIsSolutionsDropdownOpen(true)}
            onMouseLeave={() => setIsSolutionsDropdownOpen(false)}
          >
            <button onClick={() => handleScrollTo("solutions")} className={isSolutionsDropdownOpen ? "active" : ""}>
              {t("nav.solutions")}
              <ChevronDown size={16} className="lp-nav__dropdown-icon" />
            </button>
            {isSolutionsDropdownOpen && (
              <div className="lp-nav__dropdown-menu">
                <a
                  href="/category/restaurants"
                  className="lp-nav__dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/category/restaurants");
                    setIsSolutionsDropdownOpen(false);
                  }}
                >
                  {t("businessCategories.restaurants.title")}
                </a>
                <a
                  href="/category/hotels"
                  className="lp-nav__dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/category/hotels");
                    setIsSolutionsDropdownOpen(false);
                  }}
                >
                  {t("businessCategories.hotels.title")}
                </a>
                <a
                  href="/category/retail"
                  className="lp-nav__dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/category/retail");
                    setIsSolutionsDropdownOpen(false);
                  }}
                >
                  {t("businessCategories.retail.title")}
                </a>
                <a
                  href="/category/salons"
                  className="lp-nav__dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/category/salons");
                    setIsSolutionsDropdownOpen(false);
                  }}
                >
                  {t("businessCategories.salons.title")}
                </a>
                <a
                  href="/category/fitness"
                  className="lp-nav__dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/category/fitness");
                    setIsSolutionsDropdownOpen(false);
                  }}
                >
                  {t("businessCategories.fitness.title")}
                </a>
                <a
                  href="/category/seasonal"
                  className="lp-nav__dropdown-item"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/category/seasonal");
                    setIsSolutionsDropdownOpen(false);
                  }}
                >
                  {t("businessCategories.seasonal.title")}
                </a>
              </div>
            )}
          </div>
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
      <div
        ref={mobileMenuRef}
        className={`lp-mobile-menu ${isMobileMenuOpen ? "lp-mobile-menu--open" : ""}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="lp-mobile-header">
          <div className="lp-mobile-header__brand">
            <img src={theme === "light" ? logoWhiteBg : logo} alt="giftygen logo" className="lp-mobile-header__logo" />
            <span className="lp-mobile-header__title">giftygen</span>
          </div>
          <button className="lp-mobile-close" onClick={closeMobileMenu} aria-label="Close mobile menu">
            <X size={24} />
          </button>
        </div>

        <nav className="lp-mobile-nav" aria-label="Main navigation">
          {mobileNavItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleMobileNavClick(item.id)}
              className="lp-mobile-nav__item"
              style={{ "--delay": `${index * 0.05}s` }}
              aria-label={`Navigate to ${item.label}`}
            >
              <span className="lp-mobile-nav__icon">{item.icon}</span>
              <span className="lp-mobile-nav__label">{item.label}</span>
              <ArrowRight size={16} className="lp-mobile-nav__arrow" />
            </button>
          ))}
        </nav>

        <div className="lp-mobile-divider"></div>

        <div className="lp-mobile-cta">
          <button
            className="lp-btn lp-btn--ghost"
            onClick={() => {
              navigate("/login");
              closeMobileMenu();
            }}
          >
            {t("nav.signIn")}
          </button>
          <button
            className="lp-btn"
            onClick={() => {
              navigate("/explore");
              closeMobileMenu();
            }}
          >
            {t("nav.explore")}
          </button>
        </div>

        <div className="lp-mobile-actions">
          <div className="lp-mobile-theme">
            <button className="lp-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? "☀️" : "🌙"}
              <span>{theme === "dark" ? "Switch to Light" : "Switch to Dark"}</span>
            </button>
          </div>
          <div className="lp-mobile-language">
            <LanguageDropdown variant="mobile" />
          </div>
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
            <button className="lp-btn lp-btn--ghost" onClick={() => handleScrollTo("register")}>
              {t("hero.scheduleDemo")}
            </button>
          </div>
        </div>
        <div className="lp-hero__visual" aria-hidden>
          <div className="lp-giftcard" role="img" aria-label="Digital gift card illustration">
            <div className="lp-giftcard__ribbon" />
            <div className="lp-giftcard__brand">{t("giftCard.Brand")}</div>
            <div className="lp-giftcard__title">{t("giftCard.digitalGiftCard")}</div>
            <div className="lp-giftcard__amount">
              {formatCurrency(getCurrencyConfig.displayAmount, getCurrencyConfig.currency, {
                locale: getCurrencyConfig.locale,
              })}
            </div>
            <div className="lp-giftcard__meta">
              <span>{t("giftCard.to")}</span>
              <span>{t("giftCard.from")}</span>
            </div>
            <div className="lp-giftcard__pixels" />
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="lp-section lp-video-section" id="video">
        <div className="lp-video-container">
          <div className="lp-video-wrapper">
            <iframe
              src="https://www.youtube.com/embed/p7aVdnOlh80?autoplay=1&mute=1&rel=0&modestbranding=1&loop=1&playlist=p7aVdnOlh80"
              title="GiftyGen Introduction Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="lp-video-iframe"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Gift Card Management Features */}
      <section className="lp-section lp-creative-cards-section" id="features" ref={creativeCardsRef}>
        <div className="lp-section__header">
          <h2 className="lp-section__title lp-h2">{t("features.title")}</h2>
        </div>

        <div className="lp-creative-container">
          <div className="lp-creative-row">
            {featuresData.map((feature) => (
              <div key={feature.id} className="lp-creative-column">
                <div
                  className="lp-creative-card-details"
                  onClick={() => setFeatureModalState({ isOpen: true, selectedFeature: feature })}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setFeatureModalState({ isOpen: true, selectedFeature: feature });
                    }
                  }}
                  aria-label={`Learn more about ${feature.title}`}
                >
                  <div className="lp-creative-card-icons">{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <div className="lp-creative-read-more-btn">
                    <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Animated Business Offer Section */}
      <section
        id="solutions"
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
                <div className="lp-scan-card__amount">
                  {formatCurrency(getCurrencyConfig.displayAmount, getCurrencyConfig.currency, {
                    locale: getCurrencyConfig.locale,
                  })}
                </div>
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
                  onClick={() => navigate(`/category/${category}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/category/${category}`);
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
                      <button className="lp-business-card__button">
                        <span>{t(`businessCategories.${category}.title`)}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product Highlights */}
      {/* <section className="lp-section" id="highlights">
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
      </section> */}

      {/* Why giftygen / Benefits */}
      {/* <section className="lp-section" id="benefits">
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
      </section> */}

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
              setIsSubmitting(true);
              if (payload.phone) {
                const cleanedPhone = payload.phone.replace(/\D/g, "");
                const isIndia = userLocation?.country === "IN";

                if (isIndia) {
                  // Indian phone validation: 10 digits starting with 6-9
                  if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
                    setModalState({
                      isOpen: true,
                      type: "error",
                      message: "Please enter a valid Indian mobile number (10 digits).",
                    });
                    return;
                  }
                  payload.phone = `+91${cleanedPhone}`;
                } else {
                  // US phone validation: 10 digits
                  if (!/^\d{10}$/.test(cleanedPhone)) {
                    setModalState({
                      isOpen: true,
                      type: "error",
                      message: "Please enter a valid phone number (10 digits).",
                    });
                    return;
                  }
                  payload.phone = `+1${cleanedPhone}`;
                }
              }

              const res = await fetch("/api/v1/admin/registration-interest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              const data = await res.json().catch(() => ({}));
              if (!res.ok) {
                const msg = data?.message || "Sorry, something went wrong. Please try again later.";
                setModalState({ isOpen: true, type: "error", message: msg });
                setTimeout(() => setNotice(null), 8000);
                return;
              }
              setModalState({
                isOpen: true,
                type: "success",
                message: "Registration complete! Check your email for your login credentials. You can sign in now.",
              });
              form.reset();
              setPhone("");
              setErrors({ businessName: false, businessType: false, contactName: false, email: false });
              setTimeout(() => setNotice(null), 60000);
              setTimeout(() => navigate("/login?registered=1"), 2000);
            } catch (err) {
              setModalState({
                isOpen: true,
                type: "error",
                message: "Sorry, something went wrong. Please try again later.",
              });

              setTimeout(() => setNotice(null), 8000);
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <div className="lp-form__grid">
            <div className="lp-field">
              <label>
                {t("register.form.businessName")} <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="businessName"
                placeholder={t("register.form.businessNamePlaceholder")}
                className={errors.businessName ? "lp-input--error" : undefined}
                onInput={() => setErrors((e) => ({ ...e, businessName: false }))}
              />
            </div>
            <div className="lp-field">
              <label>
                {t("register.form.businessType")} <span style={{ color: "red" }}>*</span>
              </label>
              <select
                name="businessType"
                className={errors.businessType ? "lp-input--error" : undefined}
                onChange={() => setErrors((e) => ({ ...e, businessType: false }))}
                defaultValue=""
              >
                <option value="" disabled>
                  {t("register.form.businessTypePlaceholder") || "Select industry"}
                </option>
                <option value="Restaurant & Bars">Restaurant & Bars</option>
                <option value="Retail & E-commerce">Retail & E-commerce</option>
                <option value="Hotels & Hospitality">Hotels & Hospitality</option>
                <option value="Salons & Spas">Salons & Spas</option>
                <option value="Fitness & Wellness">Fitness & Wellness</option>
                <option value="Professional Services">Professional Services</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="lp-field">
              <label>
                {t("register.form.contactName")} <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                name="contactName"
                placeholder={t("register.form.contactNamePlaceholder")}
                className={errors.contactName ? "lp-input--error" : undefined}
                onInput={() => setErrors((e) => ({ ...e, contactName: false }))}
              />
            </div>
            <div className="lp-field">
              <label>
                {t("register.form.email")} <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder={t("register.form.emailPlaceholder")}
                className={errors.email ? "lp-input--error" : undefined}
                onInput={() => setErrors((e) => ({ ...e, email: false }))}
              />
            </div>
            <div className="lp-field">
              <label>
                {t("register.form.phone")} <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="tel"
                name="phone"
                inputMode="numeric"
                autoComplete="tel"
                placeholder={getPhonePlaceholder()}
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                maxLength={userLocation?.country === "IN" ? 11 : 14}
                aria-label={userLocation?.country === "IN" ? "Indian mobile number" : "Phone number"}
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
          <button className="lp-btn lp-btn--block lp-form__submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : t("register.form.submit")}
          </button>
        </form>
      </section>

      {/* Contact */}
      <section className="lp-section lp-contact" id="contact">
        <div className="lp-contact__header">
          <h2 className="lp-contact__title">
            Contact <span>Us</span>
          </h2>
        </div>
        <div className="lp-contact__content">
          <div className="lp-contact__info">
            <h3 className="lp-contact__info-title">Contact details</h3>
            <p className="lp-contact__lead">
              Reach out to us for any questions, feedback, or partnership opportunities.
            </p>
            <div className="lp-contact__detail-list">
              <div className="lp-contact__detail-item">
                <div className="lp-contact__detail-icon">
                  <Mail size={22} />
                </div>
                <div>
                  <div className="lp-contact__detail-label">Email</div>
                  <a href="mailto:contact@giftygen.com" className="lp-contact__detail-value">
                    contact@giftygen.com
                  </a>
                </div>
              </div>
              <div className="lp-contact__detail-item">
                <div className="lp-contact__detail-icon">
                  <Home size={22} />
                </div>
                <div>
                  <div className="lp-contact__detail-label">Address</div>
                  <p className="lp-contact__detail-value">30 N Gould St Ste R, Sheridan, WY 82801 USA</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lp-contact__form-wrapper">
            <form
              className="lp-contact__form"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!contactForm.name || !contactForm.email || !contactForm.message) {
                  setModalState({
                    isOpen: true,
                    type: "error",
                    message: t("contact.form.errorRequired"),
                  });
                  return;
                }

                // Basic email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(contactForm.email)) {
                  setModalState({
                    isOpen: true,
                    type: "error",
                    message: t("contact.form.errorEmail"),
                  });
                  return;
                }

                setIsSubmittingContact(true);
                try {
                  const res = await fetch("/api/v1/admin/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(contactForm),
                  });

                  if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || "Failed to send message");
                  }

                  setModalState({
                    isOpen: true,
                    type: "success",
                    message: t("contact.form.success"),
                  });
                  setContactForm({ name: "", email: "", message: "" });
                } catch (err) {
                  setModalState({
                    isOpen: true,
                    type: "error",
                    message: err.message || t("contact.form.error"),
                  });
                } finally {
                  setIsSubmittingContact(false);
                }
              }}
            >
              <div className="lp-contact__form-row">
                <div className="lp-contact__form-group">
                  <label htmlFor="contact-name">{t("contact.form.name")}</label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder={t("contact.form.namePlaceholder")}
                    required
                  />
                </div>
                <div className="lp-contact__form-group">
                  <label htmlFor="contact-email">{t("contact.form.email")}</label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder={t("contact.form.emailPlaceholder")}
                    required
                  />
                </div>
              </div>
              <div className="lp-contact__form-group">
                <label htmlFor="contact-message">{t("contact.form.message")}</label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder={t("contact.form.messagePlaceholder")}
                  rows="5"
                  required
                />
              </div>
              <button type="submit" className="lp-btn lp-contact__submit" disabled={isSubmittingContact}>
                {isSubmittingContact ? t("contact.form.sending") : t("contact.form.submit")}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer__brand">
          <img
            src={theme === "light" ? logoWhiteBg : logo}
            alt="giftygen logo"
          />
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
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        message={modalState.message}
        type={modalState.type}
      />
      <BusinessModal
        isOpen={businessModalState.isOpen}
        onClose={() => setBusinessModalState({ isOpen: false, selectedBusiness: null })}
        businessType={businessModalState.selectedBusiness}
      />
      <FeatureModal
        isOpen={featureModalState.isOpen}
        onClose={() => setFeatureModalState({ isOpen: false, selectedFeature: null })}
        feature={featureModalState.selectedFeature}
      />
    </div>
  );
}

export default LandingPage;
