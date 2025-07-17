'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getAllUsSymbols } from '@/api/stockApis';
import { UniversalStockList } from '@/types/stock';
import { useDebounce } from "use-debounce";

// The fetcher for our SWR hook
const symbolsFetcher = () => getAllUsSymbols();

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isActive, setIsActive] = useState(false);

  const [debouncedValue] = useDebounce(searchTerm, 300);

  // Fetch all symbols once and cache globally with SWR
  const { data: allStocks, error } = useSWR<UniversalStockList[]>(
    'all-us-symbols', // Unique key for the global cache
    symbolsFetcher,
    {
      revalidateOnFocus: false, // No need to re-fetch this list on focus
      revalidateOnReconnect: false,
    }
  );

  // Filter the list based on the search term.
  // useMemo prevents re-filtering on every render, only when searchTerm or allStocks changes.
  const filteredStocks = useMemo(() => {
    if (!debouncedValue || !allStocks) {
      return [];
    }
    const term = debouncedValue.toLowerCase();
    return allStocks
      .filter(
        (stock) =>
          stock.symbol.toLowerCase().startsWith(term) ||
          stock.description.toLowerCase().includes(term)
      )
  }, [debouncedValue, allStocks]);

  if (error) {
    console.error("Failed to load stock list for search.");
    // Render a disabled input or nothing if the master list fails to load
    return <div></div>;
  }

  return (
    <div className="relative w-full max-w-xs">
      <div className="relative">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsActive(true)}
          onBlur={() => setTimeout(() => setIsActive(false), 150)} // Delay hiding to allow click
          className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* --- Autocomplete Dropdown --- */}
      {isActive && searchTerm && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
          {!allStocks && <div className="p-2 text-gray-500">Loading stock list...</div>}
          <ul className="max-h-80 overflow-y-auto">
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock) => (
                <li key={stock.symbol}>
                  <Link 
                    href={`/stock/${stock.symbol}`}
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    <div className="font-bold">{stock.symbol}</div>
                    <div className="text-sm text-gray-600 truncate">{stock.description}</div>
                  </Link>
                </li>
              ))
            ) : (
              debouncedValue && <li className="p-2 text-gray-500">No results found.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}