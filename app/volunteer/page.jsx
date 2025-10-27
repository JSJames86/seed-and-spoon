'use client'

import { useState, useEffect } from 'react'
import StayConnected from '@/components/StayConnected'

export default function VolunteerPage() {
  const [filters, setFilters] = useState({
    day: 'all',
    category: 'all',
    type: 'all'
  })
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
    orientationAgreement: false,
    photoConsent: false
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [visibleCards, setVisibleCards] = useState([])

  // Volunteer roles data
  const roles = [
    {
      id: 1,
      title: 'Planners / Admins',
      emoji: '📋',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      category: 'Admin',
      type: 'volunteer',
      schedule: 'Mon–Fri (few hrs/day)',
      duties: [
        'Manage rosters, donor communication, and data systems',
        'Coordinate schedules and weekly plans',
        'Handle administrative tasks',
        'Maintain volunteer records',
        'Support organizational efficiency'
      ],
      tagline: 'Keeps the mission running smoothly behind the scenes.'
    },
    {
      id: 2,
      title: 'Shoppers',
      emoji: '🛒',
      days: ['Tue', 'Fri'],
      category: 'Logistics',
      type: 'volunteer',
      schedule: 'Tues & Fri',
      duties: [
        'Pick up donations and purchases',
        'Load and unload at storage sites',
        'Coordinate with food suppliers',
        'Track inventory',
        'Transport items safely'
      ],
      tagline: 'Brings the ingredients that start every meal.'
    },
    {
      id: 3,
      title: 'Preppers',
      emoji: '🥗',
      days: ['Wed'],
      category: 'Kitchen',
      type: 'volunteer',
      schedule: 'Wed',
      duties: [
        'Wash, chop, label ingredients',
        'Organize cooking stations',
        'Prepare mise en place',
        'Sort and store food',
        'Ensure kitchen readiness'
      ],
      tagline: 'Light teamwork that fuels Thursday\'s cook day.'
    },
    {
      id: 4,
      title: 'Cooks',
      emoji: '🍳',
      days: ['Thu'],
      category: 'Kitchen',
      type: 'volunteer',
      schedule: 'Thurs',
      duties: [
        'Cook large batches of nutritious meals',
        'Portion and label meals properly',
        'Follow food safety protocols',
        'Manage cooking stations',
        'Ensure quality and consistency'
      ],
      tagline: 'The heart of Seed & Spoon — where food becomes care.'
    },
    {
      id: 5,
      title: 'Drivers / Delivery Team',
      emoji: '🚐',
      days: ['Fri'],
      category: 'Logistics',
      type: 'volunteer',
      schedule: 'Fri',
      duties: [
        'Load vans with meal boxes',
        'Deliver meals to families safely',
        'Maintain delivery schedules',
        'Handle logistics coordination',
        'Provide excellent customer service'
      ],
      tagline: 'The bridge between kitchen and doorstep.'
    },
    {
      id: 6,
      title: 'Cleaners / Sanitation Team',
      emoji: '🧼',
      days: ['Wed', 'Thu', 'Fri'],
      category: 'Support',
      type: 'volunteer',
      schedule: 'Wed–Fri',
      duties: [
        'Sanitize kitchen and work areas',
        'Monitor food safety temperatures',
        'Manage cleaning supplies',
        'Ensure compliance with health codes',
        'Maintain organization and cleanliness'
      ],
      tagline: 'The backbone of safety and hygiene.'
    },
    {
      id: 7,
      title: 'Youth Trainees (Seed Track)',
      emoji: '🌱',
      days: ['Wed', 'Thu'],
      category: 'Youth',
      type: 'volunteer',
      schedule: 'Wed–Thurs',
      duties: [
        'Learn regenerative farming techniques',
        'Help with food preparation',
        'Develop culinary skills',
        'Build community connections',
        'Gain work experience and purpose'
      ],
      tagline: 'Future farmers gaining purpose and skill.'
    },
    {
      id: 8,
      title: 'Intake & Care Desk Volunteers',
      emoji: '🤝',
      days: ['Wed', 'Thu', 'Fri'],
      category: 'Outreach',
      type: 'volunteer',
      schedule: 'Wed–Fri',
      duties: [
        'Greet families with warmth and dignity',
        'Check registrations and verify information',
        'Share community resources',
        'Answer questions and provide support',
        'Create welcoming atmosphere'
      ],
      tagline: 'The first friendly face for every guest.'
    },
    {
      id: 9,
      title: 'Volunteer Case Managers',
      emoji: '💼',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      category: 'Outreach',
      type: 'volunteer',
      schedule: 'Flexible (monthly check-ins)',
      duties: [
        'Assess new client needs',
        'Review personal goals with families',
        'Maintain regular contact',
        'Connect clients to resources',
        'Track progress and outcomes'
      ],
      tagline: 'The lifeline between families and Seed & Spoon.'
    },
    {
      id: 10,
      title: 'Community Meals Crew',
      emoji: '🍽️',
      days: ['Sat'],
      category: 'Kitchen',
      type: 'volunteer',
      schedule: 'Sat (scheduled)',
      duties: [
        'Set up dining areas',
        'Serve meals with care',
        'Connect with guests',
        'Clean up after service',
        'Create community atmosphere'
      ],
      tagline: 'Turns service into shared joy.'
    },
    {
      id: 11,
      title: 'Content & Storytelling Helpers',
      emoji: '📸',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      category: 'Outreach',
      type: 'volunteer',
      schedule: 'Flexible',
      duties: [
        'Capture photos and videos (with consent)',
        'Document volunteer stories',
        'Write social media content',
        'Help with newsletters',
        'Share the mission through media'
      ],
      tagline: 'Gives voice to the mission.'
    },
    {
      id: 12,
      title: 'Corporate / Group Volunteers',
      emoji: '👥',
      days: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      category: 'Kitchen',
      type: 'volunteer',
      schedule: 'Tues–Sat (scheduled)',
      duties: [
        'Participate in group packing events',
        'Support service days',
        'Engage in team-building activities',
        'Make tangible community impact',
        'Foster corporate social responsibility'
      ],
      tagline: 'Turns teamwork into tangible impact.'
    },
    {
      id: 13,
      title: 'Super Fundraiser',
      emoji: '💰',
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      category: 'Fundraising',
      type: 'volunteer',
      schedule: 'Flexible (4–8 hrs/week)',
      duties: [
        'Write donor emails and fundraising appeals',
        'Negotiate surplus agreements with stores',
        'Run food and clothing drives',
        'Build donor relationships',
        'Track fundraising metrics'
      ],
      tagline: 'Keeps the mission funded and flowing.'
    }
  ]

  // Filter roles based on selected filters
  const filteredRoles = roles.filter(role => {
    const dayMatch = filters.day === 'all' || role.days.includes(filters.day)
    const categoryMatch = filters.category === 'all' || role.category === filters.category
    const typeMatch = filters.type === 'all' || role.type === filters.type
    return dayMatch && categoryMatch && typeMatch
  })

  // Smooth scroll function
  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      })
    }
  }

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }))
  }

  const handleRoleSelect = (e) => {
    const options = Array.from(e.target.selectedOptions, option => option.value)
    setFormData(prev => ({ ...prev, roles: options }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In production, this would send to a backend API
    console.log('Form submitted:', formData)
    setIsSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleCards(prev => [...new Set([...prev, entry.target.dataset.cardId])])
          }
        })
      },
      { threshold: 0.1 }
    )

    const cards = document.querySelectorAll('[data-card-id]')
    cards.forEach(card => observer.observe(card))

    return () => observer.disconnect()
  }, [filteredRoles])

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-700 to-green-500 text-white py-24 md:py-32">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Volunteer with Seed & Spoon
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-95">
            Join a movement that nourishes Newark with dignity and community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => scrollToSection('roles')}
              className="btn-primary text-lg px-8 py-4 w-full sm:w-auto"
              aria-label="Scroll to volunteer roles section"
            >
              See Open Roles
            </button>
            <button
              onClick={() => scrollToSection('signup')}
              className="btn-outline text-lg px-8 py-4 w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-green-700 transition-all duration-300"
              aria-label="Scroll to volunteer application form"
            >
              Apply to Volunteer
            </button>
          </div>
        </div>
      </section>

      {/* Instructions Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-charcoal">
            How to Volunteer
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Getting started is simple. Follow these four steps to join our volunteer community.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Choose Your Role',
                description: 'Review the volunteer roles below and pick what fits your schedule or skills.'
              },
              {
                step: '2',
                title: 'Fill Out the Form',
                description: 'Complete the sign-up form at the bottom of this page with your information.'
              },
              {
                step: '3',
                title: 'Share Your Background',
                description: 'Attach a resume or LinkedIn profile if you have one (optional but helpful).'
              },
              {
                step: '4',
                title: 'Join Orientation',
                description: 'Our coordinator will reach out within 48 hours to schedule your orientation.'
              }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-harvest-orange text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-md">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-charcoal">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-leaf-light bg-opacity-20 border-l-4 border-leaf-mid rounded-lg max-w-3xl mx-auto">
            <p className="text-lg text-charcoal">
              <strong>💚 Volunteer Benefits:</strong> All volunteers receive meals-to-go, respect, and ongoing support. You're not just helping — you're part of our family.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section id="roles" className="py-8 bg-gray-50 border-y border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <label className="flex items-center gap-2">
              <span className="font-medium text-charcoal">Day:</span>
              <select
                value={filters.day}
                onChange={(e) => setFilters(prev => ({ ...prev, day: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-soil bg-white"
                aria-label="Filter by day of the week"
              >
                <option value="all">All Days</option>
                <option value="Mon">Monday</option>
                <option value="Tue">Tuesday</option>
                <option value="Wed">Wednesday</option>
                <option value="Thu">Thursday</option>
                <option value="Fri">Friday</option>
                <option value="Sat">Saturday</option>
              </select>
            </label>

            <label className="flex items-center gap-2">
              <span className="font-medium text-charcoal">Category:</span>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-soil bg-white"
                aria-label="Filter by category"
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
            </label>

            <button
              onClick={() => setFilters({ day: 'all', category: 'all', type: 'all' })}
              className="px-4 py-2 text-primary-soil hover:text-harvest-orange transition-colors font-medium"
              aria-label="Clear all filters"
            >
              Clear Filters
            </button>
          </div>

          <p className="text-center mt-4 text-gray-600">
            Showing {filteredRoles.length} of {roles.length} roles
          </p>
        </div>
      </section>

      {/* Volunteer Roles Grid */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-charcoal">
            Volunteer Opportunities
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Find the role that fits your passion, schedule, and skills. Every position makes a real difference.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                data-card-id={role.id}
                className={`bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-all duration-300 flex flex-col transform ${
                  visibleCards.includes(String(role.id)) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                role="article"
                aria-label={`${role.title} volunteer role`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-4xl" role="img" aria-label={role.title}>{role.emoji}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-charcoal mb-1">{role.title}</h3>
                    <p className="text-sm text-harvest-orange font-medium">{role.schedule}</p>
                  </div>
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {role.duties.map((duty, idx) => (
                    <li key={idx} className="text-gray-600 text-sm flex items-start gap-2">
                      <span className="text-leaf-mid mt-1">•</span>
                      <span>{duty}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-primary-soil font-medium mb-4 flex items-start gap-2">
                    <span>✅</span>
                    <span>{role.tagline}</span>
                  </p>
                  <button
                    onClick={() => scrollToSection('signup')}
                    className="btn-primary w-full"
                    aria-label={`Sign up for ${role.title} role`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredRoles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">No roles match your filters. Please try different criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Sign-Up Form Section */}
      <section id="signup" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-charcoal">
            Join the Volunteer Team
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Every shift helps feed families with dignity. Fill out this form and we'll reach out within 48 hours.
          </p>

          {isSubmitted ? (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-700 mb-4">Thank You!</h3>
              <p className="text-lg text-gray-700 mb-6">
                Our team will contact you soon to schedule orientation and next steps.
              </p>
              <button
                onClick={() => {
                  setIsSubmitted(false)
                  setFormData({
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
                    orientationAgreement: false,
                    photoConsent: false
                  })
                }}
                className="btn-primary"
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="md:col-span-2">
                  <label htmlFor="fullName" className="block text-sm font-medium text-charcoal mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-soil focus:border-transparent transition-all"
                    aria-required="true"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-soil focus:border-transparent transition-all"
                    aria-required="true"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-charcoal mb-2">
                    Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-soil focus:border-transparent transition-all"
                    aria-required="true"
                  />
                </div>

                {/* Preferred Contact */}
                <div>
                  <label htmlFor="preferredContact" className="block text-sm font-medium text-charcoal mb-2">
                    Preferred Contact Method
                  </label>
                  <select
                    id="preferredContact"
                    name="preferredContact"
                    value={formData.preferredContact}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-soil focus:border-transparent transition-all"
                  >
                    <option value="email">Email</option>
                    <option value="text">Text Message</option>
                    <option value="phone">Phone Call</option>
                  </select>
                </div>

                {/* Volunteer Roles */}
                <div>
                  <label htmlFor="roles" className="block text-sm font-medium text-charcoal mb-2">
                    Volunteer Role(s) <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="roles"
                    name="roles"
                    multiple
                    required
                    value={formData.roles}
                    onChange={handleRoleSelect}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-soil focus:border-transparent transition-all min-h-[120px]"
                    aria-required="true"
                    aria-describedby="roles-help"
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.title}>
                        {role.emoji} {role.title}
                      </option>
                    ))}
                  </select>
                  <p id="roles-help" className="text-xs text-gray-500 mt-1">
                    Hold Ctrl (Windows) or Cmd (Mac) to select multiple roles
                  </p>
                </div>

                {/* Availability */}
                <div className="md:col-span-2">
                  <label htmlFor="availability" className="block text-sm font-medium text-charcoal mb-2">
                    Availability (Days/Times)
                  </label>
                  <textarea
                    id="availability"
                    name="availability"
                    rows="3"
                    value={formData.availability}
                    onChange={handleInputChange}
                    placeholder="e.g., Wednesdays 9am-2pm, Fridays after 3pm"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-soil focus:border-transparent transition-all"
                  />
                </div>

                {/* Resume Upload */}
                <div>
                  <label htmlFor="resume" className="block text-sm font-medium text-charcoal mb-2">
                    Resume Upload
                  </label>
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-soil focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary-soil file:text-white file:cursor-pointer hover:file:bg-green-800"
                  />
                  <p className="text-xs text-gray-500 mt-1">PDF or Word document accepted</p>
                </div>

                {/* LinkedIn */}
                <div>
                  <label htmlFor="linkedin" className="block text-sm font-medium text-charcoal mb-2">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    id="linkedin"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-soil focus:border-transparent transition-all"
                  />
                </div>

                {/* Accessibility Notes */}
                <div className="md:col-span-2">
                  <label htmlFor="accessibilityNotes" className="block text-sm font-medium text-charcoal mb-2">
                    Accessibility Notes
                  </label>
                  <textarea
                    id="accessibilityNotes"
                    name="accessibilityNotes"
                    rows="2"
                    value={formData.accessibilityNotes}
                    onChange={handleInputChange}
                    placeholder="Let us know if you need any accommodations"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-soil focus:border-transparent transition-all"
                  />
                </div>

                {/* Transportation */}
                <div className="md:col-span-2">
                  <label htmlFor="transportation" className="block text-sm font-medium text-charcoal mb-2">
                    Transportation Option (for driver roles)
                  </label>
                  <input
                    type="text"
                    id="transportation"
                    name="transportation"
                    value={formData.transportation}
                    onChange={handleInputChange}
                    placeholder="e.g., Own vehicle, valid driver's license"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-soil focus:border-transparent transition-all"
                  />
                </div>

                {/* Message */}
                <div className="md:col-span-2">
                  <label htmlFor="message" className="block text-sm font-medium text-charcoal mb-2">
                    Message or Motivation
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us why you want to volunteer with Seed & Spoon"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-soil focus:border-transparent transition-all"
                  />
                </div>

                {/* Checkboxes */}
                <div className="md:col-span-2 space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="orientationAgreement"
                      required
                      checked={formData.orientationAgreement}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-primary-soil focus:ring-2 focus:ring-primary-soil rounded"
                      aria-required="true"
                    />
                    <span className="text-sm text-charcoal">
                      I agree to attend a volunteer orientation before my first shift. <span className="text-red-500">*</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="photoConsent"
                      checked={formData.photoConsent}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 text-primary-soil focus:ring-2 focus:ring-primary-soil rounded"
                    />
                    <span className="text-sm text-charcoal">
                      I consent to having my photo taken for Seed & Spoon promotional materials (optional).
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  type="submit"
                  className="btn-primary w-full text-lg py-4"
                >
                  Apply to Volunteer
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Closing CTA Band */}
      <section className="py-12 bg-harvest-orange text-white">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Have Questions?
          </h3>
          <p className="text-lg mb-6 opacity-95">
            Call or text <a href="tel:+17327071769" className="underline hover:text-gray-100">+1 (732) 707-1769</a>
            <br className="md:hidden" />
            <span className="hidden md:inline"> or </span>
            email <a href="mailto:hello@seedandspoon.org" className="underline hover:text-gray-100">hello@seedandspoon.org</a>
          </p>
          <a
            href="/programs"
            className="inline-block px-8 py-3 bg-white text-harvest-orange font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
          >
            Back to Programs
          </a>
        </div>
      </section>

      {/* Stay Connected Component */}
      <StayConnected />
    </div>
  )
}
