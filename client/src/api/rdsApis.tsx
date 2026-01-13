import { HistoricalChart, MlSignal } from "@/types/stock";

const API_BASE_URL = process.env.NEXT_PUBLIC_ML_API_BASE_URL;

export async function fetchMlSignals(symbol: string, limit: number = 180): Promise<MlSignal[]> {
  const url = `${API_BASE_URL}/signals/${symbol.toUpperCase()}?limit=${limit}`;
  
  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Spring Boot returns an array, so we cast it here
    return data as MlSignal[];
  } catch (error) {
    console.error(`API call to ${url} failed:`, error);
    console.error(`Failed to fetch ML signals for ${symbol}:`, error);
    throw error;
  }
}


async function fetchRDS<T>(endpoint: string): Promise<T> {
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


export const getHistoricalFullPriceChart = (symbol: string): Promise<HistoricalChart[]> => {
  // Assuming you have an endpoint like this for testing caching
  const stock = fetchRDS<HistoricalChart[]>(`/historical-price-full/${symbol}`);
  console.log(stock)
  return stock
};