import { useState, useEffect, useRef, useCallback } from 'react';

// 1. Morse -> English Dictionary
const MORSE_CODE: Record<string, string> = {
  ".-": "A", "-...": "B", "-.-.": "C", "-..": "D", ".": "E",
  "..-.": "F", "--.": "G", "....": "H", "..": "I", ".---": "J",
  "-.-": "K", ".-..": "L", "--": "M", "-.": "N", "---": "O",
  ".--.": "P", "--.-": "Q", ".-.": "R", "...": "S", "-": "T",
  "..-": "U", "...-": "V", ".--": "W", "-..-": "X", "-.--": "Y", "--..": "Z",
  "-----": "0", ".----": "1", "..---": "2", "...--": "3", "....-": "4",
  ".....": "5", "-....": "6", "--...": "7", "---..": "8", "----.": "9"
};

// 2. English -> Morse Dictionary (We create this automatically by flipping the first one)
const ENGLISH_TO_MORSE: Record<string, string> = Object.entries(MORSE_CODE).reduce((acc, [morse, char]) => {
  acc[char] = morse;
  return acc;
}, {} as Record<string, string>);

export default function useMorseTranslator() {
  const [currentSequence, setCurrentSequence] = useState(""); 
  const [translatedMsg, setTranslatedMsg] = useState("");     
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ... (Existing Logic for Decoding remains the same) ...
  useEffect(() => {
    if (currentSequence) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        const letter = MORSE_CODE[currentSequence] || "?";
        setTranslatedMsg((prev) => prev + letter);
        setCurrentSequence(""); 
      }, 1200); 
    }
  }, [currentSequence]);

  const addSignal = useCallback((type: "dot" | "dash") => {
    const symbol = type === "dot" ? "." : "-";
    setCurrentSequence((prev) => prev + symbol);
  }, []);

  const clearMessage = useCallback(() => {
      setTranslatedMsg("");
      setCurrentSequence("");
  }, []);

  // 🆕 NEW FUNCTION: Encodes Text back to Morse
  const encodeToMorse = useCallback((text: string) => {
    return text
      .toUpperCase()
      .split('')
      .map(char => {
        // If it's a space, add a slash or big gap. If valid char, get code. If unknown, use ?
        if (char === ' ') return ' / '; 
        return ENGLISH_TO_MORSE[char] ? ENGLISH_TO_MORSE[char] + ' ' : '? ';
      })
      .join('');
  }, []);

  return { currentSequence, translatedMsg, addSignal, clearMessage, encodeToMorse };
}