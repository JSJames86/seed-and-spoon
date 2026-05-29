import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'
import { render } from '@react-email/components'
import * as React from 'react'
import { TemplateData, RenderedTemplate } from '@/lib/template-registry'

const BRAND_GREEN = '#2D6A4F'
const LIGHT_GREEN = '#52B788'
const OFF_WHITE = '#F8F9F3'
const DARK_TEXT = '#1B2A22'
const MUTED = '#6B7B70'

interface Props { firstName?: string }

function DonorImpactStoryEmail({ firstName }: Props) {
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,'
  return (
    <Html lang="en">
      <Head />
      <Preview>See exactly what your gift to Seed & Spoon made possible.</Preview>
      <Body style={{ backgroundColor: OFF_WHITE, fontFamily: "'Georgia','Times New Roman',serif", margin: 0, padding: 0 }}>
        <Section style={{ backgroundColor: BRAND_GREEN, padding: '24px 0', textAlign: 'center' as const }}>
          <Text style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>🌱 Seed &amp; Spoon</Text>
        </Section>
        <Container style={{ backgroundColor: '#fff', maxWidth: '560px', margin: '0 auto', padding: '40px 48px', borderLeft: `4px solid ${LIGHT_GREEN}` }}>
          <Heading style={{ color: BRAND_GREEN, fontSize: '26px', margin: '0 0 20px 0' }}>
            Here&rsquo;s what your gift made possible.
          </Heading>
          <Text style={{ color: DARK_TEXT, fontSize: '16px', lineHeight: '1.7', margin: '0 0 16px 0' }}>{greeting}</Text>
          <Text style={{ color: DARK_TEXT, fontSize: '16px', lineHeight: '1.7', margin: '0 0 16px 0' }}>
            A few days ago you made a gift to Seed &amp; Spoon. We wanted to share a small piece
            of what that means on the ground in Newark.
          </Text>
          <Section style={{ backgroundColor: OFF_WHITE, borderLeft: `4px solid ${LIGHT_GREEN}`, padding: '16px 20px', margin: '8px 0 24px 0', borderRadius: '0 8px 8px 0' }}>
            <Text style={{ color: BRAND_GREEN, fontSize: '18px', fontStyle: 'italic', lineHeight: '1.6', margin: 0 }}>
              &ldquo;I didn&rsquo;t know where our next meal was coming from.
              Seed &amp; Spoon changed that for my family.&rdquo;
            </Text>
            <Text style={{ color: MUTED, fontSize: '13px', margin: '8px 0 0 0' }}>— Newark resident, served Spring 2025</Text>
          </Section>
          <Text style={{ color: DARK_TEXT, fontSize: '16px', lineHeight: '1.7', margin: '0 0 16px 0' }}>
            Stories like this are only possible because of donors like you. Last month alone,
            Seed &amp; Spoon distributed over <strong>2,400 pounds of fresh produce</strong> to
            families across Newark — at no cost to them.
          </Text>
          <Text style={{ color: DARK_TEXT, fontSize: '16px', lineHeight: '1.7', margin: '0 0 0 0' }}>
            Your gift is woven into every pound of that food. Thank you for making it real.
          </Text>
          <Hr style={{ borderColor: '#E0ECD5', margin: '24px 0' }} />
          <Text style={{ color: DARK_TEXT, fontSize: '15px', lineHeight: '1.7', margin: '0 0 4px 0' }}>With gratitude,</Text>
          <Text style={{ color: DARK_TEXT, fontSize: '15px', fontWeight: 'bold', margin: 0 }}>The Seed &amp; Spoon Team</Text>
        </Container>
        <Section style={{ backgroundColor: '#E8F0E9', padding: '16px 0', textAlign: 'center' as const }}>
          <Text style={{ color: MUTED, fontSize: '12px', margin: 0 }}>Seed &amp; Spoon · Newark, NJ · <a href="https://seedandspoon.org" style={{ color: BRAND_GREEN }}>seedandspoon.org</a></Text>
        </Section>
      </Body>
    </Html>
  )
}

export async function renderDonorImpactStory(data: TemplateData): Promise<RenderedTemplate> {
  return {
    subject: "Here's what your gift made possible",
    html: await render(<DonorImpactStoryEmail firstName={data.firstName} />),
  }
}

export default DonorImpactStoryEmail
