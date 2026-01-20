/**
 * MapComponent.jsx
 *
 * Interactive Leaflet map with food bank markers and styled card popups.
 * Uses react-leaflet for React integration with Supabase backend data.
 *
 * Features:
 * - Card-styled popups with food bank details
 * - Call button (tel: link) with green-glow hover
 * - Get Directions button (Google Maps) with orange-glow hover
 * - Loading states for markers
 * - Full accessibility support
 * - Responsive design (mobile/desktop)
 * - Dark mode support
 */

'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet + Webpack/Next.js
const DefaultIcon = L.icon({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom green marker for food banks
const FoodBankIcon = L.icon({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'leaflet-marker-icon-green',
});

L.Marker.prototype.options.icon = DefaultIcon;

/**
 * Component to fit map bounds to all markers
 */
function FitBoundsToMarkers({ foodBanks }) {
  const map = useMap();

  useEffect(() => {
    if (!foodBanks || foodBanks.length === 0) return;

    try {
      const validBanks = foodBanks.filter(bank => {
        const lat = parseFloat(bank.latitude);
        const lng = parseFloat(bank.longitude);
        return !isNaN(lat) && !isNaN(lng);
      });

      if (validBanks.length === 0) return;

      const bounds = L.latLngBounds(
        validBanks.map(bank => [parseFloat(bank.latitude), parseFloat(bank.longitude)])
      );

      map.fitBounds(bounds.pad(0.1), {
        maxZoom: 14,
        animate: true,
        duration: 0.5,
      });
    } catch (error) {
      console.warn('Error fitting bounds to markers:', error);
    }
  }, [map, foodBanks]);

  return null;
}

/**
 * Loading skeleton for individual markers
 */
function MarkerLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-pulse flex flex-col space-y-2 w-full">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="flex space-x-2 mt-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Card-styled popup content for food bank markers
 */
function FoodBankPopupCard({ bank, onSelect }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate brief loading for smooth transition
    const timer = setTimeout(() => setIsLoading(false), 150);
    return () => clearTimeout(timer);
  }, []);

  // Build Google Maps directions URL
  const getDirectionsUrl = useCallback(() => {
    const address = encodeURIComponent(bank.address || '');
    return `https://www.google.com/maps/dir/?api=1&destination=${address}`;
  }, [bank.address]);

  // Format phone for tel: link
  const formatPhoneLink = useCallback((phone) => {
    if (!phone) return null;
    // Remove all non-numeric characters except +
    return phone.replace(/[^\d+]/g, '');
  }, []);

  const handleCallClick = useCallback((e) => {
    // Allow default tel: behavior
    if (onSelect) onSelect(bank);
  }, [bank, onSelect]);

  const handleDirectionsClick = useCallback((e) => {
    if (onSelect) onSelect(bank);
  }, [bank, onSelect]);

  if (isLoading) {
    return <MarkerLoadingSkeleton />;
  }

  const phoneLink = formatPhoneLink(bank.phone);

  return (
    <div
      className="min-w-[260px] max-w-[320px] p-0 -m-[13px] -mt-[14px]"
      role="article"
      aria-label={`Food bank: ${bank.name}`}
    >
      {/* Card Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Card Header */}
        <div className="px-4 pt-4 pb-2">
          <h3
            className="font-bold text-lg text-green-primary dark:text-green-leaf-light leading-tight"
            id={`popup-title-${bank.id}`}
          >
            {bank.name}
          </h3>
        </div>

        {/* Card Body */}
        <div className="px-4 pb-3">
          {/* Address */}
          {bank.address && (
            <address className="not-italic text-sm text-gray-600 dark:text-gray-300 mb-3">
              <p className="leading-relaxed">{bank.address}</p>
            </address>
          )}

          {/* Hours (optional) */}
          {bank.hours && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 border-t border-gray-100 dark:border-gray-700 pt-2">
              <span className="font-medium">Hours:</span>
              <p className="whitespace-pre-line mt-1">{bank.hours}</p>
            </div>
          )}
        </div>

        {/* Card Footer - Action Buttons */}
        <div className="px-4 pb-4 flex flex-col sm:flex-row gap-2">
          {/* Call Button */}
          {phoneLink && (
            <a
              href={`tel:${phoneLink}`}
              onClick={handleCallClick}
              className="
                flex-1 inline-flex items-center justify-center gap-2
                px-4 py-2.5
                bg-green-primary hover:bg-green-700
                text-white font-medium text-sm
                rounded-lg
                transition-all duration-200
                hover:shadow-green-glow
                focus:outline-none focus:ring-2 focus:ring-green-primary focus:ring-offset-2
                dark:focus:ring-offset-gray-800
              "
              aria-label={`Call ${bank.name} at ${bank.phone}`}
            >
              {/* Phone Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Call
            </a>
          )}

          {/* Get Directions Button */}
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDirectionsClick}
            className="
              flex-1 inline-flex items-center justify-center gap-2
              px-4 py-2.5
              bg-orange-primary hover:bg-orange-500
              text-white font-medium text-sm
              rounded-lg
              transition-all duration-200
              hover:shadow-orange-glow
              focus:outline-none focus:ring-2 focus:ring-orange-primary focus:ring-offset-2
              dark:focus:ring-offset-gray-800
            "
            aria-label={`Get directions to ${bank.name}`}
          >
            {/* Directions Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            Get Directions
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Individual food bank marker with popup
 */
function FoodBankMarker({ bank, onResourceSelect }) {
  const position = useMemo(() => {
    const lat = parseFloat(bank.latitude);
    const lng = parseFloat(bank.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return null;
    }

    return [lat, lng];
  }, [bank.latitude, bank.longitude]);

  if (!position) {
    return null;
  }

  return (
    <Marker
      position={position}
      icon={FoodBankIcon}
      eventHandlers={{
        click: () => {
          if (onResourceSelect) {
            onResourceSelect(bank);
          }
        },
      }}
    >
      <Popup
        className="food-bank-popup"
        maxWidth={350}
        minWidth={280}
        autoPan={true}
        autoPanPadding={[50, 50]}
      >
        <FoodBankPopupCard bank={bank} onSelect={onResourceSelect} />
      </Popup>
    </Marker>
  );
}

/**
 * Loading overlay for map initialization
 */
function MapLoadingOverlay({ isVisible }) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-primary mx-auto mb-3"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Loading markers...</p>
      </div>
    </div>
  );
}

/**
 * Main Map Component
 *
 * @param {Object} props
 * @param {Array} props.foodBanks - Array of food bank objects from Supabase
 * @param {Function} props.onResourceSelect - Callback when a food bank is selected
 */
export default function MapComponent({ foodBanks = [], onResourceSelect }) {
  const [mapReady, setMapReady] = useState(false);
  const [markersLoading, setMarkersLoading] = useState(true);
  const mapRef = useRef(null);

  // Center coordinates for New Jersey
  const NJ_CENTER = useMemo(() => [40.0583, -74.4057], []);
  const DEFAULT_ZOOM = 9;

  // Handle map ready state
  useEffect(() => {
    if (mapRef.current) {
      setMapReady(true);
    }
  }, []);

  // Handle markers loading state
  useEffect(() => {
    if (foodBanks && foodBanks.length > 0) {
      // Brief delay for smooth marker loading transition
      const timer = setTimeout(() => {
        setMarkersLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [foodBanks]);

  // Filter valid food banks with coordinates
  const validFoodBanks = useMemo(() => {
    if (!foodBanks || !Array.isArray(foodBanks)) return [];

    return foodBanks.filter(bank => {
      const lat = parseFloat(bank.latitude);
      const lng = parseFloat(bank.longitude);
      return !isNaN(lat) && !isNaN(lng) && bank.name;
    });
  }, [foodBanks]);

  return (
    <div
      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-card overflow-hidden"
      role="region"
      aria-label="Food bank locations map"
    >
      {/* Map Container */}
      <div className="w-full h-[500px] md:h-[600px]">
        <MapContainer
          center={NJ_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          className="h-full w-full z-0"
          ref={mapRef}
          whenReady={() => setMapReady(true)}
        >
          {/* OpenStreetMap Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Fit bounds to show all markers */}
          <FitBoundsToMarkers foodBanks={validFoodBanks} />

          {/* Food Bank Markers */}
          {validFoodBanks.map((bank) => (
            <FoodBankMarker
              key={bank.id || `${bank.latitude}-${bank.longitude}`}
              bank={bank}
              onResourceSelect={onResourceSelect}
            />
          ))}
        </MapContainer>
      </div>

      {/* Loading Overlay */}
      <MapLoadingOverlay isVisible={markersLoading && validFoodBanks.length > 0} />

      {/* Screen Reader Announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {mapReady && validFoodBanks.length > 0 && (
          <span>
            Map loaded with {validFoodBanks.length} food bank location{validFoodBanks.length !== 1 ? 's' : ''}.
            Click on a marker to view details.
          </span>
        )}
      </div>

      {/* Custom Styles for Leaflet Popup */}
      <style jsx global>{`
        .food-bank-popup .leaflet-popup-content-wrapper {
          padding: 0;
          border-radius: 0.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .food-bank-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }

        .food-bank-popup .leaflet-popup-tip {
          background: white;
        }

        .dark .food-bank-popup .leaflet-popup-content-wrapper {
          background: #1f2937;
        }

        .dark .food-bank-popup .leaflet-popup-tip {
          background: #1f2937;
        }

        /* Green tint for markers (optional enhancement) */
        .leaflet-marker-icon-green {
          filter: hue-rotate(85deg) saturate(1.2);
        }

        /* Ensure popup close button is accessible */
        .food-bank-popup .leaflet-popup-close-button {
          color: #6b7280;
          font-size: 20px;
          padding: 8px;
          width: 28px;
          height: 28px;
          right: 4px;
          top: 4px;
        }

        .food-bank-popup .leaflet-popup-close-button:hover {
          color: #374151;
        }

        .dark .food-bank-popup .leaflet-popup-close-button {
          color: #9ca3af;
        }

        .dark .food-bank-popup .leaflet-popup-close-button:hover {
          color: #d1d5db;
        }
      `}</style>
    </div>
  );
}
