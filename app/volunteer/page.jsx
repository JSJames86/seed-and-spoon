'use client';
import { useState, useEffect } from 'react';

export default function VolunteerPage() {
  const [selectedFilters, setSelectedFilters] = useState({
    day: 'all',
    category: 'all',
    type: 'all'
  });
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    preferredContact: 'email',
    roles: [],
    availability: '',
    resume: null,
    linkedin: '',
    accessibilityNotes: '',
    transportation: '',
    message: '',
    orientationAgreed: false,
    photoConsent: false
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const roles = [
    {
      id: 1,
      title: 'Planners / Admins',
      emoji: '📋',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      schedule: 'Mon–Fri (few hrs/day)',
      duties: [
        'Manage rosters and volunteer schedules',
        'Handle donor communication and outreach',
        'Maintain data systems and records',
        'Coordinate weekly meal plans',
        'Support program operations'
      ],
      idealFor: 'Detail-oriented organizers who love systems',
      summary: 'Keeps the mission running smoothly behind the scenes.',
      category: 'Admin'
    },
    {
      id: 2,
      title: 'Shoppers',
      emoji: '🛒',
      days: ['Tuesday', 'Friday'],
      schedule: 'Tues & Fri',
      duties: [
        'Pick up food donations from partners',
        'Purchase needed ingredients',
        'Load and transport items safely',
        'Unload at storage sites',
        'Track inventory and receipts'
      ],
      idealFor: 'Drivers with reliable vehicles',
      summary: 'Brings the ingredients that start every meal.',
      category: 'Logistics'
    },
    {
      id: 3,
      title: 'Preppers',
      emoji: '🥕',
      days: ['Wednesday'],
      schedule: 'Wed',
      duties: [
        'Wash and sanitize produce',
        'Chop and prep ingredients',
        'Label and organize items',
        'Set up cooking stations',
        'Follow food safety protocols'
      ],
      idealFor: 'Team players who enjoy prep work',
      summary: 'Light teamwork that fuels Thursday\'s cook day.',
      category: 'Kitchen'
    },
    {
      id: 4,
      title: 'Cooks',
      emoji: '👨‍🍳',
      days: ['Thursday'],
      schedule: 'Thurs',
      duties: [
        'Cook large-batch meals from recipes',
        'Monitor food temperatures and quality',
        'Portion meals into containers',
        'Label with dates and contents',
        'Maintain kitchen cleanliness'
      ],
      idealFor: 'Anyone who loves cooking with purpose',
      summary: 'The heart of Seed & Spoon — where food becomes care.',
      category: 'Kitchen'
    },
    {
      id: 5,
      title: 'Drivers / Delivery Team',
      emoji: '🚐',
      days: ['Friday'],
      schedule: 'Fri',
      duties: [
        'Load meal boxes into delivery vehicles',
        'Follow delivery routes and schedules',
        'Deliver boxes safely to families',
        'Maintain friendly, professional contact',
        'Report any delivery issues'
      ],
      idealFor: 'Licensed drivers with clean records',
      summary: 'The bridge between kitchen and doorstep.',
      category: 'Logistics'
    },
    {
      id: 6,
      title: 'Cleaners / Sanitation Team',
      emoji: '🧼',
      days: ['Wednesday', 'Thursday', 'Friday'],
      schedule: 'Wed–Fri',
      duties: [
        'Sanitize cooking areas and equipment',
        'Monitor food safety temperatures',
        'Manage cleaning supplies inventory',
        'Follow health department standards',
        'Support kitchen and storage cleanliness'
      ],
      idealFor: 'Detail-focused individuals',
      summary: 'The backbone of safety and hygiene.',
      category: 'Support',
      paid: true
    },
    {
      id: 7,
      title: 'Youth Trainees (Seed Track)',
      emoji: '🌱',
      days: ['Wednesday', 'Thursday'],
      schedule: 'Wed–Thurs',
      duties: [
        'Learn regenerative farming techniques',
        'Assist with food preparation',
        'Practice kitchen safety skills',
        'Participate in mentorship sessions',
        'Build professional experience'
      ],
      idealFor: 'Ages 16-24 seeking job skills and purpose',
      summary: 'Future farmers gaining purpose and skill.',
      category: 'Youth'
    },
    {
      id: 8,
      title: 'Intake & Care Desk Volunteers',
      emoji: '💁',
      days: ['Wednesday', 'Thursday', 'Friday'],
      schedule: 'Wed–Fri',
      duties: [
        'Greet families warmly and professionally',
        'Check registration and eligibility',
        'Share community resource information',
        'Maintain confidential records',
        'Answer questions with compassion'
      ],
      idealFor: 'Friendly, empathetic communicators',
      summary: 'The first friendly face for every guest.',
      category: 'Outreach'
    },
    {
      id: 9,
      title: 'Volunteer Case Managers',
      emoji: '📱',
      days: ['Flexible'],
      schedule: 'Flexible (monthly check-ins)',
      duties: [
        'Assess needs of new clients',
        'Review progress toward goals',
        'Maintain regular contact with families',
        'Connect clients to resources',
        'Document case notes securely'
      ],
      idealFor: 'Social work students or caring mentors',
      summary: 'The lifeline between families and Seed & Spoon.',
      category: 'Support',
      paid: true
    },
    {
      id: 10,
      title: 'Community Meals Crew',
      emoji: '🍽️',
      days: ['Saturday'],
      schedule: 'Sat (scheduled)',
      duties: [
        'Set up dining spaces for events',
        'Serve meals to community members',
        'Connect and build relationships',
        'Clean up after service',
        'Help create joyful atmosphere'
      ],
      idealFor: 'People-lovers and relationship-builders',
      summary: 'Turns service into shared joy.',
      category: 'Outreach'
    },
    {
      id: 11,
      title: 'Content & Storytelling Helpers',
      emoji: '📸',
      days: ['Flexible'],
      schedule: 'Flexible',
      duties: [
        'Capture photos during events (with consent)',
        'Document success stories',
        'Help with social media content',
        'Interview volunteers and families',
        'Share impact with the community'
      ],
      idealFor: 'Photographers, writers, and creatives',
      summary: 'Gives voice to the mission.',
      category: 'Outreach'
    },
    {
      id: 12,
      title: 'Corporate / Group Volunteers',
      emoji: '👥',
      days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      schedule: 'Tues–Sat (scheduled)',
      duties: [
        'Participate in group packing events',
        'Prepare meal kits as a team',
        'Sort and organize donations',
        'Build team spirit through service',
        'Custom projects based on needs'
      ],
      idealFor: 'Corporate teams and community groups',
      summary: 'Turns teamwork into tangible impact.',
      category: 'Outreach'
    },
    {
      id: 13,
      title: 'Super Fundraiser',
      emoji: '💰',
      days: ['Flexible'],
      schedule: 'Flexible (4–8 hrs/week)',
      duties: [
        'Write compelling donor emails and appeals',
        'Negotiate surplus agreements with stores',
        'Organize food and clothing drives',
        'Build relationships with corporate sponsors',
        'Track fundraising metrics and goals'
      ],
      idealFor: 'Charismatic communicators and negotiators',
      summary: 'Keeps the mission funded and flowing.',
      category: 'Fundraising'
    }
  ];

  const smoothScroll = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredRoles = roles.filter(role => {
    const dayMatch = selectedFilters.day === 'all' || role.days.map(d => d.toLowerCase()).includes(selectedFilters.day);
    const categoryMatch = selectedFilters.category === 'all' || role.category === selectedFilters.category;
    const typeMatch = selectedFilters.type === 'all' ||
      (selectedFilters.type === 'paid' && role.paid) ||
      (selectedFilters.type === 'volunteer' && !role.paid);

    return dayMatch && categoryMatch && typeMatch;
  });

  const handleFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else if (name === 'roles') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({ ...prev, roles: selectedOptions }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would normally send the form data to your backend
    console.log('Form submitted:', formData);
    setFormSubmitted(true);

    // Scroll to top of form to show success message
    smoothScroll('signup');
  };

  return (
    <main className="bg-cream">
      {/* Spacer for fixed header */}
      <div className="h-16 md:h-40"></div>

      {/* Hero Section */}
      <section className={`relative py-20 md:py-32 bg-gradient-to-br from-green-700 to-green-900 text-white transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Volunteer with Seed & Spoon
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto">
            Join a movement that nourishes Newark with dignity and community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => smoothScroll('roles')}
              className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-500 transition-all font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105"
            >
              See Open Roles
            </button>
            <button
              onClick={() => smoothScroll('signup')}
              className="bg-orange-600 text-white px-8 py-4 rounded-lg hover:bg-orange-500 transition-all font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105"
            >
              Apply to Volunteer
            </button>
          </div>
        </div>
      </section>

      {/* How to Volunteer Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            How to Volunteer
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Review Roles</h3>
              <p className="text-gray-600">
                Browse volunteer opportunities below and find what fits your schedule and skills.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Fill the Form</h3>
              <p className="text-gray-600">
                Complete the sign-up form at the bottom of this page with your information.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Share Your Resume</h3>
              <p className="text-gray-600">
                Attach a resume or LinkedIn profile if you have one (optional but helpful).
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">4</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Get Oriented</h3>
              <p className="text-gray-600">
                Our coordinator will reach out within 48 hours to schedule orientation.
              </p>
            </div>
          </div>
          <div className="text-center mt-12 p-6 bg-green-50 rounded-lg max-w-3xl mx-auto">
            <p className="text-lg text-gray-700">
              <strong>Every volunteer receives:</strong> Meals to-go, respect, ongoing support, and the joy of making a real difference.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section id="roles" className="py-8 bg-gray-50 sticky top-16 md:top-40 z-30 shadow-md">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center flex-wrap">
            <div>
              <label htmlFor="day-filter" className="mr-2 font-semibold text-gray-700">Day:</label>
              <select
                id="day-filter"
                value={selectedFilters.day}
                onChange={(e) => setSelectedFilters({...selectedFilters, day: e.target.value})}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Days</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div>
              <label htmlFor="category-filter" className="mr-2 font-semibold text-gray-700">Category:</label>
              <select
                id="category-filter"
                value={selectedFilters.category}
                onChange={(e) => setSelectedFilters({...selectedFilters, category: e.target.value})}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Categories</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Logistics">Logistics</option>
                <option value="Outreach">Outreach</option>
                <option value="Admin">Admin</option>
                <option value="Youth">Youth</option>
                <option value="Fundraising">Fundraising</option>
                <option value="Support">Support</option>
              </select>
            </div>

            <div>
              <label htmlFor="type-filter" className="mr-2 font-semibold text-gray-700">Type:</label>
              <select
                id="type-filter"
                value={selectedFilters.type}
                onChange={(e) => setSelectedFilters({...selectedFilters, type: e.target.value})}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All</option>
                <option value="volunteer">Volunteer</option>
                <option value="paid">Paid/Stipend</option>
              </select>
            </div>

            <button
              onClick={() => setSelectedFilters({ day: 'all', category: 'all', type: 'all' })}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      {/* Volunteer Roles Grid */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-800">
            Volunteer Opportunities
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Find the perfect role that fits your schedule, skills, and passion for serving the community.
          </p>

          {filteredRoles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No roles match your current filters. Try adjusting your search.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRoles.map((role, index) => (
                <div
                  key={role.id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 opacity-0 animate-fadeIn"
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards' }}
                  aria-label={`${role.title} volunteer role`}
                >
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-3">{role.emoji}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{role.title}</h3>
                      {role.paid && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold mt-1">
                          Paid/Stipend
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-green-600 mb-2">
                      📅 {role.schedule}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Category: {role.category}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="font-semibold text-gray-700 mb-2">Duties:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {role.duties.slice(0, 5).map((duty, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          <span>{duty}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {role.idealFor && (
                    <p className="text-sm text-gray-600 mb-4 italic">
                      <strong>Ideal for:</strong> {role.idealFor}
                    </p>
                  )}

                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      ✅ {role.summary}
                    </p>
                  </div>

                  <button
                    onClick={() => smoothScroll('signup')}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Sign Up
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sign-Up Form Section */}
      <section id="signup" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-800">
              Join the Volunteer Team
            </h2>
            <p className="text-center text-lg text-gray-600 mb-12">
              Every shift helps feed families with dignity. Fill out this form and we'll reach out within 48 hours.
            </p>

            {formSubmitted ? (
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold text-green-800 mb-4">Thank You!</h3>
                <p className="text-lg text-gray-700">
                  Our team will contact you soon to schedule orientation and next steps.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="mt-6 text-green-600 hover:text-green-700 font-semibold"
                >
                  Submit Another Application
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-8 shadow-lg">
                {/* Full Name */}
                <div className="mb-6">
                  <label htmlFor="fullName" className="block text-gray-700 font-semibold mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div className="mb-6">
                  <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="john@example.com"
                  />
                </div>

                {/* Mobile Phone */}
                <div className="mb-6">
                  <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">
                    Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="(732) 555-0123"
                  />
                </div>

                {/* Preferred Contact */}
                <div className="mb-6">
                  <label htmlFor="preferredContact" className="block text-gray-700 font-semibold mb-2">
                    Preferred Contact Method
                  </label>
                  <select
                    id="preferredContact"
                    name="preferredContact"
                    value={formData.preferredContact}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="email">Email</option>
                    <option value="text">Text</option>
                    <option value="phone">Phone Call</option>
                  </select>
                </div>

                {/* Volunteer Roles */}
                <div className="mb-6">
                  <label htmlFor="roles" className="block text-gray-700 font-semibold mb-2">
                    Volunteer Role(s) Interested In <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="roles"
                    name="roles"
                    multiple
                    required
                    value={formData.roles}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px]"
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.title}>{role.title}</option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple roles</p>
                </div>

                {/* Availability */}
                <div className="mb-6">
                  <label htmlFor="availability" className="block text-gray-700 font-semibold mb-2">
                    Availability (days/times)
                  </label>
                  <textarea
                    id="availability"
                    name="availability"
                    rows="3"
                    value={formData.availability}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Tuesdays and Thursdays, 10am-2pm"
                  ></textarea>
                </div>

                {/* Resume Upload */}
                <div className="mb-6">
                  <label htmlFor="resume" className="block text-gray-700 font-semibold mb-2">
                    Resume Upload
                  </label>
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Accepted formats: .pdf, .doc, .docx</p>
                </div>

                {/* LinkedIn Profile */}
                <div className="mb-6">
                  <label htmlFor="linkedin" className="block text-gray-700 font-semibold mb-2">
                    LinkedIn Profile URL (optional)
                  </label>
                  <input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                {/* Accessibility Notes */}
                <div className="mb-6">
                  <label htmlFor="accessibilityNotes" className="block text-gray-700 font-semibold mb-2">
                    Accessibility Notes (optional)
                  </label>
                  <textarea
                    id="accessibilityNotes"
                    name="accessibilityNotes"
                    rows="2"
                    value={formData.accessibilityNotes}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Let us know if you need any accommodations"
                  ></textarea>
                </div>

                {/* Transportation */}
                <div className="mb-6">
                  <label htmlFor="transportation" className="block text-gray-700 font-semibold mb-2">
                    Transportation Option
                  </label>
                  <select
                    id="transportation"
                    name="transportation"
                    value={formData.transportation}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select one...</option>
                    <option value="own-vehicle">I have my own vehicle</option>
                    <option value="public-transit">I use public transportation</option>
                    <option value="need-ride">I need transportation assistance</option>
                    <option value="flexible">Flexible/Other</option>
                  </select>
                </div>

                {/* Message */}
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">
                    Short Message or Motivation (optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Tell us why you want to volunteer with Seed & Spoon..."
                  ></textarea>
                </div>

                {/* Checkboxes */}
                <div className="mb-6">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="orientationAgreed"
                      required
                      checked={formData.orientationAgreed}
                      onChange={handleFormChange}
                      className="mt-1 mr-3 w-5 h-5 text-green-600 focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-gray-700">
                      I agree to attend a volunteer orientation before my first shift. <span className="text-red-500">*</span>
                    </span>
                  </label>
                </div>

                <div className="mb-8">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      name="photoConsent"
                      checked={formData.photoConsent}
                      onChange={handleFormChange}
                      className="mt-1 mr-3 w-5 h-5 text-green-600 focus:ring-2 focus:ring-green-500"
                    />
                    <span className="text-gray-700">
                      I consent to being photographed during volunteer activities for Seed & Spoon\'s promotional materials (optional).
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300"
                >
                  Apply to Volunteer
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Closing CTA Band */}
      <section className="py-16 bg-gradient-to-br from-green-700 to-green-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Have Questions?
          </h2>
          <p className="text-lg mb-8">
            Call or text <a href="tel:+17327071769" className="font-bold underline hover:text-green-200">+1 (732) 707-1769</a><br />
            or email <a href="mailto:hello@seedandspoon.org" className="font-bold underline hover:text-green-200">hello@seedandspoon.org</a>
          </p>
          <a
            href="/#programs"
            className="inline-block bg-white text-green-800 px-8 py-3 rounded-lg hover:bg-gray-100 transition-all font-bold shadow-lg hover:shadow-xl"
          >
            Back to Programs
          </a>
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </main>
  );
}
