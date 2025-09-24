"use client"
import { useState } from "react"
import Link from "next/link"
import { supabase } from "../../lib/supabaseClient"

interface Company {
  ticker: string
  name: string
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!query) return
    setLoading(true)
    setError("")
    setResults([])

    try {
      console.log("Searching for:", query)

      // Step 1: Search ticker
      const { data: tickerResults, error: tickerError } = await supabase
        .from("companies")
        .select("ticker, name")
        .ilike("ticker", `%${query}%`)
        .limit(10)

      if (tickerError) throw tickerError
      let finalResults: Company[] = tickerResults || []

      // Step 2: If nothing found by ticker, search by name
      if (finalResults.length === 0) {
        const { data: nameResults, error: nameError } = await supabase
          .from("companies")
          .select("ticker, name")
          .ilike("name", `%${query}%`)
          .limit(10)

        if (nameError) throw nameError
        finalResults = nameResults || []
      }

      setResults(finalResults)
    } catch (err: unknown) {
      console.error("Search error:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Nav */}
      <nav className="flex justify-between items-center px-8 py-4 shadow-md bg-gray-800">
        <div className="text-xl font-bold">Trade Meter AI</div>
        <div className="space-x-6">
          <Link href="/" className="hover:text-[#9AC0DB]">Home</Link>
          <Link href="/about" className="hover:text-[#9AC0DB]">About Us</Link>
          <Link href="/analyst" className="hover:text-[#9AC0DB]">AI Analyst</Link>
          <Link href="/contact" className="hover:text-[#9AC0DB]">Contact Us</Link>
        </div>
      </nav>

      {/* Search Box */}
      <main className="flex flex-col items-center justify-center flex-1 px-6">
        <h1 className="text-3xl font-bold mb-6">Search Companies</h1>
        <div className="w-full max-w-lg flex space-x-2 mb-6">
          <input
            type="text"
            placeholder="Enter company name or ticker..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 p-3 rounded bg-gray-100 text-black"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 px-6 py-3 rounded text-white hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {error && <p className="text-red-400 mb-4">{error}</p>}
        {!loading && results.length === 0 && query && !error && (
          <p className="text-gray-400">No results found.</p>
        )}

        <ul className="w-full max-w-lg space-y-3">
          {results.map((c) => (
            <li key={c.ticker}>
              <Link
                href={`/company/${c.ticker}`}
                className="block p-4 bg-gray-800 rounded hover:bg-gray-700"
              >
                {c.name} ({c.ticker})
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
