export default function robots() {
  const url = process.env.SITE_URL;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/recuperar-senha", "/api/"],
    },
    ...(url ? { sitemap: new URL("/sitemap.xml", url).href } : {}),
  };
}
