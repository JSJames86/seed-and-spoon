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

const BRAND_GREEN = '#2D6A4F'
const LIGHT_GREEN = '#52B788'
const OFF_WHITE = '#F8F9F3'
const DARK_TEXT = '#1B2A22'
const MUTED = '#6B7B70'

interface VolunteerConfirmationProps {
  firstName: string
  interests: string[]
  availability: string
}

export function VolunteerConfirmationEmail({ firstName, interests, availability }: VolunteerConfirmationProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>You're in! Welcome to the Seed & Spoon volunteer family 🌱</Preview>
      <Body style={body}>
        <Section style={header}>
          <Container style={headerInner}>
            <Img src="https://seedandspoon.org/assets/logo/seed-and-spoon-logo-full-compact.png" width="160" alt="Seed & Spoon" style={logoImg} />
            <Text style={tagline}>Nourishing Newark, One Family at a Time</Text>
          </Container>
        </Section>

        <Container style={container}>
          <Heading style={h1}>Welcome to the team, {firstName}!</Heading>
          <Text style={paragraph}>
            You&rsquo;re officially part of the Seed &amp; Spoon volunteer family. We&rsquo;re so
            grateful to have passionate community members like you helping us fight food insecurity
            in Newark.
          </Text>
          <Hr style={divider} />
          <Text style={label}>Your Interests</Text>
          <Section style={badgeRow}>
            {interests.map((interest) => (
              <Text key={interest} style={badge}>{interest}</Text>
            ))}
          </Section>
          <Section style={dataTable}>
            <Section style={rowWrapper}>
              <Text style={rowLabel}>Availability</Text>
              <Text style={rowValue}>{availability}</Text>
            </Section>
          </Section>
          <Hr style={divider} />
          <Text style={paragraph}>
            Our team will reach out with upcoming opportunities that match your interests.
            In the meantime, explore ways to get involved.
          </Text>
          <Section style={ctaSection}>
            <Button href="https://seedandspoon.org/volunteer" style={ctaButton}>
              View Volunteer Opportunities
            </Button>
          </Section>
          <Text style={signature}>
            With gratitude,<br />
            <strong>The Seed &amp; Spoon Team</strong>
          </Text>
        </Container>

        <Section style={footer}>
          <Container style={footerInner}>
            <Text style={footerText}>Seed &amp; Spoon &bull; Newark, NJ</Text>
            <Text style={footerText}>
              <Link href="https://seedandspoon.org" style={footerLink}>seedandspoon.org</Link>
              {' · '}
              <Link href="https://seedandspoon.org/unsubscribe" style={footerLink}>Unsubscribe</Link>
            </Text>
            <Text style={footerText}>501(c)(3) Status Pending &bull; NJ Nonprofit Corporation</Text>
          </Container>
        </Section>
      </Body>
    </Html>
  )
}

export async function renderVolunteerConfirmationEmail(props: VolunteerConfirmationProps): Promise<string> {
  return render(<VolunteerConfirmationEmail {...props} />)
}

export default VolunteerConfirmationEmail

// ─── Styles ───────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: OFF_WHITE, fontFamily: "'Georgia', 'Times New Roman', serif", margin: 0, padding: 0,
}
const header: React.CSSProperties = { backgroundColor: BRAND_GREEN, padding: '24px 0' }
const headerInner: React.CSSProperties = { maxWidth: '560px', margin: '0 auto', textAlign: 'center' }
const logoImg: React.CSSProperties = { margin: '0 auto', display: 'block' }
const tagline: React.CSSProperties = { color: '#B7E4C7', fontSize: '13px', margin: '8px 0 0', fontStyle: 'italic', textAlign: 'center' }
const container: React.CSSProperties = {
  backgroundColor: '#FFFFFF', maxWidth: '560px', margin: '0 auto',
  padding: '40px 48px', borderLeft: `4px solid ${LIGHT_GREEN}`,
}
const h1: React.CSSProperties = { color: BRAND_GREEN, fontSize: '24px', fontWeight: 'bold', lineHeight: '1.3', margin: '0 0 20px 0' }
const paragraph: React.CSSProperties = { color: DARK_TEXT, fontSize: '15px', lineHeight: '1.7', margin: '0 0 16px 0' }
const label: React.CSSProperties = { color: MUTED, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: 'Arial, sans-serif', margin: '0 0 10px 0' }
const badgeRow: React.CSSProperties = { margin: '0 0 16px 0' }
const badge: React.CSSProperties = {
  display: 'inline-block', backgroundColor: '#D8F3DC', color: BRAND_GREEN,
  fontSize: '12px', padding: '4px 10px', borderRadius: '20px',
  fontFamily: 'Arial, sans-serif', margin: '0 4px 4px 0',
}
const dataTable: React.CSSProperties = { backgroundColor: OFF_WHITE, borderRadius: '8px', padding: '4px 16px', margin: '0 0 16px 0' }
const rowWrapper: React.CSSProperties = { padding: '8px 0' }
const rowLabel: React.CSSProperties = { color: MUTED, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'Arial, sans-serif', margin: '0 0 2px 0' }
const rowValue: React.CSSProperties = { color: DARK_TEXT, fontSize: '13px', fontFamily: 'Arial, sans-serif', margin: 0 }
const ctaSection: React.CSSProperties = { textAlign: 'center', margin: '24px 0' }
const ctaButton: React.CSSProperties = { backgroundColor: BRAND_GREEN, color: '#FFFFFF', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', padding: '12px 28px', textDecoration: 'none' }
const divider: React.CSSProperties = { borderColor: '#E0ECD5', margin: '20px 0' }
const signature: React.CSSProperties = { color: DARK_TEXT, fontSize: '15px', lineHeight: '1.7', margin: '16px 0 0 0' }
const footer: React.CSSProperties = { backgroundColor: '#E8F0E9', padding: '20px 0' }
const footerInner: React.CSSProperties = { maxWidth: '560px', margin: '0 auto', textAlign: 'center' }
const footerText: React.CSSProperties = { color: MUTED, fontSize: '12px', lineHeight: '1.6', margin: '0 0 4px 0' }
const footerLink: React.CSSProperties = { color: BRAND_GREEN, textDecoration: 'underline' }
