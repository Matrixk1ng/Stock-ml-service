"use client";

// import { useQuery } from "@tanstack/react-query";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
import { Screener, sectors } from "@/types/stock";
import { getSectorPerformance, getStockScreener } from "@/api/stockApis";
import useSWR from "swr";
import { useMemo } from "react";

const SECTORS = [
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

const sectorPerformance = () => getSectorPerformance();

// calls the stock screnner api to get the volumns
const volumeSpikes = () => getStockScreener();

export default function TrendsPage() {
  const { data: sector } = useSWR<sectors[]>( // <-- Use the array type here
    "sectors-performance",
    sectorPerformance, // The fetcher uses the key
    { revalidateOnFocus: false }
  );

  const { data: volume } = useSWR<Screener[]>( // <-- Use the array type here
    "volume-spike", // The key is an array
    volumeSpikes, // The fetcher uses the key
    { revalidateOnFocus: false }
  );
  const latestDate = useMemo(() => {
    if (!sector || sector.length === 0) return null;
    return sector.map((s) => s.date).sort((a, b) => b.localeCompare(a))[0];
  }, [sector]);


  const stocksWithVolumeSpikes = useMemo(() => {
    // 1. Make sure you have data to work with
    if (!volume) {
      return [];
    }
    // 2. Filter the stocks
    const sortedByVolume = [...volume].sort((a, b) => b.volume - a.volume);
    // 3. Sort the results to show the biggest spikes first
    return sortedByVolume.slice(0, 5);
  }, [volume]); // This logic re-runs only when screenerData changes

  const sectorPerformanceMap = useMemo(() => {
    if (!sector || !latestDate) return new Map<string, number>();

    const map = new Map<string, number>();
    sector
      .filter((s) => s.date === latestDate)
      .forEach((s) => {
        map.set(s.sector, Number(s.averageChange));
      });

    return map;
  }, [sector, latestDate]);

  return (
    <div className="space-y-8 text-black">
      <h1 className="text-3xl font-bold text-white">Market Trends</h1>

      {/* Sector Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4 text-black">
          Sector Performance
          {latestDate && (
            <span className="ml-2 text-sm text-gray-500">({latestDate})</span>
          )}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SECTORS.map((sectorName) => {
            // --- FIX IS HERE ---
            // 1. Convert the string to a number for the comparison.
            const performanceValue = sectorPerformanceMap.get(sectorName);

            return (
              <div
                key={sectorName}
                className="p-4 rounded-lg border border-gray-200"
              >
                <h3 className="text-sm font-medium text-gray-900">
                  {sectorName}
                </h3>
                {performanceValue !== undefined ? (
                  <p
                    className={`mt-1 text-lg font-semibold ${
                      performanceValue >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {performanceValue >= 0 ? "+" : ""}
                    {performanceValue.toFixed(2)} %
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-gray-400">N/A</p>
                )}
              </div>
            );
          })}
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
                  Price
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stocksWithVolumeSpikes.map((stock) => (
                <tr key={stock.symbol}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stock.symbol}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stock.companyName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stock.volume.toLocaleString()}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {stock.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price Chart */}
      {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Market Trend</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalPrices}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.split("-")[2]}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value}`, "Price"]}
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
      </div> */}
    </div>
  );
}
