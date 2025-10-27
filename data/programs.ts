export type Tier = {
  amount: number;
  label: string;
  blurb: string;
};

export type Program = {
  id: string;
  emoji: string;
  name: string;
  goalUsd: number;
  summary: string;
  tiers: Tier[];
  ctaHref: string;
  ctaLabel?: string;
};

export const programs: Program[] = [
  {
    id: "hot_meals",
    emoji: "🍲",
    name: "Weekend Hot Meal Cohorts",
    goalUsd: 780000,
    summary: "Four 6-month cohorts delivering two hot meals per day for weekends to 25 families at a time. Friday pickup/delivery with confirmations to reduce waste.",
    ctaHref: "/donate?program=hot_meals",
    tiers: [
      { amount: 25, label: "One Meal", blurb: "Provide a warm, nutritious meal for one neighbor." },
      { amount: 50, label: "Feed Someone for a Day", blurb: "Covers two hot meals for one person." },
      { amount: 100, label: "Two People, One Day", blurb: "Two people receive two meals each." },
      { amount: 200, label: "Family of Four, One Day", blurb: "Covers two meals each for a family of four." },
      { amount: 600, label: "Sponsor a Family's Weekend", blurb: "Two meals/day for three days for one family." },
      { amount: 3900, label: "Adopt a Family (6 months)", blurb: "Fully supports one family for a full cohort." },
    ],
  },
  {
    id: "food_boxes",
    emoji: "🥕",
    name: "Stock the Pantry — Food Boxes",
    goalUsd: 8750,
    summary: "Monthly boxes with $150–$200 of pantry staples and fresh items, distributed year-round.",
    ctaHref: "/donate?program=food_boxes",
    tiers: [
      { amount: 50, label: "Help Fill a Box", blurb: "Contributes staples and fresh items." },
      { amount: 150, label: "Provide One Full Box", blurb: "Covers a month of groceries for a household." },
      { amount: 300, label: "Two Families, One Month", blurb: "Two complete pantry boxes." },
      { amount: 900, label: "Six Months for One Family", blurb: "Sustains a family through a cohort." },
    ],
  },
  {
    id: "community_dinners",
    emoji: "🎉",
    name: "Community Dinner Series",
    goalUsd: 30000,
    summary: "Six seasonal gatherings (Thanksgiving, Christmas, Mother's & Father's Day, Back-to-School, Veterans Day) with meals and occasion-specific support.",
    ctaHref: "/donate?program=community_dinners",
    tiers: [
      { amount: 25, label: "Set a Place", blurb: "Covers one guest's meal at a community dinner." },
      { amount: 100, label: "Meal + Gift/Supplies", blurb: "Feeds a guest and provides occasion-specific support." },
      { amount: 500, label: "Sponsor a Table", blurb: "Hosts a table of ten guests." },
      { amount: 5000, label: "Fund One Dinner", blurb: "Fully sponsors an entire community event." },
      { amount: 30000, label: "All Six Dinners", blurb: "Funds the series for the entire year." },
    ],
  },
  {
    id: "seed_training",
    emoji: "🌾",
    name: "The Seed — Training & Farming",
    goalUsd: 250000,
    summary: "Youth training in regenerative, hydroponic, and aquaponic farming; community garden hubs; and produce that supports our meal programs.",
    ctaHref: "/donate?program=seed_training",
    tiers: [
      { amount: 50, label: "Tools & Seeds", blurb: "Equips trainees with basic supplies." },
      { amount: 250, label: "Training Day", blurb: "Covers instruction, materials, and site costs." },
      { amount: 1000, label: "Trainee Stipends", blurb: "Supports weekly stipends for youth participants." },
      { amount: 10000, label: "Build a Garden Hub", blurb: "Funds infrastructure for a community grow site." },
    ],
  },
  {
    id: "operations",
    emoji: "🧰",
    name: "Operations & Overhead",
    goalUsd: 100000,
    summary: "Keeps the mission running: van & fuel, venues, website, insurance, and program logistics.",
    ctaHref: "/donate?program=operations",
    tiers: [
      { amount: 25, label: "Keep Us Moving", blurb: "Covers fuel and essential supplies." },
      { amount: 100, label: "One Operational Day", blurb: "Supports daily costs across programs." },
      { amount: 1000, label: "Equipment & Repairs", blurb: "Maintains vans and kitchen equipment." },
      { amount: 5000, label: "One Month Ops", blurb: "Underwrites a month of core operations." },
    ],
  },
  {
    id: "cleaning_sanitation",
    emoji: "🧼",
    name: "Cleaning & Sanitation Team",
    goalUsd: 75000,
    summary: "The backbone of safe food service: daily sanitation, dishwashing, waste handling, temperature logs, and compliance.",
    ctaHref: "/donate?program=cleaning_sanitation",
    tiers: [
      { amount: 25, label: "Sanitize a Station", blurb: "Disinfectants, gloves, towels, PPE." },
      { amount: 100, label: "Weekly PPE & Supplies", blurb: "Keeps the team equipped and compliant." },
      { amount: 1000, label: "Deep Clean Week", blurb: "Supports staffing for heavy prep weeks." },
      { amount: 5000, label: "Quarter Staffing", blurb: "Funds sanitation lead time and coverage." },
    ],
  },
];
