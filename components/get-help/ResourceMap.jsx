/**
 * Resource Map Component
 *
 * Interactive map showing food bank locations from Django backend
 * Uses Leaflet for mapping with proper Next.js SSR handling
 */

'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map component with SSR disabled
const DynamicMap = dynamic(
  () => import('./MapComponent'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    )
  }
);

export default function ResourceMap() {
  // Backend API configuration
  const API_BASE_URL = "https://seed-spoon-backend.onrender.com";

  // State for food banks
  const [foodBanks, setFoodBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
                  !isNaN(parseFloat(bank.latitude)) && !isNaN(parseFloat(bank.longitude))
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

      <DynamicMap foodBanks={foodBanks} />
    </div>
  );
}
