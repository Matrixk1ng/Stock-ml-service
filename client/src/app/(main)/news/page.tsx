'use client'

import {  getGeneralNews } from '@/api/newsApis'
import { News } from '@/types/stock'
import useSWR from 'swr'
import Image from 'next/image'



const generalNewsFetcher = () => getGeneralNews()


export default function NewsPage() {
  

  const { data: generalNews} = useSWR<News[]>(
    'general-news',
    generalNewsFetcher,
    {revalidateOnFocus: false}
  )

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Financial News</h1>
      
      <div className="grid gap-6">
        {generalNews?.map((item) => (
          <article
            key={item.id}
            className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            {/* 1. Image column */}
            {item.image && (
              <div className="flex-shrink-0 w-32 h-20 relative mr-4">
                <Image
                  src={item.image}
                  alt={item.headline}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
            )}

            {/* 2. Text content */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {item.headline}
              </h2>
              <p className="text-gray-600 mb-4">{item.summary}</p>
              <div className="flex items-center text-sm text-gray-500">
                <span>{item.source}</span>
                <span className="mx-2">•</span>
                <time>{new Date(item.datetime * 1000).toLocaleDateString()}</time>
              </div>
            </div>

            {/* 3. Read more link */}
            <div className="flex items-start">
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