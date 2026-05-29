import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'
import { render } from '@react-email/components'
import * as React from 'react'
import { TemplateData, RenderedTemplate } from '@/lib/template-registry'

const BRAND_GREEN = '#2D6A4F'
const LIGHT_GREEN = '#52B788'
const OFF_WHITE = '#F8F9F3'
const DARK_TEXT = '#1B2A22'
const MUTED = '#6B7B70'

interface Props {
  firstName?: string
  poundsDistributed?: number
  familiesServed?: number
  volunteersActive?: number
  month?: string
}

function NewsletterMonthlyImpactEmail({ firstName, poundsDistributed = 2400, familiesServed = 180, volunteersActive = 42, month = 'This Month' }: Props) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,'
  return (
    <Html lang="en">
      <Head />
      <Preview>{`${month} impact at Seed & Spoon — ${familiesServed} families served in Newark.`}</Preview>
      <Body style={{ backgroundColor: OFF_WHITE, fontFamily: "'Georgia','Times New Roman',serif", margin: 0, padding: 0 }}>
        <Section style={{ backgroundColor: BRAND_GREEN, padding: '24px 0', textAlign: 'center' as const }}>
          <Text style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>🌱 Seed &amp; Spoon</Text>
          <Text style={{ color: '#B7E4C7', fontSize: '12px', fontStyle: 'italic', margin: '4px 0 0 0' }}>{month} Impact Report</Text>
        </Section>
        <Container style={{ backgroundColor: '#fff', maxWidth: '560px', margin: '0 auto', padding: '40px 48px', borderLeft: `4px solid ${LIGHT_GREEN}` }}>
          <Heading style={{ color: BRAND_GREEN, fontSize: '26px', margin: '0 0 20px 0' }}>
            Your first look at our impact in Newark.
          </Heading>
          <Text style={{ color: DARK_TEXT, fontSize: '16px', lineHeight: '1.7', margin: '0 0 20px 0' }}>{greeting}</Text>
          <Section style={{ backgroundColor: OFF_WHITE, borderRadius: '8px', padding: '20px', margin: '0 0 24px 0' }}>
            <Text style={{ color: BRAND_GREEN, fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' as const, letterSpacing: '1px', margin: '0 0 16px 0' }}>
              {month} by the numbers
            </Text>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #E0ECD5' }}>
                    <Text style={{ color: BRAND_GREEN, fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{poundsDistributed.toLocaleString()}</Text>
                    <Text style={{ color: MUTED, fontSize: '12px', margin: 0 }}>lbs of fresh food distributed</Text>
                  </td>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #E0ECD5', textAlign: 'right' as const }}>
                    <Text style={{ color: BRAND_GREEN, fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{familiesServed}</Text>
                    <Text style={{ color: MUTED, fontSize: '12px', margin: 0 }}>families served</Text>
                  </td>
                </tr>
                <tr>
                  <td style={{ paddingTop: '12px' }}>
                    <Text style={{ color: BRAND_GREEN, fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{volunteersActive}</Text>
                    <Text style={{ color: MUTED, fontSize: '12px', margin: 0 }}>active volunteers</Text>
                  </td>
                  <td style={{ paddingTop: '12px', textAlign: 'right' as const }}>
                    <Text style={{ color: BRAND_GREEN, fontSize: '24px', fontWeight: 'bold', margin: 0 }}>100%</Text>
                    <Text style={{ color: MUTED, fontSize: '12px', margin: 0 }}>free to recipients</Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>
          <Text style={{ color: DARK_TEXT, fontSize: '16px', lineHeight: '1.7', margin: '0 0 16px 0' }}>
            None of this happens without community support. Whether you&rsquo;ve donated,
            volunteered, or simply spread the word — thank you for being part of what makes
            these numbers possible.
          </Text>
          <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
            <Button href="https://seedandspoon.org/donate" style={{ backgroundColor: BRAND_GREEN, color: '#fff', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }}>
              Support Our Work
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

export async function renderNewsletterImpact(data: TemplateData): Promise<RenderedTemplate> {
  return {
    subject: 'Your first look at our impact in Newark',
    html: await render(
      <NewsletterMonthlyImpactEmail
        firstName={data.firstName}
        poundsDistributed={data.poundsDistributed as number | undefined}
        familiesServed={data.familiesServed as number | undefined}
        volunteersActive={data.volunteersActive as number | undefined}
        month={data.month as string | undefined}
      />
    ),
  }
}

export default NewsletterMonthlyImpactEmail
