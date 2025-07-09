export interface HistoricalChart {
    date: string,
    open: number;
    low: number;
    high: number;
    close: number;
    volume: number;

          // --- New fields from historical-price-full ---
    adjClose: number;
    unadjustedVolume: number;
    change: number;
    changePercent: number;
    vwap: string;
    label: string;
    changeOverTime: number;
}

export interface HistoricalChartApiResponse {
  symbol: string;
  historical: HistoricalChart[];
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

export interface UniversalStockList {
  currency: string;
  description: string;
  displaySymbol: string;
  figi: string;
  isin: string | null;
  mic: string;
  symbol: string;
  type: string;
}

export interface CompanyProfile {
    symbol: string;
    price: number;
    beta: number;
    volAvg: number;
    mktCap: number;
    lasDiv: number;
    range: string;
    changes: number;
    companyName: string;
    currency: string;
    cik: string;
    isin: string;
    cusip: string;
    exchange: string;
    exchangeShortName: string;
    industry: string;
    website: string;
    description: string;
    ceo: string;
    sector: string;
    country: string;
    fullTimeEmployees: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    dcfDiff: number;
    dcf: number;
    image: string;
    ipoDate: string;
    defaultImage: string;
    isEtf: string;
    isActivelyTrading: string;
    isAdr: string;
    isFund: string;
}

export interface Screener {
    symbol: string;
    companyName: string; 
    marketCap: number;
    sector: string;
    industry: string;
    beta: number;
    price: number;
    volume: number;
    exchange: string;
    exchangeShortName: string;
    country: string;
    isEtf: boolean;
    isFund: boolean;
    isActivelyTrading: boolean;
}

export interface sectors {
    sector: string;
    changesPercentage: string;
}

export interface News {
    category: string;
    datetime: number;
    headline: string;
    id: number;
    image?: string;
    related: string;
    source: string;
    summary: string;
    url: string;
}

export interface PriceChange {
  symbol: string;
  "1D": number;
  "5D": number;
  "1M": number;
  "3M": number;
  "6M": number;
  ytd: number;
  "1Y": number;
  "3Y": number;
  "5Y": number;
  "10Y": number;
  max: number;
}