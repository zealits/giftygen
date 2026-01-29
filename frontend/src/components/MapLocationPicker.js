import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./MapLocationPicker.css";
import { getDetailedLocation } from "../utils/geolocationLanguage";

const MapLocationPicker = ({ latitude, longitude, onLocationSelect, onClose }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const geolocateControl = useRef(null);
  const geocoderRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState({
    lat: latitude || null,
    lng: longitude || null,
  });
  const [selectedPlaceName, setSelectedPlaceName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  // Prevent multiple initial region lookups (React StrictMode, re-renders, etc.)
  const hasInitializedFromRegion = useRef(false);
  // Simple in‑memory cache to avoid repeated reverse‑geocoding for same coords
  const addressCacheRef = useRef({});


  const MAPBOX_TOKEN = "pk.eyJ1IjoiYW5pa2V0MTciLCJhIjoiY2xlZ3FwOW02MGJ0NTN4bWNhMXBqY25lcCJ9.qjfXDd_p2yjXQz3wa2w2UQ";

  const [mapError, setMapError] = useState(null);
  const mapLoadTimeoutRef = useRef(null);

  // Function to fetch address from Mapbox
  const fetchAddressFromMapbox = useCallback(async (lat, lng) => {
    if (!MAPBOX_TOKEN) return null;
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=address,poi,place`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const placeName = feature.place_name || feature.text || "";
        setSelectedPlaceName(placeName);
        
        // Parse address components from context – we care mainly about
        // city / state / country. We intentionally avoid street‑level
        // precision here so the header shows a broader region instead
        // of a full street address.
        const context = feature.context || [];
        let street = "";
        let city = "";
        let state = "";
        let zipCode = "";
        let country = "";

        context.forEach((item) => {
          const id = item.id || "";
          if (id.startsWith("address")) {
            // Only treat explicit address context as street; do NOT
            // fall back to feature.text so we don't turn town names
            // into street names.
            street = item.text || "";
          } else if (id.startsWith("place")) {
            city = item.text || "";
          } else if (id.startsWith("region")) {
            state = item.text || "";
          } else if (id.startsWith("country")) {
            country = item.text || "";
          } else if (id.startsWith("postcode")) {
            zipCode = item.text || "";
          } else if (id.startsWith("district") && !city) {
            city = item.text || "";
          } else if (id.startsWith("locality") && !city) {
            city = item.text || "";
          }
        });

        // If street is not in context, we deliberately do NOT derive it
        // from feature.properties or feature.text to avoid overly
        // specific street addresses for approximate regions.

        // If city is not found, try to extract from place_name
        if (!city && placeName) {
          const parts = placeName.split(",");
          if (parts.length > 1) {
            city = parts[parts.length - 2]?.trim() || "";
          }
        }

        // Build a simplified full address that focuses on city/state/country
        const simpleFullAddress = [city, state, country]
          .filter(Boolean)
          .join(", ") || placeName || feature.text || "";

        return {
          street: street || "",
          city: city || "",
          state: state || "",
          zipCode: zipCode || "",
          fullAddress: simpleFullAddress,
        };
      }
    } catch (error) {
      console.log("Error fetching address from Mapbox:", error);
    }
    return null;
  }, [MAPBOX_TOKEN]);

  // Main function to fetch full address details using Mapbox only
  const fetchFullAddress = useCallback(
    async (lat, lng) => {
      if (!lat || !lng) return null;

      // Round to ~300m to avoid re‑geocoding nearly identical points
      const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;

      // 1. Check cache to avoid multiple API calls for same coordinates
      if (addressCacheRef.current[key]) {
        return addressCacheRef.current[key];
      }

      // 2. Fetch from Mapbox once and cache
      let address = await fetchAddressFromMapbox(lat, lng);

      // 3. If Mapbox cannot give us a usable city/state (e.g. very
      // rural / unknown place), fall back to broader region from the
      // language/IP location data (state/country only).
      if (!address || (!address.city && !address.state)) {
        try {
          const stored = localStorage.getItem("giftygen_user_location");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed) {
              const fallbackCity = parsed.city || "";
              const fallbackState = parsed.region || "";
              const fallbackCountry = parsed.countryName || parsed.country || "";

              address = {
                street: "",
                city: fallbackCity,
                state: fallbackState,
                zipCode: "",
                fullAddress: [fallbackCity, fallbackState, fallbackCountry]
                  .filter(Boolean)
                  .join(", "),
              };
            }
          }
        } catch (e) {
          console.log("Failed to build fallback state-level address:", e);
        }
      }

      if (address) {
        addressCacheRef.current[key] = address;
        console.log("Using Mapbox address:", address);
      }

      return address;
    },
    [fetchAddressFromMapbox]
  );

  // Helper to update map, marker and address from coordinates
  const updateLocationFromCoords = useCallback(
    async (lat, lng) => {
      const newLocation = { lat, lng };
      setSelectedLocation(newLocation);

      // Fetch full address
      const address = await fetchFullAddress(lat, lng);
      if (onLocationSelect) {
        onLocationSelect(lat, lng, address);
      }

      if (map.current) {
        // Ensure map is properly sized before updating
        map.current.resize();
        
        // Update marker position
        if (marker.current) {
          marker.current.setLngLat([lng, lat]);
        } else {
          marker.current = new mapboxgl.Marker({
            draggable: true,
            color: "#6366f1",
          })
            .setLngLat([lng, lat])
            .addTo(map.current);

          marker.current.on("dragend", async () => {
            const lngLat = marker.current.getLngLat();
            const updatedLocation = {
              lat: lngLat.lat,
              lng: lngLat.lng,
            };
            setSelectedLocation(updatedLocation);

            // Reverse geocode when marker is dragged
            const dragAddress = await fetchFullAddress(
              updatedLocation.lat,
              updatedLocation.lng
            );
            if (onLocationSelect) {
              onLocationSelect(
                updatedLocation.lat,
                updatedLocation.lng,
                dragAddress
              );
            }

            // Zoom to dragged location
            map.current.flyTo({
              center: [lngLat.lng, lngLat.lat],
              zoom: 16,
              duration: 800,
            });
          });
        }

        // Center and zoom map on user location (higher zoom shows more place names)
        map.current.flyTo({
          center: [lng, lat],
          zoom: 16, // Increased zoom to show more place names
          duration: 1000,
        });
      }
    },
    [fetchFullAddress, onLocationSelect]
  );

  // Fallback when precise geolocation is unavailable – use approximate region
  // from where the website is accessed. Just zoom to state/region level without
  // setting marker or fetching full address. User will pick exact location.
  const fallbackToApproximateLocation = useCallback(async (force = false) => {
    try {
      setIsLocating(false);

      // Avoid running multiple times on initial mount due to StrictMode
      if (hasInitializedFromRegion.current && !force) {
        return;
      }

      let candidateLocation = null;

      // 1. Try stored location from language detection
      try {
        const stored = localStorage.getItem("giftygen_user_location");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (
            parsed &&
            typeof parsed.latitude === "number" &&
            typeof parsed.longitude === "number"
          ) {
            candidateLocation = parsed;
          }
        }
      } catch (e) {
        console.log("Failed to read stored user location:", e);
      }

      // 2. If not available, call IP-based API
      if (!candidateLocation) {
        const ipLocation = await getDetailedLocation();
        if (
          ipLocation &&
          typeof ipLocation.latitude === "number" &&
          typeof ipLocation.longitude === "number"
        ) {
          candidateLocation = ipLocation;
        }
      }

      if (candidateLocation && map.current) {
        // Just zoom to state/region level (zoom 8-9) without setting marker or fetching address
        // User will click on map to select exact location
        map.current.flyTo({
          center: [candidateLocation.longitude, candidateLocation.latitude],
          zoom: 8, // State/region level zoom, not street level
          duration: 1000,
        });
        hasInitializedFromRegion.current = true;
        // Map is now centered on the approximate region from which the website is accessed.
        // No marker set, no address lookup - user picks exact location.
      } else {
        console.warn(
          "Approximate region detection did not return coordinates; user must pick manually on map."
        );
      }
    } catch (fallbackError) {
      console.error("Approximate region fallback failed:", fallbackError);
    }
  }, []);

  useEffect(() => {
    // Check for required API keys
    if (!MAPBOX_TOKEN) {
      setMapError("Mapbox token not configured. Please add REACT_APP_MAPBOX_TOKEN to your .env file.");
      setIsLoading(false);
      return;
    }

    if (!mapContainer.current) {
      console.log("Map container not ready yet");
      return;
    }

    // Set a timeout to force loading to stop after 10 seconds
    mapLoadTimeoutRef.current = setTimeout(() => {
      if (isLoading) {
        console.warn("Map loading timeout - forcing loading state to complete");
        setIsLoading(false);
        if (!map.current) {
          setMapError("Map failed to load. Please refresh the page and try again.");
        }
      }
    }, 10000);

    try {
      // Initialize map
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const initialCenter = latitude && longitude 
        ? [longitude, latitude] 
        : [77.2090, 28.6139]; // Default to Delhi, India

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: initialCenter,
        zoom: latitude && longitude ? 15 : 10, // Increased default zoom to show more place names
        minZoom: 3,
        maxZoom: 18,
        preserveDrawingBuffer: true,
        attributionControl: true,
      });

      console.log("Map initialized with center:", initialCenter);

      // Ensure labels are visible by waiting for map to load
      map.current.on("style.load", () => {
        // Force label visibility
        if (map.current.getLayer("road-label")) {
          map.current.setLayoutProperty("road-label", "visibility", "visible");
        }
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add geolocate control
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: false, // Don't track continuously, just get once
        showUserHeading: false,
      });
      map.current.addControl(geolocate, "top-right");
      geolocateControl.current = geolocate;

      // Add marker if initial location exists
      if (latitude && longitude) {
        marker.current = new mapboxgl.Marker({
          draggable: true,
          color: "#6366f1",
        })
          .setLngLat([longitude, latitude])
          .addTo(map.current);

        // Fetch full address for initial location
        fetchFullAddress(latitude, longitude).then((address) => {
          if (address && onLocationSelect) {
            onLocationSelect(latitude, longitude, address);
          }
        });
        
        // Zoom to initial location
        map.current.flyTo({
          center: [longitude, latitude],
          zoom: 16,
          duration: 1000,
        });

        // Update location when marker is dragged
        marker.current.on("dragend", () => {
          const lngLat = marker.current.getLngLat();
          const newLocation = {
            lat: lngLat.lat,
            lng: lngLat.lng,
          };
          setSelectedLocation(newLocation);
          if (onLocationSelect) {
            onLocationSelect(newLocation.lat, newLocation.lng);
          }
          // Reverse geocode when marker is dragged
          fetchFullAddress(lngLat.lat, lngLat.lng).then((address) => {
            if (address && onLocationSelect) {
              onLocationSelect(lngLat.lat, lngLat.lng, address);
            }
          });
          // Zoom to dragged location
          map.current.flyTo({
            center: [lngLat.lng, lngLat.lat],
            zoom: 16,
            duration: 800,
          });
        });
      }

      // Handle map click to set location
      map.current.on("click", (e) => {
        const { lng, lat } = e.lngLat;

        // Remove existing marker
        if (marker.current) {
          marker.current.remove();
        }

        // Add new marker at clicked location
        marker.current = new mapboxgl.Marker({
          draggable: true,
          color: "#6366f1",
        })
          .setLngLat([lng, lat])
          .addTo(map.current);

        const newLocation = { lat, lng };
        setSelectedLocation(newLocation);

        if (onLocationSelect) {
          onLocationSelect(lat, lng);
        }

        // Reverse geocode to get full address and auto-fill
        fetchFullAddress(lat, lng).then((address) => {
          if (address && onLocationSelect) {
            // Pass address along with coordinates
            onLocationSelect(lat, lng, address);
          }
        });

        // Zoom to clicked location (higher zoom shows more place names)
        map.current.flyTo({
          center: [lng, lat],
          zoom: 16, // Increased zoom to show more place names
          duration: 1000,
        });

        // Update marker drag handler
        marker.current.on("dragend", () => {
          const lngLat = marker.current.getLngLat();
          const updatedLocation = {
            lat: lngLat.lat,
            lng: lngLat.lng,
          };
          setSelectedLocation(updatedLocation);
          if (onLocationSelect) {
            onLocationSelect(updatedLocation.lat, updatedLocation.lng);
          }
          // Zoom to dragged location
          map.current.flyTo({
            center: [lngLat.lng, lngLat.lat],
            zoom: 15,
            duration: 800,
          });
        });
      });

      // Handle geolocate events from Mapbox control
      geolocate.on("geolocate", (e) => {
        const { coords } = e;
        if (coords) {
          updateLocationFromCoords(coords.latitude, coords.longitude);
        }
      });

      // Handle geolocation start
      geolocate.on("trackuserlocationstart", () => {
        setIsLocating(true);
      });

      // Handle geolocation end
      geolocate.on("trackuserlocationend", () => {
        setIsLocating(false);
      });

      // Handle geolocation errors
      geolocate.on("error", (e) => {
        console.log("Geolocation error:", e);
        setIsLocating(false);
        // Prefer approximate IP-based region when precise geolocation fails
        fallbackToApproximateLocation(true);
      });

      // Listen to multiple events to ensure we catch when map is ready
      const handleMapReady = () => {
        // Clear the timeout since map loaded successfully
        if (mapLoadTimeoutRef.current) {
          clearTimeout(mapLoadTimeoutRef.current);
          mapLoadTimeoutRef.current = null;
        }
        setIsLoading(false);
        
        // Force resize to ensure map renders properly in its container
        setTimeout(() => {
          if (map.current) {
            map.current.resize();
          }
        }, 100);
        
        // If no explicit coordinates are provided, center map on approximate
        // region based on where the website is accessed (IP-based API).
        if (!latitude || !longitude) {
          // Small delay to ensure map is fully loaded before flyTo
          setTimeout(() => {
            fallbackToApproximateLocation();
          }, 500);
        }
      };

      map.current.on("load", handleMapReady);
      
      // Fallback: also listen to style.load which fires earlier
      map.current.on("style.load", () => {
        // Give it a moment for tiles to start loading
        setTimeout(() => {
          if (isLoading) {
            handleMapReady();
          }
        }, 1000);
      });

    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize map. Please check your Mapbox token.");
      setIsLoading(false);
      // Clear timeout on error
      if (mapLoadTimeoutRef.current) {
        clearTimeout(mapLoadTimeoutRef.current);
        mapLoadTimeoutRef.current = null;
      }
    }

    // Add error handler for map
    if (map.current) {
      map.current.on("error", (e) => {
        console.error("Map error:", e);
        // Don't show error for tile loading failures, just log them
        if (e.error && e.error.status === 404) {
          console.warn("Some map tiles failed to load, but map should still work");
        }
        setIsLoading(false);
        if (mapLoadTimeoutRef.current) {
          clearTimeout(mapLoadTimeoutRef.current);
          mapLoadTimeoutRef.current = null;
        }
      });

      // Add handler for when tiles start loading
      map.current.on("data", (e) => {
        if (e.dataType === "source" && e.isSourceLoaded) {
          // Source loaded, map should be rendering
          console.log("Map source loaded");
        }
      });

      // Add idle handler to detect when map is fully rendered
      map.current.on("idle", () => {
        console.log("Map is idle and fully rendered");
      });
    }

    // Cleanup
    return () => {
      // Clear timeout on cleanup
      if (mapLoadTimeoutRef.current) {
        clearTimeout(mapLoadTimeoutRef.current);
        mapLoadTimeoutRef.current = null;
      }
      // Clear search timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
      if (map.current) {
        map.current.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude, MAPBOX_TOKEN]);

  // Debounced search function
  const searchTimeoutRef = useRef(null);

  // Handle manual search (if needed for custom search UI)
  const handleSearch = async (query) => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query || query.length < 2 || !MAPBOX_TOKEN) {
      setSearchResults([]);
      setShowSearchResults(false);
      setSearchAttempted(false);
      return;
    }

    // Debounce search to avoid too many API calls
    searchTimeoutRef.current = setTimeout(async () => {
      setSearchAttempted(true);
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&types=poi,address,place&limit=5`
        );
        
        if (!response.ok) {
          console.error("Search API error:", response.status, response.statusText);
          setSearchResults([]);
          setShowSearchResults(true); // Show dropdown to display "no results"
          return;
        }
        
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          setSearchResults(data.features);
          setShowSearchResults(true);
        } else {
          // No results found
          setSearchResults([]);
          setShowSearchResults(true); // Show dropdown to display "no results"
          console.log("No search results found for:", query);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
        setShowSearchResults(true); // Show dropdown to display error
      }
    }, 300); // 300ms debounce
  };

  const handleSearchResultClick = async (result) => {
    // Stop any ongoing searches
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    
    const [lng, lat] = result.center;
    const placeName = result.place_name || result.text || "";
    
    setSelectedPlaceName(placeName);
    setSearchQuery(placeName);
    setShowSearchResults(false);
    setSearchAttempted(false);
    
    // Update location first
    const newLocation = { lat, lng };
    setSelectedLocation(newLocation);
    
    // Fetch full address from Google Maps (better address data) or Mapbox
    const address = await fetchFullAddress(lat, lng);
    
    // If Google/Mapbox didn't return address, parse from Mapbox search result as fallback
    if (!address || (!address.street && !address.city)) {
      const context = result.context || [];
      let street = "";
      let city = "";
      let state = "";
      let zipCode = "";
      
      context.forEach((item) => {
        const id = item.id || "";
        if (id.startsWith("address")) {
          street = item.text || "";
        } else if (id.startsWith("place")) {
          city = item.text || "";
        } else if (id.startsWith("region")) {
          state = item.text || "";
        } else if (id.startsWith("postcode")) {
          zipCode = item.text || "";
        } else if (id.startsWith("district") && !city) {
          city = item.text || "";
        } else if (id.startsWith("locality") && !city) {
          city = item.text || "";
        }
      });
      
      if (!street && result.properties && result.properties.address) {
        street = result.properties.address;
      } else if (!street && result.text) {
        street = result.text;
      }
      
      // Merge with fetched address, preferring Google's data
      if (address) {
        address.street = address.street || street || "";
        address.city = address.city || city || "";
        address.state = address.state || state || "";
        address.zipCode = address.zipCode || zipCode || "";
        address.fullAddress = address.fullAddress || placeName || "";
      } else {
        address = {
          street: street || "",
          city: city || "",
          state: state || "",
          zipCode: zipCode || "",
          fullAddress: placeName || "",
        };
      }
    }
    
    // Pass address to parent component
    if (onLocationSelect) {
      onLocationSelect(lat, lng, address);
    }
    
    // Add/update marker
    if (marker.current) {
      marker.current.remove();
    }
    marker.current = new mapboxgl.Marker({
      draggable: true,
      color: "#6366f1",
    })
      .setLngLat([lng, lat])
      .addTo(map.current);

    // Zoom to location
    if (map.current) {
      map.current.flyTo({
        center: [lng, lat],
        zoom: 16,
        duration: 1000,
      });
    }
  };

  const handleUseMyLocation = () => {
    setIsLocating(true);
    if (geolocateControl.current) {
      try {
        geolocateControl.current.trigger();
      } catch (error) {
        console.log("Error triggering geolocate:", error);
        // Fallback to browser geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const newLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              setSelectedLocation(newLocation);
              if (onLocationSelect) {
                onLocationSelect(newLocation.lat, newLocation.lng);
              }
              
              // Add marker only if map is ready
              if (map.current) {
                if (marker.current) {
                  marker.current.remove();
                }
                marker.current = new mapboxgl.Marker({
                  draggable: true,
                  color: "#6366f1",
                })
                  .setLngLat([newLocation.lng, newLocation.lat])
                  .addTo(map.current);
                
                // Zoom to location
                map.current.flyTo({
                  center: [newLocation.lng, newLocation.lat],
                  zoom: 15,
                  duration: 1000,
                });
              }
              setIsLocating(false);
            },
            async (error) => {
              console.log("Geolocation error:", error);
              await fallbackToApproximateLocation(true);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
            }
          );
        } else {
          fallbackToApproximateLocation(true);
        }
      }
    } else {
      // Fallback if geolocate control not available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setSelectedLocation(newLocation);
            if (onLocationSelect) {
              onLocationSelect(newLocation.lat, newLocation.lng);
            }
            
            if (map.current) {
              if (marker.current) {
                marker.current.remove();
              }
              marker.current = new mapboxgl.Marker({
                draggable: true,
                color: "#6366f1",
              })
                .setLngLat([newLocation.lng, newLocation.lat])
                .addTo(map.current);
              
              map.current.flyTo({
                center: [newLocation.lng, newLocation.lat],
                zoom: 15,
                duration: 1000,
              });
            }
            setIsLocating(false);
          },
          async (error) => {
            console.log("Geolocation error:", error);
            await fallbackToApproximateLocation(true);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
          }
        );
      } else {
        fallbackToApproximateLocation(true);
      }
    }
  };

  const handleConfirm = async () => {
    if (selectedLocation.lat && selectedLocation.lng && onLocationSelect) {
      // Ensure we pass numbers, not strings
      const lat = typeof selectedLocation.lat === 'number' 
        ? selectedLocation.lat 
        : parseFloat(selectedLocation.lat);
      const lng = typeof selectedLocation.lng === 'number' 
        ? selectedLocation.lng 
        : parseFloat(selectedLocation.lng);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        // Fetch full address before confirming
        const address = await fetchFullAddress(lat, lng);
        onLocationSelect(lat, lng, address);
        // Show confirmation feedback
        console.log('Location confirmed:', { lat, lng, address });
      } else {
        alert('Invalid location coordinates. Please select a location on the map.');
        return;
      }
    } else {
      alert('Please select a location on the map before confirming.');
      return;
    }
    if (onClose) {
      onClose();
    }
  };

  // Always render the modal, even if map isn't ready
  return (
    <div className="map-location-picker-overlay" onClick={onClose}>
      <div className="map-location-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="map-location-picker-header">
          <h3>Pick Your Business Location</h3>
          <button className="map-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="map-location-picker-instructions">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
            <p style={{ margin: 0, flex: 1, minWidth: "200px" }}>Search for a place, click on the map, or use the button to find your current position.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUseMyLocation}
              disabled={isLocating}
              style={{ 
                padding: "8px 16px", 
                fontSize: "0.85rem",
                whiteSpace: "nowrap"
              }}
            >
              {isLocating ? "📍 Locating..." : "📍 Use My Location"}
            </button>
          </div>
          {selectedLocation.lat && selectedLocation.lng && (
            <div className="selected-coordinates" style={{ marginTop: "8px" }}>
              {selectedPlaceName && (
                <div style={{ marginBottom: "4px", fontWeight: "500", color: "#6366f1" }}>
                  📍 {selectedPlaceName}
                </div>
              )}
              <div style={{ display: "flex", gap: "16px", fontSize: "0.85rem", color: "#94a3b8" }}>
                <span>Lat: {selectedLocation.lat.toFixed(6)}</span>
                <span>Lng: {selectedLocation.lng.toFixed(6)}</span>
              </div>
            </div>
          )}
        </div>
        <div className="map-location-picker-container">
          {/* Search Box */}
          <div className="map-search-container">
            <input
              type="text"
              className="map-search-input"
              placeholder="🔍 Search for places, addresses..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              onFocus={() => {
                if (searchResults.length > 0) {
                  setShowSearchResults(true);
                }
              }}
              onBlur={() => {
                // Delay hiding to allow click on results
                setTimeout(() => setShowSearchResults(false), 200);
              }}
            />
            {showSearchResults && (
              <div className="map-search-results">
                {searchResults.length > 0 ? (
                  searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="map-search-result-item"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent input blur
                        handleSearchResultClick(result);
                      }}
                    >
                      <div className="map-search-result-name">
                        {result.text || result.place_name}
                      </div>
                      {result.place_name && result.place_name !== result.text && (
                        <div className="map-search-result-address">
                          {result.place_name}
                        </div>
                      )}
                    </div>
                  ))
                ) : searchAttempted && searchQuery.length >= 2 ? (
                  <div className="map-search-result-item" style={{ 
                    color: "#94a3b8", 
                    fontStyle: "italic",
                    cursor: "default",
                    textAlign: "center"
                  }}>
                    No locations found for "{searchQuery}". Try clicking on the map or using "Use My Location".
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {mapError ? (
            <div className="map-loading">
              <div style={{ fontSize: "3rem", marginBottom: "16px" }}>⚠️</div>
              <p style={{ color: "#f87171", marginBottom: "8px" }}>{mapError}</p>
              <p style={{ color: "#cbd5e1", fontSize: "0.85rem", textAlign: "center", maxWidth: "500px" }}>
                Get your free Mapbox token at{" "}
                <a
                  href="https://account.mapbox.com/access-tokens/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#6366f1", textDecoration: "underline" }}
                >
                  mapbox.com
                </a>
                {" "}and add it to your .env file as REACT_APP_MAPBOX_TOKEN
              </p>
            </div>
          ) : (
            <>
              {isLoading && (
                <div className="map-loading">
                  <div className="map-spinner"></div>
                  <p>Loading map...</p>
                </div>
              )}
              <div ref={mapContainer} className="map-container" />
            </>
          )}
        </div>
        <div className="map-location-picker-actions">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={!selectedLocation.lat || !selectedLocation.lng}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapLocationPicker;
