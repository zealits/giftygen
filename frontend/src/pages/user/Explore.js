import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Explore.css";
import logo from "../../assets/giftygen_logo.svg";
import logoWhiteBg from "../../assets/giftgen_whitebg_logo.png";
import {
  UtensilsCrossed,
  Hotel,
  Dumbbell,
  ShoppingBag,
  Sparkles,
  Heart,
  Calendar,
  MapPin,
  ArrowRight,
  Search,
  Filter,
} from "lucide-react";

const industries = [
  {
    id: "restaurants",
    name: "Restaurant And Fine Dining",
    icon: UtensilsCrossed,
    description: "Discover amazing dining experiences across India",
    color: "#ff6b6b",
    gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
  },
  {
    id: "hotels",
    name: "Hotels & Resorts",
    icon: Hotel,
    description: "Luxury stays and memorable getaways",
    color: "#4ecdc4",
    gradient: "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
  },
  {
    id: "fitness",
    name: "Fitness and Wellness memberships",
    icon: Dumbbell,
    description: "Stay fit with premium gym and wellness centers",
    color: "#95e1d3",
    gradient: "linear-gradient(135deg, #95e1d3 0%, #f38181 100%)",
  },
  {
    id: "retail",
    name: "Retail & E-commerce",
    icon: ShoppingBag,
    description: "Shop from your favorite brands",
    color: "#f093fb",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    id: "beauty",
    name: "Beauty and Personal care",
    icon: Sparkles,
    description: "Pamper yourself with beauty and wellness",
    color: "#ffecd2",
    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  },
  {
    id: "seasonal",
    name: "Seasonal Gifting",
    icon: Calendar,
    description: "Perfect gifts for every occasion",
    color: "#a8edea",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  },
];

function Explore() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [theme] = useState(() => localStorage.getItem("giftygen_theme") || "dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredIndustries = industries.filter((industry) => {
    const matchesSearch = industry.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleIndustryClick = (industryId) => {
    navigate(`/explore/${industryId}`);
  };

  return (
    <div className="explore-page" data-theme={theme}>
      {/* Navigation */}
      <nav className="explore-nav">
        <div className="explore-nav__container">
          <div
            className="explore-nav__brand"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            <img
              src={theme === "light" ? logoWhiteBg : logo}
              alt="GiftyGen"
              className="explore-nav__logo"
            />
          </div>
          <div className="explore-nav__actions">
            <button
              className="explore-nav__link"
              onClick={() => navigate("/")}
            >
              Home
            </button>
            <button
              className="explore-nav__link explore-nav__link--primary"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="explore-hero">
        <div className="explore-hero__container">
          <div className="explore-hero__content">
            <h1 className="explore-hero__title">
              Discover Gift Cards
              <span className="explore-hero__title-accent"> That Perfectly Match</span>
            </h1>
            <p className="explore-hero__subtitle">
              Explore thousands of gift cards from your favorite restaurants, hotels, fitness centers, and more. Find the perfect gift for any occasion.
            </p>

            {/* Search Bar */}
            <div className="explore-search">
              <div className="explore-search__wrapper">
                <Search className="explore-search__icon" size={20} />
                <input
                  type="text"
                  className="explore-search__input"
                  placeholder="Search by industry or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="explore-search__clear"
                    onClick={() => setSearchQuery("")}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="explore-industries">
        <div className="explore-industries__container">
          <div className="explore-section__header">
            <h2 className="explore-section__title">Browse by Industry</h2>
            <p className="explore-section__subtitle">
              Choose a category to explore gift cards from top brands
            </p>
          </div>

          <div className="explore-industries__grid">
            {filteredIndustries.map((industry) => {
              const IconComponent = industry.icon;
              return (
                <div
                  key={industry.id}
                  className="explore-industry-card"
                  onClick={() => handleIndustryClick(industry.id)}
                  style={{
                    "--industry-color": industry.color,
                    "--industry-gradient": industry.gradient,
                  }}
                >
                  <div className="explore-industry-card__icon-wrapper">
                    <IconComponent className="explore-industry-card__icon" size={32} />
                  </div>
                  <h3 className="explore-industry-card__title">{industry.name}</h3>
                  <p className="explore-industry-card__description">{industry.description}</p>
                  <div className="explore-industry-card__footer">
                    <span className="explore-industry-card__cta">
                      Explore <ArrowRight size={16} />
                    </span>
                  </div>
                  <div className="explore-industry-card__hover-effect"></div>
                </div>
              );
            })}
          </div>

          {filteredIndustries.length === 0 && (
            <div className="explore-empty">
              <p>No industries found matching your search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="explore-features">
        <div className="explore-features__container">
          <div className="explore-feature">
            <MapPin className="explore-feature__icon" size={24} />
            <h3 className="explore-feature__title">Location-Based</h3>
            <p className="explore-feature__description">
              Find gift cards from brands in your city
            </p>
          </div>
          <div className="explore-feature">
            <Heart className="explore-feature__icon" size={24} />
            <h3 className="explore-feature__title">Perfect Gifts</h3>
            <p className="explore-feature__description">
              Thoughtful gifts for every occasion
            </p>
          </div>
          <div className="explore-feature">
            <Sparkles className="explore-feature__icon" size={24} />
            <h3 className="explore-feature__title">Premium Brands</h3>
            <p className="explore-feature__description">
              Curated selection of top brands
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Explore;
