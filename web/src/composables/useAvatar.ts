import { ref, onUnmounted, type Ref } from "vue";
import {
  AvatarSDK,
  AvatarManager,
  AvatarView,
  type AvatarController,
  type ConnectionState,
  type ConversationState,
  Environment,
  DrivingServiceMode,
} from "@spatialwalk/avatarkit";
import { installAudioTap } from "@/lib/audio-tap";

export function useAvatar(containerRef: Ref<HTMLElement | null>) {
  const view = ref<AvatarView | null>(null);
  const controller = ref<AvatarController | null>(null);
  const connectionState = ref<ConnectionState>("disconnected" as ConnectionState);
  const conversationState = ref<ConversationState>("idle" as ConversationState);
  const loading = ref(false);
  const loadProgress = ref(0);
  const error = ref<string | null>(null);
  const ready = ref(false);

  async function initialize(appId: string, sessionToken: string) {
    // Install the AudioContext tap BEFORE the SDK creates its context,
    // so we can capture the SDK's audio output for video recording with
    // perfect A/V sync (no separate PCM playback needed).
    installAudioTap();

    await AvatarSDK.initialize(appId, {
      environment: Environment.intl,
      drivingServiceMode: DrivingServiceMode.sdk,
      audioFormat: { channelCount: 1, sampleRate: 16000 },
    });
    AvatarSDK.setSessionToken(sessionToken);
  }

  async function loadAvatar(characterId: string) {
    if (!containerRef.value) {
      error.value = "Container not mounted";
      return;
    }

    loading.value = true;
    loadProgress.value = 0;
    error.value = null;
    // Fresh controller means fresh connection state
    connectionState.value = "disconnected" as ConnectionState;
    conversationState.value = "idle" as ConversationState;
    ready.value = false;

    try {
      const avatar = await AvatarManager.shared.load(characterId, (info) => {
        loadProgress.value = info.progress ?? 0;
      });

      const avatarView = new AvatarView(avatar, containerRef.value);

      avatarView.controller.onConnectionState = (state: ConnectionState) => {
        console.log("[useAvatar] connectionState changed:", state);
        connectionState.value = state;
        if (state === "connected") ready.value = true;
      };
      avatarView.controller.onConversationState = (state: ConversationState) => {
        conversationState.value = state;
      };
      avatarView.controller.onError = (err: Error) => {
        console.error("[useAvatar] SDK error:", err.message, err);
        error.value = err.message;
      };

      view.value = avatarView;
      controller.value = avatarView.controller;
      loading.value = false;
    } catch (e: unknown) {
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
    if (!controller.value) throw new Error("No controller");

    // Initialize AudioContext first (requires user gesture)
    await (controller.value as any).initializeAudioContext();

    // If already connected, nothing to do
    if (connectionState.value === ("connected" as ConnectionState)) {
      return;
    }

    console.log("[useAvatar] Starting WebSocket connection...");
    console.log("[useAvatar] Current origin:", window.location.origin);
    console.log("[useAvatar] SDK environment config:", (AvatarSDK as any).getEnvironmentConfig?.());

    // Start the WebSocket connection
    await controller.value.start();

    console.log("[useAvatar] controller.start() resolved, connectionState:", connectionState.value);

    // CRITICAL: Wait for connectionState to reach "connected" before returning.
    // controller.start() initiates the connection but does NOT wait for the
    // WebSocket handshake to complete. Sending audio before "connected" state
    // causes the SDK to silently drop all data -> avatar never moves.
    if (connectionState.value !== ("connected" as ConnectionState)) {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error("[useAvatar] Connection timeout! Final connectionState:", connectionState.value);
          reject(new Error("Avatar connection failed. Please check your SpatialReal account credits and try again."));
        }, 10_000);

        // The onConnectionState callback is already set up in loadAvatar.
        // We wrap it to also detect when we reach "connected".
        const originalCallback = controller.value!.onConnectionState;
        controller.value!.onConnectionState = (state: ConnectionState) => {
          console.log("[useAvatar] connectionState during wait:", state);
          // Forward to original handler (updates reactive refs)
          originalCallback?.(state);

          if (state === ("connected" as ConnectionState)) {
            clearTimeout(timeout);
            // Restore original callback
            controller.value!.onConnectionState = originalCallback;
            resolve();
          } else if (state === ("failed" as ConnectionState)) {
            clearTimeout(timeout);
            controller.value!.onConnectionState = originalCallback;
            reject(new Error("SDK connection failed"));
          }
        };
      });
    }
  }

  function sendAudio(data: ArrayBuffer, isEnd: boolean) {
    controller.value?.send(data, isEnd);
  }

  /** Reset the SDK's current utterance state. Required before sending new audio
   *  after a previous `send(_, true)` has been received. */
  function interrupt() {
    controller.value?.interrupt();
  }

  /**
   * Wait until the SDK's conversation state reaches "playing" — i.e. it
   * has received + processed audio and is actively animating + playing
   * it back. This is the moment to start recording for perfect A/V sync.
   */
  function waitForPlaying(timeoutMs = 5000): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (conversationState.value === ("playing" as ConversationState)) {
        resolve();
        return;
      }
      const ctrl = controller.value;
      if (!ctrl) {
        reject(new Error("No controller"));
        return;
      }
      const timeout = setTimeout(() => {
        ctrl.onConversationState = originalCallback;
        reject(new Error("Timeout waiting for playing state"));
      }, timeoutMs);

      const originalCallback = ctrl.onConversationState;
      ctrl.onConversationState = (state: ConversationState) => {
        originalCallback?.(state);
        if (state === ("playing" as ConversationState)) {
          clearTimeout(timeout);
          ctrl.onConversationState = originalCallback;
          resolve();
        }
      };
    });
  }

  function sendAudioChunks(
    pcmBuffer: ArrayBuffer,
    onProgress?: (pct: number) => void,
  ): Promise<void> {
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

  function getCanvas(): HTMLCanvasElement | null {
    if (!containerRef.value) return null;
    return containerRef.value.querySelector("canvas");
  }

  function cleanup() {
    if (view.value) {
      view.value.controller.close();
      view.value.dispose();
      view.value = null;
      controller.value = null;
      ready.value = false;
      // Reset connection state so the next controller's startConnection()
      // actually calls start() instead of skipping because the stale value
      // still says "connected".
      connectionState.value = "disconnected" as ConnectionState;
      conversationState.value = "idle" as ConversationState;
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
    interrupt,
    waitForPlaying,
    sendAudioChunks,
    getCanvas,
    cleanup,
  };
}
