"use client";

import { useEffect, useState } from "react";

type ContentItem = {
  id: string;
  type: "YouTube" | "Podcast" | "Article" | "Course";
  title: string;
  author: string;
  topic: string;
  duration?: string;
};

const contentItems: ContentItem[] = [
  { id: "1", type: "YouTube", title: "The Revenue Architecture Framework: Building Predictable Growth Systems", author: "SaaStr", topic: "Revenue Ops", duration: "24 min" },
  { id: "2", type: "Podcast", title: "How to Build a $100M ARR Sales Machine", author: "Revenue Vitals", topic: "Sales Strategy", duration: "42 min" },
  { id: "3", type: "Article", title: "Pricing Psychology: Why Your SaaS Should Cost More", author: "Patrick Campbell", topic: "Pricing", duration: "8 min read" },
  { id: "4", type: "YouTube", title: "AI-Powered Sales Forecasting: Practical Implementation Guide", author: "Pavilion", topic: "Forecasting", duration: "18 min" },
  { id: "5", type: "Podcast", title: "From $0 to $50M: Lessons in Capital Efficiency", author: "Lenny's Podcast", topic: "Growth", duration: "55 min" },
  { id: "6", type: "Course", title: "Mastering Pipeline Management & Deal Velocity", author: "Sales Hacker", topic: "Pipeline", duration: "2 hrs" },
  { id: "7", type: "Article", title: "The Compounding Growth Playbook: How Top Companies Scale", author: "Elena Verna", topic: "Growth", duration: "12 min read" },
  { id: "8", type: "YouTube", title: "Building High-Performance Revenue Teams in 2025", author: "Winning by Design", topic: "Team Building", duration: "31 min" },
  { id: "9", type: "Podcast", title: "Customer Success Metrics That Actually Drive Revenue", author: "The CS Insider", topic: "CS Strategy", duration: "38 min" },
  { id: "10", type: "Article", title: "Win Rate Optimization: Data-Driven Strategies to Close More Deals", author: "Gong Labs", topic: "Sales", duration: "10 min read" },
];

export default function NewsTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<"All" | "YouTube" | "Podcast" | "Article" | "Course">("All");

  const filteredContent = filter === "All"
    ? contentItems
    : contentItems.filter(item => item.type === filter);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredContent.length);
    }, 6000); // Change content every 6 seconds

    return () => clearInterval(interval);
  }, [filteredContent.length]);

  const currentContent = filteredContent[currentIndex];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "YouTube":
        return "bg-red-100 text-red-700";
      case "Podcast":
        return "bg-purple-100 text-purple-700";
      case "Article":
        return "bg-blue-100 text-blue-700";
      case "Course":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "YouTube":
        return "▶";
      case "Podcast":
        return "🎙";
      case "Article":
        return "📄";
      case "Course":
        return "🎓";
      default:
        return "•";
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-black">Learning Feed</div>
        <div className="flex gap-1">
          {["All", "YouTube", "Podcast", "Article", "Course"].map((cat) => (
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
        <div className="flex items-start gap-2">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${getTypeColor(currentContent.type)}`}>
            <span>{getTypeIcon(currentContent.type)}</span>
            <span>{currentContent.type}</span>
          </span>
          <div className="flex-1">
            <div className="text-[13px] text-black leading-relaxed font-medium">{currentContent.title}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-gray-600">{currentContent.author}</span>
              <span className="text-[10px] text-gray-400">•</span>
              <span className="text-[10px] text-gray-500">{currentContent.topic}</span>
              {currentContent.duration && (
                <>
                  <span className="text-[10px] text-gray-400">•</span>
                  <span className="text-[10px] text-gray-500">{currentContent.duration}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        <div className="flex gap-1">
          {filteredContent.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 rounded-full transition-all ${
                index === currentIndex ? "w-4 bg-black" : "w-1 bg-gray-300"
              }`}
              aria-label={`Go to content item ${index + 1}`}
            />
          ))}
        </div>
        <div className="text-[10px] text-gray-500">
          {currentIndex + 1} / {filteredContent.length}
        </div>
      </div>
    </div>
  );
}
