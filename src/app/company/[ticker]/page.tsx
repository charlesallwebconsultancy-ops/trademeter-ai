"use client"

import { use, useEffect, useState } from "react"
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

export default function CompanyPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = use(params)
  const upperTicker = ticker.toUpperCase()
  const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY

  const [overview, setOverview] = useState<any>(null)
  const [chartData, setChartData] = useState<any>(null)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch company overview
        const overviewRes = await fetch(
          `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${upperTicker}&apikey=${apiKey}`
        )
        const overviewJson = await overviewRes.json()
        if (!overviewJson || !overviewJson.Name) {
          setError("Company data not found")
          return
        }
        setOverview(overviewJson)

        // Fetch daily stock prices
        const priceRes = await fetch(
          `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${upperTicker}&outputsize=compact&apikey=${apiKey}`
        )
        const priceJson = await priceRes.json()
        const series = priceJson["Time Series (Daily)"] || {}

        const labels = Object.keys(series).slice(0, 30).reverse()
        const prices = labels.map((date) => parseFloat(series[date]["4. close"]))

        setChartData({
          labels,
          datasets: [
            {
              label: `${upperTicker} Closing Price (Last 30 Days)`,
              data: prices,
              borderColor: "#9AC0DB",
              backgroundColor: "rgba(154, 192, 219, 0.3)",
              tension: 0.2,
            },
          ],
        })
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError("Failed to load company data.")
      }
    }

    fetchData()
  }, [upperTicker, apiKey])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        {error}
      </div>
    )
  }

  if (!overview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Top Navigation */}
      <nav className="flex justify-between items-center px-8 py-4 shadow-md bg-gray-800">
        <div className="text-xl font-bold text-white">Trade Meter AI</div>
        <div className="space-x-6">
          <Link href="/" className="text-gray-300 hover:text-[#9AC0DB]">Home</Link>
          <Link href="/about" className="text-gray-300 hover:text-[#9AC0DB]">About Us</Link>
          <Link href="/analyst" className="text-gray-300 hover:text-[#9AC0DB]">AI Analyst</Link>
          <Link href="/contact" className="text-gray-300 hover:text-[#9AC0DB]">Contact Us</Link>
        </div>
      </nav>

      {/* Page Header */}
      <header className="bg-gray-900 px-8 pt-8 pb-4 border-b border-gray-800">
        <h1 className="text-3xl font-bold">
          {overview.Name} <span className="text-[#9AC0DB]">({upperTicker})</span>
        </h1>
        <p className="text-gray-400 mt-1">
          {overview.Industry} | {overview.Sector}
        </p>
      </header>

      {/* Main */}
      <main className="flex-1 p-8 space-y-8">
        {/* Back to Search Button */}
        <div>
          <Link
            href="/search"
            className="inline-block bg-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            ← Back to Search
          </Link>
        </div>

        {/* Overview */}
        <section className="bg-gray-800 p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold mb-3">Company Overview</h2>
          <p className="text-gray-300 leading-relaxed">{overview.Description}</p>
        </section>

        {/* Stats */}
        <section className="bg-gray-800 p-6 rounded shadow-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div><p className="text-gray-400">Market Cap</p><p className="text-lg font-semibold">{overview.MarketCapitalization}</p></div>
          <div><p className="text-gray-400">52 Week High</p><p className="text-lg font-semibold">{overview["52WeekHigh"]}</p></div>
          <div><p className="text-gray-400">52 Week Low</p><p className="text-lg font-semibold">{overview["52WeekLow"]}</p></div>
          <div><p className="text-gray-400">Dividend Yield</p><p className="text-lg font-semibold">{overview.DividendYield || "N/A"}</p></div>
          <div><p className="text-gray-400">EPS</p><p className="text-lg font-semibold">{overview.EPS || "N/A"}</p></div>
          <div><p className="text-gray-400">PE Ratio</p><p className="text-lg font-semibold">{overview.PERatio || "N/A"}</p></div>
        </section>

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
                  x: { ticks: { color: "#ccc" }, grid: { color: "rgba(255,255,255,0.1)" } },
                  y: { ticks: { color: "#ccc" }, grid: { color: "rgba(255,255,255,0.1)" } },
                },
              }}
            />
          ) : (
            <p className="text-gray-400">Chart data not available.</p>
          )}
        </section>

        {/* AI Analysis */}
        <section className="flex justify-center">
          <button className="bg-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-blue-700 transition">
            Run AI Analysis
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400 border-t border-gray-800">
        © {new Date().getFullYear()} Trade Meter AI. All rights reserved.
      </footer>
    </div>
  )
}
