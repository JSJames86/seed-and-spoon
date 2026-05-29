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

interface DonationReceiptProps {
  firstName: string
  amount: number
  donationType: 'one-time' | 'monthly'
  date: string
  transactionId: string
}

export function DonationReceiptEmail({ firstName, amount, donationType, date, transactionId }: DonationReceiptProps) {
  const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  return (
    <Html lang="en">
      <Head />
      <Preview>Your donation of {formattedAmount} to Seed & Spoon is confirmed — thank you!</Preview>
      <Body style={body}>
        <Section style={header}>
          <Container style={headerInner}>
            <Img src="https://seedandspoon.org/assets/logo/seed-and-spoon-logo-full-compact.png" width="160" alt="Seed & Spoon" style={logoImg} />
            <Text style={tagline}>Nourishing Newark, One Family at a Time</Text>
          </Container>
        </Section>

        <Container style={container}>
          <Text style={receiptLabel}>Donation Receipt</Text>
          <Text style={amountDisplay}>{formattedAmount}</Text>
          {donationType === 'monthly' && (
            <Text style={recurringBadge}>Monthly Recurring</Text>
          )}
          <Hr style={divider} />
          <Heading style={h1}>Thank you, {firstName}.</Heading>
          <Text style={paragraph}>
            Your generosity directly supports our mission to ensure every child and family
            in Newark has access to nutritious, affordable food.
          </Text>
          <Section style={dataTable}>
            <Row label="Donor" value={firstName} />
            <Row label="Amount" value={formattedAmount} />
            <Row label="Type" value={donationType === 'monthly' ? 'Monthly Recurring' : 'One-Time'} />
            <Row label="Date" value={date} />
            <Row label="Transaction ID" value={transactionId} mono />
          </Section>
          <Hr style={divider} />
          <Text style={paragraph}>
            This email serves as your official donation receipt. Seed &amp; Spoon is a New Jersey
            nonprofit corporation with 501(c)(3) status pending. Contributions may become
            tax-deductible once federal exemption is granted — we will notify donors when our
            status is approved.
          </Text>
          <Text style={muted}>Please retain this receipt for your records.</Text>
          <Section style={ctaSection}>
            <Button href="https://seedandspoon.org/impact" style={ctaButton}>
              See Your Impact
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

export async function renderDonationReceiptEmail(props: DonationReceiptProps): Promise<string> {
  return render(<DonationReceiptEmail {...props} />)
}

export default DonationReceiptEmail

// ─── Staff Notification ───────────────────────────────────────────────────────

interface DonationInternalProps {
  name: string
  email: string
  amount: number
  donationType: 'one-time' | 'monthly'
  date: string
  transactionId: string
}

export function DonationInternalEmail({ name, email, amount, donationType, date, transactionId }: DonationInternalProps) {
  const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  return (
    <Html lang="en">
      <Head />
      <Preview>New {donationType} donation of {formattedAmount} from {name}</Preview>
      <Body style={body}>
        <Section style={header}>
          <Container style={headerInner}>
            <Img src="https://seedandspoon.org/assets/logo/seed-and-spoon-logo-full-compact.png" width="160" alt="Seed & Spoon" style={logoImg} />
            <Text style={tagline}>Internal Notification</Text>
          </Container>
        </Section>
        <Container style={container}>
          <Text style={receiptLabel}>New Donation</Text>
          <Text style={amountDisplay}>{formattedAmount}</Text>
          {donationType === 'monthly' && <Text style={recurringBadge}>Monthly Recurring</Text>}
          <Hr style={divider} />
          <Heading style={h1}>A new donation just came in.</Heading>
          <Section style={dataTable}>
            <Row label="Donor" value={name} />
            <Row label="Email" value={email} />
            <Row label="Amount" value={formattedAmount} />
            <Row label="Type" value={donationType === 'monthly' ? 'Monthly Recurring' : 'One-Time'} />
            <Row label="Date" value={date} />
            <Row label="Transaction ID" value={transactionId} mono />
          </Section>
          <Section style={ctaSection}>
            <Button href={`mailto:${email}`} style={ctaButton}>Email Donor</Button>
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

export async function renderDonationInternalEmail(props: DonationInternalProps): Promise<string> {
  return render(<DonationInternalEmail {...props} />)
}

// ─── Row helper ───────────────────────────────────────────────────────────────

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <Section style={rowWrapper}>
      <Text style={rowLabel}>{label}</Text>
      <Text style={mono ? { ...rowValue, fontFamily: 'monospace', fontSize: '12px' } : rowValue}>{value}</Text>
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
const receiptLabel: React.CSSProperties = { color: MUTED, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', fontFamily: 'Arial, sans-serif', textAlign: 'center', margin: '0 0 4px 0' }
const amountDisplay: React.CSSProperties = { color: BRAND_GREEN, fontSize: '42px', fontWeight: '400', fontFamily: "'Georgia', serif", textAlign: 'center', margin: '8px 0' }
const recurringBadge: React.CSSProperties = { display: 'inline-block', backgroundColor: '#D8F3DC', color: BRAND_GREEN, fontSize: '12px', padding: '4px 12px', borderRadius: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center', margin: '0 auto 8px' }
const h1: React.CSSProperties = { color: BRAND_GREEN, fontSize: '24px', fontWeight: 'bold', lineHeight: '1.3', margin: '0 0 16px 0' }
const paragraph: React.CSSProperties = { color: DARK_TEXT, fontSize: '15px', lineHeight: '1.7', margin: '0 0 16px 0' }
const muted: React.CSSProperties = { color: MUTED, fontSize: '12px', lineHeight: '1.6', margin: '0 0 8px 0' }
const dataTable: React.CSSProperties = { backgroundColor: OFF_WHITE, borderRadius: '8px', padding: '4px 16px', margin: '16px 0' }
const rowWrapper: React.CSSProperties = { borderBottom: '1px solid #E5E7EB', padding: '8px 0' }
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
