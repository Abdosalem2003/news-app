import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import type { ArticleWithRelations, Category } from "@shared/types";
import { Skeleton } from "@/components/ui/skeleton";

interface DynamicCategorySectionProps {
  category: Category;
  index: number;
}

export function DynamicCategorySection({ category, index }: DynamicCategorySectionProps) {
  const { language } = useI18n();

  // جلب آخر 10 مقالات من هذا القسم
  const { data: articles, isLoading } = useQuery<ArticleWithRelations[]>({
    queryKey: [`/api/articles/category/${category.slug}`],
  });

  // إذا لم يكن هناك مقالات، لا تعرض القسم
  if (!isLoading && (!articles || articles.length === 0)) {
    return null;
  }

  const categoryName = language === "ar" ? category.nameAr : category.nameEn;
  const displayArticles = articles?.slice(0, 10) || [];

  // ألوان متدرجة بثيم Samsung
  const gradients = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-orange-500 to-red-500",
    "from-green-500 to-emerald-500",
    "from-indigo-500 to-blue-500",
    "from-rose-500 to-pink-500",
  ];
  const gradient = gradients[index % gradients.length];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="mb-12"
    >
      {/* Header احترافي بثيم Samsung */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${gradient} p-6 mb-6 shadow-lg`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                {categoryName}
              </h2>
              <p className="text-white/80 text-sm mt-1">
                {language === "ar" ? "آخر الأخبار" : "Latest News"}
              </p>
            </div>
          </div>
          <Link href={`/category/${category.slug}`}>
            <Button
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm rounded-xl"
            >
              {language === "ar" ? "عرض الكل" : "View All"}
              {language === "ar" ? (
                <ChevronLeft className="h-4 w-4 mr-2" />
              ) : (
                <ChevronRight className="h-4 w-4 ml-2" />
              )}
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid احترافي للمقالات */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {displayArticles.map((article, idx) => (
            <Link key={article.id} href={`/article/${article.slug}`}>
              <Card className="group relative overflow-hidden h-full hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
                {/* صورة المقال */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.coverImage || "/placeholder.svg"}
                    alt={(language === "ar" ? article.titleAr : article.titleEn) || "Article"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Date Badge - Red Box with White Text */}
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-1.5 backdrop-blur-sm">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="font-bold text-xs">
                        {(() => {
                          try {
                            const dateStr = article.publishedAt || article.createdAt;
                            
                            if (!dateStr) {
                              return language === "ar" ? "تاريخ غير محدد" : "No Date";
                            }
                            
                            let date;
                            if (typeof dateStr === 'string') {
                              date = new Date(dateStr);
                            } else if (dateStr instanceof Date) {
                              date = dateStr;
                            } else if (typeof dateStr === 'number') {
                              date = new Date(dateStr);
                            } else {
                              date = new Date(dateStr);
                            }
                            
                            if (isNaN(date.getTime())) {
                              return language === "ar" ? "تاريخ غير صحيح" : "Invalid Date";
                            }
                            
                            return date.toLocaleDateString(
                              language === "ar" ? "ar-EG" : "en-US",
                              { 
                                month: 'short', 
                                day: 'numeric',
                                calendar: 'gregory'
                              }
                            );
                          } catch (error) {
                            return language === "ar" ? "خطأ في التاريخ" : "Date Error";
                          }
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* رقم المقال */}
                  {idx < 3 && (
                    <div className={`absolute top-3 left-3 w-9 h-9 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center shadow-xl border-2 border-white`}>
                      <span className="text-white font-black text-base">{idx + 1}</span>
                    </div>
                  )}

                  {/* Featured Badge */}
                  {article.featured && (
                    <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 text-xs font-bold rounded-lg flex items-center gap-1 shadow-lg">
                      <TrendingUp className="h-3 w-3" />
                      {language === "ar" ? "مميز" : "Featured"}
                    </div>
                  )}
                </div>

                {/* محتوى المقال */}
                <div className="p-5">
                  <h3 className="font-extrabold text-base line-clamp-2 text-black dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors min-h-[2.5rem] leading-tight">
                    {language === "ar" ? article.titleAr : article.titleEn}
                  </h3>
                  
                  {article.excerptAr || article.excerptEn ? (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                      {language === "ar" ? article.excerptAr : article.excerptEn}
                    </p>
                  ) : null}

                  {/* معلومات إضافية */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t-2 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-2.5 py-1.5 rounded-lg">
                      <svg className="h-3.5 w-3.5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        {article.views || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </motion.section>
  );
}
