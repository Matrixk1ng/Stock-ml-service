'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// Mock sectors
const sectors = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Consumer Cyclical',
  'Energy',
  'Industrials',
  'Real Estate',
  'Utilities',
]

// Mock market cap ranges
const marketCapRanges = [
  { label: 'Mega Cap (>$100B)', value: 'mega' },
  { label: 'Large Cap ($10B-$100B)', value: 'large' },
  { label: 'Mid Cap ($2B-$10B)', value: 'mid' },
  { label: 'Small Cap ($300M-$2B)', value: 'small' },
  { label: 'Micro Cap (<$300M)', value: 'micro' },
]

// Mock stock data
const mockStocks = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 185.92,
    change: 2.3,
    volume: 52345678,
    marketCap: '2.8T',
    sector: 'Technology',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    price: 374.58,
    change: 1.8,
    volume: 23456789,
    marketCap: '2.7T',
    sector: 'Technology',
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    price: 172.28,
    change: -0.5,
    volume: 12345678,
    marketCap: '495B',
    sector: 'Financial Services',
  },
]

export default function ScreenerPage() {
  const [filters, setFilters] = useState({
    sector: '',
    marketCap: '',
    minPrice: '',
    maxPrice: '',
  })

  const { data: stocks = mockStocks } = useQuery({
    queryKey: ['stocks', filters],
    queryFn: async () => {
      // Replace with actual API call
      return mockStocks
    },
  })

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-8 text-black">
      <h1 className="text-3xl font-bold">Stock Screener</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
              Sector
            </label>
            <select
              id="sector"
              name="sector"
              value={filters.sector}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Sectors</option>
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="marketCap" className="block text-sm font-medium text-gray-700">
              Market Cap
            </label>
            <select
              id="marketCap"
              name="marketCap"
              value={filters.marketCap}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Market Caps</option>
              {marketCapRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">
              Min Price
            </label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="0"
            />
          </div>

          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">
              Max Price
            </label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="1000"
            />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Volume
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Market Cap
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sector
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stocks.map((stock) => (
              <tr key={stock.symbol} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {stock.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stock.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${stock.price.toFixed(2)}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stock.change >= 0 ? '+' : ''}
                  {stock.change}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stock.volume.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${stock.marketCap}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {stock.sector}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 