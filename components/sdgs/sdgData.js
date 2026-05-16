export const SDG_GOALS = [
  {
    number: 2,
    slug: "02",
    name: "Zero Hunger",
    color: "#DDA63A",
    description:
      "Helping reduce childhood hunger through community meal initiatives and food rescue programs.",
    tier: "primary",
    url: "https://sdgs.un.org/goals/goal2",
  },
  {
    number: 3,
    slug: "03",
    name: "Good Health & Well-Being",
    color: "#4C9F38",
    description:
      "Improving community wellbeing through reliable access to nutritious food and reduced family stress.",
    tier: "primary",
    url: "https://sdgs.un.org/goals/goal3",
  },
  {
    number: 10,
    slug: "10",
    name: "Reduced Inequalities",
    color: "#DD1367",
    description:
      "Lowering barriers to food access for underserved families and children in Essex County.",
    tier: "primary",
    url: "https://sdgs.un.org/goals/goal10",
  },
  {
    number: 1,
    slug: "01",
    name: "No Poverty",
    color: "#E5243B",
    description:
      "Providing meals helps families redirect limited resources toward housing, utilities, and healthcare.",
    tier: "secondary",
    url: "https://sdgs.un.org/goals/goal1",
  },
  {
    number: 11,
    slug: "11",
    name: "Sustainable Cities & Communities",
    color: "#FD9D24",
    description:
      "Building stronger communities through local volunteer networks and food access infrastructure.",
    tier: "secondary",
    url: "https://sdgs.un.org/goals/goal11",
  },
];

export const PRIMARY_SDGS = SDG_GOALS.filter((g) => g.tier === "primary");
export const SECONDARY_SDGS = SDG_GOALS.filter((g) => g.tier === "secondary");
export const FOOTER_SDGS = SDG_GOALS.filter((g) => g.tier === "primary");
