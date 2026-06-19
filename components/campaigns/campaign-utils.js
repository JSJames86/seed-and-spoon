import { useState, useEffect, useMemo } from "react";

export const FONT_DISPLAY = "var(--font-fraunces), Georgia, serif";
export const FONT_BODY = "var(--font-hanken-grotesk), ui-sans-serif, system-ui, -apple-system, sans-serif";

export const TOKENS = {
  forestDeep: "#102A22",
  forest: "#1B4332",
  green: "#4FAF3B",
  leaf: "#A6D47A",
  cream: "#F8F6F0",
  gold: "#E8A33D",
  red: "#9E2B25",
  orange: "#E86A1D",
};

export const DEFAULT_CAMPAIGN = {
  status: "live",
  title: "Freedom means a full plate.",
  subtitle:
    "This Juneteenth, help us raise $25,000 to feed Newark kids all summer — through our 5 Loaves pilot and the families on our list right now.",
  goal_amount: 25000,
  raised_amount: 0,
  cost_per_meal: 3.56,
  donate_url: "/donate?campaign=juneteenth-2026",
  share_url: "",
  hero_image_url: "",
  org_line: "Seed & Spoon, Inc. · EIN 41-4059078 · 501(c)(3) status pending",
};

export function usd(n) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export function useCampaignMeter(campaign) {
  const goal = Math.max(1, campaign.goal_amount);
  const raised = Math.max(0, Math.min(campaign.raised_amount, goal * 1.5));
  const pct = Math.min(100, (raised / goal) * 100);

  const goalMeals = useMemo(
    () => Math.round(goal / (campaign.cost_per_meal || 3.56) / 100) * 100,
    [goal, campaign.cost_per_meal],
  );

  const [fill, setFill] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setFill(pct), 120);
    return () => clearTimeout(t);
  }, [pct]);

  return { goal, raised, pct, goalMeals, fill };
}

export function cardBackground(heroImageUrl) {
  return heroImageUrl
    ? `linear-gradient(180deg, rgba(16,42,34,0.62) 0%, rgba(16,42,34,0.88) 58%, rgba(16,42,34,0.97) 100%), url(${heroImageUrl}) center/cover no-repeat`
    : `radial-gradient(120% 120% at 18% 0%, ${TOKENS.forest} 0%, ${TOKENS.forestDeep} 70%)`;
}

export const BASE_STYLES = {
  wrap: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    fontFamily: FONT_BODY,
  },
  card: {
    position: "relative",
    width: "100%",
    maxWidth: 460,
    borderRadius: 24,
    padding: "30px 28px 22px",
    color: TOKENS.cream,
    overflow: "hidden",
    border: "1px solid rgba(248,246,240,0.12)",
    boxShadow:
      "0 1px 0 rgba(248,246,240,0.06) inset, 0 24px 60px -28px rgba(0,0,0,0.65)",
    boxSizing: "border-box",
  },
  live: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(248,246,240,0.82)",
    background: "rgba(248,246,240,0.08)",
    border: "1px solid rgba(248,246,240,0.14)",
    padding: "5px 11px 5px 9px",
    borderRadius: 999,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: TOKENS.green,
    display: "inline-block",
  },
  title: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 600,
    fontSize: "clamp(30px, 7vw, 38px)",
    lineHeight: 1.04,
    letterSpacing: "-0.015em",
    margin: "0 0 14px",
    color: TOKENS.cream,
  },
  sub: {
    fontSize: 15,
    lineHeight: 1.5,
    color: "rgba(248,246,240,0.78)",
    margin: "0 0 26px",
    maxWidth: 384,
  },
  meterTop: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 9,
  },
  raised: {
    fontFamily: FONT_DISPLAY,
    fontSize: 26,
    fontWeight: 600,
    color: TOKENS.cream,
    letterSpacing: "-0.01em",
  },
  raisedLabel: {
    fontFamily: FONT_BODY,
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(248,246,240,0.6)",
    marginLeft: 2,
  },
  pct: {
    fontSize: 13,
    fontWeight: 700,
    color: TOKENS.leaf,
    letterSpacing: "0.01em",
  },
  track: {
    width: "100%",
    height: 11,
    borderRadius: 999,
    background: "rgba(248,246,240,0.10)",
    overflow: "hidden",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.35)",
  },
  goalRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    fontSize: 12.5,
    color: "rgba(248,246,240,0.6)",
    fontWeight: 500,
  },
  sep: { opacity: 0.5 },
  cta: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 22,
    padding: "15px 18px",
    borderRadius: 14,
    color: TOKENS.cream,
    fontSize: 16,
    fontWeight: 700,
    textDecoration: "none",
    letterSpacing: "0.005em",
  },
  underCta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 13,
  },
  share: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12.5,
    fontWeight: 600,
    color: "rgba(248,246,240,0.7)",
    textDecoration: "none",
  },
  tagline: {
    fontSize: 12.5,
    color: "rgba(248,246,240,0.55)",
    marginLeft: "auto",
  },
  org: {
    marginTop: 18,
    paddingTop: 14,
    borderTop: "1px solid rgba(248,246,240,0.10)",
    fontSize: 11,
    lineHeight: 1.5,
    color: "rgba(248,246,240,0.5)",
  },
};

export function scopedCSS(prefix) {
  return `
.${prefix}-dot { animation: ${prefix}Pulse 2s ease-in-out infinite; }
@keyframes ${prefix}Pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(79,175,59,0.55); }
  50% { box-shadow: 0 0 0 5px rgba(79,175,59,0); }
}
.${prefix}-cta { transition: transform .15s ease, box-shadow .15s ease, filter .15s ease; }
.${prefix}-cta:hover { transform: translateY(-1px); filter: brightness(1.04); }
.${prefix}-cta:active { transform: translateY(0); }
.${prefix}-cta:focus-visible { outline: 3px solid ${TOKENS.leaf}; outline-offset: 3px; }
.${prefix}-fill { position: relative; }
.${prefix}-fill::after {
  content: ""; position: absolute; inset: 0; border-radius: 999px;
  background: linear-gradient(90deg, transparent, rgba(248,246,240,0.35), transparent);
  transform: translateX(-100%); animation: ${prefix}Shimmer 2.8s ease-in-out 1.6s infinite;
}
.${prefix}-share:hover { color: ${TOKENS.cream}; }
@keyframes ${prefix}Shimmer { 0% { transform: translateX(-100%);} 55%,100% { transform: translateX(100%);} }
@media (prefers-reduced-motion: reduce) {
  .${prefix}-fill { transition: none !important; }
  .${prefix}-fill::after, .${prefix}-dot { animation: none !important; }
}`;
}
