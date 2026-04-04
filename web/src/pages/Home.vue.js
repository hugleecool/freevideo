import { ref, computed, onMounted } from "vue";
import { useAvatar } from "@/composables/useAvatar";
import { useRecorder } from "@/composables/useRecorder";
import { getSessionToken, fetchTTS } from "@/lib/api";
import { VOICES, AVATARS } from "@/lib/voices";
const containerRef = ref(null);
const textInput = ref("");
const selectedVoice = ref(VOICES[0].id);
const selectedAvatar = ref(AVATARS[0].id);
const charCount = computed(() => textInput.value.length);
const maxChars = 500;
const stage = ref("idle");
const stageMsg = ref("");
const errorMsg = ref("");
const progress = ref(0);
const resultBlob = ref(null);
const avatar = useAvatar(containerRef);
const recorder = useRecorder();
const estimatedDuration = computed(() => {
    const words = textInput.value.trim().split(/\s+/).length;
    const chars = textInput.value.length;
    // rough: ~150 words/min EN, ~4 chars/sec ZH
    const secs = Math.max(words / 2.5, chars / 4);
    return Math.ceil(secs);
});
// Init SDK + load default avatar on mount
onMounted(async () => {
    stage.value = "loading";
    stageMsg.value = "Initializing...";
    try {
        const { sessionToken, app_id } = await getSessionToken();
        await avatar.initialize(app_id, sessionToken);
        await avatar.loadAvatar(selectedAvatar.value);
        stage.value = "ready";
        stageMsg.value = "";
    }
    catch (e) {
        stage.value = "error";
        errorMsg.value = e instanceof Error ? e.message : String(e);
    }
});
async function switchAvatar(avatarId) {
    selectedAvatar.value = avatarId;
    avatar.cleanup();
    stage.value = "loading";
    stageMsg.value = "Switching avatar...";
    try {
        const { sessionToken, app_id } = await getSessionToken();
        await avatar.initialize(app_id, sessionToken);
        await avatar.loadAvatar(avatarId);
        stage.value = "ready";
        stageMsg.value = "";
    }
    catch (e) {
        stage.value = "error";
        errorMsg.value = e instanceof Error ? e.message : String(e);
    }
}
// Main generate flow — MUST be called from real click handler
async function generate() {
    const text = textInput.value.trim();
    if (!text || text.length > maxChars)
        return;
    if (stage.value !== "ready")
        return;
    resultBlob.value = null;
    errorMsg.value = "";
    try {
        // 1. Connect (needs user gesture for AudioContext)
        stage.value = "tts";
        stageMsg.value = "Connecting to avatar...";
        await avatar.startConnection();
        // 2. TTS
        stageMsg.value = "Generating speech...";
        progress.value = 0;
        const pcmBuffer = await fetchTTS(text, selectedVoice.value);
        const pcmData = new Int16Array(pcmBuffer);
        const durationSec = pcmData.length / 16000;
        // 3. Record video + audio in sync (recorder also sends chunks to SDK)
        stage.value = "speaking";
        stageMsg.value = `Avatar speaking (${durationSec.toFixed(1)}s)...`;
        const canvas = avatar.getCanvas();
        if (!canvas)
            throw new Error("Canvas not found");
        const blob = await recorder.startRecording(canvas, pcmData, 16000, (chunk, isEnd) => avatar.sendAudio(chunk, isEnd));
        stage.value = "done";
        stageMsg.value = `Video ready! (${(blob.size / 1024).toFixed(0)} KB)`;
        resultBlob.value = blob;
    }
    catch (e) {
        stage.value = "error";
        errorMsg.value = e instanceof Error ? e.message : String(e);
    }
}
function download() {
    if (!resultBlob.value)
        return;
    recorder.downloadBlob(resultBlob.value, "freevideo.webm");
}
function reset() {
    stage.value = "ready";
    stageMsg.value = "";
    errorMsg.value = "";
    resultBlob.value = null;
    progress.value = 0;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "min-h-screen bg-gray-950 text-white" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "border-b border-gray-800 px-6 py-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "max-w-5xl mx-auto flex items-center justify-between" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "text-xl font-bold" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "text-xs text-gray-500" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "max-w-5xl mx-auto px-6 py-8" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "grid grid-cols-1 lg:grid-cols-2 gap-8" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "space-y-6" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "block text-sm font-medium text-gray-300 mb-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.textarea)({
    value: (__VLS_ctx.textInput),
    rows: "5",
    maxlength: (__VLS_ctx.maxChars),
    placeholder: "Type what you want the avatar to say...",
    ...{ class: "w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none" },
    disabled: (__VLS_ctx.stage !== 'ready' && __VLS_ctx.stage !== 'idle' && __VLS_ctx.stage !== 'done' && __VLS_ctx.stage !== 'error'),
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex justify-between mt-1 text-xs text-gray-500" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
(__VLS_ctx.charCount);
(__VLS_ctx.maxChars);
if (__VLS_ctx.textInput.trim()) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.estimatedDuration);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "block text-sm font-medium text-gray-300 mb-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
    value: (__VLS_ctx.selectedVoice),
    ...{ class: "w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" },
});
for (const [v] of __VLS_getVForSourceType((__VLS_ctx.VOICES))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
        key: (v.id),
        value: (v.id),
    });
    (v.langLabel);
    (v.name);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
    ...{ class: "block text-sm font-medium text-gray-300 mb-2" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "flex gap-2 flex-wrap" },
});
for (const [a] of __VLS_getVForSourceType((__VLS_ctx.AVATARS))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.switchAvatar(a.id);
            } },
        key: (a.id),
        ...{ class: ([
                'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                __VLS_ctx.selectedAvatar === a.id
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500',
            ]) },
    });
    (a.name);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.stage === 'done' ? __VLS_ctx.reset() : __VLS_ctx.generate();
        } },
    disabled: ((!__VLS_ctx.textInput.trim() || __VLS_ctx.charCount > __VLS_ctx.maxChars) && __VLS_ctx.stage !== 'done'),
    ...{ class: ([
            'w-full py-3 rounded-lg font-semibold text-lg transition-colors',
            __VLS_ctx.stage === 'done'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed',
        ]) },
});
if (__VLS_ctx.stage === 'done') {
}
else if (__VLS_ctx.stage === 'ready' || __VLS_ctx.stage === 'idle' || __VLS_ctx.stage === 'error') {
}
else {
    (__VLS_ctx.stageMsg);
}
if (__VLS_ctx.stage === 'speaking') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "w-full bg-gray-800 rounded-full h-2" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
        ...{ class: "bg-blue-500 h-2 rounded-full transition-all duration-200" },
        ...{ style: ({ width: `${Math.round(__VLS_ctx.progress * 100)}%` }) },
    });
}
if (__VLS_ctx.resultBlob) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.download) },
        ...{ class: "w-full py-3 rounded-lg font-semibold text-lg bg-purple-600 hover:bg-purple-700 text-white" },
    });
    ((__VLS_ctx.resultBlob.size / 1024).toFixed(0));
}
if (__VLS_ctx.errorMsg) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bg-red-900/30 border border-red-800 rounded-lg p-3 text-sm text-red-300" },
    });
    (__VLS_ctx.errorMsg);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.reset) },
        ...{ class: "ml-2 underline" },
    });
}
if (__VLS_ctx.stage === 'speaking' || __VLS_ctx.stage === 'recording' || __VLS_ctx.stage === 'encoding') {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "text-xs text-yellow-400" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div)({
    ref: "containerRef",
    ...{ class: "w-full aspect-square bg-gray-900 rounded-xl border border-gray-800 overflow-hidden" },
});
/** @type {typeof __VLS_ctx.containerRef} */ ;
if (__VLS_ctx.avatar.loading.value) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "mt-2 text-center text-sm text-gray-400" },
    });
    (Math.round(__VLS_ctx.avatar.loadProgress.value));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "mt-16 border-t border-gray-800 pt-12 max-w-3xl mx-auto" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
    ...{ class: "text-2xl font-bold mb-6" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "prose prose-invert prose-sm text-gray-400 space-y-4" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "text-lg font-semibold text-gray-200" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ol, __VLS_intrinsicElements.ol)({
    ...{ class: "list-decimal list-inside space-y-1" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
    ...{ class: "text-lg font-semibold text-gray-200" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.ul, __VLS_intrinsicElements.ul)({
    ...{ class: "list-disc list-inside space-y-1" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "mt-8 text-sm text-gray-600" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
    href: "https://spatialreal.ai",
    ...{ class: "text-blue-400 hover:underline" },
    target: "_blank",
    rel: "noreferrer",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
    href: "https://fish.audio",
    ...{ class: "text-blue-400 hover:underline" },
    target: "_blank",
    rel: "noreferrer",
});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-950']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['py-4']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-5xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-5xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['py-8']} */ ;
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-6']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['resize-none']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:border-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-300']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-500']} */ ;
/** @type {__VLS_StyleScopedClasses['h-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-all']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-purple-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-purple-700']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-red-900/30']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-red-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-300']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['underline']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-yellow-400']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['aspect-square']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-16']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-12']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['prose']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-invert']} */ ;
/** @type {__VLS_StyleScopedClasses['prose-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['list-decimal']} */ ;
/** @type {__VLS_StyleScopedClasses['list-inside']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['list-disc']} */ ;
/** @type {__VLS_StyleScopedClasses['list-inside']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-8']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-400']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:underline']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-400']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:underline']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            VOICES: VOICES,
            AVATARS: AVATARS,
            containerRef: containerRef,
            textInput: textInput,
            selectedVoice: selectedVoice,
            selectedAvatar: selectedAvatar,
            charCount: charCount,
            maxChars: maxChars,
            stage: stage,
            stageMsg: stageMsg,
            errorMsg: errorMsg,
            progress: progress,
            resultBlob: resultBlob,
            avatar: avatar,
            estimatedDuration: estimatedDuration,
            switchAvatar: switchAvatar,
            generate: generate,
            download: download,
            reset: reset,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
