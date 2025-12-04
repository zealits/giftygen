import React, { useState, useEffect, lazy, Suspense, useRef, useCallback } from "react";
import "./UserLanding.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { setLocation } from "../../services/Reducers/locationSlice";
import { listGiftCards } from "../../services/Actions/giftCardActions";
import { fetchBusinessBySlug } from "../../services/Actions/authActions";
import { useDispatch, useSelector } from "react-redux";
import GiftCardLoader from "./GiftCardLoader";
import { formatCurrency } from "../../utils/currency";
const GiftCardForm = lazy(() => import("./GiftCardForm"));

// Skeleton component for gift cards
const GiftCardSkeleton = () => {
  return (
    <div className="purchase-card skeleton">
      <div className="purchase-card-image skeleton-image"></div>
      <div className="purchase-card-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-description"></div>
        <div className="skeleton-info">
          <div className="skeleton-price"></div>
          <div className="skeleton-discount"></div>
        </div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );
};

const UserLanding = () => {
  const [modalDetails, setModalDetails] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showGiftCardForm, setShowGiftCardForm] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(1);
  const [visibleCards, setVisibleCards] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const CARDS_PER_PAGE = 6;
  const location = useLocation();
  const { businessSlug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const observer = useRef();
  const loadMoreRef = useRef(null);

  const { giftCards, loading, error } = useSelector((state) => state.giftCardList);
  const { business, loading: businessLoading } = useSelector((state) => state.business);

  // Fetch business information when businessSlug changes
  useEffect(() => {
    if (businessSlug) {
      dispatch(fetchBusinessBySlug(businessSlug));
    }
  }, [dispatch, businessSlug]);

  // Fetch initial cards when search term or business changes
  useEffect(() => {
    // Reset state for new search/filter
    setPage(1);
    setVisibleCards([]);
    setAllCards([]);
    setHasMore(true);

    dispatch(listGiftCards(searchTerm, businessSlug || ""));
  }, [dispatch, searchTerm, businessSlug]);

  // Store all fetched cards (exclude expired ones)
  useEffect(() => {
    if (giftCards && !loading) {
      const now = new Date();

      // Filter out expired gift cards (by status or expirationDate)
      const activeCards = giftCards.filter((card) => {
        const isExplicitlyExpired = card.status === "expired";
        const isDateExpired =
          card.expirationDate && new Date(card.expirationDate) < now;

        return !isExplicitlyExpired && !isDateExpired;
      });

      setAllCards(activeCards);

      // Initially show only first batch of active cards
      if (page === 1) {
        setVisibleCards(activeCards.slice(0, CARDS_PER_PAGE));
      }

      // Determine if there are more cards to load
      setHasMore(activeCards.length > visibleCards.length);
      setIsFetchingMore(false);
    }
  }, [giftCards, loading]);

  // Track location for navigation
  useEffect(() => {
    dispatch(setLocation(location.pathname));
  }, [location.pathname, dispatch]);

  // Intersection Observer setup for infinite scrolling
  const lastCardElementRef = useCallback(
    (node) => {
      if (loading || isFetchingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreCards();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, isFetchingMore]
  );

  // Function to load more cards as user scrolls
  const loadMoreCards = () => {
    if (!hasMore || isFetchingMore) return;

    setIsFetchingMore(true);

    // Simulate loading delay for better UX
    setTimeout(() => {
      const nextBatch = allCards.slice(visibleCards.length, visibleCards.length + CARDS_PER_PAGE);
      setVisibleCards((prev) => [...prev, ...nextBatch]);
      setPage((prev) => prev + 1);
      setIsFetchingMore(false);

      // Check if we have more cards to load
      setHasMore(visibleCards.length + nextBatch.length < allCards.length);
    }, 800);
  };

  const handleCardClick = (cardId, event) => {
    if (event.target.closest(".purchase-card-button")) return;

    // Show loader and delay navigation for visual effect
    setIsLoading(true);

    // Navigate after a slight delay to show the loader
    setTimeout(() => {
      if (businessSlug) {
        navigate(`/${businessSlug}/gift-card/${cardId}`);
      } else {
        navigate(`/gift-card/${cardId}`);
      }
    }, 1800); // Adjust time as needed for best UX
  };

  const handleBuyNow = (event, giftCardName, amount, discount, id) => {
    event.stopPropagation();
    setSelectedCard({ giftCardName, amount, discount, id });
    setShowGiftCardForm(true);
  };

  const handleCloseModal = () => {
    setShowGiftCardForm(false);
  };

  const handleFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };

  // If navigating to card detail, show our custom loader
  if (isLoading) {
    return <GiftCardLoader />;
  }

  return (
    <div className="body">
      <div className="header">
        {businessSlug && business ? (
          <div className="business-header">
            <div className="business-header-content">
              <div className="business-logo-name">
                {business.logoUrl && (
                  <img src={business.logoUrl} alt={`${business.name} Logo`} className="business-logo" />
                )}
                <div className="business-title-section">
                  <h1 className="business-name">{business.name}</h1>
                  <p className="business-subtitle">Discover our exclusive gift card collection</p>
                </div>
              </div>
              {business.address && (
                <div className="business-address-section">
                  <span className="location-icon">📍</span>
                  <span className="address-text">
                    {business.address.street && `${business.address.street}, `}
                    {business.address.city && `${business.address.city}, `}
                    {business.address.state && `${business.address.state}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : businessSlug && businessLoading ? (
          <div className="business-header business-header-skeleton">
            <div className="business-header-content">
              <div className="business-logo-name">
                <div className="business-logo skeleton-logo"></div>
                <div className="business-title-section">
                  <div className="skeleton-business-name"></div>
                  <div className="skeleton-business-subtitle"></div>
                </div>
              </div>
              <div className="business-address-section">
                <div className="skeleton-business-address"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h1>🍽️ Restaurant Gift Cards</h1>
            <p>Choose a gift card to share unforgettable dining experiences!</p>
          </>
        )}
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search Gift Cards..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {/* <select 
          className="filter-dropdown-user"
          value={filterCategory}
          onChange={handleFilterChange}
        >
          <option value="">Filter by Category</option>
          <option value="Fine Dining">Fine Dining</option>
          <option value="Casual Dining">Casual Dining</option>
          <option value="Gourmet">Gourmet</option>
        </select> */}
      </div>

      <div className="purchase-card-container">
        {/* Initial loading state */}
        {loading && visibleCards.length === 0
          ? // Show skeletons for initial load
            Array(6)
              .fill()
              .map((_, index) => <GiftCardSkeleton key={`initial-skeleton-${index}`} />)
          : // Show loaded cards
            visibleCards.map((card, index) => {
              // Add reference to last card for infinite scroll trigger
              const isLastElement = index === visibleCards.length - 1;

              return (
                <div
                  className="purchase-card"
                  key={card._id}
                  ref={isLastElement ? lastCardElementRef : null}
                  onClick={(e) => handleCardClick(card._id, e)}
                >
                  <div className="purchase-card-image">
                    <img src={card.giftCardImg} alt="Gift Card" loading="lazy" />
                    <div className="purchase-card-tag">
                      <i className={card.icon}></i> {card.giftCardTag}
                    </div>
                    {businessSlug && business && (
                      <div className="business-card-badge">
                        <span className="business-badge-text">{business.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="purchase-card-content">
                    <h2 className="purchase-card-title">{card.giftCardName}</h2>
                    <p className="purchase-card-description">{card.description}</p>
                    <div className="purchase-card-info">
                      <span className="purchase-card-price">{formatCurrency(card.amount, 'INR')}</span>
                      <span className="purchase-card-discount">{card.discount} % Off</span>
                    </div>
                    <button
                      className="purchase-card-button"
                      onClick={(e) => handleBuyNow(e, card.giftCardName, card.amount, card.discount, card._id)}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              );
            })}

        {/* Show skeletons when fetching more cards */}
        {!loading &&
          isFetchingMore &&
          hasMore &&
          // Show skeletons for the next batch as user scrolls
          Array(3)
            .fill()
            .map((_, index) => <GiftCardSkeleton key={`more-skeleton-${index}`} />)}
      </div>

      <Suspense fallback={<div>Loading Gift Card Form...</div>}>
        {showGiftCardForm && <GiftCardForm {...selectedCard} onClose={() => setShowGiftCardForm(false)} />}
      </Suspense>

      {modalVisible && modalDetails && (
        <div id="modal" className="modal">
          <div className="modal-content">
            <span className="purchase-modal-close" onClick={handleCloseModal}>
              &times;
            </span>
            <h2 id="modal-title">{modalDetails.title}</h2>
            <ul id="modal-details">
              <li>
                <strong>Terms:</strong> <span id="modal-terms">{modalDetails.terms}</span>
              </li>
              <li>
                <strong>Expiry Date:</strong>{" "}
                <span id="modal-expiry">{new Date(modalDetails.expiry).toLocaleDateString("en-GB")}</span>
              </li>
              <li>
                <strong>Applicable Restaurants:</strong> <span id="modal-restaurants">{modalDetails.restaurants}</span>
              </li>
            </ul>
            <div className="personalization">
              <h3>Personalize Your Gift Card</h3>
              <input type="text" placeholder="Recipient's Name" id="recipient-name" />
              <textarea placeholder="Add a personal message..." id="personal-message"></textarea>
              <input type="text" placeholder="Occasion (e.g., Birthday)" id="occasion" />
              <button
                id="save-personalization"
                onClick={() => {
                  const name = document.getElementById("recipient-name").value;
                  const message = document.getElementById("personal-message").value;
                  const occasion = document.getElementById("occasion").value;
                  alert(`Personalization Saved:\nRecipient: ${name}\nMessage: ${message}\nOccasion: ${occasion}`);
                }}
              >
                Send Gift Card
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="footer-bottom">
          {businessSlug && business ? (
            <div className="business-footer">
              <p>&copy; 2025 {business.name}. All rights reserved.</p>
              <p className="footer-powered-by">Powered by Giftygen</p>
            </div>
          ) : (
            <p>&copy; 2025 Restaurant Gift Cards. All rights reserved.</p>
          )}
        </div>
      </footer>
    </div>
  );
};

export default UserLanding;
