import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getGiftCardDetails, listGiftCards } from "../../services/Actions/giftCardActions";
import { fetchBusinessBySlug } from "../../services/Actions/authActions";
import GiftCardForm from "./GiftCardForm";
import { formatCurrency } from "../../utils/currency";
import SEO from "../../components/SEO";
import { getGiftCardProductSchema, getBreadcrumbSchema } from "../../utils/structuredData";
import { Share2, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getStatusFromBusinessHours, formatBusinessHoursGrouped } from "../../data/industryPageConfig";
import "./GiftCardDetails.css";

const GiftCardDetails = () => {
  const { id, businessSlug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showGiftCardForm, setShowGiftCardForm] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(getGiftCardDetails(id));
    if (businessSlug) {
      dispatch(fetchBusinessBySlug(businessSlug));
      dispatch(listGiftCards("", businessSlug));
    }
    
    // Set animation trigger after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    // Set up intersection observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.2 }
    );
    
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach(el => observer.observe(el));
    
    return () => {
      clearTimeout(timer);
      elements.forEach(el => observer.unobserve(el));
    };
  }, [dispatch, id, businessSlug]);

  const { giftCard, loading, error } = useSelector((state) => state.giftCardDetails);
  const { business } = useSelector((state) => state.business);
  const { giftCards: businessGiftCards } = useSelector((state) => state.giftCardList) || {};
  const otherCards = (Array.isArray(businessGiftCards) ? businessGiftCards : []).filter(
    (card) => card._id !== id && card.status !== "expired" && (!card.expirationDate || new Date(card.expirationDate) >= new Date())
  );

  const handleBuyNow = () => {
    console.log("Selected card data:", {
      giftCardName: giftCard.giftCardName,
      amount: giftCard.amount,
      discount: giftCard.discount,
      id: giftCard._id,
    });
    
    setSelectedCard({
      giftCardName: giftCard.giftCardName,
      amount: giftCard.amount,
      discount: giftCard.discount,
      id: giftCard._id,
    });
    setShowGiftCardForm(true);
  };

  // Handle parallax effect on image
  const handleMouseMove = (e) => {
    if (imageRef.current) {
      const { left, top, width, height } = imageRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      
      imageRef.current.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${y * -5}deg) scale3d(1.05, 1.05, 1.05)`;
      imageRef.current.style.transition = 'transform 0.1s ease-out';
    }
  };

  const handleMouseLeave = () => {
    if (imageRef.current) {
      imageRef.current.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)`;
      imageRef.current.style.transition = 'transform 0.5s ease-out';
    }
  };

  // Card flip animation
  const [isFlipped, setIsFlipped] = useState(false);
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    setTimeout(() => setIsFlipped(false), 3000);
  };

// This is just the updated loading state section of the GiftCardDetails.js file
// Replace the existing loading return statement with this one

if (loading) return (
  <div className="gift-card-loader">
    <div className="loader-content">
      <div className="card-animation">
        <div className="card-shine"></div>
      </div>
      
      <h2 className="loader-title">Preparing Your Gift Card</h2>
      
      <div className="card-details-progress-container">
        <div className="card-details-progress-bar" style={{ width: `${Math.floor(Math.random() * 40) + 30}%` }}></div>
      </div>
      
      <div className="loader-message">
        Finding amazing offers for you...
      </div>
      
      <div className="loader-icons">
        <span className="icon-container">🍽️</span>
        <span className="icon-container">🎁</span>
        <span className="icon-container">💳</span>
      </div>
    </div>
  </div>
);
  
  if (error) return (
    <div className="error-container">
      <div className="error-icon">!</div>
      <p>Oops! We couldn't load this gift card. Please try again.</p>
      <button className="retry-btn pulse" onClick={() => dispatch(getGiftCardDetails(id))}>Retry</button>
    </div>
  );

  const closePopup = () => {
    setShowGiftCardForm(false);
  };

  // SEO data
  const pageUrl = businessSlug 
    ? `https://giftygen.com/${businessSlug}/gift-card/${id}`
    : `https://giftygen.com/gift-card/${id}`;
  
  const productSchema = giftCard ? getGiftCardProductSchema({
    id: giftCard._id,
    title: giftCard.giftCardName,
    description: giftCard.description || `${giftCard.giftCardName} - Digital gift card`,
    price: giftCard.amount,
    currency: giftCard.currency || 'USD',
    image: giftCard.giftCardImg,
    businessName: giftCard.businessName || 'GiftyGen'
  }) : null;

  const breadcrumbs = [
    { name: 'Home', url: 'https://giftygen.com' },
    { name: 'Explore Gift Cards', url: businessSlug ? `https://giftygen.com/${businessSlug}/giftcards` : 'https://giftygen.com/explore' },
    { name: giftCard?.giftCardName || 'Gift Card', url: pageUrl }
  ];
  const breadcrumbSchema = getBreadcrumbSchema(breadcrumbs);
  
  const structuredData = productSchema && breadcrumbSchema 
    ? [productSchema, breadcrumbSchema]
    : productSchema || breadcrumbSchema;

  return (
    <div className={`gift-card-details-container ${isVisible ? 'visible' : ''}`} ref={containerRef}>
      {giftCard && (
        <SEO
          title={`${giftCard.giftCardName} - ${business?.name || giftCard.businessName || 'GiftyGen'}`}
          description={giftCard.description || `${giftCard.giftCardName} digital gift card. Perfect gift for any occasion.`}
          keywords={`${giftCard.giftCardName}, ${business?.name || giftCard.businessName}, gift card, digital gift card, ${giftCard.amount} gift card`}
          image={giftCard.giftCardImg}
          url={pageUrl}
          type="product"
          structuredData={structuredData}
        />
      )}
      <div className="gift-details-inner">
      {businessSlug && business && (
        <header className="venue-header gift-details-venue-header">
          <div className="venue-header-inner">
            <div className="venue-header-left">
              <div className="venue-header-title-row">
                {business.logoUrl && (
                  <img
                    src={business.logoUrl}
                    alt={business.name}
                    className="venue-restaurant-logo"
                  />
                )}
                <div>
                  <h1 className="venue-restaurant-name">{business.name}</h1>
                  <Link to={`/${businessSlug}/giftcards`} className="venue-back-link">
                    ← Back to gift cards
                  </Link>
                </div>
              </div>
              {(() => {
                const addressParts = [
                  business.address?.street,
                  business.address?.city,
                  business.address?.state,
                ].filter(Boolean);
                const addressText = addressParts.join(", ");
                return addressText ? <p className="venue-address">{addressText}</p> : null;
              })()}
              <div className="venue-meta-row">
                {(() => {
                  const pc = business?.pageCustomization || {};
                  const hasHours = pc.businessHours && Object.keys(pc.businessHours).length > 0;
                  const status = hasHours
                    ? getStatusFromBusinessHours(pc.businessHours).statusBadge
                    : pc.statusBadge;
                  const timingsGrouped = hasHours ? formatBusinessHoursGrouped(pc.businessHours) : [];
                  const timingsFallback = hasHours ? null : pc.timings;
                  return (
                    <>
                      {status && <span className="venue-status-badge">{status}</span>}
                      {(timingsGrouped.length > 0 || timingsFallback) && (
                        <div className="venue-timings-wrap">
                          {timingsGrouped.length > 0 ? (
                            <ul className="venue-timings-list">
                              {timingsGrouped.map((line, idx) => (
                                <li key={idx} className="venue-timings-item">{line}</li>
                              ))}
                            </ul>
                          ) : (
                            <span className="venue-meta">{timingsFallback}</span>
                          )}
                          <span className="venue-meta-i">ⓘ</span>
                        </div>
                      )}
                    </>
                  );
                })()}
                {business.phone &&
                  business.phone
                    .split(";")
                    .map((p) => p.trim())
                    .filter(Boolean)
                    .map((num, i) => (
                      <a
                        key={i}
                        href={`tel:${num.replace(/\s/g, "")}`}
                        className="venue-phone"
                      >
                        {num}
                      </a>
                    ))}
              </div>
              <div className="venue-actions">
                <button
                  type="button"
                  className="venue-action-btn"
                  onClick={() => window.navigator.share?.({ url: window.location.href, title: business.name })}
                >
                  <Share2 size={18} />
                  Share
                </button>
                <button
                  type="button"
                  className="venue-action-btn"
                  onClick={() => navigate(`/${businessSlug}/giftcards`, { state: { scrollToReviews: true } })}
                >
                  <MessageCircle size={18} />
                  Reviews
                </button>
              </div>
            </div>
          </div>
        </header>
      )}
      <div className="gift-card-details">
        <div className={`image-container slide-in-left ${isVisible ? 'active' : ''}`}>
          <div className={`image-wrapper ${isFlipped ? 'flipped' : ''}`} 
            ref={imageRef} 
            onMouseMove={handleMouseMove} 
            onMouseLeave={handleMouseLeave}
            onClick={handleFlip}
          >
            <div className="card-front">
              <img src={giftCard.giftCardImg} alt={giftCard.giftCardName} />
              <div className="image-shine"></div>
              
            </div>
           
          </div>
        </div>

        <div className={`details-container slide-in-right ${isVisible ? 'active' : ''}`}>
          <h1 className="fade-in-down delay-1">{giftCard.giftCardName}</h1>

          

          <p className="description fade-in delay-3">
            {giftCard.description}
          </p>

          <div className="price-container fade-in-up delay-4">
            <div className="price">
              {(() => {
                const base = Number(giftCard.amount) || 0;
                const disc = Number(giftCard.discount) || 0;
                const hasDiscount = disc > 0 && disc < 100;
                const final = hasDiscount ? base * (1 - disc / 100) : base;
                const baseText = formatCurrency(base, "INR");
                const finalText = formatCurrency(final, "INR");
                return hasDiscount ? (
                  <>
                    <span className="amount amount-original">{baseText}</span>
                    <span className="amount amount-final">{finalText}</span>
                  </>
                ) : (
                  <span className="amount">{baseText}</span>
                );
              })()}
              {giftCard.discount > 0 && (
                <span className="discount pulse-animation">{giftCard.discount}% Off</span>
              )}
            </div>
            {giftCard.discount > 0 && (
              <div className="saved-amount highlight-text">
                Save {formatCurrency((giftCard.amount * giftCard.discount / 100), "INR")}
              </div>
            )}
          </div>

          <div className="features fade-in-up delay-5">
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span>Instant delivery to your email</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">♻️</span>
              <span>Valid for 12 months</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span>Secure purchase</span>
            </div>
          </div>

          <div className="action-buttons fade-in-up delay-6">
            <button className="buy-now-btn" onClick={handleBuyNow}>
              <span className="btn-text">Buy Now</span>
              <span className="btn-icon">→</span>
              <div className="btn-background"></div>
            </button>
            
          </div>

         
        </div>
      </div>

      {businessSlug && business && otherCards.length > 0 && (
        <section className="gift-details-other-cards animate-on-scroll">
          <h2>Gift Cards from {business.name}</h2>
          <p className="other-cards-subtitle">Delivered instantly as digital cards.</p>
          <div className="gift-details-other-cards-scroll">
            {otherCards.map((card) => (
              <Link
                key={card._id}
                to={`/${businessSlug}/gift-card/${card._id}`}
                className="gift-details-other-card"
              >
                <div className="gift-details-other-card-wrap">
                  <img
                    src={card.giftCardImg}
                    alt={card.giftCardName}
                    className="gift-details-other-card-image"
                  />
                  <span className="gift-details-other-card-tag">{card.giftCardTag}</span>
                </div>
                <div className="gift-details-other-card-body">
                  <h3 className="gift-details-other-card-title">{card.giftCardName}</h3>
                  <span className="gift-details-other-card-price">
                    {formatCurrency(card.amount, "INR")}
                    {card.discount > 0 && ` · ${card.discount}% Off`}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      </div>

      {showGiftCardForm && <GiftCardForm {...selectedCard} onClose={closePopup} />}

      <footer className="footer">
        <div className="footer-bottom">
          <p>&copy; 2025 Restaurant Gift Cards. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default GiftCardDetails;