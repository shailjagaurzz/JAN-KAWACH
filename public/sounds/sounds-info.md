# Jan-Kawach Alert Sounds

This directory contains audio files for different fraud alert levels.

## Sound Files Structure

- `low-risk.mp3` - Gentle notification sound for low-risk threats
- `medium-risk.mp3` - Moderate alert sound for medium-risk threats  
- `high-risk.mp3` - Urgent alert sound for high-risk threats
- `critical-risk.mp3` - Emergency alert sound for critical threats

## Sound Generation

Since we can't include actual audio files in this demo, the SoundManager.js uses:

1. **Web Audio API**: Generates synthetic alert tones at different frequencies
2. **Fallback Audio**: Uses audio element with generated data URIs
3. **Vibration API**: Provides haptic feedback on supported devices

## Real Implementation

For production, replace with actual audio files:

```javascript
// Example frequencies for synthetic generation:
- Low Risk: 440Hz (A4) - Gentle sine wave
- Medium Risk: 660Hz (E5) - Modulated tone  
- High Risk: 880Hz (A5) - Sharp beeping
- Critical Risk: 1100Hz (C#6) - Rapid emergency tone
```

## Browser Compatibility

- Web Audio API: Modern browsers
- HTML5 Audio: Universal fallback
- Vibration API: Mobile devices primarily
- Notification API: Desktop/mobile with permissions