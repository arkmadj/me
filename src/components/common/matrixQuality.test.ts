import { describe, expect, it } from 'vitest';
import { FULL_QUALITY, LOW_QUALITY, getRainQuality } from './matrixQuality';

describe('getRainQuality', () => {
  it('uses full quality on capable devices', () => {
    expect(getRainQuality({ hardwareConcurrency: 8, deviceMemory: 8 })).toBe(FULL_QUALITY);
  });

  it('treats missing hints as capable', () => {
    expect(getRainQuality({})).toBe(FULL_QUALITY);
    expect(getRainQuality(undefined)).toBe(FULL_QUALITY);
  });

  it('drops to low quality on few cores, little memory, or Save-Data', () => {
    expect(getRainQuality({ hardwareConcurrency: 4 })).toBe(LOW_QUALITY);
    expect(getRainQuality({ hardwareConcurrency: 8, deviceMemory: 2 })).toBe(LOW_QUALITY);
    expect(getRainQuality({ hardwareConcurrency: 8, connection: { saveData: true } })).toBe(LOW_QUALITY);
  });
});
