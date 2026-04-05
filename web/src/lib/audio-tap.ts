/**
 * Audio tap: mirror every connection-to-destination on AudioContexts
 * into a parallel MediaStreamAudioDestinationNode, so we can record
 * the actual audio output of third-party SDKs (like avatarkit) without
 * replaying the source ourselves.
 *
 * This guarantees perfect A/V sync when combined with canvas.captureStream:
 * both the canvas rendering and the audio playback come from the same
 * SDK AudioContext clock — no drift possible.
 *
 * MUST be installed BEFORE any AudioContext is created by the SDK.
 */

let installed = false;

// Tapped contexts, in creation order (first one is typically the SDK's).
const tapList: Array<{
  context: AudioContext;
  dest: MediaStreamAudioDestinationNode;
}> = [];

export function installAudioTap() {
  if (installed) return;
  installed = true;

  const origConnect = AudioNode.prototype.connect;

  AudioNode.prototype.connect = function (
    this: AudioNode,
    destination: AudioNode | AudioParam,
    ...rest: any[]
  ): any {
    // Delegate to original connection first so native behavior is preserved.
    // TS overloads for connect() are messy; cast to any.
    const result = (origConnect as any).apply(this, [destination, ...rest]);

    // If we just connected to this context's audio destination,
    // mirror the connection to our recording tap.
    if (destination === this.context.destination) {
      try {
        let entry = tapList.find((t) => t.context === this.context);
        if (!entry) {
          const ctx = this.context as AudioContext;
          const dest = ctx.createMediaStreamDestination();
          entry = { context: ctx, dest };
          tapList.push(entry);
          console.log(
            "[audio-tap] new tap created for AudioContext, sampleRate=",
            ctx.sampleRate,
          );
        }
        (origConnect as any).call(this, entry.dest);
      } catch (e) {
        console.warn("[audio-tap] failed to attach tap:", e);
      }
    }

    return result;
  };
}

/** Get the tap stream for a specific AudioContext, if tapped. */
export function getTapStreamFor(ctx: AudioContext): MediaStream | null {
  return tapList.find((t) => t.context === ctx)?.dest.stream ?? null;
}

/**
 * Get the first tap stream that has active audio tracks.
 * Useful when we don't hold a reference to the SDK's AudioContext.
 */
export function getFirstTapStream(): MediaStream | null {
  for (const entry of tapList) {
    const tracks = entry.dest.stream.getAudioTracks();
    if (tracks.length > 0) return entry.dest.stream;
  }
  return null;
}

/** For debugging / tests. */
export function _getTapCount(): number {
  return tapList.length;
}
