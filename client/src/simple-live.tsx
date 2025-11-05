import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Youtube, Radio } from "lucide-react";

interface Stream {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  youtubeUrl: string;
  isActive: boolean;
}

// Extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

export default function SimpleLive() {
  const { language } = useI18n();
  
  // Fetch active stream
  const { data: activeStream, isLoading } = useQuery<Stream | null>({
    queryKey: ["/api/streams/active"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {language === "ar" ? "جاري التحميل..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!activeStream) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Radio className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {language === "ar" ? "لا يوجد بث مباشر حالياً" : "No Live Stream Available"}
          </h1>
          <p className="text-muted-foreground">
            {language === "ar"
              ? "سنعود قريباً ببث مباشر جديد"
              : "We'll be back soon with a new live stream"}
          </p>
        </div>
      </div>
    );
  }

  const videoId = getYouTubeVideoId(activeStream.youtubeUrl);
  
  if (!videoId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Youtube className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-red-600">
            {language === "ar" ? "خطأ في رابط البث" : "Invalid Stream URL"}
          </h1>
          <p className="text-muted-foreground">
            {language === "ar"
              ? "الرجاء التحقق من رابط YouTube"
              : "Please check the YouTube URL"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <Radio className="h-6 w-6 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
              </span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              {language === "ar" ? activeStream.titleAr : activeStream.titleEn}
            </h1>
          </div>
          
          {(activeStream.descriptionAr || activeStream.descriptionEn) && (
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {language === "ar" ? activeStream.descriptionAr : activeStream.descriptionEn}
            </p>
          )}
        </div>

        {/* Video Player */}
        <div className="max-w-6xl mx-auto">
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1`}
              title={language === "ar" ? activeStream.titleAr : activeStream.titleEn}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          
          {/* Live Badge */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              {language === "ar" ? "بث مباشر" : "LIVE"}
            </span>
          </div>
        </div>

        {/* Info Card */}
        <div className="max-w-6xl mx-auto mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Youtube className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">
                  {language === "ar" ? activeStream.titleAr : activeStream.titleEn}
                </h2>
                {(activeStream.descriptionAr || activeStream.descriptionEn) && (
                  <p className="text-muted-foreground">
                    {language === "ar" ? activeStream.descriptionAr : activeStream.descriptionEn}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
