import { Section, Heading, Text, Button } from "@react-email/components";
import Layout, { s } from "./components/Layout";

export interface PaymentFailedProps {
  firstName?: string;
  amount?: string; // "$25.00"
  updateUrl?: string; // Stripe billing portal / update-payment link
  // Stripe usually retries automatically; tell the donor what to expect.
  willRetry?: boolean;
}

export default function PaymentFailed({
  firstName,
  amount,
  updateUrl,
  willRetry = true,
}: PaymentFailedProps = {}) {
  const hi = firstName ? `Hi ${firstName},` : "Hi there,";

  return (
    <Layout preview="Your monthly gift didn't go through — a quick fix.">
      <Heading style={s.h1}>Your monthly gift didn&rsquo;t go through</Heading>
      <Text style={s.p}>{hi}</Text>
      <Text style={s.p}>
        We tried to process your recurring gift
        {amount ? <> of <strong>{amount}</strong></> : null} and it didn&rsquo;t go
        through — usually that just means a card expired or was replaced. It
        happens all the time and it&rsquo;s a quick fix.
      </Text>

      {updateUrl ? (
        <Section style={{ margin: "20px 0" }}>
          <Button href={updateUrl} style={s.button}>
            Update your payment method
          </Button>
        </Section>
      ) : null}

      <Text style={s.p}>
        {willRetry
          ? "We'll try again automatically over the next few days, so if you update your card there's nothing else you need to do."
          : "Once you update your card, your monthly support will pick right back up."}
      </Text>
      <Text style={s.p}>
        Thank you for sticking with us — your steady support is what lets us plan
        ahead and keep meals going.
      </Text>

      <Text style={s.p}>
        With gratitude,
        <br />
        The Seed &amp; Spoon team
      </Text>
    </Layout>
  );
}
