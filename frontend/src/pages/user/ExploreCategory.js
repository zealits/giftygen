import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Explore.css";
import logo from "../../assets/giftygen_logo.svg";
import logoWhiteBg from "../../assets/giftgen_whitebg_logo.png";
import { getIndustryData } from "../../data/exploreData";
import {
  ArrowLeft,
  MapPin,
  Search,
  ChevronRight,
  Building2,
} from "lucide-react";

function ExploreCategory() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [theme] = useState(() => localStorage.getItem("giftygen_theme") || "dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const categoryData = getIndustryData(categoryId);

  if (!categoryData) {
    return (
      <div className="explore-page" data-theme={theme}>
        <div className="explore-empty">
          <p>Category not found</p>
          <button onClick={() => navigate("/explore")} className="explore-btn">
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  // Get all locations/categories
  const locations = categoryData.locations || categoryData.categories || {};
  const locationKeys = Object.keys(locations);

  // Filter brands based on search and location
  const filteredData = {};
  locationKeys.forEach((locationKey) => {
    if (selectedLocation !== "all" && selectedLocation !== locationKey) {
      return;
    }

    const brands = locations[locationKey].filter((brand) => {
      const matchesSearch =
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    if (brands.length > 0) {
      filteredData[locationKey] = brands;
    }
  });

  const handleBrandClick = (brandId) => {
    navigate(`/explore/${categoryId}/${brandId}`);
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
              onClick={() => navigate("/explore")}
            >
              Explore
            </button>
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

      {/* Header */}
      <section className="explore-category-header">
        <div className="explore-category-header__container">
          <button
            className="explore-back-btn"
            onClick={() => navigate("/explore")}
          >
            <ArrowLeft size={20} />
            Back to Explore
          </button>
          <h1 className="explore-category-header__title">{categoryData.name}</h1>
          <p className="explore-category-header__description">{categoryData.description}</p>

          {/* Search and Filter */}
          <div className="explore-category-filters">
            <div className="explore-search">
              <div className="explore-search__wrapper">
                <Search className="explore-search__icon" size={20} />
                <input
                  type="text"
                  className="explore-search__input"
                  placeholder="Search brands..."
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

            {locationKeys.length > 1 && (
              <div className="explore-location-filter">
                <select
                  className="explore-location-filter__select"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  <option value="all">All Locations</option>
                  {locationKeys.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Brands by Location */}
      <section className="explore-brands">
        <div className="explore-brands__container">
          {Object.keys(filteredData).length === 0 ? (
            <div className="explore-empty">
              <p>No brands found matching your search.</p>
            </div>
          ) : (
            Object.entries(filteredData).map(([location, brands]) => (
              <div key={location} className="explore-location-section">
                <div className="explore-location-section__header">
                  <MapPin className="explore-location-section__icon" size={24} />
                  <h2 className="explore-location-section__title">{location}</h2>
                  <span className="explore-location-section__count">
                    {brands.length} {brands.length === 1 ? "brand" : "brands"}
                  </span>
                </div>
                <div className="explore-brands__grid">
                  {brands.map((brand) => (
                    <div
                      key={brand.id}
                      className="explore-brand-card"
                      onClick={() => handleBrandClick(brand.id)}
                    >
                      <div className="explore-brand-card__icon">
                        <Building2 size={24} />
                      </div>
                      <h3 className="explore-brand-card__title">{brand.name}</h3>
                      {brand.description && (
                        <p className="explore-brand-card__description">
                          {brand.description}
                        </p>
                      )}
                      {brand.location && (
                        <div className="explore-brand-card__location">
                          <MapPin size={14} />
                          <span>{brand.location}</span>
                        </div>
                      )}
                      <div className="explore-brand-card__footer">
                        <span className="explore-brand-card__cta">
                          View Gift Cards <ChevronRight size={16} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default ExploreCategory;
