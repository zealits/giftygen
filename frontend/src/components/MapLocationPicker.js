import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./MapLocationPicker.css";

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

 
  const MAPBOX_TOKEN = "pk.eyJ1IjoiYW5pa2V0MTciLCJhIjoiY2xlZ3FwOW02MGJ0NTN4bWNhMXBqY25lcCJ9.qjfXDd_p2yjXQz3wa2w2UQ";
  
  // Get Google Maps API key from environment
  // To get your Google Maps API key: https://console.cloud.google.com/google/maps-apis
  // Add REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here to frontend/.env file
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
  
  const [mapError, setMapError] = useState(null);

  // Function to fetch address from Google Maps Geocoding API (PRIMARY - More Accurate)
  const fetchAddressFromGoogle = useCallback(async (lat, lng) => {
    if (!GOOGLE_MAPS_API_KEY) {
      console.log("Google Maps API key not configured. Using Mapbox as fallback.");
      return null;
    }
    
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=en&result_type=street_address|route|premise|subpremise|locality|administrative_area_level_1|postal_code`
      );
      const data = await response.json();
      
      if (data.status === "OK" && data.results && data.results.length > 0) {
        // Use the first result which is usually the most accurate
        const result = data.results[0];
        const placeName = result.formatted_address || "";
        setSelectedPlaceName(placeName);
        
        // Parse address components from Google's response
        let streetNumber = "";
        let route = "";
        let city = "";
        let state = "";
        let zipCode = "";
        let sublocality = "";
        
        result.address_components.forEach((component) => {
          const types = component.types || [];
          
          if (types.includes("street_number")) {
            streetNumber = component.long_name || component.short_name || "";
          } else if (types.includes("route")) {
            route = component.long_name || component.short_name || "";
          } else if (types.includes("sublocality") || types.includes("sublocality_level_1") || types.includes("sublocality_level_2")) {
            if (!sublocality) {
              sublocality = component.long_name || component.short_name || "";
            }
          } else if (types.includes("locality")) {
            city = component.long_name || component.short_name || "";
          } else if (types.includes("administrative_area_level_2") && !city) {
            city = component.long_name || component.short_name || "";
          } else if (types.includes("administrative_area_level_1")) {
            state = component.long_name || component.short_name || "";
          } else if (types.includes("postal_code")) {
            zipCode = component.long_name || component.short_name || "";
          }
        });
        
        // Combine street number and route for complete street address
        let street = "";
        if (streetNumber && route) {
          street = `${streetNumber} ${route}`.trim();
        } else if (route) {
          street = route;
        } else if (streetNumber) {
          street = streetNumber;
        }
        
        // If street is still empty, extract from formatted_address
        if (!street && placeName) {
          const parts = placeName.split(",");
          if (parts.length > 0) {
            // Take the first part which is usually the street address
            street = parts[0].trim();
          }
        }
        
        // Use sublocality if city is not available
        if (!city && sublocality) {
          city = sublocality;
        }
        
        console.log("Google Maps address fetched:", { street, city, state, zipCode, fullAddress: placeName });
        
        return {
          street: street || "",
          city: city || "",
          state: state || "",
          zipCode: zipCode || "",
          fullAddress: placeName || "",
        };
      } else {
        console.log("Google Maps geocoding returned status:", data.status);
      }
    } catch (error) {
      console.error("Error fetching address from Google Maps:", error);
    }
    return null;
  }, [GOOGLE_MAPS_API_KEY]);

  // Function to fetch address from Mapbox (fallback)
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
        
        // Parse address components from context
        const context = feature.context || [];
        let street = "";
        let city = "";
        let state = "";
        let zipCode = "";
        
        // Extract address components from context array
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
        
        // If street is not in context, try to get it from properties or feature text
        if (!street && feature.properties && feature.properties.address) {
          street = feature.properties.address;
        } else if (!street && feature.text) {
          street = feature.text;
        }
        
        // If city is not found, try to extract from place_name
        if (!city && placeName) {
          const parts = placeName.split(",");
          if (parts.length > 1) {
            city = parts[parts.length - 2]?.trim() || "";
          }
        }
        
        return {
          street: street || "",
          city: city || "",
          state: state || "",
          zipCode: zipCode || "",
          fullAddress: placeName || "",
        };
      }
    } catch (error) {
      console.log("Error fetching address from Mapbox:", error);
    }
    return null;
  }, [MAPBOX_TOKEN]);

  // Main function to fetch full address details - ALWAYS tries Google first (more accurate), then Mapbox as fallback
  const fetchFullAddress = useCallback(async (lat, lng) => {
    // ALWAYS try Google Maps first (more accurate address data)
    let address = await fetchAddressFromGoogle(lat, lng);
    
    // Only use Mapbox as fallback if Google completely fails or returns no data
    if (!address) {
      console.log("Google Maps failed, trying Mapbox as fallback...");
      const mapboxAddress = await fetchAddressFromMapbox(lat, lng);
      if (mapboxAddress) {
        address = mapboxAddress;
        console.log("Using Mapbox address as fallback:", address);
      }
    } else {
      // Google Maps succeeded - use it exclusively (don't merge with Mapbox)
      console.log("Using Google Maps address (more accurate):", address);
    }
    
    return address;
  }, [fetchAddressFromGoogle, fetchAddressFromMapbox]);

  useEffect(() => {
    // Check for required API keys
    if (!MAPBOX_TOKEN) {
      setMapError("Mapbox token not configured. Please add REACT_APP_MAPBOX_TOKEN to your .env file.");
      setIsLoading(false);
      return;
    }
    
    // Warn if Google Maps API key is not set (addresses will be less accurate)
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn("Google Maps API key not configured. Address accuracy may be reduced. Add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file for better address data.");
    }

    if (!mapContainer.current) {
      console.log("Map container not ready yet");
      return;
    }

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
      });

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

      // Helper function to handle location update (defined before use)
      const updateLocationFromCoords = async (lat, lng) => {
        const newLocation = { lat, lng };
        setSelectedLocation(newLocation);

        // Fetch full address
        const address = await fetchFullAddress(lat, lng);
        if (onLocationSelect) {
          onLocationSelect(lat, lng, address);
        }

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
            const address = await fetchFullAddress(updatedLocation.lat, updatedLocation.lng);
            if (onLocationSelect) {
              onLocationSelect(updatedLocation.lat, updatedLocation.lng, address);
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
      };

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
        // Fallback to browser geolocation API
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              updateLocationFromCoords(position.coords.latitude, position.coords.longitude);
              setIsLocating(false);
            },
            (error) => {
              console.log("Browser geolocation also failed:", error.message);
              setIsLocating(false);
              alert("Could not access your location. Please allow location access in your browser settings or click on the map to set your location manually.");
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            }
          );
        }
      });

      map.current.on("load", () => {
        setIsLoading(false);
        
        // Automatically trigger geolocation if no initial location is provided
        if (!latitude || !longitude) {
          // Small delay to ensure map is fully loaded
          setTimeout(() => {
            // Programmatically trigger the geolocate control
            try {
              geolocate.trigger();
            } catch (error) {
              console.log("Could not auto-trigger geolocate:", error);
            }
          }, 500);
        }
      });

    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize map. Please check your Mapbox token.");
      setIsLoading(false);
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [latitude, longitude, MAPBOX_TOKEN, GOOGLE_MAPS_API_KEY, fetchFullAddress]);

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
      return;
    }

    // Debounce search to avoid too many API calls
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&types=poi,address,place&limit=5`
        );
        const data = await response.json();
        if (data.features) {
          setSearchResults(data.features);
          setShowSearchResults(true);
        }
      } catch (error) {
        console.log("Search error:", error);
      }
    }, 300); // 300ms debounce
  };

  const handleSearchResultClick = async (result) => {
    const [lng, lat] = result.center;
    const placeName = result.place_name || result.text || "";
    
    setSelectedPlaceName(placeName);
    setSearchQuery(placeName);
    setShowSearchResults(false);
    
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
            (error) => {
              console.log("Geolocation error:", error);
              setIsLocating(false);
              alert("Could not access your location. Please allow location access in your browser settings.");
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
            }
          );
        } else {
          setIsLocating(false);
          alert("Geolocation is not supported by your browser.");
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
          (error) => {
            console.log("Geolocation error:", error);
            setIsLocating(false);
            alert("Could not access your location. Please allow location access in your browser settings.");
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
          }
        );
      } else {
        setIsLocating(false);
        alert("Geolocation is not supported by your browser.");
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
            {showSearchResults && searchResults.length > 0 && (
              <div className="map-search-results">
                {searchResults.map((result, index) => (
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
                ))}
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
