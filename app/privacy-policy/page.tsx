import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - SlideIn",
  description: "Privacy Policy for SlideIn - Your AI Email Assistant",
}

export default function PrivacyPolicy() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="prose prose-pink max-w-none">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p>
            Welcome to SlideIn. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you about how we look after your personal data when you visit our 
            website and use our services, and tell you about your privacy rights.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Data We Collect</h2>
          <p>We collect and process the following types of data:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>Email addresses and account information</li>
            <li>Email content and metadata</li>
            <li>Usage data and analytics</li>
            <li>Device and browser information</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Data</h2>
          <p>We use your data to:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>Provide and maintain our email services</li>
            <li>Track email opens and clicks (with your consent)</li>
            <li>Improve our services and user experience</li>
            <li>Send you important updates about our service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Email Tracking</h2>
          <p>
            When you enable email tracking, we collect information about when your emails are opened and which 
            links are clicked. This data helps you understand the effectiveness of your communications. 
            You can disable tracking at any time through your account settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal data. However, no method of 
            transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 mt-4">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent for data processing</li>
            <li>Export your data</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our data practices, please contact us at:
            <br />
            <a href="mailto:privacy@slidein.ai" className="text-pink-500 hover:text-pink-600">
              aditya.jain2702@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  )
} 