import { formatPrice, lines, shippingLabel, type MenuItem, type SiteSettings } from "./types";

export const SITE_URL = "https://duamkimchi.com";

/** Search-console ownership tokens. Fill in once issued; empty values render nothing. */
export const NAVER_SITE_VERIFICATION = "8c6ff314f6079ea89168db93e5701064cd52d0ad";
export const GOOGLE_SITE_VERIFICATION = "";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

/** Serialize JSON-LD safely for an inline <script>. */
export function jsonLdHtml(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

function priceRange(menu: MenuItem[]) {
  const prices = menu.flatMap((m) => m.options.map((o) => o.price)).filter((p) => p > 0);
  if (!prices.length) return undefined;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `₩${min.toLocaleString("ko-KR")}` : `₩${min.toLocaleString("ko-KR")}~₩${max.toLocaleString("ko-KR")}`;
}

export function shopDescription(s: SiteSettings) {
  return [s.tagline, s.intro].filter(Boolean).join(". ") || `${s.shop_name} 김치 택배 주문`;
}

function sentences(items: string[]) {
  return items.map((t) => (/[.!?。]$/.test(t) ? t : `${t}.`)).join(" ");
}

/** Frequently asked questions built only from what the shop has entered in the admin. */
export function buildFaq(s: SiteSettings): { q: string; a: string }[] {
  const faq: { q: string; a: string }[] = [];
  const steps = lines(s.order_guide);
  if (steps.length) faq.push({ q: "주문은 어떻게 하나요?", a: sentences(steps) });
  faq.push({
    q: "택배비는 얼마인가요?",
    a: s.min_order_amount > 0 ? `${shippingLabel(s)}입니다. 최소 주문 금액은 ${formatPrice(s.min_order_amount)}입니다.` : `${shippingLabel(s)}입니다.`,
  });
  const shipping = lines(s.shipping_guide);
  if (shipping.length) faq.push({ q: "언제 발송되나요?", a: sentences(shipping) });
  if (s.account_number) {
    const account = [s.bank_name, s.account_number, s.account_holder && `(예금주 ${s.account_holder})`]
      .filter(Boolean)
      .join(" ");
    faq.push({ q: "입금 계좌는 어디인가요?", a: `${account}로 입금해 주세요.` });
  }
  if (s.phone) faq.push({ q: "문의는 어디로 하나요?", a: `전화 ${s.phone}로 연락 주세요.` });
  return faq;
}

export function homeJsonLd(s: SiteSettings, menu: MenuItem[]) {
  const url = absoluteUrl("/");
  const faq = buildFaq(s);
  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebSite",
      "@id": `${url}#website`,
      url,
      name: s.shop_name,
      alternateName: ["두암김치", "duamkimchi"],
      inLanguage: "ko-KR",
    },
    {
      "@type": "Store",
      "@id": `${url}#store`,
      name: s.shop_name,
      url,
      description: shopDescription(s),
      telephone: s.phone || undefined,
      priceRange: priceRange(menu),
      image: menu.find((m) => m.image_url)?.image_url ?? undefined,
      address: s.address
        ? { "@type": "PostalAddress", streetAddress: s.address, addressCountry: "KR" }
        : undefined,
      paymentAccepted: s.account_number ? "계좌이체" : undefined,
      currenciesAccepted: "KRW",
      sameAs: [s.instagram_url, s.kakao_url].filter(Boolean).length ? [s.instagram_url, s.kakao_url].filter(Boolean) : undefined,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "김치 메뉴",
        itemListElement: menu.map((m) => ({
          "@type": "Offer",
          url: absoluteUrl(`/menu/${m.id}`),
          itemOffered: { "@type": "Product", name: m.name },
          price: m.options[0]?.price,
          priceCurrency: "KRW",
          availability: m.is_soldout ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        })),
      },
    },
  ];
  if (faq.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export function productDescription(item: MenuItem, s: SiteSettings) {
  const opts = item.options.map((o) => `${o.label} ${formatPrice(o.price)}`).join(", ");
  return [`${item.name} ${opts}`, s.tagline, `${s.shop_name} 택배 주문`].filter(Boolean).join(" · ");
}

export function productJsonLd(item: MenuItem, s: SiteSettings) {
  const url = absoluteUrl(`/menu/${item.id}`);
  const availability = item.is_soldout ? "https://schema.org/OutOfStock" : "https://schema.org/InStock";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: item.name,
        url,
        image: item.image_url ?? undefined,
        description: productDescription(item, s),
        category: "김치",
        brand: { "@type": "Brand", name: s.shop_name },
        offers: item.options.map((o) => ({
          "@type": "Offer",
          name: `${item.name} ${o.label}`,
          price: o.price,
          priceCurrency: "KRW",
          availability,
          url,
          seller: { "@id": `${absoluteUrl("/")}#store` },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingDestination: { "@type": "DefinedRegion", addressCountry: "KR" },
            shippingRate: { "@type": "MonetaryAmount", value: s.shipping_fee_amount, currency: "KRW" },
          },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: s.shop_name, item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: item.name, item: url },
        ],
      },
    ],
  };
}
