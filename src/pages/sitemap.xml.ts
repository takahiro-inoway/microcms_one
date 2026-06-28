import type { APIRoute } from "astro";
import { getBlogList, getCategoryList } from "../libs/microcms";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const prerender = false;
export const revalidate = 60;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const origin = url.origin;

  const urls = [
    { loc: `${origin}/`, lastmod: new Date().toISOString() },
    { loc: `${origin}/about`, lastmod: new Date().toISOString() },
    { loc: `${origin}/blog`, lastmod: new Date().toISOString() },
  ];

  try {
    const [blogs, categories] = await Promise.all([
      getBlogList({ limit: 1000 }),
      getCategoryList({ limit: 1000 }),
    ]);

    blogs.contents.forEach((blog) => {
      urls.push({
        loc: `${origin}/blog/${blog.id}`,
        lastmod: blog.updatedAt || blog.createdAt || new Date().toISOString(),
      });
    });

    categories.contents.forEach((category) => {
      urls.push({
        loc: `${origin}/category/${category.id}`,
        lastmod: category.updatedAt || category.createdAt || new Date().toISOString(),
      });
    });
  } catch (error) {
    console.error("Failed to fetch sitemap content from microCMS", error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) => `  <url><loc>${escapeXml(item.loc)}</loc>${
      item.lastmod ? `<lastmod>${escapeXml(item.lastmod)}</lastmod>` : ""
    }</url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
