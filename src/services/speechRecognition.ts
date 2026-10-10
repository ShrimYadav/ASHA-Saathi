// Browser Speech Recognition wrapper with fallback

export interface SpeechListenerOptions {
  language?: string;
  onInterimResult?: (text: string) => void;
  onFinalResult?: (text: string) => void;
  onError?: (errorMsg: string) => void;
  onEnd?: () => void;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

export class SpeechHandler {
  private recognition: any = null;
  private isListening = false;

  constructor(options: SpeechListenerOptions = {}) {
    if (typeof window === 'undefined') return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        this.recognition = new SpeechRec();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = options.language || 'hi-IN';

        this.recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          if (interim && options.onInterimResult) {
            options.onInterimResult(interim);
          }
          if (final && options.onFinalResult) {
            options.onFinalResult(final);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition event error:', event.error);
          if (options.onError) {
            let userMsg = 'Microphone access interrupted.';
            if (event.error === 'not-allowed') {
              userMsg = 'Microphone permission denied. Please allow microphone in browser or use manual typing.';
            } else if (event.error === 'no-speech') {
              userMsg = 'No speech detected. Please speak clearly into the microphone.';
            }
            options.onError(userMsg);
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
          if (options.onEnd) options.onEnd();
        };
      } catch (err) {
        console.warn('Could not instantiate SpeechRecognition:', err);
      }
    }
  }

  public start() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
      } catch (e) {
        console.warn('Speech recognition start error:', e);
      }
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
      } catch (e) {
        console.warn('Speech recognition stop error:', e);
      }
    }
  }

  public setLanguage(lang: string) {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }
}
