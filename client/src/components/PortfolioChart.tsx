"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type DataPoint = {
  date: string;    // e.g. "2025-07-14"
  value: number;   // your portfolio total value
};

// Example static data—replace with your real fetched portfolio history
const sampleData: DataPoint[] = [
  { date: "07/10", value: 12000 },
  { date: "07/11", value: 12500 },
  { date: "07/12", value: 12300 },
  { date: "07/13", value: 12850 },
  { date: "07/14", value: 13020 },
];

export default function PortfolioChart({
  data = sampleData,
}: {
  data?: DataPoint[];
}) {
  return (
    <div className="w-full h-64 bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-2">Portfolio Value</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis 
            domain={["dataMin", "dataMax"]} 
            tickFormatter={(val) => `$${val / 1000}k`} 
          />
          <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            name="Total Value"
            stroke="#4F46E5"
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
