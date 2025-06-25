import { MarketLeader } from "@/types/stock";

interface LeaderRowProps {
  stock: MarketLeader; // Use your actual API data type
  isGainer: boolean;
  isActive: boolean;
}

export default function LeaderRow({
  stock,
  isGainer,
  isActive,
}: LeaderRowProps) {
  const price = Number(stock.price);
  const change = Number(stock.change);
  const changesPercentage = Number(stock.changesPercentage);
  return (
    <div className="py-3 flex items-center justify-between">
      <div>
        <div className="font-medium">{stock.symbol}</div>
        <div className="text-gray-500 text-sm">{stock.name}</div>
      </div>
      <div className="text-right">
        {/* Format the price number */}
        <div className="font-semibold">${price.toFixed(2)}</div>
        {/* if active i do not use the normal isGainer*/}
        {isActive ? (
          <div
            className={
              changesPercentage > 0 ? "text-green-600 text-sm" : "text-red-600 text-sm"
            }
          >
            {/* Format the change and percentage numbers */}
            {change.toFixed(2)} ({changesPercentage.toFixed(2)}%)
          </div>
        ) : (
          <div
            className={
              isGainer ? "text-green-600 text-sm" : "text-red-600 text-sm"
            }
          >
            {/* Format the change and percentage numbers */}
            {change.toFixed(2)} ({changesPercentage.toFixed(2)}%)
          </div>
        )}
      </div>
    </div>
  );
}
