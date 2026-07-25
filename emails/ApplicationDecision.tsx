import { Section, Heading, Text, Button, Hr } from "@react-email/components";
import Layout, { s } from "./components/Layout";

/**
 * 5 Loaves application decision.
 *
 * These go to families who asked for help feeding their kids. Tone is the whole
 * job here: warm, plain, and dignified. The two declines are NOT rejections of
 * the family — one is a safety limit of a shared kitchen, the other is
 * capacity. Both always hand off to other resources. Never send a "no" that
 * ends the conversation without an alternative.
 *
 * `resources` is a prop so you control the exact referrals. The defaults below
 * are real NJ starting points, but confirm the current details before you rely
 * on them, and localize to the family's area where you can.
 */

export interface Resource {
  name: string;
  detail: string; // phone, URL, or one-line description
}

interface BaseProps {
  firstName?: string;
  coordinatorName?: string;
  coordinatorEmail?: string;
  resources?: Resource[];
}

type DecisionProps =
  | ({ status: "accepted"; startInfo?: string } & BaseProps)
  | ({ status: "declined_medical" } & BaseProps)
  | ({ status: "declined_capacity" } & BaseProps)
  | ({ status: "waitlist" } & BaseProps);

const defaultResources: Resource[] = [
  { name: "NJ 211", detail: "Dial 211 or visit nj211.org for local food and assistance programs" },
  { name: "Community FoodBank of New Jersey", detail: "cfbnj.org — pantries and food help across the state" },
  { name: "NJ SNAP", detail: "nj.gov/humanservices — food assistance benefits eligibility" },
];

function Resources({ resources }: { resources: Resource[] }) {
  return (
    <Section style={s.card}>
      <Text style={{ ...s.p, fontWeight: 600, margin: "0 0 8px" }}>
        Help that may be available sooner
      </Text>
      {resources.map((r, i) => (
        <Text key={i} style={{ ...s.p, margin: i === resources.length - 1 ? 0 : "0 0 8px" }}>
          <strong>{r.name}</strong> — {r.detail}
        </Text>
      ))}
    </Section>
  );
}

function Signoff({ name, email }: { name?: string; email?: string }) {
  return (
    <Text style={s.p}>
      Take care,
      <br />
      {name ?? "The 5 Loaves team"} · Seed &amp; Spoon
      {email ? (
        <>
          <br />
          <a href={`mailto:${email}`} style={s.link}>
            {email}
          </a>
        </>
      ) : null}
    </Text>
  );
}

export default function ApplicationDecision(props: DecisionProps) {
  const {
    firstName,
    coordinatorName,
    coordinatorEmail,
    resources = defaultResources,
  } = props;
  const hi = firstName ? `${firstName},` : "Hello,";

  /* ---------------- Accepted ---------------- */
  if (props.status === "accepted") {
    return (
      <Layout preview="Good news about your 5 Loaves application.">
        <Heading style={s.h1}>Your family has a spot in 5 Loaves</Heading>
        <Text style={s.p}>{hi}</Text>
        <Text style={s.p}>
          We&rsquo;re glad to let you know your family has been accepted into the
          5 Loaves weekend meal program. We&rsquo;re looking forward to serving you.
        </Text>

        <Section style={s.card}>
          <Text style={{ ...s.p, margin: 0 }}>
            <strong>What happens next</strong>
            <br />
            {props.startInfo ??
              "A coordinator will reach out within a few days to confirm your household size, any dietary or allergy needs, and how you'd like to receive meals."}
          </Text>
        </Section>

        <Text style={s.p}>
          If anything about your family&rsquo;s situation changes — household size,
          allergies, medical needs — just tell us. It helps us serve you safely.
        </Text>

        {coordinatorEmail ? (
          <Section style={{ margin: "20px 0" }}>
            <Button href={`mailto:${coordinatorEmail}`} style={s.button}>
              Reach your coordinator
            </Button>
          </Section>
        ) : null}

        <Signoff name={coordinatorName} email={coordinatorEmail} />
      </Layout>
    );
  }

  /* ---------------- Declined: safety / medical ---------------- */
  if (props.status === "declined_medical") {
    return (
      <Layout preview="About your 5 Loaves application.">
        <Heading style={s.h1}>About your 5 Loaves application</Heading>
        <Text style={s.p}>{hi}</Text>
        <Text style={s.p}>
          Thank you for applying to 5 Loaves, and for trusting us with your
          family&rsquo;s needs. After reviewing your application, we&rsquo;re not able to
          safely serve your family through this program right now.
        </Text>
        <Text style={s.p}>
          Our meals are made in a shared kitchen, and we can&rsquo;t guarantee they&rsquo;ll
          be free of every allergen or meet the specialized medical dietary needs
          you described. We&rsquo;d rather be honest about that than put someone in
          your family at risk. This isn&rsquo;t a judgment about your need — it&rsquo;s a
          limit of what our current kitchen can safely provide.
        </Text>

        <Resources resources={resources} />

        <Text style={s.p}>
          If your family&rsquo;s situation changes, you&rsquo;re always welcome to reapply.
          We&rsquo;d be glad to hear from you.
        </Text>

        <Hr style={s.hr} />
        <Signoff name={coordinatorName} email={coordinatorEmail} />
      </Layout>
    );
  }

  /* ---------------- Declined: capacity ---------------- */
  if (props.status === "declined_capacity") {
    return (
      <Layout preview="About your 5 Loaves application.">
        <Heading style={s.h1}>About your 5 Loaves application</Heading>
        <Text style={s.p}>{hi}</Text>
        <Text style={s.p}>
          Thank you for applying to 5 Loaves. Right now our program is full, and
          we&rsquo;re not able to take on new families this cycle without shortchanging
          the ones we already serve. We know that&rsquo;s hard to hear when you&rsquo;ve
          reached out for help, and we&rsquo;re sorry we can&rsquo;t say yes today.
        </Text>
        <Text style={s.p}>
          We&rsquo;d like to keep your application on file and reach out the moment a
          spot opens up.
        </Text>

        <Resources resources={resources} />

        <Hr style={s.hr} />
        <Signoff name={coordinatorName} email={coordinatorEmail} />
      </Layout>
    );
  }

  /* ---------------- Waitlist ---------------- */
  return (
    <Layout preview="An update on your 5 Loaves application.">
      <Heading style={s.h1}>You&rsquo;re on the 5 Loaves waitlist</Heading>
      <Text style={s.p}>{hi}</Text>
      <Text style={s.p}>
        Thank you for applying to 5 Loaves. We&rsquo;ve added your family to our
        waitlist, and we&rsquo;ll reach out as soon as a spot opens. You don&rsquo;t need to
        do anything else for now — we&rsquo;ll come to you.
      </Text>

      <Resources resources={resources} />

      <Hr style={s.hr} />
      <Signoff name={coordinatorName} email={coordinatorEmail} />
    </Layout>
  );
}
