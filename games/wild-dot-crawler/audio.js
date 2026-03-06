export class AudioController {
    constructor({ muted = false } = {}) {
        this.muted = muted;
        this.ready = false;
        this.enabled = typeof window !== 'undefined' && typeof window.Tone !== 'undefined';
        this.chainSynth = null;
        this.impactSynth = null;
        this.supportSynth = null;
        this.bassSynth = null;
    }

    async unlock() {
        if (!this.enabled || this.ready) {
            return;
        }

        await window.Tone.start();
        this.chainSynth = new window.Tone.PolySynth(window.Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.01, decay: 0.12, sustain: 0, release: 0.16 },
        }).toDestination();
        this.impactSynth = new window.Tone.MembraneSynth({
            pitchDecay: 0.02,
            octaves: 4,
            envelope: { attack: 0.005, decay: 0.24, sustain: 0, release: 0.22 },
        }).toDestination();
        this.supportSynth = new window.Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 0.02, decay: 0.22, sustain: 0.08, release: 0.28 },
        }).toDestination();
        this.bassSynth = new window.Tone.FMSynth({
            harmonicity: 1.8,
            modulationIndex: 4,
            envelope: { attack: 0.01, decay: 0.22, sustain: 0.06, release: 0.3 },
        }).toDestination();
        this.ready = true;
    }

    setMuted(nextMuted) {
        this.muted = nextMuted;
    }

    trigger(type, value = 0) {
        if (!this.ready || this.muted) {
            return;
        }

        try {
            switch (type) {
                case 'select': {
                    const notes = ['D4', 'F4', 'A4', 'C5', 'E5', 'G5'];
                    this.chainSynth.triggerAttackRelease(notes[Math.min(value, notes.length - 1)], '16n');
                    break;
                }
                case 'resolve':
                    this.impactSynth.triggerAttackRelease('C2', '8n');
                    break;
                case 'heal':
                    this.supportSynth.triggerAttackRelease('G4', '8n');
                    break;
                case 'guard':
                    this.supportSynth.triggerAttackRelease('D4', '16n');
                    break;
                case 'surge':
                    this.bassSynth.triggerAttackRelease('G1', '4n');
                    setTimeout(() => this.chainSynth.triggerAttackRelease('D5', '8n'), 100);
                    break;
                case 'enemy':
                    this.bassSynth.triggerAttackRelease('E2', '8n');
                    break;
                case 'reward':
                    this.chainSynth.triggerAttackRelease(['C5', 'E5', 'G5'], '8n');
                    break;
                case 'defeat':
                    this.bassSynth.triggerAttackRelease('C1', '2n');
                    break;
                default:
                    break;
            }
        } catch (error) {
            // Audio feedback should never interrupt the game loop.
        }
    }
}
