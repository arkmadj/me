import { useCallback, useRef } from 'react';

/**
 * Hook for playing simple game sounds using Web Audio API
 */
export const useSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context on first use
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  /**
   * Play a bat hit sound effect
   */
  const playBatHit = useCallback(() => {
    const audioContext = getAudioContext();
    const currentTime = audioContext.currentTime;

    // Create oscillator for the main tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure the sound - a short, sharp "ping" sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, currentTime + 0.05);

    // Volume envelope - quick attack and decay
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.1);

    // Play the sound
    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.1);
  }, [getAudioContext]);

  return {
    playBatHit,
  };
};
