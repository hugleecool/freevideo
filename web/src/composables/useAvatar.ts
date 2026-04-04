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

export function useAvatar(containerRef: Ref<HTMLElement | null>) {
  const view = ref<AvatarView | null>(null);
  const controller = ref<AvatarController | null>(null);
  const connectionState = ref<ConnectionState>("disconnected");
  const conversationState = ref<ConversationState>("idle");
  const loading = ref(false);
  const loadProgress = ref(0);
  const error = ref<string | null>(null);
  const ready = ref(false);

  async function initialize(appId: string, sessionToken: string) {
    await AvatarSDK.initialize(appId, {
      environment: Environment.intl,
      drivingServiceMode: DrivingServiceMode.sdk,
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

    try {
      const avatar = await AvatarManager.shared.load(characterId, (info) => {
        loadProgress.value = info.progress ?? 0;
      });

      const avatarView = new AvatarView(avatar, containerRef.value);

      avatarView.controller.onConnectionState = (state: ConnectionState) => {
        connectionState.value = state;
        if (state === "connected") ready.value = true;
      };
      avatarView.controller.onConversationState = (state: ConversationState) => {
        conversationState.value = state;
      };
      avatarView.controller.onError = (err: Error) => {
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

  // MUST be called inside a real user click handler (autoplay policy)
  async function startConnection() {
    if (!controller.value) throw new Error("No controller");
    await (controller.value as any).initializeAudioContext();
    await controller.value.start();
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
    sendAudioChunks,
    getCanvas,
    cleanup,
  };
}
