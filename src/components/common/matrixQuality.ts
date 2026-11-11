export interface RainQuality {
  fps: number;
  fontSize: number;
}

interface DeviceHints {
  hardwareConcurrency?: number;
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

export const FULL_QUALITY: RainQuality = { fps: 30, fontSize: 16 };
// Half the frames and ~20% fewer columns: roughly 60% less canvas work per second
export const LOW_QUALITY: RainQuality = { fps: 15, fontSize: 20 };

/** Picks a rain quality tier from device hints. Missing hints are treated as capable. */
export const getRainQuality = (nav: DeviceHints | undefined = globalThis.navigator): RainQuality => {
  if (!nav) return FULL_QUALITY;
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8; // Chromium only, in GiB buckets
  const saveData = nav.connection?.saveData === true;
  return cores <= 4 || memory <= 4 || saveData ? LOW_QUALITY : FULL_QUALITY;
};
