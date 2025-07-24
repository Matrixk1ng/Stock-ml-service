"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Dialog, DialogTitle } from "@headlessui/react";

// --- 1) Types ---
interface Holding {
  id: number;
  symbol: string;
  shares: number;
  averageCost: number;
}

interface Portfolio {
  holdings: Holding[];
}

interface MappedFinnhubQuote {
  currentPrice: number;
}

// --- 2) Dummy data ---
const dummyPortfolio: Portfolio = {
  holdings: [
    { id: 1, symbol: "AAPL", shares: 10, averageCost: 120 },
    { id: 2, symbol: "MSFT", shares: 5, averageCost: 250 },
    { id: 3, symbol: "TSLA", shares: 2, averageCost: 680 },
  ],
};

// --- 3) Fake quote function ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fakeQuote = (symbol: string): MappedFinnhubQuote => ({
  // random price between $50 and $350
  currentPrice: Math.random() * 300 + 50,
});

// --- 4) A row component with correct typing ---
function HoldingRow({ holding }: { holding: Holding }) {
  const quote = fakeQuote(holding.symbol);
  const currentValue = quote.currentPrice * holding.shares;
  const totalCost = holding.averageCost * holding.shares;
  const gainLoss = currentValue - totalCost;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 font-medium">{holding.symbol}</td>
      <td className="px-6 py-4">{holding.shares}</td>
      <td className="px-6 py-4">${holding.averageCost.toFixed(2)}</td>
      <td className="px-6 py-4">${quote.currentPrice.toFixed(2)}</td>
      <td className="px-6 py-4">${currentValue.toFixed(2)}</td>
      <td
        className={`px-6 py-4 ${
          gainLoss >= 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        {gainLoss.toFixed(2)}
      </td>
    </tr>
  );
}

// --- 5) The main page component ---
export default function PortfolioPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState(0);
  const [avgCost, setAvgCost] = useState(0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    // 1) validate…
    // 2) call your API or update SWR cache
    console.log("Adding", { symbol, shares, avgCost });
    setIsAddOpen(false); 
  };
  // use the dummy portfolio
  const portfolio: Portfolio = dummyPortfolio;

  // build a map of fake quotes
  const quotes: Record<string, MappedFinnhubQuote> = {};
  portfolio.holdings.forEach((h) => {
    quotes[h.symbol] = fakeQuote(h.symbol);
  });

  // calculate totals
  const totalValue = portfolio.holdings.reduce((sum, h) => {
    const q = quotes[h.symbol];
    return sum + q.currentPrice * h.shares;
  }, 0);

  const pieData = portfolio.holdings.map((h) => ({
    name: h.symbol,
    value: parseFloat((quotes[h.symbol].currentPrice * h.shares).toFixed(2)),
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Portfolio</h1>
      <button
        onClick={() => setIsAddOpen(true)}
        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        + Add Stock
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: summary + table */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-medium text-gray-500">
              Total Portfolio Value
            </h2>
            <p className="text-4xl font-bold mt-2">
              $
              {totalValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <h2 className="text-xl font-semibold p-6">Holdings</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    Shares
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    Avg Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                    Gain/Loss
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {portfolio.holdings.map((h) => (
                  <HoldingRow key={h.id} holding={h} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: pie chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Allocation</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  labelLine={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <Dialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* backdrop */}
        <div aria-hidden="true" className="fixed inset-0 bg-black/30" />

        <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 z-10">
          <DialogTitle className="text-xl font-semibold mb-4">
            Add New Holding
          </DialogTitle>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="mt-1 block w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Shares</label>
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(+e.target.value)}
                className="mt-1 block w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Avg Cost</label>
              <input
                type="number"
                step="0.01"
                value={avgCost}
                onChange={(e) => setAvgCost(+e.target.value)}
                className="mt-1 block w-full border rounded p-2"
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}
