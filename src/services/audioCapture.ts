// Comprehensive Audio Capture & Web Speech API integration

export interface AudioCaptureOptions {
  language?: string;
  onInterimTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onAudioLevel?: (level: number) => void; // 0.0 to 1.0
  onError?: (error: string) => void;
  onRecordingEnd?: () => void;
}

export class PatientAudioCaptureService {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioBlob: Blob | null = null;
  private audioUrl: string | null = null;

  // Web Audio API
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrameId: number | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;

  // Web Speech API
  private recognition: any = null;
  private isSpeechActive = false;
  private language: string = 'hi-IN';

  // State
  private isRecording = false;
  private isPaused = false;
  private startTime = 0;
  private elapsedSeconds = 0;

  constructor(private options: AudioCaptureOptions = {}) {
    if (options.language) {
      this.language = options.language;
    }
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechClass) {
      try {
        this.recognition = new SpeechClass();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = this.language;

        this.recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const item = event.results[i];
            if (item.isFinal) {
              final += item[0].transcript;
            } else {
              interim += item[0].transcript;
            }
          }

          if (interim && this.options.onInterimTranscript) {
            this.options.onInterimTranscript(interim);
          }
          if (final && this.options.onFinalTranscript) {
            this.options.onFinalTranscript(final);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('[WebSpeechAPI] recognition error:', event.error);
          if (event.error === 'not-allowed') {
            this.options.onError?.('Microphone permission was denied in your browser settings.');
          } else if (event.error !== 'no-speech') {
            this.options.onError?.(`Speech recognition error: ${event.error}`);
          }
        };

        this.recognition.onend = () => {
          // If still recording, automatically restart speech recognition (Web Speech API times out on silence)
          if (this.isRecording && !this.isPaused) {
            try {
              this.recognition.start();
            } catch (err) {
              // ignore duplicate start
            }
          } else {
            this.isSpeechActive = false;
          }
        };
      } catch (e) {
        console.warn('[WebSpeechAPI] could not initialize:', e);
      }
    }
  }

  public setLanguage(lang: string) {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public async start(): Promise<boolean> {
    if (this.isRecording) return true;

    this.audioChunks = [];
    this.audioBlob = null;
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
      this.audioUrl = null;
    }

    try {
      // 1. Request microphone stream
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          this.mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
        } catch (micErr: any) {
          console.warn('getUserMedia denied or unavailable, using Speech fallback:', micErr);
          this.options.onError?.(
            micErr.name === 'NotAllowedError'
              ? 'Microphone access denied. You can still type notes or load patient audio scenarios.'
              : 'Microphone hardware unavailable.'
          );
        }
      }

      // 2. Set up Web Audio Analyser if stream available
      if (this.mediaStream) {
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            this.audioContext = new AudioContextClass();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.sourceNode.connect(this.analyser);
            this.startLevelLoop();
          }
        } catch (audioCtxErr) {
          console.warn('AudioContext error:', audioCtxErr);
        }

        // 3. Set up MediaRecorder
        try {
          const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
          const supportedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || '';

          this.mediaRecorder = supportedMime
            ? new MediaRecorder(this.mediaStream, { mimeType: supportedMime })
            : new MediaRecorder(this.mediaStream);

          this.mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              this.audioChunks.push(event.data);
            }
          };

          this.mediaRecorder.onstop = () => {
            if (this.audioChunks.length > 0) {
              const type = this.mediaRecorder?.mimeType || 'audio/webm';
              this.audioBlob = new Blob(this.audioChunks, { type });
              this.audioUrl = URL.createObjectURL(this.audioBlob);
            }
            this.options.onRecordingEnd?.();
          };

          this.mediaRecorder.start(250); // collect slice every 250ms
        } catch (recorderErr) {
          console.warn('MediaRecorder error:', recorderErr);
        }
      }

      // 4. Start Web Speech Recognition
      if (this.recognition) {
        try {
          this.recognition.start();
          this.isSpeechActive = true;
        } catch (speechStartErr) {
          console.warn('SpeechRecognition start error:', speechStartErr);
        }
      }

      this.isRecording = true;
      this.isPaused = false;
      this.startTime = Date.now();
      return true;
    } catch (e: any) {
      console.error('Failed to start audio recording:', e);
      this.options.onError?.(e.message || 'Could not start recording');
      return false;
    }
  }

  private startLevelLoop() {
    if (!this.analyser) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const update = () => {
      if (!this.isRecording || this.isPaused || !this.analyser) {
        this.options.onAudioLevel?.(0);
        return;
      }
      this.analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      const normalizedLevel = Math.min(1.0, avg / 128); // 0 to 1
      this.options.onAudioLevel?.(normalizedLevel);

      this.animationFrameId = requestAnimationFrame(update);
    };

    update();
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public stop(): Promise<{ blob: Blob | null; url: string | null }> {
    this.isRecording = false;
    this.isPaused = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        // ignore
      }
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {
        // ignore
      }
      this.audioContext = null;
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.audioChunks.length > 0 && !this.audioBlob) {
          const type = this.mediaRecorder?.mimeType || 'audio/webm';
          this.audioBlob = new Blob(this.audioChunks, { type });
          this.audioUrl = URL.createObjectURL(this.audioBlob);
        }
        resolve({ blob: this.audioBlob, url: this.audioUrl });
      }, 150);
    });
  }

  public getAudioUrl(): string | null {
    return this.audioUrl;
  }

  public getAudioBlob(): Blob | null {
    return this.audioBlob;
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  public destroy() {
    this.stop();
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
      this.audioUrl = null;
    }
  }
}
