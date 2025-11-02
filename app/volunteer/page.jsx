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
      summary: "Light teamwork that fuels Thursday's cook day.",
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
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    if (type === 'checkbox') setFormData(prev => ({ ...prev, [name]: checked }));
    else if (type === 'file') setFormData(prev => ({ ...prev, [name]: files[0] }));
    else if (name === 'roles') {
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setFormData(prev => ({ ...prev, roles: selectedOptions }));
    } else setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setFormSubmitted(true);
    smoothScroll('signup');
  };

  return (
    <main className="bg-cream pt-16 md:pt-20 lg:pt-24">
      {/* Hero Section */}
      <section className={`relative py-20 md:py-32 bg-gradient-to-br from-green-700 to-green-900 text-white transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-