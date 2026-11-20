import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { apiRouter } from "./routes/api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const app = express();

const DEFAULT_PORT = 4000;
const FALLBACK_PORT = 4001;
const TARGET_PORT = Number(process.env.PORT) || DEFAULT_PORT;

// Enable CORS for frontend development
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());

// Mount API routes
app.use(apiRouter);

// Serve the built React app in production if client/dist exists
const distPath = path.resolve(__dirname, "../client/dist");
app.use(express.static(distPath));

app.get("*", async (req, res, next) => {
  if (req.path.startsWith("/api") || req.path === "/feed" || req.path === "/swipe" || req.path === "/matches") {
    return next();
  }
  try {
    const indexPath = path.join(distPath, "index.html");
    await fs.access(indexPath);
    res.sendFile(indexPath);
  } catch {
    next();
  }
});

// Centralized error handling
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || "Internal server error";

  if (status >= 500) {
    console.error("Server error:", err);
  }

  res.status(status).json({
    error: message,
    statusCode: status
  });
});

/**
 * Start HTTP server with fallback if default port is reserved by Windows Hyper-V/NAT
 */
export function startServer(port = TARGET_PORT) {
  const server = app.listen(port, () => {
    console.log(`Coy Discover API running at http://localhost:${port}`);
  });

  server.on("error", (err) => {
    if ((err.code === "EACCES" || err.code === "EADDRINUSE") && port === DEFAULT_PORT) {
      console.warn(`[Port Warning] Port ${DEFAULT_PORT} is unavailable (${err.code}). Trying fallback port ${FALLBACK_PORT}...`);
      startServer(FALLBACK_PORT);
    } else {
      console.error(`Failed to start server on port ${port}:`, err);
    }
  });

  return server;
}

// Auto-start when executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  startServer();
}

export default app;
