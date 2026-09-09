import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import fs from "node:fs";
import path from "node:path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Backend API routes
app.use("/api", router);

// Serve static Expo web frontend (unified single-service deployment)
const candidateStaticDirs = [
  path.resolve(process.cwd(), "artifacts/posture-monitor/dist"),
  path.resolve(__dirname, "../../posture-monitor/dist"),
  path.resolve(__dirname, "../posture-monitor/dist"),
];

const staticDir = candidateStaticDirs.find((dir) => fs.existsSync(dir));

if (staticDir) {
  logger.info({ staticDir }, "Serving Expo web frontend");
  app.use(express.static(staticDir));

  // SPA fallback for client-side routing (Express 5 compatible)
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(staticDir, "index.html"));
    }
    next();
  });
} else {
  logger.warn("Expo web build (dist) not found. Run 'pnpm run build:web' to build the frontend.");
}

export default app;
