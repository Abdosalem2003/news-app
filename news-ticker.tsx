import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Flame, TrendingUp } from "lucide-react";
import type { Article } from "@shared/types";
import { useState, useEffect } from "react";

export function NewsTicker() {
  const { language, dir } = useI18n();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Fetch breaking news with optimized settings
  const { data: articles, isLoading, error } = useQuery<Article[]>({
    queryKey: ["/api/articles/breaking"],
    refetchInterval: 60000,
    staleTime: 50000,
    gcTime: 300000,
    retry: 2,
    retryDelay: 1000,
  });

  // Remove duplicates
  const uniqueArticles = articles ? articles.filter(
    (article, index, self) => index === self.findIndex((a) => a.id === article.id)
  ) : [];

  // Auto-rotate news every 3 seconds
  useEffect(() => {
    if (uniqueArticles.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % uniqueArticles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [uniqueArticles.length]);

  // Early returns after all hooks
  if (isLoading) return null;
  if (error) {
    console.error("❌ [NEWS TICKER] Error:", error);
    return null;
  }
  if (!articles || articles.length === 0) return null;

  const currentArticle = uniqueArticles[currentIndex];
  const nextArticle = uniqueArticles[(currentIndex + 1) % uniqueArticles.length];

  return (
    <div className="relative bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white shadow-lg border-b-2 border-red-700 overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center h-14">
          {/* Breaking News Badge */}
          <div className="flex-shrink-0 px-4 sm:px-6 h-full flex items-center bg-red-700 border-r-2 border-red-800">
            <div className="flex flex-col items-center gap-1">
              <Flame className="h-5 w-5 text-yellow-300 animate-pulse" />
              <span className="font-bold text-[10px] uppercase tracking-wider">
                {language === "ar" ? "عاجل" : "Live"}
              </span>
            </div>
          </div>

          {/* Vertical Scrolling News */}
          <div className="flex-1 h-full overflow-hidden px-4 sm:px-6 relative">
            <style>{`
              @keyframes slide-up {
                0% {
                  transform: translateY(100%);
                  opacity: 0;
                }
                10% {
                  transform: translateY(0);
                  opacity: 1;
                }
                90% {
                  transform: translateY(0);
                  opacity: 1;
                }
                100% {
                  transform: translateY(-100%);
                  opacity: 0;
                }
              }
              .news-slide {
                animation: slide-up 3s ease-in-out infinite;
              }
            `}</style>
            
            <div className="h-full flex items-center relative">
              <div className="w-full">
                <Link href={`/article/${currentArticle.slug}`}>
                  <div className="flex items-center gap-3 group" dir={dir}>
                    <TrendingUp className="h-4 w-4 text-yellow-300 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-sm sm:text-base font-semibold truncate hover:text-yellow-200 transition-colors duration-200 cursor-pointer">
                      {language === "ar" ? currentArticle.titleAr : currentArticle.titleEn}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* News Counter & Live Indicator */}
          <div className="flex-shrink-0 px-3 sm:px-4 h-full flex items-center bg-red-700 border-l-2 border-red-800">
            <div className="flex flex-col items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-300"></span>
              </span>
              <span className="text-[10px] font-bold">
                {currentIndex + 1}/{uniqueArticles.length}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-800">
        <div 
          className="h-full bg-yellow-300 transition-all duration-[3000ms] ease-linear"
          style={{ width: '100%' }}
          key={currentIndex}
        />
      </div>
    </div>
  );
}
