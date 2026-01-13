"use client";
import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useParams } from "next/navigation";
import {
  HistoricalChart,
  MappedFinnhubQuote,
  //HistoricalChartApiResponse,
  CompanyProfile,
  News,
  PriceChange,
  MlSignal,
  MlDriver,
} from "@/types/stock";
import {
  getHistoricalChart,
  getFinnhubQuote,

  getCompanyProfile,
  getPriceChange,
} from "@/api/stockApis";
import { useMemo, useState } from "react";
import { getCompanyNews } from "@/api/newsApis";
import { fetchMlSignals, getHistoricalFullPriceChart } from "@/api/rdsApis";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mlSignalsFetcher = ([_key, symbol]: [string, string]) =>
  fetchMlSignals(symbol);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const priceChanges = ([_key, symbol]: [string, string]) =>
  getPriceChange(symbol);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const companyNewsFetcher = ([_key, symbol]: [string, string]) =>
  getCompanyNews(symbol);

// this is for 1D and 5D views
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const historicalChartFetcher = ([_key, symbol]: [string, string]) =>
  getHistoricalChart(symbol);

// This fetcher expects a key like ['daily-chart', 'AAPL']
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const historicalFullPriceFetcher = ([_key, symbol]: [string, string]) =>
  getHistoricalFullPriceChart(symbol);

// for current price
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const finnhubQuoteFetcher = ([_key, symbol]: [string, string]) =>
  getFinnhubQuote(symbol);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const companyProfileFetch = ([_key, symbol]: [string, string]) =>
  getCompanyProfile(symbol);

export default function StockDetailPage() {
  const params = useParams();
  const symbol = params.symbol as string;

  const { data: mlSignals, error: mlSignalsError } = useSWR<MlSignal[]>(
    ["ml-signals", symbol],
    mlSignalsFetcher,
    { revalidateOnFocus: false, refreshInterval: 24 * 60 * 60 * 1000 }
  );

  const [chartTimeframe, setChartTimeframe] = useState<
    "1D" | "5D" | "1M" | "ytd" | "1Y"
  >("1D");

  const { data: priceChangeData } = useSWR<PriceChange>(
    ["price-changes", symbol],
    priceChanges,
    { revalidateOnFocus: false }
  );

  const { data: companyNews } = useSWR<News[]>(
    ["company-news", symbol],
    companyNewsFetcher,
    { revalidateOnFocus: false }
  );

  const { data: companyProfile, error: companyProfileError } =
    useSWR<CompanyProfile>(["company", symbol], companyProfileFetch, {
      refreshInterval: 24 * 60 * 1000,
    });

  const { data: finnhubQuote, error: finnhubError } =
    useSWR<MappedFinnhubQuote>(["quote", symbol], finnhubQuoteFetcher, {
      refreshInterval: 5 * 60 * 1000,
    });

  const { data: historicalChartData, error: historicalChartError } = useSWR<
    HistoricalChart[]
  >(["intraday-chart", symbol], historicalChartFetcher, {
    refreshInterval: 15 * 60 * 1000,
  });

  const { data: historicalFullPriceData, error: historicalFullPriceError } =
    useSWR<HistoricalChart[]>(
      ["daily-chart", symbol], // UNIQUE KEY
      historicalFullPriceFetcher,
      {
        refreshInterval: 24 * 60 * 1000,
      }
    );

  const isLoading =
    !finnhubQuote && !historicalChartData && !historicalFullPriceData;
  const hasError =
    finnhubError || historicalChartError || historicalFullPriceError;

  const currentChange =
    priceChangeData?.[chartTimeframe] !== undefined
      ? Number(priceChangeData[chartTimeframe]).toFixed(2) // This is the fix
      : null;
  const chartData = useMemo(() => {
    if (!historicalChartData || !historicalFullPriceData) return [];

    const getUniqueDays = (data: { date: string }[]) => {
      const dates = data.map((p) => p.date.split(" ")[0]);
      return [...new Set(dates)].sort((a, b) => b.localeCompare(a)); // Sort descending
    };

    switch (chartTimeframe) {
      case "1D": {
        const uniqueDays = getUniqueDays(historicalChartData);
        if (uniqueDays.length === 0) return [];
        const mostRecentDayStr = uniqueDays[0]; // Get the most recent trading day from the data

        // Explicitly filter for only that day's data points
        const todaysData = historicalChartData.filter((p) =>
          p.date.startsWith(mostRecentDayStr)
        );
        const tradingDaySlots = [];
        for (let hour = 9; hour <= 16; hour++) {
          for (let minute = 0; minute < 60; minute += 5) {
            if (hour === 9 && minute < 30) continue;
            if (hour === 16 && minute > 0) continue;
            const time = `${hour.toString().padStart(2, "0")}:${minute
              .toString()
              .padStart(2, "0")}`;
            tradingDaySlots.push(time);
          }
        }

        const todaysDataMap = new Map(
          todaysData.map((p) => [p.date.substring(11, 16), p.close])
        );

        return tradingDaySlots.map((timeSlot) => ({
          date: timeSlot,
          price: todaysDataMap.get(timeSlot) ?? null, // Use null if no data exists yet
        }));
      }
      case "5D": {
        const lastFiveTradingDays = getUniqueDays(historicalChartData).slice(
          0,
          5
        );

        return historicalChartData
          .filter((p) => lastFiveTradingDays.includes(p.date.split(" ")[0]))
          .map((p) => ({
            date: p.date, // Keep full timestamp: 'YYYY-MM-DD HH:mm:ss'
            price: Number(p.close),
          }))
          .reverse();
      }
      case "1M": {
        const oneMonthOfData = historicalFullPriceData.slice(0, 21); // Approx. 22 trading days in a month
        return oneMonthOfData
          .map((p) => ({ date: p.date, price: Number(p.close) }))
          .reverse();
      }
      case "ytd": {
        const currentYear = historicalFullPriceData.filter((entry) =>
          entry.date.startsWith("2025")
        );
        const yearToDate = currentYear.map((p) => ({
          date: p.date,
          price: Number(p.close),
        }));
        return yearToDate.reverse();
      }
      case "1Y": {
        const oneYear = historicalFullPriceData.slice(0, 251);
        const oneWholeYear = oneYear
          .map((p) => ({
            date: p.date,
            price: Number(p.close),
          }))
          .reverse();
        return oneWholeYear;
      }
      default:
        return [];
    }
  }, [chartTimeframe, historicalChartData, historicalFullPriceData]);

  // calculations for
  const currentPrice = finnhubQuote?.currentPrice;
  const openingPrice = chartData.length > 0 ? chartData[0].price : null;
  const previousClose = finnhubQuote?.previousClosePrice;

  console.log("openingPrice", openingPrice);
  let dollarChange: number | null = null;

  if (currentPrice !== undefined) {
    if (chartTimeframe === "1D" && previousClose !== undefined) {
      dollarChange = currentPrice - previousClose;
    } else if (chartData.length > 0 && chartData[0].price !== null) {
      console.log("chartData[0].price", chartData[0].price);
      dollarChange = currentPrice - Number(chartData[0].price);
    }
  }

  const dollarChangeDisplay =
    dollarChange !== null ? dollarChange.toFixed(2) : null;

  const dollarChangeNumber =
    dollarChangeDisplay !== null ? parseFloat(dollarChangeDisplay) : null;
  type Driver = { feature: string; value: number; pct: number };

  const latestSignal = mlSignals?.[0];

  const driverName = (f: string) => {
    const map: Record<string, string> = {
      vol_30d: "30d Volatility",
      vol_14d: "14d Volatility",
      volume_z_30d: "Volume spike (z-score)",
      drawdown_30d: "30d Drawdown",
      beta_60d: "60d Beta",
      corr_60d: "60d Corr to SPY",
      rsi_14: "RSI (14)",
      log_return_1d: "1d Return",
      log_return_7d: "7d Return",
      log_return_14d: "14d Return",
    };
    return map[f] ?? f;
  };

  const topDrivers: Driver[] = useMemo(() => {
    if (!latestSignal?.driversJson) return [];
    try {
      const obj = JSON.parse(latestSignal.driversJson);
      return (obj?.top_drivers ?? []) as Driver[];
    } catch {
      return [];
    }
  }, [latestSignal]);

  const riskHistory = useMemo(() => {
    if (!mlSignals?.length) return [];
    // repo returns DESC, so reverse for chart
    return [...mlSignals].reverse().map((s) => ({
      date: s.signalDate,
      risk: s.riskScore,
    }));
  }, [mlSignals]);
  if (isLoading)
    return (
      <div className="p-8 text-center text-gray-500">
        Loading Stock Details...
      </div>
    );
  if (hasError)
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load stock data.
      </div>
    );
  const DriverBar = ({ driver }: { driver: MlDriver }) => {
    const isHighRisk = driver.pct > 0.8 || driver.pct < 0.2;

    return (
      <div className="flex flex-col gap-1 py-2 border-b last:border-0 border-gray-100">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-sm font-semibold text-gray-800">
              {driverName(driver.feature)}
            </span>
            <p className="text-[10px] text-gray-400 font-mono">
              {driver.feature}
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold">
              {Number(driver.value).toFixed(2)}
            </span>
            <span
              className={`ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded ${
                isHighRisk
                  ? "bg-orange-100 text-orange-700"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              {(driver.pct * 100).toFixed(0)}th Pct
            </span>
          </div>
        </div>

        {/* Progress Bar representing the percentile */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              isHighRisk ? "bg-orange-500" : "bg-blue-400"
            }`}
            style={{ width: `${driver.pct * 100}%` }}
          />
        </div>
      </div>
    );
  };
  return (
    <div className="space-y-8 bg-white text-black min-h-screen p-8">
      {/* Stock Header */}
      <div className="bg-white rounded-xl shadow-sm border border-black p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{symbol}</h1>
            <p className="text-gray-600">{companyProfile?.companyName}</p>
          </div>
          {finnhubQuote && (
            <div className="text-right">
              <p className="text-2xl font-semibold">
                ${finnhubQuote.currentPrice.toFixed(2)}
              </p>
              {dollarChangeDisplay !== null && dollarChangeNumber !== null && (
                <p
                  className={`text-sm ${
                    dollarChangeNumber >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {dollarChangeNumber >= 0 ? "+" : ""}${dollarChangeDisplay} (
                  {currentChange}%)
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stock Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Price Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-black p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Price History</h2>
            {/* Timeframe selector buttons */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {(["1D", "5D", "1M", "ytd", "1Y"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setChartTimeframe(tf)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    chartTimeframe === tf
                      ? "bg-white shadow"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  interval={Math.ceil(chartData.length / 8)} // leave ~8 labels
                  tickFormatter={(d) => d.slice(5)}
                  angle={-20}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  domain={[
                    (dataMin: number) => Math.floor(dataMin - 2), // lower buffer
                    (dataMax: number) => Math.ceil(dataMax + 2), // upper buffer
                  ]}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toFixed(2)}`}
                />
                <Tooltip
                  formatter={(value: number) =>
                    value === null
                      ? ["N/A", "Price"]
                      : [`$${Number(value).toFixed(2)}`, "Price"]
                  }
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
        {!companyProfileError ? (
          <div className="bg-white rounded-xl shadow-sm border border-black p-6">
            <h2 className="text-xl font-semibold mb-4">Company Information</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Sector</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {companyProfile?.sector}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Industry</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {companyProfile?.industry}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Market Cap
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  $
                  {companyProfile?.marketCap
                    ? `$${
                        companyProfile.marketCap >= 1e12
                          ? (companyProfile.marketCap / 1e12).toFixed(2) + "T"
                          : companyProfile.marketCap >= 1e9
                          ? (companyProfile.marketCap / 1e9).toFixed(2) + "B"
                          : companyProfile.marketCap >= 1e6
                          ? (companyProfile.marketCap / 1e6).toFixed(2) + "M"
                          : companyProfile.marketCap.toLocaleString()
                      }`
                    : "N/A"}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Dividend</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  ${companyProfile?.lastDividend}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Dividend Yield
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {companyProfile?.lastDividend && companyProfile?.price
                    ? (
                        (companyProfile.lastDividend / companyProfile.price) *
                        100
                      ).toFixed(2) + "%"
                    : "N/A"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Volume</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {companyProfile?.averageVolume?.toLocaleString()}
                </dd>
              </div>
            </dl>
            {/* <div className="mt-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {companyProfile?.description}
              </dd>
            </div> */}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Company Information not Available
            </h2>
          </div>
        )}
      </div>
      {/* ML Insights */}
      <div className="bg-white rounded-xl shadow-sm border border-black p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">ML Insights</h2>
          {mlSignalsError && (
            <span className="text-sm text-red-600">Signals unavailable</span>
          )}
        </div>

        {!latestSignal ? (
          <div className="text-gray-500">Loading ML signals...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Summary + Risk history */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-sm text-gray-500">Risk Score</div>
                  <div className="text-3xl font-bold">
                    {latestSignal.riskScore}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-sm text-gray-500">Regime</div>
                  <div className="text-lg font-semibold">
                    {latestSignal.regimeLabel}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-sm text-gray-500">Last Updated</div>
                  <div className="text-lg font-semibold">
                    {latestSignal.signalDate}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="text-sm font-medium mb-2">
                  Risk History (180d)
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={riskHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        interval={Math.ceil(riskHistory.length / 6)}
                        tickFormatter={(d) => d.slice(5)}
                      />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="risk"
                        stroke="#111827"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right: Why panel */}
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="text-lg font-semibold mb-2">
                Why (top drivers)
              </div>

              {topDrivers.length === 0 ? (
                <div className="text-gray-500">No drivers available yet.</div>
              ) : (
                // <ul className="space-y-3">
                //   {topDrivers.slice(0, 3).map((d) => (
                //     <li
                //       key={d.feature}
                //       className="flex items-center justify-between"
                //     >
                //       <div>
                //         <div className="font-medium">
                //           {driverName(d.feature)}
                //         </div>
                //         <div className="text-xs text-gray-500">{d.feature}</div>
                //       </div>
                //       <div className="text-right">
                //         <div className="text-sm font-semibold">
                //           {Number(d.value).toFixed(4)}
                //         </div>
                //         <div className="text-xs text-gray-500">
                //           pct: {(d.pct * 100).toFixed(0)}%
                //         </div>
                //       </div>
                //     </li>
                //   ))}
                // </ul>
                <div className="space-y-4">
                  {topDrivers.slice(0, 5).map((driver) => (
                    <DriverBar key={driver.feature} driver={driver} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* News */}
      <div className="bg-white rounded-xl shadow-sm border border-black p-6">
        <h2 className="text-xl font-semibold mb-4">Latest News</h2>
        <div className="space-y-4">
          {companyNews?.map((item) => (
            <article key={item.id} className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {item.headline}
              </h3>
              <p className="text-gray-600 mb-2">{item.summary}</p>
              <div className="flex items-center justify-between">
                <time className="text-sm text-gray-500">
                  {new Date(item.datetime * 1000).toLocaleDateString()}
                </time>
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
  );
}
