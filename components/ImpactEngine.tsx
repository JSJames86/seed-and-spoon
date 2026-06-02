"use client";

import { useState } from "react";

const BRAND = {
  green: "#2d5a27",
  greenLight: "#4FAF3B",
  orange: "#E86A1D",
  cream: "#FAF7F2",
  dark: "#1a1a1a",
  muted: "#6b7280",
};

const PHASES = [
  { id: 1, label: "Phase 1", name: "Pilot", families: 25, year: "2025–2026" },
  { id: 2, label: "Phase 2", name: "Growth", families: 500, year: "2026–2027" },
  { id: 3, label: "Phase 3", name: "Scale", families: 10000, year: "2028–2030" },
  { id: 4, label: "Phase 4", name: "Full Deploy", families: 50000, year: "2031+" },
];

const NEWARK_ZONES = [
  { name: "Newark South", county: "Essex", pop: 42713 },
  { name: "Newark West", county: "Essex", pop: 49065 },
  { name: "Newark North & Central", county: "Essex", pop: 49741 },
  { name: "Newark East", county: "Essex", pop: 40427 },
  { name: "East Orange", county: "Essex", pop: 45808 },
  { name: "Irvington", county: "Essex", pop: 28367 },
  { name: "Orange / West Orange", county: "Essex", pop: 35976 },
];

const TOTAL_FOOD_DESERT_POP = NEWARK_ZONES.reduce((a, z) => a + z.pop, 0);
const CHILD_RATE = 0.24;
const AVG_HOUSEHOLD_SIZE = 3.6;
const MEALS_PER_KIT = 14;
const KITS_PER_FAMILY_WEEK = 1;
const GROCERY_TRIPS_AVOIDED_PER_WEEK = 1.5;
const LBS_PER_KIT = 12;
const WEEKS_PER_YEAR = 52;

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function fmtDollar(n: number) {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(0) + "K";
  return "$" + n.toLocaleString();
}

function calcOutputs(families: number, costPerKit: number) {
  const people = Math.round(families * AVG_HOUSEHOLD_SIZE);
  const children = Math.round(people * CHILD_RATE);
  const mealsPerYear = families * KITS_PER_FAMILY_WEEK * MEALS_PER_KIT * WEEKS_PER_YEAR;
  const lbsPerYear = families * KITS_PER_FAMILY_WEEK * LBS_PER_KIT * WEEKS_PER_YEAR;
  const tripsAvoided = Math.round(families * GROCERY_TRIPS_AVOIDED_PER_WEEK * WEEKS_PER_YEAR);
  const annualCost = families * KITS_PER_FAMILY_WEEK * costPerKit * WEEKS_PER_YEAR;
  const costPerMeal = annualCost / mealsPerYear;
  const coveragePct = ((families * AVG_HOUSEHOLD_SIZE) / TOTAL_FOOD_DESERT_POP * 100).toFixed(1);
  const mealsPerDollar = 1 / costPerMeal;
  const familiesPer100k = Math.round(100000 / (costPerKit * WEEKS_PER_YEAR));
  const familiesPerMillion = Math.round(1_000_000 / (costPerKit * WEEKS_PER_YEAR));
  return {
    people, children, mealsPerYear, lbsPerYear, tripsAvoided,
    annualCost, costPerMeal, coveragePct, mealsPerDollar,
    familiesPer100k, familiesPerMillion,
  };
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${accent ? BRAND.orange : "#e5e7eb"}`,
      borderLeft: `4px solid ${accent ? BRAND.orange : BRAND.greenLight}`,
      borderRadius: 8,
      padding: "16px 20px",
      display: "flex",
      flexDirection: "column" as const,
      gap: 4,
    }}>
      <span style={{ fontSize: 11, fontFamily: "monospace", color: BRAND.muted, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{label}</span>
      <span style={{ fontSize: 26, fontWeight: 800, color: accent ? BRAND.orange : BRAND.green, lineHeight: 1.1 }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: BRAND.muted, fontFamily: "monospace" }}>{sub}</span>}
    </div>
  );
}

function PhaseBar({ phase, families, costPerKit, active, onClick }: {
  phase: typeof PHASES[0]; families: number; costPerKit: number; active: boolean; onClick: () => void;
}) {
  const out = calcOutputs(families, costPerKit);
  return (
    <button onClick={onClick} style={{
      background: active ? BRAND.green : "#fff",
      border: `2px solid ${active ? BRAND.green : "#e5e7eb"}`,
      borderRadius: 10,
      padding: "14px 18px",
      cursor: "pointer",
      textAlign: "left" as const,
      transition: "all 0.2s",
      width: "100%",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: active ? "rgba(255,255,255,0.7)" : BRAND.muted, textTransform: "uppercase" as const }}>{phase.label} · {phase.year}</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: active ? "#fff" : BRAND.dark, marginTop: 2 }}>{phase.name}</div>
        </div>
        <div style={{ textAlign: "right" as const }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: active ? BRAND.greenLight : BRAND.green }}>{fmt(families)}</div>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: active ? "rgba(255,255,255,0.6)" : BRAND.muted }}>families</div>
        </div>
      </div>
      <div style={{ marginTop: 10, display: "flex", gap: 12 }}>
        {[
          { l: "Children", v: fmt(out.children) },
          { l: "Meals/yr", v: fmt(out.mealsPerYear) },
          { l: "Coverage", v: out.coveragePct + "%" },
        ].map(s => (
          <div key={s.l}>
            <div style={{ fontSize: 13, fontWeight: 700, color: active ? "#fff" : BRAND.dark, fontFamily: "monospace" }}>{s.v}</div>
            <div style={{ fontSize: 10, color: active ? "rgba(255,255,255,0.55)" : BRAND.muted, fontFamily: "monospace" }}>{s.l}</div>
          </div>
        ))}
      </div>
    </button>
  );
}

export default function ImpactEngine() {
  const [activePhase, setActivePhase] = useState(1);
  const [costPerKit, setCostPerKit] = useState(65);
  const [customFamilies, setCustomFamilies] = useState<number | null>(null);
  const [tab, setTab] = useState("outputs");

  const phase = PHASES.find(p => p.id === activePhase)!;
  const families = customFamilies !== null ? customFamilies : phase.families;
  const out = calcOutputs(families, costPerKit);

  const grantRows = [
    { funding: 10000, label: "$10K" },
    { funding: 50000, label: "$50K" },
    { funding: 100000, label: "$100K" },
    { funding: 500000, label: "$500K" },
    { funding: 1000000, label: "$1M" },
  ].map(r => {
    const f = Math.round(r.funding / (costPerKit * WEEKS_PER_YEAR));
    const o = calcOutputs(f, costPerKit);
    return { ...r, families: f, meals: o.mealsPerYear, children: o.children, lbs: o.lbsPerYear };
  });

  return (
    <div style={{ fontFamily: "sans-serif", background: BRAND.cream, minHeight: "100vh", padding: "0 0 60px" }}>
      {/* Header */}
      <div style={{ background: BRAND.green, padding: "28px 32px 24px" }}>
        <div style={{ fontSize: 13, fontFamily: "monospace", color: "rgba(255,255,255,0.7)", letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: 6 }}>🌱 Seed & Spoon</div>
        <h1 style={{ margin: 0, fontSize: 28, color: "#fff", fontWeight: 900 }}>Impact Engine</h1>
        <p style={{ margin: "8px 0 0", fontSize: 13, color: "rgba(255,255,255,0.65)", fontFamily: "monospace" }}>Forward-looking community outcome projections</p>
      </div>

      <div style={{ padding: "24px 20px", maxWidth: 900, margin: "0 auto" }}>

        {/* Cost input */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: BRAND.muted, textTransform: "uppercase" as const }}>Cost per meal kit</div>
              <div style={{ fontSize: 12, color: BRAND.muted, marginTop: 2 }}>Adjust to model different funding scenarios</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="range" min={30} max={150} step={5} value={costPerKit}
                onChange={e => setCostPerKit(Number(e.target.value))}
                style={{ width: 140, accentColor: BRAND.green }} />
              <div style={{ fontSize: 24, fontWeight: 800, color: BRAND.green, minWidth: 60 }}>${costPerKit}</div>
            </div>
          </div>
        </div>

        {/* Phase selector */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: BRAND.muted, textTransform: "uppercase" as const, marginBottom: 10 }}>Select Phase</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {PHASES.map(p => (
              <PhaseBar key={p.id} phase={p} families={p.families} costPerKit={costPerKit}
                active={activePhase === p.id && customFamilies === null}
                onClick={() => { setActivePhase(p.id); setCustomFamilies(null); }} />
            ))}
          </div>
        </div>

        {/* Custom families */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", color: BRAND.muted, textTransform: "uppercase" as const, marginBottom: 8 }}>Custom family count</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="number" min={1} max={100000} placeholder="e.g. 2500"
              value={customFamilies || ""}
              onChange={e => setCustomFamilies(e.target.value ? Number(e.target.value) : null)}
              style={{ flex: 1, padding: "8px 12px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 16, fontFamily: "monospace", outline: "none" }} />
            {customFamilies && (
              <button onClick={() => setCustomFamilies(null)}
                style={{ padding: "8px 14px", background: "#f3f4f6", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "#e5e7eb", borderRadius: 8, padding: 4 }}>
          {[
            { id: "outputs", label: "Outputs" },
            { id: "grant", label: "Grant Calculator" },
            { id: "coverage", label: "Coverage" },
            { id: "kpis", label: "KPIs" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "8px 4px", border: "none", borderRadius: 6,
              background: tab === t.id ? "#fff" : "transparent",
              color: tab === t.id ? BRAND.green : BRAND.muted,
              fontFamily: "monospace", fontSize: 11, fontWeight: tab === t.id ? 700 : 400,
              cursor: "pointer", textTransform: "uppercase" as const,
              boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}>{t.label}</button>
          ))}
        </div>

        {/* OUTPUTS TAB */}
        {tab === "outputs" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
              <StatCard label="People Reached" value={fmt(out.people)} sub={`avg ${AVG_HOUSEHOLD_SIZE} per household`} />
              <StatCard label="Children Served" value={fmt(out.children)} sub="~24% of households" accent />
              <StatCard label="Meals / Year" value={fmt(out.mealsPerYear)} sub={`${MEALS_PER_KIT} meals per kit`} />
              <StatCard label="Lbs Food / Year" value={fmt(out.lbsPerYear)} sub={`${LBS_PER_KIT} lbs per kit`} />
              <StatCard label="Grocery Trips Avoided" value={fmt(out.tripsAvoided)} sub="per year" />
              <StatCard label="Food Desert Coverage" value={out.coveragePct + "%"} sub={`of ${fmt(TOTAL_FOOD_DESERT_POP)} Essex residents`} accent />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 20 }}>
              <StatCard label="Annual Program Cost" value={fmtDollar(out.annualCost)} sub="at current kit cost" />
              <StatCard label="Cost Per Meal" value={"$" + out.costPerMeal.toFixed(2)} sub="fully loaded" />
              <StatCard label="Meals Per $1" value={out.mealsPerDollar.toFixed(2)} sub="impact per dollar" accent />
              <StatCard label="Families Per $100K" value={fmt(out.familiesPer100k)} sub="annual investment" />
            </div>
            <div style={{ background: BRAND.green, borderRadius: 10, padding: "20px 24px" }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.6)", textTransform: "uppercase" as const, marginBottom: 10 }}>📋 Grant Statement</div>
              <p style={{ margin: 0, color: "#fff", fontSize: 14, lineHeight: 1.7, fontStyle: "italic" }}>
                &ldquo;At {families.toLocaleString()} families served, Seed & Spoon&apos;s operating model is projected to deliver approximately <strong>{fmt(out.mealsPerYear)} meals</strong> and <strong>{fmt(out.lbsPerYear)} pounds of food</strong> annually, reaching an estimated <strong>{fmt(out.children)} children</strong> and representing <strong>{out.coveragePct}%</strong> of Essex County&apos;s designated food desert population of {fmt(TOTAL_FOOD_DESERT_POP)} residents. At a cost of ${costPerKit} per weekly meal kit, each program dollar generates approximately <strong>{out.mealsPerDollar.toFixed(2)} meals</strong> of direct nutritional impact.&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* GRANT CALCULATOR TAB */}
        {tab === "grant" && (
          <div>
            {grantRows.map(r => (
              <div key={r.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 18px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: BRAND.orange }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontFamily: "monospace", color: BRAND.muted }}>annually</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {[
                    { l: "Families", v: fmt(r.families) },
                    { l: "Children", v: fmt(r.children) },
                    { l: "Meals", v: fmt(r.meals) },
                    { l: "Lbs Food", v: fmt(r.lbs) },
                  ].map(s => (
                    <div key={s.l} style={{ textAlign: "center" as const }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.green }}>{s.v}</div>
                      <div style={{ fontSize: 10, fontFamily: "monospace", color: BRAND.muted }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* COVERAGE TAB */}
        {tab === "coverage" && (
          <div>
            {NEWARK_ZONES.map(z => {
              const reached = Math.min(z.pop, Math.round((families * AVG_HOUSEHOLD_SIZE) * (z.pop / TOTAL_FOOD_DESERT_POP)));
              const pct = ((reached / z.pop) * 100).toFixed(1);
              return (
                <div key={z.name} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "14px 18px", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: BRAND.dark }}>{z.name}</div>
                      <div style={{ fontSize: 11, fontFamily: "monospace", color: BRAND.muted }}>{z.pop.toLocaleString()} residents</div>
                    </div>
                    <div style={{ textAlign: "right" as const }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: BRAND.green }}>{pct}%</div>
                      <div style={{ fontSize: 11, fontFamily: "monospace", color: BRAND.muted }}>{reached.toLocaleString()} reached</div>
                    </div>
                  </div>
                  <div style={{ background: "#f3f4f6", borderRadius: 4, height: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: pct + "%", background: `linear-gradient(90deg, ${BRAND.greenLight}, ${BRAND.green})`, borderRadius: 4, transition: "width 0.4s" }} />
                  </div>
                </div>
              );
            })}
            <div style={{ background: BRAND.green, borderRadius: 10, padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.6)" }}>Total Essex Food Desert Pop</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{fmt(TOTAL_FOOD_DESERT_POP)}</div>
                </div>
                <div style={{ textAlign: "right" as const }}>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.6)" }}>Projected Coverage</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: BRAND.greenLight }}>{out.coveragePct}%</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KPIs TAB */}
        {tab === "kpis" && (
          <div>
            {[
              {
                category: "Operational KPIs", color: BRAND.green,
                items: [
                  { kpi: "Meal kits delivered / week", target: fmt(families * KITS_PER_FAMILY_WEEK), unit: "kits" },
                  { kpi: "Meals delivered / week", target: fmt(families * KITS_PER_FAMILY_WEEK * MEALS_PER_KIT), unit: "meals" },
                  { kpi: "Lbs food distributed / week", target: fmt(families * KITS_PER_FAMILY_WEEK * LBS_PER_KIT), unit: "lbs" },
                  { kpi: "On-time delivery rate", target: "≥ 95%", unit: "target" },
                  { kpi: "Volunteer hours / week", target: fmt(Math.ceil(families * 0.15)), unit: "hrs est." },
                ],
              },
              {
                category: "Impact KPIs", color: BRAND.orange,
                items: [
                  { kpi: "Active families served", target: fmt(families), unit: "households" },
                  { kpi: "Children reached", target: fmt(out.children), unit: "est." },
                  { kpi: "Food desert coverage", target: out.coveragePct + "%", unit: "Essex County" },
                  { kpi: "Grocery trips avoided / yr", target: fmt(out.tripsAvoided), unit: "trips" },
                  { kpi: "Family retention rate", target: "≥ 80%", unit: "target" },
                ],
              },
              {
                category: "Financial KPIs", color: "#6366f1",
                items: [
                  { kpi: "Annual program cost", target: fmtDollar(out.annualCost), unit: "projected" },
                  { kpi: "Cost per meal", target: "$" + out.costPerMeal.toFixed(2), unit: "fully loaded" },
                  { kpi: "Meals per $1 donated", target: out.mealsPerDollar.toFixed(2), unit: "meals" },
                  { kpi: "Families per $100K", target: fmt(out.familiesPer100k), unit: "annually" },
                  { kpi: "Families per $1M", target: fmt(out.familiesPerMillion), unit: "annually" },
                ],
              },
            ].map(section => (
              <div key={section.category} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: "monospace", color: section.color, textTransform: "uppercase" as const, marginBottom: 8, fontWeight: 700 }}>{section.category}</div>
                {section.items.map(item => (
                  <div key={item.kpi} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: BRAND.dark }}>{item.kpi}</span>
                    <div style={{ textAlign: "right" as const }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: section.color }}>{item.target}</span>
                      <span style={{ fontSize: 10, fontFamily: "monospace", color: BRAND.muted, marginLeft: 6 }}>{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid #e5e7eb", textAlign: "center" as const }}>
          <p style={{ margin: 0, fontSize: 11, fontFamily: "monospace", color: BRAND.muted }}>
            Seed & Spoon, Inc. · Newark, NJ · Impact Engine v1.0<br />
            All figures are Service Capacity Projections based on standardized operating assumptions.
          </p>
        </div>

      </div>
    </div>
  );
}
