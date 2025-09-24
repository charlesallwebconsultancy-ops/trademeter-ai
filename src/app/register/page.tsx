"use client"
import { useState } from "react"
import { supabase } from "../../lib/supabaseClient"

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")

  const handleRegister = async () => {
    // Check password match
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      return
    }

    // Create user in Supabase auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    // If signup is successful, insert into profiles table
    const user = data.user
    if (user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          { id: user.id, first_name: firstName, last_name: lastName }
        ])
      if (profileError) {
        setMessage("Account created, but profile save failed.")
        console.error(profileError)
        return
      }
    }

    setMessage("Registration successful! Please check your email to confirm your account.")
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

      {/* Register Form */}
      <main className="flex flex-col items-center justify-center flex-1 text-center px-6">
        <h1 className="text-3xl font-bold text-white mb-6">Create an Account</h1>

        <div className="bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            className="w-full mb-4 p-3 rounded bg-gray-100 text-black"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            className="w-full mb-4 p-3 rounded bg-gray-100 text-black"
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full mb-4 p-3 rounded bg-gray-100 text-black"
          />
          <button
            onClick={handleRegister}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Register
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
