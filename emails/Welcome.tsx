import { Section, Heading, Text, Button } from "@react-email/components";
import Layout, { s } from "./components/Layout";

export interface WelcomeProps {
  firstName?: string;
}

export default function Welcome({ firstName }: WelcomeProps = {}) {
  const hi = firstName ? `Hi ${firstName},` : "Hi there,";

  return (
    <Layout preview="Welcome to Seed & Spoon — glad you're here.">
      <Heading style={s.h1}>Welcome to Seed &amp; Spoon</Heading>
      <Text style={s.p}>{hi}</Text>
      <Text style={s.p}>
        Thanks for joining us. Seed &amp; Spoon is a Newark nonprofit working to
        make sure no kid goes hungry on the weekend — and we build the tools and
        systems to do it sustainably, not just for a season.
      </Text>
      <Text style={s.p}>
        You&rsquo;ll hear from us when there&rsquo;s something worth your time: program
        updates, ways to help, and the occasional look behind the scenes. No
        noise.
      </Text>

      <Section style={{ margin: "24px 0" }}>
        <Button href="https://seedandspoon.org" style={s.button}>
          See what we&rsquo;re building
        </Button>
      </Section>

      <Text style={s.p}>
        Glad you&rsquo;re here,
        <br />
        The Seed &amp; Spoon team
      </Text>
    </Layout>
  );
}
