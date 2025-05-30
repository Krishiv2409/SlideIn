import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { satoshi } from "./fonts"
import { TypingAnimation } from "@/components/typing-animation"

export const metadata: Metadata = {
  title: "SlideIn - Your AI Email Assistant",
  description: "Send better cold emails with AI-powered insights and smart follow-ups",
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/plane-logo.svg"
              alt="SlideIn Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <Image
              src="/logo-text.svg"
              alt="SlideIn"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              href="/sign-in"
              className="text-gray-600 hover:text-pink-500 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16">
        <div className="text-center space-y-8">
          <TypingAnimation />
          <div>
            <h1 className={`text-6xl font-extrabold text-gray-900 mb-6 tracking-tight ${satoshi.className}`}>
              Your AI Email Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Write better cold emails, track responses, and never miss a follow-up.
              Connect with more people, without the busywork.
          </p>
          </div>
          <div className="flex justify-center gap-4">
            <Link
              href="/sign-up"
              className="bg-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/sign-in"
              className="bg-white text-pink-500 px-8 py-3 rounded-lg font-semibold border border-pink-500 hover:bg-pink-50 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="text-3xl mb-4">📈</div>
            <h3 className={`${satoshi.className} text-xl font-bold mb-3`}>Instant Insights</h3>
            <p className="text-gray-600 mb-2 font-medium">Know who opens your emails — and when.</p>
            <p className="text-gray-500">
              Get real-time feedback on opens and replies so you know what's working and when to follow up.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className={`${satoshi.className} text-xl font-bold mb-3`}>Smart Drafts</h3>
            <p className="text-gray-600 mb-2 font-medium">Never start from scratch again.</p>
            <p className="text-gray-500">
              SlideIn suggests tailored cold email drafts based on who you're reaching out to and why — so you sound confident and clear.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="text-3xl mb-4">🔁</div>
            <h3 className={`${satoshi.className} text-xl font-bold mb-3`}>Auto Follow-Ups</h3>
            <p className="text-gray-600 mb-2 font-medium">Don't let great opportunities slip.</p>
            <p className="text-gray-500">
              Set it once and SlideIn sends polite follow-ups for you, so you stay top of inbox without being annoying.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <h2 className={`${satoshi.className} text-3xl font-bold text-center mb-12`}>How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-pink-500 text-2xl mb-4">1</div>
            <h3 className="font-semibold mb-2">Connect</h3>
            <p className="text-gray-600">Link your Gmail in seconds</p>
          </div>
          <div className="text-center">
            <div className="text-pink-500 text-2xl mb-4">2</div>
            <h3 className="font-semibold mb-2">Write</h3>
            <p className="text-gray-600">Get AI-powered suggestions</p>
          </div>
          <div className="text-center">
            <div className="text-pink-500 text-2xl mb-4">3</div>
            <h3 className="font-semibold mb-2">Send</h3>
            <p className="text-gray-600">Schedule follow-ups easily</p>
          </div>
          <div className="text-center">
            <div className="text-pink-500 text-2xl mb-4">4</div>
            <h3 className="font-semibold mb-2">Track</h3>
            <p className="text-gray-600">See who's interested</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-pink-500 rounded-2xl p-12 text-center">
          <h2 className={`${satoshi.className} text-3xl font-bold text-white mb-4`}>
            Ready to Write Better Cold Emails?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Join people who are already getting more responses with SlideIn's smart email assistant.
          </p>
          <Link
            href="/sign-up"
            className="bg-white text-pink-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Try It Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <Image
                  src="/plane-logo.svg"
                  alt="SlideIn Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <Image
                  src="/logo-text.svg"
                  alt="SlideIn"
                  width={96}
                  height={32}
                  className="h-6 w-auto"
                />
              </Link>
              <p className="text-gray-500 text-sm">
                Write better cold emails, track responses, and never miss a follow-up.
                Connect with more people, without the busywork.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Product</h3>
              <ul className="space-y-2">
                <li>
                  <span className="text-gray-400 text-sm cursor-not-allowed">
                    Features
                  </span>
                </li>
                <li>
                  <span className="text-gray-400 text-sm cursor-not-allowed">
                    Pricing
                  </span>
                </li>
                <li>
                  <span className="text-gray-400 text-sm cursor-not-allowed">
                    Get Started
                  </span>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy-policy" className="text-gray-500 hover:text-pink-500 text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400 text-sm cursor-not-allowed">
                    Terms of Service
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">© 2025 SlideIn. All rights reserved.</p>
              
              {/* Social Links */}
              <div className="flex space-x-6 mt-4 md:mt-0">
                <span className="text-gray-400 cursor-not-allowed">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </span>

                <span className="text-gray-400 cursor-not-allowed">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </span>

                <span className="text-gray-400 cursor-not-allowed">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 