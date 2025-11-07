// Sound Manager for Jan-Kawach Fraud Alerts
export class SoundManager {
  constructor() {
    this.sounds = {
      'low': '/sounds/low-risk.mp3',
      'medium': '/sounds/medium-risk.mp3', 
      'high': '/sounds/high-risk.mp3',
      'critical': '/sounds/critical-risk.mp3',
      'success': '/sounds/success.mp3',
      'error': '/sounds/error.mp3'
    };
    
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.7;
    
    this.initAudioContext();
  }

  initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  async playAlert(riskLevel = 'medium', options = {}) {
    if (!this.enabled) return;

    const soundFile = this.sounds[riskLevel] || this.sounds['medium'];
    
    try {
      // Create audio element
      const audio = new Audio(soundFile);
      audio.volume = options.volume || this.volume;
      
      // Add fallback sounds if audio files don't exist
      if (!await this.checkSoundExists(soundFile)) {
        this.playFallbackSound(riskLevel);
        return;
      }
      
      await audio.play();
      
      // Add vibration for mobile devices
      if (navigator.vibrate && options.vibrate !== false) {
        this.playVibration(riskLevel);
      }
      
    } catch (error) {
      console.warn('Audio playback failed:', error);
      this.playFallbackSound(riskLevel);
    }
  }

  async checkSoundExists(soundPath) {
    try {
      const response = await fetch(soundPath, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  playFallbackSound(riskLevel) {
    // Web Audio API fallback using oscillator
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Different frequencies for different risk levels
    const frequencies = {
      'low': 440,      // A4 - gentle
      'medium': 659,   // E5 - attention
      'high': 880,     // A5 - urgent  
      'critical': 1175 // D6 - alarm
    };
    
    oscillator.frequency.setValueAtTime(
      frequencies[riskLevel] || frequencies['medium'], 
      this.audioContext.currentTime
    );
    
    oscillator.type = riskLevel === 'critical' ? 'sawtooth' : 'sine';
    
    // Volume envelope
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
    
    // For critical alerts, play multiple beeps
    if (riskLevel === 'critical') {
      setTimeout(() => this.playFallbackSound('critical'), 600);
    }
  }

  playVibration(riskLevel) {
    const patterns = {
      'low': [100],
      'medium': [200, 100, 200],
      'high': [300, 150, 300, 150, 300],
      'critical': [500, 200, 500, 200, 500, 200, 500]
    };
    
    navigator.vibrate(patterns[riskLevel] || patterns['medium']);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    localStorage.setItem('jan-kawach-sound-enabled', enabled.toString());
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('jan-kawach-sound-volume', this.volume.toString());
  }

  getSettings() {
    return {
      enabled: this.enabled,
      volume: this.volume
    };
  }

  loadSettings() {
    const enabled = localStorage.getItem('jan-kawach-sound-enabled');
    const volume = localStorage.getItem('jan-kawach-sound-volume');
    
    if (enabled !== null) {
      this.enabled = enabled === 'true';
    }
    
    if (volume !== null) {
      this.volume = parseFloat(volume);
    }
  }

  // Test all sound levels
  async testSounds() {
    const levels = ['low', 'medium', 'high', 'critical'];
    
    for (let i = 0; i < levels.length; i++) {
      setTimeout(() => {
        this.playAlert(levels[i], { vibrate: false });
      }, i * 1000);
    }
  }
}

// Export singleton instance
export const soundManager = new SoundManager();

// Load settings on initialization
soundManager.loadSettings();