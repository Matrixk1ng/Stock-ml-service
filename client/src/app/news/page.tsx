'use client'

import { useQuery } from '@tanstack/react-query'

// Mock news data
const mockNews = [
  {
    id: 1,
    title: 'Federal Reserve Signals Potential Rate Cuts in 2024',
    summary: 'The Federal Reserve has indicated it may begin cutting interest rates in 2024 as inflation shows signs of cooling.',
    source: 'Financial Times',
    date: '2024-01-15',
    url: '#',
  },
  {
    id: 2,
    title: 'Tech Stocks Rally as AI Boom Continues',
    summary: 'Major technology companies see significant gains as artificial intelligence investments drive market optimism.',
    source: 'Bloomberg',
    date: '2024-01-14',
    url: '#',
  },
  {
    id: 3,
    title: 'Oil Prices Stabilize After Middle East Tensions',
    summary: 'Crude oil prices have stabilized following recent geopolitical tensions in the Middle East.',
    source: 'Reuters',
    date: '2024-01-13',
    url: '#',
  },
]

export default function NewsPage() {
  const { data: news = mockNews } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      // Replace with actual API call
      return mockNews
    },
  })

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Financial News</h1>
      
      <div className="grid gap-6">
        {news.map((item) => (
          <article
            key={item.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.title}
                </h2>
                <p className="text-gray-600 mb-4">{item.summary}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{item.source}</span>
                  <span className="mx-2">•</span>
                  <time>{item.date}</time>
                </div>
              </div>
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
  )
} 