const audioCtx = new (window.AudioContext ||
  (window as TSAny).webkitAudioContext)();

export function playSlideSound(): void {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;

  // === Master gain ===
  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.5, now);
  masterGain.connect(audioCtx.destination);

  // === Component 1: Slide noise (midrange rustle) ===
  const slideBufferSize = audioCtx.sampleRate * 0.15; // ~150ms
  const slideBuffer = audioCtx.createBuffer(
    1,
    slideBufferSize,
    audioCtx.sampleRate,
  );
  const slideData = slideBuffer.getChannelData(0);

  for (let i = 0; i < slideBufferSize; i++) {
    const t = i / slideBufferSize;
    const envelope = Math.exp(-18 * t); // slightly longer decay
    const flick = (Math.random() * 2 - 1) * envelope * 0.5;
    slideData[i] = flick;
  }

  const slideSource = audioCtx.createBufferSource();
  slideSource.buffer = slideBuffer;

  const slideFilter = audioCtx.createBiquadFilter();
  slideFilter.type = "bandpass";
  slideFilter.frequency.value = 950; // shifted lower
  slideFilter.Q.value = 1.2;

  slideSource.connect(slideFilter).connect(masterGain);

  // === Component 2: Baritone click transient ===
  const clickBufferSize = audioCtx.sampleRate * 0.01; // 10ms
  const clickBuffer = audioCtx.createBuffer(
    1,
    clickBufferSize,
    audioCtx.sampleRate,
  );
  const clickData = clickBuffer.getChannelData(0);

  for (let i = 0; i < clickBufferSize; i++) {
    const env = 1 - i / clickBufferSize;
    clickData[i] = (Math.random() * 2 - 1) * env * 0.8;
  }

  const clickSource = audioCtx.createBufferSource();
  clickSource.buffer = clickBuffer;

  const clickFilter = audioCtx.createBiquadFilter();
  clickFilter.type = "bandpass";
  clickFilter.frequency.value = 1400; // baritone-y
  clickFilter.Q.value = 2.5;

  clickSource.connect(clickFilter).connect(masterGain);

  // === Play both simultaneously ===
  clickSource.start(now);
  slideSource.start(now);
}

export function withSlideSound<T extends (...args: TSAny) => void>(fn?: T) {
  return function (...args: Parameters<T>) {
    playSlideSound();
    const result = fn?.(...args);
    return result;
  };
}
