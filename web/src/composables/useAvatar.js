import { ref, onUnmounted } from "vue";
import { AvatarSDK, AvatarManager, AvatarView, Environment, DrivingServiceMode, } from "@spatialwalk/avatarkit";
export function useAvatar(containerRef) {
    const view = ref(null);
    const controller = ref(null);
    const connectionState = ref("disconnected");
    const conversationState = ref("idle");
    const loading = ref(false);
    const loadProgress = ref(0);
    const error = ref(null);
    const ready = ref(false);
    async function initialize(appId, sessionToken) {
        await AvatarSDK.initialize(appId, {
            environment: Environment.intl,
            drivingServiceMode: DrivingServiceMode.sdk,
            audioFormat: { channelCount: 1, sampleRate: 16000 },
        });
        AvatarSDK.setSessionToken(sessionToken);
    }
    async function loadAvatar(characterId) {
        if (!containerRef.value) {
            error.value = "Container not mounted";
            return;
        }
        loading.value = true;
        loadProgress.value = 0;
        error.value = null;
        try {
            const avatar = await AvatarManager.shared.load(characterId, (info) => {
                loadProgress.value = info.progress ?? 0;
            });
            const avatarView = new AvatarView(avatar, containerRef.value);
            avatarView.controller.onConnectionState = (state) => {
                console.log("[useAvatar] connectionState changed:", state);
                connectionState.value = state;
                if (state === "connected")
                    ready.value = true;
            };
            avatarView.controller.onConversationState = (state) => {
                conversationState.value = state;
            };
            avatarView.controller.onError = (err) => {
                console.error("[useAvatar] SDK error:", err.message, err);
                error.value = err.message;
            };
            view.value = avatarView;
            controller.value = avatarView.controller;
            loading.value = false;
        }
        catch (e) {
            error.value = e instanceof Error ? e.message : String(e);
            loading.value = false;
        }
    }
    /**
     * Start WebSocket connection to the SDK driving service.
     * MUST be called inside a real user click handler (autoplay policy for AudioContext).
     * Resolves only when connectionState becomes "connected".
     */
    async function startConnection() {
        if (!controller.value)
            throw new Error("No controller");
        // Initialize AudioContext first (requires user gesture)
        await controller.value.initializeAudioContext();
        // If already connected, nothing to do
        if (connectionState.value === "connected") {
            return;
        }
        console.log("[useAvatar] Starting WebSocket connection...");
        console.log("[useAvatar] Current origin:", window.location.origin);
        console.log("[useAvatar] SDK environment config:", AvatarSDK.getEnvironmentConfig?.());
        // Start the WebSocket connection
        await controller.value.start();
        console.log("[useAvatar] controller.start() resolved, connectionState:", connectionState.value);
        // CRITICAL: Wait for connectionState to reach "connected" before returning.
        // controller.start() initiates the connection but does NOT wait for the
        // WebSocket handshake to complete. Sending audio before "connected" state
        // causes the SDK to silently drop all data -> avatar never moves.
        if (connectionState.value !== "connected") {
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    console.error("[useAvatar] Connection timeout! Final connectionState:", connectionState.value);
                    reject(new Error("Avatar connection failed. Please check your SpatialReal account credits and try again."));
                }, 10_000);
                // The onConnectionState callback is already set up in loadAvatar.
                // We wrap it to also detect when we reach "connected".
                const originalCallback = controller.value.onConnectionState;
                controller.value.onConnectionState = (state) => {
                    console.log("[useAvatar] connectionState during wait:", state);
                    // Forward to original handler (updates reactive refs)
                    originalCallback?.(state);
                    if (state === "connected") {
                        clearTimeout(timeout);
                        // Restore original callback
                        controller.value.onConnectionState = originalCallback;
                        resolve();
                    }
                    else if (state === "failed") {
                        clearTimeout(timeout);
                        controller.value.onConnectionState = originalCallback;
                        reject(new Error("SDK connection failed"));
                    }
                };
            });
        }
    }
    function sendAudio(data, isEnd) {
        controller.value?.send(data, isEnd);
    }
    function sendAudioChunks(pcmBuffer, onProgress) {
        return new Promise((resolve) => {
            const bytes = new Uint8Array(pcmBuffer);
            const CHUNK = 32000;
            const INTERVAL = 80;
            let offset = 0;
            const next = () => {
                if (offset >= bytes.length) {
                    controller.value?.send(new ArrayBuffer(0), true);
                    resolve();
                    return;
                }
                const end = Math.min(offset + CHUNK, bytes.length);
                controller.value?.send(bytes.slice(offset, end).buffer, false);
                offset = end;
                onProgress?.(offset / bytes.length);
                setTimeout(next, INTERVAL);
            };
            next();
        });
    }
    function getCanvas() {
        if (!containerRef.value)
            return null;
        return containerRef.value.querySelector("canvas");
    }
    function cleanup() {
        if (view.value) {
            view.value.controller.close();
            view.value.dispose();
            view.value = null;
            controller.value = null;
            ready.value = false;
        }
    }
    onUnmounted(cleanup);
    return {
        view,
        controller,
        connectionState,
        conversationState,
        loading,
        loadProgress,
        error,
        ready,
        initialize,
        loadAvatar,
        startConnection,
        sendAudio,
        sendAudioChunks,
        getCanvas,
        cleanup,
    };
}
