import type { MetadataRoute } from "next";
import { getMenu } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const menu = await getMenu();
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    ...menu.map((m) => ({
      url: absoluteUrl(`/menu/${m.id}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: m.image_url ? [m.image_url] : undefined,
    })),
  ];
}
