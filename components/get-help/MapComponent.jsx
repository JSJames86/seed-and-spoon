/**
 * MapComponent.jsx
 *
 * Actual Leaflet map implementation - separated for Next.js SSR handling
 */

'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapComponent({ foodBanks }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Initialize map
  useEffect(() => {
    if (mapInstanceRef.current) return; // Already initialized

    // Fix for default marker icons
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

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when food banks change
  useEffect(() => {
    if (!mapInstanceRef.current || !foodBanks.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers for each food bank
    foodBanks.forEach(bank => {
      const lat = parseFloat(bank.latitude);
      const lng = parseFloat(bank.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      const marker = L.marker([lat, lng])
        .addTo(mapInstanceRef.current)
        .bindPopup(createPopupContent(bank));

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div
        ref={mapRef}
        className="w-full h-[500px] md:h-[600px]"
      />
    </div>
  );
}
