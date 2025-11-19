/**
 * Resource Map Component
 *
 * Interactive map showing food bank locations from Django backend
 * Uses Leaflet for mapping
 */

'use client';

import { useEffect, useState, useRef } from 'react';

// Leaflet CSS needs to be imported
import 'leaflet/dist/leaflet.css';

export default function ResourceMap() {
  // Backend API configuration
  const API_BASE_URL = "https://seed-spoon-backend.onrender.com";

  // State for food banks
  const [foodBanks, setFoodBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Fetch food banks from Django backend
  useEffect(() => {
    async function fetchFoodBanks() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/foodbanks/`);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Handle both array and paginated responses
        const banks = Array.isArray(data) ? data : data.results || [];

        // Filter only banks with valid coordinates
        const banksWithCoords = banks.filter(
          bank => bank.latitude && bank.longitude &&
                  !isNaN(bank.latitude) && !isNaN(bank.longitude)
        );

        setFoodBanks(banksWithCoords);
        console.log(`Loaded ${banksWithCoords.length} food banks with coordinates`);

      } catch (err) {
        console.error("Error loading food banks:", err);
        setError(`Failed to load food banks: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchFoodBanks();
  }, []);

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

  // Update markers when food banks are loaded
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined' || !foodBanks.length) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers for each food bank
      foodBanks.forEach(bank => {
        const marker = L.marker([parseFloat(bank.latitude), parseFloat(bank.longitude)])
          .addTo(mapInstanceRef.current)
          .bindPopup(createPopupContent(bank));

        markersRef.current.push(marker);
      });

      // Fit bounds to show all markers
      if (markersRef.current.length > 0) {
        const group = L.featureGroup(markersRef.current);
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    };

    updateMarkers();
  }, [foodBanks]);

  const createPopupContent = (bank) => {
    return `
      <div style="min-width: 200px; padding: 8px;">
        <strong style="font-size: 16px;">${bank.name}</strong>
        <br /><br />
        <strong>Address:</strong><br />
        ${bank.address}<br />
        ${bank.city}, ${bank.county}<br />
        <br />
        ${bank.phone ? `<strong>Phone:</strong> ${bank.phone}<br />` : ''}
        ${bank.hours ? `<strong>Hours:</strong><br />${bank.hours.replace(/\n/g, '<br />')}<br />` : ''}
        ${bank.service_type ? `<br /><em>${bank.service_type}</em>` : ''}
      </div>
    `;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading food bank locations...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-8 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg shadow text-center">
        <p className="text-red-800 dark:text-red-300 font-semibold mb-2">{error}</p>
        <p className="text-red-600 dark:text-red-400">Please try refreshing the page.</p>
      </div>
    );
  }

  // Render map with markers
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Food Bank Locations</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {foodBanks.length} location{foodBanks.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div
          ref={mapRef}
          className="w-full h-[500px] md:h-[600px]"
        />
      </div>
    </div>
  );
}
