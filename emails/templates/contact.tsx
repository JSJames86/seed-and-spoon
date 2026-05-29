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

// ─── User Confirmation ────────────────────────────────────────────────────────

interface ContactConfirmationProps {
  firstName: string
  subject: string
  message: string
}

export function ContactConfirmationEmail({ firstName, subject, message }: ContactConfirmationProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>We received your message — someone from our team will be in touch soon.</Preview>
      <Body style={body}>
        <Section style={header}>
          <Container style={headerInner}>
            <Img src="https://seedandspoon.org/assets/logo/seed-and-spoon-logo-full-compact.png" width="160" alt="Seed & Spoon" style={logoImg} />
            <Text style={tagline}>Nourishing Newark, One Family at a Time</Text>
          </Container>
        </Section>

        <Container style={container}>
          <Heading style={h1}>Thanks for reaching out, {firstName}.</Heading>
          <Text style={paragraph}>
            We received your message and a member of our team will get back to you within 2 business days.
          </Text>
          <Hr style={divider} />
          <Text style={label}>Your Message</Text>
          <Section style={messageBox}>
            <Text style={messageSubject}>{subject}</Text>
            <Text style={messageBody}>{message}</Text>
          </Section>
          <Hr style={divider} />
          <Text style={paragraph}>
            In the meantime, learn more about our programs and how you can get involved.
          </Text>
          <Section style={ctaSection}>
            <Button href="https://seedandspoon.org" style={ctaButton}>
              Visit Our Website
            </Button>
          </Section>
          <Text style={muted}>
            If you didn&rsquo;t submit this message, you can safely ignore this email.
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

export async function renderContactConfirmationEmail(props: ContactConfirmationProps): Promise<string> {
  return render(<ContactConfirmationEmail {...props} />)
}

// ─── Staff Alert ──────────────────────────────────────────────────────────────

interface ContactInternalProps {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  submittedAt: string
}

export function ContactInternalEmail({ name, email, phone, subject, message, submittedAt }: ContactInternalProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>New contact form submission from {name}</Preview>
      <Body style={body}>
        <Section style={header}>
          <Container style={headerInner}>
            <Img src="https://seedandspoon.org/assets/logo/seed-and-spoon-logo-full-compact.png" width="160" alt="Seed & Spoon" style={logoImg} />
            <Text style={tagline}>Internal Notification</Text>
          </Container>
        </Section>

        <Container style={container}>
          <Text style={labelMuted}>New Submission</Text>
          <Heading style={h1}>Contact Form Message</Heading>
          <Text style={muted}>Received {submittedAt}</Text>
          <Section style={dataTable}>
            <Row label="Name" value={name} />
            <Row label="Email" value={email} />
            {phone && <Row label="Phone" value={phone} />}
            <Row label="Subject" value={subject} />
          </Section>
          <Text style={label}>Message</Text>
          <Section style={messageBox}>
            <Text style={messageBody}>{message}</Text>
          </Section>
          <Section style={ctaSection}>
            <Button href={`mailto:${email}`} style={ctaButton}>
              Reply to {name}
            </Button>
          </Section>
        </Container>

        <Section style={footer}>
          <Container style={footerInner}>
            <Text style={footerText}>Seed &amp; Spoon Internal &bull; Newark, NJ</Text>
          </Container>
        </Section>
      </Body>
    </Html>
  )
}

export async function renderContactInternalEmail(props: ContactInternalProps): Promise<string> {
  return render(<ContactInternalEmail {...props} />)
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Section style={rowWrapper}>
      <Text style={rowLabel}>{label}</Text>
      <Text style={rowValue}>{value}</Text>
    </Section>
  )
}

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
const muted: React.CSSProperties = { color: MUTED, fontSize: '12px', lineHeight: '1.6', margin: '0 0 8px 0' }
const label: React.CSSProperties = { color: MUTED, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: 'Arial, sans-serif', margin: '0 0 8px 0' }
const labelMuted: React.CSSProperties = { color: MUTED, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'Arial, sans-serif', margin: '0 0 6px 0' }
const messageBox: React.CSSProperties = { backgroundColor: OFF_WHITE, borderRadius: '8px', borderLeft: `3px solid ${LIGHT_GREEN}`, padding: '14px 18px', margin: '0 0 16px 0' }
const messageSubject: React.CSSProperties = { color: BRAND_GREEN, fontSize: '13px', fontWeight: 'bold', fontFamily: 'Arial, sans-serif', margin: '0 0 6px 0' }
const messageBody: React.CSSProperties = { color: DARK_TEXT, fontSize: '14px', lineHeight: '1.6', fontFamily: 'Arial, sans-serif', margin: 0 }
const dataTable: React.CSSProperties = { backgroundColor: OFF_WHITE, borderRadius: '8px', padding: '4px 16px', margin: '16px 0' }
const rowWrapper: React.CSSProperties = { borderBottom: '1px solid #E5E7EB', padding: '8px 0' }
const rowLabel: React.CSSProperties = { color: MUTED, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'Arial, sans-serif', margin: '0 0 2px 0' }
const rowValue: React.CSSProperties = { color: DARK_TEXT, fontSize: '13px', fontFamily: 'Arial, sans-serif', margin: 0 }
const ctaSection: React.CSSProperties = { textAlign: 'center', margin: '24px 0' }
const ctaButton: React.CSSProperties = { backgroundColor: BRAND_GREEN, color: '#FFFFFF', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', padding: '12px 28px', textDecoration: 'none' }
const divider: React.CSSProperties = { borderColor: '#E0ECD5', margin: '20px 0' }
const footer: React.CSSProperties = { backgroundColor: '#E8F0E9', padding: '20px 0' }
const footerInner: React.CSSProperties = { maxWidth: '560px', margin: '0 auto', textAlign: 'center' }
const footerText: React.CSSProperties = { color: MUTED, fontSize: '12px', lineHeight: '1.6', margin: '0 0 4px 0' }
const footerLink: React.CSSProperties = { color: BRAND_GREEN, textDecoration: 'underline' }
