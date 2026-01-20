/**
 * County Directory Component
 *
 * Grouped list of food resources by New Jersey county
 * Fetches data from Supabase via local API
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

// City to County mapping for NJ (used to extract county from address)
const CITY_TO_COUNTY = {
  // Essex County
  'newark': 'Essex', 'east orange': 'Essex', 'orange': 'Essex', 'west orange': 'Essex',
  'south orange': 'Essex', 'montclair': 'Essex', 'bloomfield': 'Essex', 'belleville': 'Essex',
  'irvington': 'Essex', 'maplewood': 'Essex', 'millburn': 'Essex', 'nutley': 'Essex',
  // Hudson County
  'jersey city': 'Hudson', 'bayonne': 'Hudson', 'hoboken': 'Hudson', 'union city': 'Hudson',
  'north bergen': 'Hudson', 'west new york': 'Hudson', 'secaucus': 'Hudson', 'kearny': 'Hudson',
  'harrison': 'Hudson', 'east newark': 'Hudson', 'guttenberg': 'Hudson', 'weehawken': 'Hudson',
  // Union County
  'elizabeth': 'Union', 'plainfield': 'Union', 'union': 'Union', 'linden': 'Union',
  'rahway': 'Union', 'westfield': 'Union', 'cranford': 'Union', 'summit': 'Union',
  'roselle': 'Union', 'roselle park': 'Union', 'hillside': 'Union', 'kenilworth': 'Union',
  'scotch plains': 'Union', 'fanwood': 'Union', 'clark': 'Union', 'springfield': 'Union',
  // Bergen County
  'hackensack': 'Bergen', 'englewood': 'Bergen', 'fort lee': 'Bergen', 'teaneck': 'Bergen',
  'bergenfield': 'Bergen', 'fair lawn': 'Bergen', 'garfield': 'Bergen', 'lodi': 'Bergen',
  'paramus': 'Bergen', 'ridgewood': 'Bergen', 'cliffside park': 'Bergen', 'palisades park': 'Bergen',
  'new milford': 'Bergen', 'westwood': 'Bergen', 'ridgefield park': 'Bergen', 'hillsdale': 'Bergen',
  // Passaic County
  'paterson': 'Passaic', 'passaic': 'Passaic', 'clifton': 'Passaic', 'wayne': 'Passaic',
  // Middlesex County
  'new brunswick': 'Middlesex', 'perth amboy': 'Middlesex', 'edison': 'Middlesex',
  'woodbridge': 'Middlesex', 'piscataway': 'Middlesex', 'sayreville': 'Middlesex',
  // Mercer County
  'trenton': 'Mercer', 'princeton': 'Mercer', 'hamilton': 'Mercer', 'ewing': 'Mercer',
  // Camden County
  'camden': 'Camden', 'cherry hill': 'Camden', 'gloucester city': 'Camden',
  // Monmouth County
  'asbury park': 'Monmouth', 'long branch': 'Monmouth', 'red bank': 'Monmouth',
};

/**
 * Extract county from address string by matching city names
 */
function extractCountyFromAddress(address) {
  if (!address) return null;
  const addressLower = address.toLowerCase();

  // Try to find a matching city in the address
  for (const [city, county] of Object.entries(CITY_TO_COUNTY)) {
    if (addressLower.includes(city)) {
      return county;
    }
  }
  return null;
}

export default function CountyDirectory({ filters = {}, onResourceClick }) {
  const [resources, setResources] = useState([]);
  const [groupedResources, setGroupedResources] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCounties, setExpandedCounties] = useState(new Set());

  // Fetch resources from Supabase via local API
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/foodbanks');

        if (!response.ok) {
          throw new Error(`Failed to load resources (${response.status})`);
        }

        const data = await response.json();

        // Handle both array and paginated responses
        const allResources = Array.isArray(data) ? data : data.results || [];

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
      // First try to get county from resource data, then extract from address
      let countyName = resource.county || extractCountyFromAddress(resource.address) || '';

      // Find matching county (case-insensitive)
      const matchedCounty = NJ_COUNTIES.find(c =>
        countyName.toLowerCase() === c.toLowerCase()
      );

      if (matchedCounty && grouped[matchedCounty]) {
        grouped[matchedCounty].push(resource);
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

  const handleDirectionsClick = (address) => {
    const query = encodeURIComponent(address);
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

                              {resource.address && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDirectionsClick(resource.address);
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