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

  /**
   * Play a game over sound effect
   */
  const playGameOver = useCallback(() => {
    const audioContext = getAudioContext();
    const currentTime = audioContext.currentTime;

    // Create three oscillators for a dramatic descending chord
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const osc3 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    osc3.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure the sounds - dramatic descending minor chord
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc3.type = 'sine';

    // Three note descending progression (minor chord feel)
    osc1.frequency.setValueAtTime(440, currentTime); // A
    osc1.frequency.exponentialRampToValueAtTime(220, currentTime + 0.5);

    osc2.frequency.setValueAtTime(349.23, currentTime + 0.1); // F
    osc2.frequency.exponentialRampToValueAtTime(174.61, currentTime + 0.6);

    osc3.frequency.setValueAtTime(261.63, currentTime + 0.2); // C
    osc3.frequency.exponentialRampToValueAtTime(130.81, currentTime + 0.7);

    // Volume envelope - dramatic with sustain
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0.25, currentTime + 0.4);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.8);

    // Play the sounds
    osc1.start(currentTime);
    osc2.start(currentTime + 0.1);
    osc3.start(currentTime + 0.2);

    osc1.stop(currentTime + 0.8);
    osc2.stop(currentTime + 0.8);
    osc3.stop(currentTime + 0.8);
  }, [getAudioContext]);

  /**
   * Play a victory sound effect (when game is won)
   */
  const playVictory = useCallback(() => {
    const audioContext = getAudioContext();
    const currentTime = audioContext.currentTime;

    // Create multiple oscillators for a triumphant ascending fanfare
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const osc3 = audioContext.createOscillator();
    const osc4 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    osc3.connect(gainNode);
    osc4.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure the sounds - triumphant ascending major chord progression
    osc1.type = 'triangle';
    osc2.type = 'triangle';
    osc3.type = 'triangle';
    osc4.type = 'sine';

    // Victory fanfare: C major arpeggio going up
    osc1.frequency.setValueAtTime(261.63, currentTime); // C4
    osc1.frequency.setValueAtTime(523.25, currentTime + 0.15); // C5

    osc2.frequency.setValueAtTime(329.63, currentTime + 0.1); // E4
    osc2.frequency.setValueAtTime(659.25, currentTime + 0.25); // E5

    osc3.frequency.setValueAtTime(392.00, currentTime + 0.2); // G4
    osc3.frequency.setValueAtTime(784.00, currentTime + 0.35); // G5

    osc4.frequency.setValueAtTime(523.25, currentTime + 0.3); // C5
    osc4.frequency.setValueAtTime(1046.50, currentTime + 0.45); // C6

    // Volume envelope - bright and celebratory
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.35, currentTime + 0.02);
    gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 1.0);

    // Play the sounds in sequence
    osc1.start(currentTime);
    osc2.start(currentTime + 0.1);
    osc3.start(currentTime + 0.2);
    osc4.start(currentTime + 0.3);

    osc1.stop(currentTime + 1.0);
    osc2.stop(currentTime + 1.0);
    osc3.stop(currentTime + 1.0);
    osc4.stop(currentTime + 1.0);
  }, [getAudioContext]);

  return {
    playBatHit,
    playCharacterHit,
    playBallMiss,
    playCharacterLand,
    playGameOver,
    playVictory,
  };
};
