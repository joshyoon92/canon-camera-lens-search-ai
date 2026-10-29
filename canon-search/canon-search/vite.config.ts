import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// Serves /api/* from the same handlers Vercel deploys, so `npm run dev` needs no Vercel CLI.
function devApi(): Plugin {
  return {
    name: "dev-api",
    configureServer(server) {
      server.middlewares.use("/api/search", async (req, res, next) => {
        try {
          const { handleSearch } = await server.ssrLoadModule("/server/search.ts");
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const request = new Request(new URL(req.originalUrl ?? req.url ?? "/", "http://localhost"), {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: req.method === "GET" || req.method === "HEAD" ? undefined : Buffer.concat(chunks),
          });
          const response: Response = await handleSearch(request);
          if (res.destroyed) return;
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          // A browser closing the request early is normal; anything else goes to Vite's error page.
          if (req.destroyed || (err as NodeJS.ErrnoException).code === "ECONNRESET") return;
          next(err);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), devApi()],
});
