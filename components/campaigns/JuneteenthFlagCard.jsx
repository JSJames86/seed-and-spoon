'use client';

import { ArrowRight, Heart, Share2 } from "lucide-react";
import {
  TOKENS, DEFAULT_CAMPAIGN, BASE_STYLES as B, FONT_DISPLAY,
  usd, useCampaignMeter, cardBackground, scopedCSS,
} from "./campaign-utils";

const PREFIX = "ss-jf";

const FLAG = {
  blue: "#4F7BE0",
  red: "#E0473F",
  white: "#FFFFFF",
};

const DEFAULTS = {
  ...DEFAULT_CAMPAIGN,
  eyebrow: "JUNETEENTH 2026",
  date_line: "JUNE 19, 1865",
  kicker: "Our Independence Day.",
  subtitle:
    "America turns 250 this year. Yet nearly 1 in 3 Black households with children still faces food insecurity. Help us raise $25,000 to provide 7,000 meals for Newark kids this summer.",
  cta_style: "orange",
};

function burst(cx, cy, spikes, outerR, innerR) {
  const pts = [];
  const step = Math.PI / spikes;
  let rot = -Math.PI / 2;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(`${(cx + Math.cos(rot) * r).toFixed(2)},${(cy + Math.sin(rot) * r).toFixed(2)}`);
    rot += step;
  }
  return pts.join(" ");
}

function NovaStar({ size = 100, stroke = FLAG.white, fill = "none", filled = false, strokeWidth = 2.2, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style} aria-hidden>
      <polygon
        points={burst(50, 50, 12, 47, 33)}
        fill={filled ? stroke : "none"}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
      <polygon points={burst(50, 50, 5, 25, 10)} fill={fill === "none" ? stroke : fill} />
    </svg>
  );
}

const TOKEN_CSS = `
.${PREFIX}-token { transition: left 1.4s cubic-bezier(0.22,1,0.36,1); }
@media (prefers-reduced-motion: reduce) {
  .${PREFIX}-token { transition: none !important; }
}`;

export default function JuneteenthFlagCard({ campaign = {} }) {
  const c = { ...DEFAULTS, ...campaign };
  const { goal, raised, pct, goalMeals, fill } = useCampaignMeter(c);
  const tokenLeft = Math.min(98, Math.max(2, fill));
  const ctaBg = c.cta_style === "red" ? FLAG.red : TOKENS.orange;

  return (
    <div style={B.wrap}>
      <style>{scopedCSS(PREFIX)}{TOKEN_CSS}</style>

      <article style={{ ...B.card, background: cardBackground(c.hero_image_url) }}>
        {/* Juneteenth flag layer: horizon arc + faint blue/red fields */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          viewBox="0 0 400 520"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d="M0,224 Q200,158 400,224 L400,0 L0,0 Z" fill={FLAG.blue} opacity="0.10" />
          <path d="M0,224 Q200,158 400,224 L400,520 L0,520 Z" fill={FLAG.red} opacity="0.07" />
          <path d="M0,224 Q200,158 400,224" stroke={FLAG.white} strokeOpacity="0.16" strokeWidth="1.5" fill="none" />
        </svg>

        <NovaStar
          size={150} stroke={FLAG.white} strokeWidth={1.4}
          style={{ position: "absolute", top: -34, right: -30, opacity: 0.28, pointerEvents: "none" }}
        />

        <header style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 22 }}>
          <div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <NovaStar size={13} filled stroke={FLAG.red} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, letterSpacing: "0.16em", fontWeight: 700, color: TOKENS.cream }}>
                {c.eyebrow}
              </span>
            </span>
            <span style={{
              display: "block", width: 66, height: 3, borderRadius: 2, marginTop: 8,
              background: `linear-gradient(90deg, ${FLAG.blue} 0 38%, ${FLAG.white} 38% 62%, ${FLAG.red} 62% 100%)`,
            }} />
            <span style={{
              display: "block", marginTop: 7, fontSize: 10.5, letterSpacing: "0.18em",
              fontWeight: 600, color: "rgba(248,246,240,0.55)",
            }}>
              {c.date_line}
            </span>
          </div>
          {c.status === "live" && (
            <span style={B.live}>
              <span style={B.dot} className={`${PREFIX}-dot`} />
              Campaign live
            </span>
          )}
        </header>

        <h2 style={{ ...B.title, position: "relative", margin: "0 0 6px" }}>{c.title}</h2>
        {c.kicker && (
          <p style={{
            position: "relative", fontFamily: FONT_DISPLAY,
            fontStyle: "italic", fontWeight: 500, fontSize: 16, color: TOKENS.leaf,
            margin: "0 0 14px", letterSpacing: "0.005em",
          }}>
            {c.kicker}
          </p>
        )}
        <p style={{ ...B.sub, position: "relative" }}>{c.subtitle}</p>

        <div style={{ ...B.meterTop, position: "relative" }}>
          <span style={B.raised}>{usd(raised)} <span style={B.raisedLabel}>raised</span></span>
          <span style={B.pct}>{Math.round(pct)}% funded</span>
        </div>

        {/* Green meter (brand) with nova token riding the leading edge */}
        <div style={{ position: "relative" }}>
          <div style={B.track}>
            <div
              className={`${PREFIX}-fill`}
              style={{
                height: "100%", borderRadius: 999, minWidth: 6,
                background: `linear-gradient(90deg, ${TOKENS.forest} 0%, ${TOKENS.green} 70%, ${TOKENS.leaf} 100%)`,
                transition: "width 1.4s cubic-bezier(0.22,1,0.36,1)",
                width: `${fill}%`,
              }}
            />
          </div>
          <span
            className={`${PREFIX}-token`}
            style={{
              position: "absolute", top: "50%", left: `${tokenLeft}%`,
              transform: "translate(-50%,-50%)",
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.45))",
              pointerEvents: "none", display: "flex",
            }}
          >
            <NovaStar size={20} filled stroke={FLAG.white} strokeWidth={1.6} />
          </span>
        </div>

        <div style={{ ...B.goalRow, position: "relative" }}>
          <span>Goal {usd(goal)}</span>
          <span style={B.sep}>&middot;</span>
          <span>&asymp; {goalMeals.toLocaleString("en-US")} meals</span>
        </div>

        <a
          href={c.donate_url}
          className={`${PREFIX}-cta`}
          style={{ ...B.cta, position: "relative", background: ctaBg, boxShadow: "0 14px 26px -16px rgba(0,0,0,0.7)" }}
        >
          <Heart size={18} strokeWidth={2.4} style={{ fill: TOKENS.cream }} />
          {c.cta_label}
          <ArrowRight size={18} strokeWidth={2.4} style={{ marginLeft: "auto" }} />
        </a>

        <div style={{ ...B.underCta, position: "relative" }}>
          {c.share_url ? (
            <a href={c.share_url} className={`${PREFIX}-share`} style={B.share}>
              <Share2 size={14} strokeWidth={2.2} /> Share
            </a>
          ) : <span />}
          <span style={{ ...B.tagline, color: "rgba(248,246,240,0.6)", fontWeight: 500 }}>
            By us. For us. For our children.
          </span>
        </div>

        <p style={{ ...B.org, position: "relative" }}>{c.org_line}</p>
      </article>
    </div>
  );
}
