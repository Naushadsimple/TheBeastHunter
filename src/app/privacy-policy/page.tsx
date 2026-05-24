import type { Metadata } from 'next';
import LegalPageLayout from '@/components/layout/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How The Beast Hunter collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="May 2026">
      <section className="space-y-4">
        <h2 className="font-barlow text-xl font-bold text-white uppercase tracking-wider">
          1. Introduction
        </h2>
        <p>
          The Beast Hunter (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the website and event
          registration platform at thebeasthunter.in. This Privacy Policy explains how we collect,
          use, store, and protect your information when you browse our site or register for an event.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-barlow text-xl font-bold text-white uppercase tracking-wider">
          2. Information we collect
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-400">
          <li>Name, email address, and mobile number</li>
          <li>Date of birth, gender, city, and emergency contact details</li>
          <li>Event preferences (e.g. t-shirt size, medical notes you choose to share)</li>
          <li>Payment transaction references from our payment partner (Cashfree) — we do not store card or UPI PIN data</li>
          <li>Technical data: IP address, browser type, and cookies for site functionality</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-barlow text-xl font-bold text-white uppercase tracking-wider">
          3. How we use your information
        </h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-400">
          <li>Process event registrations and payments</li>
          <li>Send confirmations, tickets, and event updates</li>
          <li>Ensure safety and communicate with emergency contacts if required on event day</li>
          <li>Improve our website and comply with applicable laws</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-barlow text-xl font-bold text-white uppercase tracking-wider">
          4. Sharing of data
        </h2>
        <p>
          We share data only with trusted service providers necessary to run our platform (e.g.
          Supabase for database hosting, Cashfree for payments, email delivery services). We do not
          sell your personal information to third parties for marketing.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-barlow text-xl font-bold text-white uppercase tracking-wider">
          5. Data retention &amp; security
        </h2>
        <p>
          We retain registration data for as long as needed to fulfil legal, safety, and operational
          requirements. We use industry-standard security measures including encrypted connections
          (HTTPS) and access controls on our database.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-barlow text-xl font-bold text-white uppercase tracking-wider">
          6. Your rights
        </h2>
        <p>
          You may request access, correction, or deletion of your personal data by emailing{' '}
          <a href="mailto:info@thebeasthunter.in" className="text-gold-premium hover:underline">
            info@thebeasthunter.in
          </a>
          . We will respond within a reasonable timeframe as required by applicable law.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-barlow text-xl font-bold text-white uppercase tracking-wider">
          7. Contact
        </h2>
        <p>
          For privacy-related questions, contact us at{' '}
          <a href="mailto:info@thebeasthunter.in" className="text-gold-premium hover:underline">
            info@thebeasthunter.in
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
