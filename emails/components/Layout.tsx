import { Body, Container, Head, Html, Link, Preview, Section, Text } from '@react-email/components'
import * as React from 'react'

/**
 * Shared chrome (header/footer/container) for one-off transactional emails
 * that don't need a full bespoke layout -- application decisions, program
 * notices, etc. `s` is the matching content stylesheet: h1/p/card/button/
 * link/hr, ready to drop onto whatever you put inside <Layout>.
 */

const BRAND_GREEN = '#2D6A4F'
const LIGHT_GREEN = '#52B788'
const OFF_WHITE = '#F8F9F3'
const DARK_TEXT = '#1B2A22'
const MUTED = '#6B7B70'

interface LayoutProps {
  preview: string
  children: React.ReactNode
}

export default function Layout({ preview, children }: LayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={chrome.body}>
        <Section style={chrome.header}>
          <Container style={chrome.headerInner}>
            <Text style={chrome.logoText}>🌱 Seed &amp; Spoon</Text>
            <Text style={chrome.tagline}>Nourishing Newark, One Family at a Time</Text>
          </Container>
        </Section>

        <Container style={chrome.container}>{children}</Container>

        <Section style={chrome.footer}>
          <Container style={chrome.footerInner}>
            <Text style={chrome.footerText}>Seed &amp; Spoon &bull; Newark, NJ</Text>
            <Text style={chrome.footerText}>
              <Link href="https://seedandspoon.org" style={chrome.footerLink}>seedandspoon.org</Link>
              {' · '}
              <Link href="https://seedandspoon.org/unsubscribe" style={chrome.footerLink}>Unsubscribe</Link>
            </Text>
          </Container>
        </Section>
      </Body>
    </Html>
  )
}

// ─── Content stylesheet (for children of <Layout>) ─────────────────────────

export const s = {
  h1: { color: BRAND_GREEN, fontSize: '24px', fontWeight: 'bold', lineHeight: '1.3', margin: '0 0 20px 0' } as React.CSSProperties,
  p: { color: DARK_TEXT, fontSize: '16px', lineHeight: '1.7', margin: '0 0 16px 0' } as React.CSSProperties,
  card: { backgroundColor: OFF_WHITE, borderRadius: '8px', padding: '16px 20px', margin: '0 0 24px 0' } as React.CSSProperties,
  button: { backgroundColor: BRAND_GREEN, color: '#FFFFFF', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' } as React.CSSProperties,
  link: { color: BRAND_GREEN, fontWeight: 600, textDecoration: 'underline' } as React.CSSProperties,
  hr: { borderColor: '#E0ECD5', margin: '24px 0' } as React.CSSProperties,
}

// ─── Layout chrome (header/footer/container only) ──────────────────────────

const chrome = {
  body: { backgroundColor: OFF_WHITE, fontFamily: "'Georgia', 'Times New Roman', serif", margin: 0, padding: 0 } as React.CSSProperties,
  header: { backgroundColor: BRAND_GREEN, padding: '24px 0' } as React.CSSProperties,
  headerInner: { maxWidth: '560px', margin: '0 auto', textAlign: 'center' } as React.CSSProperties,
  logoText: { color: '#FFFFFF', fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', letterSpacing: '0.5px' } as React.CSSProperties,
  tagline: { color: '#B7E4C7', fontSize: '13px', margin: 0, fontStyle: 'italic' } as React.CSSProperties,
  container: { backgroundColor: '#FFFFFF', maxWidth: '560px', margin: '0 auto', padding: '40px 48px', borderLeft: `4px solid ${LIGHT_GREEN}` } as React.CSSProperties,
  footer: { backgroundColor: '#E8F0E9', padding: '20px 0' } as React.CSSProperties,
  footerInner: { maxWidth: '560px', margin: '0 auto', textAlign: 'center' } as React.CSSProperties,
  footerText: { color: MUTED, fontSize: '12px', lineHeight: '1.6', margin: '0 0 4px 0' } as React.CSSProperties,
  footerLink: { color: BRAND_GREEN, textDecoration: 'underline' } as React.CSSProperties,
}
