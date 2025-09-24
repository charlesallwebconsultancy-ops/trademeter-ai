"use client"

import { useEffect, useState } from "react"
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
  shareOutstanding: number
  logo: string
  finnhubIndustry: string
  weburl: string
  country: string
}

interface Quote {
  c: number
  h: number
  l: number
  o: number
  pc: number
  d: number
  dp: number
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

export default function CompanyPage({ params }: { params: { ticker: string } }) {
  const ticker = params.ticker.toUpperCase()
  const finnhubKey = process.env.NEXT_PUBLIC_FINNHUB_KEY
  const rapidApiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY

  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [chartData, setChartData] = useState<ChartDataset | null>(null)
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ticker || !finnhubKey) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // --- Company Profile (Finnhub)
        const profileRes = await fetch(
          `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${finnhubKey}`
        )
        const profileJson: CompanyProfile = await profileRes.json()
        if (!profileJson || !profileJson.name) {
          setError("Company data not found")
          setLoading(false)
          return
        }
        setProfile(profileJson)

        // --- Current Quote (Finnhub)
        const quoteRes = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${finnhubKey}`
        )
        const quoteJson: Quote = await quoteRes.json()
        setQuote(quoteJson)

        // --- Historical Data (Yahoo via RapidAPI)
        if (!rapidApiKey) {
          console.warn("RapidAPI key missing")
          setChartData(null)
          return
        }
        
// Updated for yahoo finance
        
        const yahooRes = await fetch(
          `https://yh-finance.p.rapidapi.com/stock/v3/get-chart?symbol=${ticker}&interval=1d&range=1mo`,
          {
            headers: {
              "X-RapidAPI-Key": rapidApiKey,
              "X-RapidAPI-Host": "yh-finance.p.rapidapi.com",
            },
          }
        )

        const yahooJson = await yahooRes.json()
        const result = yahooJson?.chart?.result?.[0]

        if (result && result.timestamp && result.indicators?.quote?.[0]?.close) {
          const labels = result.timestamp.map((ts: number) =>
            new Date(ts * 1000).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          )

          const closes = result.indicators.quote[0].close

          setChartData({
            labels,
            datasets: [
              {
                label: `${ticker} Closing Price (Last 30 Days)`,
                data: closes,
                borderColor: "#9AC0DB",
                backgroundColor: "rgba(154, 192, 219, 0.3)",
                tension: 0.2,
              },
            ],
          })
        } else {
          setChartData(null)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load company data.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [ticker, finnhubKey, rapidApiKey])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        {error}
      </div>
    )
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    )
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000) return `$${(marketCap / 1000).toFixed(1)}B`
    if (marketCap >= 1000) return `$${(marketCap / 1000).toFixed(1)}M`
    return `$${marketCap.toFixed(1)}M`
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 shadow-md bg-gray-800">
        <Link href="/" className="text-xl font-bold text-white">Trade Meter AI</Link>
        <div className="space-x-6">
          <Link href="/" className="text-gray-300 hover:text-[#9AC0DB]">Home</Link>
          <Link href="/search" className="text-gray-300 hover:text-[#9AC0DB]">Search</Link>
          <Link href="/login" className="text-gray-300 hover:text-[#9AC0DB]">Login</Link>
          <Link href="/register" className="text-gray-300 hover:text-[#9AC0DB]">Register</Link>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-gray-900 px-8 pt-8 pb-4 border-b border-gray-800">
        <h1 className="text-3xl font-bold">
          {profile.name} <span className="text-[#9AC0DB]">({ticker})</span>
        </h1>
        <p className="text-gray-400 mt-1">
          {profile.finnhubIndustry} | {profile.exchange} | {profile.country}
        </p>
      </header>

      {/* Main */}
      <main className="flex-1 p-8 space-y-8">
        <div>
          <Link href="/search" className="inline-block bg-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            ← Back to Search
          </Link>
        </div>

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
                  tooltip: { mode: "index", intersect: false },
                },
                scales: {
                  x: { ticks: { color: "#ccc" } },
                  y: { ticks: { color: "#ccc" } },
                },
              }}
            />
          ) : (
            <p className="text-gray-400">Chart data not available</p>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400 border-t border-gray-800">
        © {new Date().getFullYear()} Trade Meter AI. All rights reserved.
      </footer>
    </div>
  )
}
