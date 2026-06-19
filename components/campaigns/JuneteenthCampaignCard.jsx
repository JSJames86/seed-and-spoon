'use client';

import { ArrowRight, Heart, Share2 } from "lucide-react";
import {
  TOKENS, DEFAULT_CAMPAIGN, BASE_STYLES as B,
  usd, useCampaignMeter, cardBackground, scopedCSS,
} from "./campaign-utils";

const PREFIX = "ss-j";

const DEFAULTS = {
  ...DEFAULT_CAMPAIGN,
  eyebrow: "JUNE 19 — FREEDOM DAY",
};

export default function JuneteenthCampaignCard({ campaign = {} }) {
  const c = { ...DEFAULTS, ...campaign };
  const { goal, raised, pct, goalMeals, fill } = useCampaignMeter(c);

  return (
    <div style={B.wrap}>
      <style>{scopedCSS(PREFIX)}</style>

      <article style={{ ...B.card, background: cardBackground(c.hero_image_url) }}>
        <span
          aria-hidden
          style={{
            position: "absolute", top: -46, right: -38, width: 150, height: 150,
            borderRadius: "50%", pointerEvents: "none",
            background: `radial-gradient(circle, ${TOKENS.gold}33 0%, transparent 62%)`,
          }}
        />

        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 22 }}>
          <span style={{ fontSize: 11.5, letterSpacing: "0.16em", fontWeight: 700, color: TOKENS.gold }}>
            {c.eyebrow}
          </span>
          {c.status === "live" && (
            <span style={B.live}>
              <span style={B.dot} className={`${PREFIX}-dot`} />
              Campaign live
            </span>
          )}
        </header>

        <h2 style={B.title}>{c.title}</h2>
        <p style={B.sub}>{c.subtitle}</p>

        <div style={B.meterTop}>
          <span style={B.raised}>{usd(raised)} <span style={B.raisedLabel}>raised</span></span>
          <span style={B.pct}>{Math.round(pct)}% funded</span>
        </div>

        <div style={B.track}>
          <div
            className={`${PREFIX}-fill`}
            style={{
              height: "100%", borderRadius: 999, minWidth: 6,
              background: `linear-gradient(90deg, ${TOKENS.red} 0%, ${TOKENS.gold} 48%, ${TOKENS.green} 100%)`,
              transition: "width 1.4s cubic-bezier(0.22, 1, 0.36, 1)",
              width: `${fill}%`,
            }}
          />
        </div>

        <div style={B.goalRow}>
          <span>Goal {usd(goal)}</span>
          <span style={B.sep}>&middot;</span>
          <span>&asymp; {goalMeals.toLocaleString("en-US")} meals</span>
        </div>

        <a
          href={c.donate_url}
          className={`${PREFIX}-cta`}
          style={{ ...B.cta, background: TOKENS.orange, boxShadow: "0 14px 26px -14px rgba(232,106,29,0.85)" }}
        >
          <Heart size={18} strokeWidth={2.4} style={{ fill: TOKENS.cream }} />
          {c.cta_label}
          <ArrowRight size={18} strokeWidth={2.4} style={{ marginLeft: "auto" }} />
        </a>

        <div style={B.underCta}>
          {c.share_url ? (
            <a href={c.share_url} style={B.share} className={`${PREFIX}-share`}>
              <Share2 size={14} strokeWidth={2.2} /> Share the campaign
            </a>
          ) : <span />}
          <span style={B.tagline}>Every dollar feeds a kid</span>
        </div>

        <p style={B.org}>{c.org_line}</p>
      </article>
    </div>
  );
}
