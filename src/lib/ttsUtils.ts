'use client';

interface TTSOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

class TTSUtils {
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isEnabled: boolean = false;
  private defaultOptions: TTSOptions = {
    voice: undefined,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0
  };

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.isEnabled = true;
    }
  }

  isSupported(): boolean {
    return this.isEnabled && this.synthesis !== null;
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis.getVoices();
  }

  speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis || !this.isEnabled) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Stop any current speech
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      const finalOptions = { ...this.defaultOptions, ...options };

      // Set properties
      utterance.rate = finalOptions.rate!;
      utterance.pitch = finalOptions.pitch!;
      utterance.volume = finalOptions.volume!;

      // Set voice if specified
      if (finalOptions.voice) {
        const voices = this.getVoices();
        const selectedVoice = voices.find(voice => voice.name === finalOptions.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // Event handlers
      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.currentUtterance = utterance;
      this.synthesis.speak(utterance);
    });
  }

  stop(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  pause(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  resume(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  isPaused(): boolean {
    return this.synthesis ? this.synthesis.paused : false;
  }
}

// Create a singleton instance
export const ttsUtils = new TTSUtils();

// Hook for managing TTS state
export function useTTS() {
  const speak = (text: string, options?: TTSOptions) => ttsUtils.speak(text, options);
  const stop = () => ttsUtils.stop();
  const pause = () => ttsUtils.pause();
  const resume = () => ttsUtils.resume();
  const isSpeaking = () => ttsUtils.isSpeaking();
  const isPaused = () => ttsUtils.isPaused();
  const isSupported = () => ttsUtils.isSupported();
  const getVoices = () => ttsUtils.getVoices();

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isSupported,
    getVoices
  };
}
