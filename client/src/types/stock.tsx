export interface HistoricalChart {
    open: string;
    low: string;
    high: string;
    close: string;
    volume: string;

          // --- New fields from historical-price-full ---
    adjClose: string;
    unadjustedVolume: string;
    change: string;
    changePercent: string;
    vwap: string;
    label: string;
    changeOverTime: string;
}


export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  exchange: string;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement: string;
  sharesOutstanding: number;
  timestamp: number;
}

export interface FinnhubQuote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
}

// This is the clean, mapped type your components will use
export interface MappedFinnhubQuote {
  currentPrice: number;
  change: number;
  percentChange: number;
  highPriceOfDay: number;
  lowPriceOfDay: number;
  openPriceOfDay: number;
  previousClosePrice: number;
}

export interface MarketLeader {
    symbol: string;
    price: number;
    name: string;
    change: number;
    changesPercentage: number;
    exchange: string;
}
