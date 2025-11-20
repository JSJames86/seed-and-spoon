/**
 * MapComponent.jsx
 *
 * Actual Leaflet map implementation - separated for Next.js SSR handling
 */

'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapComponent({ foodBanks, onResourceSelect }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Initialize map
  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return; // Already initialized or ref not ready

    try {
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
      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
    };
  }, []);

  // Update markers when food banks change
  useEffect(() => {
    if (!mapInstanceRef.current || !foodBanks || foodBanks.length === 0) return;

    try {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        try {
          marker.remove();
        } catch (e) {
          console.warn('Error removing marker:', e);
        }
      });
      markersRef.current = [];

      // Add new markers for each food bank
      foodBanks.forEach(bank => {
        try {
          const lat = parseFloat(bank.latitude);
          const lng = parseFloat(bank.longitude);

          if (isNaN(lat) || isNaN(lng)) {
            console.warn('Invalid coordinates for bank:', bank.name);
            return;
          }

          const marker = L.marker([lat, lng])
            .addTo(mapInstanceRef.current)
            .bindPopup(createPopupContent(bank));

          // Add click handler if callback provided
          if (onResourceSelect) {
            marker.on('click', () => {
              onResourceSelect(bank);
            });
          }

          markersRef.current.push(marker);
        } catch (error) {
          console.error('Error creating marker for bank:', bank.name, error);
        }
      });

      console.log(`Added ${markersRef.current.length} markers to map`);

      // Fit bounds to show all markers
      if (markersRef.current.length > 0) {
        try {
          const group = L.featureGroup(markersRef.current);
          mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
        } catch (error) {
          console.warn('Error fitting bounds:', error);
        }
      }
    } catch (error) {
      console.error('Error updating markers:', error);
    }
  }, [foodBanks, onResourceSelect]);

  const createPopupContent = (bank) => {
    const escapeHtml = (text) => {
      if (!text) return '';
      return text.replace(/&/g, '&amp;')
                 .replace(/</g, '&lt;')
                 .replace(/>/g, '&gt;')
                 .replace(/"/g, '&quot;')
                 .replace(/'/g, '&#039;');
    };

    return `
      <div style="min-width: 200px; padding: 8px; max-width: 300px;">
        <strong style="font-size: 16px;">${escapeHtml(bank.name)}</strong>
        <br /><br />
        <strong>Address:</strong><br />
        ${escapeHtml(bank.address)}<br />
        ${escapeHtml(bank.city)}, ${escapeHtml(bank.county)}<br />
        <br />
        ${bank.phone ? `<strong>Phone:</strong> <a href="tel:${escapeHtml(bank.phone)}">${escapeHtml(bank.phone)}</a><br />` : ''}
        ${bank.hours ? `<strong>Hours:</strong><br />${escapeHtml(bank.hours).replace(/\n/g, '<br />')}<br />` : ''}
        ${bank.service_type ? `<br /><em>${escapeHtml(bank.service_type)}</em>` : ''}
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
