import { Metadata } from "next"
import { Logo } from "@/components/logo"

export const metadata: Metadata = {
  title: "Privacy Policy - SlideIn",
  description: "Privacy Policy for SlideIn - Your AI Email Assistant",
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100">
        <div className="container max-w-3xl mx-auto py-8 px-4">
          <Logo size="lg" />
        </div>
      </div>

      <div className="container max-w-3xl mx-auto py-12 px-4">
        {/* Document Header */}
        <div className="mb-12 space-y-2">
          <h1 className="text-3xl font-semibold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-500">Last Updated: May 30, 2025</p>
        </div>

        {/* Introduction */}
        <div className="mb-10 bg-pink-50 border border-pink-100 rounded-lg p-4">
          <p className="text-gray-600">
            This Privacy Policy describes how SlideIn ("we," "our," or "us") collects, uses, and protects your personal information. 
            By using our services, you agree to the collection and use of information in accordance with this policy.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="mb-12">
          <h2 className="text-sm font-medium text-gray-900 uppercase tracking-wider mb-4">Contents</h2>
          <nav className="space-y-1">
            {[
              { id: "information-collected", title: "Information We Collect" },
              { id: "information-use", title: "How We Use Your Information" },
              { id: "gmail-api", title: "Gmail API & Google User Data Compliance" },
              { id: "email-tracking", title: "Email Tracking" },
              { id: "data-sharing", title: "Data Sharing and Third Parties" },
              { id: "data-retention", title: "Data Retention" },
              { id: "security", title: "Security Measures" },
              { id: "rights", title: "Your Rights" },
              { id: "children", title: "Children's Privacy" },
              { id: "updates", title: "Updates to This Policy" },
              { id: "contact", title: "Contact Us" },
            ].map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block text-gray-600 hover:text-pink-600"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="space-y-12">
          <section id="information-collected">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            
            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Personal Information</h3>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Name (if provided)</li>
                  <li>Email address</li>
                  <li>Google account profile (with your consent)</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Email Data (via Gmail API)</h3>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Email subject lines, recipients, and metadata</li>
                  <li>Sent messages and drafts (only if used for sending or tracking)</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Usage and Device Data</h3>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Feature usage analytics</li>
                  <li>IP address, browser, OS, and device type</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Tracking Data</h3>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Email opens (via tracking pixel)</li>
                  <li>Click-throughs (on tracked links)</li>
                </ul>
              </div>
            </div>
        </section>

          <section id="information-use">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Provide, maintain, and personalize our services</li>
              <li>Send and track emails (when tracking is enabled)</li>
              <li>Deliver follow-up automation</li>
              <li>Improve user experience via analytics</li>
              <li>Send essential service communications</li>
          </ul>
        </section>

          <section id="gmail-api">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Gmail API & Google User Data Compliance</h2>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-gray-600 mb-3">If you connect your Gmail account:</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>We comply with the Google API Services User Data Policy, including Limited Use requirements</li>
                <li>We do not sell or share Gmail data</li>
                <li>We do not use Gmail data for advertising or marketing</li>
                <li>We access Gmail data only to support the features you explicitly enable</li>
          </ul>
            </div>
        </section>

          <section id="email-tracking">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Tracking</h2>
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <p className="text-gray-600 mb-3">Email tracking is optional and can be disabled at any time.</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>We use tracking pixels to detect email opens</li>
                <li>We log link clicks to provide insight into engagement</li>
                <li>No tracking occurs without your consent</li>
              </ul>
            </div>
        </section>

          <section id="data-sharing">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Sharing and Third Parties</h2>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
              <p className="text-gray-600 mb-3">We may share data only with:</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>Service Providers (e.g., hosting, analytics) under strict confidentiality</li>
                <li>Legal Authorities when required by law</li>
                <li>Acquirers if we undergo a merger, sale, or acquisition</li>
              </ul>
              <p className="mt-4 text-gray-900 font-medium bg-pink-50 border border-pink-100 rounded p-2">
                We never sell your data.
              </p>
            </div>
        </section>

          <section id="data-retention">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Retention</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>We retain your data only as long as necessary for service delivery</li>
              <li>You can delete your account at any time; all associated data will be purged within 30 days</li>
          </ul>
        </section>

          <section id="security">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Measures</h2>
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <p className="text-gray-600 mb-3">We use industry-standard safeguards:</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>HTTPS encryption</li>
                <li>OAuth 2.0 authentication</li>
                <li>Secure token storage and access logging</li>
              </ul>
              <p className="text-gray-500 mt-3 text-sm">However, no system is fully immune to vulnerabilities.</p>
            </div>
          </section>

          <section id="rights">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Rights</h2>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
              <p className="text-gray-600 mb-3">You may:</p>
              <ul className="list-disc pl-5 text-gray-600 space-y-1">
                <li>Request access to your data</li>
                <li>Correct or update information</li>
                <li>Delete your data</li>
                <li>Withdraw consent for features</li>
                <li>Export your data</li>
              </ul>
              <p className="mt-3 text-gray-600">To exercise these rights, contact us at the email below.</p>
            </div>
          </section>

          <section id="children">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <p className="text-gray-600">
                SlideIn is not intended for users under 13 years of age. We do not knowingly collect data from children.
              </p>
            </div>
          </section>

          <section id="updates">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
            <p className="text-gray-600">
              We may revise this Privacy Policy periodically. Changes will be posted on this page with the updated date. 
              Continued use of SlideIn after changes constitutes agreement to the updated terms.
          </p>
        </section>

          <section id="contact">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
              <p className="text-gray-600 mb-4">For questions or concerns about this Privacy Policy, please contact:</p>
              <div className="space-y-2">
                <a href="mailto:krishivkhatri2409@gmail.com" className="block text-pink-600 hover:text-pink-700">
                  Krishiv Khatri (krishivkhatri2409@gmail.com)
                </a>
                <a href="mailto:aditya.jain2702@gmail.com" className="block text-pink-600 hover:text-pink-700">
                  Aditya Jain (aditya.jain2702@gmail.com)
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} SlideIn. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
} 