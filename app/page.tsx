import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "SlideIn - Your AI Cold Email Assistant",
  description: "Transform your cold email outreach with AI-powered insights and automation",
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your AI Cold Email Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your cold email outreach with personalized templates, smart tracking, and AI-powered insights.
            Close more deals with less effort.
          </p>
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
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-pink-500 text-2xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
            <p className="text-gray-600">
              Track open rates, response rates, and engagement metrics to optimize your cold email campaigns.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-pink-500 text-2xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI Personalization</h3>
            <p className="text-gray-600">
              Generate personalized cold emails that resonate with your prospects using AI-powered insights.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-pink-500 text-2xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Campaign Automation</h3>
            <p className="text-gray-600">
              Set up automated follow-up sequences and A/B test different approaches to maximize response rates.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-pink-500 text-2xl mb-4">1</div>
            <h3 className="font-semibold mb-2">Connect</h3>
            <p className="text-gray-600">Link your email account securely</p>
          </div>
          <div className="text-center">
            <div className="text-pink-500 text-2xl mb-4">2</div>
            <h3 className="font-semibold mb-2">Create</h3>
            <p className="text-gray-600">Build your cold email campaigns</p>
          </div>
          <div className="text-center">
            <div className="text-pink-500 text-2xl mb-4">3</div>
            <h3 className="font-semibold mb-2">Track</h3>
            <p className="text-gray-600">Monitor campaign performance</p>
          </div>
          <div className="text-center">
            <div className="text-pink-500 text-2xl mb-4">4</div>
            <h3 className="font-semibold mb-2">Optimize</h3>
            <p className="text-gray-600">Improve with AI insights</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-pink-500 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Cold Email Outreach?
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Join sales professionals who are already closing more deals with SlideIn's AI-powered cold email assistant.
          </p>
          <Link
            href="/sign-up"
            className="bg-white text-pink-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  )
} 