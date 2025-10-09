"use client";

import { useEffect, useState } from "react";

type NewsItem = {
  id: string;
  category: "World" | "Sports" | "Financial";
  headline: string;
  source: string;
};

const newsItems: NewsItem[] = [
  { id: "1", category: "Financial", headline: "S&P 500 reaches new high as tech stocks rally", source: "Bloomberg" },
  { id: "2", category: "World", headline: "Global climate summit reaches historic agreement", source: "Reuters" },
  { id: "3", category: "Sports", headline: "Warriors clinch playoff spot with overtime victory", source: "ESPN" },
  { id: "4", category: "Financial", headline: "Fed signals potential rate cuts in Q2 2025", source: "WSJ" },
  { id: "5", category: "World", headline: "New trade agreement signed between major economies", source: "AP" },
  { id: "6", category: "Sports", headline: "Manchester United secures Champions League berth", source: "Sky Sports" },
  { id: "7", category: "Financial", headline: "Tesla announces record quarterly deliveries", source: "CNBC" },
  { id: "8", category: "World", headline: "Breakthrough in renewable energy technology announced", source: "BBC" },
];

export default function NewsTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<"All" | "World" | "Sports" | "Financial">("All");

  const filteredNews = filter === "All"
    ? newsItems
    : newsItems.filter(item => item.category === filter);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredNews.length);
    }, 5000); // Change news every 5 seconds

    return () => clearInterval(interval);
  }, [filteredNews.length]);

  const currentNews = filteredNews[currentIndex];

  const getCategoryColor = (category: string) => {
    switch (category) {
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

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-black">News Ticker</div>
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

      <div className="min-h-[60px] flex flex-col justify-center">
        <div className="flex items-start gap-2">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${getCategoryColor(currentNews.category)}`}>
            {currentNews.category}
          </span>
          <div className="flex-1">
            <div className="text-[13px] text-black leading-relaxed">{currentNews.headline}</div>
            <div className="text-[10px] text-gray-500 mt-1">{currentNews.source}</div>
          </div>
        </div>
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
