import { Section, Heading, Text } from "@react-email/components";
import Layout, { s } from "./components/Layout";

export interface VolunteerWelcomeProps {
  firstName?: string;
  coordinatorName?: string;
  coordinatorEmail?: string;
  // Optional next-step lines; sensible defaults provided.
  nextSteps?: string[];
}

const defaultSteps = [
  "A volunteer coordinator will reach out within a few days to learn your availability and where you'd like to help.",
  "We'll share a short orientation so you know how things run before your first shift.",
  "Once you're set, we'll match you to a role — meal packing, distribution, or behind-the-scenes support.",
];

export default function VolunteerWelcome({
  firstName,
  coordinatorName,
  coordinatorEmail,
  nextSteps = defaultSteps,
}: VolunteerWelcomeProps = {}) {
  const hi = firstName ? `Hi ${firstName},` : "Hi there,";

  return (
    <Layout preview="Thanks for signing up to volunteer — here's what's next.">
      <Heading style={s.h1}>Thank you for stepping up</Heading>
      <Text style={s.p}>{hi}</Text>
      <Text style={s.p}>
        Thank you for signing up to volunteer with Seed &amp; Spoon. People
        willing to give their time are how weekend meals actually reach kids who
        need them — so, genuinely, thank you.
      </Text>

      <Heading as="h2" style={s.h2}>
        What happens next
      </Heading>
      <Section style={{ margin: "0 0 8px" }}>
        {nextSteps.map((step, i) => (
          <Text key={i} style={s.p}>
            {i + 1}. {step}
          </Text>
        ))}
      </Section>

      <Text style={s.p}>
        Questions in the meantime? Reach
        {coordinatorName ? ` ${coordinatorName}` : " our volunteer team"}
        {coordinatorEmail ? (
          <>
            {" "}at{" "}
            <a href={`mailto:${coordinatorEmail}`} style={s.link}>
              {coordinatorEmail}
            </a>
          </>
        ) : null}
        .
      </Text>

      <Text style={s.p}>
        Talk soon,
        <br />
        The Seed &amp; Spoon team
      </Text>
    </Layout>
  );
}
