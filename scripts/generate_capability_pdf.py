"""
Generate capability-statement.pdf for Seed & Spoon, Inc.
Faithfully recreates the two-page Canva design using reportlab.
"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.pdfgen import canvas
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate
from reportlab.lib.colors import HexColor

# Brand colors
DARK_GREEN = HexColor("#1e3d1a")
MED_GREEN = HexColor("#2d5a27")
LIGHT_GREEN = HexColor("#4a7c42")
ORANGE = HexColor("#d4742a")
CREAM = HexColor("#f9f6f0")
WHITE = colors.white
LIGHT_GRAY = HexColor("#f5f5f5")
GRAY_TEXT = HexColor("#555555")
DARK_TEXT = HexColor("#1a1a1a")

W, H = letter  # 612 x 792 pts


def draw_page1(c, doc):
    c.saveState()

    # ── HEADER BAND ───────────────────────────────────────────────────────────
    header_h = 160
    c.setFillColor(DARK_GREEN)
    c.rect(0, H - header_h, W, header_h, fill=1, stroke=0)

    # White circle (logo placeholder)
    cx, cy = 100, H - header_h / 2
    c.setFillColor(WHITE)
    c.circle(cx, cy, 58, fill=1, stroke=0)

    # "Seed & Spoon" in circle
    c.setFillColor(MED_GREEN)
    c.setFont("Helvetica-Bold", 13)
    c.drawCentredString(cx, cy + 4, "Seed & Spoon")
    c.setFont("Helvetica", 8)
    c.setFillColor(DARK_GREEN)
    c.drawCentredString(cx, cy - 10, "INCORPORATED")

    # Org name top-right
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 14)
    c.drawRightString(W - 20, H - 32, "SEED AND SPOON,")
    c.drawRightString(W - 20, H - 50, "INCORPORATED")

    # "CAPABILITY" in orange, "STATEMENT" in white
    c.setFont("Helvetica-Bold", 38)
    c.setFillColor(ORANGE)
    cap_w = c.stringWidth("CAPABILITY ", "Helvetica-Bold", 38)
    c.drawString(185, H - 105, "CAPABILITY")
    c.setFillColor(WHITE)
    c.drawString(185 + cap_w - 4, H - 105, " STATEMENT")

    # Tagline
    c.setFont("Helvetica-Oblique", 13)
    c.setFillColor(HexColor("#dddddd"))
    c.drawString(185, H - 128, "Feeding Futures. Fighting Youth Food Insecurity.")

    # ── LEFT SIDEBAR ──────────────────────────────────────────────────────────
    sb_w = 185
    sb_top = H - header_h
    sb_h = sb_top - 52  # leave space for footer
    c.setFillColor(DARK_GREEN)
    c.rect(0, 52, sb_w, sb_h, fill=1, stroke=0)

    def sidebar_box(title, y_start, lines, mono_keys=None):
        """Draw a rounded box inside the sidebar."""
        pad = 10
        box_x = 8
        box_w = sb_w - 16

        # Title bar
        c.setFillColor(WHITE)
        c.roundRect(box_x, y_start - 22, box_w, 22, 4, fill=1, stroke=0)
        c.setFillColor(DARK_GREEN)
        c.setFont("Helvetica-Bold", 8.5)
        c.drawCentredString(box_x + box_w / 2, y_start - 15, title)

        # Body
        body_h = len(lines) * 14 + 12
        c.setFillColor(HexColor("#1a351a"))
        c.roundRect(box_x, y_start - 22 - body_h, box_w, body_h, 4, fill=1, stroke=0)

        y = y_start - 34
        for line in lines:
            if mono_keys and any(line.strip().startswith(k) for k in mono_keys):
                label, _, val = line.partition(":")
                c.setFont("Helvetica-Bold", 7.5)
                c.setFillColor(HexColor("#aaaaaa"))
                c.drawString(box_x + pad, y, label.strip() + ":")
                lw = c.stringWidth(label.strip() + ":", "Helvetica-Bold", 7.5)
                c.setFont("Helvetica", 7.5)
                c.setFillColor(WHITE)
                c.drawString(box_x + pad + lw + 3, y, val.strip())
            elif line.startswith("•"):
                c.setFont("Helvetica", 7.5)
                c.setFillColor(WHITE)
                c.drawString(box_x + pad, y, line)
            else:
                c.setFont("Helvetica-Bold", 7.5)
                c.setFillColor(WHITE)
                c.drawString(box_x + pad, y, line)
            y -= 14
        return y_start - 22 - body_h - 8

    # Business overview
    biz_lines = [
        "MAILING: 229 Bruce Street",
        "ADDRESS: Newark, New Jersey 07103",
        "FOUNDED: 2026",
        "STRUCTURE: Nonprofit (Women-Owned, 501(c)(3))",
        "UEI: JZQRPU1GRRM6",
        "CAGE CODE: 207U1",
        "DUNS: 14-376-5630",
    ]
    y = sidebar_box("BUSINESS OVERVIEW", sb_top - 12, biz_lines,
                    mono_keys=["MAILING", "ADDRESS", "FOUNDED", "STRUCTURE", "UEI", "CAGE", "DUNS"])

    # Mission
    mission_text = [
        "Seed & Spoon's mission is to nourish",
        "and support youth experiencing instability",
        "by addressing food insecurity and",
        "providing access to meals, stability",
        "pathways, and supportive programs that",
        "build stability, independence, and",
        "long-term opportunity.",
    ]
    y = sidebar_box("OUR MISSION", y - 4, mission_text)

    # Who we serve
    serve_lines = [
        "Communities impacted by food",
        "insecurity, with a focus on:",
        "• Youth Facing Food Insecurity",
        "• Food-Insecure Families",
        "• Underserved Communities",
        "• Schools & Educational Partners",
        "• Community Organizations",
        "• Crisis-Affected Populations",
    ]
    sidebar_box("WHO WE SERVE", y - 4, serve_lines)

    # ── MAIN CONTENT ──────────────────────────────────────────────────────────
    mx = sb_w + 14
    mw = W - mx - 16
    my = H - header_h - 12

    def section_title(title, y):
        c.setFont("Helvetica-Bold", 13)
        c.setFillColor(MED_GREEN)
        c.drawString(mx, y, title)
        c.setStrokeColor(MED_GREEN)
        c.setLineWidth(1)
        c.line(mx, y - 4, mx + mw, y - 4)
        return y - 18

    # ABOUT SEED AND SPOON
    y = section_title("ABOUT SEED AND SPOON", my)
    about_text = (
        "Seed and Spoon is a New Jersey-based nonprofit organization specializing in "
        "youth food insecurity intervention, community food distribution, and family "
        "support services. We partner with schools, community organizations, and local "
        "stakeholders to provide consistent access to nutritious food and essential "
        "resources for underserved populations."
    )
    about2 = (
        "Our approach combines immediate food assistance with long-term, "
        "sustainability-focused strategies that strengthen community food systems and "
        "improve outcomes for children and families. Seed and Spoon is committed to "
        "delivering reliable, scalable, and impact-driven services aligned with public "
        "and community needs."
    )

    def wrapped_text(text, x, y, width, font="Helvetica", size=8.5, color=GRAY_TEXT, leading=13):
        c.setFont(font, size)
        c.setFillColor(color)
        words = text.split()
        line = ""
        for word in words:
            test = (line + " " + word).strip()
            if c.stringWidth(test, font, size) <= width:
                line = test
            else:
                c.drawString(x, y, line)
                y -= leading
                line = word
        if line:
            c.drawString(x, y, line)
            y -= leading
        return y

    y = wrapped_text(about_text, mx, y, mw)
    y -= 4
    y = wrapped_text(about2, mx, y, mw)
    y -= 14

    # WHY CHOOSE US
    y = section_title("WHY CHOOSE US?", y)

    why_items = [
        ("Community-\nCentered\nApproach", "We work directly within communities to ensure food support reaches those who need it most."),
        ("Youth-\nFocused\nImpact", "Our programs are designed specifically to address the unique challenges of youth food insecurity."),
        ("Partnership-\nDriven Model", "We collaborate with schools, nonprofits, and local organizations to expand reach."),
        ("Sustainable\nSolutions", "We focus on long-term food access strategies that go beyond temporary relief."),
    ]

    box_w2 = (mw - 9) / 4
    bx = mx
    by = y
    box_h2 = 70
    for i, (label, desc) in enumerate(why_items):
        c.setFillColor(MED_GREEN)
        c.roundRect(bx, by - box_h2, box_w2, box_h2, 5, fill=1, stroke=0)
        # Circle label
        c.setFillColor(WHITE)
        c.circle(bx + box_w2 / 2, by - 18, 22, fill=1, stroke=0)
        c.setFillColor(MED_GREEN)
        c.setFont("Helvetica-Bold", 6.5)
        lines = label.split("\n")
        for j, ln in enumerate(lines):
            c.drawCentredString(bx + box_w2 / 2, by - 14 + (len(lines) - 1) * 4 - j * 8, ln)
        # Desc
        desc_y = by - 46
        c.setFillColor(WHITE)
        words = desc.split()
        line = ""
        for word in words:
            test = (line + " " + word).strip()
            if c.stringWidth(test, "Helvetica", 6) <= box_w2 - 6:
                line = test
            else:
                c.setFont("Helvetica", 6)
                c.drawCentredString(bx + box_w2 / 2, desc_y, line)
                desc_y -= 8
                line = word
        if line:
            c.setFont("Helvetica", 6)
            c.drawCentredString(bx + box_w2 / 2, desc_y, line)
        bx += box_w2 + 3

    # Rapid response banner
    y = by - box_h2 - 8
    c.setFillColor(ORANGE)
    c.roundRect(mx, y - 26, mw, 26, 5, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(mx + mw / 2, y - 11, "Rapid Response Capability")
    c.setFont("Helvetica", 7.5)
    c.drawCentredString(mx + mw / 2, y - 22, "We are positioned to respond quickly to urgent food needs within communities during times of crisis.")
    y -= 38

    # NAICS + CERTIFICATIONS side by side
    half = mw / 2 - 6
    nx = mx
    cert_x = mx + half + 12

    y = section_title("NAICS CODES", y) + 14
    cert_y = y + 14

    naics = [
        ("624210", "Community Food Services"),
        ("624110", "Child and Youth Services"),
        ("813319", "Other Social Advocacy Organizations"),
    ]
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(MED_GREEN)
    c.drawString(cert_x - 2, cert_y, "CERTIFICATIONS")
    c.setStrokeColor(MED_GREEN)
    c.line(cert_x - 2, cert_y - 4, cert_x + half, cert_y - 4)
    cert_y -= 18

    for code, label in naics:
        c.setFont("Helvetica", 8)
        c.setFillColor(DARK_TEXT)
        c.drawString(nx + 12, y, f"• {code} — {label}")
        y -= 13

    certs = [
        "Woman-Owned Organization",
        "Nonprofit Organization (501(c)(3) Pending)",
        "Registered New Jersey Charity (Pending)",
    ]
    for cert in certs:
        c.setFont("Helvetica", 8)
        c.setFillColor(DARK_TEXT)
        c.drawString(cert_x, cert_y, f"✓ {cert}")
        cert_y -= 13

    # ── FOOTER ────────────────────────────────────────────────────────────────
    footer_h = 52
    c.setFillColor(DARK_GREEN)
    c.rect(0, 0, W, footer_h, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 9)
    c.drawCentredString(W * 0.18, 22, "☎  1 (732) 707-1769")
    c.drawCentredString(W * 0.5, 22, "⌖  https://seedandspoon.org")
    c.drawCentredString(W * 0.82, 22, "✉  hello@seedandspoon.org")

    c.restoreState()


def draw_page2(c, doc):
    c.saveState()

    # ── FOOTER ────────────────────────────────────────────────────────────────
    footer_h = 52
    c.setFillColor(DARK_GREEN)
    c.rect(0, 0, W, footer_h, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 9)
    c.drawCentredString(W * 0.18, 22, "☎  1 (732) 707-1769")
    c.drawCentredString(W * 0.5, 22, "⌖  https://seedandspoon.org")
    c.drawCentredString(W * 0.82, 22, "✉  hello@seedandspoon.org")

    # ── TOP HALF: photo placeholder + PAST PERFORMANCE ───────────────────────
    top_h = 320
    top_y = H - top_h
    photo_w = W * 0.42

    # Photo area (dark green placeholder with caption)
    c.setFillColor(MED_GREEN)
    c.rect(0, top_y, photo_w, top_h, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(photo_w / 2, top_y + top_h / 2 + 10, "Community Food")
    c.drawCentredString(photo_w / 2, top_y + top_h / 2 - 5, "Distribution")
    c.setFont("Helvetica", 9)
    c.drawCentredString(photo_w / 2, top_y + top_h / 2 - 22, "Seed & Spoon")

    # PAST PERFORMANCE
    pp_x = photo_w + 16
    pp_w = W - pp_x - 16
    py = H - 20

    c.setFont("Helvetica-Bold", 15)
    c.setFillColor(MED_GREEN)
    c.drawString(pp_x, py, "PAST PERFORMANCE")
    c.setStrokeColor(MED_GREEN)
    c.line(pp_x, py - 5, pp_x + pp_w, py - 5)
    py -= 22

    pp_sections = [
        (
            "Program Development & Community Engagement",
            "Developing and implementing initiatives focused on addressing youth food "
            "insecurity and expanding access to nutritious food within underserved communities.",
        ),
        (
            "Community Partnerships & Outreach",
            "Establishing relationships with local organizations, schools, and community "
            "stakeholders to support food distribution efforts and program growth.",
        ),
        (
            "Food Access & Distribution Efforts",
            "Participating in and organizing efforts to provide food resources to families "
            "and children experiencing food insecurity.",
        ),
        (
            "Organizational & Operational Development",
            "Completed foundational infrastructure including federal registration, UEI "
            "acquisition, and compliance preparation through SAM.gov to support future "
            "funding and partnerships.",
        ),
    ]

    def wrapped(text, x, y, width, font="Helvetica", size=8, color=GRAY_TEXT, leading=11):
        c.setFont(font, size)
        c.setFillColor(color)
        words = text.split()
        line = ""
        for word in words:
            test = (line + " " + word).strip()
            if c.stringWidth(test, font, size) <= width:
                line = test
            else:
                c.drawString(x, y, line)
                y -= leading
                line = word
        if line:
            c.drawString(x, y, line)
            y -= leading
        return y

    for title, desc in pp_sections:
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(ORANGE)
        c.drawString(pp_x, py, title)
        py -= 12
        py = wrapped(desc, pp_x + 8, py, pp_w - 8)
        py -= 8

    # ── BOTTOM HALF: CORE COMPETENCIES + DIFFERENTIATORS ─────────────────────
    bot_h = top_y - footer_h
    half_w = W / 2

    # Core competencies (dark green background)
    c.setFillColor(DARK_GREEN)
    c.rect(0, footer_h, half_w, bot_h, fill=1, stroke=0)

    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 13)
    c.drawCentredString(half_w / 2, footer_h + bot_h - 22, "CORE COMPETENCIES")
    c.setStrokeColor(WHITE)
    c.line(16, footer_h + bot_h - 28, half_w - 16, footer_h + bot_h - 28)

    competencies = [
        ("Youth Food Insecurity Programs",
         "Targeted initiatives addressing hunger and nutritional gaps among children."),
        ("Community Food Distribution",
         "Coordinated delivery of meals and food resources through outreach and local partnerships."),
        ("Family Food Support Services",
         "Assistance programs that help stabilize household access to consistent, nutritious food."),
        ("School & Community Partnerships",
         "Collaboration with schools and local organizations to expand food access."),
        ("Nutrition Access & Education Support",
         "Promoting healthy food access and basic nutrition awareness within communities."),
        ("Emergency Food Response",
         "Rapid deployment of food resources during times of crisis or urgent community need."),
    ]

    cy2 = footer_h + bot_h - 44
    for heading, body in competencies:
        c.setFont("Helvetica-Bold", 8.5)
        c.setFillColor(ORANGE)
        c.drawString(16, cy2, heading)
        cy2 -= 11
        cy2 = wrapped(body, 24, cy2, half_w - 40, color=HexColor("#cccccc"), leading=10)
        cy2 -= 6

    # Differentiators (light background)
    c.setFillColor(LIGHT_GRAY)
    c.rect(half_w, footer_h, half_w, bot_h, fill=1, stroke=0)

    c.setFont("Helvetica-Bold", 13)
    c.setFillColor(MED_GREEN)
    c.drawString(half_w + 14, footer_h + bot_h - 22, "DIFFERENTIATORS")
    c.setStrokeColor(MED_GREEN)
    c.line(half_w + 14, footer_h + bot_h - 28, W - 16, footer_h + bot_h - 28)

    differentiators = [
        ("Youth-Centered Food Security Model",
         "Programs are specifically designed to address the unique needs of children and families, not just general food distribution."),
        ("Community-Integrated Delivery Approach",
         "Services are delivered through trusted local networks, increasing accessibility, engagement, and impact."),
        ("Partnership-Driven Expansion",
         "Collaborates with schools, nonprofits, and community organizations to scale programs efficiently."),
        ("Sustainability-Focused Solutions",
         "Focuses on long-term food access strategies that reduce recurring food insecurity rather than temporary relief."),
        ("Rapid Response Capability",
         "Able to mobilize quickly to meet urgent food needs during emergencies and community crises."),
    ]

    dy = footer_h + bot_h - 44
    for heading, body in differentiators:
        c.setFont("Helvetica-Bold", 8.5)
        c.setFillColor(MED_GREEN)
        c.drawString(half_w + 14, dy, heading)
        dy -= 11
        dy = wrapped(body, half_w + 22, dy, half_w - 38, color=GRAY_TEXT, leading=10)
        dy -= 6

    c.restoreState()


# ── OUTPUT ────────────────────────────────────────────────────────────────────
output_path = os.path.join(
    os.path.dirname(__file__), "..", "public", "documents", "capability-statement.pdf"
)
os.makedirs(os.path.dirname(output_path), exist_ok=True)

c = canvas.Canvas(output_path, pagesize=letter)
draw_page1(c, None)
c.showPage()
draw_page2(c, None)
c.save()

print(f"PDF written to: {os.path.abspath(output_path)}")
