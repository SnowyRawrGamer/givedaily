import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/rules")({
  head: () => ({
    meta: [
      { title: "Official Rules — givedaily" },
      { name: "description", content: "Official rules, no-purchase-necessary details, and privacy policy for givedaily daily giveaways." },
    ],
  }),
  component: () => <AppShell><Rules /></AppShell>,
});

function Rules() {
  return (
    <article className="max-w-3xl mx-auto space-y-6 text-sm leading-relaxed">
      <h1 className="text-3xl font-bold">Official Rules</h1>
      <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}. This prototype is illustrative and does not constitute legal advice.</p>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">1. No purchase necessary</h2>
        <p>A purchase or payment will <strong>not increase your chances of winning</strong>. Free entrants can earn up to 10 daily entries via the typing task. Paid subscribers receive 10 automatic entries. All entries are pooled with equal weight — this is a legal requirement in Canada, the US, and most jurisdictions.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">2. Eligibility</h2>
        <p>Open only to individuals who are the legal age of majority in their jurisdiction (18+ or 19+ depending on province/state). Void where prohibited. Employees and their immediate family are not eligible.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">3. Skill-testing question (Canada)</h2>
        <p>Under Canadian federal law (Criminal Code s. 206), a chance-based prize must be converted to a contest of skill. Winners must correctly solve a multi-step mathematical equation within 60 seconds to claim any prize. Failure results in forfeiture.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">4. Draw mechanics</h2>
        <p>Draws occur daily at 00:00 UTC. Winners are selected at random from the total entry pool. Free and paid entries are indistinguishable at draw time.</p>
      </section>
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">5. Restricted jurisdictions</h2>
        <p>Entrants from Quebec (Canada), Florida, New York, Rhode Island, and any jurisdiction where such contests are regulated or prohibited may be excluded or required to meet additional conditions.</p>
      </section>
      <section id="privacy" className="space-y-2">
        <h2 className="text-xl font-semibold">Privacy Policy</h2>
        <p>We collect only the information you provide (username, region, tier) and store it locally on your device for this prototype. No personal data is transmitted to third parties. In production, payment data would be processed by Stripe under their privacy policy.</p>
      </section>
    </article>
  );
}