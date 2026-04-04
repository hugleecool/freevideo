import { Hono } from "hono";
import { cors } from "hono/cors";
import { sessionRoute } from "./routes/session";
import { ttsRoute } from "./routes/tts";
import { voicesRoute } from "./routes/voices";

export type Bindings = {
  SPATIALREAL_API_KEY: string;
  SPATIALREAL_APP_ID: string;
  FISH_AUDIO_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("/api/*", cors());

app.get("/api/health", (c) => c.json({ ok: true }));
app.route("/api", sessionRoute);
app.route("/api", ttsRoute);
app.route("/api", voicesRoute);

export default app;
