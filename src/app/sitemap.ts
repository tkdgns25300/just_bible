import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://justbible.life",
      lastModified: "2025-02-27",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://justbible.life/about",
      lastModified: "2025-02-27",
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://justbible.life/terms",
      lastModified: "2025-02-27",
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: "https://justbible.life/privacy",
      lastModified: "2025-02-27",
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}
