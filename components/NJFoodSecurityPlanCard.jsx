const SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Report",
  "name": "New Jersey Food Security 3-Year Strategic Plan (2026)",
  "description": "A three-year statewide roadmap from the NJ Office of the Food Security Advocate using a six-dimensional framework to address food insecurity affecting over 1.1 million New Jerseyans.",
  "datePublished": "2026-01-01",
  "publisher": {
    "@type": "GovernmentOrganization",
    "name": "New Jersey Office of the Food Security Advocate",
    "url": "https://www.nj.gov/foodsecurity"
  },
  "url": "https://www.nj.gov/foodsecurity/food-security/strategic-plan",
  "about": [
    { "@type": "Thing", "name": "Food insecurity" },
    { "@type": "Thing", "name": "Newark, New Jersey" },
    { "@type": "Thing", "name": "Food access" },
    { "@type": "Thing", "name": "Nutrition infrastructure" }
  ],
  "mentions": {
    "@type": "NGO",
    "name": "Seed & Spoon",
    "url": "https://www.seedandspoon.org",
    "description": "A Newark-based nonprofit addressing youth food insecurity through technology-driven food access programs."
  }
};

export default function NJFoodSecurityPlanCard() {
  return (
    <>
      {/* JSON-LD rendered inline — next/head is not supported in Next.js 15 App Router */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />

      <article
        className="research-card"
        style={{
          background: "#f0f4f0",
          border: "1px solid #d6e4d6",
          borderRadius: "16px",
          padding: "28px 24px",
          maxWidth: "680px",
          fontFamily: "inherit",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
          <span style={{ background: "#2d5a27", color: "#fff", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", padding: "5px 12px", borderRadius: "999px", textTransform: "uppercase" }}>
            Strategic Plan — 2026
          </span>
          <span style={{ color: "#6b7a6b", fontSize: "13px" }}>NJ Office of the Food Security Advocate</span>
        </div>

        <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1a2e1a", lineHeight: "1.3", margin: "0 0 10px" }}>
          New Jersey Food Security 3-Year Strategic Plan (2026)
        </h2>

        <div style={{ marginBottom: "16px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#e8f0e8", border: "1px solid #c2d6c2", borderRadius: "6px", padding: "3px 10px", fontSize: "12px", color: "#3a5c3a", fontWeight: "600" }}>
            <span style={{ opacity: 0.7 }}>SOURCE</span>
            <span>nj.gov/foodsecurity</span>
          </span>
        </div>

        <p style={{ fontSize: "14px", lineHeight: "1.7", color: "#3d4d3d", margin: "0 0 14px" }}>
          New Jersey's Office of the Food Security Advocate (OFSA) released its first-ever statewide Food Security Strategic Plan in January 2026 — a three-year roadmap developed alongside community partners, researchers, and residents across the state. The plan uses a six-dimensional framework (access, availability, utilization, stability, agency, and sustainability) to guide coordinated action on food insecurity, which now affects <strong>over 1.1 million New Jerseyans</strong> — 11.7% of the population.
        </p>

        <p style={{ fontSize: "14px", lineHeight: "1.7", color: "#3d4d3d", margin: "0 0 14px" }}>
          As a Newark-based food access nonprofit,{" "}
          <a href="https://www.seedandspoon.org" style={{ color: "#2d5a27", fontWeight: "600", textDecoration: "underline" }}>Seed & Spoon</a>'s work aligns directly with the plan's priorities. Newark was one of nine communities specifically identified in OFSA's statewide survey as experiencing high rates of food insecurity, with residents scoring significantly lower than the state average on economic food access, food choice agency, and availability of healthy foods at stores and pantries. The plan calls for expanded community-based food infrastructure, stronger local partnerships, and multi-benefit hubs — all areas where Seed & Spoon actively operates.
        </p>

        <p style={{ fontSize: "14px", lineHeight: "1.7", color: "#3d4d3d", margin: "0 0 20px" }}>
          We share this report as a policy reference for our community, partners, and funders. Understanding the statewide landscape helps us stay aligned with evidence-based approaches and communicate clearly about the structural conditions driving hunger in our city.{" "}
          <a href="https://www.seedandspoon.org/causes" style={{ color: "#2d5a27", fontWeight: "600", textDecoration: "underline" }}>Learn more about how Seed & Spoon is responding to these findings →</a>
        </p>

        <div style={{ background: "#fff", border: "1px solid #d6e4d6", borderLeft: "4px solid #4a8a3f", borderRadius: "8px", padding: "16px 18px", marginBottom: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", color: "#4a8a3f", textTransform: "uppercase", margin: "0 0 10px" }}>
            Key Findings Relevant to Newark
          </p>
          <ul style={{ margin: 0, padding: "0 0 0 18px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {[
              "Newark was oversampled as a high food insecurity community in the 2025 statewide survey",
              "24% of Black residents and 22% of Latino residents experienced food insecurity in 2023 — more than 3× the rate for white residents",
              "Agency (the ability to shape one's food environment) scored lowest of all six dimensions statewide",
              "Child food insecurity rose from 9% to 13.5% between 2020 and 2023",
              "The plan identifies multi-benefit hubs and community-rooted food enterprise investment as priority strategies",
            ].map((item, i) => (
              <li key={i} style={{ fontSize: "13px", color: "#3d4d3d", lineHeight: "1.6" }}>{item}</li>
            ))}
          </ul>
        </div>

        <a
          href="https://www.nj.gov/foodsecurity/food-security/strategic-plan"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#2d5a27", color: "#fff", fontSize: "13px", fontWeight: "700", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", letterSpacing: "0.02em" }}
        >
          Read the Full Report
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </article>
    </>
  );
}
