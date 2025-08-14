import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "./Orders.css"; // Import the CSS file

// Skeleton component for gift cards
const GiftCardSkeleton = () => {
  return (
    <div className="giftcard-item skeleton">
      <div className="skeleton-title"></div>
      <div className="skeleton-tag"></div>
      <div className="skeleton-description"></div>
      <div className="skeleton-image"></div>
      <div className="skeleton-buyers"></div>
      <div className="skeleton-button"></div>
    </div>
  );
};

// Skeleton component for buyers table
const BuyersSkeleton = () => {
  return (
    <tr className="buyer-row-skeleton">
      <td>
        <div className="skeleton-cell skeleton-name"></div>
      </td>
      <td>
        <div className="skeleton-cell skeleton-email"></div>
      </td>
      <td>
        <div className="skeleton-cell skeleton-giftcard"></div>
      </td>
      <td>
        <div className="skeleton-cell">
          <div className="skeleton-progress-bar"></div>
        </div>
      </td>
      <td>
        <div className="skeleton-cell skeleton-date"></div>
      </td>
      <td>
        <div className="skeleton-cell skeleton-button"></div>
      </td>
    </tr>
  );
};

const Orders = () => {
  const [giftCards, setGiftCards] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [view, setView] = useState("giftCards"); // Default view to 'giftCards'
  const [modalName, setModalName] = useState("");
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [giftCardSelectedBuyer, setGiftCardSelectedBuyer] = useState(null);
  const [redemptionHistory, setRedemptionHistory] = useState([]);
  const [giftCardRedemptionHistory, setGiftCardRedemptionHistory] = useState([]);
  const [giftCardSearch, setGiftCardSearch] = useState(""); // Search state for gift cards
  const [buyerSearch, setBuyerSearch] = useState(""); // Search state for buyers
  const [originalBuyers, setOriginalBuyers] = useState([]); // Initialize as empty array instead of string
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // For infinite scrolling and pagination
  const [page, setPage] = useState(1);
  const [visibleGiftCards, setVisibleGiftCards] = useState([]);
  const [visibleBuyers, setVisibleBuyers] = useState([]);
  const [allGiftCards, setAllGiftCards] = useState([]);
  const [allBuyers, setAllBuyers] = useState([]);
  const [hasMoreGiftCards, setHasMoreGiftCards] = useState(true);
  const [hasMoreBuyers, setHasMoreBuyers] = useState(true);

  // Items to load per page
  const CARDS_PER_PAGE = 6;
  const BUYERS_PER_PAGE = 10;

  // Observers for infinite scrolling
  const giftCardObserver = useRef();
  const buyersObserver = useRef();

  const { user } = useSelector((state) => state.auth);
  const businessSlug = user?.user?.businessSlug || "";

  useEffect(() => {
    // Load gift cards for this business
    fetchGiftCards();
  }, [businessSlug]);

  const fetchGiftCards = async () => {
    setIsLoading(true);
    try {
      // Use the list endpoint, filtered to this business
      const response = await axios.get(`/api/v1/admin/list?businessSlug=${encodeURIComponent(businessSlug)}`);
      setAllGiftCards(response.data.giftCards || []);
      setGiftCards(response.data.giftCards || []);

      // Set initial visible cards
      setVisibleGiftCards(response.data.giftCards.slice(0, CARDS_PER_PAGE));

      // Determine if there are more cards to load
      setHasMoreGiftCards((response.data.giftCards || []).length > CARDS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching gift cards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBuyers = async (cardId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `api/v1/admin/giftcards/${cardId}/buyers` // Fixed template literal syntax
      );
      setBuyers(response.data.buyers);
      setOriginalBuyers(response.data.buyers);

      setVisibleBuyers(response.data.buyers.slice(0, BUYERS_PER_PAGE));

      // Determine if there are more buyers to load
      setHasMoreBuyers(response.data.buyers.length > BUYERS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching buyers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserBuyers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("api/v1/admin/buyers");

      setAllBuyers(response.data.buyers);
      setBuyers(response.data.buyers);
      setOriginalBuyers(response.data.buyers);

      // Set initial visible buyers
      setVisibleBuyers(response.data.buyers.slice(0, BUYERS_PER_PAGE));

      // Determine if there are more buyers to load
      setHasMoreBuyers(response.data.buyers.length > BUYERS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching buyers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load more gift cards as user scrolls
  const loadMoreGiftCards = () => {
    if (!hasMoreGiftCards || isFetchingMore) return;

    setIsFetchingMore(true);

    // Simulate loading delay for better UX
    setTimeout(() => {
      const nextBatch = allGiftCards.slice(visibleGiftCards.length, visibleGiftCards.length + CARDS_PER_PAGE);

      setVisibleGiftCards((prev) => [...prev, ...nextBatch]);
      setPage((prev) => prev + 1);

      // Check if we have more cards to load
      setHasMoreGiftCards(visibleGiftCards.length + nextBatch.length < allGiftCards.length);
      setIsFetchingMore(false);
    }, 800);
  };

  // Load more buyers as user scrolls
  const loadMoreBuyers = () => {
    if (!hasMoreBuyers || isFetchingMore) return;

    setIsFetchingMore(true);

    // Simulate loading delay for better UX
    setTimeout(() => {
      const nextBatch = allBuyers.slice(visibleBuyers.length, visibleBuyers.length + BUYERS_PER_PAGE);

      setVisibleBuyers((prev) => [...prev, ...nextBatch]);
      setPage((prev) => prev + 1);

      // Check if we have more buyers to load
      setHasMoreBuyers(visibleBuyers.length + nextBatch.length < allBuyers.length);
      setIsFetchingMore(false);
    }, 800);
  };

  // Intersection Observer for gift cards
  const lastGiftCardElementRef = useCallback(
    (node) => {
      if (isLoading || isFetchingMore) return;
      if (giftCardObserver.current) giftCardObserver.current.disconnect();

      giftCardObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreGiftCards) {
          loadMoreGiftCards();
        }
      });

      if (node) giftCardObserver.current.observe(node);
    },
    [isLoading, hasMoreGiftCards, isFetchingMore]
  );

  // Intersection Observer for buyers table
  const lastBuyerElementRef = useCallback(
    (node) => {
      if (isLoading || isFetchingMore) return;
      if (buyersObserver.current) buyersObserver.current.disconnect();

      buyersObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreBuyers) {
          loadMoreBuyers();
        }
      });

      if (node) buyersObserver.current.observe(node);
    },
    [isLoading, hasMoreBuyers, isFetchingMore]
  );

  const handleGiftCardView = () => {
    setView("giftCards");
    fetchGiftCards();
    setPage(1);
  };

  const handleUserView = () => {
    setView("users");
    fetchUserBuyers();
    setPage(1);
  };

  const closeModal = () => {
    if (modalName === "userRedemptionHistoryModal") {
      setModalName("");
      setSelectedBuyer(null);
      setRedemptionHistory([]);
    } else if (modalName === "giftCardRedemptionHistoryModal") {
      setModalName("buyersModal");
      setGiftCardSelectedBuyer(null);
      setGiftCardRedemptionHistory([]);
    } else {
      setModalName("");
    }
  };

  // Filter gift cards based on search
  useEffect(() => {
    if (allGiftCards.length > 0) {
      const filtered = allGiftCards.filter((card) => card.name?.toLowerCase().includes(giftCardSearch.toLowerCase()));
      setGiftCards(filtered);
      setVisibleGiftCards(filtered.slice(0, CARDS_PER_PAGE));
      setHasMoreGiftCards(filtered.length > CARDS_PER_PAGE);
      setPage(1);
    }
  }, [giftCardSearch, allGiftCards]);

  // Filter buyers based on search
  useEffect(() => {
    if (allBuyers.length > 0) {
      const filtered = allBuyers.filter((buyer) => {
        const nameMatch = buyer.buyerName?.toLowerCase()?.includes(buyerSearch.toLowerCase()) ?? false;
        const emailMatch = buyer.email?.toLowerCase()?.includes(buyerSearch.toLowerCase()) ?? false;
        return nameMatch || emailMatch;
      });
      setBuyers(filtered);
      setVisibleBuyers(filtered.slice(0, BUYERS_PER_PAGE));
      setHasMoreBuyers(filtered.length > BUYERS_PER_PAGE);
      setPage(1);
    }
  }, [buyerSearch, allBuyers]);

  const handleViewBuyers = (cardId) => {
    fetchBuyers(cardId);
    setModalName("buyersModal");
  };

  const handleViewRedemptionHistory = (buyer) => {
    if (view === "users") {
      setSelectedBuyer({});
      setTimeout(() => {
        setSelectedBuyer(buyer);
        setRedemptionHistory(buyer.redemptionHistory || []);
        setModalName("userRedemptionHistoryModal");
      }, 0);
    } else {
      setGiftCardSelectedBuyer({});
      setTimeout(() => {
        setGiftCardSelectedBuyer(buyer);
        setGiftCardRedemptionHistory(buyer.redemptionHistory || []);
        setModalName("giftCardRedemptionHistoryModal");
      }, 0);
    }
  };

  return (
    <div className="orders-page-container">
      <div className="sticky-header-container">
        <h1 className="orders-page-header">Orders</h1>
        <div className="view-toggle-buttons">
          <button onClick={handleGiftCardView} className={view === "giftCards" ? "active-view-button" : "view-button"}>
            Gift Card Orders
          </button>
          <button onClick={handleUserView} className={view === "users" ? "active-view-button" : "view-button"}>
            Customer Orders
          </button>
        </div>

        {view === "giftCards" && (
          <>
            <div className="giftcard-search-container">
              <input
                type="text"
                placeholder="Search gift cards..."
                value={giftCardSearch}
                onChange={(e) => setGiftCardSearch(e.target.value)}
                className="giftcard-search-input"
              />
            </div>

            <div className="giftcards-container">
              {isLoading && visibleGiftCards.length === 0 ? (
                // Show skeletons for initial load
                Array(6)
                  .fill()
                  .map((_, index) => <GiftCardSkeleton key={`initial-skeleton-${index}`} />)
              ) : visibleGiftCards.length > 0 ? (
                visibleGiftCards.map((card, index) => {
                  // Add reference to last card for infinite scroll trigger
                  const isLastElement = index === visibleGiftCards.length - 1;

                  return (
                    <div key={card.id} className="giftcard-item" ref={isLastElement ? lastGiftCardElementRef : null}>
                      <h3 className="giftcard-name">{card.name}</h3>
                      <p className="giftcard-tag">Tag: {card.tag}</p>
                      <p className="giftcard-description">{card.description}</p>
                      <img className="giftcard-image" src={card.image} alt={card.name} loading="lazy" />
                      <p className="total-buyers">Total Buyers: {card.totalBuyers}</p>
                      <button onClick={() => handleViewBuyers(card.id)} className="view-buyers-button">
                        View Buyers
                      </button>
                    </div>
                  );
                })
              ) : giftCardSearch ? (
                <div className="no-results">No matching gift cards found</div>
              ) : null}

              {/* Show skeletons when fetching more gift cards */}
              {!isLoading &&
                isFetchingMore &&
                hasMoreGiftCards &&
                Array(3)
                  .fill()
                  .map((_, index) => <GiftCardSkeleton key={`more-skeleton-${index}`} />)}
            </div>
          </>
        )}

        {/* User View */}
        {view === "users" && (
          <div className="users-container">
            <div className="user-search-container">
              <input
                type="search"
                placeholder="Search buyers by name or email..."
                value={buyerSearch}
                onChange={(e) => setBuyerSearch(e.target.value)}
                className="user-search-input"
              />
            </div>

            <table className="buyers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Gift Card</th>
                  <th>Redemption Progress</th>
                  <th>Purchase Date</th>
                  <th>Redemption History</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && visibleBuyers.length === 0 ? (
                  // Show skeletons for initial load
                  Array(10)
                    .fill()
                    .map((_, index) => <BuyersSkeleton key={`initial-buyer-skeleton-${index}`} />)
                ) : visibleBuyers.length > 0 ? (
                  visibleBuyers.map((buyer, index) => {
                    const totalAmount = buyer.remainingBalance + buyer.usedAmount || 1000;
                    const usedAmount = buyer.usedAmount || 0;
                    const remainingBalance = totalAmount - usedAmount;
                    const fillPercentage = (usedAmount / totalAmount) * 100;

                    // Add reference to last buyer row for infinite scroll trigger
                    const isLastElement = index === visibleBuyers.length - 1;

                    return (
                      <tr key={index} ref={isLastElement ? lastBuyerElementRef : null}>
                        <td>{buyer.buyerName}</td>
                        <td>{buyer.email}</td>
                        <td>{buyer.giftCardName}</td>
                        <td>
                          <div className="progress-bar-container">
                            <div
                              className="progress-bar"
                              style={{ width: `${fillPercentage}%` }}
                              title={`Used: ${usedAmount}`}
                            ></div>
                            <div
                              className="progress-bar-empty"
                              style={{ width: `${100 - fillPercentage}%` }}
                              title={`Remaining: ${remainingBalance}`}
                            ></div>
                          </div>
                        </td>
                        <td>{new Date(buyer.purchaseDate).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => handleViewRedemptionHistory(buyer)}
                            className="user-page-redemption-history"
                          >
                            View Redemption History
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="no-results">
                      No matching buyers found.
                    </td>
                  </tr>
                )}

                {/* Show skeleton rows when fetching more buyers */}
                {!isLoading &&
                  isFetchingMore &&
                  hasMoreBuyers &&
                  Array(5)
                    .fill()
                    .map((_, index) => <BuyersSkeleton key={`more-buyer-skeleton-${index}`} />)}
              </tbody>
            </table>
          </div>
        )}

        {modalName === "buyersModal" && (
          <div className="buyers-modal">
            <div className="buyers-modal-content">
              <button className="buyers-close-btn" onClick={closeModal}>
                &times;
              </button>
              <h3>Buyers List</h3>

              <div className="buyer-modal-search-container">
                <input
                  type="text"
                  className="buyer-modal-search-input"
                  placeholder="Search buyers..."
                  onChange={(e) => {
                    const searchTerm = e.target.value.toLowerCase();
                    if (!Array.isArray(originalBuyers)) {
                      return; // Guard against non-array originalBuyers
                    }
                    const filteredBuyers = originalBuyers.filter(
                      (buyer) =>
                        buyer.name?.toLowerCase().includes(searchTerm) ||
                        new Date(buyer.purchaseDate).toLocaleDateString().includes(searchTerm) ||
                        buyer.remainingBalance?.toString().includes(searchTerm)
                    );
                    setBuyers(filteredBuyers);
                  }}
                />
              </div>

              <ul>
                {buyers.length > 0 ? (
                  buyers.map((buyer, index) => (
                    <li key={index} className="buyer-item">
                      <div className="buyer-info-compact">
                        <span className="buyer-name">{buyer.name}</span>
                        <span className="buyer-datetime">
                          [ on: {new Date(buyer.purchaseDate).toLocaleDateString()}, at:{" "}
                          {new Date(buyer.returnTime).toLocaleTimeString()} ]
                        </span>
                      </div>

                      <div className="buyer-details">
                        <span className="remaining-balance">
                          <strong>Remaining Balance:</strong> {buyer.remainingBalance}
                        </span>
                        <button
                          onClick={() => handleViewRedemptionHistory(buyer)}
                          className="view-redemption-history-button"
                        >
                          View Redemption History
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="no-buyers">No buyers found.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {modalName === "userRedemptionHistoryModal" && selectedBuyer && (
          <div className="redemption-history-modal">
            <div className="redemption-history-modal-content">
              <h3 className="redemption-history-title">
                Redemption History for {selectedBuyer.buyerName || "Unknown Buyer"}
              </h3>
              {selectedBuyer.redemptionHistory?.length > 0 ? (
                <ul className="redemption-history-list">
                  {selectedBuyer.redemptionHistory.map((entry, index) => (
                    <li key={index} className="redemption-history-entry">
                      <strong className="entry-number">#{index + 1}</strong>
                      <p className="redeemed-amount">
                        <strong>Redeemed Amount:</strong> ₹{entry.redeemedAmount}
                      </p>
                      <p className="remaining-amount">
                        <strong>Remaining Amount:</strong> ₹{entry.remainingAmount}
                      </p>
                      <p className="redemption-date">
                        <strong>Date:</strong> {new Date(entry.redemptionDate).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-redemption-history">No redemption history available.</p>
              )}
              <button className="close-modal-button" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* Gift Cards View Redemption History Modal */}
        {modalName === "giftCardRedemptionHistoryModal" && giftCardSelectedBuyer && (
          <div className="redemption-history-modal">
            <div className="redemption-history-modal-content">
              <h3 className="redemption-history-title">
                Redemption History for {giftCardSelectedBuyer.name || "Unknown Buyer"}
              </h3>
              {giftCardSelectedBuyer.redemptionHistory?.length > 0 ? (
                <ul className="redemption-history-list">
                  {giftCardSelectedBuyer.redemptionHistory.map((entry, index) => (
                    <li key={index} className="redemption-history-entry">
                      <strong className="entry-number">#{index + 1}</strong>
                      <p className="redeemed-amount">
                        <strong>Redeemed Amount:</strong> ₹{entry.redeemedAmount}
                      </p>
                      <p className="remaining-amount">
                        <strong>Remaining Amount:</strong> ₹{entry.remainingAmount}
                      </p>
                      <p className="redemption-date">
                        <strong>Date:</strong> {new Date(entry.redemptionDate).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-redemption-history">No redemption history available.</p>
              )}
              <button className="close-modal-button" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
