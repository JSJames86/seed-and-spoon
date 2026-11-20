"""
Render public/documents/seed-and-spoon-capability-statement.pdf (2 pages, Letter).

Org facts mirror lib/org.ts. Every claim must be true as published: Seed & Spoon
is pre-launch, so "past performance" lists completed organizational work, not
services delivered. Update the CONTENT below, then run:

    pip install playwright && python -m playwright install chromium
    python scripts/render_capability_statement.py
"""
import base64
import html
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public/documents/seed-and-spoon-capability-statement.pdf"

ORG = {
    "legal_name": "Seed & Spoon, Inc.",
    "ein": "41-4059078",
    "uei": "JZQRPU1GRRM6",
    "cage": "207U1",
    "duns": "14-376-5630",
    "sam_expires": "April 30, 2027",
    "nj_reg": "CH4946600",
    "founded": "February 3, 2026 (New Jersey)",
    "status": "501(c)(3) public charity, IRC §170(b)(1)(A)(vi)",
    "contact": "Janelle Glanville, Founder & Executive Director",
    "address": ["229 Bruce Street", "Newark, NJ 07103"],
    "phone": "(732) 707-1769",
    "email": "hello@seedandspoon.org",
    "web": "seedandspoon.org",
}

CONTENT = {
    "tagline": "Feeding Futures. Fighting Youth Food Insecurity.",
    "overview": [
        "Seed & Spoon is a Newark-based nonprofit building the infrastructure to end weekend and out-of-school hunger for children in Essex County, New Jersey.",
        "For many Newark children, school is the most reliable source of food they have. From Friday afternoon to Monday morning, that guarantee disappears. Seed & Spoon closes that gap with a system families can count on every weekend: freshly prepared meals, built on food safety, dignity, and measured outcomes.",
    ],
    "mission": "Seed & Spoon exists to understand and solve childhood food insecurity.",
    "serve": [
        "Children and youth experiencing food insecurity",
        "Families with infants and young children",
        "Newark and Essex County households",
        "Schools and educational partners",
        "Community and faith-based organizations",
    ],
    "snapshot": [
        ("Up to 25", "children in the first pilot cohort"),
        ("15", "consecutive weekends"),
        ("10", "meal-equivalents per child, per weekend"),
        ("Fri–Sun", "lunch, dinner, breakfasts, and snacks"),
    ],
    "snapshot_note": "Freshly prepared in a licensed commercial kitchen under our HACCP plan, sealed, and delivered to partner schools, homes, or community sites on Fridays.",
    "credentials": [
        "IRS 501(c)(3) determination (Sept. 24, 2026)",
        "NJ registered charity, approved Oct. 5, 2026",
        "SAM.gov registered (active)",
        "2026 New Jersey Commitment for Food Security",
        "Woman-founded and woman-led",
    ],
    "naics": [
        ("624210", "Community Food Services"),
        ("624110", "Child and Youth Services"),
        ("813319", "Other Social Advocacy Organizations"),
    ],
    "competencies": [
        ("Weekend Meal Programming",
         "5 Loaves delivers 10 freshly prepared, sealed meal-equivalents per child each weekend, covering Friday through Sunday."),
        ("Food Safety & Allergen Management",
         "Formal HACCP plan and SOPs; per-child allergen matrix (Big 9 plus sesame, with severity); tamper-evident seals and batch traceability."),
        ("Infant & Family Nutrition",
         "Formula Supplement Pilot design for supplemental weekend infant formula alongside 5 Loaves."),
        ("Technology & Data Infrastructure",
         "In-house family intake, outcome surveys, volunteer onboarding, donor CRM, and donation processing. No software subscriptions draining mission dollars."),
        ("Research & Evaluation",
         "Baseline, weekly, and endline measurement of food security and program satisfaction; published research on modernizing hunger relief."),
        ("School & Community Partnerships",
         "Schools and community sites as referral partners and drop-off points, so meals reach children where they already are."),
    ],
    "performance": [
        ("2026 New Jersey Commitment for Food Security",
         "Named by the NJ Office of the Food Security Advocate for the Seed & Spoon Community Food Distribution System (Focus Area 2: Community-Based Food Infrastructure)."),
        ("Published Research",
         "Modernizing Hunger Relief: Technology, Infrastructure, and the Future of Youth Food Security (Zenodo, DOI: 10.5281/zenodo.20299779)."),
        ("5 Loaves Pilot Design",
         "Pilot built for up to 25 children over 15 weekends, with a HACCP plan, operating procedures, cost model, and budget completed before the first meal."),
        ("Program Infrastructure Built In-House",
         "Allergen-gated family intake, participant outcome surveys, volunteer onboarding with background checks, donor CRM, and campaign fundraising."),
        ("Compliance Foundation",
         "501(c)(3) determination, NJ charity registration, EIN, and SAM.gov registration completed within the first year."),
    ],
    "differentiators": [
        ("Dignity-First Access",
         "No income verification. A simple referral is all it takes."),
        ("Privacy by Design",
         "We never collect income, banking, or Social Security information."),
        ("Infrastructure, Not One-Off Relief",
         "Coverage is the standard: every enrolled child, every weekend."),
        ("Measured, Published Outcomes",
         "We track results, publish our costs, and change course when something isn't working."),
        ("Rooted Commitments",
         "Public commitments to dignity, privacy, transparency, and listening."),
    ],
}


def b64(path):
    return base64.b64encode(Path(path).read_bytes()).decode()


def render_html():
    e = html.escape
    logo = b64(ROOT / "public/logo-full.webp")
    fraunces = b64(ROOT / "app/fonts/fraunces-500-600.woff2")
    franklin = b64(ROOT / "app/fonts/libre-franklin-400-700.woff2")
    c = CONTENT

    def items(pairs, cls):
        return "".join(f'<div class="{cls}"><h4>{e(t)}</h4><p>{e(d)}</p></div>' for t, d in pairs)

    facts = [
        ("Legal Name", ORG["legal_name"]),
        ("Founded", ORG["founded"]),
        ("Status", ORG["status"]),
        ("EIN", ORG["ein"]),
        ("UEI", ORG["uei"]),
        ("CAGE Code", ORG["cage"]),
        ("DUNS", ORG["duns"]),
        ("NJ Charity Reg.", ORG["nj_reg"]),
        ("SAM.gov", f"Active through {ORG['sam_expires']}"),
    ]
    facts_html = "".join(f'<div class="fact"><span>{e(k)}</span><b>{e(v)}</b></div>' for k, v in facts)
    naics_html = "".join(f'<div class="fact"><b>{e(code)}</b><span class="n">{e(name)}</span></div>' for code, name in c["naics"])
    snap_html = "".join(f'<div class="stat"><b>{e(n)}</b><span>{e(l)}</span></div>' for n, l in c["snapshot"])
    cred_html = "".join(f"<li>{e(x)}</li>" for x in c["credentials"])
    serve_html = "".join(f"<li>{e(x)}</li>" for x in c["serve"])
    contact_html = (
        f'<p><b>{e(ORG["contact"])}</b></p><p>{"<br>".join(e(a) for a in ORG["address"])}</p>'
        f'<p>{e(ORG["phone"])}<br>{e(ORG["email"])}<br>{e(ORG["web"])}</p>'
    )
    footer = (f'<div class="footer">{e(ORG["legal_name"])} · EIN {e(ORG["ein"])} · UEI {e(ORG["uei"])} · '
              f'CAGE {e(ORG["cage"])} · {e(ORG["phone"])} · {e(ORG["email"])} · {e(ORG["web"])}</div>')
    header = f'''<div class="hdr"><img src="data:image/webp;base64,{logo}" alt="Seed &amp; Spoon">
      <div class="ttl"><div class="cap">Capability Statement</div><div class="tag">{e(c["tagline"])}</div></div></div>'''

    return f'''<!DOCTYPE html><html><head><meta charset="utf-8"><title>Seed &amp; Spoon Capability Statement</title><style>
@font-face{{font-family:Fraunces;src:url(data:font/woff2;base64,{fraunces})}}
@font-face{{font-family:Franklin;src:url(data:font/woff2;base64,{franklin})}}
@page{{size:Letter;margin:0}}
*{{box-sizing:border-box}}
body{{margin:0;font-family:Franklin,sans-serif;color:#1f2a1c;font-size:9.4pt;line-height:1.42}}
.page{{width:8.5in;height:11in;position:relative;overflow:hidden;background:#F8F6F0;page-break-after:always;display:flex;flex-direction:column}}
.hdr{{background:#fff;display:flex;align-items:center;gap:.3in;padding:.32in .5in .28in;border-bottom:5px solid #397E2A}}
.hdr img{{height:.78in}}
.cap{{font-family:Fraunces,serif;font-weight:600;font-size:27pt;color:#2d6421;line-height:1}}
.tag{{color:#B95213;font-weight:700;font-size:10pt;margin-top:6px;letter-spacing:.02em}}
.body{{display:flex;flex:1;min-height:0}}
.side{{width:2.55in;background:#2d6421;color:#fff;padding:.22in .26in}}
.side h3{{font-size:8pt;letter-spacing:.14em;text-transform:uppercase;color:#f3c08f;margin:.13in 0 .06in;font-weight:700}}
.side h3:first-child{{margin-top:0}}
.fact{{display:flex;flex-direction:column;margin-bottom:3px}}
.fact span{{font-size:7.3pt;letter-spacing:.06em;text-transform:uppercase;opacity:.75}}
.fact b{{font-size:9pt}}
.fact .n{{font-size:8.6pt;text-transform:none;letter-spacing:0;opacity:.95}}
.side ul{{margin:0;padding-left:14px}} .side li{{margin-bottom:3px;font-size:8.8pt}}
.side p{{margin:0 0 6px;font-size:8.8pt}}
.main{{flex:1;padding:.28in .4in .2in}}
.main h2{{font-family:Fraunces,serif;font-weight:600;font-size:14pt;color:#2d6421;margin:0 0 .07in;padding-bottom:3px;border-bottom:2px solid #e3dccb}}
.sec{{margin-bottom:.2in}}
.main p{{margin:0 0 7px}}
.mission{{background:#fff;border-left:5px solid #B95213;border-radius:8px;padding:.14in .18in;font-family:Fraunces,serif;font-size:13pt;font-weight:600;color:#2d6421}}
.main ul{{margin:0;padding-left:16px;columns:2;column-gap:.25in}} .main li{{margin-bottom:3px}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:.12in}}
.card{{background:#fff;border-radius:8px;padding:.1in .13in;border-top:3px solid #397E2A}}
.card h4,.row h4{{margin:0 0 2px;font-size:9.6pt;color:#1f2a1c}}
.card p,.row p{{margin:0;font-size:8.8pt;color:#3a3a3a}}
.row{{background:#fff;border-radius:8px;padding:.09in .14in;margin-bottom:.08in;border-left:4px solid #B95213}}
.diff{{background:#fff;border-radius:8px;padding:.09in .14in;margin-bottom:.08in;border-left:4px solid #397E2A}}
.diff h4{{margin:0 0 2px;font-size:9.6pt}} .diff p{{margin:0;font-size:8.8pt;color:#3a3a3a}}
.two{{display:grid;grid-template-columns:1.25fr 1fr;gap:.25in}}
.grid3{{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.12in}}
.snap{{display:grid;grid-template-columns:1fr 1fr;gap:.1in;margin-bottom:.1in}}
.stat{{background:#fff;border-radius:8px;padding:.1in .14in;border-top:3px solid #B95213}}
.stat b{{display:block;font-family:Fraunces,serif;font-size:18pt;color:#2d6421;line-height:1.1}}
.stat span{{font-size:8.8pt;color:#3a3a3a}}
.note{{font-size:9pt;color:#3a3a3a}}
.footer{{background:#2d6421;color:#fff;font-size:7.6pt;text-align:center;padding:.1in .3in}}
</style></head><body>
<div class="page">{header}
  <div class="body">
    <div class="side">
      <h3>Organization</h3>{facts_html}
      <h3>NAICS Codes</h3>{naics_html}
      <h3>Credentials</h3><ul>{cred_html}</ul>
      <h3>Contact</h3>{contact_html}
    </div>
    <div class="main">
      <div class="sec"><h2>Business Overview</h2>{"".join(f"<p>{e(p)}</p>" for p in c["overview"])}</div>
      <div class="sec"><h2>Our Mission</h2><div class="mission">{e(c["mission"])}</div></div>
      <div class="sec"><h2>Who We Serve</h2><ul>{serve_html}</ul></div>
      <div class="sec"><h2>Program Snapshot: 5 Loaves Weekend Meals</h2>
        <div class="snap">{snap_html}</div><p class="note">{e(c["snapshot_note"])}</p></div>
    </div>
  </div>{footer}
</div>
<div class="page">{header}
  <div class="main" style="flex:1">
    <div class="sec"><h2>Core Competencies</h2><div class="grid3">{items(c["competencies"], "card")}</div></div>
    <div class="two">
      <div><h2>Past Performance &amp; Accomplishments</h2>{items(c["performance"], "row")}</div>
      <div><h2>Differentiators</h2>{items(c["differentiators"], "diff")}</div>
    </div>
  </div>{footer}
</div>
</body></html>'''


def main():
    doc = render_html()
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.set_content(doc, wait_until="load")
        page.wait_for_timeout(300)
        page.pdf(path=str(OUT), format="Letter", print_background=True)
        browser.close()
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
