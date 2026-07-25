import { Section, Heading, Text } from "@react-email/components";
import Layout, { s } from "./components/Layout";

export interface ApplicationReceivedProps {
  firstName?: string;
  // e.g. "within about a week" — set expectations for when they'll hear back
  timeframe?: string;
  coordinatorEmail?: string;
}

export default function ApplicationReceived({
  firstName,
  timeframe = "within about a week",
  coordinatorEmail,
}: ApplicationReceivedProps = {}) {
  const hi = firstName ? `${firstName},` : "Hello,";

  return (
    <Layout preview="We received your 5 Loaves application.">
      <Heading style={s.h1}>We&rsquo;ve got your application</Heading>
      <Text style={s.p}>{hi}</Text>
      <Text style={s.p}>
        Thank you for applying to the 5 Loaves weekend meal program. We wanted
        you to know right away that your application came through — you don&rsquo;t need
        to do anything else for now.
      </Text>

      <Section style={s.card}>
        <Text style={{ ...s.p, margin: 0 }}>
          <strong>What happens next</strong>
          <br />
          Our team reviews each application carefully. You&rsquo;ll hear back from us{" "}
          {timeframe} with a decision.
        </Text>
      </Section>

      <Text style={s.p}>
        If your situation is urgent, or if anything about your household changes
        while you wait, please reach out
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
        Warmly,
        <br />
        The 5 Loaves team · Seed &amp; Spoon
      </Text>
    </Layout>
  );
}
