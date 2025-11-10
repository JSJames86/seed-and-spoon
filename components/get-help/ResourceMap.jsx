/**
 * Resource Map Component
 *
 * Interactive map showing food resources with filtering
 * Uses Leaflet for mapping
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { formatTime, getTodayHours, isOpenNow } from '@/lib/hours-utils';
import { NJ_COUNTIES } from '@/lib/validation';

// Leaflet CSS needs to be imported
import 'leaflet/dist/leaflet.css';

// Type icons
const TYPE_ICONS = {
  food_pantry: '🛒',
  hot_meal: '🍲',
  mobile_pantry: '🚚',
  community_fridge: '❄️',
  other: '🏪',
};

const TYPE_LABELS = {
  food_pantry: 'Food Pantry',
  hot_meal: 'Hot Meal Site',
  mobile_pantry: 'Mobile Pantry',
  community_fridge: 'Community Fridge',
  other: 'Other',
};

export default function ResourceMap({
  filters = {},
  onFilterChange,
  selectedResource,
  onResourceSelect
}) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Fetch resources from API
  const fetchResources = async (currentFilters = filters) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (currentFilters.county) params.append('county', currentFilters.county);
      if (currentFilters.type) params.append('type', currentFilters.type);
      if (currentFilters.service) params.append('service', currentFilters.service);
      if (currentFilters.openNow) params.append('openNow', 'true');
      if (currentFilters.zip) params.append('zip', currentFilters.zip);
      if (userLocation) {
        params.append('lat', userLocation.lat);
        params.append('lng', userLocation.lng);
        params.append('radiusKm', '50');
      }

      const response = await fetch(`/api/resources?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load resources');
      }

      setResources(data.resources || []);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || mapInstanceRef.current) return;

    const initMap = async () => {
      // Dynamic import of Leaflet to avoid SSR issues
      const L = (await import('leaflet')).default;

      // Fix for default marker icons in production
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Create map centered on New Jersey
      const map = L.map(mapRef.current).setView([40.0583, -74.4057], 9);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when resources change
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers
      resources.forEach(resource => {
        if (!resource.address?.zip) return; // Skip resources without location

        // For now, we'll use a simple lat/lng based on county
        // In production, you'd use actual geocoded coordinates from resource.location
        const coords = resource.location?.coordinates
          ? [resource.location.coordinates[1], resource.location.coordinates[0]]
          : getCountyCenter(resource.county);

        if (!coords) return;

        // Create custom icon based on type
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div class="flex items-center justify-center w-10 h-10 bg-green-700 text-white rounded-full shadow-lg border-2 border-white text-xl">
              ${TYPE_ICONS[resource.type] || '📍'}
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });

        const marker = L.marker(coords, { icon })
          .addTo(mapInstanceRef.current)
          .bindPopup(createPopupContent(resource));

        marker.on('click', () => {
          if (onResourceSelect) {
            onResourceSelect(resource);
          }
        });

        markersRef.current.push(marker);
      });

      // Fit bounds to show all markers
      if (markersRef.current.length > 0) {
        const group = L.featureGroup(markersRef.current);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    };

    updateMarkers();
  }, [resources, onResourceSelect]);

  // Fetch resources on mount and when filters change
  useEffect(() => {
    fetchResources(filters);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get user location
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);

        // Center map on user location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([location.lat, location.lng], 12);
        }

        // Fetch resources near user
        fetchResources({ ...filters, lat: location.lat, lng: location.lng });
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please check your browser settings.');
      }
    );
  };

  const createPopupContent = (resource) => {
    const todayHours = getTodayHours(resource.hours);
    const openNow = isOpenNow(resource.hours);

    return `
      <div class="p-2 min-w-[200px]">
        <h3 class="font-semibold text-lg mb-2">${resource.name}</h3>
        <div class="text-sm space-y-1">
          <p class="text-gray-600">
            <strong>Type:</strong> ${TYPE_LABELS[resource.type] || resource.type}
          </p>
          <p class="text-gray-600">
            <strong>Address:</strong><br/>
            ${resource.address.street || ''}<br/>
            ${resource.address.city}, ${resource.address.state} ${resource.address.zip}
          </p>
          ${todayHours ? `
            <p class="text-gray-600">
              <strong>Today:</strong> ${formatTime(todayHours.open)} - ${formatTime(todayHours.close)}
              ${openNow ? '<span class="text-green-700 font-semibold">• Open Now</span>' : ''}
            </p>
          ` : ''}
          ${resource.contact?.phone ? `
            <p class="text-gray-600">
              <strong>Phone:</strong> <a href="tel:${resource.contact.phone}" class="text-blue-600">${resource.contact.phone}</a>
            </p>
          ` : ''}
          ${resource.distanceMiles ? `
            <p class="text-gray-600">
              <strong>Distance:</strong> ${resource.distanceMiles} miles away
            </p>
          ` : ''}
        </div>
        ${resource.contact?.website ? `
          <a href="${resource.contact.website}" target="_blank" rel="noopener noreferrer" class="mt-2 inline-block text-blue-600 hover:underline text-sm">
            Visit Website →
          </a>
        ` : ''}
      </div>
    `;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-3">Filter Resources</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">County</label>
            <select
              value={filters.county || ''}
              onChange={(e) => onFilterChange({ ...filters, county: e.target.value || undefined })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-700"
            >
              <option value="">All Counties</option>
              {NJ_COUNTIES.map(county => (
                <option key={county} value={county}>{county}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={filters.type || ''}
              onChange={(e) => onFilterChange({ ...filters, type: e.target.value || undefined })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-700"
            >
              <option value="">All Types</option>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ZIP Code</label>
            <input
              type="text"
              placeholder="e.g., 07001"
              value={filters.zip || ''}
              onChange={(e) => onFilterChange({ ...filters, zip: e.target.value || undefined })}
              maxLength={5}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-700"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.openNow || false}
              onChange={(e) => onFilterChange({ ...filters, openNow: e.target.checked || undefined })}
              className="mr-2 h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-700"
            />
            <span className="text-sm">Open Now</span>
          </label>

          <button
            onClick={handleGeolocate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            📍 Use My Location
          </button>

          {(filters.county || filters.type || filters.zip || filters.openNow) && (
            <button
              onClick={() => onFilterChange({})}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="mt-3 text-sm text-gray-600">
          {loading ? 'Loading resources...' : `Showing ${resources.length} resource${resources.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Map */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {error && (
          <div className="absolute top-4 left-4 right-4 z-[1000] bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div
          ref={mapRef}
          className="w-full h-[500px] md:h-[600px]"
          style={{ zIndex: 1 }}
        />

        {loading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center z-[1000]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h4 className="font-semibold mb-2 text-sm">Map Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
          {Object.entries(TYPE_LABELS).map(([type, label]) => (
            <div key={type} className="flex items-center">
              <span className="text-lg mr-2">{TYPE_ICONS[type]}</span>
              <span className="text-gray-600 dark:text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper to get approximate county centers (fallback for resources without geocoded locations)
function getCountyCenter(county) {
  const centers = {
    'Atlantic': [39.3643, -74.4229],
    'Bergen': [40.9263, -74.0776],
    'Burlington': [39.8738, -74.6796],
    'Camden': [39.8062, -74.9382],
    'Cape May': [39.0854, -74.9104],
    'Cumberland': [39.3844, -75.1552],
    'Essex': [40.7863, -74.2596],
    'Gloucester': [39.7084, -75.1196],
    'Hudson': [40.7453, -74.0632],
    'Hunterdon': [40.5649, -74.9176],
    'Mercer': [40.2752, -74.7175],
    'Middlesex': [40.4394, -74.4121],
    'Monmouth': [40.2927, -74.2051],
    'Morris': [40.8576, -74.4742],
    'Ocean': [39.9527, -74.2827],
    'Passaic': [40.9989, -74.2965],
    'Salem': [39.5721, -75.3904],
    'Somerset': [40.5642, -74.6127],
    'Sussex': [41.1387, -74.6877],
    'Union': [40.6573, -74.3074],
    'Warren': [40.8465, -75.0288],
  };

  return centers[county] || [40.0583, -74.4057]; // Default to center of NJ
}
