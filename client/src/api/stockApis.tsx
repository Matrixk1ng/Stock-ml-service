import { StockQuote, HistoricalChart,FinnhubQuote, MappedFinnhubQuote, MarketLeader, UniversalStockList, HistoricalChartApiResponse, CompanyProfile, Screener, sectors, PriceChange} from "@/types/stock"; // Adjust path as needed

// Get the base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_STOCK_API_BASE_URL;

// A generic fetch handler for robustness
async function fetchAPI<T>(endpoint: string): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url);
    if (!response.ok || response == null) {
      // Handle HTTP errors like 404 or 500
      const errorData = await response.json().catch(() => ({})); // Try to parse error response
      const errorMessage = errorData?.message || `Error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }
    const data = await response.json();
    
    // 2. Now you can log the actual data
    console.log("JSON Data for:", url, data);

    // 3. Return the data you've already parsed
    return data as T;
  } catch (error) {
    console.error(`API call to ${url} failed:`, error);
    // Re-throw to let the calling component handle the UI state
    throw error;
  }
}


export const getSectorPerformance = (): Promise<sectors[]> => {
  return fetchAPI<sectors[]>("/sectors-performance")
}

export const getPriceChange = (symbol: string): Promise<PriceChange> => {
  return fetchAPI<PriceChange>(`/stock-price-change/${symbol}`)
}


export const getStockScreener = (): Promise<Screener[]> => {
  return fetchAPI<Screener[]>("/stock-screener")
}

export const getCompanyProfile = (symbol: string): Promise<CompanyProfile> => {
  return fetchAPI<CompanyProfile>(`/company-profile/${symbol}`)
}

/**
 * Fetches a stock quote from the FMP service.
 * Corresponds to: GET /api/stock/quote/{symbol}
 * @param {string} symbol - The stock ticker symbol.
 * @returns {Promise<StockQuote>} A promise that resolves to the stock quote object.
 */
export const getStockQuote = (symbol: string): Promise<StockQuote> => {
  // Assuming you have an endpoint like this for testing caching
  return fetchAPI<StockQuote>(`/quote/${symbol}`);
};

export const getFinnhubQuote = async (symbol: string): Promise<MappedFinnhubQuote> => {
  const rawQuote = await fetchAPI<FinnhubQuote>(`/finnhub/quote/${symbol}`);
  
  // --- This is the new mapping logic ---
  // Transform the raw API response into the shape our components expect.
  return {
    currentPrice: rawQuote.c,
    change: rawQuote.d,
    percentChange: rawQuote.dp,
    highPriceOfDay: rawQuote.h,
    lowPriceOfDay: rawQuote.l,
    openPriceOfDay: rawQuote.o,
    previousClosePrice: rawQuote.pc,
  };
};

export const getAllUsSymbols = (): Promise<UniversalStockList[]> => {
  const stocks = fetchAPI<UniversalStockList[]>("/all-us-symbols");
  console.log(stocks)
  return stocks
};


export const getHistoricalChart = (symbol: string): Promise<HistoricalChart[]> => {
  // Assuming you have an endpoint like this for testing caching
  const stock = fetchAPI<HistoricalChart[]>(`/historical-chart/${symbol}`);
  console.log(stock)
  return stock
};

export const getHistoricalFullPriceChart = (symbol: string): Promise<HistoricalChartApiResponse> => {
  // Assuming you have an endpoint like this for testing caching
  const stock = fetchAPI<HistoricalChartApiResponse>(`/historical-price-full/${symbol}`);
  console.log(stock)
  return stock
};

// CORRECT: Promises an ARRAY of MarketLeader objects
export const getMarketLeaders = (leaderType: string): Promise<MarketLeader[]> => {
  return fetchAPI<MarketLeader[]>(`/market-leaders/${leaderType}`)
}



// /**
//  * Fetches historical daily chart data for a stock.
//  * Corresponds to: GET /api/stock/historical-price-full/{symbol}
//  * @param {string} symbol - The stock ticker symbol.
//  * @returns {Promise<any>} A promise resolving to historical data. Replace 'any' with a proper type.
//  */
// export const getHistoricalFullChart = (symbol: string): Promise<any> => {
//   return fetchAPI<any>(`/historical-price-full/${symbol}`);
// };