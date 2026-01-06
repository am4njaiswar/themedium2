import { useState, useEffect, useRef, useCallback } from 'react';

// ✅ FIXED DICTIONARY (No duplicates)
const MORSE_CODE: Record<string, string> = {
  ".-": "A", "-...": "B", "-.-.": "C", "-..": "D", ".": "E",
  "..-.": "F", "--.": "G", "....": "H", "..": "I", ".---": "J",
  "-.-": "K", ".-..": "L", "--": "M", "-.": "N", "---": "O",
  ".--.": "P", "--.-": "Q", ".-.": "R", "...": "S", "-": "T",
  "..-": "U", "...-": "V", ".--": "W", "-..-": "X", "-.--": "Y", "--..": "Z",
  "-----": "0", ".----": "1", "..---": "2", "...--": "3", "....-": "4", // Fixed: Added the dash
  ".....": "5", "-....": "6", "--...": "7", "---..": "8", "----.": "9"
};

export default function useMorseTranslator() {
  const [currentSequence, setCurrentSequence] = useState(""); // e.g., ".-"
  const [translatedMsg, setTranslatedMsg] = useState("");     // e.g., "HELLO"
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Logic: If user stops typing for 1.2s, translate the sequence
  useEffect(() => {
    if (currentSequence) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        // Look up the sequence, or use "?" if not found
        const letter = MORSE_CODE[currentSequence] || "?";
        setTranslatedMsg((prev) => prev + letter);
        setCurrentSequence(""); // Reset for next letter
      }, 1200); // Wait 1.2 seconds to confirm end of character
    }
  }, [currentSequence]);

  // Helper to add a dot or dash
  const addSignal = useCallback((type: "dot" | "dash") => {
    const symbol = type === "dot" ? "." : "-";
    setCurrentSequence((prev) => prev + symbol);
  }, []);

  // Helper to clear message
  const clearMessage = useCallback(() => {
      setTranslatedMsg("");
      setCurrentSequence("");
  }, []);

  return { currentSequence, translatedMsg, addSignal, clearMessage };
}