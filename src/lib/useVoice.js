import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const cleanForSpeech = (text) =>
  String(text || '')
    .replace(/[*_`#>]/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Text-to-speech through the browser, so it costs nothing and needs no key. */
export function useSpeech({ pitch = 1, rate = 1 } = {}) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef(null);

  useEffect(() => {
    if (!supported) return;
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      const english = voices.filter((v) => /^en(-|_|$)/i.test(v.lang));
      voiceRef.current =
        english.find((v) => /female|samantha|zira|aria|jenny|libby|sonia|natasha/i.test(v.name)) ||
        english[0] ||
        voices[0];
    };
    pick();
    window.speechSynthesis.addEventListener('voiceschanged', pick);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pick);
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text) => {
      if (!supported) return false;
      const clean = cleanForSpeech(text);
      if (!clean) return false;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(clean);
      utter.pitch = pitch;
      utter.rate = rate;
      utter.lang = voiceRef.current?.lang || 'en-US';
      if (voiceRef.current) utter.voice = voiceRef.current;
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utter);
      return true;
    },
    [pitch, rate, supported],
  );

  useEffect(() => stop, [stop]);

  return { speak, stop, speaking, supported };
}

/** Speech-to-text through the browser (Chrome/Edge/Safari). */
export function useDictation() {
  const Recognition = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }, []);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const recRef = useRef(null);

  const stop = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  const start = useCallback(
    (onText) => {
      if (!Recognition) {
        setError('Voice input needs Chrome, Edge or Safari.');
        return false;
      }
      try {
        const rec = new Recognition();
        rec.lang = navigator.language || 'en-US';
        rec.interimResults = true;
        rec.continuous = false;
        rec.onresult = (event) => {
          let text = '';
          for (let i = 0; i < event.results.length; i += 1) text += event.results[i][0].transcript;
          onText(text.trim().slice(0, 600));
        };
        rec.onerror = (event) => {
          setError(
            event.error === 'not-allowed'
              ? 'Microphone permission was blocked.'
              : 'Could not hear that — try again.',
          );
          setListening(false);
        };
        rec.onend = () => setListening(false);
        recRef.current = rec;
        setError('');
        setListening(true);
        rec.start();
        return true;
      } catch {
        setError('Voice input is unavailable right now.');
        setListening(false);
        return false;
      }
    },
    [Recognition],
  );

  useEffect(() => () => stop(), [stop]);

  return { start, stop, listening, supported: Boolean(Recognition), error, clearError: () => setError('') };
}
