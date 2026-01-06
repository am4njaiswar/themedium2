// server/engine/EraPhysics.ts

export type EraType = '1840' | '1990' | '2025';

interface EraProfile {
  baseLatency: number; // ms
  jitter: number;      // random variance in ms
  packetLossChance: number; // 0.0 to 1.0
  bandwidthLimit: number; // chars per second (optional complex feature)
}

const ERA_PROFILES: Record<EraType, EraProfile> = {
  '1840': {
    baseLatency: 2000, // 2 seconds per dot/dash processing
    jitter: 500,       // Human error factor
    packetLossChance: 0.05, // Weather interference
    bandwidthLimit: 5
  },
  '1990': {
    baseLatency: 800,  // Dial-up lag
    jitter: 1200,      // VERY unstable ping
    packetLossChance: 0.15, // 15% chance message fails (High frustration)
    bandwidthLimit: 100
  },
  '2025': {
    baseLatency: 20,   // Instant
    jitter: 10,        // Stable
    packetLossChance: 0,
    bandwidthLimit: 10000
  }
};

export function getSimulationParams(era: EraType) {
  const profile = ERA_PROFILES[era] || ERA_PROFILES['2025'];
  
  // Calculate final delay for this specific message
  const calculatedDelay = profile.baseLatency + (Math.random() * profile.jitter);
  
  return {
    delay: Math.floor(calculatedDelay),
    shouldDrop: Math.random() < profile.packetLossChance
  };
}