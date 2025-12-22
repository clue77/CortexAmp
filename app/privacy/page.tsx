import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export const metadata = {
  title: 'Privacy Policy - CortexAmp',
  description: 'Privacy Policy for CortexAmp',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">Last updated: December 22, 2024</p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            
            <h3 className="text-xl font-semibold">Account Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address</li>
              <li>Display name (optional)</li>
              <li>Skill level preference</li>
              <li>Timezone setting</li>
            </ul>

            <h3 className="text-xl font-semibold">Usage Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Challenge submissions and responses</li>
              <li>Progress and streak information</li>
              <li>Feedback scores and history</li>
              <li>Login and activity timestamps</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and improve our service</li>
              <li>Generate personalized AI feedback on your submissions</li>
              <li>Track your progress and maintain streaks</li>
              <li>Send you important service updates</li>
              <li>Improve our AI models and challenge quality</li>
              <li>Ensure security and prevent fraud</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">3. AI Processing</h2>
            <p>
              <strong>Important:</strong> Your challenge submissions are processed by third-party AI services (OpenAI and DeepSeek) to generate feedback. By using CortexAmp, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your submissions are sent to AI service providers for processing</li>
              <li>These providers have their own privacy policies (OpenAI Privacy Policy, DeepSeek Privacy Policy)</li>
              <li>We use these services in accordance with their terms of service</li>
              <li>We do not share personally identifiable information (name, email) with AI providers</li>
              <li>Only your challenge submissions and responses are sent for AI processing</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">4. Data Storage and Security</h2>
            <p>
              We use Supabase for secure data storage and authentication. Your data is:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encrypted in transit and at rest</li>
              <li>Protected by industry-standard security measures</li>
              <li>Stored in secure, SOC 2 compliant data centers</li>
              <li>Access-controlled with row-level security policies</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">5. Data Sharing</h2>
            <p>We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> Third-party services that help us operate (e.g., Supabase, OpenAI)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Aggregated Data:</strong> Anonymous, aggregated statistics for analytics</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your account and data</li>
              <li>Export your data</li>
              <li>Opt out of non-essential communications</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">7. Cookies and Tracking</h2>
            <p>
              We use essential cookies for authentication and session management. We do not use third-party advertising or tracking cookies.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">8. Children&apos;s Privacy</h2>
            <p>
              CortexAmp is not intended for children under 13. We do not knowingly collect information from children under 13. If you believe we have collected such information, please contact us immediately.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">9. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active or as needed to provide services. You may request deletion at any time, after which we will delete or anonymize your data within 30 days.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">10. Changes to Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of significant changes via email or through the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">11. International Users</h2>
            <p>
              CortexAmp is operated from the United States. If you are accessing our service from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States where our servers are located.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or wish to exercise your rights, please contact us at: <a href="mailto:support@cortexamp.com" className="text-primary hover:underline">support@cortexamp.com</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
