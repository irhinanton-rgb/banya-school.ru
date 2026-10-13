import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { pathToFileURL } from "url";
import { defineConfig, Plugin } from "vite";

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
            body += chunk;
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
              expressRes.end(JSON.stringify({ error: err.message }));
            }
          });
        };

        const urlPath = (req.url || "").split("?")[0].replace(/^\/api\//, "");
        if (urlPath) {
          return handleApi(`api/${urlPath}.js`);
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDevPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
        react: "preact/compat",
        "react-dom/test-utils": "preact/test-utils",
        "react-dom/client": "preact/compat/client",
        "react-dom": "preact/compat",
        "react/jsx-runtime": "preact/jsx-runtime",
      },
    },
    build: {
      target: "es2020",
      cssCodeSplit: false,
      modulePreload: true,
      rollupOptions: {
        output: {
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name].[ext]",
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== "true",
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
  };
});
