
// server/engine/PacketLoss.ts

export function simulateCorruption(text: string, severity: number): string {
  if (severity === 0) return text;

  // Randomly replace characters with "static" or garbage
  return text.split('').map(char => {
    return Math.random() < severity ? '#' : char;
  }).join('');
}