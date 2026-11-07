/**
 * ⚠️ DRAFT: NOT WIRED TO ANY SEND ROUTE. Janelle must review before use.
 *
 * Donor announcement: Seed & Spoon's 501(c)(3) approval. This keeps the old
 * About-page FAQ promise to tell donors when the determination letter arrived.
 *
 * Intended as a Resend *Broadcast* to the donor audience:
 *   1. Render this component to HTML (e.g. `npx react-email dev`, or
 *      `render(<DeterminationAnnouncement />)` from @react-email/render).
 *   2. In Resend → Broadcasts → New, paste the HTML, use the suggested subject
 *      below, pick the donor audience, and save as a draft. Don't schedule
 *      or send it until Janelle approves.
 *
 * {{{FIRST_NAME|there}}} and {{{RESEND_UNSUBSCRIBE_URL}}} are Resend Broadcast
 * merge tags. Resend fills them in per contact at send time.
 *
 * Suggested subject: "It's official: Seed & Spoon is a 501(c)(3) public charity"
 *
 * Note: app/api/email/send-determination-day + emails/templates/donation-
 * determination.tsx is a separate, older approach (an automatic per-donation
 * receipt to every past donor). Use one or the other, not both.
 */
import { Section, Heading, Text } from "@react-email/components";
import Layout, { s } from "./components/Layout";
import {
  ORG_LEGAL_NAME,
  ORG_EIN,
  ORG_TAX_STATUS,
  IRS_DETERMINATION_LETTER_DATE,
  IRS_EXEMPTION_EFFECTIVE_DATE,
  NJ_CHARITY_REG_NO,
  ORG_TAX_STATUS_LINE,
} from "@/lib/org";

export const DETERMINATION_ANNOUNCEMENT_SUBJECT =
  "It's official: Seed & Spoon is a 501(c)(3) public charity";

export interface DeterminationAnnouncementProps {
  /** Defaults to the Resend Broadcast merge tag. */
  firstName?: string;
  /** Defaults to the Resend Broadcast unsubscribe merge tag. */
  unsubscribeUrl?: string;
  /** Where donors write to request an updated receipt. */
  receiptsEmail?: string;
}

export default function DeterminationAnnouncement({
  firstName = "{{{FIRST_NAME|there}}}",
  unsubscribeUrl = "{{{RESEND_UNSUBSCRIBE_URL}}}",
  receiptsEmail = "donors@seedandspoon.org",
}: DeterminationAnnouncementProps = {}) {
  return (
    <Layout
      preview={`IRS approval is retroactive to ${IRS_EXEMPTION_EFFECTIVE_DATE}, so every gift since then is tax-deductible.`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Heading style={s.h1}>It&rsquo;s official.</Heading>
      <Text style={s.p}>Hi {firstName},</Text>
      <Text style={s.p}>
        When you gave to Seed &amp; Spoon, we promised to let you know as soon as
        our IRS determination letter arrived. It&rsquo;s here.
      </Text>
      <Text style={s.p}>
        On {IRS_DETERMINATION_LETTER_DATE}, the IRS recognized {ORG_LEGAL_NAME} as
        a 501(c)(3) public charity. Our exemption is <strong>retroactive to{" "}
        {IRS_EXEMPTION_EFFECTIVE_DATE}</strong>, the day we incorporated. That
        means every gift you&rsquo;ve made to us since then is tax-deductible to
        the extent allowed by law.
      </Text>

      <Section style={s.card}>
        <Text style={{ ...s.p, margin: 0 }}>
          <strong>Legal name:</strong> {ORG_LEGAL_NAME}
          <br />
          <strong>EIN:</strong> {ORG_EIN}
          <br />
          <strong>Status:</strong> {ORG_TAX_STATUS}
          <br />
          <strong>Effective:</strong> {IRS_EXEMPTION_EFFECTIVE_DATE}
          <br />
          <strong>NJ Charity Reg. No.:</strong> {NJ_CHARITY_REG_NO}
        </Text>
      </Section>

      <Text style={s.p}>
        <strong>Want an updated receipt?</strong> Reply to this email or write to{" "}
        {receiptsEmail} and we&rsquo;ll send you a receipt that reflects our
        approved status for any gift you&rsquo;ve made.
      </Text>

      <Text style={s.p}>
        You believed in this work before it had an IRS letter behind it. Thank
        you. We&rsquo;re putting that trust to work on the first 5 Loaves
        weekends for Newark kids.
      </Text>

      <Text style={s.p}>
        With gratitude,
        <br />
        The Seed &amp; Spoon team
      </Text>

      <Text style={{ ...s.p, fontSize: 13, color: "#6a6a6a" }}>
        {ORG_TAX_STATUS_LINE} Please consult your tax advisor about your
        individual situation.
      </Text>
    </Layout>
  );
}
