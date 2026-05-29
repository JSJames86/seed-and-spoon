import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { render } from '@react-email/components'
import * as React from 'react'

interface WelcomeEmailProps {
  firstName?: string
}

const BRAND_GREEN = '#2D6A4F'
const LIGHT_GREEN = '#52B788'
const OFF_WHITE = '#F8F9F3'
const DARK_TEXT = '#1B2A22'
const MUTED = '#6B7B70'

export function WelcomeEmail({ firstName }: WelcomeEmailProps) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,'

  return (
    <Html lang="en">
      <Head />
      <Preview>Welcome to Seed &amp; Spoon — together we fight food insecurity in Newark, NJ.</Preview>
      <Body style={body}>
        <Section style={header}>
          <Container style={headerInner}>
            <Text style={logoText}>🌱 Seed &amp; Spoon</Text>
            <Text style={tagline}>Nourishing Newark, One Family at a Time</Text>
          </Container>
        </Section>

        <Container style={container}>
          <Heading style={h1}>You&rsquo;re in — welcome to the community.</Heading>

          <Text style={paragraph}>{greeting}</Text>

          <Text style={paragraph}>
            Thank you for joining Seed &amp; Spoon. We&rsquo;re a nonprofit based in Newark, NJ,
            working every day to connect families experiencing food insecurity with fresh food,
            resources, and community support.
          </Text>

          <Text style={paragraph}>
            By subscribing, you&rsquo;ll get updates on:
          </Text>

          <Section style={bulletSection}>
            <Text style={bullet}>🥦 &nbsp;Food distribution events and pop-up pantries</Text>
            <Text style={bullet}>📣 &nbsp;Ways to volunteer and give back</Text>
            <Text style={bullet}>📊 &nbsp;Impact reports — see exactly how your support helps</Text>
            <Text style={bullet}>💛 &nbsp;Stories from the families we serve</Text>
          </Section>

          <Section style={ctaSection}>
            <Button href="https://seedandspoon.org" style={ctaButton}>
              Visit Our Website
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={paragraph}>
            Newark deserves better access to nutritious food — and with your help, we&rsquo;re
            making that a reality. Thank you for standing with us.
          </Text>

          <Text style={signature}>
            With gratitude,
            <br />
            <strong>The Seed &amp; Spoon Team</strong>
          </Text>
        </Container>

        <Section style={footer}>
          <Container style={footerInner}>
            <Text style={footerText}>
              Seed &amp; Spoon &bull; Newark, NJ
            </Text>
            <Text style={footerText}>
              <Link href="https://seedandspoon.org/unsubscribe" style={footerLink}>
                Unsubscribe
              </Link>
              {' · '}
              <Link href="https://seedandspoon.org" style={footerLink}>
                seedandspoon.org
              </Link>
            </Text>
          </Container>
        </Section>
      </Body>
    </Html>
  )
}

export async function renderWelcomeEmail(props: WelcomeEmailProps = {}): Promise<string> {
  return render(<WelcomeEmail {...props} />)
}

export default WelcomeEmail

// ─── Styles ───────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: OFF_WHITE,
  fontFamily: "'Georgia', 'Times New Roman', serif",
  margin: 0,
  padding: 0,
}
const header: React.CSSProperties = { backgroundColor: BRAND_GREEN, padding: '24px 0' }
const headerInner: React.CSSProperties = { maxWidth: '560px', margin: '0 auto', textAlign: 'center' }
const logoText: React.CSSProperties = { color: '#FFFFFF', fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', letterSpacing: '0.5px' }
const tagline: React.CSSProperties = { color: '#B7E4C7', fontSize: '13px', margin: 0, fontStyle: 'italic' }
const container: React.CSSProperties = {
  backgroundColor: '#FFFFFF', maxWidth: '560px', margin: '0 auto',
  padding: '40px 48px', borderLeft: `4px solid ${LIGHT_GREEN}`,
}
const h1: React.CSSProperties = { color: BRAND_GREEN, fontSize: '26px', fontWeight: 'bold', lineHeight: '1.3', margin: '0 0 24px 0' }
const paragraph: React.CSSProperties = { color: DARK_TEXT, fontSize: '16px', lineHeight: '1.7', margin: '0 0 16px 0' }
const bulletSection: React.CSSProperties = { backgroundColor: OFF_WHITE, borderRadius: '8px', padding: '16px 20px', margin: '8px 0 24px 0' }
const bullet: React.CSSProperties = { color: DARK_TEXT, fontSize: '15px', lineHeight: '1.6', margin: '0 0 8px 0' }
const ctaSection: React.CSSProperties = { textAlign: 'center', margin: '28px 0' }
const ctaButton: React.CSSProperties = { backgroundColor: BRAND_GREEN, color: '#FFFFFF', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }
const divider: React.CSSProperties = { borderColor: '#E0ECD5', margin: '24px 0' }
const signature: React.CSSProperties = { color: DARK_TEXT, fontSize: '15px', lineHeight: '1.7', margin: '16px 0 0 0' }
const footer: React.CSSProperties = { backgroundColor: '#E8F0E9', padding: '20px 0' }
const footerInner: React.CSSProperties = { maxWidth: '560px', margin: '0 auto', textAlign: 'center' }
const footerText: React.CSSProperties = { color: MUTED, fontSize: '12px', lineHeight: '1.6', margin: '0 0 4px 0' }
const footerLink: React.CSSProperties = { color: BRAND_GREEN, textDecoration: 'underline' }
