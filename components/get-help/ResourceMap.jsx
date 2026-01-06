/**
 * Resource Map Component
 *
 * Interactive map showing food bank locations from Supabase database
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
      <div className="flex items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    )
  }
);

export default function ResourceMap({
  filters = {},
  onFilterChange,
  selectedResource,
  onResourceSelect
}) {
  // State for food banks
  const [foodBanks, setFoodBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch food banks from Next.js API route (which queries Supabase)
  useEffect(() => {
    if (!isMounted) return;

    async function fetchFoodBanks() {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching food banks from Next.js API proxy...');

        const response = await fetch('/api/foodbanks', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

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
  }, [isMounted]);

  // Don't render anything on server
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow min-h-[600px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow min-h-[600px]">
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
      <div className="space-y-4">
        <div className="p-8 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg shadow text-center">
          <p className="text-red-800 dark:text-red-300 font-semibold mb-2">{error}</p>
          <p className="text-red-600 dark:text-red-400 mb-4">
            Unable to connect to the database. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show message if no food banks found
  if (foodBanks.length === 0) {
    return (
      <div className="space-y-4">
        <div className="p-8 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg shadow text-center">
          <p className="text-yellow-800 dark:text-yellow-300 font-semibold mb-2">
            No food banks found
          </p>
          <p className="text-yellow-600 dark:text-yellow-400">
            The backend API returned no food bank locations with valid coordinates.
          </p>
        </div>
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

      <DynamicMap
        foodBanks={foodBanks}
        onResourceSelect={onResourceSelect}
      />
    </div>
  );
}
