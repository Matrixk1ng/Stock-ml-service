"use client";

import Card from "@/components/Card";
import { getFinnhubQuote, getMarketLeaders } from "@/api/stockApis";
import { MappedFinnhubQuote, MarketLeader } from "@/types/stock";
import useSWR from "swr";
import LeaderRow from "@/components/LeaderRow";
import useAuth from "@/hooks/useAuth";

const fetcher = (symbol: string) => getFinnhubQuote(symbol);
function StockRow({ symbol, name }: { symbol: string; name: string }) {
  const FIFTEEN_MINUTES = 15 * 60 * 1000;
  const {
    data: quote,
    error,
    isLoading,
  } = useSWR<MappedFinnhubQuote>(
    symbol, // The key for this request. SWR automatically de-duplicates requests with the same key.
    fetcher, // The function to call to get the data.
    {
      // --- This is the magic part ---
      refreshInterval: FIFTEEN_MINUTES,
      // Optional: Keep the previous data visible while re-fetching
      revalidateOnFocus: true, // Keep this TRUE for a good UX on dashboards
      revalidateOnReconnect: true, // Keep this TRUE for resilience

      // Set a deduping interval to prevent rapid-fire requests
      dedupingInterval: 2000, // Don't revalidate more than once every 2 seconds

      keepPreviousData: true,
    }
  );
  //.toFixed(2)
  if (error) return <div>Failed to load {symbol}</div>;
  if (isLoading) return <div>Loading {symbol}...</div>;
  if (!quote) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px",
      }}
    >
      <span>
        {name} ({symbol})
      </span>
      <span style={{ fontWeight: "bold" }}>
        ${quote.currentPrice.toFixed(2)}
      </span>
      <span style={{ color: quote.change >= 0 ? "green" : "red" }}>
        {quote.change} ({quote.percentChange.toFixed(2)}%)
      </span>
    </div>
  );
}

// Mock data for indices
const marketSummaryList = [
  { symbol: "SPY", name: "S&P 500" },
  { symbol: "QQQ", name: "Nasdaq 100" }, // QQQ tracks the 100 largest companies in the Nasdaq
  { symbol: "DIA", name: "Dow Jones" },
];
// Mock data for top movers

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const marketLeaderFetcher = ([_key, leaderType]: [string, string]): Promise<
  MarketLeader[]
> => {
  return getMarketLeaders(leaderType);
};
export default function Dashboard() {
  const { user } = useAuth();

  const { data: gainers, error: gainersError } = useSWR<MarketLeader[]>( // <-- Use the array type here
    ["market-leaders", "gainers"], // The key is an array
    marketLeaderFetcher, // The fetcher uses the key
    { refreshInterval: 30 * 60 * 1000 }
  );

  const { data: losers, error: losersError } = useSWR<MarketLeader[]>( // <-- Use the array type here
    ["market-leaders", "losers"], // The key is an array
    marketLeaderFetcher, // The fetcher uses the key
    { refreshInterval: 30 * 60 * 1000 }
  );

  const { data: actives, error: activesError } = useSWR<MarketLeader[]>( // <-- Use the array type here
    ["market-leaders", "actives"], // The key is an array
    marketLeaderFetcher, // The fetcher uses the key
    { refreshInterval: 30 * 60 * 1000 }
  );

  return (
    <div className="min-h-screen bg-white p-8 text-black">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Dashboard {user?.name}
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="Market Summary" borderClass="border-black rounded-xl">
          <div className="grid grid-cols-1 gap-4">
            {marketSummaryList.map((item) => (
              <StockRow
                key={item.symbol}
                symbol={item.symbol}
                name={item.name}
              />
            ))}
          </div>
        </Card>
        <Card title="Top Gainers" borderClass="border-black rounded-xl">
          <div className="divide-y divide-gray-200">
            {/* Display a loading or error state */}
            {gainersError && <div>Failed to load Top Gainers.</div>}
            {!gainers && !gainersError && <div>Loading Top Gainers...</div>}

            {/* Map over the fetched 'gainers' data */}
            {gainers?.slice(0, 3).map((stock) => (
              <LeaderRow
                key={stock.symbol}
                stock={stock}
                isGainer={true}
                isActive={false}
              />
            ))}
          </div>
        </Card>
        <Card title="Top Losers" borderClass="border-black rounded-xl">
          <div className="divide-y divide-gray-200">
            {/* Display a loading or error state */}
            {losersError && <div>Failed to load losers.</div>}
            {!losers && !losersError && <div>Loading losers...</div>}

            {/* Map over the fetched 'losers' data */}
            {losers?.slice(0, 3).map((stock) => (
              <LeaderRow
                key={stock.symbol}
                stock={stock}
                isGainer={false}
                isActive={false}
              />
            ))}
          </div>
        </Card>
        <Card title="Most Active" borderClass="border-black rounded-xl">
          <div className="divide-y divide-gray-200">
            {/* Display a loading or error state */}
            {activesError && <div>Failed to load Top Active Stocks.</div>}
            {!actives && !activesError && (
              <div>Loading Top Active Stocks...</div>
            )}

            {/* Map over the fetched 'losers' data */}
            {actives?.slice(0, 3).map((stock) => (
              <LeaderRow
                key={stock.symbol}
                stock={stock}
                isGainer={false}
                isActive={true}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
