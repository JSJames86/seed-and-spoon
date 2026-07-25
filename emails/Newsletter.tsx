import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text } from '@react-email/components'
import * as React from 'react'

const BRAND_GREEN = '#2D6A4F'
const LIGHT_GREEN = '#52B788'
const OFF_WHITE = '#F8F9F3'
const DARK_TEXT = '#1B2A22'
const MUTED = '#6B7B70'

export interface NewsletterStory {
  title: string
  body: string
  href?: string
}

export interface NewsletterProps {
  previewText?: string
  headline: string
  intro?: string
  stories?: NewsletterStory[]
  ctaLabel?: string
  ctaHref?: string
}

export default function Newsletter({
  previewText,
  headline,
  intro,
  stories = [],
  ctaLabel,
  ctaHref,
}: NewsletterProps) {
  return (
    <Html lang="en">
      <Head />
      {previewText ? <Preview>{previewText}</Preview> : null}
      <Body style={{ backgroundColor: OFF_WHITE, fontFamily: "'Georgia','Times New Roman',serif", margin: 0, padding: 0 }}>
        <Section style={{ backgroundColor: BRAND_GREEN, padding: '24px 0', textAlign: 'center' as const }}>
          <Text style={{ color: '#fff', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>🌱 Seed &amp; Spoon</Text>
          <Text style={{ color: '#B7E4C7', fontSize: '12px', fontStyle: 'italic', margin: '4px 0 0 0' }}>Field Notes</Text>
        </Section>
        <Container style={{ backgroundColor: '#fff', maxWidth: '560px', margin: '0 auto', padding: '40px 48px', borderLeft: `4px solid ${LIGHT_GREEN}` }}>
          <Heading style={{ color: BRAND_GREEN, fontSize: '26px', margin: '0 0 20px 0' }}>{headline}</Heading>
          {intro ? (
            <Text style={{ color: DARK_TEXT, fontSize: '16px', lineHeight: '1.7', margin: '0 0 24px 0' }}>{intro}</Text>
          ) : null}
          {stories.map((story, i) => (
            <Section key={i} style={{ margin: '0 0 24px 0' }}>
              <Text style={{ color: BRAND_GREEN, fontSize: '18px', fontWeight: 'bold', margin: '0 0 6px 0' }}>{story.title}</Text>
              <Text style={{ color: DARK_TEXT, fontSize: '15px', lineHeight: '1.7', margin: 0 }}>
                {story.body}
                {story.href ? (
                  <>
                    {' '}
                    <a href={story.href} style={{ color: BRAND_GREEN }}>Read more &rarr;</a>
                  </>
                ) : null}
              </Text>
              {i < stories.length - 1 ? <Hr style={{ borderColor: '#E0ECD5', margin: '24px 0 0 0' }} /> : null}
            </Section>
          ))}
          {ctaLabel && ctaHref ? (
            <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
              <Button href={ctaHref} style={{ backgroundColor: BRAND_GREEN, color: '#fff', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }}>
                {ctaLabel}
              </Button>
            </Section>
          ) : null}
          <Hr style={{ borderColor: '#E0ECD5', margin: '24px 0' }} />
          <Text style={{ color: DARK_TEXT, fontSize: '15px', lineHeight: '1.7', margin: '0 0 4px 0' }}>With gratitude,</Text>
          <Text style={{ color: DARK_TEXT, fontSize: '15px', fontWeight: 'bold', margin: 0 }}>The Seed &amp; Spoon Team</Text>
        </Container>
        <Section style={{ backgroundColor: '#E8F0E9', padding: '16px 0', textAlign: 'center' as const }}>
          <Text style={{ color: MUTED, fontSize: '12px', margin: '0 0 4px 0' }}>Seed &amp; Spoon · Newark, NJ</Text>
          <Text style={{ color: MUTED, fontSize: '12px', margin: 0 }}>
            <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style={{ color: BRAND_GREEN }}>Unsubscribe</a>
            {' · '}
            <a href="https://seedandspoon.org" style={{ color: BRAND_GREEN }}>seedandspoon.org</a>
          </Text>
        </Section>
      </Body>
    </Html>
  )
}
