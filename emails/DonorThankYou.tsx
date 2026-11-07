import { Section, Heading, Text, Button } from "@react-email/components";
import Layout, { s } from "./components/Layout";
import { ORG_TAX_STATUS_LINE, NO_GOODS_OR_SERVICES_LINE } from "@/lib/org";

export interface DonorThankYouProps {
  firstName?: string;
  amount?: string; // preformatted, e.g. "$50.00"
  date?: string; // preformatted, e.g. "November 3, 2026"
  isRecurring?: boolean;
  /** @deprecated The tax-receipt block is now always included. */
  taxNote?: boolean;
  /** @deprecated EIN now comes from lib/org.ts. */
  ein?: string;
}

export default function DonorThankYou({
  firstName,
  amount,
  date,
  isRecurring,
}: DonorThankYouProps = {}) {
  const hi = firstName ? `${firstName},` : "Thank you,";

  return (
    <Layout preview="Thank you — your gift puts meals on the table.">
      <Heading style={s.h1}>Thank you.</Heading>
      <Text style={s.p}>{hi}</Text>
      <Text style={s.p}>
        Your gift{amount ? <> of <strong>{amount}</strong></> : null} goes
        straight to the work: weekend meals for kids in Newark who&rsquo;d otherwise go
        without. At roughly $3.56 a meal, support like yours is measured in real
        plates of food, not overhead.
      </Text>

      {(amount || date) && (
        <Section style={s.card}>
          <Text style={{ ...s.p, margin: 0 }}>
            {amount ? (
              <>
                <strong>Amount:</strong> {amount}
                {isRecurring ? " / month" : ""}
                <br />
              </>
            ) : null}
            {date ? (
              <>
                <strong>Date:</strong> {date}
              </>
            ) : null}
          </Text>
        </Section>
      )}

      {/* Every receipt carries the legal name, EIN, tax-deductibility line, and
          the IRS written-acknowledgment statement. */}
      <Text style={{ ...s.p, fontSize: 13, color: "#6a6a6a" }}>
        {ORG_TAX_STATUS_LINE} {NO_GOODS_OR_SERVICES_LINE} Please keep this email
        for your tax records.
      </Text>

      <Section style={{ margin: "24px 0" }}>
        <Button href="https://seedandspoon.org/impact" style={s.button}>
          See your impact
        </Button>
      </Section>

      <Text style={s.p}>
        With gratitude,
        <br />
        The Seed &amp; Spoon team
      </Text>
    </Layout>
  );
}
