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

  /**
   * Play a character hit sound effect
   */
  const playCharacterHit = useCallback(() => {
    const audioContext = getAudioContext();
    const currentTime = audioContext.currentTime;

    // Create oscillator for a more "bouncy" sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure the sound - a bouncy "boing" sound with lower pitch
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(300, currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(150, currentTime + 0.08);

    // Volume envelope - slightly longer with a bounce feel
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.25, currentTime + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);

    // Play the sound
    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.15);
  }, [getAudioContext]);

  /**
   * Play a ball miss sound effect (when ball hits bottom)
   */
  const playBallMiss = useCallback(() => {
    const audioContext = getAudioContext();
    const currentTime = audioContext.currentTime;

    // Create oscillator for a "sad" descending sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure the sound - a descending "whomp" sound
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, currentTime + 0.2);

    // Volume envelope - longer with a fade out
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.35, currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.25);

    // Play the sound
    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.25);
  }, [getAudioContext]);

  /**
   * Play a character land on bat sound effect
   */
  const playCharacterLand = useCallback(() => {
    const audioContext = getAudioContext();
    const currentTime = audioContext.currentTime;

    // Create oscillator for a soft landing sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure the sound - a gentle ascending chime
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(400, currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, currentTime + 0.06);

    // Volume envelope - soft and quick
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.12);

    // Play the sound
    oscillator.start(currentTime);
    oscillator.stop(currentTime + 0.12);
  }, [getAudioContext]);

  return {
    playBatHit,
    playCharacterHit,
    playBallMiss,
    playCharacterLand,
  };
};
