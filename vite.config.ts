import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { defineConfig, Plugin } from "vite";
import { SEO_PAGES, SITE_ORIGIN } from "./src/seo/seoPagesData";

function escapeHtmlAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function seoPrerenderPlugin(): Plugin {
  return {
    name: "seo-static-prerender",
    apply: "build",
    closeBundle() {
      try {
        const distDir = path.resolve(process.cwd(), "dist");
        const indexHtmlPath = path.join(distDir, "index.html");
        if (!fs.existsSync(indexHtmlPath)) return;

        const baseHtml = fs.readFileSync(indexHtmlPath, "utf-8");

        const navLinksHtml = [
          `<a href="/" style="color:#fde68a;text-decoration:none;">Главная</a>`,
          ...SEO_PAGES.map(
            (p) =>
              `<a href="${p.path}" style="color:#d6d3d1;text-decoration:none;">${p.breadcrumbs[p.breadcrumbs.length - 1]?.name || p.slug}</a>`
          ),
        ].join(" · ");

        for (const page of SEO_PAGES) {
          const canonicalUrl = `${SITE_ORIGIN}${page.path}`;

          const jsonLd = {
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                itemListElement: page.breadcrumbs.map((b, idx) => ({
                  "@type": "ListItem",
                  position: idx + 1,
                  name: b.name,
                  item: b.url,
                })),
              },
              {
                "@type": "Article",
                headline: page.h1,
                description: page.description,
                author: {
                  "@type": "Person",
                  name: "Антон Ирхин",
                },
                publisher: {
                  "@type": "EducationalOrganization",
                  name: "Школа Банного Мастерства «Пармастер Квест»",
                  url: `${SITE_ORIGIN}/`,
                },
                mainEntityOfPage: canonicalUrl,
              },
              {
                "@type": "FAQPage",
                mainEntity: page.faq.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: f.a,
                  },
                })),
              },
            ],
          };

          const faqHtml = page.faq
            .map(
              (f) => `
                <div style="background:#0c0a09;border:1px solid #292524;border-radius:12px;padding:16px;margin-bottom:12px;">
                  <h3 style="color:#fbbf24;font-size:16px;margin:0 0 6px 0;">${f.q}</h3>
                  <p style="font-size:14px;color:#d6d3d1;line-height:1.6;margin:0;">${f.a}</p>
                </div>`
            )
            .join("");

          const prerenderedRootInner = `
      <div id="root">
        <div style="min-height:100vh;display:flex;flex-direction:column;justify-content:space-between;background-color:#0c0a09;color:#f5f5f4;">
          <header style="border-bottom:1px solid #292524;background:rgba(12,10,9,0.95);padding:14px 24px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">
            <a href="/" style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#fde68a;text-decoration:none;">Пармастер Квест — Школа Банного Мастерства Антона Ирхина</a>
            <nav style="font-size:13px;color:#d6d3d1;">${navLinksHtml}</nav>
          </header>
          <main style="max-width:1100px;width:100%;margin:0 auto;padding:32px 20px;box-sizing:border-box;">
            <article style="border:1px solid #292524;background:#1c1917;border-radius:24px;padding:32px;">
              <div style="font-size:12px;color:#a8a29e;margin-bottom:12px;">
                ${page.breadcrumbs.map((b) => `<a href="${b.url}" style="color:#fbbf24;text-decoration:none;">${b.name}</a>`).join(" / ")}
              </div>
              <h1 style="font-family:Georgia,serif;font-size:34px;line-height:1.2;margin:0 0 14px 0;color:#f5f5f4;">${page.h1}</h1>
              <p style="font-size:16px;line-height:1.6;color:#fde68a;margin:0 0 20px 0;">${page.subtitle}</p>
              ${page.articleHtml}
              <section style="margin-top:24px;border-top:1px solid #292524;padding-top:20px;">
                <h2 style="font-family:Georgia,serif;font-size:22px;color:#fde68a;margin-bottom:14px;">Частые вопросы по теме</h2>
                ${faqHtml}
              </section>
            </article>
          </main>
          <footer style="border-top:1px solid #292524;padding:20px 24px;text-align:center;font-size:12px;color:#78716c;">
            © Школа Банного Мастерства Антона Ирхина «Пармастер Квест» · <a href="${SITE_ORIGIN}/" style="color:#fbbf24;">banya-school.ru</a>
          </footer>
        </div>
      </div>`;

          let pageHtml = baseHtml
            .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtmlAttr(page.title)}</title>`)
            .replace(
              /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
              `<meta name="description" content="${escapeHtmlAttr(page.description)}" />`
            )
            .replace(
              /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i,
              `<meta name="keywords" content="${escapeHtmlAttr(page.keywords)}" />`
            )
            .replace(
              /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
              `<meta property="og:title" content="${escapeHtmlAttr(page.title)}" />`
            )
            .replace(
              /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
              `<meta property="og:description" content="${escapeHtmlAttr(page.description)}" />`
            )
            .replace(
              /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
              `<meta name="twitter:title" content="${escapeHtmlAttr(page.title)}" />`
            )
            .replace(
              /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
              `<meta name="twitter:description" content="${escapeHtmlAttr(page.description)}" />`
            )
            .replace(
              /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
              `<link rel="canonical" href="${canonicalUrl}" />\n    <meta property="og:url" content="${canonicalUrl}" />`
            )
            .replace(
              /<script type="application\/ld\+json">[\s\S]*?<\/script>/i,
              `<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n    </script>`
            )
            .replace(
              /<div id="root">[\s\S]*<\/div>\s*<\/body>/i,
              `${prerenderedRootInner}\n  </body>`
            );

          const routeDir = path.join(distDir, page.slug);
          fs.mkdirSync(routeDir, { recursive: true });
          fs.writeFileSync(path.join(routeDir, "index.html"), pageHtml, "utf-8");
        }
      } catch (err) {
        console.warn("SEO prerender plugin warning:", err);
      }
    },
  };
}

function apiDevPlugin(): Plugin {
  return {
    name: "api-dev-handlers",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) {
          return next();
        }

        // Add Express-like convenience methods if missing on Node HTTP res
        const expressRes = res as any;
        if (!expressRes.status) {
          expressRes.status = function (statusCode: number) {
            this.statusCode = statusCode;
            return this;
          };
        }
        if (!expressRes.json) {
          expressRes.json = function (data: any) {
            this.setHeader("Content-Type", "application/json");
            this.end(JSON.stringify(data));
            return this;
          };
        }

        const handleApi = async (relativePath: string) => {
          let body = "";
          req.on("data", (chunk) => {
            if (body.length < 100_000) {
              body += chunk;
            }
          });
          req.on("end", async () => {
            try {
              const fullPath = path.resolve(process.cwd(), relativePath);
              const fileUrl = pathToFileURL(fullPath).href;
              const { default: handler } = await import(fileUrl);
              (req as any).body = JSON.parse(body || "{}");
              await handler(req, expressRes);
            } catch (err: any) {
              expressRes.statusCode = 500;
              expressRes.setHeader("Content-Type", "application/json");
              expressRes.end(JSON.stringify({ error: "Internal Server Error" }));
            }
          });
        };

        const urlPath = (req.url || "").split("?")[0].replace(/^\/api\//, "");
        if (urlPath && /^[a-zA-Z0-9_-]+$/.test(urlPath)) {
          return handleApi(`api/${urlPath}.js`);
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDevPlugin(), seoPrerenderPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    build: {
      target: "es2020",
      cssCodeSplit: true,
      modulePreload: true,
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/firebase")) return "vendor-firebase";
            if (id.includes("node_modules/mqtt")) return "vendor-mqtt";
            if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) return "vendor-react";
            if (id.includes("node_modules/lucide-react") || id.includes("node_modules/motion")) return "vendor-ui";
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== "true",
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
  };
});
