/* 壁炉通话 · module 入口：把 VoiceCall 挂到 window */
import { VoiceCall } from './voice-call.js';
window.VoiceCall = VoiceCall;
console.log('[voice] VoiceCall loaded');
