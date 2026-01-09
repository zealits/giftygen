import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./BusinessCategoryDetail.css";
import { ArrowLeft, CheckCircle, Star, List, Menu, X } from "lucide-react";
import SEO from "../../components/SEO";
import LanguageDropdown from "../../components/LanguageDropdown";
import logo from "../../assets/giftygen_logo.svg";
import logoWhiteBg from "../../assets/giftgen_whitebg_logo.png";

function BusinessCategoryDetail() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const { t } = useTranslation();
  const [theme, setTheme] = useState(() => localStorage.getItem("giftygen_theme") || "dark");
  const [readingProgress, setReadingProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("");
  const [tocVisible, setTocVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const contentRef = useRef(null);

  // Update theme in localStorage and document
  useEffect(() => {
    localStorage.setItem("giftygen_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Scroll to top when component mounts or categoryId changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [categoryId]);

  // Reading progress and active section tracking
  useEffect(() => {
    if (
      categoryId !== "restaurants" &&
      categoryId !== "hotels" &&
      categoryId !== "retail" &&
      categoryId !== "salons" &&
      categoryId !== "fitness" &&
      categoryId !== "seasonal"
    )
      return;

    const handleScroll = () => {
      // Calculate reading progress
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));

      // Find active section
      const sections = document.querySelectorAll('[id^="section-"]');
      let currentSection = "";

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom >= 150) {
          currentSection = section.id;
        }
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, [categoryId]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Navigation handlers
  const handleScrollTo = (id) => {
    navigate("/");
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
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

  const restaurantTOC = [
    { id: "section-hero", title: "Stop Leaving Revenue on the Table" },
    { id: "section-why", title: "Why Restaurant Gift Cards Are Your Highest-ROI Tool" },
    { id: "section-solution", title: "Giftygen's Restaurant-Specific Solution" },
    { id: "section-faq", title: "Common Questions (FAQ)" },
    { id: "section-cta", title: "Get Started" },
  ];

  const hotelTOC = [
    { id: "section-hero", title: "Drive Direct Bookings, Increase Occupancy" },
    { id: "section-problem", title: "The Hidden Cost of OTA Dependence" },
    { id: "section-solution", title: "Your Direct Booking Solution" },
    { id: "section-platform", title: "Platform Designed by Hospitality Professionals" },
    { id: "section-faq", title: "Questions Hotels Ask" },
    { id: "section-cta", title: "Get Started" },
  ];

  const retailTOC = [
    { id: "section-hero", title: "Increase Holiday Sales 25-40% & Customer Lifetime Value 3x" },
    { id: "section-solution", title: "Your Digital Gift Card Solution" },
    { id: "section-platform", title: "The Gift Card Platform Built for Ecommerce" },
    { id: "section-faq", title: "Questions Retail Brands Ask" },
    { id: "section-cta", title: "Capture Q4. Build Your Audience" },
  ];

  const salonTOC = [
    { id: "section-hero", title: "Increase Retention 51%, Reduce Churn 40%" },
    { id: "section-problem", title: "The Churn Epidemic: Why Salons Lose 40% of Clients" },
    { id: "section-solution", title: "The Salon Gift Card Solution" },
    { id: "section-cta", title: "Stop Losing Clients to Churn" },
  ];

  const fitnessTOC = [
    { id: "section-hero", title: "Convert Trials 55%, Reduce Member Churn 30%" },
    { id: "section-problem", title: "Why Fitness Gyms Struggle with Growth" },
    { id: "section-solution", title: "Your Fitness Membership Solution" },
    { id: "section-platform", title: "The Fitness Gift Card Platform Built for Growth" },
    { id: "section-cta", title: "Convert Trials. Reduce Churn. Grow Year-Round" },
  ];

  const seasonalTOC = [
    { id: "section-hero", title: "Build Client Relationships, Drive Referrals" },
    { id: "section-problem", title: "Why Client Relationships Are Slipping" },
    { id: "section-solution", title: "Strategic Gifting for Professional Services" },
    { id: "section-cta", title: "Transform Client Relationships Into Referrals" },
  ];

  // Handle back button - navigate to landing page and scroll to offer section
  const handleBack = () => {
    navigate("/");
    setTimeout(() => {
      const element = document.getElementById("offer");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const businessCategoryImages = {
    restaurants: "/images/business-categories/restaurants.png",
    hotels: "/images/business-categories/hotels.png",
    retail: "/images/business-categories/retail.png",
    salons: "/images/business-categories/salons.png",
    fitness: "/images/business-categories/fitness.png",
    seasonal: "/images/business-categories/seasonal.png",
  };

  const categoryData = t(`businessCategories.${categoryId}`, { returnObjects: true });

  if (!categoryData || !categoryData.title) {
    return (
      <div className="category-detail" data-theme={theme}>
        <div className="category-detail__container">
          <button className="category-detail__back-btn" onClick={handleBack}>
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="category-detail__error">
            <h2>Category not found</h2>
            <p>The category you're looking for doesn't exist.</p>
            <button className="category-detail__btn" onClick={() => navigate("/")}>
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-detail" data-theme={theme}>
      <SEO
        title={`${categoryData.title} - GiftyGen Business Solutions`}
        description={categoryData.description}
        keywords={`${categoryData.title}, gift cards, digital gift cards, business solutions, ${categoryId}`}
        url={`https://giftygen.com/category/${categoryId}`}
      />
      {/* Navbar */}
      <header className="category-detail__nav">
        <div className="category-detail__nav-brand" onClick={() => navigate("/")}>
          <img
            src={theme === "light" ? logoWhiteBg : logo}
            alt="GiftyGen digital gift card platform logo"
            width={120}
            height={40}
            className="category-detail__nav-logo"
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="category-detail__nav-links">
          <button onClick={() => handleScrollTo("about")}>{t("nav.about")}</button>
          <button onClick={() => handleScrollTo("highlights")}>{t("nav.highlights")}</button>
          <button onClick={() => handleScrollTo("benefits")}>{t("nav.benefits")}</button>
          <button onClick={() => handleScrollTo("register")}>{t("nav.register")}</button>
          <button onClick={() => handleScrollTo("faq")}>FAQ</button>
          <button onClick={() => handleScrollTo("contact")}>{t("nav.contact")}</button>
        </nav>

        {/* Desktop CTA */}
        <div className="category-detail__nav-cta">
          <button className="category-detail__nav-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button
            className="category-detail__nav-btn category-detail__nav-btn--ghost"
            onClick={() => navigate("/login")}
          >
            {t("nav.signIn")}
          </button>
          <a href="/explore" className="category-detail__nav-btn">
            {t("nav.explore")}
          </a>
          <LanguageDropdown variant="desktop" />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="category-detail__nav-mobile-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Navigation Menu */}
      <div className={`category-detail__mobile-menu ${isMobileMenuOpen ? "category-detail__mobile-menu--open" : ""}`}>
        <div className="category-detail__mobile-header">
          <div
            className="category-detail__mobile-brand"
            onClick={() => {
              navigate("/");
              closeMobileMenu();
            }}
          >
            <img src={theme === "light" ? logoWhiteBg : logo} alt="GiftyGen logo" width={100} height={35} />
          </div>
          <button className="category-detail__mobile-close" onClick={closeMobileMenu} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>
        <nav className="category-detail__mobile-nav">
          <button onClick={() => handleMobileNavClick("about")}>{t("nav.about")}</button>
          <button onClick={() => handleMobileNavClick("highlights")}>{t("nav.highlights")}</button>
          <button onClick={() => handleMobileNavClick("benefits")}>{t("nav.benefits")}</button>
          <button onClick={() => handleMobileNavClick("register")}>{t("nav.register")}</button>
          <button onClick={() => handleMobileNavClick("faq")}>FAQ</button>
          <button onClick={() => handleMobileNavClick("contact")}>{t("nav.contact")}</button>
        </nav>
        <div className="category-detail__mobile-actions">
          <button className="category-detail__nav-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button
            className="category-detail__nav-btn"
            onClick={() => {
              navigate("/login");
              closeMobileMenu();
            }}
          >
            {t("nav.signIn")}
          </button>
          <a href="/explore" className="category-detail__nav-btn" onClick={closeMobileMenu}>
            {t("nav.explore")}
          </a>
          <LanguageDropdown variant="mobile" />
        </div>
      </div>

      {/* Reading Progress Bar */}
      {(categoryId === "restaurants" ||
        categoryId === "hotels" ||
        categoryId === "retail" ||
        categoryId === "salons" ||
        categoryId === "fitness" ||
        categoryId === "seasonal") && (
        <div className="category-detail__progress-bar">
          <div className="category-detail__progress-fill" style={{ width: `${readingProgress}%` }} />
        </div>
      )}
      <div className="category-detail__container">
        <button className="category-detail__back-btn" onClick={handleBack}>
          <ArrowLeft size={20} />
          Back
        </button>

        <header className="category-detail__header">
          <div className="category-detail__image-container">
            <img
              src={businessCategoryImages[categoryId] || businessCategoryImages.restaurants}
              alt={categoryData.title}
              className="category-detail__image"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
          <h1 className="category-detail__title">{categoryData.title}</h1>
          <p className="category-detail__subtitle">{categoryData.subtitle}</p>
        </header>

        {/* Table of Contents */}
        {(categoryId === "restaurants" ||
          categoryId === "hotels" ||
          categoryId === "retail" ||
          categoryId === "salons" ||
          categoryId === "fitness" ||
          categoryId === "seasonal") && (
          <>
            <button
              className="category-detail__toc-toggle"
              onClick={() => setTocVisible(!tocVisible)}
              aria-label="Toggle table of contents"
            >
              <List size={20} />
              <span>Contents</span>
            </button>
            {tocVisible && (
              <div
                className="category-detail__toc-overlay"
                onClick={() => setTocVisible(false)}
                aria-label="Close table of contents"
              />
            )}
            <aside className={`category-detail__toc ${tocVisible ? "category-detail__toc--visible" : ""}`}>
              <div className="category-detail__toc-header">
                <h3 className="category-detail__toc-title">Table of Contents</h3>
                <button
                  className="category-detail__toc-close"
                  onClick={() => setTocVisible(false)}
                  aria-label="Close table of contents"
                >
                  ×
                </button>
              </div>
              <nav className="category-detail__toc-nav">
                <ul className="category-detail__toc-list">
                  {(categoryId === "restaurants"
                    ? restaurantTOC
                    : categoryId === "hotels"
                    ? hotelTOC
                    : categoryId === "retail"
                    ? retailTOC
                    : categoryId === "salons"
                    ? salonTOC
                    : categoryId === "fitness"
                    ? fitnessTOC
                    : seasonalTOC
                  ).map((item) => (
                    <li key={item.id} className="category-detail__toc-item">
                      <a
                        href={`#${item.id}`}
                        className={`category-detail__toc-link ${
                          activeSection === item.id ? "category-detail__toc-link--active" : ""
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection(item.id);
                          setTocVisible(false);
                        }}
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          </>
        )}

        <div className="category-detail__content" ref={contentRef}>
          {categoryId === "restaurants" ? (
            <>
              {/* Hero Section */}
              <section id="section-hero" className="category-detail__section">
                <h2 className="category-detail__hero-headline">
                  Stop Leaving Revenue on the Table: 70-80% Redemption Rate with Digital Gift Cards
                </h2>
                <p className="category-detail__hero-subheading">
                  Your competitors are using Apple Wallet integration to capture gift card sales you're missing. 40-50%
                  of physical gift cards never get redeemed. Digital changes the game.
                </p>
                <p className="category-detail__paragraph category-detail__paragraph--lead">
                  Physical gift cards are leaving money on your table. They get lost, forgotten, and tossed in junk
                  drawers. The average physical gift card has a 40-50% redemption rate—meaning half your revenue
                  disappears.
                </p>
                <p className="category-detail__paragraph">
                  Digital gift cards solve this completely. With Apple Wallet integration, customers save your gift card
                  in one tap. At checkout, they open their wallet and show their phone. No searching through email. No
                  lost plastic cards.
                </p>
                <div className="category-detail__stats-grid">
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">70-80%</div>
                    <div className="category-detail__stat-label">Redemption Rate</div>
                  </div>
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">+40%</div>
                    <div className="category-detail__stat-label">Average Spending</div>
                  </div>
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">+51%</div>
                    <div className="category-detail__stat-label">Repeat Visits</div>
                  </div>
                </div>
                <p className="category-detail__paragraph">
                  The result: 70-80% redemption rates (a 32-percentage-point increase), higher average spending per
                  visit (+40%), and increased repeat visits (+51%).
                </p>
                <p className="category-detail__paragraph">
                  Giftygen is purpose-built for restaurants. We integrate with Toast, Square, Lightspeed, and 50+ POS
                  systems. Setup takes 10 minutes. Your first sale arrives by Day 1.
                </p>
                <p className="category-detail__paragraph">
                  More than 2,000 restaurants already use Giftygen. They're capturing lost revenue, building customer
                  loyalty, and automating redemption. You can too.
                </p>
                <div className="category-detail__cta-buttons" style={{ marginTop: "32px" }}>
                  <button
                    className="category-detail__btn category-detail__btn--primary"
                    onClick={() => {
                      navigate("/");
                      setTimeout(() => {
                        const element = document.getElementById("register");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }, 100);
                    }}
                  >
                    Start Your Free Trial
                  </button>
                  <button
                    className="category-detail__btn category-detail__btn--secondary"
                    onClick={() => navigate("/explore")}
                  >
                    Schedule Demo
                  </button>
                </div>
              </section>

              {/* Why Restaurant Gift Cards Section */}
              <section id="section-why" className="category-detail__section">
                <h2 className="category-detail__section-title">
                  Why Restaurant Gift Cards Are Your Highest-ROI Revenue Tool
                </h2>
                <h3 className="category-detail__challenge-title">The Challenge Every Restaurant Faces</h3>
                <p className="category-detail__paragraph">
                  You know the feeling: it's Tuesday night, your reservation book is half-full, and you're wondering
                  where the revenue went. Seasonal slumps are killing your margins. Valentine's Day and Mother's Day are
                  golden, but January through March? Brutal.
                </p>
                <p className="category-detail__paragraph">
                  Meanwhile, your competitors are using digital gift cards to solve this exact problem. They're not just
                  selling gift cards—they're building a predictable revenue engine.
                </p>
                <p className="category-detail__paragraph" style={{ fontWeight: 600, marginTop: "24px" }}>
                  Here's what restaurants struggle with today:
                </p>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">1. Redemption Hell with Physical Cards</h4>
                  <p className="category-detail__numbered-item-content">
                    You sell a $100 gift card. The customer loves your restaurant, but they lose the card. Or they
                    forget about it. Industry data shows 40-50% of physical gift cards never get redeemed. That's $40-50
                    of every $100 sold that disappears.
                  </p>
                  <p className="category-detail__numbered-item-content">
                    With digital, customers save the card to Apple Wallet with one tap. They see it every time they open
                    their phone. Redemption jumps to 70-80%.
                  </p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">2. Manual Tracking Across Locations</h4>
                  <p className="category-detail__numbered-item-content">
                    If you have multiple locations, managing gift card inventory is a nightmare. Which location sold it?
                    Where was it redeemed? How much is left? Spreadsheets and manual processes create errors, lost
                    revenue, and frustrated staff.
                  </p>
                  <p className="category-detail__numbered-item-content">
                    Digital solves this instantly. Every sale, redemption, and balance is synced to your POS
                    automatically.
                  </p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">3. Missing Upsell Opportunities</h4>
                  <p className="category-detail__numbered-item-content">
                    Here's what most restaurants miss: when customers redeem a gift card, they often spend MORE than the
                    card balance. They add drinks, dessert, appetizers. Average spending is 40% higher for gift card
                    redemptions.
                  </p>
                  <p className="category-detail__numbered-item-content">
                    But your staff doesn't know which customers are redeeming gift cards. So upsells happen by accident,
                    not by strategy.
                  </p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">4. No Visibility Into Customer Behavior</h4>
                  <p className="category-detail__numbered-item-content">
                    When customers buy physical gift cards, you capture zero data. Where do they come from? What do they
                    like to order? Will they be repeat customers? You're blind to the insights that drive business.
                  </p>
                  <p className="category-detail__numbered-item-content">
                    Digital gives you complete visibility. You see which customers redeem, what they order, when they
                    visit, and their lifetime value.
                  </p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">
                    5. Seasonal Revenue Fluctuations Are Predictable and Avoidable
                  </h4>
                  <p className="category-detail__numbered-item-content">
                    Your restaurant probably sees dramatic swings:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Summer slump (vacations, outdoor dining)</li>
                    <li className="category-detail__bullet-item">January/February (post-holiday spending decline)</li>
                    <li className="category-detail__bullet-item">Spring lull (Easter to Mother's Day)</li>
                    <li className="category-detail__bullet-item">
                      Holiday rush (Thanksgiving, Christmas, New Year's Eve)
                    </li>
                  </ul>
                  <p className="category-detail__numbered-item-content">
                    Physical gift cards can't solve this. But strategic digital campaigns CAN.
                  </p>
                  <p className="category-detail__numbered-item-content">
                    You create targeted campaigns for Valentine's Day (gift cards as gifts +150%), Mother's Day (+120%),
                    holiday season (+300-500%), and off-season discounts to drive traffic. Marketing becomes
                    data-driven, not guesswork.
                  </p>
                </div>
              </section>

              {/* Giftygen's Restaurant-Specific Solution */}
              <section id="section-solution" className="category-detail__section">
                <h2 className="category-detail__section-title">Giftygen's Restaurant-Specific Solution</h2>
                <p className="category-detail__paragraph">
                  Giftygen is purpose-built for restaurants. We've integrated with 2,000+ restaurants and understand
                  your business model completely. Here's exactly how we solve each problem:
                </p>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">
                    1. Apple Wallet Integration: 70-80% Redemption
                  </h4>
                  <div className="category-detail__table-container">
                    <table className="category-detail__table">
                      <thead>
                        <tr>
                          <th>How it works</th>
                          <th>Why it works</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Customer buys gift card on your website or in-store</td>
                          <td>No searching through email</td>
                        </tr>
                        <tr>
                          <td>They get an email with a redemption link</td>
                          <td>No lost cards</td>
                        </tr>
                        <tr>
                          <td>One tap adds card to Apple Wallet</td>
                          <td>No friction</td>
                        </tr>
                        <tr>
                          <td>At checkout, they open wallet and show phone</td>
                          <td>One-tap experience (customers love it)</td>
                        </tr>
                        <tr>
                          <td>Card code auto-applies to transaction</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">
                    2. POS Integration: Automatic Redemption & Tracking
                  </h4>
                  <p className="category-detail__numbered-item-content">We integrate with 50+ POS systems:</p>
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ marginBottom: "12px" }}>
                      <strong style={{ color: "#93a8ff" }}>Quick Serve:</strong>
                      <div className="category-detail__pos-list">
                        <span className="category-detail__pos-tag">Toast</span>
                        <span className="category-detail__pos-tag">Square</span>
                        <span className="category-detail__pos-tag">Clover</span>
                      </div>
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <strong style={{ color: "#93a8ff" }}>Fine Dining:</strong>
                      <div className="category-detail__pos-list">
                        <span className="category-detail__pos-tag">Micros Oracle</span>
                        <span className="category-detail__pos-tag">MarginEdge</span>
                      </div>
                    </div>
                    <div style={{ marginBottom: "12px" }}>
                      <strong style={{ color: "#93a8ff" }}>Pizza/QSR:</strong>
                      <div className="category-detail__pos-list">
                        <span className="category-detail__pos-tag">Lightspeed</span>
                        <span className="category-detail__pos-tag">Revel</span>
                        <span className="category-detail__pos-tag">Touchbistro</span>
                      </div>
                    </div>
                    <div>
                      <strong style={{ color: "#93a8ff" }}>Custom Systems:</strong>
                      <div className="category-detail__pos-list">
                        <span className="category-detail__pos-tag">API integration available</span>
                      </div>
                    </div>
                  </div>
                  <p className="category-detail__numbered-item-content" style={{ fontWeight: 600, marginTop: "16px" }}>
                    What happens:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Gift card balance syncs in real-time to your POS</li>
                    <li className="category-detail__bullet-item">
                      Redemption is automatic at checkout (staff doesn't have to look anything up)
                    </li>
                    <li className="category-detail__bullet-item">Remaining balance displays instantly</li>
                    <li className="category-detail__bullet-item">Multi-location balance tracks automatically</li>
                    <li className="category-detail__bullet-item">Zero manual work</li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">3. Real-Time Analytics: Know Your Data</h4>
                  <p className="category-detail__numbered-item-content">Dashboard shows:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Total gift card sales (revenue)</li>
                    <li className="category-detail__bullet-item">Redemption rate (%)</li>
                    <li className="category-detail__bullet-item">Average spend per redemption</li>
                    <li className="category-detail__bullet-item">Customer repeat visit frequency</li>
                    <li className="category-detail__bullet-item">Which menu items gift card customers order</li>
                    <li className="category-detail__bullet-item">Revenue from breakage (unredeemed balances)</li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">
                    4. Seasonal Campaign Tools: Revenue During Slow Periods
                  </h4>
                  <p className="category-detail__numbered-item-content">Pre-built seasonal campaigns:</p>
                  <ul className="category-detail__campaign-list">
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">
                        Valentine's Day: "Perfect Gift for Your Sweetheart"
                      </div>
                      <div className="category-detail__campaign-desc">+150% sales spike</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">
                        Mother's Day: "Treat Mom to a Special Experience"
                      </div>
                      <div className="category-detail__campaign-desc">+120%</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">Holiday Season: "The Gift Everyone Loves"</div>
                      <div className="category-detail__campaign-desc">+300-500%</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">New Year's: "Fitness + Dining Bundling"</div>
                      <div className="category-detail__campaign-desc">Jan health resolutions</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">Summer Slump Fix: "Summer Dining Series"</div>
                      <div className="category-detail__campaign-desc">with outdoor events</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">Black Friday: "Flash Gift Card Deals"</div>
                    </li>
                  </ul>
                  <p className="category-detail__numbered-item-content">Each campaign includes:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Email template (pre-written)</li>
                    <li className="category-detail__bullet-item">Social media copy (ready to post)</li>
                    <li className="category-detail__bullet-item">Landing page (custom to your restaurant)</li>
                    <li className="category-detail__bullet-item">Analytics tracking (see what works)</li>
                  </ul>
                  <div className="category-detail__highlight-box">
                    <p className="category-detail__highlight-text">
                      <strong>How it drives revenue:</strong> Instead of hoping people buy gift cards, you're actively
                      promoting them during peak gifting seasons. Result: predictable 25-40% revenue increase during
                      promotional periods.
                    </p>
                  </div>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">5. Upsell Automation</h4>
                  <p className="category-detail__numbered-item-content">At redemption, staff sees:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">
                      "This customer has redeemed 8 times this year—suggest wine pairing"
                    </li>
                    <li className="category-detail__bullet-item">
                      "They ordered pasta last time—recommend our new sauce"
                    </li>
                    <li className="category-detail__bullet-item">
                      "They always order alone—suggest appetizer to start"
                    </li>
                  </ul>
                  <p className="category-detail__numbered-item-content">Result: +$8-15 average upsell per redemption</p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">6. Fully Branded Design</h4>
                  <p className="category-detail__numbered-item-content">
                    Choose from restaurant-specific templates or upload your logo. Customize:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Colors matching your brand</li>
                    <li className="category-detail__bullet-item">Restaurant background image (food, ambiance)</li>
                    <li className="category-detail__bullet-item">Custom messaging</li>
                    <li className="category-detail__bullet-item">QR code placement</li>
                  </ul>
                  <p className="category-detail__numbered-item-content">
                    They can create Gift card using AI. Design done in 3 minutes. No designer needed.
                  </p>
                </div>
              </section>

              {/* FAQ Section */}
              <section id="section-faq" className="category-detail__section category-detail__faq-section">
                <h2 className="category-detail__faq-title">Common Questions (FAQ)</h2>
                <div className="category-detail__faq-item">
                  <div className="category-detail__faq-question">Q1: How much does Giftygen cost?</div>
                </div>
                <div className="category-detail__faq-item">
                  <div className="category-detail__faq-question">Q2: Will this work with our POS system?</div>
                </div>
                <div className="category-detail__faq-item">
                  <div className="category-detail__faq-question">Q3: Can we customize the gift card design?</div>
                </div>
                <div className="category-detail__faq-item">
                  <div className="category-detail__faq-question">Q4: How do customers redeem?</div>
                </div>
                <div className="category-detail__faq-item">
                  <div className="category-detail__faq-question">Q5: Is our customer data secure?</div>
                </div>
                <div className="category-detail__faq-item">
                  <div className="category-detail__faq-question">Q6: What if customers don't redeem?</div>
                </div>
                <div className="category-detail__faq-item">
                  <div className="category-detail__faq-question">Q7: Can we run seasonal campaigns?</div>
                </div>
              </section>

              {/* Final CTA Section */}
              <section id="section-cta" className="category-detail__section">
                <div className="category-detail__highlight-box">
                  <p className="category-detail__highlight-text">
                    The restaurants winning right now aren't spending more on marketing. They're using digital gift
                    cards to capture revenue they were leaving on the table.
                  </p>
                  <p className="category-detail__highlight-text" style={{ marginTop: "16px" }}>
                    They've increased redemption from 40% to 75%. They've turned one-time gift card buyers into repeat
                    customers.
                  </p>
                </div>
                <div className="category-detail__cta-buttons" style={{ marginTop: "32px", justifyContent: "center" }}>
                  <button
                    className="category-detail__btn category-detail__btn--primary"
                    onClick={() => {
                      navigate("/");
                      setTimeout(() => {
                        const element = document.getElementById("register");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }, 100);
                    }}
                  >
                    Start Your Free Trial
                  </button>
                  <button
                    className="category-detail__btn category-detail__btn--secondary"
                    onClick={() => navigate("/explore")}
                  >
                    Read Customer Case Studies
                  </button>
                </div>
              </section>
            </>
          ) : categoryId === "hotels" ? (
            <>
              {/* Hero Section */}
              <section id="section-hero" className="category-detail__section">
                <h2 className="category-detail__hero-headline">
                  Hotel Gift Cards | Drive Direct Bookings, Increase Occupancy 15-20% in Low Seasons
                </h2>
                <p className="category-detail__hero-subheading">
                  Expedia is taking 15-25% of every booking. Booking.com is doing the same. You're invisible to direct
                  customers.
                </p>
                <p className="category-detail__paragraph category-detail__paragraph--lead">
                  Your competitors aren't accepting this. They're using digital gift cards as a direct booking
                  channel—capturing customers before OTAs do.
                </p>
                <p className="category-detail__paragraph">
                  Here's what happens: A family wants to book your hotel for a 3-night stay. Instead of going to
                  Expedia, they find you directly. They buy a gift card with room + dining + spa package. You capture
                  the booking AND the customer data. You save the 20% commission. They become a repeat customer.
                </p>
                <p className="category-detail__paragraph">
                  Gift cards become your highest-ROI marketing channel. Better than Google Ads. Better than SEO. Better
                  than traditional marketing.
                </p>
                <div className="category-detail__stats-grid">
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">+25-40%</div>
                    <div className="category-detail__stat-label">Direct Bookings</div>
                  </div>
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">+10-20%</div>
                    <div className="category-detail__stat-label">Low-Season Occupancy</div>
                  </div>
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">+35-50%</div>
                    <div className="category-detail__stat-label">Repeat Guest Rate</div>
                  </div>
                </div>
                <p className="category-detail__paragraph">
                  Hotels using Giftygen see direct bookings +25-40%, OTA commission savings annually, low-season
                  occupancy +10-20%, and repeat guest rate +35-50%.
                </p>
                <p className="category-detail__paragraph">
                  Setup takes 10 minutes. Your first direct booking arrives by Day 1.
                </p>
                <div className="category-detail__cta-buttons" style={{ marginTop: "32px" }}>
                  <button
                    className="category-detail__btn category-detail__btn--primary"
                    onClick={() => {
                      navigate("/");
                      setTimeout(() => {
                        const element = document.getElementById("register");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }, 100);
                    }}
                  >
                    Start Your Free Trial
                  </button>
                  <button
                    className="category-detail__btn category-detail__btn--secondary"
                    onClick={() => navigate("/explore")}
                  >
                    Schedule Demo
                  </button>
                </div>
              </section>

              {/* The Hidden Cost of OTA Dependence */}
              <section id="section-problem" className="category-detail__section">
                <h2 className="category-detail__section-title">
                  The Hidden Cost of OTA Dependence: 15-25% Commission Robbery
                </h2>
                <h3 className="category-detail__challenge-title">
                  Your Real Problem: OTA Commissions Are Killing Your Margins
                </h3>
                <p className="category-detail__paragraph">
                  You know this already: Expedia, Booking.com, and other OTAs take 15-25% commission on every booking
                  made through their platform.
                </p>
                <div className="category-detail__highlight-box">
                  <p className="category-detail__highlight-text">
                    <strong>Let's do the math:</strong>
                    <br />
                    100 rooms × $150/night × 365 nights = $5,475,000 annual revenue
                    <br />
                    If 60% of bookings come through OTAs (industry average):
                    <br />
                    OTA bookings: 21,900 rooms
                    <br />
                    OTA commission (20%): <strong>$657,000/year</strong>
                    <br />
                    That's real money leaving your bank account every year.
                  </p>
                </div>
                <p className="category-detail__paragraph">Worse, OTAs control the narrative. They:</p>
                <ul className="category-detail__bullet-list">
                  <li className="category-detail__bullet-item">Set prices (forcing you lower)</li>
                  <li className="category-detail__bullet-item">Decide visibility (pay more for top placement)</li>
                  <li className="category-detail__bullet-item">Control reviews (negative reviews hurt more on OTA)</li>
                  <li className="category-detail__bullet-item">
                    Own the customer relationship (you never get email/phone)
                  </li>
                  <li className="category-detail__bullet-item">
                    Control cancellation policies (their rules, not yours)
                  </li>
                </ul>
                <p className="category-detail__paragraph">
                  You're not running a hotel anymore. You're running a distribution channel for Expedia.
                </p>

                <h3 className="category-detail__challenge-title" style={{ marginTop: "40px" }}>
                  The Real Cost Goes Deeper
                </h3>
                <p className="category-detail__paragraph">It's not just 15-25% commission. It's also:</p>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">Loss of Customer Data</h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">
                      Expedia owns the customer email, phone, preferences
                    </li>
                    <li className="category-detail__bullet-item">You get name + nothing else</li>
                    <li className="category-detail__bullet-item">They book through Expedia again next time</li>
                    <li className="category-detail__bullet-item">
                      Your marketing budget goes to acquiring NEW customers instead of retaining old ones
                    </li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">Dynamic Pricing Pressure</h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">OTAs force you to compete on price</li>
                    <li className="category-detail__bullet-item">
                      You can't raise rates without losing OTA visibility
                    </li>
                    <li className="category-detail__bullet-item">Your "premium" positioning disappears</li>
                    <li className="category-detail__bullet-item">Margins compress</li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">Low Direct Booking Rate</h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">60-70% of bookings through OTAs</li>
                    <li className="category-detail__bullet-item">Only 30-40% direct</li>
                    <li className="category-detail__bullet-item">Your website is invisible in search</li>
                    <li className="category-detail__bullet-item">Your brand loyalty is eroding</li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">Customer Acquisition Costs</h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Google Ads cost $2-5 per click</li>
                    <li className="category-detail__bullet-item">You need 5% conversion = $40-100 per customer</li>
                    <li className="category-detail__bullet-item">
                      OTA customer never comes back (they book through Expedia again)
                    </li>
                    <li className="category-detail__bullet-item">You're constantly acquiring, never retaining</li>
                  </ul>
                </div>

                <div className="category-detail__highlight-box" style={{ marginTop: "32px" }}>
                  <p className="category-detail__highlight-text">
                    <strong>The Opportunity You're Missing:</strong> Meanwhile, your competitors are solving this.
                    They're using digital gift cards as a direct booking channel. A customer wants to book your hotel,
                    they find you directly instead of Expedia. They buy a gift card for their stay. You keep the entire
                    booking revenue, capture customer data, build loyalty, and reduce acquisition costs.
                  </p>
                  <p className="category-detail__highlight-text" style={{ marginTop: "16px" }}>
                    One direct booking saves you $150-300 in OTA commissions. If you shift 20% of OTA volume to direct,
                    you save <strong>$131,400 annually</strong>.
                  </p>
                </div>
              </section>

              {/* Your Direct Booking Solution */}
              <section id="section-solution" className="category-detail__section">
                <h2 className="category-detail__section-title">
                  Your Direct Booking Solution: Gift Cards That Drive Occupancy
                </h2>
                <p className="category-detail__paragraph">
                  Giftygen is purpose-built for hotels. We've worked with 500+ properties worldwide. Here's how we
                  increase direct bookings and kill your OTA dependence:
                </p>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">1. Gift Cards Become a Booking Channel</h4>
                  <p className="category-detail__numbered-item-content">
                    Instead of customers going to Expedia, they find you directly (through Google, Instagram, Facebook,
                    your newsletter, word-of-mouth).
                  </p>
                  <p className="category-detail__numbered-item-content">
                    They see your gift card offer: "3 nights + breakfast + spa credit"
                  </p>
                  <p className="category-detail__numbered-item-content">
                    They buy the gift card. Boom—you just got a direct booking without paying Expedia.
                  </p>
                  <p className="category-detail__numbered-item-content" style={{ fontWeight: 600, marginTop: "16px" }}>
                    How it works:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Customer buys gift card for $450 (3 nights × $150)</li>
                    <li className="category-detail__bullet-item">
                      You get $450 revenue (not $360 after OTA commission)
                    </li>
                    <li className="category-detail__bullet-item">
                      They redeem on specific dates (PMS syncs automatically)
                    </li>
                    <li className="category-detail__bullet-item">They stay at your hotel</li>
                    <li className="category-detail__bullet-item">You own the customer data forever</li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">
                    2. Flexible Bundled Packages (Increase ADR & Occupancy)
                  </h4>
                  <p className="category-detail__numbered-item-content">Instead of just "room," you create packages:</p>
                  <ul className="category-detail__campaign-list">
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"Romantic Getaway"</div>
                      <div className="category-detail__campaign-desc">Room + dinner reservation + spa discount</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"Family Weekend"</div>
                      <div className="category-detail__campaign-desc">2 rooms + breakfast + kids activities</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"Business Package"</div>
                      <div className="category-detail__campaign-desc">Room + airport transfer + parking</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"Off-Season Special"</div>
                      <div className="category-detail__campaign-desc">Room + 30% discount (fills slow periods)</div>
                    </li>
                  </ul>
                  <p className="category-detail__numbered-item-content">
                    Each package is higher ADR (average daily rate), lower probability of cancellation, clearer customer
                    intent, and better conversion.
                  </p>
                  <p className="category-detail__numbered-item-content">
                    Example: Customer sees "Room Only" = 40% conversion. Customer sees "Room + Breakfast + Spa" = 60%
                    conversion AND higher perceived value.
                  </p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">
                    3. PMS Integration (Automatic Inventory Management)
                  </h4>
                  <p className="category-detail__numbered-item-content">We integrate with:</p>
                  <div style={{ marginBottom: "16px" }}>
                    <div className="category-detail__pos-list">
                      <span className="category-detail__pos-tag">Oracle Hospitality (Opera)</span>
                      <span className="category-detail__pos-tag">IHG (Onyx)</span>
                      <span className="category-detail__pos-tag">Marriott (Marsha)</span>
                      <span className="category-detail__pos-tag">Hilton (Anyplace)</span>
                      <span className="category-detail__pos-tag">Fidelio (Micros)</span>
                      <span className="category-detail__pos-tag">Custom APIs</span>
                    </div>
                  </div>
                  <p className="category-detail__numbered-item-content" style={{ fontWeight: 600, marginTop: "16px" }}>
                    What happens:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Available room inventory syncs automatically</li>
                    <li className="category-detail__bullet-item">Pricing syncs in real-time</li>
                    <li className="category-detail__bullet-item">Redemptions block dates in PMS</li>
                    <li className="category-detail__bullet-item">Multi-property management from one dashboard</li>
                    <li className="category-detail__bullet-item">Zero manual work. Zero double-bookings.</li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">
                    4. Seasonal Pricing (Maximize Low-Season Revenue)
                  </h4>
                  <p className="category-detail__numbered-item-content">Set different prices per season:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">
                      Peak season (summer, holidays): Full price ($150/night)
                    </li>
                    <li className="category-detail__bullet-item">Shoulder (spring, fall): 10% discount ($135/night)</li>
                    <li className="category-detail__bullet-item">
                      Low season (Jan, Feb): 30% discount ($105/night, but fills rooms)
                    </li>
                  </ul>
                  <p className="category-detail__numbered-item-content">
                    Why it works: Low season promotion fills 40% more rooms, which more than makes up for the discount.
                  </p>
                  <p className="category-detail__numbered-item-content">
                    Example: 20 empty rooms × $105 × 60 nights = $126,000 additional revenue
                  </p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">5. Corporate & Loyalty Programs</h4>
                  <p className="category-detail__numbered-item-content">Your gift cards become:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">
                      Corporate packages for companies (employee gifting, client entertainment)
                    </li>
                    <li className="category-detail__bullet-item">
                      Loyalty rewards (book 3 times, get gift card credit)
                    </li>
                    <li className="category-detail__bullet-item">
                      OTA alternative (send corporate travel policy with gift cards instead of booking.com)
                    </li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">
                    6. Guest Data Capture (Lifetime Value Marketing)
                  </h4>
                  <p className="category-detail__numbered-item-content">You now own:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Guest email</li>
                    <li className="category-detail__bullet-item">Phone number</li>
                    <li className="category-detail__bullet-item">
                      Preferences (room view, early check-in, dietary needs)
                    </li>
                    <li className="category-detail__bullet-item">Stay history</li>
                    <li className="category-detail__bullet-item">Spend patterns</li>
                    <li className="category-detail__bullet-item">Lifetime value</li>
                  </ul>
                  <p className="category-detail__numbered-item-content" style={{ fontWeight: 600, marginTop: "16px" }}>
                    Use it for:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Email marketing (book direct next time)</li>
                    <li className="category-detail__bullet-item">
                      Personalized offers (customer loves spa → spa discount offer)
                    </li>
                    <li className="category-detail__bullet-item">VIP programs (top 20% guests get perks)</li>
                    <li className="category-detail__bullet-item">Repeat booking incentives</li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">7. Review & Feedback Integration</h4>
                  <p className="category-detail__numbered-item-content">After redemption:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Automated review request</li>
                    <li className="category-detail__bullet-item">Direct feedback collection</li>
                    <li className="category-detail__bullet-item">No OTA review manipulation</li>
                    <li className="category-detail__bullet-item">Build your own review base</li>
                  </ul>
                </div>
              </section>

              {/* The Hotel Gift Card Platform */}
              <section id="section-platform" className="category-detail__section">
                <h2 className="category-detail__section-title">
                  The Hotel Gift Card Platform Designed by Hospitality Professionals
                </h2>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">1. Hotel-Specific, Not Generic</h4>
                  <p className="category-detail__numbered-item-content">
                    We didn't adapt a generic gift card platform for hotels. We built Giftygen FROM the ground up for
                    hospitality.
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">PMS integration is native (not API hack)</li>
                    <li className="category-detail__bullet-item">Seasonal pricing built in</li>
                    <li className="category-detail__bullet-item">Package bundling for hospitality</li>
                    <li className="category-detail__bullet-item">Revenue management thinking</li>
                    <li className="category-detail__bullet-item">Support team understands hotel business</li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">2. PMS Integration (The Hidden Advantage)</h4>
                  <p className="category-detail__numbered-item-content">
                    We integrate with major property management systems:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Oracle Hospitality (Opera)</li>
                    <li className="category-detail__bullet-item">IHG (Onyx)</li>
                    <li className="category-detail__bullet-item">Marriott (Marsha)</li>
                    <li className="category-detail__bullet-item">Hilton (Anyplace)</li>
                  </ul>
                  <p className="category-detail__numbered-item-content">
                    Why it matters: No manual work. Inventory syncs automatically. Redemptions block dates in PMS.
                    Multi-property management is seamless.
                  </p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">3. 10-Minute Setup</h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Connect PMS (5 min)</li>
                    <li className="category-detail__bullet-item">Create packages (3 min)</li>
                    <li className="category-detail__bullet-item">Go live (2 min)</li>
                  </ul>
                  <p className="category-detail__numbered-item-content">No IT. No development. No downtime.</p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">4. Revenue Management Thinking</h4>
                  <p className="category-detail__numbered-item-content">We understand:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Seasonal pricing</li>
                    <li className="category-detail__bullet-item">Package bundling</li>
                    <li className="category-detail__bullet-item">Occupancy targets</li>
                    <li className="category-detail__bullet-item">ADR management</li>
                    <li className="category-detail__bullet-item">Breakage forecasting</li>
                  </ul>
                  <p className="category-detail__numbered-item-content">
                    Every feature is designed around maximizing revenue and occupancy.
                  </p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">5. Guest Data Ownership</h4>
                  <p className="category-detail__numbered-item-content">You own 100% of guest data:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Email, phone, preferences</li>
                    <li className="category-detail__bullet-item">Booking history</li>
                    <li className="category-detail__bullet-item">Lifetime value metrics</li>
                    <li className="category-detail__bullet-item">Export anytime</li>
                  </ul>
                  <p className="category-detail__numbered-item-content">
                    Use it for direct marketing, loyalty programs, personalized offers.
                  </p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">6. Transparent Pricing</h4>
                  <p className="category-detail__numbered-item-content">$99/month base + 2% per booking</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">No hidden fees</li>
                    <li className="category-detail__bullet-item">No per-room charges</li>
                    <li className="category-detail__bullet-item">Multi-property at same rate</li>
                  </ul>
                  <div className="category-detail__highlight-box" style={{ marginTop: "16px" }}>
                    <p className="category-detail__highlight-text">
                      <strong>Example:</strong> Resort doing $100K monthly gift card revenue
                      <br />
                      Platform cost: $99 + $2,000 = $2,099/month
                      <br />
                      Savings from OTA shift: $15,000/month
                      <br />
                      <strong>Net benefit: $12,901/month</strong>
                    </p>
                  </div>
                </div>
              </section>

              {/* FAQ Section */}
              <section id="section-faq" className="category-detail__section category-detail__faq-section">
                <h2 className="category-detail__faq-title">Questions Hotels Ask</h2>
                <div className="category-detail__faq-item">
                  <div className="category-detail__faq-question">Q1: How does this integrate with our PMS?</div>
                </div>
                <div className="category-detail__faq-item">
                  <div className="category-detail__faq-question">
                    Q2: What if rooms aren't available for certain dates?
                  </div>
                </div>
                <div className="category-detail__faq-item">
                  <div className="category-detail__faq-question">
                    Q3: Can we create custom packages (room + meals + activities)?
                  </div>
                </div>
                <div className="category-detail__faq-item">
                  <div className="category-detail__faq-question">Q4: How do we measure ROI?</div>
                </div>
                <div className="category-detail__faq-item">
                  <div className="category-detail__faq-question">Q5: Can corporate clients use gift cards?</div>
                </div>
                <div className="category-detail__faq-item">
                  <div className="category-detail__faq-question">Q6: Is our guest data secure?</div>
                </div>
              </section>

              {/* Final CTA Section */}
              <section id="section-cta" className="category-detail__section">
                <div className="category-detail__highlight-box">
                  <p className="category-detail__highlight-text">
                    The hotels winning right now aren't spending more on marketing. They're using digital gift cards to
                    capture direct bookings and eliminate OTA dependence.
                  </p>
                  <p className="category-detail__highlight-text" style={{ marginTop: "16px" }}>
                    They've increased direct bookings from 30% to 60%. They've saved $100K+ annually in OTA commissions.
                    They've built their own customer database.
                  </p>
                </div>
                <div className="category-detail__cta-buttons" style={{ marginTop: "32px", justifyContent: "center" }}>
                  <button
                    className="category-detail__btn category-detail__btn--primary"
                    onClick={() => {
                      navigate("/");
                      setTimeout(() => {
                        const element = document.getElementById("register");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }, 100);
                    }}
                  >
                    Start Your Free Trial
                  </button>
                  <button
                    className="category-detail__btn category-detail__btn--secondary"
                    onClick={() => navigate("/explore")}
                  >
                    Schedule a Demo
                  </button>
                  <button
                    className="category-detail__btn category-detail__btn--secondary"
                    onClick={() => navigate("/explore")}
                  >
                    Download Case Studies
                  </button>
                </div>
              </section>
            </>
          ) : categoryId === "retail" ? (
            <>
              {/* Hero Section */}
              <section id="section-hero" className="category-detail__section">
                <h2 className="category-detail__hero-headline">
                  Digital Gift Cards for Retail | Increase Holiday Sales 25-40% & Customer Lifetime Value 3x
                </h2>
                <p className="category-detail__hero-subheading">
                  Q4 is your make-or-break season. 30-40% of annual revenue happens between October and December.
                </p>
                <p className="category-detail__paragraph category-detail__paragraph--lead">
                  But you're leaving money on the table. Physical gift cards get lost in shipping. They don't create
                  repeat customers—the gifter buys, the recipient redeems once, and they're gone.
                </p>
                <p className="category-detail__paragraph">
                  Your competitors aren't accepting this. They're using digital gift cards to capture 25-40% MORE
                  revenue during Q4 while building a customer base that returns year-round.
                </p>
                <p className="category-detail__paragraph">
                  Here's what happens: A customer buys a $50 digital gift card. The recipient opens it on their phone,
                  saves it to Apple Wallet, and buys something. They love it. They return 4 times/year.
                </p>
                <p className="category-detail__paragraph">
                  One gift card sale becomes a lifetime customer value of $200+.
                </p>
                <p className="category-detail__paragraph">
                  Giftygen is purpose-built for retail. Setup takes 10 minutes.
                </p>
                <div className="category-detail__stats-grid">
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">+25-40%</div>
                    <div className="category-detail__stat-label">Q4 Sales</div>
                  </div>
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">-50%</div>
                    <div className="category-detail__stat-label">Customer Acquisition Cost</div>
                  </div>
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">+35-50%</div>
                    <div className="category-detail__stat-label">Repeat Purchase Rate</div>
                  </div>
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">3x</div>
                    <div className="category-detail__stat-label">Customer Lifetime Value</div>
                  </div>
                </div>
                <p className="category-detail__paragraph">
                  Retail brands using Giftygen see Q4 sales +25-40%, customer acquisition cost -50% vs. paid ads, repeat
                  purchase rate +35-50%, and customer lifetime value 3x increase.
                </p>
                <p className="category-detail__paragraph">Launch this week. Capture Q1 sales immediately.</p>
                <div className="category-detail__cta-buttons" style={{ marginTop: "32px" }}>
                  <button
                    className="category-detail__btn category-detail__btn--primary"
                    onClick={() => {
                      navigate("/");
                      setTimeout(() => {
                        const element = document.getElementById("register");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }, 100);
                    }}
                  >
                    Start Your Free Trial
                  </button>
                  <button
                    className="category-detail__btn category-detail__btn--secondary"
                    onClick={() => navigate("/explore")}
                  >
                    Schedule Demo
                  </button>
                </div>
              </section>

              {/* Your Digital Gift Card Solution */}
              <section id="section-solution" className="category-detail__section">
                <h2 className="category-detail__section-title">
                  Your Digital Gift Card Solution: Q4 Revenue + Lifetime Customers
                </h2>
                <p className="category-detail__paragraph">
                  Giftygen is purpose-built for retail. We've worked with 500+ ecommerce brands. Here's how we increase
                  Q4 sales and build year-round revenue:
                </p>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">1. Q4 Capture: 25-40% Revenue Increase</h4>
                  <p className="category-detail__numbered-item-content">
                    How it works: Gift cards are a GIFT category. Unlike regular discounts, people GIVE them. The best
                    time to give a gift: holidays, birthdays, anniversaries, graduations, weddings.
                  </p>
                  <p className="category-detail__numbered-item-content" style={{ fontWeight: 600, marginTop: "16px" }}>
                    Giftygen gives you tools to own Q4:
                  </p>
                  <p className="category-detail__numbered-item-content" style={{ fontWeight: 600 }}>
                    Seasonal campaigns:
                  </p>
                  <ul className="category-detail__campaign-list">
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"The Gift Everyone Loves"</div>
                      <div className="category-detail__campaign-desc">Pre-built email + landing page</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"Last-Minute Gift Ideas"</div>
                      <div className="category-detail__campaign-desc">Dec 15-24</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"Holiday Gift Guide"</div>
                      <div className="category-detail__campaign-desc">Link gift cards to product categories</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"Stocking Stuffer"</div>
                      <div className="category-detail__campaign-desc">Small denomination cards</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"Gift Bundles"</div>
                      <div className="category-detail__campaign-desc">Curated products + gift card package</div>
                    </li>
                  </ul>
                  <p className="category-detail__numbered-item-content" style={{ fontWeight: 600, marginTop: "16px" }}>
                    Visual marketing:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Holiday-themed card design</li>
                    <li className="category-detail__bullet-item">Gift wrapping visualization</li>
                    <li className="category-detail__bullet-item">
                      Recipient preview feature (customer sees how gift arrives)
                    </li>
                  </ul>
                  <p className="category-detail__numbered-item-content" style={{ fontWeight: 600, marginTop: "16px" }}>
                    Email sequences:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Day 1: "The Perfect Gift Waiting for You"</li>
                    <li className="category-detail__bullet-item">Day 3: "Running Out of Time? Here's the Solution"</li>
                    <li className="category-detail__bullet-item">Day 5: "Last Chance - Order by Dec 18"</li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">
                    2. Ecommerce Integration: Seamless Customer Experience
                  </h4>
                  <p className="category-detail__numbered-item-content">We integrate with:</p>
                  <div className="category-detail__pos-list">
                    <span className="category-detail__pos-tag">Shopify</span>
                    <span className="category-detail__pos-tag">WooCommerce</span>
                    <span className="category-detail__pos-tag">BigCommerce</span>
                    <span className="category-detail__pos-tag">Wix</span>
                    <span className="category-detail__pos-tag">Custom APIs</span>
                  </div>
                  <p className="category-detail__numbered-item-content" style={{ fontWeight: 600, marginTop: "16px" }}>
                    What happens:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Gift card in checkout (2-click purchase)</li>
                    <li className="category-detail__bullet-item">Inventory auto-syncs</li>
                    <li className="category-detail__bullet-item">Redemption automatic (code applies to cart)</li>
                    <li className="category-detail__bullet-item">Email delivery instant</li>
                    <li className="category-detail__bullet-item">Customer support automated</li>
                  </ul>
                  <p className="category-detail__numbered-item-content">No manual work. Zero technical debt.</p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">3. Customer Acquisition: 50% Lower Cost</h4>
                  <p className="category-detail__numbered-item-content">
                    Gift cards are a better acquisition channel than paid ads:
                  </p>
                  <div className="category-detail__table-container" style={{ marginTop: "20px" }}>
                    <table className="category-detail__table">
                      <thead>
                        <tr>
                          <th>Metric</th>
                          <th>Paid Ads</th>
                          <th>Gift Cards</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Cost</td>
                          <td>$2-5 per click, $50-200 per customer</td>
                          <td>$0 acquisition (customer gift-gives to you)</td>
                        </tr>
                        <tr>
                          <td>Quality</td>
                          <td>Random person browsing</td>
                          <td>Self-selected (intentional purchase)</td>
                        </tr>
                        <tr>
                          <td>Repeat rate</td>
                          <td>5-10% (high-touch product required)</td>
                          <td>35-50% (recipient loves gift)</td>
                        </tr>
                        <tr>
                          <td>Lifetime value</td>
                          <td>$60-150</td>
                          <td>$180-500</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="category-detail__highlight-box" style={{ marginTop: "20px" }}>
                    <p className="category-detail__highlight-text">
                      <strong>The math:</strong>
                      <br />
                      100 customers from paid ads: $15,000 cost, $9,000 LTV = <strong>-$6,000 loss</strong>
                      <br />
                      100 customers from gift cards: $0 cost, $25,000 LTV = <strong>+$25,000 profit</strong>
                    </p>
                  </div>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">4. Off-Season Revenue: Fill the Gaps</h4>
                  <p className="category-detail__numbered-item-content">
                    Q1-Q3 are slow. Gift card marketing fixes this:
                  </p>
                  <ul className="category-detail__campaign-list">
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">
                        Valentine's Day Campaign (Feb): "Gifts for Every Relationship"
                      </div>
                      <div className="category-detail__campaign-desc">
                        Gift cards for couples, friends, colleagues. Projected sales: +$50K (if Q4 did $200K)
                      </div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">
                        Mother's Day & Father's Day (May/June): "Mom/Dad Will Love This"
                      </div>
                      <div className="category-detail__campaign-desc">
                        Premium gift bundles. Projected sales: +$75K each
                      </div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">
                        Birthday Season (Throughout year): "Birthday Gift Ideas"
                      </div>
                      <div className="category-detail__campaign-desc">
                        Monthly reminders to email list. Projected sales: +$30K/month
                      </div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">
                        Back to School (Aug/Sept): "Teacher Appreciation Gifts" & "Student Gift Ideas"
                      </div>
                      <div className="category-detail__campaign-desc">Projected sales: +$60K</div>
                    </li>
                  </ul>
                  <p className="category-detail__numbered-item-content">
                    Result: Predictable revenue year-round instead of Q4 concentration.
                  </p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">
                    5. Recipient Data Capture: Build Your Audience
                  </h4>
                  <p className="category-detail__numbered-item-content">When someone gifts a $50 gift card, you get:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Gifter email (for future marketing)</li>
                    <li className="category-detail__bullet-item">Recipient email (at redemption)</li>
                    <li className="category-detail__bullet-item">Recipient purchase history (what they buy)</li>
                    <li className="category-detail__bullet-item">Recipient preferences (inferred from purchases)</li>
                  </ul>
                  <p className="category-detail__numbered-item-content">New audience of 500-10,000 people/year</p>
                  <p className="category-detail__numbered-item-content" style={{ fontWeight: 600, marginTop: "16px" }}>
                    Use it for:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Email marketing (show them new products)</li>
                    <li className="category-detail__bullet-item">Loyalty programs (first-time customers → rewards)</li>
                    <li className="category-detail__bullet-item">Personalized recommendations (what they like)</li>
                    <li className="category-detail__bullet-item">
                      Repeat purchase automation (similar to what they bought)
                    </li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">6. Higher AOV During Redemption</h4>
                  <p className="category-detail__numbered-item-content">
                    Recipients don't just redeem. They add items:
                  </p>
                  <div className="category-detail__highlight-box">
                    <p className="category-detail__highlight-text">
                      Gift card value: $50
                      <br />
                      Additional purchase: +$45 (90% of customers)
                      <br />
                      Total transaction: $95
                    </p>
                  </div>
                  <p className="category-detail__numbered-item-content">
                    Why? They like the brand (gift already proven it's good), they want more, they're in buying mode.
                  </p>
                  <p className="category-detail__numbered-item-content">
                    Result: 40-80% higher AOV during gift card redemption
                  </p>
                </div>
              </section>

              {/* The Gift Card Platform Built for Ecommerce */}
              <section id="section-platform" className="category-detail__section">
                <h2 className="category-detail__section-title">The Gift Card Platform Built for Ecommerce</h2>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">
                    1. Ecommerce-First, Not Brick-and-Mortar Afterthought
                  </h4>
                  <p className="category-detail__numbered-item-content">
                    We built Giftygen for online retail from day one. Not adapted from point-of-sale systems.
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Shopify integration is native</li>
                    <li className="category-detail__bullet-item">WooCommerce integration is seamless</li>
                    <li className="category-detail__bullet-item">Email delivery is automatic</li>
                    <li className="category-detail__bullet-item">Redemption is frictionless</li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">2. Seasonal Marketing Built In</h4>
                  <p className="category-detail__numbered-item-content">We understand ecommerce seasonality:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Q4 peak planning</li>
                    <li className="category-detail__bullet-item">Off-season revenue filling</li>
                    <li className="category-detail__bullet-item">Holiday campaign templates</li>
                    <li className="category-detail__bullet-item">Email sequence automation</li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">3. Acquisition + Retention Engine</h4>
                  <p className="category-detail__numbered-item-content">Gift cards are both:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Acquisition: New customer source (gift recipient)</li>
                    <li className="category-detail__bullet-item">Retention: Loyalty builder (repeat purchase)</li>
                  </ul>
                  <p className="category-detail__numbered-item-content">We help with both.</p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">4. Data-Driven Marketing</h4>
                  <p className="category-detail__numbered-item-content">Every gift card = marketing insight:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Who's buying (gifter)</li>
                    <li className="category-detail__bullet-item">Who's receiving (recipient)</li>
                    <li className="category-detail__bullet-item">What they like (purchases)</li>
                    <li className="category-detail__bullet-item">Email marketing channel</li>
                    <li className="category-detail__bullet-item">Lifetime value tracking</li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">5. Inventory Intelligence</h4>
                  <p className="category-detail__numbered-item-content">
                    See what sells (gift cards) and adjust inventory:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">High-demand categories = more stock</li>
                    <li className="category-detail__bullet-item">Slow categories = promotional bundles</li>
                    <li className="category-detail__bullet-item">Seasonal planning = less waste</li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">6. Ecommerce Platform Support</h4>
                  <p className="category-detail__numbered-item-content">
                    Shopify, WooCommerce, BigCommerce, Wix, and more. If your platform isn't listed, we support APIs.
                  </p>
                </div>
              </section>

              {/* FAQ Section */}
              <section id="section-faq" className="category-detail__section category-detail__faq-section">
                <h2 className="category-detail__faq-title">Questions Retail Brands Ask</h2>
                <div className="category-detail__faq-item">
                  <div className="category-detail__faq-question">
                    Q1: How does this integrate with Shopify/WooCommerce?
                  </div>
                </div>
                <div className="category-detail__faq-item">
                  <div className="category-detail__faq-question">Q2: Can customers send gift cards to others?</div>
                </div>
                <div className="category-detail__faq-item">
                  <div className="category-detail__faq-question">Q3: How do you prevent fraud?</div>
                </div>
                <div className="category-detail__faq-item">
                  <div className="category-detail__faq-question">Q4: What's the redemption process?</div>
                </div>
                <div className="category-detail__faq-item">
                  <div className="category-detail__faq-question">Q5: Can we create bundles (product + gift card)?</div>
                </div>
                <div className="category-detail__faq-item">
                  <div className="category-detail__faq-question">Q6: How is customer data handled?</div>
                </div>
              </section>

              {/* Final CTA Section */}
              <section id="section-cta" className="category-detail__section">
                <h2 className="category-detail__section-title">Capture Q4. Build Your Audience. 3x Lifetime Value.</h2>
                <div className="category-detail__highlight-box">
                  <p className="category-detail__highlight-text">
                    The retail brands winning right now aren't spending more on paid ads. They're using digital gift
                    cards to capture Q4 revenue and build year-round customer bases.
                  </p>
                  <p className="category-detail__highlight-text" style={{ marginTop: "16px" }}>
                    They've increased Q4 sales by 25-40%. They've reduced customer acquisition costs by 50%. They've
                    tripled customer lifetime value.
                  </p>
                </div>
                <div className="category-detail__cta-buttons" style={{ marginTop: "32px", justifyContent: "center" }}>
                  <button
                    className="category-detail__btn category-detail__btn--primary"
                    onClick={() => {
                      navigate("/");
                      setTimeout(() => {
                        const element = document.getElementById("register");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }, 100);
                    }}
                  >
                    Start Your Free Trial
                  </button>
                  <button
                    className="category-detail__btn category-detail__btn--secondary"
                    onClick={() => navigate("/explore")}
                  >
                    Schedule Demo
                  </button>
                </div>
              </section>
            </>
          ) : categoryId === "salons" ? (
            <>
              {/* Hero Section */}
              <section id="section-hero" className="category-detail__section">
                <h2 className="category-detail__hero-headline">
                  Digital Gift Cards for Salons & Spas | Increase Retention 51%, Reduce Churn 40%
                </h2>
                <p className="category-detail__hero-subheading">
                  Your biggest problem: churn. 40% of your clients never come back after their first visit. Of those who
                  do, you lose 35% every year. Clients drift to competitors, try new salons, forget about you.
                </p>
                <p className="category-detail__paragraph category-detail__paragraph--lead">
                  But you're missing the tool that fixes churn: gift cards.
                </p>
                <p className="category-detail__paragraph">
                  Salons with digital gift card programs see clients 9x/year instead of 6x/year. 50% higher spending per
                  visit. 40% less churn.
                </p>
                <p className="category-detail__paragraph">
                  Here's why: Gift cards become retention tools. You offer them as loyalty rewards ("Buy 3 services, get
                  $25 credit"). You sell them as gifts (for friends, family, colleagues). Clients keep coming back to
                  use them.
                </p>
                <p className="category-detail__paragraph">
                  Giftygen is built for salons. We integrate with Vagaro, Mindbody, Acuity, and 20+ booking systems.
                  Setup is 10 minutes. Your first gift card sale arrives by Day 1.
                </p>
                <div className="category-detail__stats-grid">
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">+51%</div>
                    <div className="category-detail__stat-label">Retention</div>
                  </div>
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">3x</div>
                    <div className="category-detail__stat-label">Client Lifetime Value</div>
                  </div>
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">-40%</div>
                    <div className="category-detail__stat-label">Churn Reduced</div>
                  </div>
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">10-15%</div>
                    <div className="category-detail__stat-label">Breakage Profit</div>
                  </div>
                </div>
                <p className="category-detail__paragraph">
                  Salons using Giftygen see retention +51%, client lifetime value 3x, churn reduced 40%, and breakage
                  profit 10-15% (highest of all industries).
                </p>
                <p className="category-detail__paragraph">Launch now. Start rebuilding your client base immediately.</p>
                <div className="category-detail__cta-buttons" style={{ marginTop: "32px" }}>
                  <button
                    className="category-detail__btn category-detail__btn--primary"
                    onClick={() => {
                      navigate("/");
                      setTimeout(() => {
                        const element = document.getElementById("register");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }, 100);
                    }}
                  >
                    Start Your Free Trial
                  </button>
                  <button
                    className="category-detail__btn category-detail__btn--secondary"
                    onClick={() => navigate("/explore")}
                  >
                    Schedule Demo
                  </button>
                </div>
              </section>

              {/* The Churn Epidemic */}
              <section id="section-problem" className="category-detail__section">
                <h2 className="category-detail__section-title">
                  The Churn Epidemic: Why Salons Lose 40% of Clients (And How to Stop It)
                </h2>
                <h3 className="category-detail__challenge-title">The Problem You Live With Every Day</h3>
                <p className="category-detail__paragraph">You know the statistics:</p>
                <ul className="category-detail__bullet-list">
                  <li className="category-detail__bullet-item">40% of clients never return after first visit</li>
                  <li className="category-detail__bullet-item">Of those who do, 35% churn annually</li>
                  <li className="category-detail__bullet-item">Client lifetime value stagnates at $400-600</li>
                  <li className="category-detail__bullet-item">
                    Acquisition costs are high (rely on word-of-mouth or ads)
                  </li>
                  <li className="category-detail__bullet-item">Slow periods (seasonality) hurt cash flow</li>
                </ul>
                <p className="category-detail__paragraph">
                  You've tried everything: Loyalty cards (clients lose them), email reminders (low open rates),
                  discounts (compress margins), "Free haircut for every 5 visits" (tracking nightmare). Nothing sticks.
                </p>
                <p className="category-detail__paragraph">
                  Meanwhile, your competitor across town is using digital gift cards strategically—and their client
                  retention is 50%+ higher.
                </p>

                <h3 className="category-detail__challenge-title" style={{ marginTop: "40px" }}>
                  Why Salons Are Different (And Why Traditional Loyalty Programs Fail)
                </h3>
                <p className="category-detail__paragraph">
                  Salons have a unique challenge: you're selling a SERVICE, not a product.
                </p>
                <p className="category-detail__paragraph">
                  You can't say "buy 4 haircuts, get one free." That doesn't work because:
                </p>
                <ul className="category-detail__bullet-list">
                  <li className="category-detail__bullet-item">Clients forget when they're eligible</li>
                  <li className="category-detail__bullet-item">Staff doesn't have easy visibility</li>
                  <li className="category-detail__bullet-item">No systematic way to remind clients</li>
                  <li className="category-detail__bullet-item">Discounts don't drive incremental revenue</li>
                </ul>
                <p className="category-detail__paragraph">But digital gift cards solve this completely.</p>

                <h3 className="category-detail__challenge-title" style={{ marginTop: "40px" }}>
                  The Breakdown of Client Loss
                </h3>
                <p className="category-detail__paragraph">Let's trace where clients disappear:</p>
                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">First-time visit:</h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">You convert 60% (new clients who return once)</li>
                    <li className="category-detail__bullet-item">
                      40% never come back (lost to competitors, bad experience, found elsewhere)
                    </li>
                  </ul>
                </div>
                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">Second-5 visits (Months 1-3):</h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">You retain 70% (clients finding regular spots)</li>
                    <li className="category-detail__bullet-item">
                      30% leave (inconsistent scheduling, found new salon, moved, life changes)
                    </li>
                  </ul>
                </div>
                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">Established clients (Months 3+):</h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">
                      You retain 65% annually (but 35% churn to competitors or lifestyle changes)
                    </li>
                    <li className="category-detail__bullet-item">Average client lifetime: 18-24 months</li>
                    <li className="category-detail__bullet-item">Average client value: $400-600</li>
                  </ul>
                </div>
                <p className="category-detail__paragraph">
                  Result: Most of your revenue is from a small core of clients who stay 2+ years. Constant churn erodes
                  revenue.
                </p>

                <h3 className="category-detail__challenge-title" style={{ marginTop: "40px" }}>
                  The Cost of Churn
                </h3>
                <div className="category-detail__highlight-box">
                  <p className="category-detail__highlight-text">
                    <strong>If you have 100 active clients:</strong>
                    <br />
                    Revenue/month: $15,000 (average $150 per client)
                    <br />
                    Monthly churn: -35 clients
                    <br />
                    Monthly acquisition needed: +35 new clients
                    <br />
                    Cost to acquire: $30-50 per client (ads, referrals, time)
                    <br />
                    Total monthly acquisition cost: $1,050-1,750
                    <br />
                    <strong>That's $12,600-21,000 annually just to stay flat.</strong>
                  </p>
                  <p className="category-detail__highlight-text" style={{ marginTop: "16px" }}>
                    Meanwhile, client lifetime value is only $400-600 because they're gone in 18-24 months.
                  </p>
                </div>

                <h3 className="category-detail__challenge-title" style={{ marginTop: "40px" }}>
                  What If You Could Reduce Churn by 40%?
                </h3>
                <p className="category-detail__paragraph">If churn drops from 35% to 21%:</p>
                <ul className="category-detail__bullet-list">
                  <li className="category-detail__bullet-item">Same revenue ($15,000/month)</li>
                  <li className="category-detail__bullet-item">Lower acquisition cost ($450-750/month)</li>
                  <li className="category-detail__bullet-item">Savings: $600-1,000/month ($7,200-12,000/year)</li>
                </ul>
                <p className="category-detail__paragraph" style={{ fontWeight: 600, marginTop: "24px" }}>
                  But there's more:
                </p>
                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">Increased client lifetime:</h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Current: 18-24 months</li>
                    <li className="category-detail__bullet-item">With gift cards: 24-36 months</li>
                    <li className="category-detail__bullet-item">Value increase per client: +$100-150</li>
                  </ul>
                </div>
                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">Higher spending per visit:</h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Current: $150 average</li>
                    <li className="category-detail__bullet-item">With bundled services: $180-210 average</li>
                    <li className="category-detail__bullet-item">Value increase: +$30-60 per visit</li>
                  </ul>
                </div>
                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">More frequent visits:</h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Current: 6x/year</li>
                    <li className="category-detail__bullet-item">With gift card incentives: 9x/year</li>
                    <li className="category-detail__bullet-item">Revenue increase: +50%</li>
                  </ul>
                </div>
                <div className="category-detail__highlight-box" style={{ marginTop: "32px" }}>
                  <p className="category-detail__highlight-text">
                    <strong>Combined impact:</strong> Churn reduction + longer lifetime + higher spending ={" "}
                    <strong>+60-100% revenue per client</strong>.
                  </p>
                </div>
              </section>

              {/* The Salon Gift Card Solution */}
              <section id="section-solution" className="category-detail__section">
                <h2 className="category-detail__section-title">
                  The Salon Gift Card Solution: Retention, Revenue, and Recurring Clients
                </h2>
                <p className="category-detail__paragraph">
                  Giftygen is purpose-built for salons and spas. We've worked with 1,000+ beauty businesses. Here's how
                  we reduce churn and build recurring revenue:
                </p>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">1. Gift Cards as Loyalty Rewards</h4>
                  <p className="category-detail__numbered-item-content">
                    Instead of "buy 3 services, get 1 free," use gift cards:
                  </p>
                  <div className="category-detail__table-container" style={{ marginTop: "16px" }}>
                    <table className="category-detail__table">
                      <thead>
                        <tr>
                          <th>Old way</th>
                          <th>New way</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>"Get a free haircut after 5 visits"</td>
                          <td>"Get a $25 gift card after 5 visits"</td>
                        </tr>
                        <tr>
                          <td>Clients forget when they're eligible</td>
                          <td>Automatic trigger when client hits 5 visits</td>
                        </tr>
                        <tr>
                          <td>Staff forgets to remind them</td>
                          <td>SMS reminder sent automatically</td>
                        </tr>
                        <tr>
                          <td>Clients move to new salon before redeeming</td>
                          <td>Client can redeem anytime (flexible)</td>
                        </tr>
                        <tr>
                          <td>No data on who's eligible</td>
                          <td>Data tracked in your system</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="category-detail__numbered-item-content">
                    Why it works: Flexibility drives redemption. Clients use it when convenient. You get repeat booking
                    data.
                  </p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">
                    2. Service Bundling: Higher AOV & Lower Churn
                  </h4>
                  <p className="category-detail__numbered-item-content">Create gift card packages clients love:</p>
                  <ul className="category-detail__campaign-list">
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"Blowout Bundle"</div>
                      <div className="category-detail__campaign-desc">4 blowouts + styling product</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"Self-Care Day"</div>
                      <div className="category-detail__campaign-desc">Hair + nails + massage</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"Bridal Package"</div>
                      <div className="category-detail__campaign-desc">Hair + makeup + nails</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"Couples Special"</div>
                      <div className="category-detail__campaign-desc">2x hair + 2x massage</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"New Client"</div>
                      <div className="category-detail__campaign-desc">Intro haircut + color consultation</div>
                    </li>
                  </ul>
                  <p className="category-detail__numbered-item-content" style={{ fontWeight: 600, marginTop: "16px" }}>
                    Why bundling works:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Increases AOV (client spends more)</li>
                    <li className="category-detail__bullet-item">Encourages trying new services (discover upsells)</li>
                    <li className="category-detail__bullet-item">Creates ritual (more frequent visits)</li>
                    <li className="category-detail__bullet-item">
                      Builds connection (multiple services, multiple staff)
                    </li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">3. Salon Booking System Integration</h4>
                  <p className="category-detail__numbered-item-content">We integrate with:</p>
                  <div className="category-detail__pos-list">
                    <span className="category-detail__pos-tag">Mindbody</span>
                    <span className="category-detail__pos-tag">Acuity Scheduling</span>
                    <span className="category-detail__pos-tag">Vagaro</span>
                    <span className="category-detail__pos-tag">Booker</span>
                    <span className="category-detail__pos-tag">Square Appointments</span>
                    <span className="category-detail__pos-tag">20+ other systems</span>
                  </div>
                  <p className="category-detail__numbered-item-content" style={{ fontWeight: 600, marginTop: "16px" }}>
                    What happens:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Gift card purchase triggers appointment reminder</li>
                    <li className="category-detail__bullet-item">Clients can book directly in your system</li>
                    <li className="category-detail__bullet-item">Services auto-deduct from balance</li>
                    <li className="category-detail__bullet-item">Cancellations reduce balance appropriately</li>
                    <li className="category-detail__bullet-item">Analytics show booking patterns</li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">4. Retail Product Upselling</h4>
                  <p className="category-detail__numbered-item-content">
                    Don't forget: clients want to buy home care products.
                  </p>
                  <p className="category-detail__numbered-item-content">At redemption, staff sees:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">"Client has dry skin → recommend moisturizer"</li>
                    <li className="category-detail__bullet-item">
                      "Client colored their hair → recommend color-safe shampoo"
                    </li>
                    <li className="category-detail__bullet-item">
                      "Client requested styling advice → recommend styling products"
                    </li>
                  </ul>
                  <p className="category-detail__numbered-item-content">
                    Result: +$15-30 product upsell per visit (25% of clients)
                  </p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">
                    5. Referral Incentives: Gift Cards as Currency
                  </h4>
                  <p className="category-detail__numbered-item-content">"Bring a friend, get $25 gift card credit"</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Automated referral tracking</li>
                    <li className="category-detail__bullet-item">Easy social sharing (text/email referral link)</li>
                    <li className="category-detail__bullet-item">Reward auto-applies when friend books</li>
                  </ul>
                  <p className="category-detail__numbered-item-content">
                    Why it works: Word-of-mouth is the salon's best marketing. Gift cards make it automatic.
                  </p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">6. Highest Breakage Rates (10-15% Profit)</h4>
                  <p className="category-detail__numbered-item-content">
                    Salons see the highest breakage rates of any industry:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Restaurant breakage: 2-3%</li>
                    <li className="category-detail__bullet-item">Retail breakage: 3-5%</li>
                    <li className="category-detail__bullet-item">Salon breakage: 10-15%</li>
                  </ul>
                  <p className="category-detail__numbered-item-content">
                    Why? Clients buy gift cards for themselves (bundles), use most of it, leave $10-30 balance, never
                    return.
                  </p>
                  <div className="category-detail__highlight-box" style={{ marginTop: "16px" }}>
                    <p className="category-detail__highlight-text">
                      <strong>Example:</strong> $50 gift card sale:
                      <br />
                      $42.50 redeemed (85% redemption)
                      <br />
                      $7.50 balance never used (15% breakage)
                      <br />
                      <strong>Pure profit: $7.50</strong>
                      <br />
                      Over $50K annual gift card sales = <strong>$7,500 pure profit</strong>
                    </p>
                  </div>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">7. SMS Reminders (70% Open Rate)</h4>
                  <p className="category-detail__numbered-item-content">SMS reminders for:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">"Your gift card expires in 14 days"</li>
                    <li className="category-detail__bullet-item">
                      "You haven't booked in 45 days—new services available"
                    </li>
                    <li className="category-detail__bullet-item">"Your loyalty reward is ready"</li>
                    <li className="category-detail__bullet-item">"Member appreciation offer this week"</li>
                  </ul>
                  <p className="category-detail__numbered-item-content">SMS open rate: 68-70% (vs. 20-25% email)</p>
                </div>

                <h3 className="category-detail__challenge-title" style={{ marginTop: "40px" }}>
                  Why Salons Choose Giftygen
                </h3>
                <ul className="category-detail__bullet-list">
                  <li className="category-detail__bullet-item">
                    <strong>Salon-Built, Not Generic:</strong> Built FROM salon needs, not adapted from other
                    industries.
                  </li>
                  <li className="category-detail__bullet-item">
                    <strong>Booking System Integration:</strong> Mindbody, Acuity, Vagaro, and 20+ systems. No manual
                    work.
                  </li>
                  <li className="category-detail__bullet-item">
                    <strong>Breakage Revenue:</strong> 10-15% of gift card sales = pure profit (other industries see
                    2-5%)
                  </li>
                  <li className="category-detail__bullet-item">
                    <strong>Service Bundling:</strong> Higher AOV through strategic service packages
                  </li>
                  <li className="category-detail__bullet-item">
                    <strong>SMS Marketing:</strong> 70% open rate for appointment reminders and promotions
                  </li>
                </ul>
              </section>

              {/* Final CTA Section */}
              <section id="section-cta" className="category-detail__section">
                <h2 className="category-detail__section-title">
                  Stop Losing Clients to Churn. Build Loyalty That Sticks.
                </h2>
                <div className="category-detail__highlight-box">
                  <p className="category-detail__highlight-text">
                    The salons winning right now aren't spending more on marketing. They're using digital gift cards to
                    reduce churn and build recurring client relationships.
                  </p>
                  <p className="category-detail__highlight-text" style={{ marginTop: "16px" }}>
                    They've increased retention by 51%. They've tripled client lifetime value. They've reduced churn by
                    40%. They're capturing 10-15% breakage profit.
                  </p>
                </div>
                <div className="category-detail__cta-buttons" style={{ marginTop: "32px", justifyContent: "center" }}>
                  <button
                    className="category-detail__btn category-detail__btn--primary"
                    onClick={() => {
                      navigate("/");
                      setTimeout(() => {
                        const element = document.getElementById("register");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }, 100);
                    }}
                  >
                    Start Your Free Trial
                  </button>
                  <button
                    className="category-detail__btn category-detail__btn--secondary"
                    onClick={() => navigate("/explore")}
                  >
                    Schedule Demo
                  </button>
                </div>
              </section>
            </>
          ) : categoryId === "fitness" ? (
            <>
              {/* Hero Section */}
              <section id="section-hero" className="category-detail__section">
                <h2 className="category-detail__hero-headline">
                  Digital Gift Cards for Fitness | Convert Trials 55%, Reduce Member Churn 30%
                </h2>
                <p className="category-detail__hero-subheading">
                  Your January peak is amazing. But February through December? Flat. 35% annual member churn is killing
                  your growth. Trial-to-membership conversion is weak (35-45%). Your member acquisition costs are
                  climbing because you rely on seasonal peaks.
                </p>
                <p className="category-detail__paragraph category-detail__paragraph--lead">
                  But your competitors aren't accepting this. They're using digital gift cards to convert 55% of trials
                  into memberships while reducing churn by 30%.
                </p>
                <p className="category-detail__paragraph">
                  Here's what happens: Member brings friend to class. They love it. Instead of "trial," they buy a
                  3-month gift card package. Automatic conversion to membership.
                </p>
                <p className="category-detail__paragraph">
                  Giftygen is purpose-built for fitness. We integrate with Mindbody, Zen Planner, Mariana Tek, and 30+
                  fitness platforms. Setup takes 10 minutes.
                </p>
                <div className="category-detail__stats-grid">
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">35% → 55%</div>
                    <div className="category-detail__stat-label">Trial-to-Membership</div>
                  </div>
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">+35-45%</div>
                    <div className="category-detail__stat-label">Member Retention</div>
                  </div>
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">+25-40%</div>
                    <div className="category-detail__stat-label">Referral Velocity</div>
                  </div>
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">+200-400%</div>
                    <div className="category-detail__stat-label">January Peak</div>
                  </div>
                </div>
                <p className="category-detail__paragraph">
                  Fitness centers using Giftygen see trial-to-membership: 35% → 55% (+20 points), member retention:
                  +35-45%, referral velocity: +25-40%, and January peak: +200-400%.
                </p>
                <p className="category-detail__paragraph">
                  Launch now. Flatten your seasonal curve. Convert trials to lifetime members.
                </p>
                <div className="category-detail__cta-buttons" style={{ marginTop: "32px" }}>
                  <button
                    className="category-detail__btn category-detail__btn--primary"
                    onClick={() => {
                      navigate("/");
                      setTimeout(() => {
                        const element = document.getElementById("register");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }, 100);
                    }}
                  >
                    Start Your Free Trial
                  </button>
                  <button
                    className="category-detail__btn category-detail__btn--secondary"
                    onClick={() => navigate("/explore")}
                  >
                    Schedule Demo
                  </button>
                </div>
              </section>

              {/* Why Fitness Gyms Struggle with Growth */}
              <section id="section-problem" className="category-detail__section">
                <h2 className="category-detail__section-title">
                  Why Fitness Gyms Struggle with Growth: The Churn Treadmill
                </h2>
                <h3 className="category-detail__challenge-title">The Problem Every Gym Faces</h3>
                <p className="category-detail__paragraph">You've probably experienced this cycle:</p>
                <ul className="category-detail__bullet-list">
                  <li className="category-detail__bullet-item">
                    <strong>January:</strong> Amazing. New Year's resolutions. 200+ new members. Classes packed. Revenue
                    up 300%.
                  </li>
                  <li className="category-detail__bullet-item">
                    <strong>February-March:</strong> Members who said "I'm going to work out every day" realize they're
                    not. Cancellations spike. You're back to baseline.
                  </li>
                  <li className="category-detail__bullet-item">
                    <strong>April-September:</strong> Flat. Summer slump (vacations, outdoor fitness). No growth.
                    Revenue stagnates.
                  </li>
                  <li className="category-detail__bullet-item">
                    <strong>October-December:</strong> Slow growth heading into January rush.
                  </li>
                </ul>
                <p className="category-detail__paragraph">
                  Result: Your growth is 100% dependent on January. Without it, you're struggling. With it, you still
                  lose most members by March.
                </p>

                <h3 className="category-detail__challenge-title" style={{ marginTop: "40px" }}>
                  The Core Metrics That Reveal the Problem
                </h3>
                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">Member Churn Rate: 35% Annually</h4>
                  <div className="category-detail__highlight-box">
                    <p className="category-detail__highlight-text">
                      <strong>If you have 500 active members:</strong>
                      <br />
                      January growth: +200 members (700 total)
                      <br />
                      Annual churn: -245 members (due to 35% attrition)
                      <br />
                      February (post-January): back to 450 members
                      <br />
                      You're constantly acquiring new members just to stay flat.
                    </p>
                  </div>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">Trial-to-Membership Conversion: 35-45%</h4>
                  <p className="category-detail__numbered-item-content">Of trials you bring in:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">35-45% convert to paying membership</li>
                    <li className="category-detail__bullet-item">
                      55-65% disappear (didn't love it, didn't commit, cost-conscious)
                    </li>
                  </ul>
                  <p className="category-detail__numbered-item-content">
                    Your conversion rate is half of what it could be.
                  </p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">Member Lifetime Value: Low (18-24 Months)</h4>
                  <p className="category-detail__numbered-item-content">Average member tenure:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">New Year's resolution members: 3-4 months</li>
                    <li className="category-detail__bullet-item">Serious fitness enthusiasts: 24-36 months</li>
                    <li className="category-detail__bullet-item">Casual fitness people: 6-12 months</li>
                    <li className="category-detail__bullet-item">Weighted average: 18 months</li>
                  </ul>
                  <p className="category-detail__numbered-item-content">
                    At $99/month: $1,782 lifetime value. But if you had 30%+ members who stay 3+ years, LTV would be
                    $4,500+.
                  </p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">Seasonal Volatility: High</h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Q1 (Jan-Mar): +300% January, -40% Feb-Mar</li>
                    <li className="category-detail__bullet-item">Q2-Q3 (Apr-Sep): Flat or declining</li>
                    <li className="category-detail__bullet-item">Q4 (Oct-Dec): Slow recovery</li>
                  </ul>
                  <p className="category-detail__numbered-item-content">This volatility makes planning impossible.</p>
                </div>

                <h3 className="category-detail__challenge-title" style={{ marginTop: "40px" }}>
                  Why Traditional Approaches Fail
                </h3>
                <p className="category-detail__paragraph">You've probably tried:</p>
                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">"Bring a Friend Free Week"</h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Friend comes, tries it, leaves</li>
                    <li className="category-detail__bullet-item">No conversion mechanism</li>
                    <li className="category-detail__bullet-item">No follow-up</li>
                    <li className="category-detail__bullet-item">Churn continues</li>
                  </ul>
                </div>
                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">Discounted Memberships</h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Lower price point doesn't increase retention</li>
                    <li className="category-detail__bullet-item">
                      Attracts price-sensitive members (they leave when price changes)
                    </li>
                    <li className="category-detail__bullet-item">Compresses margins</li>
                    <li className="category-detail__bullet-item">Doesn't solve churn problem</li>
                  </ul>
                </div>
                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">Email Reminders</h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Low engagement</li>
                    <li className="category-detail__bullet-item">Doesn't create commitment</li>
                    <li className="category-detail__bullet-item">Members ignore (email fatigue)</li>
                  </ul>
                </div>
                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">Referral Bonuses</h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Manual process (tracking nightmare)</li>
                    <li className="category-detail__bullet-item">Sporadic redemption</li>
                    <li className="category-detail__bullet-item">Low incentive value</li>
                  </ul>
                </div>
                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">Extended Trial Periods</h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">30-day trial just delays decision</li>
                    <li className="category-detail__bullet-item">Members still don't commit</li>
                    <li className="category-detail__bullet-item">Churn still happens at Day 31</li>
                  </ul>
                </div>

                <h3 className="category-detail__challenge-title" style={{ marginTop: "40px" }}>
                  What If You Could...
                </h3>
                <ul className="category-detail__bullet-list">
                  <li className="category-detail__bullet-item">Convert 55% of trials (instead of 35-45%)</li>
                  <li className="category-detail__bullet-item">Reduce churn by 30% (from 35% to 25% annually)</li>
                  <li className="category-detail__bullet-item">
                    Flatten seasonality (grow all year, not just January)
                  </li>
                  <li className="category-detail__bullet-item">
                    Increase referral velocity (members bring 2-3 friends instead of 0.5)
                  </li>
                </ul>
                <div className="category-detail__highlight-box" style={{ marginTop: "24px" }}>
                  <p className="category-detail__highlight-text">
                    <strong>The financial impact:</strong>
                    <br />
                    Current model: 500 members × $99/month × 18-month LTV = $891,000 annual revenue
                    <br />
                    Optimized model: 650 members × $99/month × 26-month LTV = $1,681,000 annual revenue
                    <br />
                    <strong>Revenue increase: +$790,000 annually (+89%)</strong>
                  </p>
                </div>
              </section>

              {/* Your Fitness Membership Solution */}
              <section id="section-solution" className="category-detail__section">
                <h2 className="category-detail__section-title">
                  Your Fitness Membership Solution: Trials That Convert, Members That Stay
                </h2>
                <p className="category-detail__paragraph">
                  Giftygen is purpose-built for fitness. We've worked with 800+ gyms, CrossFit boxes, yoga studios.
                  Here's how we convert trials and reduce churn:
                </p>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">1. Trial Packages as Gift Cards</h4>
                  <p className="category-detail__numbered-item-content">
                    Instead of "30-day free trial," create gift card packages:
                  </p>
                  <ul className="category-detail__campaign-list">
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"2-Week Starter"</div>
                      <div className="category-detail__campaign-desc">$29 gift card = 2 unlimited weeks</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"1-Month Challenge"</div>
                      <div className="category-detail__campaign-desc">$49 gift card = 1 month unlimited</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"3-Month Transformation"</div>
                      <div className="category-detail__campaign-desc">
                        $99 gift card = 3 months unlimited + 1 free personal training session
                      </div>
                    </li>
                  </ul>
                  <p className="category-detail__numbered-item-content" style={{ fontWeight: 600, marginTop: "16px" }}>
                    Why gift cards work better:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">
                      Psychological commitment (they bought it, even if discounted)
                    </li>
                    <li className="category-detail__bullet-item">Clear start/end date (creates urgency)</li>
                    <li className="category-detail__bullet-item">Easy to gift to friends</li>
                    <li className="category-detail__bullet-item">Trackable in membership system</li>
                    <li className="category-detail__bullet-item">Easy to convert to membership</li>
                  </ul>
                  <p className="category-detail__numbered-item-content" style={{ fontWeight: 600, marginTop: "16px" }}>
                    Conversion mechanics:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Day 1: Welcome email + onboarding</li>
                    <li className="category-detail__bullet-item">Day 7: "You're halfway through—loving it?"</li>
                    <li className="category-detail__bullet-item">Day 14: "Ready to keep going?" + membership offer</li>
                    <li className="category-detail__bullet-item">
                      Day 21: Urgent offer ("Final day to get 50% off membership")
                    </li>
                  </ul>
                  <p className="category-detail__numbered-item-content">
                    Result: 55% conversion (vs. 35-45% with free trials)
                  </p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">2. Membership Tier Integration</h4>
                  <p className="category-detail__numbered-item-content">Connect gift cards to membership tiers:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">
                      Gold gift card ($49): Converts to Basic membership ($39/month)
                    </li>
                    <li className="category-detail__bullet-item">
                      Platinum gift card ($99): Converts to Premium membership ($79/month)
                    </li>
                    <li className="category-detail__bullet-item">
                      Diamond gift card ($199): Converts to VIP membership ($149/month)
                    </li>
                  </ul>
                  <p className="category-detail__numbered-item-content">
                    When someone finishes their gift card, they're 90% likely to continue as paying member.
                  </p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">3. Class Package Bundling</h4>
                  <p className="category-detail__numbered-item-content">Create strategic bundles:</p>
                  <ul className="category-detail__campaign-list">
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"Peak Hours Bundle"</div>
                      <div className="category-detail__campaign-desc">
                        Morning + evening classes (fill all time slots)
                      </div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"Strength + Cardio"</div>
                      <div className="category-detail__campaign-desc">Weights + treadmill + rowing combo</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"Recovery Package"</div>
                      <div className="category-detail__campaign-desc">Yoga + stretching + massage</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"Bring a Buddy"</div>
                      <div className="category-detail__campaign-desc">2 memberships at bundled price</div>
                    </li>
                  </ul>
                  <p className="category-detail__numbered-item-content">
                    Why it works: Bundles increase perceived value and AOV.
                  </p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">4. Referral Automation</h4>
                  <p className="category-detail__numbered-item-content">Member brings friend:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Friend buys gift card</li>
                    <li className="category-detail__bullet-item">Referring member automatically gets reward</li>
                    <li className="category-detail__bullet-item">Reward auto-applies as gift card credit</li>
                    <li className="category-detail__bullet-item">
                      Member uses credit as discount on membership renewal
                    </li>
                  </ul>
                  <div className="category-detail__highlight-box" style={{ marginTop: "16px" }}>
                    <p className="category-detail__highlight-text">
                      <strong>Example:</strong> "Bring a friend, earn $25 credit"
                      <br />
                      Member brings 4 friends (realistic for active member)
                      <br />
                      Earn $100 credit (4 friends × $25)
                      <br />
                      Annual membership: Effectively $888 (vs. $1,188 full price)
                    </p>
                  </div>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">5. Class Scheduling Sync</h4>
                  <p className="category-detail__numbered-item-content">We integrate with:</p>
                  <div className="category-detail__pos-list">
                    <span className="category-detail__pos-tag">Mindbody</span>
                    <span className="category-detail__pos-tag">Zen Planner</span>
                    <span className="category-detail__pos-tag">Mariana Tek</span>
                    <span className="category-detail__pos-tag">Class Pass</span>
                    <span className="category-detail__pos-tag">30+ fitness platforms</span>
                  </div>
                  <p className="category-detail__numbered-item-content" style={{ fontWeight: 600, marginTop: "16px" }}>
                    What happens:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Gift card shows which classes/services available</li>
                    <li className="category-detail__bullet-item">Customer books directly in your system</li>
                    <li className="category-detail__bullet-item">Services auto-deduct from balance</li>
                    <li className="category-detail__bullet-item">Analytics show class popularity</li>
                    <li className="category-detail__bullet-item">Staff gets automatic reminders of gift card usage</li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">6. January Peak Capture: 2-4x Revenue</h4>
                  <p className="category-detail__numbered-item-content">
                    January is your golden goose. Most gift cards are purchased:
                  </p>
                  <p className="category-detail__numbered-item-content" style={{ fontWeight: 600 }}>
                    November-December Campaigns:
                  </p>
                  <ul className="category-detail__campaign-list">
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"New Year Gift Ideas"</div>
                      <div className="category-detail__campaign-desc">Gift cards for New Year's resolution</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"Holiday Gift Guide"</div>
                      <div className="category-detail__campaign-desc">Fitness bundles</div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">"January Challenge"</div>
                      <div className="category-detail__campaign-desc">Priced to sell in Dec</div>
                    </li>
                  </ul>
                  <p className="category-detail__numbered-item-content" style={{ fontWeight: 600, marginTop: "16px" }}>
                    Seasonal pricing:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">November: Regular price</li>
                    <li className="category-detail__bullet-item">December 1-15: 10% discount ("Early bird")</li>
                    <li className="category-detail__bullet-item">December 16-23: "Last minute" push</li>
                    <li className="category-detail__bullet-item">December 24-31: Urgent offer</li>
                  </ul>
                  <p className="category-detail__numbered-item-content">
                    Result: January gift card sales 300-400% above baseline
                  </p>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">7. Member Retention: Loyalty Rewards</h4>
                  <p className="category-detail__numbered-item-content">Existing members get:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Birthday gift cards ($25 credit)</li>
                    <li className="category-detail__bullet-item">Anniversary rewards (free month after 12 months)</li>
                    <li className="category-detail__bullet-item">Referral bonuses (bring friend, get credit)</li>
                    <li className="category-detail__bullet-item">Achievement bonuses (100 workouts = $50 credit)</li>
                  </ul>
                  <p className="category-detail__numbered-item-content">
                    Why it works: Rewards keep members engaged and reduce churn.
                  </p>
                </div>
              </section>

              {/* The Fitness Gift Card Platform Built for Growth */}
              <section id="section-platform" className="category-detail__section">
                <h2 className="category-detail__section-title">The Fitness Gift Card Platform Built for Growth</h2>
                <p className="category-detail__paragraph">Why Fitness Centers Choose Giftygen:</p>
                <ul className="category-detail__bullet-list">
                  <li className="category-detail__bullet-item">
                    <strong>Fitness-Built, Not Generic:</strong> Built FROM fitness industry needs, not adapted from
                    other industries.
                  </li>
                  <li className="category-detail__bullet-item">
                    <strong>Booking System Integration:</strong> Mindbody, Zen Planner, Mariana Tek, and 30+ platforms.
                    No manual work.
                  </li>
                  <li className="category-detail__bullet-item">
                    <strong>Trial Conversion Focus:</strong> Every feature designed to convert trials to memberships.
                  </li>
                  <li className="category-detail__bullet-item">
                    <strong>Seasonal Revenue Management:</strong> Tools to capture January peak and fill off-season
                    gaps.
                  </li>
                  <li className="category-detail__bullet-item">
                    <strong>Referral Automation:</strong> Make word-of-mouth marketing automatic and trackable.
                  </li>
                  <li className="category-detail__bullet-item">
                    <strong>Member Retention Tools:</strong> Loyalty rewards, achievement bonuses, anniversary gifts.
                  </li>
                </ul>
              </section>

              {/* Final CTA Section */}
              <section id="section-cta" className="category-detail__section">
                <h2 className="category-detail__section-title">Convert Trials. Reduce Churn. Grow Year-Round.</h2>
                <div className="category-detail__highlight-box">
                  <p className="category-detail__highlight-text">
                    The fitness centers winning right now aren't spending more on marketing. They're using digital gift
                    cards to convert trials, reduce churn, and flatten seasonal curves.
                  </p>
                  <p className="category-detail__highlight-text" style={{ marginTop: "16px" }}>
                    They've increased trial-to-membership conversion from 35% to 55%. They've reduced churn by 30%.
                    They've increased January revenue by 200-400%. They've built year-round growth.
                  </p>
                </div>
                <div className="category-detail__cta-buttons" style={{ marginTop: "32px", justifyContent: "center" }}>
                  <button
                    className="category-detail__btn category-detail__btn--primary"
                    onClick={() => {
                      navigate("/");
                      setTimeout(() => {
                        const element = document.getElementById("register");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }, 100);
                    }}
                  >
                    Start Your Free Trial
                  </button>
                  <button
                    className="category-detail__btn category-detail__btn--secondary"
                    onClick={() => navigate("/explore")}
                  >
                    Schedule Demo
                  </button>
                </div>
              </section>
            </>
          ) : categoryId === "seasonal" ? (
            <>
              {/* Hero Section */}
              <section id="section-hero" className="category-detail__section">
                <h2 className="category-detail__hero-headline">
                  Digital Gift Cards for Professional Services | Build Client Relationships, Drive Referrals
                </h2>
                <p className="category-detail__hero-subheading">
                  Your relationship with clients is everything. But how do you maintain it? Generic holiday cards?
                  Company merchandise? Those feel transactional.
                </p>
                <p className="category-detail__paragraph category-detail__paragraph--lead">
                  Professional services firms using digital gift cards are building deeper relationships. They're saying
                  "thank you" in ways that actually matter. And they're driving referrals from it.
                </p>
                <p className="category-detail__paragraph">
                  Here's what happens: You send a client a branded digital gift card. They love it. They use it. They
                  remember you when they have referral opportunities.
                </p>
                <p className="category-detail__paragraph">
                  Giftygen is purpose-built for professional services. We help with:
                </p>
                <ul className="category-detail__bullet-list">
                  <li className="category-detail__bullet-item">
                    Client appreciation (tiered gifts for different client values)
                  </li>
                  <li className="category-detail__bullet-item">
                    Employee recognition (incentive programs, milestone rewards)
                  </li>
                  <li className="category-detail__bullet-item">Referral programs (automate reward distribution)</li>
                  <li className="category-detail__bullet-item">B2B gifting (corporate bulk orders)</li>
                </ul>
                <div className="category-detail__stats-grid">
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">+20-30%</div>
                    <div className="category-detail__stat-label">Client Retention</div>
                  </div>
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">+25-40%</div>
                    <div className="category-detail__stat-label">Referral Rate</div>
                  </div>
                  <div className="category-detail__stat-card">
                    <div className="category-detail__stat-value">+15-25%</div>
                    <div className="category-detail__stat-label">Deal Velocity</div>
                  </div>
                </div>
                <p className="category-detail__paragraph">
                  Professional services firms using Giftygen see client retention +20-30%, referral rate +25-40%, and
                  deal velocity +15-25%.
                </p>
                <p className="category-detail__paragraph">
                  Setup takes 10 minutes. Your first campaign goes out this week.
                </p>
                <div className="category-detail__cta-buttons" style={{ marginTop: "32px" }}>
                  <button
                    className="category-detail__btn category-detail__btn--primary"
                    onClick={() => {
                      navigate("/");
                      setTimeout(() => {
                        const element = document.getElementById("register");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }, 100);
                    }}
                  >
                    Start Your Free Trial
                  </button>
                  <button
                    className="category-detail__btn category-detail__btn--secondary"
                    onClick={() => navigate("/explore")}
                  >
                    Schedule Demo
                  </button>
                </div>
              </section>

              {/* Why Client Relationships Are Slipping */}
              <section id="section-problem" className="category-detail__section">
                <h2 className="category-detail__section-title">
                  Why Client Relationships Are Slipping (And What To Do About It)
                </h2>
                <h3 className="category-detail__challenge-title">The Client Relationship Problem</h3>
                <p className="category-detail__paragraph">
                  You work in professional services: consulting, law, accounting, insurance, real estate, etc.
                </p>
                <p className="category-detail__paragraph">Your business model is relationship-based:</p>
                <ul className="category-detail__bullet-list">
                  <li className="category-detail__bullet-item">Trust drives decisions</li>
                  <li className="category-detail__bullet-item">Relationships drive referrals</li>
                  <li className="category-detail__bullet-item">Service quality keeps clients for life</li>
                </ul>
                <p className="category-detail__paragraph">
                  But relationships are slipping. Why? Business is transactional. You do a project. Client pays.
                  Relationship fades.
                </p>
                <p className="category-detail__paragraph">You're supposed to stay in touch. But how?</p>
                <ul className="category-detail__bullet-list">
                  <li className="category-detail__bullet-item">Email blasts feel generic</li>
                  <li className="category-detail__bullet-item">Client newsletters go unread</li>
                  <li className="category-detail__bullet-item">Holiday cards end up in recycling</li>
                  <li className="category-detail__bullet-item">Company merchandise doesn't resonate</li>
                  <li className="category-detail__bullet-item">Lunches are expensive and difficult to scale</li>
                </ul>
                <p className="category-detail__paragraph">
                  Meanwhile, clients forget about you. They hire competitors. They don't think of you when they have
                  referral opportunities.
                </p>

                <h3 className="category-detail__challenge-title" style={{ marginTop: "40px" }}>
                  The Metrics That Show the Problem
                </h3>
                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">Client Retention Rate: Declining</h4>
                  <p className="category-detail__numbered-item-content">For professional services:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Target retention: 75-85%</li>
                    <li className="category-detail__bullet-item">Actual retention: 55-70% (many firms below this)</li>
                    <li className="category-detail__bullet-item">Cost to replace client: 5-10x cost to retain</li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">Referral Rate: Weak</h4>
                  <p className="category-detail__numbered-item-content">Professional services rely on referrals:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Current referral rate: 15-25% of new business</li>
                    <li className="category-detail__bullet-item">
                      Potential referral rate: 40-50% (if you invested in relationships)
                    </li>
                    <li className="category-detail__bullet-item">
                      Lost referral revenue: $100K-$1M+ annually (depending on firm size)
                    </li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">Client Lifetime Value: Underutilized</h4>
                  <p className="category-detail__numbered-item-content">
                    Average client value: $20K-$100K per engagement
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Engagement frequency: 1 per year</li>
                    <li className="category-detail__bullet-item">Relationship depth: Transactional</li>
                  </ul>
                  <p className="category-detail__numbered-item-content" style={{ fontWeight: 600, marginTop: "16px" }}>
                    Opportunity: If you increased relationship depth, you could:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Increase engagement frequency (2-3x per year)</li>
                    <li className="category-detail__bullet-item">Increase engagement value (upsells, cross-sells)</li>
                    <li className="category-detail__bullet-item">Increase referral rate (word-of-mouth)</li>
                    <li className="category-detail__bullet-item">Client LTV: 3-5x increase</li>
                  </ul>
                </div>

                <h3 className="category-detail__challenge-title" style={{ marginTop: "40px" }}>
                  What's Working for Competitors
                </h3>
                <p className="category-detail__paragraph">
                  Top-performing professional services firms are using strategic gifting:
                </p>
                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">
                    Client Appreciation: Tiered gifts based on client value
                  </h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Bronze clients: $25 gift card</li>
                    <li className="category-detail__bullet-item">Silver clients: $100 gift card</li>
                    <li className="category-detail__bullet-item">Gold clients: $500 gift card</li>
                    <li className="category-detail__bullet-item">Platinum clients: Custom gift + $1,000 gift card</li>
                  </ul>
                </div>
                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">
                    Employee Recognition: Internal incentive programs
                  </h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Top performer of the month: $250 gift card</li>
                    <li className="category-detail__bullet-item">Project milestone rewards: $100 gift card</li>
                    <li className="category-detail__bullet-item">Tenure bonuses: $1,000+ gift card</li>
                  </ul>
                </div>
                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">
                    Referral Programs: Automated reward distribution
                  </h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Send referral, earn $200 gift card credit</li>
                    <li className="category-detail__bullet-item">Refer a client worth $50K+, earn $1,000 gift card</li>
                    <li className="category-detail__bullet-item">Track referrals, auto-distribute rewards</li>
                  </ul>
                </div>
                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">B2B Gifting: Corporate bulk orders</h4>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">
                      Send 100 custom gift cards to entire client list (January, after year-end)
                    </li>
                    <li className="category-detail__bullet-item">White-label with your company branding</li>
                    <li className="category-detail__bullet-item">Mass import recipient list</li>
                  </ul>
                </div>

                <h3 className="category-detail__challenge-title" style={{ marginTop: "40px" }}>
                  The Opportunity
                </h3>
                <p className="category-detail__paragraph">What if you could:</p>
                <ul className="category-detail__bullet-list">
                  <li className="category-detail__bullet-item">
                    Show clients you care (personalized gifts, not generic)
                  </li>
                  <li className="category-detail__bullet-item">Build goodwill (memorable gift experience)</li>
                  <li className="category-detail__bullet-item">Drive referrals (clients think of you)</li>
                  <li className="category-detail__bullet-item">Automate tracking (no manual processes)</li>
                  <li className="category-detail__bullet-item">Measure ROI (see which gifts drive business)</li>
                </ul>
                <div className="category-detail__highlight-box" style={{ marginTop: "24px" }}>
                  <p className="category-detail__highlight-text">
                    <strong>Financial impact:</strong>
                    <br />
                    Increase client retention from 65% to 80% = <strong>+$500K-$2M retained revenue annually</strong>
                    <br />
                    Increase referral rate from 20% to 35% = <strong>+$300K-$1M additional revenue annually</strong>
                    <br />
                    <strong>Total potential: +$800K-$3M annually</strong>
                  </p>
                </div>
              </section>

              {/* Strategic Gifting for Professional Services */}
              <section id="section-solution" className="category-detail__section">
                <h2 className="category-detail__section-title">
                  Strategic Gifting for Professional Services: Relationships That Drive Business
                </h2>
                <p className="category-detail__paragraph">How Giftygen Solves It:</p>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">1. Tiered Client Appreciation Programs</h4>
                  <p className="category-detail__numbered-item-content">Create different gift tiers:</p>
                  <ul className="category-detail__campaign-list">
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">
                        Bronze (Annual revenue &lt; $10K): $25 gift card
                      </div>
                      <div className="category-detail__campaign-desc">
                        "Thank you for your business" - Quarterly delivery
                      </div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">
                        Silver (Annual revenue $10K-$50K): $100 gift card
                      </div>
                      <div className="category-detail__campaign-desc">
                        "We appreciate your partnership" - Bi-annual delivery, Personalized message
                      </div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">
                        Gold (Annual revenue $50K-$200K): $500 gift card
                      </div>
                      <div className="category-detail__campaign-desc">
                        "You're valued—thank you" - Annual delivery, Custom branded design, Accompanying handwritten
                        note
                      </div>
                    </li>
                    <li className="category-detail__campaign-item">
                      <div className="category-detail__campaign-name">
                        Platinum (Annual revenue $200K+): Custom gift + $1,000 gift card
                      </div>
                      <div className="category-detail__campaign-desc">
                        VIP treatment - Personalized video message, Dinner reservation, Exclusive event invitation
                      </div>
                    </li>
                  </ul>
                  <p className="category-detail__numbered-item-content" style={{ fontWeight: 600, marginTop: "16px" }}>
                    Why it works:
                  </p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Shows you pay attention to relationship value</li>
                    <li className="category-detail__bullet-item">Feels personal (tiered approach)</li>
                    <li className="category-detail__bullet-item">Memorable (clients remember)</li>
                    <li className="category-detail__bullet-item">
                      Drives referrals (goodwill converts to introductions)
                    </li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">2. Employee Recognition & Incentives</h4>
                  <p className="category-detail__numbered-item-content">Motivate your team:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Top Performer of Month: $250 gift card</li>
                    <li className="category-detail__bullet-item">Project Completion: $100 gift card per milestone</li>
                    <li className="category-detail__bullet-item">Tenure Bonuses: $1,000 at 5-year mark</li>
                    <li className="category-detail__bullet-item">Sales Quota: $500 for exceeding targets</li>
                    <li className="category-detail__bullet-item">Referral Rewards: $250 per referred client closed</li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">3. Referral Program Automation</h4>
                  <p className="category-detail__numbered-item-content">Track and reward referrals:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Referring client sends link</li>
                    <li className="category-detail__bullet-item">New client books through link</li>
                    <li className="category-detail__bullet-item">When engagement closes, reward auto-distributes</li>
                    <li className="category-detail__bullet-item">Gift card credit automatically applies</li>
                    <li className="category-detail__bullet-item">
                      Client uses credit for future services (or sells it for cash)
                    </li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">4. B2B Bulk Distribution</h4>
                  <p className="category-detail__numbered-item-content">Mass send to entire client list:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Import client CSV</li>
                    <li className="category-detail__bullet-item">Customize email message</li>
                    <li className="category-detail__bullet-item">Send 500+ gift cards in one click</li>
                    <li className="category-detail__bullet-item">Track open rates and redemptions</li>
                    <li className="category-detail__bullet-item">Measure campaign ROI</li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">5. Branded Design</h4>
                  <p className="category-detail__numbered-item-content">Custom branding:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Company logo</li>
                    <li className="category-detail__bullet-item">Brand colors</li>
                    <li className="category-detail__bullet-item">Custom messaging</li>
                    <li className="category-detail__bullet-item">Professional design</li>
                    <li className="category-detail__bullet-item">Premium feel</li>
                  </ul>
                </div>

                <div className="category-detail__numbered-item">
                  <h4 className="category-detail__numbered-item-title">6. Campaign Automation</h4>
                  <p className="category-detail__numbered-item-content">Email sequences:</p>
                  <ul className="category-detail__bullet-list">
                    <li className="category-detail__bullet-item">Day 1: "A Gift From [Your Firm]"</li>
                    <li className="category-detail__bullet-item">Day 3: Reminder to redeem</li>
                    <li className="category-detail__bullet-item">Day 7: Follow-up message</li>
                  </ul>
                </div>
              </section>

              {/* Final CTA Section */}
              <section id="section-cta" className="category-detail__section">
                <h2 className="category-detail__section-title">
                  Transform Client Relationships Into Referrals & Retention.
                </h2>
                <div className="category-detail__highlight-box">
                  <p className="category-detail__highlight-text">
                    The professional services firms winning right now aren't spending more on marketing. They're using
                    digital gift cards to build deeper client relationships and drive referrals.
                  </p>
                  <p className="category-detail__highlight-text" style={{ marginTop: "16px" }}>
                    They've increased client retention by 20-30%. They've increased referral rates by 25-40%. They've
                    increased deal velocity by 15-25%. They've transformed transactional relationships into strategic
                    partnerships.
                  </p>
                </div>
                <div className="category-detail__cta-buttons" style={{ marginTop: "32px", justifyContent: "center" }}>
                  <button
                    className="category-detail__btn category-detail__btn--primary"
                    onClick={() => {
                      navigate("/");
                      setTimeout(() => {
                        const element = document.getElementById("register");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }, 100);
                    }}
                  >
                    Start Your Free Trial
                  </button>
                  <button
                    className="category-detail__btn category-detail__btn--secondary"
                    onClick={() => navigate("/explore")}
                  >
                    Schedule Demo
                  </button>
                </div>
              </section>
            </>
          ) : (
            <>
              <section className="category-detail__section">
                <p className="category-detail__intro">{categoryData.description}</p>
              </section>

              <section className="category-detail__section">
                <h2 className="category-detail__section-title">{categoryData.featuresTitle}</h2>
                <ul className="category-detail__list">
                  {categoryData.features?.map((feature, index) => (
                    <li key={index} className="category-detail__list-item">
                      <CheckCircle size={20} className="category-detail__check-icon" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="category-detail__section">
                <h2 className="category-detail__section-title">{categoryData.benefitsTitle}</h2>
                <div className="category-detail__benefits-grid">
                  {categoryData.benefits?.map((benefit, index) => (
                    <div key={index} className="category-detail__benefit-card">
                      <div className="category-detail__benefit-icon">
                        <Star size={24} />
                      </div>
                      <p className="category-detail__benefit-text">{benefit}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="category-detail__cta">
                <h3 className="category-detail__cta-title">Ready to get started?</h3>
                <p className="category-detail__cta-text">
                  Start leveraging the power of digital gift cards for your {categoryData.title.toLowerCase()} business
                  today.
                </p>
                <div className="category-detail__cta-buttons">
                  <button
                    className="category-detail__btn category-detail__btn--primary"
                    onClick={() => {
                      navigate("/");
                      setTimeout(() => {
                        const element = document.getElementById("register");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }, 100);
                    }}
                  >
                    {t("businessCategories.cta.register")}
                  </button>
                  <button
                    className="category-detail__btn category-detail__btn--secondary"
                    onClick={() => navigate("/explore")}
                  >
                    {t("businessCategories.cta.learnMore")}
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BusinessCategoryDetail;
