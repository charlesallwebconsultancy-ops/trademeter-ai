"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface CompanyProfile {
  name: string
  ticker: string
  exchange: string
  ipo: string
  marketCapitalization: number
  logo: string
  finnhubIndustry: string
}

interface Quote {
  c: number // current price
  h: number
  l: number
  o: number
  pc: number
}

interface ChartDataset {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
    tension: number
  }[]
}

export default function CompanyPage() {
  const params = useParams()
  const ticker = (params?.ticker as string)?.toUpperCase()
  const apiKey = process.env.NEXT_PUBLIC_FINNHUB_KEY

  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [chartData, setChartData] = useState<ChartDataset | null>(null)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (!ticker) return

    const fetchData = async () => {
      try {
        // Profile
        const profileRes = await fetch(
          `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${apiKey}`
        )
        const profileJson = await profileRes.json()
        if (!profileJson || !profileJson.name) {
          setError("Company data not found")
          return
        }
        setProfile(profileJson)

        // Quote
        const quoteRes = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`
        )
        const quoteJson = await quoteRes.json()
        setQuote(quoteJson)

        // Candles (last 30 days)
        const today = Math.floor(Date.now() / 1000)
        const thirtyDaysAgo = today - 60 * 60 * 24 * 30

        const candleRes = await fetch(
          `https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=D&from=${thirtyDaysAgo}&to=${today}&token=${apiKey}`
        )
        const candleJson = await candleRes.json()

        if (candleJson.s === "ok") {
          const labels = candleJson.t.map((ts: number) =>
            new Date(ts * 1000).toLocaleDateString()
          )
          const prices = candleJson.c

          setChartData({
            labels,
            datasets: [
              {
                label: `${ticker} Closing Price (Last 30 Days)`,
                data: prices,
                borderColor: "#9AC0DB",
                backgroundColor: "rgba(154, 192, 219, 0.3)",
                tension: 0.2,
              },
            ],
          })
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load company data.")
      }
    }

    fetchData()
  }, [ticker, apiKey])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        {error}
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Top Nav */}
      <nav className="flex justify-between items-center px-8 py-4 shadow-md bg-gray-800">
        <div className="text-xl font-bold">Trade Meter AI</div>
        <div className="space-x-6">
          <Link href="/" className="hover:text-[#9AC0DB]">Home</Link>
          <Link href="/about" className="hover:text-[#9AC0DB]">About Us</Link>
          <Link href="/analyst" className="hover:text-[#9AC0DB]">AI Analyst</Link>
          <Link href="/contact" className="hover:text-[#9AC0DB]">Contact Us</Link>
        </div>
      </nav>

      {/* Header */}
      <header className="px-8 pt-8 pb-4 border-b border-gray-800 flex items-center space-x-4">
        {profile.logo && (
          <img src={profile.logo} alt={`${profile.name} logo`} className="h-12 w-12 rounded bg-white p-1" />
        )}
        <div>
          <h1 className="text-3xl font-bold">
            {profile.name} <span className="text-[#9AC0DB]">({ticker})</span>
          </h1>
          <p className="text-gray-400 mt-1">
            {profile.finnhubIndustry} | {profile.exchange}
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 p-8 space-y-8">
        <Link
          href="/search"
          className="inline-block bg-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          ← Back to Search
        </Link>

        {quote && (
          <section className="bg-gray-800 p-6 rounded shadow-md grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            <div><p className="text-gray-400">Current Price</p><p className="text-lg font-semibold">${quote.c}</p></div>
            <div><p className="text-gray-400">Open</p><p className="text-lg font-semibold">${quote.o}</p></div>
            <div><p className="text-gray-400">High</p><p className="text-lg font-semibold">${quote.h}</p></div>
            <div><p className="text-gray-400">Low</p><p className="text-lg font-semibold">${quote.l}</p></div>
            <div><p className="text-gray-400">Prev Close</p><p className="text-lg font-semibold">${quote.pc}</p></div>
            <div><p className="text-gray-400">Market Cap</p><p className="text-lg font-semibold">{profile.marketCapitalization}B</p></div>
            <div><p className="text-gray-400">IPO</p><p className="text-lg font-semibold">{profile.ipo}</p></div>
          </section>
        )}

        {/* Chart */}
        <section className="bg-gray-800 p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-3">Stock Price Chart</h2>
          {chartData ? (
            <Line
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { labels: { color: "#fff" } },
                },
                scales: {
                  x: { ticks: { color: "#ccc" }, grid: { color: "rgba(255,255,255,0.1)" } },
                  y: { ticks: { color: "#ccc" }, grid: { color: "rgba(255,255,255,0.1)" } },
                },
              }}
            />
          ) : (
            <p className="text-gray-400">Chart data not available.</p>
          )}
        </section>

        <section className="flex justify-center">
          <button className="bg-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition">
            Run AI Analysis
          </button>
        </section>
      </main>

      <footer className="py-6 text-center text-sm text-gray-400 border-t border-gray-800">
        © {new Date().getFullYear()} Trade Meter AI. All rights reserved.
      </footer>
    </div>
  )
}
