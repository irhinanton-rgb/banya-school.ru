import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, Plugin } from "vite";

function apiDevPlugin(): Plugin {
  return {
    name: "api-dev-handlers",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) {
          return next();
        }

        const handleApi = async (modulePath: string) => {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", async () => {
            try {
              const { default: handler } = await import(modulePath);
              (req as any).body = JSON.parse(body || "{}");
              await handler(req, res);
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        };

        if (req.url.startsWith("/api/create-payment") && req.method === "POST") {
          return handleApi("./api/create-payment.js");
        }

        if (req.url.startsWith("/api/admin-notification") && req.method === "POST") {
          return handleApi("./api/admin-notification.js");
        }

        if (req.url.startsWith("/api/assistant-ai") && req.method === "POST") {
          return handleApi("./api/assistant-ai.js");
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
