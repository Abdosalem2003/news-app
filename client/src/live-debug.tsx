import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function LiveDebugPage() {
  const { language } = useI18n();
  
  const { data: activeStream, isLoading, error } = useQuery<any>({
    queryKey: ["/api/streams/active"],
    refetchInterval: 5000,
  });

  const getYouTubeVideoId = (url: string) => {
    const match = url?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match?.[1];
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">
          {language === "ar" ? "تشخيص البث المباشر" : "Live Stream Diagnostics"}
        </h1>

        {/* Loading State */}
        {isLoading && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                <span>{language === "ar" ? "جاري التحميل..." : "Loading..."}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-500">
                <XCircle className="h-5 w-5" />
                <span>{language === "ar" ? "خطأ في تحميل البيانات" : "Error loading data"}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Stream */}
        {!isLoading && !error && !activeStream && (
          <Card className="mb-6 border-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-yellow-600">
                <AlertCircle className="h-5 w-5" />
                <span>{language === "ar" ? "لا يوجد بث نشط" : "No active stream"}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stream Data */}
        {activeStream && (
          <>
            {/* Status Overview */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{language === "ar" ? "حالة البث" : "Stream Status"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{language === "ar" ? "الحالة" : "Status"}</p>
                    <Badge className={activeStream.status === "live" ? "bg-green-500" : "bg-gray-500"}>
                      {activeStream.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{language === "ar" ? "نشط" : "Active"}</p>
                    {activeStream.isActive ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stream Details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{language === "ar" ? "تفاصيل البث" : "Stream Details"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 font-semibold">ID:</p>
                  <p className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">{activeStream.id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 font-semibold">{language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"}:</p>
                  <p>{activeStream.titleAr || "N/A"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 font-semibold">{language === "ar" ? "العنوان (إنجليزي)" : "Title (English)"}:</p>
                  <p>{activeStream.titleEn || "N/A"}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 font-semibold">{language === "ar" ? "نوع البث" : "Stream Type"}:</p>
                  <Badge>{activeStream.streamType || "N/A"}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* URLs Check */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{language === "ar" ? "فحص الروابط" : "URLs Check"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* External URL */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-semibold">External URL:</p>
                    {activeStream.externalUrl ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {activeStream.externalUrl ? (
                    <>
                      <p className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded break-all mb-2">
                        {activeStream.externalUrl}
                      </p>
                      {(() => {
                        const videoId = getYouTubeVideoId(activeStream.externalUrl);
                        if (videoId) {
                          return (
                            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
                              <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                {language === "ar" ? "رابط YouTube صحيح" : "Valid YouTube URL"}
                              </p>
                              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Video ID: <code className="bg-white dark:bg-gray-800 px-1 rounded">{videoId}</code>
                              </p>
                            </div>
                          );
                        } else {
                          return (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded">
                              <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {language === "ar" ? "الرابط موجود لكن ليس YouTube" : "URL exists but not YouTube"}
                              </p>
                            </div>
                          );
                        }
                      })()}
                    </>
                  ) : (
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                      <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        {language === "ar" ? "لا يوجد رابط خارجي" : "No external URL"}
                      </p>
                    </div>
                  )}
                </div>

                {/* RTMP URL */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-semibold">RTMP URL:</p>
                    {activeStream.rtmpUrl ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  {activeStream.rtmpUrl ? (
                    <p className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
                      {activeStream.rtmpUrl}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">{language === "ar" ? "غير متوفر" : "Not available"}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Raw JSON */}
            <Card>
              <CardHeader>
                <CardTitle>{language === "ar" ? "البيانات الخام (JSON)" : "Raw Data (JSON)"}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(activeStream, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </>
        )}

        {/* Instructions */}
        <Card className="mt-6 border-blue-500">
          <CardHeader>
            <CardTitle className="text-blue-600">
              {language === "ar" ? "كيفية الإصلاح" : "How to Fix"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1. {language === "ar" ? "تأكد من أن البث في حالة" : "Make sure stream status is"} <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">live</code></p>
            <p>2. {language === "ar" ? "تأكد من تفعيل" : "Make sure"} <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">isActive = true</code></p>
            <p>3. {language === "ar" ? "أضف رابط YouTube في حقل" : "Add YouTube URL in"} <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">externalUrl</code></p>
            <p className="text-blue-600 font-semibold mt-3">
              {language === "ar" ? "مثال رابط YouTube:" : "Example YouTube URL:"}
            </p>
            <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded">
              https://www.youtube.com/watch?v=dQw4w9WgXcQ
            </code>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
