import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Radio, Plus, Edit, Trash2, Eye, ExternalLink, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Stream {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  externalUrl?: string;
  rtmpUrl?: string;
  streamType?: string;
  status: "live" | "ended" | "scheduled";
  isActive?: boolean;
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
}

export default function AdminStreams() {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const [formData, setFormData] = useState({
    titleAr: "",
    titleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    externalUrl: "",
    streamType: "external",
    status: "scheduled" as "live" | "ended" | "scheduled",
    isActive: true,
  });

  // Fetch streams
  const { data: streams = [], isLoading } = useQuery<Stream[]>({
    queryKey: ["/api/streams"],
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = editingStream 
        ? `/api/admin/streams/${editingStream.id}`
        : "/api/admin/streams";
      
      const response = await fetch(url, {
        method: editingStream ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save stream");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/streams"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: language === "ar" ? "✅ تم الحفظ" : "✅ Saved",
        description: language === "ar" 
          ? "تم حفظ البث بنجاح" 
          : "Stream saved successfully",
      });
    },
    onError: () => {
      toast({
        title: language === "ar" ? "❌ خطأ" : "❌ Error",
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
      if (!response.ok) throw new Error("Failed to delete stream");
      return response.json();
    },
    onSuccess: () => {
      // Force refresh both queries
      queryClient.invalidateQueries({ queryKey: ["/api/streams"] });
      queryClient.refetchQueries({ queryKey: ["/api/streams"] });
      toast({
        title: language === "ar" ? "✅ تم الحذف" : "✅ Deleted",
        description: language === "ar" 
          ? "تم حذف البث بنجاح" 
          : "Stream deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: language === "ar" ? "❌ خطأ" : "❌ Error",
        description: language === "ar" 
          ? "فشل حذف البث" 
          : "Failed to delete stream",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      titleAr: "",
      titleEn: "",
      descriptionAr: "",
      descriptionEn: "",
      externalUrl: "",
      streamType: "external",
      status: "scheduled",
      isActive: true,
    });
    setEditingStream(null);
  };

  const handleEdit = (stream: Stream) => {
    setEditingStream(stream);
    setFormData({
      titleAr: stream.titleAr || "",
      titleEn: stream.titleEn || "",
      descriptionAr: stream.descriptionAr || "",
      descriptionEn: stream.descriptionEn || "",
      externalUrl: stream.externalUrl || "",
      streamType: stream.streamType || "external",
      status: stream.status,
      isActive: stream.isActive ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.titleAr.trim() || !formData.titleEn.trim()) {
      toast({
        title: language === "ar" ? "⚠️ تنبيه" : "⚠️ Warning",
        description: language === "ar" 
          ? "الرجاء ملء جميع الحقول المطلوبة" 
          : "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      live: "bg-red-500 hover:bg-red-500 animate-pulse",
      scheduled: "bg-blue-500 hover:bg-blue-500",
      ended: "bg-gray-500 hover:bg-gray-500",
    };
    const labels = {
      live: language === "ar" ? "مباشر" : "Live",
      scheduled: language === "ar" ? "مجدول" : "Scheduled",
      ended: language === "ar" ? "انتهى" : "Ended",
    };
    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <Radio className="h-5 w-5 text-white" />
            </div>
            {language === "ar" ? "إدارة البث المباشر" : "Live Streams Management"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "ar" 
              ? "إنشاء وإدارة البث المباشر من YouTube" 
              : "Create and manage live streams from YouTube"}
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          {language === "ar" ? "إضافة بث" : "Add Stream"}
        </Button>
      </div>

      {/* Streams Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            {language === "ar" ? "قائمة البث" : "Streams List"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {language === "ar" ? "جاري التحميل..." : "Loading..."}
            </div>
          ) : streams.length === 0 ? (
            <div className="text-center py-12">
              <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === "ar" 
                  ? "لا توجد بثوث. ابدأ بإضافة بث جديد!" 
                  : "No streams yet. Start by adding a new stream!"}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === "ar" ? "العنوان" : "Title"}</TableHead>
                    <TableHead>{language === "ar" ? "الحالة" : "Status"}</TableHead>
                    <TableHead>{language === "ar" ? "الرابط الخارجي" : "External URL"}</TableHead>
                    <TableHead>{language === "ar" ? "التاريخ" : "Date"}</TableHead>
                    <TableHead className="text-right">{language === "ar" ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {streams.map((stream) => (
                    <TableRow key={stream.id}>
                      <TableCell className="font-medium">
                        {language === "ar" ? stream.titleAr : stream.titleEn}
                      </TableCell>
                      <TableCell>{getStatusBadge(stream.status)}</TableCell>
                      <TableCell>
                        {stream.externalUrl ? (
                          <a
                            href={stream.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {language === "ar" ? "فتح" : "Open"}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(stream.createdAt).toLocaleDateString("en-US", {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open("/live", "_blank")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(stream)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
                                deleteMutation.mutate(stream.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Youtube className="h-5 w-5 text-red-500" />
              {editingStream 
                ? (language === "ar" ? "تعديل البث" : "Edit Stream")
                : (language === "ar" ? "إضافة بث جديد" : "Add New Stream")}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {language === "ar" 
                ? "املأ المعلومات التالية لإضافة بث مباشر جديد" 
                : "Fill in the following information to add a new live stream"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* العناوين في صف واحد */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title Arabic */}
              <div className="space-y-2">
                <Label htmlFor="titleAr" className="text-sm font-medium">
                  {language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="titleAr"
                  placeholder={language === "ar" ? "مثال: مؤتمر صحفي" : "e.g., Press Conference"}
                  value={formData.titleAr}
                  onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                  className="h-9"
                />
              </div>

              {/* Title English */}
              <div className="space-y-2">
                <Label htmlFor="titleEn" className="text-sm font-medium">
                  {language === "ar" ? "العنوان (إنجليزي)" : "Title (English)"} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="titleEn"
                  placeholder="e.g., Press Conference"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  className="h-9"
                />
              </div>
            </div>

            {/* External URL & Status في صف واحد */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* External URL */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="externalUrl" className="text-sm font-medium">
                  {language === "ar" ? "رابط YouTube" : "YouTube URL"}
                </Label>
                <Input
                  id="externalUrl"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.externalUrl}
                  onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                  className="h-9"
                />
                <p className="text-xs text-muted-foreground">
                  {language === "ar" 
                    ? "انسخ رابط الفيديو من YouTube" 
                    : "Copy the video URL from YouTube"}
                </p>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  {language === "ar" ? "الحالة" : "Status"}
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">
                    {language === "ar" ? "مباشر الآن" : "Live Now"}
                  </SelectItem>
                  <SelectItem value="scheduled">
                    {language === "ar" ? "مجدول" : "Scheduled"}
                  </SelectItem>
                  <SelectItem value="ended">
                    {language === "ar" ? "انتهى" : "Ended"}
                  </SelectItem>
                </SelectContent>
                </Select>
              </div>
            </div>

            {/* الوصف في صف واحد */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Description Arabic */}
              <div className="space-y-2">
                <Label htmlFor="descriptionAr" className="text-sm font-medium">
                  {language === "ar" ? "الوصف (عربي)" : "Description (Arabic)"}
                </Label>
                <Textarea
                  id="descriptionAr"
                  placeholder={language === "ar" ? "وصف البث..." : "Stream description..."}
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Description English */}
              <div className="space-y-2">
                <Label htmlFor="descriptionEn" className="text-sm font-medium">
                  {language === "ar" ? "الوصف (إنجليزي)" : "Description (English)"}
                </Label>
                <Textarea
                  id="descriptionEn"
                  placeholder="Stream description..."
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
              className="h-9"
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 h-9"
            >
              {saveMutation.isPending 
                ? (language === "ar" ? "جاري الحفظ..." : "Saving...")
                : editingStream
                  ? (language === "ar" ? "تحديث" : "Update")
                  : (language === "ar" ? "إضافة" : "Add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
