"use client";

import { useMemo, useState } from "react";
import { Screener } from "@/types/stock";
import { getStockScreener } from "@/api/stockApis";
import useSWR from "swr";
import Link from "next/link";

const ScreenerFetcher = () => getStockScreener();

// Mock sectors
const sectors = [
  "Technology",
  "Healthcare",
  "Financial Services",
  "Consumer Cyclical",
  "Energy",
  "Industrials",
  "Real Estate",
  "Utilities",
  "Basic Materials",
  "Communication Services",
  "Consumer Defensive",
];

// Mock market cap ranges
const marketCapRanges = [
  { label: "Mega Cap (>$200B)", value: "mega", min: 200e9, max: Infinity },
  { label: "Large Cap ($10B-$200B)", value: "large", min: 10e9, max: 200e9 },
  { label: "Mid Cap ($2B-$10B)", value: "mid", min: 2e9, max: 10e9 },
  { label: "Small Cap ($300M-$2B)", value: "small", min: 300e6, max: 2e9 },
  { label: "Micro Cap (<$300M)", value: "micro", min: 0, max: 300e6 },
];

// Mock stock data
const formatMarketCap = (marketCap: number): string => {
  if (marketCap > 1e12) {
    return `${(marketCap / 1e12).toFixed(2)}T`;
  }
  if (marketCap > 1e9) {
    return `${(marketCap / 1e9).toFixed(2)}B`;
  }
  if (marketCap > 1e6) {
    return `${(marketCap / 1e6).toFixed(2)}M`;
  }
  return marketCap.toString();
};

export default function ScreenerPage() {
  const { data: screener, error: screenerError } = useSWR<Screener[]>( // <-- Use the array type here
    "screener", // The key is an array
    ScreenerFetcher, // The fetcher uses the key
    { revalidateOnFocus: false }
  );

  const [filters, setFilters] = useState({
    sector: "",
    marketCap: "",
    minPrice: "",
    maxPrice: "",
  });

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredScreener = useMemo(() => {
    if (!screener) return []; // Return empty if master list isn't loaded yet
    const usStocks = screener.filter(
      (stock) =>
        // 1) US-listed on Nasdaq or NYSE
        stock.country === "US" &&
        (stock.exchangeShortName === "NASDAQ" ||
          stock.exchangeShortName === "NYSE") &&
        // 2) Must have a sector
        Boolean(stock.sector) &&
        // 3) Exclude any fund or ETF (use the correct flags!)
        // 4) Only live, actively trading tickers
        stock.volume > 0
    );

    let filtered = usStocks;

    // 1. Filter by Sector
    if (filters.sector) {
      filtered = filtered.filter((stock) => stock.sector === filters.sector);
    }

    // 2. Filter by Market Cap
    if (filters.marketCap) {
      const range = marketCapRanges.find((r) => r.value === filters.marketCap);
      if (range) {
        filtered = filtered.filter(
          (stock) => stock.marketCap >= range.min && stock.marketCap < range.max
        );
      }
    }

    // 3. Filter by Min Price
    if (filters.minPrice) {
      const minPrice = parseFloat(filters.minPrice);
      filtered = filtered.filter((stock) => stock.price >= minPrice);
    }

    // 4. Filter by Max Price
    if (filters.maxPrice) {
      const maxPrice = parseFloat(filters.maxPrice);
      filtered = filtered.filter((stock) => stock.price <= maxPrice);
    }

    return filtered;
  }, [screener, filters]); // Re-run this logic only when the master list or filters change

  return (
    <div className="space-y-8 text-black">
      <h1 className="text-3xl font-bold">Stock Screener</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="sector"
              className="block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="marketCap"
              className="block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="minPrice"
              className="block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="maxPrice"
              className="block text-sm font-medium text-gray-700"
            >
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
            {screenerError && (
              <tr>
                <td colSpan={7} className="text-center p-4 text-red-500">
                  Failed to load screener data.
                </td>
              </tr>
            )}
            {!screener && !screenerError && (
              <tr>
                <td colSpan={7} className="text-center p-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            )}
            {screener &&
              filteredScreener.map((stock) => (
                <tr key={stock.symbol} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                    <Link href={`/stock/${stock.symbol}`}>{stock.symbol}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">
                    {stock.companyName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${Number(stock.price).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stock.volume.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatMarketCap(stock.marketCap)}
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
  );
}
