const audioCtx = new (window.AudioContext ||
  (window as TSAny).webkitAudioContext)();

/**
 * Creates and plays a mechanical switch-like click sound
 *
 * This version simulates a more mechanical keyboard-like click
 * with both a "down" and subtle "up" component
 */
export function playClickSound(): void {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;

  // === Create master gain for overall volume control ===
  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.5, now);
  masterGain.connect(audioCtx.destination);

  // === Component 1: Click Down ===
  // Create buffer for the "down click" (shorter, sharper)
  const downBufferSize = audioCtx.sampleRate * 0.03; // 30ms
  const downBuffer = audioCtx.createBuffer(
    1,
    downBufferSize,
    audioCtx.sampleRate,
  );
  const downData = downBuffer.getChannelData(0);

  // Generate a sharper attack for down click
  for (let i = 0; i < downBufferSize; i++) {
    const progress = i / downBufferSize;
    // Sharper initial attack followed by quick decay
    const envelope = progress < 0.1 ? 1 : Math.exp(-15 * progress);
    downData[i] = (Math.random() * 2 - 1) * envelope;
  }

  const downSource = audioCtx.createBufferSource();
  downSource.buffer = downBuffer;

  // Down click filter - gives it a specific "color"
  const downFilter = audioCtx.createBiquadFilter();
  downFilter.type = "bandpass";
  downFilter.frequency.value = 2500;
  downFilter.Q.value = 1.0;

  const downGain = audioCtx.createGain();
  downGain.gain.setValueAtTime(0.4, now);

  downSource.connect(downFilter).connect(downGain).connect(masterGain);

  // === Component 2: Resonance tone (gives it body) ===
  const resonance = audioCtx.createOscillator();
  resonance.type = "sine";
  resonance.frequency.setValueAtTime(180, now);
  resonance.frequency.exponentialRampToValueAtTime(100, now + 0.04);

  const resonanceGain = audioCtx.createGain();
  resonanceGain.gain.setValueAtTime(0.15, now);
  resonanceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  resonance.connect(resonanceGain).connect(masterGain);

  // === Component 3: Click Up (subtle release click) ===
  // Create buffer for the "up click" (more subtle)
  const upBufferSize = audioCtx.sampleRate * 0.02; // 20ms
  const upBuffer = audioCtx.createBuffer(1, upBufferSize, audioCtx.sampleRate);
  const upData = upBuffer.getChannelData(0);

  // Generate a softer attack for up click
  for (let i = 0; i < upBufferSize; i++) {
    const progress = i / upBufferSize;
    // Softer initial attack and gentler decay
    const envelope = progress < 0.2 ? progress * 5 : Math.exp(-10 * progress);
    upData[i] = (Math.random() * 2 - 1) * envelope * 0.7;
  }

  const upSource = audioCtx.createBufferSource();
  upSource.buffer = upBuffer;

  // Up click filter - usually higher pitched than down click
  const upFilter = audioCtx.createBiquadFilter();
  upFilter.type = "bandpass";
  upFilter.frequency.value = 3500;
  upFilter.Q.value = 0.7;

  const upGain = audioCtx.createGain();
  upGain.gain.setValueAtTime(0.2, now);

  upSource.connect(upFilter).connect(upGain).connect(masterGain);

  // Start all components
  downSource.start(now);
  resonance.start(now);
  // Delay the up click slightly to simulate key travel time
  upSource.start(now + 0.05);

  // Stop components
  resonance.stop(now + 0.1);
}

export function withClickSound<T extends (...args: any) => void>(fn?: T) {
  return function (...args: Parameters<T>) {
    playClickSound();
    const result = fn?.(...args);
    return result;
  };
}
