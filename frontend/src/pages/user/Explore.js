import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Explore.css";
import logo from "../../assets/giftygen_logo.svg";
import logoWhiteBg from "../../assets/giftgen_whitebg_logo.png";
import EnhancedSearchBar from "../../components/EnhancedSearchBar";
import { getDetailedLocation } from "../../utils/geolocationLanguage";
import {
  UtensilsCrossed,
  Hotel,
  Dumbbell,
  ShoppingBag,
  Sparkles,
  Calendar,
  MapPin,
  ArrowRight,
  Building2,
  Store,
} from "lucide-react";

// Calculate distance between two coordinates using Haversine formula
// Returns distance in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return null;
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

// Industry mapping configuration
const industryConfig = {
  "Restaurant And Fine Dining": {
    id: "restaurants",
    icon: UtensilsCrossed,
    description: "Discover amazing dining experiences across India",
    color: "#ff6b6b",
    gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
  },
  "Hotels & Resorts": {
    id: "hotels",
    icon: Hotel,
    description: "Luxury stays and memorable getaways",
    color: "#4ecdc4",
    gradient: "linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)",
  },
  "Fitness and Wellness memberships": {
    id: "fitness",
    icon: Dumbbell,
    description: "Stay fit with premium gym and wellness centers",
    color: "#95e1d3",
    gradient: "linear-gradient(135deg, #95e1d3 0%, #f38181 100%)",
  },
  "Retail & E-commerce": {
    id: "retail",
    icon: ShoppingBag,
    description: "Shop from your favorite brands",
    color: "#f093fb",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  "Beauty and Personal care": {
    id: "beauty",
    icon: Sparkles,
    description: "Pamper yourself with beauty and wellness",
    color: "#ffecd2",
    gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  },
  "Seasonal Gifting": {
    id: "seasonal",
    icon: Calendar,
    description: "Perfect gifts for every occasion",
    color: "#a8edea",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  },
};

// Default config for unknown industries
const defaultIndustryConfig = {
  icon: Building2,
  description: "Explore businesses in this industry",
  color: "#6c8cff",
  gradient: "linear-gradient(135deg, #6c8cff 0%, #93a8ff 100%)",
};

function Explore() {
  const navigate = useNavigate();
  const [theme] = useState(() => localStorage.getItem("giftygen_theme") || "dark");
  const [industries, setIndustries] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [userLocation, setUserLocation] = useState(null);
  const [detectedRegion, setDetectedRegion] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [availableLocations, setAvailableLocations] = useState([]);

  // Fetch industries and businesses from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch industries
        const industriesResponse = await axios.get("/api/v1/admin/industries");
        const industryNames = industriesResponse.data.industries || [];

        // Map industry names to full industry objects
        const mappedIndustries = industryNames.map((industryName) => {
          const config = industryConfig[industryName] || {
            ...defaultIndustryConfig,
            id: industryName.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and"),
          };

          return {
            id: config.id,
            name: industryName,
            icon: config.icon,
            description: config.description,
            color: config.color,
            gradient: config.gradient,
          };
        });

        setIndustries(mappedIndustries);

        // Fetch all businesses
        const businessesResponse = await axios.get("/api/v1/admin/businesses");
        const businessesData = businessesResponse.data.businesses || [];
        setBusinesses(businessesData);
        setFilteredBusinesses(businessesData);

        // Extract unique locations
        const locations = [...new Set(businessesData.map((b) => b.location).filter(Boolean))];
        setAvailableLocations(["All Locations", ...locations]);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIndustries([]);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get user's current location (GPS first, then IP-based fallback)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          console.log("GPS location detected:", position.coords);
        },
        async (error) => {
          console.error("Error getting GPS location:", error);
          setLocationError(error.message);
          // When GPS access is denied, try to detect region from IP
          try {
            const locationData = await getDetailedLocation();
            if (locationData && locationData.latitude && locationData.longitude) {
              setDetectedRegion({
                city: locationData.city,
                state: locationData.region || locationData.regionName,
                country: locationData.country,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
              });
              console.log("IP-based location detected:", locationData);
            }
          } catch (regionError) {
            console.error("Error detecting region from IP:", regionError);
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
          if (locationData && locationData.latitude && locationData.longitude) {
            setDetectedRegion({
              city: locationData.city,
              state: locationData.region || locationData.regionName,
              country: locationData.country,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
            });
            console.log("IP-based location detected (no GPS):", locationData);
          }
        })
        .catch((regionError) => {
          console.error("Error detecting region:", regionError);
        });
    }
  }, []);

  // Calculate distances and sort businesses by proximity
  useEffect(() => {
    let filtered = [...businesses];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (business) =>
          business.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          business.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          business.industry?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by location
    if (selectedLocation && selectedLocation !== "All Locations") {
      filtered = filtered.filter((business) => business.location === selectedLocation);
    }

    // Calculate distances and add to businesses
    const businessesWithDistance = filtered.map((business) => {
      let distance = null;

      // Try GPS location first
      if (userLocation && business.address?.latitude && business.address?.longitude) {
        distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          business.address.latitude,
          business.address.longitude,
        );
      }

      // Fallback to IP-based region if GPS not available
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

      return {
        ...business,
        distance: distance !== null ? distance : regionDistance,
        hasCoordinates: !!(business.address?.latitude && business.address?.longitude),
      };
    });

    // Sort by distance if available (only when "All Locations" is selected)
    if (selectedLocation === "All Locations" && (userLocation || detectedRegion)) {
      businessesWithDistance.sort((a, b) => {
        // Businesses with valid coordinates come first
        if (a.hasCoordinates && !b.hasCoordinates) return -1;
        if (!a.hasCoordinates && b.hasCoordinates) return 1;

        // Sort by distance
        if (a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        if (a.distance !== null) return -1;
        if (b.distance !== null) return 1;

        // Fallback to alphabetical
        return (a.name || "").localeCompare(b.name || "");
      });

      console.log(
        "Sorted businesses by distance:",
        businessesWithDistance.slice(0, 5).map((b) => ({
          name: b.name,
          distance: b.distance ? `${b.distance.toFixed(2)}km` : "N/A",
          location: b.location,
        })),
      );
    } else {
      // Sort alphabetically when location filter is applied
      businessesWithDistance.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    setFilteredBusinesses(businessesWithDistance);
  }, [searchQuery, selectedLocation, businesses, userLocation, detectedRegion]);

  const handleIndustryClick = (industryName) => {
    navigate(`/explore/${encodeURIComponent(industryName)}`);
  };

  const handleBusinessClick = (businessSlug) => {
    navigate(`/${businessSlug}/giftcards`);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
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
            <button className="explore-nav__link" onClick={() => navigate("/")}>
              Home
            </button>
            <button className="explore-nav__link explore-nav__link--primary" onClick={() => navigate("/login")}>
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Title */}
      <section className="explore-hero">
        <div className="explore-hero__container">
          <h1 className="explore-hero__title">
            Discover Amazing <span className="explore-hero__title-accent">Experiences</span>
          </h1>
          <p className="explore-hero__subtitle">Find the perfect gift cards from premium businesses across India</p>
        </div>
      </section>

      {/* Industries Row */}
      <section className="explore-industries-row">
        <div className="explore-industries-row__container">
          <div className="explore-industries-row__scroll">
            {loading ? (
              <div className="explore-empty-inline">
                <p>Loading industries...</p>
              </div>
            ) : industries.length > 0 ? (
              industries.map((industry) => {
                const IconComponent = industry.icon;
                return (
                  <div
                    key={industry.id}
                    className="explore-industry-chip"
                    onClick={() => handleIndustryClick(industry.name)}
                    style={{
                      "--industry-color": industry.color,
                      "--industry-gradient": industry.gradient,
                    }}
                  >
                    <div className="explore-industry-chip__icon">
                      <IconComponent size={20} />
                    </div>
                    <span className="explore-industry-chip__name">{industry.name}</span>
                  </div>
                );
              })
            ) : (
              <div className="explore-empty-inline">
                <p>No industries available</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search Bar Section */}
      <section className="explore-search-section">
        <div className="explore-search-section__container">
          <EnhancedSearchBar
            onSearchChange={handleSearchChange}
            onLocationChange={handleLocationChange}
            searchValue={searchQuery}
            locationValue={selectedLocation}
            availableLocations={availableLocations}
            placeholder="Search for businesses, industries, or locations"
          />
        </div>
      </section>

      {/* Businesses Grid */}
      <section className="explore-businesses">
        <div className="explore-businesses__container">
          <div className="explore-section__header">
            <h2 className="explore-section__title">Featured Businesses</h2>
            <p className="explore-section__subtitle">
              {(userLocation || detectedRegion) && selectedLocation === "All Locations"
                ? `Showing businesses sorted by proximity to your location`
                : selectedLocation !== "All Locations"
                  ? `Showing businesses in ${selectedLocation}`
                  : "Browse all available businesses"}
            </p>
          </div>

          {loading ? (
            <div className="explore-empty">
              <p>Loading businesses...</p>
            </div>
          ) : filteredBusinesses.length > 0 ? (
            <div className="explore-businesses__grid">
              {filteredBusinesses.map((business) => (
                <div
                  key={business.id}
                  className="explore-business-card"
                  onClick={() => handleBusinessClick(business.businessSlug)}
                >
                  {business.logoUrl ? (
                    <div className="explore-business-card__logo">
                      <img src={business.logoUrl} alt={business.name} />
                    </div>
                  ) : (
                    <div className="explore-business-card__icon">
                      <Store size={28} />
                    </div>
                  )}
                  <div className="explore-business-card__content">
                    <h3 className="explore-business-card__title">{business.name}</h3>
                    {business.description && (
                      <p className="explore-business-card__description">{business.description}</p>
                    )}
                    <div className="explore-business-card__meta">
                      <div className="explore-business-card__location">
                        <MapPin size={14} />
                        <span>{business.location}</span>
                      </div>
                      {business.industry && <div className="explore-business-card__industry">{business.industry}</div>}
                    </div>
                  </div>
                  <div className="explore-business-card__footer">
                    <span className="explore-business-card__cta">
                      View Details <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="explore-empty">
              <Store size={48} />
              <p>No businesses found matching your search</p>
              <button
                className="explore-empty__button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedLocation("All Locations");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Explore;
