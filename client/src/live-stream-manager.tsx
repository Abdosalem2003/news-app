import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";
import { Youtube, Plus, Trash2, Eye, EyeOff, Edit2, ExternalLink } from "lucide-react";

interface Stream {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  youtubeUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LiveStreamManager() {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const [formData, setFormData] = useState({
    titleAr: "",
    titleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    youtubeUrl: "",
  });

  // Fetch streams
  const { data: streams = [], isLoading } = useQuery<Stream[]>({
    queryKey: ["/api/admin/streams"],
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = editingStream
        ? `/api/admin/streams/${editingStream.id}`
        : "/api/admin/streams";
      
      const method = editingStream ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error("Failed to save stream");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/streams"] });
      toast({
        title: language === "ar" ? "تم الحفظ" : "Saved",
        description: language === "ar" 
          ? "تم حفظ البث بنجاح" 
          : "Stream saved successfully",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar"
          ? "فشل حفظ البث"
          : "Failed to save stream",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/streams/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/streams"] });
      toast({
        title: language === "ar" ? "تم الحذف" : "Deleted",
        description: language === "ar"
          ? "تم حذف البث بنجاح"
          : "Stream deleted successfully",
      });
    },
  });

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/streams/${id}/toggle`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to toggle");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/streams"] });
      toast({
        title: language === "ar" ? "تم التحديث" : "Updated",
        description: language === "ar"
          ? "تم تحديث حالة البث"
          : "Stream status updated",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      titleAr: "",
      titleEn: "",
      descriptionAr: "",
      descriptionEn: "",
      youtubeUrl: "",
    });
    setEditingStream(null);
    setIsFormOpen(false);
  };

  const handleEdit = (stream: Stream) => {
    setEditingStream(stream);
    setFormData({
      titleAr: stream.titleAr,
      titleEn: stream.titleEn,
      descriptionAr: stream.descriptionAr || "",
      descriptionEn: stream.descriptionEn || "",
      youtubeUrl: stream.youtubeUrl,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titleAr || !formData.titleEn || !formData.youtubeUrl) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar"
          ? "الرجاء ملء جميع الحقول المطلوبة"
          : "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    saveMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Youtube className="h-8 w-8 text-red-500" />
            {language === "ar" ? "إدارة البث المباشر" : "Live Stream Manager"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "ar"
              ? "إدارة روابط البث المباشر من YouTube"
              : "Manage YouTube live stream links"}
          </p>
        </div>
        
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          {language === "ar" ? "إضافة بث جديد" : "Add New Stream"}
        </Button>
      </div>

      {/* Form Card */}
      {isFormOpen && (
        <Card className="border-2 border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500" />
              {editingStream
                ? (language === "ar" ? "تعديل البث" : "Edit Stream")
                : (language === "ar" ? "إضافة بث جديد" : "Add New Stream")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titleAr">
                    {language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="titleAr"
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    placeholder={language === "ar" ? "مثال: بث مباشر" : "e.g., Live Stream"}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="titleEn">
                    {language === "ar" ? "العنوان (إنجليزي)" : "Title (English)"} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="titleEn"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    placeholder="e.g., Live Stream"
                    required
                  />
                </div>
              </div>

              {/* YouTube URL */}
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">
                  {language === "ar" ? "رابط YouTube" : "YouTube URL"} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {language === "ar"
                    ? "انسخ رابط الفيديو من YouTube"
                    : "Copy the video URL from YouTube"}
                </p>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="descriptionAr">
                    {language === "ar" ? "الوصف (عربي)" : "Description (Arabic)"}
                  </Label>
                  <Textarea
                    id="descriptionAr"
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                    placeholder={language === "ar" ? "وصف البث..." : "Stream description..."}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="descriptionEn">
                    {language === "ar" ? "الوصف (إنجليزي)" : "Description (English)"}
                  </Label>
                  <Textarea
                    id="descriptionEn"
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    placeholder="Stream description..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                >
                  {saveMutation.isPending
                    ? (language === "ar" ? "جاري الحفظ..." : "Saving...")
                    : editingStream
                      ? (language === "ar" ? "تحديث" : "Update")
                      : (language === "ar" ? "إضافة" : "Add")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Streams List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === "ar" ? "البثوث المتاحة" : "Available Streams"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {language === "ar" ? "جاري التحميل..." : "Loading..."}
            </div>
          ) : streams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {language === "ar" ? "لا توجد بثوث" : "No streams yet"}
            </div>
          ) : (
            <div className="space-y-3">
              {streams.map((stream) => (
                <div
                  key={stream.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    stream.isActive
                      ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                      : "border-gray-200 dark:border-gray-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {language === "ar" ? stream.titleAr : stream.titleEn}
                        </h3>
                        {stream.isActive && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
                            {language === "ar" ? "نشط" : "Active"}
                          </span>
                        )}
                      </div>
                      
                      {(stream.descriptionAr || stream.descriptionEn) && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {language === "ar" ? stream.descriptionAr : stream.descriptionEn}
                        </p>
                      )}
                      
                      <a
                        href={stream.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {stream.youtubeUrl}
                      </a>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleMutation.mutate(stream.id)}
                        disabled={toggleMutation.isPending}
                      >
                        {stream.isActive ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(stream)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm(language === "ar" ? "هل أنت متأكد؟" : "Are you sure?")) {
                            deleteMutation.mutate(stream.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
