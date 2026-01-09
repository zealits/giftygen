import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./BusinessCategoryDetail.css";
import { ArrowLeft, CheckCircle, Star } from "lucide-react";
import SEO from "../../components/SEO";

function BusinessCategoryDetail() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const { t } = useTranslation();
  const [theme, setTheme] = useState(() => localStorage.getItem("giftygen_theme") || "dark");

  // Scroll to top when component mounts or categoryId changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [categoryId]);

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

        <div className="category-detail__content">
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
              Start leveraging the power of digital gift cards for your {categoryData.title.toLowerCase()} business today.
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
        </div>
      </div>
    </div>
  );
}

export default BusinessCategoryDetail;
