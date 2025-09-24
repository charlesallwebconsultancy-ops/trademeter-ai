"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supabaseClient"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(error.message)
    } else {
      // ✅ Redirect to /search after login
      router.push("/search")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-4 shadow-md bg-gray-800">
        <div className="text-xl font-bold text-white">Trade Meter AI</div>
        <div className="space-x-6">
          <a href="/" className="text-gray-300 hover:text-[#9AC0DB]">Home</a>
          <a href="/about" className="text-gray-300 hover:text-[#9AC0DB]">About Us</a>
          <a href="/analyst" className="text-gray-300 hover:text-[#9AC0DB]">AI Analyst</a>
          <a href="/contact" className="text-gray-300 hover:text-[#9AC0DB]">Contact Us</a>
        </div>
      </nav>

      {/* Login Form */}
      <main className="flex flex-col items-center justify-center flex-1 text-center px-6">
        <h1 className="text-3xl font-bold text-white mb-6">Login to Your Account</h1>

        <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full mb-4 p-3 rounded bg-gray-100 text-black"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full mb-4 p-3 rounded bg-gray-100 text-black"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login
          </button>
          {message && <p className="mt-4 text-sm text-gray-300">{message}</p>}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-white">
        © {new Date().getFullYear()} Trade Meter AI. All rights reserved.
      </footer>
    </div>
  )
}
