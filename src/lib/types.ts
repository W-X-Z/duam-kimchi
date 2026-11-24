export type PriceOption = {
  label: string;
  price: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  tag: string;
  image_url: string | null;
  options: PriceOption[];
  is_soldout: boolean;
  is_visible: boolean;
  sort_order: number;
};

export type SiteSettings = {
  shop_name: string;
  tagline: string;
  intro: string;
  hero_image_url: string | null;
  phone: string;
  kakao_url: string;
  instagram_url: string;
  address: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  order_guide: string;
  shipping_fee: string;
  shipping_guide: string;
  business_info: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  shop_name: "두암시장김치",
  tagline: "",
  intro: "",
  hero_image_url: null,
  phone: "",
  kakao_url: "",
  instagram_url: "",
  address: "",
  bank_name: "",
  account_number: "",
  account_holder: "",
  order_guide: "",
  shipping_fee: "",
  shipping_guide: "",
  business_info: "",
};

export function formatPrice(n: number) {
  return `${n.toLocaleString("ko-KR")}원`;
}

export function lines(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}
