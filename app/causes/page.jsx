import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Our Causes | Seed & Spoon NJ - Feeding Families, Growing Community',
  description: 'Discover how Seed & Spoon NJ serves New Jersey families through community meals, neighborhood pantries, food boxes, holiday drives, and youth education programs.',
};

// Content data for easy editing
const causesData = [
  {
    id: 'community-meal',
    title: 'Community Meal Program',
    image: '/images/causes/community-meal.png',
    imageAlt: 'Volunteers serving hot meals to community members',
    description: [
      'Every week, our dedicated volunteers gather in community kitchens across New Jersey to prepare fresh, nutritious meals for families who need them most. We believe that no child should go to bed hungry, and no parent should have to choose between paying rent and feeding their family.',
      'Our Community Meal Program provides more than just food—it creates a space where neighbors become friends, where dignity is preserved, and where everyone is welcome at the table. From single parents working multiple jobs to seniors on fixed incomes, we serve hot, home-cooked meals with care and compassion.'
    ],
    impact: [
      'Over 2,500 hot meals served every month across 8 New Jersey communities',
      '75+ volunteer cooks and servers working together each week',
      'Fresh, balanced meals prepared with locally-sourced ingredients when possible',
      'No questions asked, no paperwork required—just good food and warm hospitality'
    ],
    volunteerRoles: [
      'Meal prep and cooking in community kitchens',
      'Food packing and distribution to pickup sites',
      'Delivery drivers to bring meals to homebound neighbors',
      'Setup and cleanup support at meal service locations'
    ]
  },
  {
    id: 'pantry-network',
    title: 'Neighborhood Pantry Network',
    image: '/images/causes/pantry-network.jpeg',
    imageAlt: 'Community pantry stocked with fresh food and essentials',
    description: [
      'Hunger doesn\'t follow a schedule, and help shouldn\'t either. Our Neighborhood Pantry Network brings food security directly into the heart of communities—at schools, churches, and community centers—where families can access fresh groceries and essentials with dignity and ease.',
      'These aren\'t institutional food banks. They\'re welcoming spaces designed to feel like a neighborhood market, where families can choose the foods that work for their households, dietary needs, and cultural traditions. We partner with local schools to reduce stigma and increase access for children and parents alike.'
    ],
    impact: [
      '15 active pantry locations throughout New Jersey, with more opening each quarter',
      '850+ families served each week through neighborhood pantry access',
      'Fresh produce, proteins, dairy, and shelf-stable staples available year-round',
      'Bilingual support and culturally diverse food options to serve all communities'
    ],
    volunteerRoles: [
      'Stock pantry shelves and organize food displays',
      'Greet families and assist with food selection',
      'Sort and inventory donated food items',
      'Transport food from distribution centers to pantry sites'
    ]
  },
  {
    id: 'family-food-boxes',
    title: 'Family Food Boxes',
    image: '/images/causes/family-food-boxes.jpeg',
    imageAlt: 'Packed food boxes ready for family distribution',
    description: [
      'Life gets overwhelming. Job loss, medical emergencies, unexpected expenses—sometimes families just need a little help to get through a tough week or month. Our Family Food Boxes provide a full week\'s worth of groceries and household essentials, carefully packed to support families of all sizes.',
      'Each box is thoughtfully curated with input from the families we serve. We include fresh fruits and vegetables, proteins, grains, and pantry staples, along with items kids love and parents need. These aren\'t generic handouts—they\'re personalized care packages that honor each family\'s unique needs and preferences.'
    ],
    impact: [
      '400+ food boxes distributed monthly to families across New Jersey',
      'Each box contains 7 days of nutritious food for an entire household',
      'Special boxes available for dietary restrictions, allergies, and cultural preferences',
      'Follow-up resources provided to connect families with long-term support services'
    ],
    volunteerRoles: [
      'Pack food boxes according to family size and dietary needs',
      'Load and deliver boxes to family homes or pickup locations',
      'Coordinate with families to schedule pickups and deliveries',
      'Help source and organize bulk food donations for box assembly'
    ]
  },
  {
    id: 'holiday-meal-drive',
    title: 'Holiday Meal Drive',
    image: '/images/causes/holiday-meal-drive.jpeg',
    imageAlt: 'Thanksgiving meal boxes being prepared by volunteers',
    description: [
      'The holidays should be a time of joy, togetherness, and celebration—not stress and scarcity. Every Thanksgiving and Christmas, we mobilize hundreds of volunteers to cook and distribute complete holiday meals to families who might otherwise go without.',
      'These aren\'t just meals; they\'re traditions preserved, memories made, and hope renewed. We provide everything needed for a full holiday feast: turkey or ham, fresh sides, desserts, and all the fixings. Families gather around tables filled with love, knowing their community has their back.'
    ],
    impact: [
      '1,200+ complete holiday meals provided each Thanksgiving and Christmas',
      'Meals include everything from the main course to dessert—nothing left out',
      'Same-day delivery available for homebound seniors and families without transportation',
      'Community holiday gatherings hosted for those who want to celebrate together'
    ],
    volunteerRoles: [
      'Cook and prepare traditional holiday dishes in bulk',
      'Assemble complete meal packages with all the trimmings',
      'Deliver meals to families on Thanksgiving and Christmas morning',
      'Host and serve at community holiday celebration events'
    ]
  },
  {
    id: 'youth-garden',
    title: 'Youth Garden Project',
    image: '/images/causes/youth-garden.png',
    imageAlt: 'Children learning to plant vegetables in community garden',
    description: [
      'When children learn where their food comes from and how to grow it themselves, something powerful happens. They connect with nature, build confidence, develop healthy eating habits, and understand their role in creating sustainable communities.',
      'Our Youth Garden Project brings hands-on food education to schools and community centers across New Jersey. Kids plant seeds, tend gardens, harvest vegetables, and even prepare simple recipes with what they\'ve grown. They learn about nutrition, environmental stewardship, and the value of hard work—all while having fun in the dirt and sunshine.'
    ],
    impact: [
      '250+ children participating in garden programs at 6 New Jersey locations',
      'Over 800 pounds of fresh produce grown and shared with families annually',
      'Weekly garden lessons teaching planting, composting, and sustainable practices',
      'Kids take home starter plants and seeds to grow food with their families'
    ],
    volunteerRoles: [
      'Lead garden education sessions with youth groups',
      'Help maintain garden beds, compost systems, and irrigation',
      'Assist children with planting, weeding, and harvesting activities',
      'Coordinate harvest donations to local pantries and meal programs'
    ]
  }
];

export default function CausesPage() {
  return (
    <main className="min-h-screen bg-[#F9EED4] pt-16 md:pt-20 lg:pt-24">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0B88C2] to-[#02538A] text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Our Causes
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed opacity-95">
            Every meal served, every pantry stocked, every seed planted—these are the ways we build a stronger, healthier, more connected New Jersey.
          </p>
        </div>
      </section>

      {/* Causes Sections */}
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-24">
        {causesData.map((cause, index) => {
          const isEven = index % 2 === 0;

          return (
            <section
              key={cause.id}
              id={cause.id}
              className="scroll-mt-20"
            >
              <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-12 items-center`}>
                {/* Image */}
                <div className="w-full lg:w-1/2">
                  <div className="relative h-[300px] md:h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={cause.image}
                      alt={cause.imageAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="w-full lg:w-1/2 space-y-6">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#02538A] leading-tight">
                    {cause.title}
                  </h2>

                  <div className="space-y-4">
                    {cause.description.map((paragraph, i) => (
                      <p key={i} className="text-lg text-gray-800 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Impact Highlights */}
                  <div className="bg-white/80 rounded-xl p-6 shadow-lg border-l-4 border-[#77A462]">
                    <h3 className="text-xl font-bold text-[#02538A] mb-4">
                      Impact & Reach
                    </h3>
                    <ul className="space-y-2">
                      {cause.impact.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-[#77A462] text-xl mt-0.5 flex-shrink-0">✓</span>
                          <span className="text-gray-800">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Volunteer Roles */}
                  <div className="bg-gradient-to-br from-[#EA802F]/10 to-[#EA802F]/5 rounded-xl p-6 border border-[#EA802F]/20">
                    <h3 className="text-xl font-bold text-[#02538A] mb-4">
                      Ways to Help
                    </h3>
                    <ul className="space-y-2 mb-6">
                      {cause.volunteerRoles.map((role, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="text-[#EA802F] text-lg mt-0.5 flex-shrink-0">→</span>
                          <span className="text-gray-800">{role}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                        href="/donate"
                        className="inline-flex items-center justify-center px-8 py-3 bg-[#EA802F] hover:bg-[#d6722a] text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        Donate Now
                      </Link>
                      <Link
                        href="/volunteer"
                        className="inline-flex items-center justify-center px-8 py-3 bg-[#0B88C2] hover:bg-[#0a77a9] text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        Volunteer
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Bottom CTA Section */}
      <section className="bg-gradient-to-br from-[#77A462] to-[#5a8a4a] text-white py-16 px-4 mt-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl leading-relaxed opacity-95">
            Whether you have an hour to spare or want to become a regular volunteer, there's a place for you at Seed & Spoon. Every contribution—big or small—helps us build a stronger, healthier community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/volunteer"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-[#77A462] font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
            >
              Get Involved Today
            </Link>
            <Link
              href="/donate"
              className="inline-flex items-center justify-center px-10 py-4 bg-[#EA802F] hover:bg-[#d6722a] text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
            >
              Support Our Work
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
