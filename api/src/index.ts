import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  SPATIALREAL_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("/api/*", cors());

app.get("/api/health", (c) => {
  return c.json({ ok: true });
});

export default app;
