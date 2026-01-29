import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "./Explore.css";
import logo from "../../assets/giftygen_logo.svg";
import logoWhiteBg from "../../assets/giftgen_whitebg_logo.png";
import { ArrowLeft, MapPin, Search, ChevronRight, Building2 } from "lucide-react";
import { getDetailedLocation } from "../../utils/geolocationLanguage";
import EnhancedSearchBar from "../../components/EnhancedSearchBar";

// Calculate distance between two coordinates using Haversine formula
// Returns distance in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return null; // Return null if coordinates are missing
  }

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function ExploreCategory() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [theme] = useState(() => localStorage.getItem("giftygen_theme") || "dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [industryName, setIndustryName] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [detectedRegion, setDetectedRegion] = useState(null);

  // Decode the industry name from URL
  const decodedIndustryName = decodeURIComponent(categoryId);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        async (error) => {
          console.error("Error getting user location:", error);
          setLocationError(error.message);
          // When location access is denied, try to detect region from IP
          try {
            const locationData = await getDetailedLocation();
            if (locationData) {
              setDetectedRegion({
                city: locationData.city,
                state: locationData.region || locationData.regionName,
                country: locationData.country,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
              });
            }
          } catch (regionError) {
            console.error("Error detecting region:", regionError);
            // Continue without region detection
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } else {
      setLocationError("Geolocation is not supported by your browser");
      // Try to detect region from IP when geolocation is not supported
      getDetailedLocation()
        .then((locationData) => {
          if (locationData) {
            setDetectedRegion({
              city: locationData.city,
              state: locationData.region || locationData.regionName,
              country: locationData.country,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
            });
          }
        })
        .catch((regionError) => {
          console.error("Error detecting region:", regionError);
        });
    }
  }, []);

  // Fetch businesses by industry
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/v1/admin/industries/${encodeURIComponent(decodedIndustryName)}`);
        const fetchedBusinesses = response.data.businesses || [];

        setBusinesses(fetchedBusinesses);
        setIndustryName(decodedIndustryName);
      } catch (error) {
        console.error("Error fetching businesses:", error);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    if (decodedIndustryName) {
      fetchBusinesses();
    }
  }, [decodedIndustryName]);

  // Calculate distances and sort businesses by proximity
  const businessesWithDistance = businesses.map((business) => {
    let distance = null;
    if (userLocation && business.address?.latitude && business.address?.longitude) {
      distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        business.address.latitude,
        business.address.longitude,
      );
    }

    // Calculate distance from detected region if available and user location is not available
    let regionDistance = null;
    if (
      !userLocation &&
      detectedRegion &&
      detectedRegion.latitude &&
      detectedRegion.longitude &&
      business.address?.latitude &&
      business.address?.longitude
    ) {
      regionDistance = calculateDistance(
        detectedRegion.latitude,
        detectedRegion.longitude,
        business.address.latitude,
        business.address.longitude,
      );
    }

    // Determine region match priority
    let regionPriority = 0; // 0 = no match, 1 = country match, 2 = state match, 3 = city match
    if (detectedRegion && !userLocation) {
      // Normalize strings for comparison (trim, lowercase, remove extra spaces)
      const normalizeString = (str) => (str || "").toLowerCase().trim().replace(/\s+/g, " ");

      const businessCity = normalizeString(business.address?.city);
      const businessState = normalizeString(business.address?.state);
      const detectedCity = normalizeString(detectedRegion.city);
      const detectedState = normalizeString(detectedRegion.state);
      const detectedCountry = normalizeString(detectedRegion.country);

      // Check for city match (exact or partial)
      if (businessCity && detectedCity) {
        if (
          businessCity === detectedCity ||
          businessCity.includes(detectedCity) ||
          detectedCity.includes(businessCity)
        ) {
          regionPriority = 3; // Same city
        }
      }

      // Check for state match if city didn't match
      if (regionPriority < 3 && businessState && detectedState) {
        if (
          businessState === detectedState ||
          businessState.includes(detectedState) ||
          detectedState.includes(businessState)
        ) {
          regionPriority = 2; // Same state
        }
      }

      // If no city or state match, assume same country if country is detected
      if (regionPriority === 0 && detectedCountry) {
        regionPriority = 1; // Same country
      }
    }

    return {
      ...business,
      distance,
      regionDistance,
      regionPriority,
    };
  });

  // Sort businesses by distance (nearest first), then by region, then alphabetically
  const sortedBusinesses = [...businessesWithDistance].sort((a, b) => {
    // If user location is available, sort by distance
    if (userLocation) {
      // If both have distances, sort by distance
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      // If only one has distance, prioritize it
      if (a.distance !== null && b.distance === null) {
        return -1;
      }
      if (a.distance === null && b.distance !== null) {
        return 1;
      }
    }

    // If location access denied but region detected, sort by region priority and distance
    if (locationError && detectedRegion) {
      // First, sort by region priority (city > state > country > no match)
      if (a.regionPriority !== b.regionPriority) {
        return b.regionPriority - a.regionPriority;
      }

      // If same priority, sort by distance from detected region
      if (a.regionDistance !== null && b.regionDistance !== null) {
        return a.regionDistance - b.regionDistance;
      }
      if (a.regionDistance !== null && b.regionDistance === null) {
        return -1;
      }
      if (a.regionDistance === null && b.regionDistance !== null) {
        return 1;
      }
    }

    // Fallback to alphabetical sorting
    return a.name.localeCompare(b.name);
  });

  // Filter businesses based on search
  const filteredBusinesses = sortedBusinesses.filter((business) => {
    const matchesSearch =
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by location if selected (city name)
    if (selectedLocation !== "all" && selectedLocation) {
      const businessCity = business.address?.city || "";

      if (businessCity !== selectedLocation) {
        return false;
      }
    }

    return matchesSearch;
  });

  // Format distance for display
  const formatDistance = (distance) => {
    if (distance === null) return null;
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  const handleBrandClick = (businessSlug) => {
    // Navigate to the dedicated business gift cards page
    // This page shows all active gift cards for the selected business
    navigate(`/${businessSlug}/giftcards`);
  };

  return (
    <div className="explore-page" data-theme={theme}>
      {/* Navigation */}
      <nav className="explore-nav">
        <div className="explore-nav__container">
          <div className="explore-nav__brand" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <img src={theme === "light" ? logoWhiteBg : logo} alt="GiftyGen" className="explore-nav__logo" />
          </div>
          <div className="explore-nav__actions">
            <button className="explore-nav__link" onClick={() => navigate("/explore")}>
              Explore
            </button>
            <button className="explore-nav__link" onClick={() => navigate("/")}>
              Home
            </button>
            <button className="explore-nav__link explore-nav__link--primary" onClick={() => navigate("/login")}>
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="explore-category-header">
        <div className="explore-category-header__container">
          <button className="explore-back-btn" onClick={() => navigate("/explore")}>
            <ArrowLeft size={20} />
            Back to Explore
          </button>
          <h1 className="explore-category-header__title">{industryName || decodedIndustryName}</h1>
          <p className="explore-category-header__description">
            {businesses.length > 0
              ? `Discover ${businesses.length} ${businesses.length === 1 ? "business" : "businesses"} in this industry`
              : "Explore businesses in this industry"}
          </p>

          {/* Enhanced Search Bar */}
          <div className="explore-category-search-wrapper">
            <EnhancedSearchBar
              onLocationChange={(location, lat, lng) => {
                console.log("Location changed:", location, lat, lng);
                // Filter businesses based on location if needed
                setSelectedLocation(location);
              }}
              onSearchChange={(value) => setSearchQuery(value)}
              placeholder={`Search ${industryName.toLowerCase() || "businesses"}...`}
              searchValue={searchQuery}
              locationValue={
                selectedLocation !== "all" && selectedLocation
                  ? selectedLocation
                  : detectedRegion
                    ? `${detectedRegion.city || ""}, ${detectedRegion.state || ""}`.trim()
                    : "Select your location"
              }
              availableLocations={(() => {
                const locations = [
                  ...new Set(
                    businesses
                      .map((b) => {
                        // Just return city name
                        return b.address?.city || null;
                      })
                      .filter(Boolean),
                  ),
                ];
                console.log("📍 Available locations:", locations);
                console.log("📊 Total businesses:", businesses.length);
                if (businesses.length > 0) {
                  console.log("🏢 Sample business address:", businesses[0]?.address);
                }
                return locations;
              })()}
            />
          </div>
        </div>
      </section>

      {/* Brands sorted by distance */}
      <section className="explore-brands">
        <div className="explore-brands__container">
          {loading ? (
            <div className="explore-empty">
              <p>Loading businesses...</p>
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="explore-empty">
              <p>No businesses found {searchQuery ? "matching your search" : "in this industry yet"}.</p>
            </div>
          ) : (
            <div className="explore-brands-section">
              {userLocation && (
                <div className="explore-location-section__header" style={{ marginBottom: "24px" }}>
                  <MapPin className="explore-location-section__icon" size={24} />
                  <h2 className="explore-location-section__title">Sorted by Distance</h2>
                  <span className="explore-location-section__count">
                    {filteredBusinesses.length} {filteredBusinesses.length === 1 ? "business" : "businesses"}
                  </span>
                </div>
              )}
              {!userLocation && !locationError && (
                <div className="explore-location-section__header" style={{ marginBottom: "24px" }}>
                  <MapPin className="explore-location-section__icon" size={24} />
                  <h2 className="explore-location-section__title">All Businesses</h2>
                  <span className="explore-location-section__count">
                    {filteredBusinesses.length} {filteredBusinesses.length === 1 ? "business" : "businesses"}
                  </span>
                </div>
              )}
              {locationError && (
                <div
                  style={{
                    padding: "12px 16px",
                    marginBottom: "24px",
                    background: "var(--explore-card)",
                    border: "1px solid var(--explore-border)",
                    borderRadius: "12px",
                    color: "var(--explore-muted)",
                    fontSize: "14px",
                  }}
                >
                  {detectedRegion
                    ? `Location access denied. Showing businesses near ${detectedRegion.city || detectedRegion.state || detectedRegion.country} first.`
                    : "Location access denied. Showing businesses sorted alphabetically."}
                </div>
              )}
              <div className="explore-brands__grid">
                {filteredBusinesses.map((business) => (
                  <div
                    key={business.businessSlug}
                    className="explore-brand-card"
                    onClick={() => handleBrandClick(business.businessSlug)}
                  >
                    {business.logoUrl ? (
                      <div className="explore-brand-card__logo">
                        <img src={business.logoUrl} alt={business.name} />
                      </div>
                    ) : (
                      <div className="explore-brand-card__icon">
                        <Building2 size={24} />
                      </div>
                    )}
                    <h3 className="explore-brand-card__title">{business.name}</h3>
                    {business.description && <p className="explore-brand-card__description">{business.description}</p>}
                    <div className="explore-brand-card__location">
                      <MapPin size={14} />
                      <span>
                        {business.address?.city || "Location not specified"}
                        {business.distance !== null && (
                          <span style={{ marginLeft: "8px", color: "var(--explore-primary)", fontWeight: "600" }}>
                            • {formatDistance(business.distance)}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="explore-brand-card__footer">
                      <span className="explore-brand-card__cta">
                        View Gift Cards <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ExploreCategory;
