import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Share2, MessageCircle, Gift, Star } from "lucide-react";
import axios from "../../utils/axiosConfig";
import { fetchBusinessBySlug } from "../../services/Actions/authActions";
import { listGiftCards } from "../../services/Actions/giftCardActions";
import { formatCurrency } from "../../utils/currency";
import { getStatusFromBusinessHours, formatBusinessHoursGrouped } from "../../data/industryPageConfig";
import SEO from "../../components/SEO";
import GiftCardForm from "../user/GiftCardForm";
import "../user/UserLanding.css";
import "./ExampleRestaurant.css";

const INDUSTRY_TAB_MAP = {
  "Restaurant And Fine Dining": { id: "menu", label: "Menu" },
  "Hotels & Resorts": { id: "rooms", label: "Rooms" },
  "Fitness and Wellness memberships": { id: "classes", label: "Classes" },
  "Retail & E-commerce": { id: "collections", label: "Collections" },
  "Beauty and Personal care": { id: "services", label: "Services" },
  "Seasonal Gifting": { id: "campaigns", label: "Campaigns" },
};

const BusinessPage = () => {
  const { businessSlug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { business, loading: businessLoading } = useSelector((state) => state.business);
  const { giftCards, loading: cardsLoading } = useSelector((state) => state.giftCardList);

  const [activeTab, setActiveTab] = useState("giftcards");
  const [photoFilter, setPhotoFilter] = useState("all");
  const [showGiftCardForm, setShowGiftCardForm] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ averageRating: null, totalCount: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "", reviewerName: "" });
  const [submitReviewLoading, setSubmitReviewLoading] = useState(false);
  const [reviewSubmitMessage, setReviewSubmitMessage] = useState("");
  const [roomGalleryIndex, setRoomGalleryIndex] = useState({});

  const fetchReviews = useCallback(async () => {
    if (!businessSlug) return;
    setReviewsLoading(true);
    try {
      const { data } = await axios.get(`/api/v1/admin/business/${businessSlug}/reviews`);
      setReviews(data.reviews || []);
      setReviewSummary(data.summary || { averageRating: null, totalCount: 0 });
    } catch (err) {
      setReviews([]);
      setReviewSummary({ averageRating: null, totalCount: 0 });
    } finally {
      setReviewsLoading(false);
    }
  }, [businessSlug]);

  useEffect(() => {
    if (businessSlug) {
      dispatch(fetchBusinessBySlug(businessSlug));
      dispatch(listGiftCards("", businessSlug));
      fetchReviews();
    }
  }, [dispatch, businessSlug, fetchReviews]);

  const scrollToMain = () => {
    const el = document.querySelector(".venue-main");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/${businessSlug}/giftcards`;
    const title = `${business?.name || "Business"} - Gift Cards | GiftyGen`;
    const text = `Check out gift cards from ${business?.name || "this business"}.`;

    if (window.navigator.share) {
      try {
        await window.navigator.share({
          title,
          text,
          url,
        });
      } catch (err) {
        if (err.name !== "AbortError") copyLinkToClipboard(url);
      }
    } else {
      copyLinkToClipboard(url);
    }
  };

  const copyLinkToClipboard = (url) => {
    navigator.clipboard.writeText(url).then(
      () => alert("Link copied to clipboard!"),
      () => alert("Could not copy. Share this link: " + url)
    );
  };

  const handleTabClick = (id) => {
    setActiveTab(id);
    scrollToMain();
  };

  const handleBuyNow = (e, giftCardName, amount, discount, id) => {
    e.stopPropagation();
    setSelectedCard({ giftCardName, amount, discount, id });
    setShowGiftCardForm(true);
  };

  const handleCardClick = (cardId, event) => {
    if (event.target.closest(".purchase-card-button")) return;
    navigate(`/${businessSlug}/gift-card/${cardId}`);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const { rating, comment, reviewerName } = reviewForm;
    if (!rating || rating < 1 || rating > 5) {
      setReviewSubmitMessage("Please select a star rating (1–5).");
      return;
    }
    setSubmitReviewLoading(true);
    setReviewSubmitMessage("");
    try {
      await axios.post(`/api/v1/admin/business/${businessSlug}/reviews`, {
        rating,
        comment: (comment || "").trim(),
        reviewerName: (reviewerName || "").trim(),
      });
      setReviewForm({ rating: 0, comment: "", reviewerName: "" });
      setReviewSubmitMessage("Thank you! Your review has been submitted.");
      fetchReviews();
    } catch (err) {
      setReviewSubmitMessage(err?.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitReviewLoading(false);
    }
  };

  const pc = business?.pageCustomization || {};
  const displayStatus = useMemo(() => {
    if (pc.businessHours && Object.keys(pc.businessHours).length > 0) {
      return getStatusFromBusinessHours(pc.businessHours).statusBadge;
    }
    return pc.statusBadge;
  }, [pc.businessHours, pc.statusBadge]);
  const displayTimingsGrouped = useMemo(() => {
    if (pc.businessHours && Object.keys(pc.businessHours).length > 0) {
      return formatBusinessHoursGrouped(pc.businessHours);
    }
    return [];
  }, [pc.businessHours]);
  const displayTimingsFallback = useMemo(() => {
    if (pc.businessHours && Object.keys(pc.businessHours).length > 0) return null;
    return pc.timings;
  }, [pc.businessHours, pc.timings]);
  const knownForList = Array.isArray(pc.knownFor) ? pc.knownFor : (pc.knownFor ? [pc.knownFor] : []);
  const knownForDisplayFull = knownForList.join(", ");
  const KNOWN_FOR_VISIBLE = 5;
  const knownForTruncated = knownForList.length <= KNOWN_FOR_VISIBLE
    ? knownForDisplayFull
    : knownForList.slice(0, KNOWN_FOR_VISIBLE).join(", ") + " " + (knownForList.length - KNOWN_FOR_VISIBLE) + "+";
  const displaySubtitle = knownForTruncated || (Array.isArray(pc.subtitle) ? pc.subtitle.join(", ") : pc.subtitle || "");
  const displayKnownFor = knownForDisplayFull;
  const customTab = business?.industry ? INDUSTRY_TAB_MAP[business.industry] : null;
  const baseTabs = [
    { id: "overview", label: "Overview" },
    { id: "giftcards", label: "Gift Cards" },
    { id: "reviews", label: "Reviews" },
    { id: "photos", label: "Photos" },
  ];
  const tabs = customTab ? [...baseTabs, customTab] : baseTabs;

  const galleryImages = business?.galleryImages?.length
    ? business.galleryImages
    : business?.logoUrl
      ? [business.logoUrl]
      : [];
  const photoLabels = Array.isArray(pc.photoLabels)
    ? pc.photoLabels.slice(0, galleryImages.length)
    : [];
  const photoFilterOptions = useMemo(() => {
    const labels = [...new Set(photoLabels.map((l) => (l || "").trim()).filter(Boolean))];
    return ["All", ...labels];
  }, [photoLabels.join(",")]);
  const filteredGalleryImages = useMemo(() => {
    if (photoFilter === "all") return galleryImages.map((src, i) => ({ src, i }));
    return galleryImages
      .map((src, i) => ({ src, i }))
      .filter(({ i: idx }) => (photoLabels[idx] || "").toLowerCase() === photoFilter);
  }, [galleryImages, photoFilter, photoLabels]);

  const addressParts = [
    business?.address?.street,
    business?.address?.city,
    business?.address?.state,
    business?.address?.zipCode,
  ].filter(Boolean);
  const addressText = addressParts.join(", ");

  const activeCards =
    giftCards && Array.isArray(giftCards)
      ? giftCards.filter(
          (c) =>
            c.status === "active" && (!c.expirationDate || new Date(c.expirationDate) >= new Date())
        )
      : [];

  if (businessLoading && !business) {
    return (
      <div className="venue-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="venue-page" style={{ padding: 40, textAlign: "center" }}>
        <h2>Business not found</h2>
        <p>This business page could not be loaded.</p>
      </div>
    );
  }

  const pageTitle = `${business.name} - Gift Cards | GiftyGen`;
  const pageDescription = `Browse and purchase digital gift cards from ${business.name}.`;
  const pageUrl = `${window.location.origin}/${businessSlug}/giftcards`;

  return (
    <div className="venue-page">
      <SEO title={pageTitle} description={pageDescription} url={pageUrl} />

      <header className="venue-header">
        <div className="venue-header-inner">
          <div className="venue-header-left">
            <div className="venue-header-title-row">
              {(business.logoUrl || galleryImages[0]) && (
                <img
                  src={business.logoUrl || galleryImages[0]}
                  alt={business.name}
                  className="venue-restaurant-logo"
                />
              )}
              <div className="venue-header-title-block">
                <h1 className="venue-restaurant-name">{business.name}</h1>
                {reviewSummary.totalCount > 0 && reviewSummary.averageRating != null && (() => {
                  const r = Number(reviewSummary.averageRating);
                  return (
                    <div className="venue-rating-inline" aria-label={`${r} out of 5 stars, ${reviewSummary.totalCount} ${reviewSummary.totalCount === 1 ? "review" : "reviews"}`}>
                      <div className="venue-rating-stars-row">
                        {[1, 2, 3, 4, 5].map((i) => {
                          const full = r >= i;
                          const half = !full && r >= i - 0.5;
                          if (full) {
                            return (
                              <Star key={i} className="venue-rating-star venue-rating-star--filled" size={18} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                            );
                          }
                          if (half) {
                            return (
                              <span key={i} className="venue-rating-star venue-rating-star--half" aria-hidden="true">
                                <Star className="venue-rating-star-outline" size={18} fill="none" strokeWidth={1.5} />
                                <span className="venue-rating-star-half-fill">
                                  <Star size={18} fill="currentColor" strokeWidth={0} />
                                </span>
                              </span>
                            );
                          }
                          return (
                            <Star key={i} className="venue-rating-star venue-rating-star--empty" size={18} fill="none" strokeWidth={1.5} aria-hidden="true" />
                          );
                        })}
                      </div>
                      <span className="venue-rating-inline-count">
                        {reviewSummary.totalCount} {reviewSummary.totalCount === 1 ? "review" : "reviews"}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>
            {knownForList.length > 0 && (
              <div className="venue-header-knownfor">
                {knownForList.slice(0, KNOWN_FOR_VISIBLE).map((item) => (
                  <span key={item} className="venue-header-knownfor-tag">{item}</span>
                ))}
                {knownForList.length > KNOWN_FOR_VISIBLE && (
                  <button
                    type="button"
                    className="venue-header-knownfor-tag venue-header-knownfor-tag--more"
                    onClick={() => {
                      handleTabClick("overview");
                      setTimeout(() => {
                        document.getElementById("venue-known-for")?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 100);
                    }}
                  >
                    {knownForList.length - KNOWN_FOR_VISIBLE}+
                  </button>
                )}
              </div>
            )}
            {addressText && <p className="venue-address">{addressText}</p>}
            <div className="venue-meta-row">
              {displayStatus && <span className="venue-status-badge">{displayStatus}</span>}
              {(displayTimingsGrouped.length > 0 || displayTimingsFallback) && (
                <div className="venue-timings-wrap">
                  {displayTimingsGrouped.length > 0 ? (
                    <ul className="venue-timings-list">
                      {displayTimingsGrouped.map((line, idx) => (
                        <li key={idx} className="venue-timings-item">{line}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="venue-meta">{displayTimingsFallback}</span>
                  )}
                </div>
              )}
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
            {pc.disclaimer && <p className="venue-disclaimer">{pc.disclaimer}</p>}
            <div className="venue-actions">
              <button type="button" className="venue-action-btn" onClick={handleShare}>
                <Share2 size={18} />
                Share
              </button>
              <button type="button" className="venue-action-btn" onClick={() => handleTabClick("reviews")}>
                <MessageCircle size={18} />
                Reviews
              </button>
            </div>
          </div>
        </div>
      </header>

      {galleryImages.length > 0 && (
        <section className={`venue-gallery ${galleryImages.length === 1 ? "venue-gallery-single" : ""}`}>
          <div className="venue-gallery-main">
            <img src={galleryImages[0]} alt={business.name} />
          </div>
          {galleryImages.length >= 2 && (
            <div className="venue-gallery-top">
              <img src={galleryImages[1]} alt="" />
            </div>
          )}
          {galleryImages.length >= 3 && (
            <div className="venue-gallery-bottom">
              <img src={galleryImages[2]} alt="" />
              <button
                type="button"
                className="venue-gallery-overlay"
                onClick={() => handleTabClick("photos")}
              >
                View Gallery
              </button>
            </div>
          )}
        </section>
      )}

      <nav className="venue-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`venue-tab ${activeTab === tab.id ? "venue-tab--active" : ""}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="venue-main">
        <div className="venue-layout">
          <div className="venue-content">
            {activeTab === "overview" && (
              <>
                {(addressText || business?.address?.latitude) && (
                  <section className="venue-card venue-card-map">
                    <h3 className="venue-card-title">Location</h3>
                    {addressText && (
                      <p className="venue-card-text venue-address-inline" style={{ marginBottom: 12 }}>
                        {addressText}
                      </p>
                    )}
                    {(addressText || (business?.address?.latitude != null && business?.address?.longitude != null)) && (
                      <div className="venue-map-wrap">
                        <iframe
                          title={`Map: ${business?.name || "Business"} location`}
                          className="venue-map-iframe"
                          src={
                            business?.address?.latitude != null && business?.address?.longitude != null
                              ? `https://www.google.com/maps?q=${business.address.latitude},${business.address.longitude}&z=15&output=embed`
                              : `https://www.google.com/maps?q=${encodeURIComponent(addressText)}&output=embed`
                          }
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    )}
                    {(addressText || (business?.address?.latitude != null && business?.address?.longitude != null)) && (
                      <a
                        className="venue-map-link"
                        href={
                          business?.address?.latitude != null && business?.address?.longitude != null
                            ? `https://www.google.com/maps?q=${business.address.latitude},${business.address.longitude}`
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open in Google Maps
                      </a>
                    )}
                  </section>
                )}
                {knownForList.length > 0 && (
                  <section id="venue-known-for" className="venue-card">
                    <h3 className="venue-card-title">Known For</h3>
                    <div className="venue-knownfor-tags">
                      {knownForList.map((item, idx) => (
                        <span key={`${item}-${idx}`} className="venue-knownfor-tag">{item}</span>
                      ))}
                    </div>
                  </section>
                )}
                {business.description && !displayKnownFor && (
                  <section className="venue-card">
                    <h3 className="venue-card-title">About</h3>
                    <p className="venue-card-text">{business.description}</p>
                  </section>
                )}
              </>
            )}

            {activeTab === "giftcards" && (
              <section className="venue-giftcards">
                <h3 className="venue-card-title">Gift Cards from {business.name}</h3>
                <p className="venue-card-muted" style={{ marginBottom: 20 }}>
                  Delivered instantly as digital cards.
                </p>
                {cardsLoading && activeCards.length === 0 ? (
                  <p>Loading gift cards...</p>
                ) : activeCards.length === 0 ? (
                  <p className="venue-card-muted">No gift cards available yet.</p>
                ) : (
                  <div className="purchase-card-container venue-giftcards-grid">
                    {activeCards.map((card) => (
                      <article
                        key={card._id}
                        className="purchase-card modern-card venue-giftcard"
                        onClick={(e) => handleCardClick(card._id, e)}
                      >
                        <div className="purchase-card-image modern-card-image">
                          <img src={card.giftCardImg} alt={card.giftCardName} loading="lazy" />
                          <div className="card-image-overlay" />
                          <div className="business-card-badge modern-badge">
                            <span className="business-badge-text">{business.name}</span>
                          </div>
                        </div>
                        <div className="purchase-card-content modern-card-content">
                          <h3 className="purchase-card-title modern-card-title">{card.giftCardName}</h3>
                          <p className="purchase-card-description modern-card-description">{card.description}</p>
                          {(Array.isArray(card.tags) && card.tags.length > 0 ? card.tags : card.giftCardTag ? [card.giftCardTag] : []).length > 0 && (
                            <div className="venue-giftcard-tags">
                              {(Array.isArray(card.tags) && card.tags.length > 0 ? card.tags : [card.giftCardTag]).map((tag) => (
                                <span key={tag} className="venue-giftcard-tag">{tag}</span>
                              ))}
                            </div>
                          )}
                          <div className="purchase-card-info modern-card-info">
                            <div className="price-section">
                              {(() => {
                                const base = Number(card.amount) || 0;
                                const disc = Number(card.discount) || 0;
                                const hasDiscount = disc > 0 && disc < 100;
                                const final = hasDiscount ? base * (1 - disc / 100) : base;
                                const baseText = formatCurrency(base, "INR");
                                const finalText = formatCurrency(final, "INR");
                                return hasDiscount ? (
                                  <div className="venue-price-row">
                                    <span className="purchase-card-price modern-price modern-price-original">
                                      {baseText}
                                    </span>
                                    <span className="purchase-card-price modern-price modern-price-final">
                                      {finalText}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="purchase-card-price modern-price">{baseText}</span>
                                );
                              })()}
                              <span className="price-label">Gift value</span>
                            </div>
                            <div className="discount-section">
                              {card.discount > 0 && (
                                <span className="purchase-card-discount modern-discount">{card.discount}% OFF</span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="purchase-card-button modern-card-button venue-buy-btn"
                            onClick={(e) => handleBuyNow(e, card.giftCardName, card.amount, card.discount, card._id)}
                          >
                            <Gift size={18} />
                            Buy now
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === "reviews" && (
              <section className="venue-card venue-reviews-section">
                <h3 className="venue-card-title">Reviews</h3>
                <form className="venue-review-form" onSubmit={handleSubmitReview}>
                  <div className="venue-review-form-row">
                    <label className="venue-review-label">Your rating</label>
                    <div className="venue-star-input" role="group" aria-label="Rate 1 to 5 stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`venue-star-btn ${reviewForm.rating >= star ? "venue-star-btn--filled" : ""}`}
                          onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                          aria-label={`${star} star${star > 1 ? "s" : ""}`}
                        >
                          <Star size={28} strokeWidth={1.5} fill={reviewForm.rating >= star ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="venue-review-form-row">
                    <label className="venue-review-label" htmlFor="reviewerName">Your name</label>
                    <input
                      id="reviewerName"
                      type="text"
                      className="venue-review-input"
                      placeholder="e.g. John"
                      value={reviewForm.reviewerName}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, reviewerName: e.target.value }))}
                      maxLength={120}
                    />
                  </div>
                  <div className="venue-review-form-row">
                    <label className="venue-review-label" htmlFor="reviewComment">Your review</label>
                    <textarea
                      id="reviewComment"
                      className="venue-review-textarea"
                      placeholder="Share your experience..."
                      rows={3}
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                      maxLength={2000}
                    />
                  </div>
                  {reviewSubmitMessage && (
                    <p className={`venue-review-message ${reviewSubmitMessage.includes("Thank you") ? "venue-review-message--success" : ""}`}>
                      {reviewSubmitMessage}
                    </p>
                  )}
                  <button type="submit" className="venue-review-submit" disabled={submitReviewLoading}>
                    {submitReviewLoading ? "Submitting..." : "Submit review"}
                  </button>
                </form>
                <div className="venue-reviews-list">
                  {reviewsLoading ? (
                    <p className="venue-card-muted">Loading reviews...</p>
                  ) : reviews.length === 0 ? (
                    <p className="venue-card-muted">No reviews yet. Be the first to leave a review!</p>
                  ) : (
                    reviews.map((r) => (
                      <div key={r._id} className="venue-review-item">
                        <div className="venue-review-item-header">
                          <span className="venue-review-item-stars" aria-label={`${r.rating} out of 5 stars`}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={16}
                                className={r.rating >= s ? "venue-review-star-filled" : "venue-review-star-empty"}
                                strokeWidth={1.5}
                                fill={r.rating >= s ? "currentColor" : "none"}
                              />
                            ))}
                          </span>
                          <span className="venue-review-item-meta">
                            {r.reviewerName ? `${r.reviewerName} · ` : ""}
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : ""}
                          </span>
                        </div>
                        {r.comment && <p className="venue-review-item-comment">{r.comment}</p>}
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}

            {activeTab === "photos" && (
              <section className="venue-photos">
                <h3 className="venue-photos-title">{business.name} Photos</h3>
                {photoFilterOptions.length > 0 && (
                  <div className="venue-photo-filters">
                    {photoFilterOptions.map((f) => (
                      <button
                        key={f}
                        type="button"
                        className={`venue-photo-filter ${photoFilter === (f === "All" ? "all" : f.toLowerCase()) ? "venue-photo-filter--active" : ""}`}
                        onClick={() => setPhotoFilter(f === "All" ? "all" : f.toLowerCase())}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
                <div className="venue-photos-grid">
                  {filteredGalleryImages.map(({ src, i }) => (
                    <div key={i} className="venue-photo-item">
                      <img src={src} alt={`Gallery ${i + 1}`} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {customTab && activeTab === customTab.id && (
              <section className="venue-card venue-rooms-section">
                <h3 className="venue-card-title">{customTab.label}</h3>
                {Array.isArray(pc.roomTypes) && pc.roomTypes.length > 0 ? (
                  <>
                    {Array.isArray(pc.tags) && pc.tags.length > 0 && (
                      <div className="venue-cuisine-tags venue-rooms-tags">
                        {pc.tags.map((tag) => (
                          <span key={tag} className="venue-cuisine-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="venue-room-cards">
                      {pc.roomTypes.map((room, index) => {
                        const bestForList = typeof room.bestFor === "string"
                          ? room.bestFor.split(",").map((s) => s.trim()).filter(Boolean)
                          : Array.isArray(room.bestFor) ? room.bestFor : [];
                        const images = Array.isArray(room.images) ? room.images : [];
                        const selectedImageIndex = roomGalleryIndex[index] ?? 0;
                        const displayImages = images.slice(0, 5);
                        return (
                          <article key={index} className="venue-room-card">
                            <div className={`venue-room-card-inner${images.length === 0 ? " venue-room-card-inner--no-images" : ""}`}>
                              {images.length > 0 && (
                                <div className="venue-room-gallery">
                                  <div className="venue-room-gallery-hero">
                                    <img
                                      src={images[selectedImageIndex]}
                                      alt={room.name ? `${room.name} — view ${selectedImageIndex + 1}` : `Room ${index + 1}`}
                                      loading="lazy"
                                    />
                                    {displayImages.length > 1 && (
                                      <span className="venue-room-gallery-count">{selectedImageIndex + 1} / {displayImages.length}</span>
                                    )}
                                  </div>
                                  {displayImages.length > 1 && (
                                    <div className="venue-room-gallery-thumbs">
                                      {displayImages.map((src, i) => (
                                        <button
                                          key={i}
                                          type="button"
                                          className={`venue-room-gallery-thumb${i === selectedImageIndex ? " is-active" : ""}`}
                                          onClick={() => setRoomGalleryIndex((prev) => ({ ...prev, [index]: i }))}
                                          aria-label={`View image ${i + 1}`}
                                        >
                                          <img src={src} alt="" loading="lazy" />
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="venue-room-card-body">
                                <h4 className="venue-room-card-name">{room.name || `Room ${index + 1}`}</h4>
                                {room.description && (
                                  <div className="venue-room-card-block">
                                    <span className="venue-room-card-label">Description</span>
                                    <p className="venue-room-card-text">{room.description}</p>
                                  </div>
                                )}
                                {room.size && (
                                  <div className="venue-room-card-block">
                                    <span className="venue-room-card-label">Size</span>
                                    <p className="venue-room-card-text">{room.size}</p>
                                  </div>
                                )}
                                {bestForList.length > 0 && (
                                  <div className="venue-room-card-block">
                                    <span className="venue-room-card-label">Best for</span>
                                    <div className="venue-room-card-best-for">
                                      {bestForList.map((item, i) => (
                                        <span key={i} className="venue-room-best-for-tag">{item}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    {Array.isArray(pc.tags) && pc.tags.length > 0 && (
                      <div className="venue-cuisine-tags">
                        {pc.tags.map((tag) => (
                          <span key={tag} className="venue-cuisine-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {pc.customTabContent ? (
                      <div className="venue-menu-preview">
                        <div className="venue-menu-list">
                          {pc.customTabContent.split("\n").map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="venue-card-muted">Content coming soon.</p>
                    )}
                  </>
                )}
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-bottom">
          <p>© 2025 {business.name}. All rights reserved. Powered by Giftygen.</p>
        </div>
      </footer>

      {showGiftCardForm && selectedCard && (
        <GiftCardForm
          giftCardName={selectedCard.giftCardName}
          amount={selectedCard.amount}
          discount={selectedCard.discount}
          id={selectedCard.id}
          onClose={() => {
            setShowGiftCardForm(false);
            setSelectedCard(null);
          }}
        />
      )}
    </div>
  );
};

export default BusinessPage;
