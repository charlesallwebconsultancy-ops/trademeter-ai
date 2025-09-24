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
  c: number // current price
  h: number // high
  l: number // low
  o: number // open
  pc: number // previous close
  d: number // change
  dp: number // percent change
}

interface CandleData {
  c: number[] // close prices
  h: number[] // high prices
  l: number[] // low prices
  o: number[] // open prices
  s: string // status
  t: number[] // timestamps
  v: number[] // volumes
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
  const apiKey = process.env.NEXT_PUBLIC_FINNHUB_KEY

  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [chartData, setChartData] = useState<ChartDataset | null>(null)
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ticker || !apiKey) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch company profile
        const profileRes = await fetch(
          `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${apiKey}`
        )
        const profileJson: CompanyProfile = await profileRes.json()
        
        if (!profileJson || !profileJson.name) {
          setError("Company data not found")
          setLoading(false)
          return
        }
        setProfile(profileJson)

        // Fetch current quote
        const quoteRes = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${apiKey}`
        )
        const quoteJson: Quote = await quoteRes.json()
        setQuote(quoteJson)

        // Fetch historical data (last 30 days)
        const today = Math.floor(Date.now() / 1000)
        const thirtyDaysAgo = today - (30 * 24 * 60 * 60)

        const candleRes = await fetch(
          `https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=D&from=${thirtyDaysAgo}&to=${today}&token=${apiKey}`
        )
        const candleJson: CandleData = await candleRes.json()

        if (candleJson.s === "ok" && candleJson.t && candleJson.c) {
          const labels = candleJson.t.map((timestamp: number) =>
            new Date(timestamp * 1000).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })
          )
          
          setChartData({
            labels,
            datasets: [
              {
                label: `${ticker} Closing Price (Last 30 Days)`,
                data: candleJson.c,
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
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [ticker, apiKey])

  if (!apiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Configuration Error</h2>
          <p>Finnhub API key is missing. Please add NEXT_PUBLIC_FINNHUB_KEY to your environment variables.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-900">
        <nav className="flex justify-between items-center px-8 py-4 shadow-md bg-gray-800">
          <Link href="/" className="text-xl font-bold text-white">Trade Meter AI</Link>
          <div className="space-x-6">
            <Link href="/" className="text-gray-300 hover:text-[#9AC0DB]">Home</Link>
            <Link href="/search" className="text-gray-300 hover:text-[#9AC0DB]">Search</Link>
          </div>
        </nav>
        <div className="flex-1 flex items-center justify-center text-red-400">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
            <Link
              href="/search"
              className="inline-block mt-4 bg-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-white"
            >
              ← Back to Search
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9AC0DB] mx-auto mb-4"></div>
          <p>Loading company data...</p>
        </div>
      </div>
    )
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000) {
      return `$${(marketCap / 1000).toFixed(1)}B`
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(1)}M`
    } else {
      return `$${marketCap.toFixed(1)}M`
    }
  }

  const formatChange = (change: number, percentChange: number) => {
    const isPositive = change >= 0
    const changeColor = isPositive ? 'text-green-400' : 'text-red-400'
    const changeSymbol = isPositive ? '+' : ''
    
    return (
      <span className={changeColor}>
        {changeSymbol}${change.toFixed(2)} ({changeSymbol}{percentChange.toFixed(2)}%)
      </span>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Top Navigation */}
      <nav className="flex justify-between items-center px-8 py-4 shadow-md bg-gray-800">
        <Link href="/" className="text-xl font-bold text-white">Trade Meter AI</Link>
        <div className="space-x-6">
          <Link href="/" className="text-gray-300 hover:text-[#9AC0DB]">Home</Link>
          <Link href="/search" className="text-gray-300 hover:text-[#9AC0DB]">Search</Link>
          <Link href="/login" className="text-gray-300 hover:text-[#9AC0DB]">Login</Link>
          <Link href="/register" className="text-gray-300 hover:text-[#9AC0DB]">Register</Link>
        </div>
      </nav>

      {/* Page Header */}
      <header className="bg-gray-900 px-8 pt-8 pb-4 border-b border-gray-800">
        <div className="flex items-center space-x-4 mb-4">
          {profile.logo && (
            <img 
              src={profile.logo} 
              alt={`${profile.name} logo`} 
              className="h-16 w-16 rounded-lg bg-white p-2 object-contain" 
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold">
              {profile.name} <span className="text-[#9AC0DB]">({ticker})</span>
            </h1>
            <p className="text-gray-400 mt-1">
              {profile.finnhubIndustry} | {profile.exchange} | {profile.country}
            </p>
            {profile.weburl && (
              <a 
                href={profile.weburl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#9AC0DB] hover:underline text-sm"
              >
                Visit Website →
              </a>
            )}
          </div>
        </div>
        
        {/* Current Price Section */}
        {quote && (
          <div className="flex items-center space-x-6">
            <div>
              <p className="text-3xl font-bold">${quote.c.toFixed(2)}</p>
              <p className="text-sm">
                {formatChange(quote.d, quote.dp)}
              </p>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8">
        {/* Back to Search */}
        <div>
          <Link
            href="/search"
            className="inline-block bg-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            ← Back to Search
          </Link>
        </div>

        {/* Stock Stats */}
        {quote && (
          <section className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Market Data</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              <div>
                <p className="text-gray-400 text-sm">Open</p>
                <p className="text-lg font-semibold">${quote.o.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">High</p>
                <p className="text-lg font-semibold">${quote.h.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Low</p>
                <p className="text-lg font-semibold">${quote.l.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Previous Close</p>
                <p className="text-lg font-semibold">${quote.pc.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Market Cap</p>
                <p className="text-lg font-semibold">{formatMarketCap(profile.marketCapitalization)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Shares Outstanding</p>
                <p className="text-lg font-semibold">{profile.shareOutstanding?.toFixed(0)}M</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">IPO Date</p>
                <p className="text-lg font-semibold">{profile.ipo || "N/A"}</p>
              </div>
            </div>
          </section>
        )}

        {/* Chart */}
        <section className="bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Price Chart (30 Days)</h2>
          {chartData ? (
            <div className="h-96">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { 
                      labels: { color: "#fff" },
                      display: true
                    },
                    tooltip: { 
                      mode: "index", 
                      intersect: false,
                      backgroundColor: "rgba(0,0,0,0.8)",
                      titleColor: "#fff",
                      bodyColor: "#fff"
                    },
                  },
                  scales: {
                    x: { 
                      ticks: { color: "#ccc" }, 
                      grid: { color: "rgba(255,255,255,0.1)" },
                      title: {
                        display: true,
                        text: 'Date',
                        color: '#ccc'
                      }
                    },
                    y: { 
                      ticks: { 
                        color: "#ccc",
                        callback: function(value) {
                          return '$' + value;
                        }
                      }, 
                      grid: { color: "rgba(255,255,255,0.1)" },
                      title: {
                        display: true,
                        text: 'Price ($)',
                        color: '#ccc'
                      }
                    },
                  },
                }}
              />
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center">
              <p className="text-gray-400">Chart data not available</p>
            </div>
          )}
        </section>

        {/* AI Analysis Section */}
        <section className="flex justify-center">
          <div className="text-center">
            <button className="bg-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition mb-4">
              Run AI Analysis
            </button>
            <p className="text-gray-400 text-sm">
              <Link href="/register" className="text-blue-400 hover:underline">Register</Link> or{" "}
              <Link href="/login" className="text-blue-400 hover:underline">login</Link> for AI-powered analysis
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400 border-t border-gray-800">
        © {new Date().getFullYear()} Trade Meter AI. All rights reserved.
      </footer>
    </div>
  )
}
