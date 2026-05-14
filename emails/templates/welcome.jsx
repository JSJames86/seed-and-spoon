import {
  Html, Head, Body, Container, Section,
  Heading, Text, Button, Hr,
} from '@react-email/components';
import { render } from '@react-email/components';

export function WelcomeEmail({ first_name = 'Friend' }) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f9f5f0', fontFamily: 'Georgia, serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '40px' }}>
            <Heading style={{ color: '#2d5a27', fontSize: '28px', marginBottom: '8px' }}>
              Welcome, {first_name}
            </Heading>
            <Text style={{ color: '#555', fontSize: '16px', lineHeight: '1.6' }}>
              You&rsquo;re now part of the Seed &amp; Spoon community &mdash; a growing network of
              neighbors, volunteers, and advocates working to end food insecurity in Newark and beyond.
            </Text>
            <Text style={{ color: '#555', fontSize: '16px', lineHeight: '1.6' }}>
              Here&rsquo;s what you can expect from us:
            </Text>
            <ul style={{ color: '#555', fontSize: '15px', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li>Program updates and impact stories</li>
              <li>Volunteer opportunities in your area</li>
              <li>Ways to give, partner, and advocate</li>
            </ul>
            <Button
              href="https://seedandspoon.org"
              style={{
                backgroundColor: '#2d5a27',
                color: '#ffffff',
                padding: '14px 28px',
                borderRadius: '6px',
                fontSize: '15px',
                textDecoration: 'none',
                display: 'inline-block',
                marginTop: '16px',
              }}
            >
              Explore Our Work
            </Button>
            <Hr style={{ borderColor: '#e5e5e5', margin: '32px 0' }} />
            <Text style={{ color: '#999', fontSize: '13px' }}>
              Seed &amp; Spoon &middot; Newark, NJ &middot;{' '}
              <a href="https://seedandspoon.org/unsubscribe?email={{email}}" style={{ color: '#999' }}>
                Unsubscribe
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export async function renderWelcomeEmail(props) {
  return await render(<WelcomeEmail {...props} />);
}
