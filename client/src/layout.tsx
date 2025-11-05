import React from "react";
import { Link, useRoute } from "wouter";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Users,
  Image,
  DollarSign,
  Radio,
  FileCheck,
  Settings,
  BarChart3,
  Search,
  MessageSquare,
  LogOut,
  User,
  Shield,
  Menu,
  X,
  Flame,
  Inbox,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n";
import { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { ProtectedRoute, useAuth } from "@/components/protected-route";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ProtectedRoute>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ProtectedRoute>
  );
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const { language } = useI18n();
  const { user, logout } = useAuth();
  const [isActive] = useRoute("/dash-unnt-2025/:path*");
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const menuItems = [
    {
      href: "/dash-unnt-2025",
      icon: LayoutDashboard,
      label: language === "ar" ? "لوحة التحكم" : "Dashboard",
      testId: "admin-nav-dashboard",
    },
    {
      href: "/dash-unnt-2025/articles",
      icon: FileText,
      label: language === "ar" ? "المقالات" : "Articles",
      testId: "admin-nav-articles",
    },
    {
      href: "/dash-unnt-2025/categories",
      icon: FolderOpen,
      label: language === "ar" ? "الأقسام" : "Categories",
      testId: "admin-nav-categories",
    },
    {
      href: "/dash-unnt-2025/users-management",
      icon: Shield,
      label: language === "ar" ? "إدارة المستخدمين" : "User Management",
      testId: "admin-nav-users-management",
    },
    {
      href: "/dash-unnt-2025/media",
      icon: Image,
      label: language === "ar" ? "المكتبة" : "Media",
      testId: "admin-nav-media",
    },
    {
      href: "/dash-unnt-2025/ads",
      icon: DollarSign,
      label: language === "ar" ? "الإعلانات" : "Ads",
      testId: "admin-nav-ads",
    },
    {
      href: "/dash-unnt-2025/ad-requests",
      icon: Inbox,
      label: language === "ar" ? "طلبات الإعلانات" : "Ad Requests",
      testId: "admin-nav-ad-requests",
    },
    {
      href: "/dash-unnt-2025/special-reports",
      icon: Flame,
      label: language === "ar" ? "التقارير الخاصة" : "Special Reports",
      testId: "admin-nav-special-reports",
    },
    {
      href: "/dash-unnt-2025/streams",
      icon: Radio,
      label: language === "ar" ? "البث المباشر" : "Streams",
      testId: "admin-nav-streams",
    },
    {
      href: "/dash-unnt-2025/polls",
      icon: BarChart3,
      label: language === "ar" ? "استطلاعات الرأي" : "Polls",
      testId: "admin-nav-polls",
    },
    {
      href: "/dash-unnt-2025/audit-logs",
      icon: FileCheck,
      label: language === "ar" ? "السجلات" : "Audit Logs",
      testId: "admin-nav-logs",
    },
    {
      href: "/dash-unnt-2025/settings",
      icon: Settings,
      label: language === "ar" ? "الإعدادات" : "Settings",
      testId: "admin-nav-settings",
    },
    {
      href: "/dash-unnt-2025/seo",
      icon: Search,
      label: language === "ar" ? "تحسين محركات البحث" : "SEO",
      testId: "admin-nav-seo",
    },
    {
      href: "/dash-unnt-2025/comments",
      icon: MessageSquare,
      label: language === "ar" ? "التعليقات" : "Comments",
      testId: "admin-nav-comments",
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Header - Enhanced with RTL Support */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
          className="text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" variant="blue" />
          <span className="font-bold text-gray-900 text-sm">
            {language === "ar" ? "لوحة التحكم" : "Admin"}
          </span>
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Modern Google & Samsung Theme */}
      <aside
        className={`fixed lg:static inset-y-0 ${
          language === "ar" ? "right-0" : "left-0"
        } z-50 w-80 lg:w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-out lg:transform-none lg:flex flex-col shadow-lg lg:shadow-none ${
          isSidebarOpen
            ? "translate-x-0"
            : language === "ar"
            ? "translate-x-full lg:translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className="p-4 space-y-3">
            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden absolute top-3 right-3 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Logo Section */}
            <div className="px-1 mb-5">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Logo className="h-6 w-6" variant="white" showText={false} />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-gray-900 font-semibold text-sm">
                    {language === "ar" ? "لوحة التحكم" : "Admin"}
                  </h2>
                  <p className="text-gray-500 text-xs truncate">
                    {language === "ar" ? "إدارة النظام" : "System"}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-3 bg-gray-200" />

            <div className="px-1">
              <h2 className="px-3 mb-2 text-xs font-semibold text-gray-600 uppercase tracking-wider" dir={language === "ar" ? "rtl" : "ltr"}>
                {language === "ar" ? "القائمة" : "Menu"}
              </h2>

              {/* Menu Items */}
              <div className="space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isCurrentPage = window.location.pathname === item.href;

                  return (
                    <Link key={item.href} href={item.href} data-testid={item.testId}>
                      <Button
                        variant="ghost"
                        className={`w-full h-10 px-3 justify-start rounded-xl transition-all duration-200 ${
                          isCurrentPage
                            ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                            : "text-gray-700 hover:bg-gray-100"
                        } ${language === "ar" ? "flex-row-reverse" : "flex-row"}`}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <Icon
                          className={`h-5 w-5 flex-shrink-0 ${
                            language === "ar" ? "ml-2" : "mr-2"
                          } ${isCurrentPage ? "text-gray-900" : "text-gray-600"}`}
                        />
                        <span className="text-sm font-medium truncate" dir={language === "ar" ? "rtl" : "ltr"}>
                          {item.label}
                        </span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button at Bottom */}
        <div className="border-t border-gray-200 bg-white p-4">
          <Button
            onClick={handleLogout}
            className={`w-full h-10 justify-start bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition-all duration-200 ${
              language === "ar" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <LogOut className={`h-5 w-5 flex-shrink-0 ${language === "ar" ? "ml-2" : "mr-2"}`} />
            <span className="text-sm font-medium">{language === "ar" ? "تسجيل الخروج" : "Logout"}</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full min-w-0">
        <div className="pt-16 lg:pt-0 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
