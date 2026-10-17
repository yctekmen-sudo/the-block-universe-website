
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://the-block-universe.vercel.app";

  const paths = [
    "",
    "/contents",
    "/read/introduction",
    "/read/section-1",
    "/read/section-2",
    "/read/section-3",
    "/read/section-4",
    "/read/section-5",
    "/read/section-6",
    "/read/appendix-a",
  ];

  return paths.map((path) => ({
    url: `${baseUrl}${path}`,
  }));
}
