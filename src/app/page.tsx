import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center px-8 py-4 shadow-md bg-gray-800">
        <div className="text-xl font-bold text-white">Trade Meter AI</div>
        <div className="space-x-6">
          <Link href="/" className="text-gray-300 hover:text-[#9AC0DB]">Home</Link>
          <Link href="/about" className="text-gray-300 hover:text-[#9AC0DB]">About Us</Link>
          <Link href="/analyst" className="text-gray-300 hover:text-[#9AC0DB]">AI Analyst</Link>
          <Link href="/contact" className="text-gray-300 hover:text-[#9AC0DB]">Contact Us</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center flex-1 text-center px-6">
        {/* Logo */}
        <div className="mt-12 mb-8">
          <Image
            src="/logo.png" // <-- replace with your logo file in /public
            alt="Trade Meter AI Logo"
            width={280}
            height={160}
            priority
          />
        </div>

        {/* Hero Heading */}
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          <span className="text-white">Trade Smarter.</span>{" "}
          <span className="text-[#9AC0DB]">Trade Better.</span>
        </h1>

        {/* Subtext */}
        <p className="text-lg text-gray-200 max-w-xl mb-8">
          The future of investing with AI-powered analysis. Get real-time insights,
          market predictions, and smarter decisions at your fingertips.
        </p>

        {/* Register / Login Buttons */}
        <div className="space-x-4 mb-16">
          <Link
            href="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Register
          </Link>
          <Link
            href="/login"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Login
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-white">
        © {new Date().getFullYear()} Trade Meter AI. All rights reserved.
      </footer>
    </div>
  )
}
