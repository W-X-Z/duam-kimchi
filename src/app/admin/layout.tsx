import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "김치 관리",
  robots: { index: false, follow: false },
  manifest: "/admin.webmanifest",
  icons: { apple: "/admin-apple-icon.png", icon: "/admin-icon-192.png" },
  appleWebApp: { capable: true, title: "김치 관리", statusBarStyle: "default" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#f4f1ec] text-ink">
      <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">불러오는 중</div>}>
        {children}
      </Suspense>
    </div>
  );
}
