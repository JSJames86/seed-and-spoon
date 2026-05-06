'use client';

import { useState } from 'react';
import Link from 'next/link';

// ─── Resource data ────────────────────────────────────────────────────────────
// Update href values with direct report URLs as you find them.

const CATEGORIES = [
  'All',
  'National Data',
  'New Jersey',
  'Youth & Food Insecurity',
  'Policy & Advocacy',
];

const RESOURCES = [
  {
    category: 'National Data',
    org: 'Feeding America',
    title: 'Map the Meal Gap',
    year: '2023',
    description:
      'The most comprehensive study of food insecurity at the local level in the U.S. Includes county-level data on food insecurity rates and meal costs across all 50 states.',
    href: 'https://www.feedingamerica.org/research/map-the-meal-gap',
    tag: 'Annual Report',
  },
  {
    category: 'National Data',
    org: 'USDA Economic Research Service',
    title: 'Household Food Security in the United States',
    year: '2023',
    description:
      'The federal government\'s official annual report on food insecurity rates across the U.S., including breakdowns by age, income, race, and household type.',
    href: 'https://www.ers.usda.gov/topics/food-nutrition-assistance/food-security-in-the-u-s/',
    tag: 'Federal Data',
  },
  {
    category: 'Youth & Food Insecurity',
    org: 'No Kid Hungry / Share Our Strength',
    title: 'Child Hunger in America',
    year: '2023',
    description:
      'Research and data on child hunger in the United States, including the role of school meals, summer nutrition programs, and community-based interventions.',
    href: 'https://www.nokidhungry.org/research',
    tag: 'Research',
  },
  {
    category: 'Youth & Food Insecurity',
    org: 'Annie E. Casey Foundation',
    title: 'KIDS COUNT Data Center – Food Insecurity',
    year: '2023',
    description:
      'State-by-state data on child well-being including food insecurity, poverty, and housing instability. New Jersey profiles available with historical trend data.',
    href: 'https://datacenter.aecf.org/data/food-insecurity',
    tag: 'Data Center',
  },
  {
    category: 'New Jersey',
    org: 'Community FoodBank of New Jersey',
    title: 'Hunger in New Jersey',
    year: '2023',
    description:
      'Annual hunger report from the state\'s largest hunger-relief organization, covering food insecurity rates, SNAP participation, and the impact of the statewide food bank network.',
    href: 'https://cfbnj.org/our-impact/hunger-in-new-jersey/',
    tag: 'State Report',
  },
  {
    category: 'New Jersey',
    org: 'New Jersey Policy Perspective',
    title: 'Food Insecurity & Economic Hardship in NJ',
    year: '2022',
    description:
      'Policy analysis on food insecurity in New Jersey, examining the relationship between poverty, unemployment, and access to nutrition assistance programs.',
    href: 'https://www.njpp.org',
    tag: 'Policy Brief',
  },
  {
    category: 'Youth & Food Insecurity',
    org: 'National Institutes of Health (NIH) / PubMed Central',
    title: 'Food Insecurity and Mental Health Among Youth',
    year: '2023',
    description:
      'Peer-reviewed study published in PMC examining the relationship between food insecurity and mental health outcomes in children and adolescents, including depression, anxiety, and behavioral issues. Highlights the psychological toll of hunger beyond physical health.',
    href: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10282483/',
    tag: 'Academic',
  },
  {
    category: 'Policy & Advocacy',
    org: 'IZA Institute of Labor Economics',
    title: 'Food Insecurity and Long-Run Economic Outcomes',
    year: '2019',
    description:
      'Economic research paper examining how food insecurity in childhood and young adulthood affects long-term labor market outcomes, earnings, and economic mobility. Provides a strong evidence base for the economic case for investing in food security.',
    href: 'https://docs.iza.org/dp12627.pdf',
    tag: 'Academic',
  },
  {
    category: 'Youth & Food Insecurity',
    org: 'Urban Institute',
    title: 'Impossible Choices: Teens and Food Insecurity in America',
    year: '2019',
    description:
      'A landmark Urban Institute study focused specifically on teenagers experiencing food insecurity — the exact population Seed & Spoon serves. Examines how teens cope with hunger, the choices they are forced to make, and the lasting impact on their development and futures.',
    href: 'https://www.urban.org/sites/default/files/alfresco/publication-pdfs/2000914-Impossible-Choices-Teens-and-Food-Insecurity-in-America.pdf',
    tag: 'Research',
  },
  {
    category: 'Policy & Advocacy',
    org: 'Urban Institute',
    title: 'Food Security and Health Outcomes',
    year: '2023',
    description:
      'Research examining the relationship between food insecurity and long-term health, educational, and economic outcomes — particularly for children and young adults.',
    href: 'https://www.urban.org/topics/food-security',
    tag: 'Research',
  },
  {
    category: 'National Data',
    org: 'World Hunger Education Service',
    title: 'Hunger and Poverty in America 2024',
    year: '2024',
    description:
      'A detailed overview of hunger and poverty across the United States, including statistics on food insecurity rates, demographics most affected, the role of federal programs, and the systemic causes of hunger in one of the wealthiest nations in the world.',
    href: 'https://www.worldhunger.org/wp-content/uploads/2024/11/Hunger-and-Poverty-in-America-2024.pdf',
    tag: 'Research',
  },
  {
    category: 'Policy & Advocacy',
    org: 'Food Research & Action Center (FRAC)',
    title: 'Hunger & Poverty in America',
    year: '2023',
    description:
      'FRAC\'s research on federal nutrition programs and their impact on food insecurity, including SNAP, WIC, school meals, and summer feeding initiatives.',
    href: 'https://frac.org/research',
    tag: 'Policy Research',
  },
  {
    category: 'Youth & Food Insecurity',
    org: 'International Association for the Evaluation of Educational Achievement (IEA)',
    title: 'Hunger and the Learning Environment',
    year: '2024',
    description:
      'Research examining the direct relationship between hunger and academic performance, cognitive development, and classroom engagement in children and youth. Makes the case for food security as an educational equity issue.',
    href: 'https://www.iea.nl/sites/default/files/2024-03/CB22-Hunger-and-Learning-Environment.pdf',
    tag: 'Academic',
  },
  {
    category: 'Youth & Food Insecurity',
    org: 'Institute for Child Success',
    title: 'Food Insecurity & Early Childhood',
    year: '2024',
    description:
      'Research hub examining the impact of food insecurity on early childhood development, school readiness, and long-term outcomes. Covers policy solutions and evidence-based interventions for children and youth.',
    href: 'https://www.instituteforchildsuccess.org/food-insecurity/',
    tag: 'Research',
  },
  {
    category: 'Youth & Food Insecurity',
    org: 'Covenant House',
    title: 'Hunger Among Homeless Youth',
    year: '2022',
    description:
      'Research focused specifically on food insecurity among youth experiencing homelessness and housing instability — directly relevant to the population Seed & Spoon serves.',
    href: 'https://www.covenanthouse.org/research',
    tag: 'Research',
  },
  {
    category: 'New Jersey',
    org: 'NJ Office of Food Security',
    title: 'Exploring the Six Dimensions of Food Security in New Jersey',
    year: '2025',
    description:
      'A comprehensive 2025 state report examining food security across six dimensions: availability, access, utilization, stability, agency, and sustainability. One of the most thorough analyses of food insecurity in New Jersey to date.',
    href: 'https://www.nj.gov/foodsecurity/documents/Exploring%20the%20Six%20Dimensions%20of%20Food%20Security%20in%20New%20Jersey_October%202025.pdf',
    tag: 'State Report',
  },
  {
    category: 'New Jersey',
    org: 'NJ Economic Development Authority (NJEDA)',
    title: 'Food Security Programs',
    year: '2024',
    description:
      'Overview of the NJEDA\'s active food security programs, including the Food Desert Relief Act, grants for food retailers in underserved communities, and investments aimed at improving food access across New Jersey.',
    href: 'https://www.njeda.gov/food-security-programs/',
    tag: 'Programs',
  },
  {
    category: 'New Jersey',
    org: 'NJ Department of Environmental Protection (NJDEP)',
    title: 'Food Security Product Deck',
    year: '2024',
    description:
      'A comprehensive presentation from the NJ DEP examining food security across New Jersey, including environmental factors that affect food access, community vulnerability, and state-level strategies to address food insecurity.',
    href: 'https://dep.nj.gov/wp-content/uploads/cleanaircouncil/food-security-product-deck.-march-2024.pdf',
    tag: 'State Report',
  },
  {
    category: 'New Jersey',
    org: 'NJ Economic Development Authority (NJEDA)',
    title: 'NJ Food Desert Communities Designation Proposal List',
    year: '2022',
    description:
      'Official state proposal listing communities designated as Food Desert Communities across New Jersey. Identifies the underserved areas — including parts of Newark — that qualify for targeted food access investment and intervention.',
    href: 'https://www.njeda.gov/wp-content/uploads/2022/01/NJ-Food-Desert-Communities-Designation-Proposal-List-January-2022-1.pdf',
    tag: 'State Report',
  },
  {
    category: 'New Jersey',
    org: 'Rutgers Center for State Health Policy',
    title: 'Food Insecurity in Urban New Jersey',
    year: '2022',
    description:
      'Academic research on food insecurity in New Jersey\'s urban communities, including Newark. Examines access to healthy food, transportation barriers, and community-level interventions.',
    href: 'https://cshp.rutgers.edu',
    tag: 'Academic',
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

const TAG_COLORS = {
  'Annual Report': 'bg-blue-100 text-blue-800',
  'Federal Data': 'bg-gray-100 text-gray-700',
  'Research': 'bg-purple-100 text-purple-800',
  'Data Center': 'bg-green-100 text-green-800',
  'State Report': 'bg-orange-100 text-orange-800',
  'Policy Brief': 'bg-yellow-100 text-yellow-800',
  'Policy Research': 'bg-yellow-100 text-yellow-800',
  'Academic': 'bg-indigo-100 text-indigo-800',
  'Programs': 'bg-teal-100 text-teal-800',
};

function ResourceCard({ resource }) {
  return (
    <article className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${TAG_COLORS[resource.tag] || 'bg-gray-100 text-gray-700'}`}>
          {resource.tag}
        </span>
        <span className="text-xs text-gray-400 flex-shrink-0">{resource.year}</span>
      </div>

      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
        {resource.org}
      </p>
      <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug">
        {resource.title}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-4">
        {resource.description}
      </p>

      <a
        href={resource.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-900 transition-colors mt-auto"
      >
        View report
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportsClient() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? RESOURCES
    : RESOURCES.filter((r) => r.category === activeCategory);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-green-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-green-200 uppercase tracking-widest text-sm font-semibold mb-3">
            Resources
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Research &amp; Reports
          </h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Data and research on youth hunger, food insecurity, and community nutrition
            in Newark and across New Jersey. We curate these resources to ground our
            work in evidence and keep our community informed.
          </p>
        </div>
      </section>

      {/* Filter pills */}
      <section className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                activeCategory === cat
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-green-500 hover:text-green-700'
              }`}
            >
              {cat}
              {cat !== 'All' && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({RESOURCES.filter((r) => r.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <p className="text-sm text-gray-500 mb-8">
          Showing {filtered.length} resource{filtered.length !== 1 ? 's' : ''}
          {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((resource, i) => (
            <ResourceCard key={i} resource={resource} />
          ))}
        </div>
      </section>

      {/* Suggest a resource */}
      <section className="bg-green-700 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Know a report we should add?</h2>
          <p className="text-green-100 mb-6">
            If you&apos;ve come across research on youth hunger, food access, or food
            policy in New Jersey that belongs here, let us know.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-3 px-8 rounded-lg transition"
          >
            Suggest a Resource
          </Link>
        </div>
      </section>
    </main>
  );
}
