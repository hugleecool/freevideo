import { ref, onMounted, onUnmounted, type Ref } from "vue";
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

  async function start() {
    if (!controller.value) return;
    await (controller.value as any).initializeAudioContext();
    await controller.value.start();
  }

  function sendAudio(pcmData: ArrayBuffer, isEnd: boolean) {
    controller.value?.send(pcmData, isEnd);
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
    initialize,
    loadAvatar,
    start,
    sendAudio,
    getCanvas,
    cleanup,
  };
}
