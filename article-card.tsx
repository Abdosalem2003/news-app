import { Link } from "wouter";
import { Clock, Eye, User, Bookmark, Share2, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { useState } from "react";
import type { ArticleWithRelations } from "@shared/schema";

interface ArticleCardProps {
  article: ArticleWithRelations;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const { language, t } = useI18n();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const title = language === "ar" ? article.titleAr : article.titleEn;
  const excerpt = language === "ar" ? article.excerptAr : article.excerptEn;
  const categoryName = article.category ? (language === "ar" ? article.category.nameAr : article.category.nameEn) : "";

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: title || '',
        url: window.location.origin + `/article/${article.slug}`
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className={`group relative overflow-hidden border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-800 rounded-2xl ${
          featured ? "lg:col-span-2" : ""
        }`}
        data-testid={`card-article-${article.id}`}
      >
        <Link href={`/article/${article.slug}`}>
          <div className="block cursor-pointer relative">
            {/* Image */}
            {article.coverImage && (
              <div className={`relative overflow-hidden ${featured ? "aspect-[21/9]" : "aspect-[16/10]"}`}>
                <motion.img
                  src={article.coverImage}
                  alt={title || ""}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  animate={{ scale: isHovered ? 1.08 : 1 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Trending Badge */}
                {article.views && article.views > 1000 && (
                  <motion.div 
                    className="absolute top-4 right-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow-lg flex items-center gap-1 px-3 py-1.5">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span className="font-semibold">{language === "ar" ? "رائج" : "Trending"}</span>
                    </Badge>
                  </motion.div>
                )}
                
                {/* Category Badge */}
                {article.category && (
                  <motion.div 
                    className="absolute top-4 left-4"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Badge 
                      data-testid={`badge-category-${article.category.slug}`} 
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 border-0 shadow-lg font-bold px-3 py-1.5"
                    >
                      {categoryName}
                    </Badge>
                  </motion.div>
                )}

                {/* Date Badge - Red Box with White Text */}
                <motion.div 
                  className="absolute bottom-4 left-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 backdrop-blur-sm">
                    <Calendar className="h-4 w-4" />
                    <span className="font-bold text-sm">
                      {new Date(article.publishedAt || new Date()).toLocaleDateString(
                        language === "ar" ? "ar-SA" : "en-US",
                        { month: 'short', day: 'numeric', year: 'numeric' }
                      )}
                    </span>
                  </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div 
                  className="absolute bottom-4 right-4 flex gap-2"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 rounded-xl bg-white/95 hover:bg-white backdrop-blur-md shadow-lg hover:scale-110 transition-transform"
                    onClick={handleBookmark}
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-red-600 text-red-600' : 'text-gray-700'}`} />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 rounded-xl bg-white/95 hover:bg-white backdrop-blur-md shadow-lg hover:scale-110 transition-transform"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 text-gray-700" />
                  </Button>
                </motion.div>
              </div>
            )}

            <CardContent className={`${featured ? "p-6" : "p-5"}`}>
              {/* Featured Badge */}
              {article.featured && (
                <motion.div 
                  className="mb-3"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 text-xs px-3 py-1">
                    {language === "ar" ? "⭐ مميز" : "⭐ Featured"}
                  </Badge>
                </motion.div>
              )}

              {/* Title */}
              <h3 
                className={`font-bold mb-3 line-clamp-2 text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300 leading-tight ${
                  featured ? "text-2xl md:text-3xl" : "text-lg md:text-xl"
                }`}
                data-testid={`text-title-${article.id}`}
              >
                {title}
              </h3>

              {/* Excerpt */}
              {excerpt && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 line-clamp-2 leading-relaxed" data-testid={`text-excerpt-${article.id}`}>
                  {excerpt}
                </p>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  {/* Author */}
                  {article.author && (
                    <motion.div 
                      className="flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-gray-200 dark:ring-gray-600">
                        <AvatarImage src={article.author.profileImage || undefined} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                          {article.author.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200" data-testid={`text-author-${article.id}`}>
                        {article.author.name}
                      </span>
                    </motion.div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  {/* Reading Time */}
                  {article.readingTime && (
                    <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-2.5 py-1.5 rounded-lg">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="font-medium" data-testid={`text-reading-time-${article.id}`}>
                        {article.readingTime} {t("article.readTime")}
                      </span>
                    </div>
                  )}

                  {/* Views */}
                  <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-2.5 py-1.5 rounded-lg">
                    <Eye className="h-3.5 w-3.5" />
                    <span className="font-medium" data-testid={`text-views-${article.id}`}>
                      {article.views?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Read More Indicator */}
              <motion.div
                className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{ x: isHovered ? 5 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-bold">
                  <span>{language === "ar" ? "اقرأ المزيد" : "Read More"}</span>
                  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </motion.div>
            </CardContent>
          </div>
        </Link>
      </Card>
    </motion.div>
  );
}
