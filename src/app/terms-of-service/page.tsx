import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPageLayout from '@/components/layout/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for participating in The Beast Hunter Challenge events.',
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="May 2026">
      <section className="space-y-4 p-6 rounded-lg border border-gold-premium/30 bg-gold-premium/5">
        <h2 className="font-barlow text-lg font-bold text-gold-glow uppercase tracking-wider">
          Important — Health &amp; liability
        </h2>
        <p className="text-white font-semibold">
          By registering for any The Beast Hunter Challenge event, you acknowledge that participation
          involves inherent physical risks including injury, illness, exhaustion, or death. If any
          health issue, injury, accident, or medical emergency occurs before, during, or after the
          event — whether related to the course or not — you accept full personal responsibility.
          The Beast Hunter Challenge, its organisers, partners, volunteers, and sponsors shall not be liable
          for any injury, loss, damage, or health complication arising from your participation,
          except where liability cannot be excluded under applicable Indian law.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-barlow text-xl font-bold text-white uppercase tracking-wider">
          1. Agreement
        </h2>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your use of our website and your registration
          for events operated by The Beast Hunter Challenge. By completing registration and payment, you agree
          to these Terms and our{' '}
          <Link href="/privacy-policy" className="text-gold-premium hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-barlow text-xl font-bold text-white uppercase tracking-wider">
          2. Eligibility &amp; fitness
        </h2>
        <p>
          You confirm that you are physically fit to participate, have consulted a medical
          professional if you have any pre-existing condition, and will not participate if unwell on
          event day. Minors must have guardian consent where required by law.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-barlow text-xl font-bold text-white uppercase tracking-wider">
          3. Assumption of risk
        </h2>
        <p>
          You voluntarily assume all risks associated with obstacle courses, trail running, weather
          conditions, equipment use, and interaction with other participants. You agree that your
          health and safety during the challenge remain your sole responsibility.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-barlow text-xl font-bold text-white uppercase tracking-wider">
          4. Release of liability
        </h2>
        <p>
          To the fullest extent permitted by law, you release and hold harmless The Beast Hunter Challenge and
          all affiliated parties from claims, demands, or causes of action arising from your
          participation, including those caused by ordinary negligence of event staff, except gross
          negligence or wilful misconduct where not waivable.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-barlow text-xl font-bold text-white uppercase tracking-wider">
          5. Payments &amp; refunds
        </h2>
        <p>
          Registration fees are paid via secure manual UPI transfers. Refund eligibility depends on the specific
          event policy and timing of cancellation. Contact{' '}
          <a href="mailto:info@thebeasthunter.in" className="text-gold-premium hover:underline">
            info@thebeasthunter.in
          </a>{' '}
          for refund requests.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-barlow text-xl font-bold text-white uppercase tracking-wider">
          6. Event changes
        </h2>
        <p>
          We may modify course layout, schedule, or venue for safety or operational reasons. We
          reserve the right to postpone or cancel events due to force majeure (extreme weather,
          government orders, etc.) with communication to registered participants.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-barlow text-xl font-bold text-white uppercase tracking-wider">
          7. Conduct
        </h2>
        <p>
          Participants must follow marshal instructions, respect other runners, and not use
          prohibited substances. We may remove any participant who endangers others without refund.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-barlow text-xl font-bold text-white uppercase tracking-wider">
          8. Governing law
        </h2>
        <p>
          These Terms are governed by the laws of India. Disputes shall be subject to the courts of
          Mumbai, Maharashtra, unless otherwise required by mandatory consumer protection law.
        </p>
      </section>
    </LegalPageLayout>
  );
}
