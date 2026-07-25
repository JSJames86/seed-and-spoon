import type { CSSProperties } from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Link,
} from "@react-email/components";

/**
 * Seed & Spoon newsletter template.
 *
 * One component you reuse every issue — swap the props, keep the layout.
 * Renders to the table-based, inline-styled HTML that email clients respect.
 *
 * The unsubscribe link uses Resend's Broadcast token: when you send this as a
 * Broadcast, Resend replaces {{{RESEND_UNSUBSCRIBE_URL}}} with a per-contact
 * link and injects the List-Unsubscribe headers Gmail/Yahoo require. Do not
 * hand-roll your own unsubscribe — let Resend own that flow.
 */

export interface Story {
  title: string;
  body: string;
  href?: string;
}

export interface NewsletterProps {
  previewText: string;   // inbox snippet, ~90 chars
  headline: string;
  intro: string;
  stories: Story[];
  ctaLabel?: string;
  ctaHref?: string;
}

// Fallback content so `bun run email dev` renders something.
const defaults: NewsletterProps = {
  previewText: "This month at Seed & Spoon: the 5 Loaves pilot, and how to help.",
  headline: "Seed & Spoon — Field Notes",
  intro:
    "A quick update on where things stand, what's moving, and one way you can pitch in this month.",
  stories: [
    {
      title: "The 5 Loaves pilot",
      body: "Weekend meals for kids who'd otherwise go without. We're lining up the kitchen and the funding to open the doors.",
      href: "https://seedandspoon.org/5-loaves",
    },
    {
      title: "Send us the receipts",
      body: "SpoonAssist compares grocery prices so families aren't overpaying. Your receipts make the data sharper.",
      href: "https://seedandspoon.org/receipts",
    },
  ],
  ctaLabel: "Support the work",
  ctaHref: "https://seedandspoon.org/donate",
};

export default function Newsletter(props: Partial<NewsletterProps> = {}) {
  const { previewText, headline, intro, stories, ctaLabel, ctaHref } = {
    ...defaults,
    ...props,
  };

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={{ padding: "8px 0 24px" }}>
            {/* Swap for a hosted logo URL when you have one */}
            <Text style={brand}>SEED &amp; SPOON</Text>
          </Section>

          <Heading style={h1}>{headline}</Heading>
          <Text style={paragraph}>{intro}</Text>

          <Hr style={hr} />

          {stories.map((s, i) => (
            <Section key={i} style={{ marginBottom: 28 }}>
              <Heading as="h2" style={h2}>
                {s.title}
              </Heading>
              <Text style={paragraph}>{s.body}</Text>
              {s.href ? (
                <Link href={s.href} style={inlineLink}>
                  Read more &rarr;
                </Link>
              ) : null}
            </Section>
          ))}

          {ctaLabel && ctaHref ? (
            <Section style={{ textAlign: "center", margin: "32px 0" }}>
              <Button href={ctaHref} style={button}>
                {ctaLabel}
              </Button>
            </Section>
          ) : null}

          <Hr style={hr} />

          <Text style={footer}>
            Seed &amp; Spoon, Inc. · Newark, NJ
            <br />
            You&rsquo;re receiving this because you signed up at seedandspoon.org.
            <br />
            <Link href="{{{RESEND_UNSUBSCRIBE_URL}}}" style={footerLink}>
              Unsubscribe
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

/* ---- styles: inline-only, no flex/grid — email clients ignore them ---- */

const body: CSSProperties = {
  backgroundColor: "#f4f4ef",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: 0,
  padding: 0,
};

const container: CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "32px 28px",
  maxWidth: 560,
  borderRadius: 8,
};

const brand: CSSProperties = {
  fontSize: 13,
  letterSpacing: 2,
  fontWeight: 700,
  color: "#3f7d5c",
  margin: 0,
};

const h1: CSSProperties = {
  fontSize: 24,
  lineHeight: "32px",
  color: "#1c2b23",
  margin: "0 0 8px",
};

const h2: CSSProperties = {
  fontSize: 18,
  lineHeight: "24px",
  color: "#1c2b23",
  margin: "0 0 6px",
};

const paragraph: CSSProperties = {
  fontSize: 15,
  lineHeight: "24px",
  color: "#3a3a3a",
  margin: "0 0 8px",
};

const inlineLink: CSSProperties = {
  fontSize: 15,
  color: "#3f7d5c",
  fontWeight: 600,
  textDecoration: "none",
};

const button: CSSProperties = {
  backgroundColor: "#3f7d5c",
  color: "#ffffff",
  fontSize: 15,
  fontWeight: 600,
  textDecoration: "none",
  padding: "12px 24px",
  borderRadius: 6,
  display: "inline-block",
};

const hr: CSSProperties = {
  borderColor: "#e6e6e0",
  margin: "24px 0",
};

const footer: CSSProperties = {
  fontSize: 12,
  lineHeight: "18px",
  color: "#8a8a8a",
  textAlign: "center",
};

const footerLink: CSSProperties = {
  color: "#8a8a8a",
  textDecoration: "underline",
};
