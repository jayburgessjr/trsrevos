"use client";

import { useEffect, useState } from "react";

type NewsItem = {
  id: string;
  type: "World" | "Sports" | "Financial";
  title: string;
  source: string;
  time: string;
  url?: string;
};

// Fallback news items in case API fails
const fallbackNewsItems: NewsItem[] = [
  { id: "1", type: "Financial", title: "Fed Signals Rate Cuts Could Begin in Q2 2025", source: "Bloomberg", time: "2h ago" },
  { id: "2", type: "World", title: "G20 Summit Focuses on Climate and Trade Agreements", source: "Reuters", time: "3h ago" },
  { id: "3", type: "Sports", title: "NBA Finals: Lakers Lead Series 3-2", source: "ESPN", time: "4h ago" },
  { id: "4", type: "Financial", title: "Tech Stocks Rally on Strong Q1 Earnings Reports", source: "CNBC", time: "5h ago" },
  { id: "5", type: "World", title: "UN Announces New Global Health Initiative", source: "BBC", time: "6h ago" },
  { id: "6", type: "Sports", title: "Wimbledon: Defending Champion Advances to Semifinals", source: "Sky Sports", time: "7h ago" },
  { id: "7", type: "Financial", title: "Oil Prices Drop 3% on OPEC Production News", source: "Financial Times", time: "8h ago" },
  { id: "8", type: "World", title: "EU Parliament Passes New Digital Privacy Laws", source: "Associated Press", time: "9h ago" },
  { id: "9", type: "Sports", title: "Olympic Committee Announces 2028 Los Angeles Updates", source: "Olympics.com", time: "10h ago" },
  { id: "10", type: "Financial", title: "Bitcoin Surges Past $65K on Institutional Investment", source: "CoinDesk", time: "11h ago" },
];

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const publishedDate = new Date(dateString);
  const diffMs = now.getTime() - publishedDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function NewsFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<"All" | "World" | "Sports" | "Financial">("All");
  const [newsItems, setNewsItems] = useState<NewsItem[]>(fallbackNewsItems);
  const [loading, setLoading] = useState(true);

  // Fetch live news from NewsAPI
  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Using NewsAPI's top headlines endpoint for US news
        // You can get a free API key at https://newsapi.org/
        const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY || 'demo'; // Use 'demo' for testing

        const categories = [
          { category: 'business', type: 'Financial' as const },
          { category: 'general', type: 'World' as const },
          { category: 'sports', type: 'Sports' as const }
        ];

        const allNews: NewsItem[] = [];

        for (const { category, type } of categories) {
          const response = await fetch(
            `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=5&apiKey=${apiKey}`
          );

          if (response.ok) {
            const data = await response.json();
            const articles = data.articles?.map((article: any, index: number) => ({
              id: `${category}-${index}`,
              type,
              title: article.title || 'No title available',
              source: article.source?.name || 'Unknown',
              time: article.publishedAt ? getTimeAgo(article.publishedAt) : 'Recently',
              url: article.url
            })) || [];

            allNews.push(...articles);
          }
        }

        if (allNews.length > 0) {
          setNewsItems(allNews);
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
        // Keep using fallback news items
      } finally {
        setLoading(false);
      }
    };

    fetchNews();

    // Refresh news every 15 minutes
    const refreshInterval = setInterval(fetchNews, 15 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, []);

  const filteredNews = filter === "All"
    ? newsItems
    : newsItems.filter(item => item.type === filter);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredNews.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [filteredNews.length]);

  const currentNews = filteredNews[currentIndex];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "World":
        return "bg-blue-100 text-blue-700";
      case "Sports":
        return "bg-green-100 text-green-700";
      case "Financial":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "World":
        return "🌍";
      case "Sports":
        return "⚽";
      case "Financial":
        return "💰";
      default:
        return "•";
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-black">News Feed</div>
        <div className="flex gap-1">
          {["All", "World", "Sports", "Financial"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setFilter(cat as typeof filter);
                setCurrentIndex(0);
              }}
              className={`text-[10px] px-2 py-0.5 rounded-md transition-colors ${
                filter === cat
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[70px] flex flex-col justify-center">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="text-[12px] text-gray-500">Loading latest news...</div>
          </div>
        ) : (
          <a
            href={currentNews.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 hover:opacity-80 transition-opacity"
          >
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${getTypeColor(currentNews.type)}`}>
              <span>{getTypeIcon(currentNews.type)}</span>
              <span>{currentNews.type}</span>
            </span>
            <div className="flex-1">
              <div className="text-[13px] text-black leading-relaxed font-medium">{currentNews.title}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-gray-600">{currentNews.source}</span>
                <span className="text-[10px] text-gray-400">•</span>
                <span className="text-[10px] text-gray-500">{currentNews.time}</span>
                {currentNews.url && (
                  <>
                    <span className="text-[10px] text-gray-400">•</span>
                    <span className="text-[10px] text-blue-600">Read more →</span>
                  </>
                )}
              </div>
            </div>
          </a>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <div className="flex gap-1">
          {filteredNews.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 rounded-full transition-all ${
                index === currentIndex ? "w-4 bg-black" : "w-1 bg-gray-300"
              }`}
              aria-label={`Go to news item ${index + 1}`}
            />
          ))}
        </div>
        <div className="text-[10px] text-gray-500">
          {currentIndex + 1} / {filteredNews.length}
        </div>
      </div>
    </div>
  );
}
