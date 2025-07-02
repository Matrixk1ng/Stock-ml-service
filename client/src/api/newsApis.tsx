import { News } from "@/types/stock";

const API_BASE_URL = process.env.NEXT_PUBLIC_News_API_BASE_URL;

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

export const getCompanyNews = (symbol: string): Promise<News[]> => {
  return fetchAPI<News[]>(`/company-news/${symbol}`)
}

export const getGeneralNews = (): Promise<News[]> => {
  return fetchAPI<News[]>("/general-news")
}