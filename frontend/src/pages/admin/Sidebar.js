import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { useDispatch } from "react-redux";
import { logout } from "../../services/Actions/authActions";
import { Link, useLocation } from "react-router-dom";
import { FaCog, FaSignOutAlt, FaAngleLeft, FaTachometerAlt, FaGift, FaShoppingCart, FaChartLine, FaCreditCard, FaBars, FaChevronDown, FaChevronUp, FaLock, FaBuilding, FaCreditCard as FaCard, FaPlus, FaList } from "react-icons/fa";
import AiiLogo from "../../assets/Aii_logo.png";

const Sidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  // Updated isActive function to match exact paths and nested routes
  const isActive = (path) => {
    if (path === "/settings") {
      return location.pathname.startsWith("/settings");
    }
    if (path === "/giftcards") {
      return location.pathname.startsWith("/giftcards");
    }
    return location.pathname === path;
  };

  // Check if any settings sub-route is active
  const isSettingsActive = () => {
    return location.pathname.startsWith("/settings");
  };

  // Check if any giftcards sub-route is active
  const isGiftCardsActive = () => {
    return location.pathname.startsWith("/giftcards");
  };

  const [isOpen, setIsOpen] = useState(true);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);
  const [giftcardsDropdownOpen, setGiftcardsDropdownOpen] = useState(false);

  // Auto-open dropdown when on a settings route
  useEffect(() => {
    if (location.pathname.startsWith("/settings") && isOpen) {
      setSettingsDropdownOpen(true);
    }
  }, [location.pathname, isOpen]);

  // Auto-open giftcards dropdown when on a giftcards route
  useEffect(() => {
    if (location.pathname.startsWith("/giftcards") && isOpen) {
      setGiftcardsDropdownOpen(true);
    }
  }, [location.pathname, isOpen]);

  // Close dropdown when sidebar is collapsed
  useEffect(() => {
    if (!isOpen) {
      setSettingsDropdownOpen(false);
      setGiftcardsDropdownOpen(false);
    }
  }, [isOpen]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
    <div className="logo-details">
      <img src={AiiLogo} alt="Aii Logo" className="logo-image" />
      <i className={`bx bx-menu ${isOpen ? "rotate" : ""}`} id="btn" onClick={toggleSidebar}>
        {isOpen ? <FaAngleLeft id="btn" className="icon" /> : <FaBars id="btn" className="icon" />}
      </i>
    </div>
    <ul className="nav-list">
      <li>
        <Link to="/dashboard" className={`linke ${isActive("/dashboard") ? "active" : ""}`}>
          <i className="bx bx-grid-alt">
            <FaTachometerAlt className="icon" />
          </i>
          <span className="links_name">Dashboard</span>
          {isActive("/dashboard") && <span className="active-indicator"></span>}
        </Link>
      </li>
      <li className={`giftcards-menu-item ${isGiftCardsActive() ? "active-parent" : ""}`}>
        <div
          className={`linke giftcards-trigger ${isGiftCardsActive() ? "active" : ""}`}
          onClick={() => setGiftcardsDropdownOpen(!giftcardsDropdownOpen)}
        >
          <i className="bx bx-user">
            <FaGift className="icon" />
          </i>
          <span className="links_name">GiftCards</span>
          {isOpen && (
            <span className="dropdown-arrow">
              {giftcardsDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          )}
          {isGiftCardsActive() && <span className="active-indicator"></span>}
        </div>
        {isOpen && giftcardsDropdownOpen && (
          <ul className="giftcards-dropdown">
            <li>
              <Link
                to="/giftcards/create"
                className={`dropdown-link ${location.pathname === "/giftcards/create" ? "active" : ""}`}
                onClick={() => setGiftcardsDropdownOpen(false)}
              >
                <i className="dropdown-icon">
                  <FaPlus />
                </i>
                <span>Create Giftcard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/giftcards"
                className={`dropdown-link ${location.pathname === "/giftcards" ? "active" : ""}`}
                onClick={() => setGiftcardsDropdownOpen(false)}
              >
                <i className="dropdown-icon">
                  <FaList />
                </i>
                <span>Manage Giftcard</span>
              </Link>
            </li>
          </ul>
        )}
      </li>
      <li>
        <Link to="/orders" className={`linke ${isActive("/orders") ? "active" : ""}`}>
          <i className="bx bx-chat">
            <FaShoppingCart className="icon" />
          </i>
          <span className="links_name">Orders</span>
          {isActive("/orders") && <span className="active-indicator"></span>}
        </Link>
      </li>
      <li>
        <Link to="/reports" className={`linke ${isActive("/reports") ? "active" : ""}`}>
          <i className="bx bx-pie-chart-alt-2">
            <FaChartLine className="icon" />
          </i>
          <span className="links_name">Reports</span>
          {isActive("/reports") && <span className="active-indicator"></span>}
        </Link>
      </li>
      <li>
        <Link to="/subscription" className={`linke ${isActive("/subscription") ? "active" : ""}`}>
          <i className="bx bx-credit-card">
            <FaCreditCard className="icon" />
          </i>
          <span className="links_name">Subscription</span>
          {isActive("/subscription") && <span className="active-indicator"></span>}
        </Link>
      </li>
      <li className={`settings-menu-item ${isSettingsActive() ? "active-parent" : ""}`}>
        <div 
          className={`linke settings-trigger ${isSettingsActive() ? "active" : ""}`}
          onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
        >
          <i className="bx bx-folder">
            <FaCog className="icon" />
          </i>
          <span className="links_name">Settings</span>
          {isOpen && (
            <span className="dropdown-arrow">
              {settingsDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          )}
          {isSettingsActive() && <span className="active-indicator"></span>}
        </div>
        {isOpen && settingsDropdownOpen && (
          <ul className="settings-dropdown">
            <li>
              <Link 
                to="/settings/security" 
                className={`dropdown-link ${location.pathname === "/settings/security" || location.pathname === "/settings" ? "active" : ""}`}
                onClick={() => setSettingsDropdownOpen(false)}
              >
                <i className="dropdown-icon">
                  <FaLock />
                </i>
                <span>Security & Access</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/settings/business-profile" 
                className={`dropdown-link ${location.pathname === "/settings/business-profile" ? "active" : ""}`}
                onClick={() => setSettingsDropdownOpen(false)}
              >
                <i className="dropdown-icon">
                  <FaBuilding />
                </i>
                <span>Business Profile</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/settings/payment" 
                className={`dropdown-link ${location.pathname === "/settings/payment" ? "active" : ""}`}
                onClick={() => setSettingsDropdownOpen(false)}
              >
                <i className="dropdown-icon">
                  <FaCard />
                </i>
                <span>Payment Configuration</span>
              </Link>
            </li>
          </ul>
        )}
      </li>
      <li>
        <Link to="/redeem" className={`linke ${isActive("/redeem") ? "active" : ""}`}>
          <i className="bx bx-gift">
            <FaGift className="icon" />
          </i>
          <span className="links_name">Redeem</span>
          {isActive("/redeem") && <span className="active-indicator"></span>}
        </Link>
      </li>
    </ul>
    
    <div className="profile">
      <div className="profile-details" onClick={handleLogout}>
        <i className="bx bx-export">
          <FaSignOutAlt className="icon" />
        </i>
        <div className="name_job">
          <div className="name">Logout</div>
        </div>
      </div>
    </div>
    
    <div className="sidebar-overlay" onClick={toggleSidebar}></div>
  </div>
);
};
export default Sidebar;
