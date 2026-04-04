import { Hono } from "hono";
import type { Bindings } from "../index";

export const sessionRoute = new Hono<{ Bindings: Bindings }>();

sessionRoute.post("/session-token", async (c) => {
  const apiKey = c.env.SPATIALREAL_API_KEY;
  if (!apiKey) {
    return c.json({ error: "SPATIALREAL_API_KEY not configured" }, 500);
  }

  const res = await fetch(
    "https://console.us-west.spatialwalk.cloud/v1/console/session-tokens",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    },
  );

  if (!res.ok) {
    return c.json({ error: "Failed to get session token" }, res.status);
  }

  const data = await res.json();
  return c.json(data);
});
