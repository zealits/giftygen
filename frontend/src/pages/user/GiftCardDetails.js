import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getGiftCardDetails } from "../../services/Actions/giftCardActions";
import GiftCardForm from "./GiftCardForm";
import { formatCurrency } from "../../utils/currency";
import SEO from "../../components/SEO";
import { getGiftCardProductSchema, getBreadcrumbSchema } from "../../utils/structuredData";
import "./GiftCardDetails.css";

const GiftCardDetails = () => {
  const { id, businessSlug } = useParams();
  const dispatch = useDispatch();
  const [showGiftCardForm, setShowGiftCardForm] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    dispatch(getGiftCardDetails(id));
    
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
  }, [dispatch, id]);

  const { giftCard, loading, error } = useSelector((state) => state.giftCardDetails);

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
          title={`${giftCard.giftCardName} - ${giftCard.businessName || 'GiftyGen'}`}
          description={giftCard.description || `${giftCard.giftCardName} digital gift card. Perfect gift for any occasion.`}
          keywords={`${giftCard.giftCardName}, ${giftCard.businessName}, gift card, digital gift card, ${giftCard.amount} gift card`}
          image={giftCard.giftCardImg}
          url={pageUrl}
          type="product"
          structuredData={structuredData}
        />
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
              <span className="amount">{formatCurrency(giftCard.amount, 'INR')}</span>
              <span className="discount pulse-animation">{giftCard.discount}% Off</span>
            </div>
            <div className="saved-amount highlight-text">
              Save {formatCurrency((giftCard.amount * giftCard.discount / 100), 'INR')}
            </div>
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

      <div className="related-cards animate-on-scroll">
        
       
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