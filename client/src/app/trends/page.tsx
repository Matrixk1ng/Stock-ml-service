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

// Mock data for sector performance
const mockSectorPerformance = [
  { sector: 'Technology', performance: 12.5 },
  { sector: 'Healthcare', performance: 8.2 },
  { sector: 'Financial Services', performance: 5.7 },
  { sector: 'Consumer Cyclical', performance: 4.3 },
  { sector: 'Energy', performance: -2.1 },
  { sector: 'Industrials', performance: 3.8 },
  { sector: 'Real Estate', performance: -1.5 },
  { sector: 'Utilities', performance: 2.4 },
]

// Mock data for volume spikes
const mockVolumeSpikes = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    volume: 52345678,
    avgVolume: 23456789,
    change: 2.3,
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    volume: 45678912,
    avgVolume: 34567890,
    change: -2.1,
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    volume: 34567890,
    avgVolume: 23456789,
    change: 3.5,
  },
]

// Mock data for historical prices
const mockHistoricalPrices = [
  { date: '2024-01-01', price: 180.5 },
  { date: '2024-01-02', price: 182.3 },
  { date: '2024-01-03', price: 181.8 },
  { date: '2024-01-04', price: 183.2 },
  { date: '2024-01-05', price: 184.5 },
  { date: '2024-01-06', price: 183.9 },
  { date: '2024-01-07', price: 185.2 },
]

export default function TrendsPage() {
  const { data: sectorPerformance = mockSectorPerformance } = useQuery({
    queryKey: ['sectorPerformance'],
    queryFn: async () => {
      // Replace with actual API call
      return mockSectorPerformance
    },
  })

  const { data: volumeSpikes = mockVolumeSpikes } = useQuery({
    queryKey: ['volumeSpikes'],
    queryFn: async () => {
      // Replace with actual API call
      return mockVolumeSpikes
    },
  })

  const { data: historicalPrices = mockHistoricalPrices } = useQuery({
    queryKey: ['historicalPrices'],
    queryFn: async () => {
      // Replace with actual API call
      return mockHistoricalPrices
    },
  })

  return (
    <div className="space-y-8 text-black">
      <h1 className="text-3xl font-bold text-white">Market Trends</h1>

      {/* Sector Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4 text-black">Sector Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {sectorPerformance.map((sector) => (
            <div
              key={sector.sector}
              className="p-4 rounded-lg border border-gray-200"
            >
              <h3 className="text-sm font-medium text-gray-900">
                {sector.sector}
              </h3>
              <p
                className={`mt-1 text-lg font-semibold ${
                  sector.performance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {sector.performance >= 0 ? '+' : ''}
                {sector.performance}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Volume Spikes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Volume Spikes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volume
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Volume
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {volumeSpikes.map((stock) => (
                <tr key={stock.symbol}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stock.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stock.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stock.volume.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stock.avgVolume.toLocaleString()}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stock.change >= 0 ? '+' : ''}
                    {stock.change}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Market Trend</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalPrices}>
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
    </div>
  )
} 