'use client'

import { useQuery } from '@tanstack/react-query'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useParams } from 'next/navigation'

// Mock stock data
const mockStockData = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  price: 185.92,
  change: 2.3,
  volume: 52345678,
  marketCap: '2.8T',
  pe: 29.5,
  eps: 6.31,
  dividend: 0.92,
  yield: 0.5,
  sector: 'Technology',
  industry: 'Consumer Electronics',
  description:
    'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
}

// Mock historical data
const mockHistoricalData = [
  { date: '2024-01-01', price: 180.5 },
  { date: '2024-01-02', price: 182.3 },
  { date: '2024-01-03', price: 181.8 },
  { date: '2024-01-04', price: 183.2 },
  { date: '2024-01-05', price: 184.5 },
  { date: '2024-01-06', price: 183.9 },
  { date: '2024-01-07', price: 185.2 },
]

// Mock news data
const mockNews = [
  {
    id: 1,
    title: 'Apple Reports Record Q4 Earnings',
    summary: 'Apple Inc. reported record-breaking fourth-quarter earnings, driven by strong iPhone sales.',
    date: '2024-01-15',
    url: '#',
  },
  {
    id: 2,
    title: 'New iPhone Model Expected in Q3',
    summary: 'Apple is expected to launch its next-generation iPhone in the third quarter of 2024.',
    date: '2024-01-14',
    url: '#',
  },
  {
    id: 3,
    title: 'Apple Expands Services Business',
    summary: 'Apple continues to grow its services segment with new subscription offerings.',
    date: '2024-01-13',
    url: '#',
  },
]

export default function StockDetailPage() {
  const params = useParams()
  const symbol = params.symbol as string


  const { data: stock = mockStockData } = useQuery({
    queryKey: ['stock', symbol],
    queryFn: async () => {
      // Replace with actual API call
      return mockStockData
    },
  })

  const { data: historicalData = mockHistoricalData } = useQuery({
    queryKey: ['historical', params.symbol],
    queryFn: async () => {
      // Replace with actual API call
      return mockHistoricalData
    },
  })

  const { data: news = mockNews } = useQuery({
    queryKey: ['news', params.symbol],
    queryFn: async () => {
      // Replace with actual API call
      return mockNews
    },
  })

  return (
    <div className="space-y-8 bg-white text-black min-h-screen p-8">
      {/* Stock Header */}
      <div className="bg-white rounded-xl shadow-sm border border-black p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{stock.symbol}</h1>
            <p className="text-gray-600">{stock.name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold">${stock.price.toFixed(2)}</p>
            <p
              className={`text-sm ${
                stock.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stock.change >= 0 ? '+' : ''}
              {stock.change}%
            </p>
          </div>
        </div>
      </div>

      {/* Stock Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Price Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-black p-6">
          <h2 className="text-xl font-semibold mb-4">Price History</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value.split('-')[2]}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value}`, 'Price']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Company Info */}
        <div className="bg-white rounded-xl shadow-sm border border-black p-6">
          <h2 className="text-xl font-semibold mb-4">Company Information</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Sector</dt>
              <dd className="mt-1 text-sm text-gray-900">{stock.sector}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Industry</dt>
              <dd className="mt-1 text-sm text-gray-900">{stock.industry}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Market Cap</dt>
              <dd className="mt-1 text-sm text-gray-900">${stock.marketCap}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">P/E Ratio</dt>
              <dd className="mt-1 text-sm text-gray-900">{stock.pe}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">EPS</dt>
              <dd className="mt-1 text-sm text-gray-900">${stock.eps}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Dividend</dt>
              <dd className="mt-1 text-sm text-gray-900">${stock.dividend}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Dividend Yield</dt>
              <dd className="mt-1 text-sm text-gray-900">{stock.yield}%</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Volume</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {stock.volume.toLocaleString()}
              </dd>
            </div>
          </dl>
          <div className="mt-6">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900">{stock.description}</dd>
          </div>
        </div>
      </div>

      {/* News */}
      <div className="bg-white rounded-xl shadow-sm border border-black p-6">
        <h2 className="text-xl font-semibold mb-4">Latest News</h2>
        <div className="space-y-4">
          {news.map((item) => (
            <article key={item.id} className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 mb-2">{item.summary}</p>
              <div className="flex items-center justify-between">
                <time className="text-sm text-gray-500">{item.date}</time>
                <a
                  href={item.url}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read more →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
} 