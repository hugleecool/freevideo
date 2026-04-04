const API_BASE = "/api";

export async function getSessionToken(): Promise<{
  sessionToken: string;
  app_id: string;
}> {
  const res = await fetch(`${API_BASE}/session-token`, { method: "POST" });
  if (!res.ok) throw new Error(`Session token failed: ${res.status}`);
  return res.json();
}

export async function fetchTTS(
  text: string,
  voice?: string,
): Promise<ArrayBuffer> {
  const res = await fetch(`${API_BASE}/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice, format: "pcm" }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || `TTS failed: ${res.status}`);
  }
  return res.arrayBuffer();
}
