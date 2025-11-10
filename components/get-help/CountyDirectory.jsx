/**
 * County Directory Component
 *
 * Grouped list of food resources by New Jersey county
 */

'use client';

import { useState, useEffect } from 'react';
import { NJ_COUNTIES } from '@/lib/validation';
import { formatTime, getTodayHours, isOpenNow } from '@/lib/hours-utils';

const TYPE_LABELS = {
  food_pantry: 'Food Pantry',
  hot_meal: 'Hot Meal',
  mobile_pantry: 'Mobile Pantry',
  community_fridge: 'Community Fridge',
  other: 'Other',
};

const SERVICE_BADGES = {
  formula: { label: 'Formula', color: 'bg-pink-100 text-pink-800' },
  baby_food: { label: 'Baby Food', color: 'bg-yellow-100 text-yellow-800' },
  diapers: { label: 'Diapers', color: 'bg-blue-100 text-blue-800' },
  halal: { label: 'Halal', color: 'bg-green-100 text-green-800' },
  kosher: { label: 'Kosher', color: 'bg-purple-100 text-purple-800' },
  vegetarian: { label: 'Vegetarian', color: 'bg-green-100 text-green-800' },
  vegan: { label: 'Vegan', color: 'bg-green-100 text-green-800' },
};

export default function CountyDirectory({ filters = {}, onResourceClick }) {
  const [resources, setResources] = useState([]);
  const [groupedResources, setGroupedResources] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCounties, setExpandedCounties] = useState(new Set());

  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (filters.county) params.append('county', filters.county);
        if (filters.type) params.append('type', filters.type);
        if (filters.service) params.append('service', filters.service);
        if (filters.openNow) params.append('openNow', 'true');
        if (filters.zip) params.append('zip', filters.zip);

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

    fetchResources();
  }, [filters]);

  // Group resources by county
  useEffect(() => {
    const grouped = {};

    NJ_COUNTIES.forEach(county => {
      grouped[county] = resources.filter(r => r.county === county);
    });

    setGroupedResources(grouped);

    // Auto-expand counties with resources (limit to first 3)
    const countiesWithResources = NJ_COUNTIES.filter(county => grouped[county]?.length > 0);
    setExpandedCounties(new Set(countiesWithResources.slice(0, 3)));
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
    window.location.href = `tel:${phone}`;
  };

  const handleDirectionsClick = (address) => {
    const query = encodeURIComponent(`${address.street}, ${address.city}, ${address.state} ${address.zip}`);
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
      <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-lg">
        <p className="font-semibold">Error loading directory</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const totalResources = resources.length;
  const countiesWithResources = Object.values(groupedResources).filter(arr => arr.length > 0).length;

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
        {NJ_COUNTIES.map(county => {
          const countyResources = groupedResources[county] || [];
          const isExpanded = expandedCounties.has(county);

          if (countyResources.length === 0 && filters.county) {
            return null; // Hide empty counties when filtering
          }

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
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
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
                  {countyResources.length === 0 ? (
                    <p className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                      No resources in this county
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {countyResources.map(resource => {
                        const todayHours = getTodayHours(resource.hours);
                        const openNow = isOpenNow(resource.hours);

                        return (
                          <div
                            key={resource.id}
                            className="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            onClick={() => onResourceClick && onResourceClick(resource)}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="flex-1">
                                {/* Name and Type */}
                                <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                                  {resource.name}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {TYPE_LABELS[resource.type] || resource.type}
                                </p>

                                {/* Address */}
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {resource.address.street && `${resource.address.street}, `}
                                  {resource.address.city}, {resource.address.state} {resource.address.zip}
                                </p>

                                {/* Hours */}
                                {todayHours && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    <strong>Today:</strong> {formatTime(todayHours.open)} - {formatTime(todayHours.close)}
                                    {openNow && (
                                      <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                                        Open Now
                                      </span>
                                    )}
                                  </p>
                                )}

                                {/* Service Badges */}
                                {resource.services && resource.services.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {resource.services
                                      .filter(service => SERVICE_BADGES[service])
                                      .map(service => {
                                        const badge = SERVICE_BADGES[service];
                                        return (
                                          <span
                                            key={service}
                                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
                                          >
                                            {badge.label}
                                          </span>
                                        );
                                      })}
                                  </div>
                                )}

                                {/* Languages */}
                                {resource.languages && resource.languages.length > 1 && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Languages: {resource.languages.join(', ')}
                                  </p>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex sm:flex-col gap-2 flex-wrap sm:flex-nowrap">
                                {resource.contact?.phone && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCallClick(resource.contact.phone);
                                    }}
                                    className="px-3 py-1.5 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors text-sm font-medium whitespace-nowrap"
                                  >
                                    📞 Call
                                  </button>
                                )}

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDirectionsClick(resource.address);
                                  }}
                                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap"
                                >
                                  🗺️ Directions
                                </button>

                                {resource.contact?.website && (
                                  <a
                                    href={resource.contact.website}
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
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
