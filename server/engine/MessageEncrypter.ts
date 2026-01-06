// server/engine/MessageEncrypter.ts

export function processSecurity(text: string, era: string): { content: string, secured: boolean } {
  if (era === '1840') {
    return { content: text.toUpperCase(), secured: false }; // Telegraphs were public
  }
  
  if (era === '1990') {
    return { content: text, secured: false }; // HTTP (Not HTTPS) was standard
  }
  
  if (era === '2025') {
    // In a real app, you'd actually encrypt it. For demo, we tag it.
    return { content: text, secured: true }; 
  }
  
  return { content: text, secured: false };
}