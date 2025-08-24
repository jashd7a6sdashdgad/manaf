'use client';

import { useEffect, useRef } from 'react';

interface SoundEffectsProps {
  onMessageSent?: boolean;
  onMessageReceived?: boolean;
}

export function SoundEffects({ onMessageSent, onMessageReceived }: SoundEffectsProps) {
  const sendSoundRef = useRef<HTMLAudioElement | null>(null);
  const receiveSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio elements with data URLs for subtle sounds
    if (typeof window !== 'undefined') {
      // Subtle click sound for sending
      sendSoundRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUeBDuV2e/CdSUGK4DM7tOGOAYghN7yxnkpBSR+yPLZgjEGFYLF8N2QQAoUXrTp66hVFApGn+DyvmUeBDuV2e/CdSUGK4DM7tOGOAYgg');
      
      // Subtle notification sound for receiving
      receiveSoundRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBziR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUeBDuV2e/CdSUGK4DM7tOGOAYgg');
      
      // Set volume to be subtle
      if (sendSoundRef.current) sendSoundRef.current.volume = 0.3;
      if (receiveSoundRef.current) receiveSoundRef.current.volume = 0.3;
    }
  }, []);

  useEffect(() => {
    if (onMessageSent && sendSoundRef.current) {
      sendSoundRef.current.play().catch(() => {
        // Silently fail if audio can't play
      });
    }
  }, [onMessageSent]);

  useEffect(() => {
    if (onMessageReceived && receiveSoundRef.current) {
      receiveSoundRef.current.play().catch(() => {
        // Silently fail if audio can't play
      });
    }
  }, [onMessageReceived]);

  return null;
}