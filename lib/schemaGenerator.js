// Generates JSON-LD structured data for a food assistance site.
// Call generateFoodBankSchema(pantryRow) server-side and inject the result
// as <script type="application/ld+json"> in the page head.

export function generateFoodBankSchema(site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: site.name,
    provider: {
      '@type': 'NGO',
      name: 'Seed & Spoon',
      url: 'https://seedandspoon.org',
    },
    serviceType: 'Food Assistance',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Newark',
    },
    serviceLocation: {
      '@type': 'LocalBusiness',
      name: site.name,
      image: 'https://seedandspoon.org/assets/hero-logo.png',
      address: {
        '@type': 'PostalAddress',
        streetAddress: site.address,
        addressLocality: 'Newark',
        addressRegion: 'NJ',
        postalCode: site.zipCode,
        addressCountry: 'US',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: site.lat,
        longitude: site.lng,
      },
      openingHoursSpecification: (site.hours ?? []).map(h => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.days,
        opens: h.opens,
        closes: h.closes,
      })),
      priceRange: '0',
    },
  };
}
