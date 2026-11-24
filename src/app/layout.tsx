import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSettings } from "@/lib/data";
import { CartProvider } from "@/components/cart/CartProvider";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const description = s.tagline || s.intro || `${s.shop_name} 메뉴와 가격`;
  return {
    title: s.shop_name,
    description,
    openGraph: {
      title: s.shop_name,
      description,
      images: s.hero_image_url ? [s.hero_image_url] : undefined,
      locale: "ko_KR",
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f7f1e6",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@500;700;900&display=swap"
        />
      </head>
      <body className="min-h-dvh">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
