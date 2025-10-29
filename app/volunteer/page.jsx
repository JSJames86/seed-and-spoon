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
      summary: "Light teamwork that fuels Thursday's cook day.", // Fixed: added comma, used double quotes
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
     
