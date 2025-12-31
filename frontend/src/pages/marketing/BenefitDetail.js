import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./BenefitDetail.css";
import { ArrowLeft, CheckCircle } from "lucide-react";
import SEO from "../../components/SEO";
import {
  TrendingUp,
  DollarSign,
  Users,
  Repeat,
  Target,
  BarChart3,
  Eye,
  Gift,
} from "lucide-react";

function BenefitDetail() {
  const navigate = useNavigate();
  const { benefitId } = useParams();
  const { t } = useTranslation();
  const [theme, setTheme] = useState(() => localStorage.getItem("giftygen_theme") || "dark");

  // Scroll to top when component mounts or benefitId changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [benefitId]);

  // Handle back button - navigate to landing page and scroll to benefits section
  const handleBack = () => {
    navigate("/");
    setTimeout(() => {
      const element = document.getElementById("benefits");
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const benefitIcons = {
    seasonal: <TrendingUp size={48} />,
    revenue: <DollarSign size={48} />,
    loyalty: <Users size={48} />,
    repeat: <Repeat size={48} />,
    attract: <Target size={48} />,
    trackable: <BarChart3 size={48} />,
    visibility: <Eye size={48} />,
    orderValue: <DollarSign size={48} />,
    flexible: <Gift size={48} />,
  };

  const benefitColors = {
    seasonal: "var(--success)",
    revenue: "var(--primary)",
    loyalty: "var(--primary-2)",
    repeat: "var(--success)",
    attract: "var(--primary)",
    trackable: "var(--primary-2)",
    visibility: "var(--success)",
    orderValue: "var(--primary)",
    flexible: "var(--primary-2)",
  };

  const benefitData = t(`benefits.items.${benefitId}`, { returnObjects: true });

  if (!benefitData || !benefitData.detail) {
    return (
      <div className="benefit-detail" data-theme={theme}>
        <div className="benefit-detail__container">
          <button className="benefit-detail__back-btn" onClick={handleBack}>
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="benefit-detail__error">
            <h2>Benefit not found</h2>
            <p>The benefit you're looking for doesn't exist.</p>
            <button className="benefit-detail__btn" onClick={() => navigate("/")}>
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const detail = benefitData.detail;
  const icon = benefitIcons[benefitId] || <Gift size={48} />;
  const color = benefitColors[benefitId] || "var(--primary)";

  return (
    <div className="benefit-detail" data-theme={theme}>
      <SEO
        title={`${detail.heading} - GiftyGen Business Benefits`}
        description={detail.content}
        keywords={`${detail.heading}, gift card benefits, business benefits, digital gift cards, ${benefitId}`}
        url={`https://giftygen.com/benefit/${benefitId}`}
      />
      <div className="benefit-detail__container">
        <button className="benefit-detail__back-btn" onClick={handleBack}>
          <ArrowLeft size={20} />
          Back
        </button>

        <header className="benefit-detail__header">
          <div className="benefit-detail__icon" style={{ color }}>
            {icon}
          </div>
          <h1 className="benefit-detail__title">{detail.heading}</h1>
          <p className="benefit-detail__subtitle">{detail.subheading}</p>
        </header>

        <div className="benefit-detail__content">
          <section className="benefit-detail__section">
            <p className="benefit-detail__intro">{detail.content}</p>
          </section>

          <section className="benefit-detail__section">
            <h2 className="benefit-detail__section-title">{detail.pointsTitle}</h2>
            <ul className="benefit-detail__list">
              {detail.points?.map((point, index) => (
                <li key={index} className="benefit-detail__list-item">
                  <CheckCircle size={20} className="benefit-detail__check-icon" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="benefit-detail__section">
            <h2 className="benefit-detail__section-title">{t(detail.businessBenefitsTitle)}</h2>
            <div className="benefit-detail__benefits-grid">
              {detail.benefits?.map((benefit, index) => (
                <div key={index} className="benefit-detail__benefit-card">
                  <div className="benefit-detail__benefit-icon" style={{ color }}>
                    <CheckCircle size={24} />
                  </div>
                  <p className="benefit-detail__benefit-text">{benefit}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="benefit-detail__cta">
            <h3 className="benefit-detail__cta-title">{t(detail.cta.title)}</h3>
            <p className="benefit-detail__cta-text">
              {t(detail.cta.text)}
            </p>
            <div className="benefit-detail__cta-buttons">
              <button
                className="benefit-detail__btn benefit-detail__btn--primary"
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
                {t(detail.cta.primaryButton)}
              </button>
              <button
                className="benefit-detail__btn benefit-detail__btn--secondary"
                onClick={() => navigate("/explore")}
              >
                {t(detail.cta.secondaryButton)}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default BenefitDetail;

