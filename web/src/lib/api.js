const API_BASE = import.meta.env.DEV
    ? "/api"
    : "https://freevideo-api.hugleecool.workers.dev/api";
async function fetchWithRetry(url, init, retries = 2) {
    for (let i = 0; i <= retries; i++) {
        try {
            const res = await fetch(url, init);
            if (res.ok || i === retries)
                return res;
        }
        catch (e) {
            if (i === retries)
                throw e;
        }
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
    throw new Error("Unreachable");
}
export async function getSessionToken() {
    const res = await fetchWithRetry(`${API_BASE}/session-token`, {
        method: "POST",
    });
    if (!res.ok)
        throw new Error(`Session token failed: ${res.status}`);
    return res.json();
}
export async function fetchTTS(text, voice) {
    const res = await fetchWithRetry(`${API_BASE}/tts`, {
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
