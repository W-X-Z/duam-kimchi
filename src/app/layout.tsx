import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getMenu, getSettings } from "@/lib/data";
import { CartProvider } from "@/components/cart/CartProvider";
import { GOOGLE_SITE_VERIFICATION, NAVER_SITE_VERIFICATION, SITE_URL, shopDescription } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const [s, menu] = await Promise.all([getSettings(), getMenu()]);
  const title = s.tagline ? `${s.shop_name} | ${s.tagline}` : `${s.shop_name} | 김치 택배 주문`;
  const description = shopDescription(s);
  const ogImage = s.hero_image_url || menu.find((m) => m.image_url)?.image_url;
  return {
    metadataBase: SITE_URL,
    title: { default: title, template: `%s | ${s.shop_name}` },
    description,
    applicationName: s.shop_name,
    appleWebApp: { capable: true, title: "두암김치", statusBarStyle: "default" },
    openGraph: {
      title,
      description,
      url: "/",
      siteName: s.shop_name,
      images: ogImage ? [ogImage] : undefined,
      locale: "ko_KR",
      type: "website",
    },
    verification: {
      google: GOOGLE_SITE_VERIFICATION || undefined,
      other: NAVER_SITE_VERIFICATION ? { "naver-site-verification": NAVER_SITE_VERIFICATION } : undefined,
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
