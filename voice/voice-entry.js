/* 壁炉通话 · module 入口：把 VoiceCall 挂到 window，通知 voice.js */
import { VoiceCall } from './voice-call.js';
window.VoiceCall = VoiceCall;
window.dispatchEvent(new CustomEvent('voice-ready', { detail: { ok: true } }));
console.log('[voice] VoiceCall loaded');