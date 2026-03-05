import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
// Removed CSS import to fix ChunkLoadError

// Simple loading components
const GiftCardSkeleton = () => {
  return (
    <div style={{
      ...ordersStyles.cardItem,
      backgroundColor: '#f3f4f6',
      color: '#9ca3af',
      textAlign: 'center',
      padding: '40px'
    }}>
      Loading gift card...
    </div>
  );
};

// Simple loading component for buyers table
const BuyersSkeleton = () => {
  return (
    <tr>
      <td colSpan="6" style={{...ordersStyles.td, textAlign: 'center', color: '#9ca3af'}}>
        Loading buyers...
      </td>
    </tr>
  );
};

// Simple inline styles to replace the CSS import
const ordersStyles = {
  container: {
    padding: '20px',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    color: '#1f2937'
  },
  header: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center'
  },
  toggleButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  activeButton: {
    backgroundColor: '#3b82f6',
    color: 'white'
  },
  inactiveButton: {
    backgroundColor: '#e5e7eb',
    color: '#374151'
  },
  searchContainer: {
    maxWidth: '600px',
    margin: '0 auto 20px',
    padding: '0 20px'
  },
  searchInput: {
    width: '100%',
    padding: '12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px'
  },
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  },
  cardItem: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  cardImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '12px'
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '8px'
  },
  cardButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    width: '100%'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  th: {
    backgroundColor: '#f3f4f6',
    padding: '12px',
    textAlign: 'left',
    fontWeight: '600',
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto'
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer'
  },
  progressContainer: {
    display: 'flex',
    width: '100px',
    height: '20px',
    backgroundColor: '#f3f4f6',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressBar: {
    backgroundColor: '#22c55e',
    height: '100%'
  },
  progressEmpty: {
    backgroundColor: '#e5e7eb',
    height: '100%'
  }
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
      // Fetch sold gift cards for this business
      const response = await axios.get(`/api/v1/admin/giftcards?businessSlug=${encodeURIComponent(businessSlug)}`);
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
        `api/v1/admin/giftcards/${cardId}/buyers?businessSlug=${encodeURIComponent(businessSlug)}`
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
      const response = await axios.get(`api/v1/admin/buyers?businessSlug=${encodeURIComponent(businessSlug)}`);

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
    <div style={ordersStyles.container}>
      <div>
        <h1 style={ordersStyles.header}>Orders</h1>
        <div style={ordersStyles.toggleButtons}>
          <button 
            onClick={handleGiftCardView} 
            style={{
              ...ordersStyles.button,
              ...(view === "giftCards" ? ordersStyles.activeButton : ordersStyles.inactiveButton)
            }}
          >
            Gift Card Orders
          </button>
          <button 
            onClick={handleUserView} 
            style={{
              ...ordersStyles.button,
              ...(view === "users" ? ordersStyles.activeButton : ordersStyles.inactiveButton)
            }}
          >
            Customer Orders
          </button>
        </div>

        {view === "giftCards" && (
          <>
            <div style={ordersStyles.searchContainer}>
              <input
                type="text"
                placeholder="Search gift cards..."
                value={giftCardSearch}
                onChange={(e) => setGiftCardSearch(e.target.value)}
                style={ordersStyles.searchInput}
              />
            </div>

            <div style={ordersStyles.cardsContainer}>
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
                    <div key={card.id} style={ordersStyles.cardItem} ref={isLastElement ? lastGiftCardElementRef : null}>
                      <h3 style={ordersStyles.cardTitle}>{card.name}</h3>
                      <p style={{color: '#6b7280', marginBottom: '8px'}}>Tag: {card.tag}</p>
                      <p style={{color: '#6b7280', marginBottom: '12px'}}>{card.description}</p>
                      <img style={ordersStyles.cardImage} src={card.image} alt={card.name} loading="lazy" />
                      <p style={{marginBottom: '12px', fontWeight: '500'}}>Total Buyers: {card.totalBuyers}</p>
                      <button onClick={() => handleViewBuyers(card.id)} style={ordersStyles.cardButton}>
                        View Buyers
                      </button>
                    </div>
                  );
                })
              ) : giftCardSearch ? (
                <div style={{textAlign: 'center', padding: '40px', color: '#6b7280'}}>No matching gift cards found</div>
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
          <div>
            <div style={ordersStyles.searchContainer}>
              <input
                type="search"
                placeholder="Search buyers by name or email..."
                value={buyerSearch}
                onChange={(e) => setBuyerSearch(e.target.value)}
                style={ordersStyles.searchInput}
              />
            </div>

            <table style={ordersStyles.table}>
              <thead>
                <tr>
                  <th style={ordersStyles.th}>Name</th>
                  <th style={ordersStyles.th}>Email</th>
                  <th style={ordersStyles.th}>Gift Card</th>
                  <th style={ordersStyles.th}>Redemption Progress</th>
                  <th style={ordersStyles.th}>Purchase Date</th>
                  <th style={ordersStyles.th}>Redemption History</th>
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
                        <td style={ordersStyles.td}>{buyer.buyerName}</td>
                        <td style={ordersStyles.td}>{buyer.email}</td>
                        <td style={ordersStyles.td}>{buyer.giftCardName}</td>
                        <td style={ordersStyles.td}>
                          <div style={ordersStyles.progressContainer}>
                            <div
                              style={{...ordersStyles.progressBar, width: `${fillPercentage}%`}}
                              title={`Used: ${usedAmount}`}
                            ></div>
                            <div
                              style={{...ordersStyles.progressEmpty, width: `${100 - fillPercentage}%`}}
                              title={`Remaining: ${remainingBalance}`}
                            ></div>
                          </div>
                        </td>
                        <td style={ordersStyles.td}>{new Date(buyer.purchaseDate).toLocaleDateString()}</td>
                        <td style={ordersStyles.td}>
                          <button
                            onClick={() => handleViewRedemptionHistory(buyer)}
                            style={ordersStyles.cardButton}
                          >
                            View History
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{...ordersStyles.td, textAlign: 'center', color: '#6b7280'}}>
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
          <div style={ordersStyles.modal}>
            <div style={{...ordersStyles.modalContent, position: 'relative'}}>
              <button style={ordersStyles.closeButton} onClick={closeModal}>
                &times;
              </button>
              <h3 style={{marginTop: '0', marginBottom: '20px', fontSize: '1.5rem', fontWeight: 'bold'}}>Buyers List</h3>

              <div style={{marginBottom: '20px'}}>
                <input
                  type="text"
                  style={ordersStyles.searchInput}
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

              <ul style={{listStyle: 'none', padding: 0, maxHeight: '400px', overflow: 'auto'}}>
                {buyers.length > 0 ? (
                  buyers.map((buyer, index) => (
                    <li key={index} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '10px',
                      backgroundColor: '#f9fafb'
                    }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                        <span style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{buyer.name}</span>
                        <span style={{color: '#6b7280', fontSize: '0.9rem'}}>
                          {new Date(buyer.purchaseDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span style={{color: '#374151'}}>
                          <strong>Remaining Balance:</strong> {buyer.remainingBalance}
                        </span>
                        <button
                          onClick={() => handleViewRedemptionHistory(buyer)}
                          style={{...ordersStyles.cardButton, width: 'auto', padding: '8px 16px'}}
                        >
                          View History
                        </button>
                      </div>
                    </li>
                  ))
                ) : (
                  <li style={{textAlign: 'center', padding: '20px', color: '#6b7280'}}>No buyers found.</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {modalName === "userRedemptionHistoryModal" && selectedBuyer && (
          <div style={ordersStyles.modal}>
            <div style={{...ordersStyles.modalContent, position: 'relative'}}>
              <button style={ordersStyles.closeButton} onClick={closeModal}>×</button>
              <h3 style={{marginTop: '0', marginBottom: '20px', fontSize: '1.5rem', fontWeight: 'bold'}}>
                Redemption History for {selectedBuyer.buyerName || "Unknown Buyer"}
              </h3>
              {selectedBuyer.redemptionHistory?.length > 0 ? (
                <ul style={{listStyle: 'none', padding: 0, maxHeight: '300px', overflow: 'auto'}}>
                  {selectedBuyer.redemptionHistory.map((entry, index) => (
                    <li key={index} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '10px',
                      backgroundColor: '#f9fafb'
                    }}>
                      <strong style={{color: '#374151', marginBottom: '10px', display: 'block'}}>#{index + 1}</strong>
                      <p style={{margin: '5px 0', color: '#374151'}}>
                        <strong>Redeemed Amount:</strong> ₹{entry.redeemedAmount}
                      </p>
                      <p style={{margin: '5px 0', color: '#374151'}}>
                        <strong>Remaining Amount:</strong> ₹{entry.remainingAmount}
                      </p>
                      <p style={{margin: '5px 0', color: '#374151'}}>
                        <strong>Date:</strong> {new Date(entry.redemptionDate).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{textAlign: 'center', padding: '40px', color: '#6b7280'}}>No redemption history available.</p>
              )}
              <button style={{...ordersStyles.cardButton, margin: '20px auto 0', display: 'block'}} onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* Gift Cards View Redemption History Modal */}
        {modalName === "giftCardRedemptionHistoryModal" && giftCardSelectedBuyer && (
          <div style={ordersStyles.modal}>
            <div style={{...ordersStyles.modalContent, position: 'relative'}}>
              <button style={ordersStyles.closeButton} onClick={closeModal}>×</button>
              <h3 style={{marginTop: '0', marginBottom: '20px', fontSize: '1.5rem', fontWeight: 'bold'}}>
                Redemption History for {giftCardSelectedBuyer.name || "Unknown Buyer"}
              </h3>
              {giftCardSelectedBuyer.redemptionHistory?.length > 0 ? (
                <ul style={{listStyle: 'none', padding: 0, maxHeight: '300px', overflow: 'auto'}}>
                  {giftCardSelectedBuyer.redemptionHistory.map((entry, index) => (
                    <li key={index} style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '10px',
                      backgroundColor: '#f9fafb'
                    }}>
                      <strong style={{color: '#374151', marginBottom: '10px', display: 'block'}}>#{index + 1}</strong>
                      <p style={{margin: '5px 0', color: '#374151'}}>
                        <strong>Redeemed Amount:</strong> ₹{entry.redeemedAmount}
                      </p>
                      <p style={{margin: '5px 0', color: '#374151'}}>
                        <strong>Remaining Amount:</strong> ₹{entry.remainingAmount}
                      </p>
                      <p style={{margin: '5px 0', color: '#374151'}}>
                        <strong>Date:</strong> {new Date(entry.redemptionDate).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{textAlign: 'center', padding: '40px', color: '#6b7280'}}>No redemption history available.</p>
              )}
              <button style={{...ordersStyles.cardButton, margin: '20px auto 0', display: 'block'}} onClick={closeModal}>
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
