import type { CSSProperties, ReactNode } from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
} from "@react-email/components";

/**
 * Shared shell for every Seed & Spoon email. Header, footer, and the style
 * tokens live here so the individual templates stay short and consistent.
 *
 * `unsubscribeUrl` is optional and only relevant for list mail. Transactional
 * emails (welcome, donor thank-you, volunteer, application decisions) should
 * leave it out — they're triggered by an action, not a subscription, so they
 * don't need an unsubscribe line, and the Broadcast token wouldn't render here
 * anyway. Pass a real preferences URL only if you want one.
 */

export interface LayoutProps {
  preview: string;
  children: ReactNode;
  unsubscribeUrl?: string;
}

export default function Layout({ preview, children, unsubscribeUrl }: LayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={s.body}>
        <Container style={s.container}>
          <Section style={{ padding: "8px 0 20px" }}>
            <Text style={s.brand}>SEED &amp; SPOON</Text>
          </Section>

          {children}

          <Hr style={s.hr} />
          <Text style={s.footer}>
            Seed &amp; Spoon, Inc. · Newark, NJ
            {unsubscribeUrl ? (
              <>
                <br />
                <Link href={unsubscribeUrl} style={s.footerLink}>
                  Manage your email preferences
                </Link>
              </>
            ) : null}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

/* Shared, inline-only style tokens. Import these in any template. */
export const s = {
  body: {
    backgroundColor: "#f4f4ef",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    margin: 0,
    padding: 0,
  } as CSSProperties,
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "32px 28px",
    maxWidth: 560,
    borderRadius: 8,
  } as CSSProperties,
  brand: {
    fontSize: 13,
    letterSpacing: 2,
    fontWeight: 700,
    color: "#3f7d5c",
    margin: 0,
  } as CSSProperties,
  h1: {
    fontSize: 23,
    lineHeight: "31px",
    color: "#1c2b23",
    margin: "0 0 12px",
  } as CSSProperties,
  h2: {
    fontSize: 17,
    lineHeight: "23px",
    color: "#1c2b23",
    margin: "0 0 6px",
  } as CSSProperties,
  p: {
    fontSize: 15,
    lineHeight: "24px",
    color: "#3a3a3a",
    margin: "0 0 14px",
  } as CSSProperties,
  link: {
    color: "#3f7d5c",
    fontWeight: 600,
    textDecoration: "none",
  } as CSSProperties,
  button: {
    backgroundColor: "#3f7d5c",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: 600,
    textDecoration: "none",
    padding: "12px 24px",
    borderRadius: 6,
    display: "inline-block",
  } as CSSProperties,
  // Softer, non-alarming callout for the sensitive decision emails.
  card: {
    backgroundColor: "#f4f4ef",
    borderRadius: 6,
    padding: "16px 18px",
    margin: "0 0 16px",
  } as CSSProperties,
  hr: { borderColor: "#e6e6e0", margin: "24px 0" } as CSSProperties,
  footer: {
    fontSize: 12,
    lineHeight: "18px",
    color: "#8a8a8a",
    textAlign: "center",
  } as CSSProperties,
  footerLink: { color: "#8a8a8a", textDecoration: "underline" } as CSSProperties,
};
