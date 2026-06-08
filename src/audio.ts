export const audioFiles = {
  click: 'mixkit-select-click-1109.wav',
  error: 'mixkit-click-error-1110.wav',
  success: 'mixkit-quick-win-video-game-notification-269.wav',
  keypress: 'mixkit-hard-single-key-press-in-a-laptop-2542.wav',
  fanfare: 'mixkit-cheering-crowd-loud-whistle-610.wav',
  podium_pop: 'mixkit-modern-technology-select-3124.wav',
  masked_dedede: 'Masked Dedede - Kirby Triple Deluxe Music Extended (mp3cut.net).mp3',
  chinese_meme: 'Chinese Meme Ringtone Download.mp3',
  bgm: [
    'Wii Shop Channel Main Theme (HQ).mp3',
    'Wii Music - Gaming Background Music (HD).mp3',
    'Elevator Music (Kevin MacLeod) - Background Music (HD).mp3',
    'Kirby dream land theme song.mp3'
  ]
};

// Safe asset-path resolver for varying client deployment bases (local, Cloud Run, GitHub Pages)
const getAssetPath = (filename: string) => {
  if (typeof window === 'undefined') return filename;
  
  const base = import.meta.env.BASE_URL || '/';
  let baseUrl = base;
  
  if (base === './' || base === '.' || base === '') {
    // Resolve dynamically relative to the current index.html location
    const pathname = window.location.pathname;
    const baseDir = pathname.substring(0, pathname.lastIndexOf('/') + 1);
    baseUrl = baseDir || '/';
  }
  
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
  return cleanBase + filename;
};

class AudioManager {
  private bgmAudio: HTMLAudioElement | null = null;
  private sfxAudios: { [key: string]: HTMLAudioElement } = {};
  private fadeInterval: ReturnType<typeof setInterval> | null = null;
  private _isMuted = false;
  private _globalVolume = 1.0;
  private currentBgmTargetVolume = 0.5;

  public audioContext: AudioContext | null = null;
  public analyserNode: AnalyserNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.sfxAudios.click = new Audio(getAssetPath(audioFiles.click));
      this.sfxAudios.error = new Audio(getAssetPath(audioFiles.error));
      this.sfxAudios.success = new Audio(getAssetPath(audioFiles.success));
      this.sfxAudios.keypress = new Audio(getAssetPath(audioFiles.keypress));
      this.sfxAudios.fanfare = new Audio(getAssetPath(audioFiles.fanfare));
      this.sfxAudios.podium_pop = new Audio(getAssetPath(audioFiles.podium_pop));
      this.sfxAudios.chinese_meme = new Audio(getAssetPath(audioFiles.chinese_meme));
      this.updateSfxVolumes();
    }
  }

  private updateSfxVolumes() {
    if (!this.sfxAudios.click) return;
    const vol = this._isMuted ? 0 : this._globalVolume;
    this.sfxAudios.click.volume = 0.5 * vol;
    this.sfxAudios.error.volume = 0.5 * vol;
    this.sfxAudios.success.volume = 0.5 * vol;
    this.sfxAudios.keypress.volume = 0.2 * vol;
    this.sfxAudios.fanfare.volume = 0.5 * vol;
    this.sfxAudios.podium_pop.volume = 0.5 * vol;
    this.sfxAudios.chinese_meme.volume = 0.5 * vol;
  }

  get globalVolume() {
    return this._globalVolume;
  }

  initAudioContext() {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 256;
      }
    }
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  setGlobalVolume(vol: number) {
    this._globalVolume = vol;
    this.updateSfxVolumes();
    if (!this._isMuted && this.bgmAudio) {
       this.bgmAudio.volume = this.currentBgmTargetVolume * this._globalVolume;
    }
  }

  get isMuted() {
    return this._isMuted;
  }

  setMuted(muted: boolean) {
    this._isMuted = muted;
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    this.updateSfxVolumes();
    if (muted) {
      if (this.bgmAudio) this.bgmAudio.volume = 0;
    } else {
      if (this.bgmAudio) this.bgmAudio.volume = this.currentBgmTargetVolume * this._globalVolume;
    }
  }

  playSfx(type: 'click' | 'error' | 'success' | 'keypress' | 'fanfare' | 'podium_pop' | 'chinese_meme') {
    if (this._isMuted) return;
    
    if (type === 'click' && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
    
    const audio = this.sfxAudios[type];
    if (audio) {
      const clone = audio.cloneNode(true) as HTMLAudioElement;
      clone.volume = audio.volume;
      clone.play().catch(() => {});
    }
  }

  stopSfx(type: string) {
    const audio = this.sfxAudios[type];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  playBgm(targetVolume: number = 0.5, forceNew: boolean = false, trackIndex: number = -1) {
    this.initAudioContext();
    this.currentBgmTargetVolume = targetVolume;
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    
    if (this.bgmAudio && !forceNew && trackIndex === -1) {
      if (this._isMuted) {
        this.bgmAudio.volume = 0;
        return;
      }
      
      const actualTarget = targetVolume * this._globalVolume;
      let vol = this.bgmAudio.volume;
      this.fadeInterval = setInterval(() => {
        if (Math.abs(vol - actualTarget) < 0.02) {
          if (this.bgmAudio) this.bgmAudio.volume = actualTarget;
          if (this.fadeInterval) clearInterval(this.fadeInterval);
        } else {
          vol += vol < actualTarget ? 0.02 : -0.02;
          if (this.bgmAudio) this.bgmAudio.volume = Math.max(0, Math.min(vol, actualTarget));
        }
      }, 50);
      return; 
    }
    
    let playIndex = trackIndex;
    if (playIndex === -1) {
      if (audioFiles.bgm.length > 1 && Math.random() < 0.2) {
        playIndex = 0; // 20% chance for lobby music
      } else {
        // 80% chance for other tracks
        playIndex = 1 + Math.floor(Math.random() * (audioFiles.bgm.length - 1));
      }
    }
    
    const randomBgm = playIndex >= 0 && playIndex < audioFiles.bgm.length 
      ? audioFiles.bgm[playIndex] 
      : audioFiles.bgm[0];
    
    if (!this.bgmAudio) {
      this.bgmAudio = new Audio();
      if (this.audioContext && this.analyserNode) {
        const source = this.audioContext.createMediaElementSource(this.bgmAudio);
        source.connect(this.analyserNode);
        this.analyserNode.connect(this.audioContext.destination);
      }
    } else {
      this.bgmAudio.pause();
    }
    
    this.bgmAudio.src = getAssetPath(randomBgm);
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = this._isMuted ? 0 : 0.01;
    this.bgmAudio.play().catch(() => {});
    
    if (this._isMuted) return;

    // fade in
    let vol = 0;
    const actualTarget = targetVolume * this._globalVolume;
    this.fadeInterval = setInterval(() => {
      if (vol < actualTarget) {
        vol += 0.02;
        if (this.bgmAudio) {
           this.bgmAudio.volume = Math.min(vol, actualTarget);
        }
      } else {
        if (this.fadeInterval) clearInterval(this.fadeInterval);
      }
    }, 50);
  }

  tryResume() {
    this.initAudioContext();
    if (this.bgmAudio) {
      if (this.bgmAudio.paused) {
        if (this.bgmAudio.volume === 0 && !this._isMuted) {
          this.bgmAudio.volume = this.currentBgmTargetVolume * this._globalVolume;
        }
        this.bgmAudio.play().catch(() => {});
      }
    } else {
      // If BGM wasn't started, start it
      this.playBgm(this.currentBgmTargetVolume, true);
    }
  }

  stopBgm() {
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    if (this.bgmAudio) {
      // fade out
      let vol = this.bgmAudio.volume;
      this.fadeInterval = setInterval(() => {
        if (vol > 0.02) {
          vol -= 0.02;
          if (this.bgmAudio) {
             this.bgmAudio.volume = Math.max(vol, 0);
          }
        } else {
          if (this.fadeInterval) clearInterval(this.fadeInterval);
          if (this.bgmAudio) {
            this.bgmAudio.pause();
            // Don't set to null since we reuse it for the web audio api 
            // this.bgmAudio = null;
          }
        }
      }, 50);
    }
  }

  playSpecificBgm(url: string, targetVolume: number = 0.5) {
    this.initAudioContext();
    this.currentBgmTargetVolume = targetVolume;
    if (this.fadeInterval) clearInterval(this.fadeInterval);
    
    if (!this.bgmAudio) {
      this.bgmAudio = new Audio();
      if (this.audioContext && this.analyserNode) {
        try {
          const source = this.audioContext.createMediaElementSource(this.bgmAudio);
          source.connect(this.analyserNode);
          this.analyserNode.connect(this.audioContext.destination);
        } catch(e) {}
      }
    } else {
      this.bgmAudio.pause();
    }
    
    this.bgmAudio.src = url.startsWith('http') || url.startsWith('/') ? url : getAssetPath(url);
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = this._isMuted ? 0 : (targetVolume * this._globalVolume);
    this.bgmAudio.play().catch(() => {});
  }
}

export const audioManager = new AudioManager();
