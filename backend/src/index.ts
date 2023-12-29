import { Hono } from "hono";
import { cors } from "hono/cors";
import { checkCookieMiddleware } from "./middlewares/cookie";
import actions from "./routes/api/v1/actions";
import auth from "./routes/api/v1/auth";
import leaderboard from "./routes/api/v1/leaderboard";
import missions from "./routes/api/v1/missions";
import profile from "./routes/api/v1/profile";
import rewards from "./routes/api/v1/rewards";
import { checkEnv } from "./utils/errors";

try {
  checkEnv();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const app = new Hono().basePath("/api/v1");

app.use(
  "/profile/*",
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  }),
  checkCookieMiddleware
);

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.get("/ping", (c) => c.text("👋"));

app.route("/auth", auth);
app.route("/rewards", rewards);
app.route("/profile", profile);
app.route("/missions", missions);
app.route("/actions", actions);
app.route("/leaderboard", leaderboard);

export default {
  port: 8080,
  fetch: app.fetch,
};
