import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'
import { render } from '@react-email/components'
import * as React from 'react'
import { TemplateData, RenderedTemplate } from '@/lib/template-registry'

const BRAND_GREEN = '#2D6A4F'
const LIGHT_GREEN = '#52B788'
const OFF_WHITE = '#F8F9F3'
const DARK_TEXT = '#1B2A22'
const MUTED = '#6B7B70'

interface Props { firstName?: string }

function NewsletterWelcomeEmail({ firstName }: Props) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,'
  return (
    <Html lang="en">
      <Head />
      <Preview>You're now part of the Seed & Spoon community — here's what to expect.</Preview>
      <Body style={{ backgroundColor: OFF_WHITE, fontFamily: "'Georgia','Times New Roman',serif", margin: 0, padding: 0 }}>
        <Section style={{ backgroundColor: BRAND_GREEN, padding: '24px 0', textAlign: 'center' as const }}>
          <Text style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>🌱 Seed &amp; Spoon</Text>
          <Text style={{ color: '#B7E4C7', fontSize: '12px', fontStyle: 'italic', margin: '4px 0 0 0' }}>Nourishing Newark, One Family at a Time</Text>
        </Section>
        <Container style={{ backgroundColor: '#fff', maxWidth: '560px', margin: '0 auto', padding: '40px 48px', borderLeft: `4px solid ${LIGHT_GREEN}` }}>
          <Heading style={{ color: BRAND_GREEN, fontSize: '26px', margin: '0 0 20px 0' }}>
            You&rsquo;re in the community now.
          </Heading>
          <Text style={{ color: DARK_TEXT, fontSize: '16px', lineHeight: '1.7', margin: '0 0 16px 0' }}>{greeting}</Text>
          <Text style={{ color: DARK_TEXT, fontSize: '16px', lineHeight: '1.7', margin: '0 0 16px 0' }}>
            Thanks for subscribing to the Seed &amp; Spoon newsletter. We&rsquo;re a Newark-based
            nonprofit fighting food insecurity one distribution at a time — and you&rsquo;re now
            part of the story.
          </Text>
          <Text style={{ color: DARK_TEXT, fontSize: '16px', lineHeight: '1.7', margin: '0 0 20px 0' }}>
            Each month you&rsquo;ll get:
          </Text>
          <Section style={{ backgroundColor: OFF_WHITE, borderRadius: '8px', padding: '16px 20px', margin: '0 0 24px 0' }}>
            <Text style={{ color: DARK_TEXT, fontSize: '15px', lineHeight: '1.6', margin: '0 0 8px 0' }}>📊 &nbsp;Real impact numbers — pounds of food distributed, families served</Text>
            <Text style={{ color: DARK_TEXT, fontSize: '15px', lineHeight: '1.6', margin: '0 0 8px 0' }}>📣 &nbsp;Upcoming events and volunteer opportunities</Text>
            <Text style={{ color: DARK_TEXT, fontSize: '15px', lineHeight: '1.6', margin: 0 }}>💛 &nbsp;Stories from the community we serve</Text>
          </Section>
          <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
            <Button href="https://seedandspoon.org" style={{ backgroundColor: BRAND_GREEN, color: '#fff', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }}>
              Learn More About Our Work
            </Button>
          </Section>
          <Hr style={{ borderColor: '#E0ECD5', margin: '24px 0' }} />
          <Text style={{ color: DARK_TEXT, fontSize: '15px', lineHeight: '1.7', margin: '0 0 4px 0' }}>With gratitude,</Text>
          <Text style={{ color: DARK_TEXT, fontSize: '15px', fontWeight: 'bold', margin: 0 }}>The Seed &amp; Spoon Team</Text>
        </Container>
        <Section style={{ backgroundColor: '#E8F0E9', padding: '16px 0', textAlign: 'center' as const }}>
          <Text style={{ color: MUTED, fontSize: '12px', margin: '0 0 4px 0' }}>Seed &amp; Spoon · Newark, NJ</Text>
          <Text style={{ color: MUTED, fontSize: '12px', margin: 0 }}>
            <a href="https://seedandspoon.org/unsubscribe" style={{ color: BRAND_GREEN }}>Unsubscribe</a>
            {' · '}
            <a href="https://seedandspoon.org" style={{ color: BRAND_GREEN }}>seedandspoon.org</a>
          </Text>
        </Section>
      </Body>
    </Html>
  )
}

export async function renderNewsletterWelcome(data: TemplateData): Promise<RenderedTemplate> {
  return {
    subject: 'Welcome to the Seed & Spoon community 🌱',
    html: await render(<NewsletterWelcomeEmail firstName={data.firstName} />),
  }
}

export default NewsletterWelcomeEmail
