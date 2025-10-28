import { useEffect, useRef } from 'react';

interface AudioManagerProps {
  onPlaySound: (soundRef: { playWalk: () => void; playTalk: () => void; playMenuOpen: () => void }) => void;
}

export function AudioManager({ onPlaySound }: AudioManagerProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const bgmGainRef = useRef<GainNode | null>(null);
  const bgmOscillatorsRef = useRef<OscillatorNode[]>([]);

  useEffect(() => {
    // AudioContextの初期化
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // BGM用のゲインノード
    bgmGainRef.current = audioContextRef.current.createGain();
    bgmGainRef.current.gain.value = 0.1;
    bgmGainRef.current.connect(audioContextRef.current.destination);

    // シンプルなBGMを開始
    startBGM();

    // 効果音関数を親に渡す
    onPlaySound({
      playWalk: () => playWalkSound(),
      playTalk: () => playTalkSound(),
      playMenuOpen: () => playMenuSound()
    });

    return () => {
      // クリーンアップ
      stopBGM();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startBGM = () => {
    if (!audioContextRef.current || !bgmGainRef.current) return;

    const ctx = audioContextRef.current;
    
    // ドラクエ風のシンプルなメロディ（Cメジャースケール）
    const melody = [
      { freq: 523.25, duration: 0.5 },  // C5
      { freq: 587.33, duration: 0.5 },  // D5
      { freq: 659.25, duration: 0.5 },  // E5
      { freq: 523.25, duration: 0.5 },  // C5
      { freq: 392.00, duration: 1.0 },  // G4
      { freq: 440.00, duration: 0.5 },  // A4
      { freq: 493.88, duration: 0.5 },  // B4
      { freq: 523.25, duration: 1.0 },  // C5
    ];

    let currentTime = ctx.currentTime;
    const loopDuration = melody.reduce((sum, note) => sum + note.duration, 0);

    const playMelody = (startTime: number) => {
      let time = startTime;
      
      melody.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.value = note.freq;
        
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.3, time + 0.01);
        gain.gain.linearRampToValueAtTime(0, time + note.duration);
        
        osc.connect(gain);
        gain.connect(bgmGainRef.current!);
        
        osc.start(time);
        osc.stop(time + note.duration);
        
        bgmOscillatorsRef.current.push(osc);
        
        time += note.duration;
      });

      // ループ
      setTimeout(() => playMelody(ctx.currentTime), loopDuration * 1000);
    };

    playMelody(currentTime);
  };

  const stopBGM = () => {
    bgmOscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // already stopped
      }
    });
    bgmOscillatorsRef.current = [];
  };

  const playWalkSound = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.value = 100;
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  };

  const playTalkSound = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 800;
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  };

  const playMenuSound = () => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.value = 600;
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  };

  return null;
}
