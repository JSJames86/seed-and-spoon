import { Section, Heading, Text, Hr } from "@react-email/components";
import Layout, { s } from "./components/Layout";

export interface GiftLine {
  date: string; // "Mar 3, 2026"
  amount: string; // "$25.00"
}

export interface YearEndStatementProps {
  firstName?: string;
  year: number; // tax year being summarized, e.g. 2026
  total: string; // "$300.00"
  giftCount?: number;
  gifts?: GiftLine[]; // optional itemized list
  ein?: string; // "41-4059078"
}

export default function YearEndStatement({
  firstName,
  year,
  total,
  giftCount,
  gifts,
  ein,
}: YearEndStatementProps) {
  const hi = firstName ? `${firstName},` : "Hello,";

  return (
    <Layout preview={`Your ${year} giving summary from Seed & Spoon.`}>
      <Heading style={s.h1}>Your {year} giving summary</Heading>
      <Text style={s.p}>{hi}</Text>
      <Text style={s.p}>
        Thank you for supporting Seed &amp; Spoon in {year}. Below is a summary of
        your gifts for your tax records. Because of you, kids in Newark had meals
        on the weekend — that&rsquo;s what your generosity built.
      </Text>

      <Section style={s.card}>
        <Text style={{ ...s.p, margin: gifts?.length ? "0 0 12px" : 0 }}>
          <strong>Total contributed in {year}:</strong> {total}
          {giftCount ? (
            <>
              <br />
              <strong>Number of gifts:</strong> {giftCount}
            </>
          ) : null}
        </Text>

        {gifts?.length ? (
          <>
            <Hr style={{ ...s.hr, margin: "12px 0" }} />
            {gifts.map((g, i) => (
              <Text
                key={i}
                style={{
                  ...s.p,
                  fontSize: 14,
                  margin: i === gifts.length - 1 ? 0 : "0 0 4px",
                }}
              >
                {g.date} — {g.amount}
              </Text>
            ))}
          </>
        ) : null}
      </Section>

      <Text style={{ ...s.p, fontSize: 13, color: "#6a6a6a" }}>
        Seed &amp; Spoon, Inc. is a 501(c)(3) tax-exempt organization
        {ein ? <> (EIN {ein})</> : null}. No goods or services were provided in
        exchange for these contributions. Please retain this statement for your
        records; consult your tax advisor with any questions.
      </Text>

      <Text style={s.p}>
        With deep gratitude,
        <br />
        The Seed &amp; Spoon team
      </Text>
    </Layout>
  );
}
