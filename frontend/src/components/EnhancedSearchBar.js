import React, { useState, useRef, useEffect } from "react";
import { MapPin, Search, Navigation } from "lucide-react";
import "./EnhancedSearchBar.css";

const EnhancedSearchBar = ({
  onLocationChange,
  onSearchChange,
  placeholder = "Search for restaurant, cuisine or a dish",
  searchValue = "",
  locationValue = "Select your location",
  availableLocations = [],
}) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(locationValue);
  const [searchTerm, setSearchTerm] = useState(searchValue);
  const [recentLocations, setRecentLocations] = useState(availableLocations);
  const dropdownRef = useRef(null);

  // Update location when prop changes
  useEffect(() => {
    setCurrentLocation(locationValue);
  }, [locationValue]);

  // Update recent locations when prop changes
  useEffect(() => {
    console.log("EnhancedSearchBar - Available locations updated:", availableLocations);
    setRecentLocations(availableLocations);
  }, [availableLocations]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Use reverse geocoding to get address
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
            );
            const data = await response.json();
            const address = data.display_name.split(",").slice(0, 3).join(",");
            setCurrentLocation(address);
            if (onLocationChange) {
              onLocationChange(address, position.coords.latitude, position.coords.longitude);
            }
            setShowLocationDropdown(false);
          } catch (error) {
            console.error("Error getting location:", error);
          }
        },
        (error) => {
          console.error("Error detecting location:", error);
          alert("Unable to detect your location. Please check your browser settings.");
        },
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleLocationSelect = (location) => {
    setCurrentLocation(location);
    if (onLocationChange) {
      onLocationChange(location);
    }
    setShowLocationDropdown(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  return (
    <div className="enhanced-search-container">
      <div className="enhanced-search-bar">
        {/* Location Section */}
        <div
          className="location-section"
          onClick={() => setShowLocationDropdown(!showLocationDropdown)}
          ref={dropdownRef}
        >
          <MapPin className="location-icon" size={20} />
          <div className="location-text-container">
            <span className="location-text">{currentLocation}</span>
          </div>
          <div className={`dropdown-arrow ${showLocationDropdown ? "open" : ""}`}>▼</div>

          {/* Location Dropdown */}
          {showLocationDropdown && (
            <div className="location-dropdown" style={{ display: "block" }}>
              <div className="detect-location-option" onClick={handleDetectLocation}>
                <Navigation className="detect-icon" size={18} />
                <div className="detect-text">
                  <span className="detect-title">Detect current location</span>
                  <span className="detect-subtitle">Using GPS</span>
                </div>
              </div>

              <div className="dropdown-divider"></div>
              <div className="recent-locations-section">
                <h3 className="recent-locations-title">Available Locations</h3>
                {recentLocations.length > 0 ? (
                  recentLocations.map((location, index) => (
                    <div
                      key={index}
                      className="recent-location-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLocationSelect(location);
                      }}
                    >
                      <MapPin className="recent-icon" size={16} />
                      <span className="recent-location-text">{location}</span>
                    </div>
                  ))
                ) : (
                  <div className="no-locations-message">
                    <span className="no-locations-text">No locations available</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="search-divider"></div>

        {/* Search Section */}
        <div className="search-section">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedSearchBar;
