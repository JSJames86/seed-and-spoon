/**
 * County Directory Component
 *
 * Grouped list of food resources by New Jersey county
 * Fetches data from Supabase via Next.js API route
 */

'use client';

import { useState, useEffect } from 'react';

// NJ Counties list
const NJ_COUNTIES = [
  'Atlantic', 'Bergen', 'Burlington', 'Camden', 'Cape May', 'Cumberland',
  'Essex', 'Gloucester', 'Hudson', 'Hunterdon', 'Mercer', 'Middlesex',
  'Monmouth', 'Morris', 'Ocean', 'Passaic', 'Salem', 'Somerset',
  'Sussex', 'Union', 'Warren'
];

export default function CountyDirectory({ filters = {}, onResourceClick }) {
  const [resources, setResources] = useState([]);
  const [groupedResources, setGroupedResources] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCounties, setExpandedCounties] = useState(new Set());

  // Fetch ALL resources from Supabase database
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);

      try {
        let allResources = [];
        let nextUrl = '/api/foodbanks';

        // Fetch all pages
        while (nextUrl) {
          const response = await fetch(nextUrl);
          
          if (!response.ok) {
            throw new Error(`Failed to load resources (${response.status})`);
          }

          const data = await response.json();
          
          // Add results from this page
          if (data.results) {
            allResources = [...allResources, ...data.results];
          } else if (Array.isArray(data)) {
            allResources = data;
          }

          // Get next page URL (will be null if no more pages)
          nextUrl = data.next;
        }

        console.log(`Loaded ${allResources.length} total food banks`);
        setResources(allResources);
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [filters]);

  // Group resources by county
  useEffect(() => {
    const grouped = {};

    // Initialize all counties
    NJ_COUNTIES.forEach(county => {
      grouped[county] = [];
    });

    // Group resources
    resources.forEach(resource => {
      // Extract county name (remove any prefix like "Newark - ")
      let countyName = resource.county || '';
      
      // Handle special formats like "Newark - Central Ward" -> "Essex"
      // Map known patterns to actual counties
      if (countyName.includes('Newark') || countyName.includes('Central Ward') || 
          countyName.includes('East Orange') || countyName.includes('Montclair') || 
          countyName.includes('South Orange') || countyName.includes('West Orange')) {
        countyName = 'Essex';
      } else if (countyName.includes('Bayonne') || countyName.includes('Jersey City')) {
        countyName = 'Hudson';
      }
      
      // Find matching county (case-insensitive)
      const matchedCounty = NJ_COUNTIES.find(c => 
        countyName.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase() === countyName.toLowerCase()
      );

      if (matchedCounty && grouped[matchedCounty]) {
        grouped[matchedCounty].push(resource);
      } else if (countyName && !grouped[countyName]) {
        // Create new group for unlisted county
        grouped[countyName] = [resource];
      } else if (countyName && grouped[countyName]) {
        grouped[countyName].push(resource);
      }
    });

    setGroupedResources(grouped);

    // Auto-expand counties with resources (limit to first 3)
    const countiesWithResources = Object.keys(grouped)
      .filter(county => grouped[county]?.length > 0)
      .slice(0, 3);
    setExpandedCounties(new Set(countiesWithResources));
  }, [resources]);

  const toggleCounty = (county) => {
    setExpandedCounties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(county)) {
        newSet.delete(county);
      } else {
        newSet.add(county);
      }
      return newSet;
    });
  };

  const handleCallClick = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const handleDirectionsClick = (address, city, county) => {
    const query = encodeURIComponent(`${address}, ${city}, NJ`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading directory...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg">
        <p className="font-semibold">Error loading directory</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const totalResources = resources.length;
  const countiesWithResources = Object.values(groupedResources).filter(arr => arr.length > 0).length;
  
  // Get all counties that have resources, sorted
  const sortedCounties = Object.keys(groupedResources)
    .filter(county => groupedResources[county].length > 0)
    .sort();

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-2">Food Resource Directory</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {totalResources} resource{totalResources !== 1 ? 's' : ''} across {countiesWithResources} count{countiesWithResources !== 1 ? 'ies' : 'y'}
        </p>
      </div>

      {/* County Groups */}
      <div className="space-y-2">
        {sortedCounties.map(county => {
          const countyResources = groupedResources[county] || [];
          const isExpanded = expandedCounties.has(county);

          return (
            <div key={county} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {/* County Header */}
              <button
                onClick={() => toggleCounty(county)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-lg">{county} County</h4>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-sm font-medium">
                    {countyResources.length}
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* County Resources */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {countyResources.map(resource => {
                      return (
                        <div
                          key={resource.id}
                          className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => onResourceClick && onResourceClick(resource)}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1">
                              {/* Name and Type */}
                              <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {resource.name}
                              </h5>
                              
                              {resource.service_type && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {resource.service_type}
                                </p>
                              )}

                              {/* Address */}
                              {resource.address && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {resource.address}
                                  {resource.city && `, ${resource.city}`}
                                </p>
                              )}

                              {/* Hours */}
                              {resource.hours && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  <strong>Hours:</strong> {resource.hours}
                                </p>
                              )}

                              {/* Notes */}
                              {resource.notes && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                                  {resource.notes}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex sm:flex-col gap-2 flex-wrap sm:flex-nowrap">
                              {resource.phone && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCallClick(resource.phone);
                                  }}
                                  className="px-3 py-1.5 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors text-sm font-medium whitespace-nowrap"
                                >
                                  📞 Call
                                </button>
                              )}

                              {resource.address && resource.city && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDirectionsClick(resource.address, resource.city, resource.county);
                                  }}
                                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                                >
                                  🗺️ Directions
                                </button>
                              )}

                              {resource.website && resource.website.startsWith('http') && (
                                <a
                                  href={resource.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium whitespace-nowrap text-center"
                                >
                                  🌐 Website
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}