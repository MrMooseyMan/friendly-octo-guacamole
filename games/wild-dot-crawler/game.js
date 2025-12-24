document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration ---
    const GRID_SIZE = 6;
    const MOVES_PER_TURN = 3;
    const MAX_FLOOR = 50;
    const BOSS_EVERY = 5;
    
    // --- Data ---
    const ICONS = {
        // RUNES
        red: `<svg viewBox="0 0 24 24"><path d="M19.1 1.9c-1.1-1.1-2.7-1.7-4.3-1.7-1.6 0-3.2.6-4.3 1.7L1.9 10.5c-1.1 1.1-1.7 2.7-1.7 4.3s.6 3.2 1.7 4.3l1.8 1.8c1.1 1.1 2.7 1.7 4.3 1.7s3.2-.6 4.3-1.7l8.6-8.6c1.1-1.1 1.7-2.7 1.7-4.3s-.6-3.2-1.7-4.3zM18 10.2l-8.6 8.6c-.4.4-1 .4-1.4 0l-1.8-1.8c-.4-.4-.4-1 0-1.4l8.6-8.6c.4-.4 1-.4 1.4 0l1.8 1.8c.4.4.4 1 0 1.4zM4.7 17.5l-1.8-1.8c-.8-.8-.8-2 0-2.8l8.6-8.6c.8-.8 2-.8 2.8 0l1.8 1.8c.8.8.8 2 0 2.8l-8.6 8.6c-.8.8-2 .8-2.8 0z"></path></svg>`, // Claw
        green: `<svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"></path><path d="M12 4c-2.1 0-4 1.3-4.8 3.2-.3.6.3 1.2.9 1.2h7.8c.6 0 1.2-.6.9-1.2C16 5.3 14.1 4 12 4z"></path><path d="M12 14c2.1 0 4-1.3 4.8-3.2.3-.6-.3-1.2-.9-1.2H8.1c-.6 0-1.2.6-.9 1.2C8 12.7 9.9 14 12 14z"></path><path d="M12 20c-2.1 0-4-1.3-4.8-3.2-.3-.6.3-1.2.9-1.2h7.8c.6 0 1.2-.6.9-1.2C16 18.7 14.1 20 12 20z"></path></svg>`, // Leaf
        blue: `<svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-2.8-11.2c.4-.4 1-.4 1.4 0l3.5 3.5c.4.4.4 1 0 1.4l-3.5 3.5c-.4.4-1 .4-1.4 0l-3.5-3.5c-.4-.4-.4-1 0-1.4l3.5-3.5z"></path></svg>`, // Mind
        yellow: `<svg viewBox="0 0 24 24"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.2l8.2 4.1v7.4L12 19.8l-8.2-4.1V8.3L12 4.2zM4 8.3v7.4l8 4v-7.4l-8-4zM12 12.2l-8-4 8-4 8 4-8 4z"></path></svg>`, // Shield
        purple: `<svg viewBox="0 0 24 24"><path d="M12 2c-3.3 0-6 2.7-6 6 0 3.1 2.2 5.7 5.1 6V22h1.8v-8c2.9-.3 5.1-2.9 5.1-6 0-3.3-2.7-6-6-6zm0 10.5c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z"></path></svg>`, // Fang
        white: `<svg viewBox="0 0 24 24"><path d="M12 2l2.6 7.2H22l-6 4.4 2.3 7.2L12 16.4 5.7 20.8 8 13.6 2 9.2h7.4L12 2z"></path></svg>`, // Sun Shard

        // PORTRAITS
        player: `<svg viewBox="0 0 100 100" fill="#10b981"><path d="M50 10 C 30 10, 30 35, 30 35 C 30 55, 40 65, 50 80 C 60 65, 70 55, 70 35 C 70 35, 70 10, 50 10 z M 50 40 A 5 5 0 0 1 45 45 A 5 5 0 0 1 40 40 A 5 5 0 0 1 45 35 A 5 5 0 0 1 50 40 z M 60 40 A 5 5 0 0 1 55 45 A 5 5 0 0 1 50 40 A 5 5 0 0 1 55 35 A 5 5 0 0 1 60 40 z M 40 55 A 15 10 0 0 0 60 55 L 60 60 A 20 15 0 0 1 40 60 z"></path><path d="M20 90 L 30 70 L 35 75 L 25 95 z" fill-opacity="0.8"></path><path d="M80 90 L 70 70 L 65 75 L 75 95 z" fill-opacity="0.8"></path></svg>`,
        'gloom-cap': `<svg viewBox="0 0 100 100" fill="#a78bfa"><path d="M50 30 C 20 30, 20 60, 20 60 C 20 70, 30 80, 40 80 L 60 80 C 70 80, 80 70, 80 60 C 80 60, 80 30, 50 30 z"></path><path d="M45 80 L 45 90 L 55 90 L 55 80 z" fill-opacity="0.7"></path><circle cx="35" cy="50" r="5" fill="#fde047"></circle><circle cx="50" cy="45" r="5" fill="#fde047"></circle><circle cx="65" cy="50" r="5" fill="#fde047"></circle><circle cx="30" cy="65" r="3" fill="#fde047"></circle><circle cx="70" cy="65" r="3" fill="#fde047"></circle></svg>`,
        'briar-wolf': `<svg viewBox="0 0 100 100" fill="#f43f5e"><path d="M20 80 L 30 60 L 40 70 L 35 90 z M 30 60 L 45 50 L 50 30 L 60 40 L 75 45 L 80 60 L 60 75 L 50 85 L 40 70 z M 75 45 L 90 40 L 85 55 z M 50 30 L 45 20 L 55 20 z"></path><path d="M40 55 C 42 53, 47 53, 49 55" stroke="#f1f5f9" stroke-width="2"></path><path d="M60 58 C 62 56, 67 56, 69 58" stroke="#f1f5f9" stroke-width="2"></path></svg>`,
        'gloom-sprite': `<svg viewBox="0 0 100 100" fill="#0ea5e9"><circle cx="50" cy="50" r="15"></circle><path d="M50 35 A 20 20 0 0 0 35 50 A 5 5 0 0 0 40 50 A 15 15 0 0 1 50 35 z" fill-opacity="0.8"></path><path d="M50 65 A 20 20 0 0 1 65 50 A 5 5 0 0 1 60 50 A 15 15 0 0 0 50 65 z" fill-opacity="0.8"></path><path d="M65 50 A 20 20 0 0 0 50 35 A 5 5 0 0 0 50 40 A 15 15 0 0 1 65 50 z" fill-opacity="0.8"></path></svg>`,
        'shadow-stalker': `<svg viewBox="0 0 100 100" fill="#4b5563"><path d="M50 10 L 40 40 L 20 30 z M 60 40 L 80 30 L 50 10 z M 40 40 L 20 60 L 30 90 L 50 70 L 70 90 L 80 60 L 60 40 z"></path><circle cx="40" cy="50" r="5" fill="#f43f5e"></circle><circle cx="60" cy="50" r="5" fill="#f43f5e"></circle></svg>`,
        'grove-wraith': `<svg viewBox="0 0 100 100" fill="#166534"><path d="M50 20 C 40 30, 40 40, 40 40 L 30 80 L 40 70 L 50 90 L 60 70 L 70 80 L 60 40 C 60 40, 60 30, 50 20 z"></path><circle cx="45" cy="45" r="3" fill="#fde047"></circle><circle cx="55" cy="45" r="3" fill="#fde047"></circle><path d="M40 60 C 50 50, 50 50, 60 60" stroke="#f1f5f9" stroke-width="2" fill="none"></path></svg>`,
        'bone-crawler': `<svg viewBox="0 0 100 100" fill="#94a3b8"><ellipse cx="50" cy="50" rx="30" ry="15"></ellipse><circle cx="30" cy="50" r="8" fill="#1e293b"></circle><circle cx="50" cy="50" r="8" fill="#1e293b"></circle><circle cx="70" cy="50" r="8" fill="#1e293b"></circle><path d="M25 35 L25 25 M35 30 L35 22 M45 28 L45 20 M55 28 L55 20 M65 30 L65 22 M75 35 L75 25" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"></path></svg>`,
        'crystal-golem': `<svg viewBox="0 0 100 100" fill="#22d3ee"><polygon points="50,10 30,40 30,70 50,90 70,70 70,40"></polygon><polygon points="50,20 35,45 35,65 50,80 65,65 65,45" fill="#0891b2"></polygon><circle cx="40" cy="50" r="4" fill="#fef3c7"></circle><circle cx="60" cy="50" r="4" fill="#fef3c7"></circle></svg>`,
        'void-weaver': `<svg viewBox="0 0 100 100" fill="#6366f1"><circle cx="50" cy="50" r="25" fill="#1e1b4b"></circle><circle cx="50" cy="50" r="20" fill="#312e81"></circle><path d="M50 25 L55 45 L75 50 L55 55 L50 75 L45 55 L25 50 L45 45 Z" fill="#6366f1"></path><circle cx="50" cy="50" r="8" fill="#818cf8"></circle></svg>`,
        'inferno-beast': `<svg viewBox="0 0 100 100" fill="#ef4444"><path d="M30 80 L40 60 L35 40 L50 55 L65 40 L60 60 L70 80 L50 70 Z"></path><path d="M50 55 L45 30 L50 15 L55 30 Z" fill="#f97316"></path><path d="M35 40 L20 35 L30 50 Z" fill="#f97316"></path><path d="M65 40 L80 35 L70 50 Z" fill="#f97316"></path><circle cx="42" cy="55" r="4" fill="#fef3c7"></circle><circle cx="58" cy="55" r="4" fill="#fef3c7"></circle></svg>`,
        
        // BOSSES
        'ancient-treant': `<svg viewBox="0 0 100 100" fill="#166534"><path d="M40 90 L40 60 L30 60 L30 55 L35 50 L25 40 L35 35 L30 25 L45 30 L50 15 L55 30 L70 25 L65 35 L75 40 L65 50 L70 55 L70 60 L60 60 L60 90 Z"></path><circle cx="40" cy="45" r="6" fill="#fde047"></circle><circle cx="60" cy="45" r="6" fill="#fde047"></circle><path d="M40 60 C50 70, 50 70, 60 60" stroke="#84cc16" stroke-width="3" fill="none"></path></svg>`,
        'elder-hydra': `<svg viewBox="0 0 100 100" fill="#0891b2"><path d="M50 90 L45 60 L35 55 L30 30 L35 45 L40 40 L50 25 L60 40 L65 45 L70 30 L65 55 L55 60 Z"></path><circle cx="30" cy="28" r="8" fill="#0e7490"></circle><circle cx="50" cy="20" r="10" fill="#0e7490"></circle><circle cx="70" cy="28" r="8" fill="#0e7490"></circle><circle cx="27" cy="26" r="3" fill="#fef3c7"></circle><circle cx="33" cy="26" r="3" fill="#fef3c7"></circle><circle cx="46" cy="18" r="4" fill="#fef3c7"></circle><circle cx="54" cy="18" r="4" fill="#fef3c7"></circle><circle cx="67" cy="26" r="3" fill="#fef3c7"></circle><circle cx="73" cy="26" r="3" fill="#fef3c7"></circle></svg>`,
        'shadow-lord': `<svg viewBox="0 0 100 100" fill="#1f2937"><path d="M50 10 L40 25 L25 20 L35 35 L20 45 L35 50 L25 80 L45 65 L50 90 L55 65 L75 80 L65 50 L80 45 L65 35 L75 20 L60 25 Z"></path><circle cx="42" cy="40" r="5" fill="#dc2626"></circle><circle cx="58" cy="40" r="5" fill="#dc2626"></circle><path d="M40 55 L50 60 L60 55" stroke="#dc2626" stroke-width="2" fill="none"></path></svg>`,
        'dragon-king': `<svg viewBox="0 0 100 100" fill="#eab308"><path d="M20 70 L30 55 L25 45 L35 50 L45 35 L50 20 L55 35 L65 50 L75 45 L70 55 L80 70 L65 65 L50 85 L35 65 Z"></path><path d="M45 35 L35 20 L45 25 Z M55 35 L65 20 L55 25 Z" fill="#ca8a04"></path><circle cx="42" cy="45" r="5" fill="#fef3c7"></circle><circle cx="58" cy="45" r="5" fill="#fef3c7"></circle><circle cx="42" cy="45" r="2" fill="#1f2937"></circle><circle cx="58" cy="45" r="2" fill="#1f2937"></circle><path d="M45 60 C50 65, 50 65, 55 60" stroke="#dc2626" stroke-width="2" fill="none"></path></svg>`,
    };

    // Regular enemies with abilities
    const ENEMIES = [
        { name: "Gloom-cap", icon: "gloom-cap", color: "text-violet-400", hpBase: 12, hpScale: 4, dmgBase: 2, dmgScale: 1, ability: null, abilityDesc: "Basic attack" },
        { name: "Briar-wolf", icon: "briar-wolf", color: "text-rose-500", hpBase: 15, hpScale: 5, dmgBase: 3, dmgScale: 1.2, ability: "bleed", abilityDesc: "Can cause bleed" },
        { name: "Gloom-sprite", icon: "gloom-sprite", color: "text-sky-400", hpBase: 10, hpScale: 3, dmgBase: 4, dmgScale: 1, ability: "drain", abilityDesc: "Drains your surge" },
        { name: "Shadow Stalker", icon: "shadow-stalker", color: "text-gray-400", hpBase: 18, hpScale: 6, dmgBase: 5, dmgScale: 1.5, ability: "pierce", abilityDesc: "Pierces shields" },
        { name: "Grove Wraith", icon: "grove-wraith", color: "text-emerald-600", hpBase: 22, hpScale: 7, dmgBase: 3, dmgScale: 1, ability: "regen", abilityDesc: "Regenerates HP" },
        { name: "Bone Crawler", icon: "bone-crawler", color: "text-slate-400", hpBase: 25, hpScale: 8, dmgBase: 4, dmgScale: 1.3, ability: "armor", abilityDesc: "Takes reduced damage" },
        { name: "Crystal Golem", icon: "crystal-golem", color: "text-cyan-400", hpBase: 35, hpScale: 10, dmgBase: 6, dmgScale: 1.5, ability: "reflect", abilityDesc: "Reflects some damage" },
        { name: "Void Weaver", icon: "void-weaver", color: "text-indigo-400", hpBase: 20, hpScale: 6, dmgBase: 7, dmgScale: 2, ability: "curse", abilityDesc: "Curses reduce healing" },
        { name: "Inferno Beast", icon: "inferno-beast", color: "text-orange-500", hpBase: 28, hpScale: 9, dmgBase: 8, dmgScale: 2, ability: "burn", abilityDesc: "Burning damage over time" },
    ];

    // Boss enemies (appear every 5 floors)
    const BOSSES = [
        { name: "Ancient Treant", icon: "ancient-treant", color: "text-green-500", hpBase: 50, hpScale: 15, dmgBase: 6, dmgScale: 2, ability: "summon", abilityDesc: "Summons roots", isBoss: true },
        { name: "Elder Hydra", icon: "elder-hydra", color: "text-cyan-500", hpBase: 70, hpScale: 20, dmgBase: 8, dmgScale: 2.5, ability: "multiattack", abilityDesc: "Attacks 3 times", isBoss: true },
        { name: "Shadow Lord", icon: "shadow-lord", color: "text-gray-600", hpBase: 60, hpScale: 18, dmgBase: 10, dmgScale: 3, ability: "darkness", abilityDesc: "Hides some runes", isBoss: true },
        { name: "Dragon King", icon: "dragon-king", color: "text-yellow-500", hpBase: 100, hpScale: 25, dmgBase: 12, dmgScale: 3.5, ability: "inferno", abilityDesc: "Devastating fire breath", isBoss: true },
    ];

    const RUNE_TYPES = ['red', 'green', 'blue', 'yellow', 'purple', 'white'];

    // Loot tables
    const LOOT_MESSAGES = [
        "Found some gold coins!",
        "Discovered a small treasure!",
        "Looted the creature's hoard!",
        "Shiny coins scatter at your feet!",
    ];

    // --- State ---
    let state = {
        grid: [], // 2D array of {type, id, el}
        selected: [], // Array of {x, y}
        isDragging: false,
        
        moves: MOVES_PER_TURN,
        turn: 1,
        combo: 0,
        
        // Dungeon progress
        floor: 1,
        
        player: {
            hp: 25,
            maxHp: 25,
            shield: 0,
            xp: 0,
            maxXp: 15,
            level: 1,
            special: 0,
            maxSpecial: 10,
            dmgBonus: 0,
            specialRechargeBonus: 0,
            gold: 0,
            potions: 1,
            critChance: 0.1, // 10% base crit
            // Status effects
            bleed: 0,
            burn: 0,
            cursed: false,
        },
        
        enemy: null, // Current enemy object
        
        // Run statistics
        stats: {
            enemiesDefeated: 0,
            bossesDefeated: 0,
            damageDealt: 0,
            damageReceived: 0,
            goldEarned: 0,
            criticalHits: 0,
            longestChain: 0,
            potionsUsed: 0,
        },
        
        audioReady: false
    };

    // --- DOM Elements ---
    const boardElement = document.getElementById('game-board');
    const connectorSvg = document.getElementById('connector-svg');
    const floatingTextContainer = document.getElementById('floating-text-container');
    
    // Stats
    const elTurnStatus = document.getElementById('turn-status-text');
    const elFloorDisplay = document.getElementById('floor-display');
    const elCombo = document.getElementById('combo-text');
    const elComboVal = document.getElementById('combo-value');
    
    // Player UI
    const elPlayerHpBar = document.getElementById('player-hp-bar');
    const elPlayerHpText = document.getElementById('player-hp-text-overlay');
    const elPlayerShield = document.getElementById('player-shield-text');
    const elPlayerSpecialBar = document.getElementById('player-special-bar');
    const elPlayerSpecialText = document.getElementById('player-special-text');
    const elPlayerLevel = document.getElementById('player-level');
    const elPlayerPortrait = document.getElementById('player-portrait-container');
    const elPlayerGold = document.getElementById('player-gold');
    const elPlayerPotions = document.getElementById('player-potions');
    const btnSurge = document.getElementById('surge-btn');
    const btnPotion = document.getElementById('potion-btn');
    
    // Enemy UI
    const elEnemySection = document.getElementById('enemy-section');
    const elEnemyName = document.getElementById('enemy-name');
    const elEnemyLevel = document.getElementById('enemy-level');
    const elEnemyHpBar = document.getElementById('enemy-hp-bar');
    const elEnemyHpText = document.getElementById('enemy-hp-text');
    const elEnemyStatus = document.getElementById('enemy-action');
    const elEnemyPortrait = document.getElementById('enemy-portrait-container');
    
    // Modals
    const modalVictory = document.getElementById('modal');
    const elModalTitle = document.getElementById('modal-title');
    const elModalText = document.getElementById('modal-text');
    const elModalLoot = document.getElementById('modal-loot');
    const btnNextBattle = document.getElementById('modal-button');
    const modalGameover = document.getElementById('gameover-modal');
    const elGameoverStats = document.getElementById('gameover-stats');
    const btnRestart = document.getElementById('restart-button');
    const modalUpgrade = document.getElementById('upgrade-modal');
    const btnsUpgrade = document.querySelectorAll('.upgrade-choice');

    // --- Audio System ---
    let synthBoop, synthConnect, synthHit, synthHeal, synthShield, synthPowerup, synthSurge, synthCrit, synthBoss;
    
    async function initAudio() {
        if (state.audioReady) return;
        await Tone.start();
        
        synthBoop = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 } }).toDestination();
        synthConnect = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "triangle" }, envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 } }).toDestination();
        synthHit = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 } }).toDestination();
        synthHeal = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.1, decay: 0.5, sustain: 0.1, release: 0.5 } }).toDestination();
        synthShield = new Tone.MetalSynth({ harmonicity: 12, resonance: 800, modulationIndex: 20, envelope: { decay: 0.4, release: 0.2 } }).toDestination();
        synthPowerup = new Tone.Synth({ oscillator: { type: "triangle" }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 } }).toDestination();
        synthSurge = new Tone.MembraneSynth().toDestination();
        synthCrit = new Tone.Synth({ oscillator: { type: "sawtooth" }, envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.2 } }).toDestination();
        synthBoss = new Tone.FMSynth({ harmonicity: 8, modulationIndex: 2, envelope: { attack: 0.01, decay: 0.5, sustain: 0.1, release: 0.3 } }).toDestination();
        
        state.audioReady = true;
    }

    function playSound(type, val = 0) {
        if (!state.audioReady) return;
        try {
            switch (type) {
                case 'connect': 
                    const notes = ["C4", "D4", "E4", "G4", "A4", "C5", "D5", "E5", "G5", "A5"];
                    const note = notes[Math.min(val, notes.length - 1)];
                    synthConnect.triggerAttackRelease(note, "16n");
                    break;
                case 'attack': synthHit.triggerAttackRelease("16n"); break;
                case 'heal': synthHeal.triggerAttackRelease("C5", "8n"); break;
                case 'shield': synthShield.triggerAttackRelease("32n"); break;
                case 'powerup': synthPowerup.triggerAttackRelease("A5", "16n"); break;
                case 'surge': synthSurge.triggerAttackRelease("C2", "8n"); break;
                case 'enemy': synthSurge.triggerAttackRelease("G1", "4n"); break;
                case 'crit': 
                    synthCrit.triggerAttackRelease("E5", "8n");
                    setTimeout(() => synthCrit.triggerAttackRelease("G5", "8n"), 100);
                    break;
                case 'boss':
                    synthBoss.triggerAttackRelease("C2", "2n");
                    break;
                case 'gold':
                    synthPowerup.triggerAttackRelease("G5", "16n");
                    setTimeout(() => synthPowerup.triggerAttackRelease("C6", "16n"), 80);
                    break;
            }
        } catch (e) { console.error("Audio error", e); }
    }

    // --- Game Logic ---

    function init() {
        elPlayerPortrait.innerHTML = ICONS.player;
        spawnEnemy();
        generateGrid(true);
        updateUI();
        
        // Listeners
        boardElement.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        
        btnSurge.addEventListener('click', activateSurge);
        btnPotion?.addEventListener('click', usePotion);
        btnNextBattle.addEventListener('click', nextBattle);
        btnRestart.addEventListener('click', restartGame);
        
        btnsUpgrade.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const upgrade = e.currentTarget.dataset.upgrade;
                applyUpgrade(upgrade);
            });
        });
        
        // Init audio on first interaction
        document.body.addEventListener('click', initAudio, { once: true });
        
        resizeBoard();
        window.addEventListener('resize', resizeBoard);
    }
    
    function resizeBoard() {
        const w = boardElement.clientWidth;
        boardElement.style.height = `${w}px`;
        drawConnector(); 
    }

    function spawnEnemy() {
        const isBossFight = state.floor % BOSS_EVERY === 0;
        
        let template;
        let scaleMult;
        
        if (isBossFight) {
            // Pick boss based on floor
            const bossIndex = Math.min(Math.floor(state.floor / BOSS_EVERY) - 1, BOSSES.length - 1);
            template = BOSSES[bossIndex];
            scaleMult = Math.floor(state.floor / BOSS_EVERY);
            playSound('boss');
        } else {
            // Pick regular enemy based on floor
            const enemyIndex = Math.min(Math.floor((state.floor - 1) / 3), ENEMIES.length - 1);
            template = ENEMIES[Math.floor(Math.random() * (enemyIndex + 1))];
            scaleMult = state.floor;
        }
        
        state.enemy = {
            name: template.name,
            icon: template.icon,
            colorClass: template.color,
            maxHp: Math.floor(template.hpBase + (scaleMult - 1) * template.hpScale),
            damage: Math.floor(template.dmgBase + (scaleMult - 1) * template.dmgScale * 0.5),
            hp: Math.floor(template.hpBase + (scaleMult - 1) * template.hpScale),
            level: scaleMult,
            ability: template.ability,
            abilityDesc: template.abilityDesc,
            isBoss: template.isBoss || false,
            attackTimer: 1,
            // Status tracking
            armorReduction: template.ability === 'armor' ? 0.3 : 0,
            reflectDamage: template.ability === 'reflect' ? 0.2 : 0,
        };
        
        elEnemyPortrait.innerHTML = ICONS[template.icon] || ICONS['gloom-cap'];
        elEnemyName.className = `text-xl font-fantasy font-bold ${template.colorClass}`;
        
        // Boss flair
        if (state.enemy.isBoss) {
            elEnemyPortrait.classList.add('boss-portrait');
        } else {
            elEnemyPortrait.classList.remove('boss-portrait');
        }
        
        updateEnemyUI();
    }

    function generateGrid(full = false) {
        if (full) {
            state.grid = [];
            boardElement.innerHTML = '';
        }

        for (let x = 0; x < GRID_SIZE; x++) {
            if (!state.grid[x]) state.grid[x] = [];
            for (let y = 0; y < GRID_SIZE; y++) {
                if (!state.grid[x][y]) {
                    createRune(x, y);
                }
            }
        }
    }

    function createRune(x, y, falling = false) {
        const type = RUNE_TYPES[Math.floor(Math.random() * RUNE_TYPES.length)];
        const id = Math.random().toString(36).substr(2, 9);
        
        const el = document.createElement('div');
        el.className = `rune rune-${type}`;
        el.innerHTML = ICONS[type];
        el.dataset.x = x;
        el.dataset.y = y;
        el.dataset.id = id;
        
        if (falling) el.classList.add('animate-fall');
        
        state.grid[x][y] = { type, id, el, x, y };
    }
    
    function renderBoard() {
        boardElement.innerHTML = '';
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const rune = state.grid[x][y];
                if (rune) {
                    rune.el.dataset.x = x;
                    rune.el.dataset.y = y;
                    boardElement.appendChild(rune.el);
                    
                    if (state.selected.some(s => s.x === x && s.y === y)) {
                        rune.el.classList.add('selected');
                    } else {
                        rune.el.classList.remove('selected');
                    }
                }
            }
        }
        drawConnector();
    }

    // --- Interaction ---

    function getRuneAtEvent(e) {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (!target) return null;
        const runeEl = target.closest('.rune');
        if (!runeEl) return null;
        
        const x = parseInt(runeEl.dataset.x);
        const y = parseInt(runeEl.dataset.y);
        return { x, y, el: runeEl };
    }

    function onPointerDown(e) {
        state.isDragging = true;
        state.selected = [];
        const hit = getRuneAtEvent(e);
        if (hit) {
            selectRune(hit.x, hit.y);
            boardElement.setPointerCapture(e.pointerId);
        }
    }

    function onPointerMove(e) {
        if (!state.isDragging) return;
        const hit = getRuneAtEvent(e);
        if (!hit) return;
        
        const last = state.selected[state.selected.length - 1];
        
        if (last && last.x === hit.x && last.y === hit.y) return;
        
        // Backtrack
        if (state.selected.length > 1) {
            const prev = state.selected[state.selected.length - 2];
            if (prev.x === hit.x && prev.y === hit.y) {
                state.selected.pop();
                playSound('connect', state.selected.length);
                renderBoard();
                return;
            }
        }
        
        if (last) {
            const dx = Math.abs(hit.x - last.x);
            const dy = Math.abs(hit.y - last.y);
            if (dx <= 1 && dy <= 1 && (dx + dy > 0)) {
                const lastRune = state.grid[last.x][last.y];
                const newRune = state.grid[hit.x][hit.y];
                
                if (canConnect(lastRune, newRune)) {
                    if (!state.selected.some(s => s.x === hit.x && s.y === hit.y)) {
                        selectRune(hit.x, hit.y);
                    }
                }
            }
        }
    }

    function canConnect(a, b) {
        if (a.type === b.type) return true;
        if (a.type === 'white' || b.type === 'white') return true;
        return false;
    }

    function selectRune(x, y) {
        state.selected.push({ x, y });
        playSound('connect', state.selected.length - 1);
        renderBoard();
    }

    function onPointerUp(e) {
        if (!state.isDragging) return;
        state.isDragging = false;
        
        if (state.selected.length >= 3) {
            processMatch();
        } else {
            state.selected = [];
            renderBoard();
        }
    }
    
    function drawConnector() {
        if (state.selected.length < 2) {
            connectorSvg.innerHTML = '';
            return;
        }
        
        let pathStr = '';
        state.selected.forEach((pos, i) => {
            const rune = state.grid[pos.x][pos.y];
            const rect = rune.el.getBoundingClientRect();
            const parentRect = boardElement.getBoundingClientRect();
            
            const cx = (rect.left - parentRect.left) + rect.width / 2;
            const cy = (rect.top - parentRect.top) + rect.height / 2;
            
            if (i === 0) pathStr += `M ${cx} ${cy}`;
            else pathStr += ` L ${cx} ${cy}`;
        });
        
        connectorSvg.innerHTML = `<path d="${pathStr}" class="connector-line" />`;
    }

    // --- Game Mechanics ---

    function processMatch() {
        const len = state.selected.length;
        const runes = state.selected.map(p => state.grid[p.x][p.y]);
        
        // Track longest chain
        if (len > state.stats.longestChain) {
            state.stats.longestChain = len;
        }
        
        // Determine primary color
        const counts = {};
        runes.forEach(r => {
            if (r.type !== 'white') counts[r.type] = (counts[r.type] || 0) + 1;
        });
        
        let primaryType = 'white';
        let maxCount = 0;
        for (const t in counts) {
            if (counts[t] > maxCount) {
                maxCount = counts[t];
                primaryType = t;
            }
        }
        
        // Calculate power with combo bonus
        let power = len;
        const comboMultiplier = 1 + (state.combo * 0.15);
        
        // Critical hit check (longer chains have higher crit chance)
        const critBonus = len >= 6 ? 0.2 : (len >= 5 ? 0.1 : 0);
        const isCrit = Math.random() < (state.player.critChance + critBonus);
        
        if (isCrit) {
            power = Math.floor(power * 1.75);
            state.stats.criticalHits++;
            playSound('crit');
            screenShake(true);
        }
        
        // Apply effect
        applyEffect(primaryType, power, comboMultiplier, isCrit);
        
        // Remove tiles
        removeSelectedRunes();
        
        // Update turns
        state.moves--;
        if (state.moves <= 0) {
            endTurn();
        } else {
            updateUI();
        }
    }

    function applyEffect(type, power, comboMult, isCrit) {
        const baseDmg = 1 + state.player.dmgBonus; 
        
        let msg = "";
        let color = "#fff";
        let effectValue = 0;
        
        switch (type) {
            case 'red': // Damage
                effectValue = Math.floor(power * baseDmg * comboMult);
                damageEnemy(effectValue);
                msg = isCrit ? `💥 ${effectValue}!` : `-${effectValue}`;
                color = "#f43f5e";
                playSound('attack');
                break;
            case 'green': // Heal
                let heal = Math.floor(power * 1.5 * comboMult);
                if (state.player.cursed) {
                    heal = Math.floor(heal * 0.5);
                    msg = `+${heal} (cursed)`;
                } else {
                    msg = `+${heal} HP`;
                }
                healPlayer(heal);
                color = "#10b981";
                playSound('heal');
                break;
            case 'blue': // Special Charge
                const charge = Math.floor((power + state.player.specialRechargeBonus) * comboMult);
                chargeSpecial(charge);
                msg = `+${charge} Surge`;
                color = "#0ea5e9";
                playSound('powerup');
                break;
            case 'yellow': // Shield
                const block = Math.floor(power * 1.5 * comboMult);
                addShield(block);
                msg = `+${block} Shield`;
                color = "#f59e0b";
                playSound('shield');
                break;
            case 'purple': // Poison/Strong Damage
                effectValue = Math.floor(power * baseDmg * 1.3 * comboMult);
                damageEnemy(effectValue);
                msg = isCrit ? `☠️ ${effectValue}!` : `-${effectValue}!`;
                color = "#a78bfa";
                playSound('attack');
                break;
            case 'white': // Gold & XP
                const xp = Math.floor(power * 1.5);
                const gold = Math.floor(power * 2);
                gainXp(xp);
                gainGold(gold);
                msg = `+${xp} XP +${gold}g`;
                color = "#fef3c7";
                playSound('gold');
                break;
        }
        
        // Show floating text
        const centerRune = state.selected[Math.floor(state.selected.length / 2)];
        if (centerRune) {
            spawnFloatingText(state.grid[centerRune.x][centerRune.y].el, msg, color, isCrit);
        }
        
        // Increase combo
        state.combo++;
        elCombo.style.opacity = "1";
        elComboVal.innerText = `x${comboMult.toFixed(1)}`;
    }

    function removeSelectedRunes() {
        state.selected.forEach(p => {
            state.grid[p.x][p.y] = null;
        });
        state.selected = [];
        connectorSvg.innerHTML = '';
        
        // Refill grid
        for (let x = 0; x < GRID_SIZE; x++) {
            const newCol = [];
            for (let y = 0; y < GRID_SIZE; y++) {
                if (state.grid[x][y]) newCol.push(state.grid[x][y]);
            }
            
            const missing = GRID_SIZE - newCol.length;
            const updatedCol = new Array(GRID_SIZE);
            
            for (let i = 0; i < newCol.length; i++) {
                updatedCol[GRID_SIZE - newCol.length + i] = newCol[i];
                updatedCol[GRID_SIZE - newCol.length + i].y = GRID_SIZE - newCol.length + i;
            }
            
            for (let i = 0; i < missing; i++) {
                createRune(x, i, true);
                updatedCol[i] = state.grid[x][i];
                updatedCol[i].y = i;
            }
            
            state.grid[x] = updatedCol;
        }
        
        renderBoard();
        
        clearTimeout(state.comboTimer);
        state.comboTimer = setTimeout(() => {
            elCombo.style.opacity = "0";
        }, 2000);
    }

    function spawnFloatingText(targetEl, text, color, isBig = false) {
        if (!targetEl) return;
        const rect = targetEl.getBoundingClientRect();
        const parentRect = floatingTextContainer.getBoundingClientRect();
        
        const el = document.createElement('div');
        el.className = 'floating-text' + (isBig ? ' big-crit' : '');
        el.textContent = text;
        el.style.color = color;
        el.style.left = (rect.left - parentRect.left + rect.width / 2 - 30) + 'px';
        el.style.top = (rect.top - parentRect.top) + 'px';
        
        floatingTextContainer.appendChild(el);
        setTimeout(() => el.remove(), 1200);
    }
    
    function screenShake(big = false) {
        const container = document.getElementById('game-container');
        container.classList.add(big ? 'shake-big' : 'shake-small');
        setTimeout(() => {
            container.classList.remove('shake-big', 'shake-small');
        }, 300);
    }

    // --- Stats & Turns ---

    function damageEnemy(amount) {
        if (!state.enemy) return;
        
        // Apply armor reduction
        if (state.enemy.armorReduction > 0) {
            amount = Math.floor(amount * (1 - state.enemy.armorReduction));
        }
        
        state.enemy.hp -= amount;
        state.stats.damageDealt += amount;
        
        // Reflect damage
        if (state.enemy.reflectDamage > 0) {
            const reflected = Math.floor(amount * state.enemy.reflectDamage);
            if (reflected > 0) {
                state.player.hp -= reflected;
                spawnFloatingText(elPlayerPortrait, `-${reflected} reflected`, "#22d3ee");
            }
        }
        
        elEnemyHpBar.style.width = `${Math.max(0, (state.enemy.hp / state.enemy.maxHp) * 100)}%`;
        elEnemyHpText.textContent = `${Math.max(0, state.enemy.hp)}/${state.enemy.maxHp}`;
        
        elEnemyPortrait.classList.add('animate-shake');
        setTimeout(() => elEnemyPortrait.classList.remove('animate-shake'), 500);
        
        if (state.enemy.hp <= 0) {
            enemyDefeated();
        }
    }

    function healPlayer(amount) {
        state.player.hp = Math.min(state.player.hp + amount, state.player.maxHp);
        updateUI();
    }
    
    function addShield(amount) {
        state.player.shield += amount;
        updateUI();
    }
    
    function chargeSpecial(amount) {
        state.player.special = Math.min(state.player.special + amount, state.player.maxSpecial);
        updateUI();
    }
    
    function gainXp(amount) {
        state.player.xp += amount;
        if (state.player.xp >= state.player.maxXp) {
            levelUp();
        }
        updateUI();
    }
    
    function gainGold(amount) {
        state.player.gold += amount;
        state.stats.goldEarned += amount;
        updateUI();
    }

    function usePotion() {
        if (state.player.potions <= 0) return;
        
        state.player.potions--;
        state.stats.potionsUsed++;
        
        const healAmount = Math.floor(state.player.maxHp * 0.4);
        healPlayer(healAmount);
        
        // Clear negative status effects
        state.player.bleed = 0;
        state.player.burn = 0;
        state.player.cursed = false;
        
        playSound('heal');
        spawnFloatingText(elPlayerPortrait, `+${healAmount} HP`, "#10b981");
        updateUI();
    }

    function activateSurge() {
        if (state.player.special < state.player.maxSpecial) return;
        
        state.player.special = 0;
        playSound('surge');
        
        // Massive damage + heal + shield
        const surgeDmg = 15 + state.player.level * 3;
        damageEnemy(surgeDmg);
        healPlayer(8);
        addShield(8);
        
        screenShake(true);
        document.body.classList.add('animate-pulse-bright');
        setTimeout(() => document.body.classList.remove('animate-pulse-bright'), 1000);
        
        spawnFloatingText(elEnemyPortrait, `🌟 SURGE -${surgeDmg}!`, "#0ea5e9", true);
        
        updateUI();
    }

    function enemyDefeated() {
        state.stats.enemiesDefeated++;
        if (state.enemy.isBoss) {
            state.stats.bossesDefeated++;
        }
        
        // Calculate loot
        const baseGold = state.enemy.isBoss ? 30 : 10;
        const goldReward = baseGold + (state.floor * 3) + Math.floor(Math.random() * 10);
        const xpReward = state.enemy.isBoss ? 30 : 15;
        
        gainGold(goldReward);
        gainXp(xpReward);
        
        // Chance for potion drop
        const potionChance = state.enemy.isBoss ? 0.8 : 0.2;
        let potionDrop = 0;
        if (Math.random() < potionChance) {
            potionDrop = 1;
            state.player.potions++;
        }
        
        // Update modal
        elModalTitle.textContent = state.enemy.isBoss ? "🏆 Boss Defeated!" : "Victory!";
        elModalText.textContent = `You defeated the ${state.enemy.name}!`;
        elModalLoot.innerHTML = `
            <div class="loot-display">
                <span class="gold-reward">💰 +${goldReward} Gold</span>
                <span class="xp-reward">✨ +${xpReward} XP</span>
                ${potionDrop ? '<span class="potion-reward">🧪 +1 Potion</span>' : ''}
            </div>
        `;
        
        modalVictory.classList.add('visible');
        playSound('gold');
    }
    
    function nextBattle() {
        modalVictory.classList.remove('visible');
        
        state.floor++;
        state.moves = MOVES_PER_TURN;
        state.turn = 1;
        state.combo = 0;
        
        // Small heal between battles
        const restHeal = Math.floor(state.player.maxHp * 0.1);
        healPlayer(restHeal);
        
        // Clear some status effects between battles
        state.player.bleed = 0;
        state.player.burn = 0;
        
        spawnEnemy();
        updateUI();
        generateGrid(true);
        renderBoard();
    }
    
    function restartGame() {
        modalGameover.classList.remove('visible');
        
        // Reset all state
        state.floor = 1;
        state.player.hp = 25;
        state.player.maxHp = 25;
        state.player.shield = 0;
        state.player.special = 0;
        state.player.xp = 0;
        state.player.maxXp = 15;
        state.player.level = 1;
        state.player.dmgBonus = 0;
        state.player.specialRechargeBonus = 0;
        state.player.gold = 0;
        state.player.potions = 1;
        state.player.critChance = 0.1;
        state.player.bleed = 0;
        state.player.burn = 0;
        state.player.cursed = false;
        state.moves = MOVES_PER_TURN;
        state.combo = 0;
        
        // Reset stats
        state.stats = {
            enemiesDefeated: 0,
            bossesDefeated: 0,
            damageDealt: 0,
            damageReceived: 0,
            goldEarned: 0,
            criticalHits: 0,
            longestChain: 0,
            potionsUsed: 0,
        };
        
        spawnEnemy();
        generateGrid(true);
        renderBoard();
        updateUI();
    }

    function levelUp() {
        state.player.xp -= state.player.maxXp;
        state.player.maxXp = Math.floor(state.player.maxXp * 1.4);
        state.player.level++;
        
        // Full heal on level up!
        state.player.hp = state.player.maxHp;
        
        modalUpgrade.classList.add('visible');
        playSound('powerup');
    }
    
    function applyUpgrade(type) {
        switch (type) {
            case 'hp':
                state.player.maxHp += 8;
                state.player.hp = state.player.maxHp;
                break;
            case 'attack':
                state.player.dmgBonus += 1;
                state.player.critChance += 0.05;
                break;
            case 'special':
                state.player.specialRechargeBonus += 2;
                state.player.maxSpecial = Math.max(5, state.player.maxSpecial - 2);
                break;
        }
        modalUpgrade.classList.remove('visible');
        updateUI();
    }

    function endTurn() {
        elTurnStatus.textContent = "ENEMY TURN...";
        elTurnStatus.classList.replace('text-amber-400', 'text-rose-400');
        
        setTimeout(() => {
            if (!state.enemy || state.enemy.hp <= 0) return;
            
            // Apply player status effects first
            if (state.player.bleed > 0) {
                const bleedDmg = state.player.bleed;
                state.player.hp -= bleedDmg;
                state.player.bleed = Math.max(0, state.player.bleed - 1);
                spawnFloatingText(elPlayerPortrait, `-${bleedDmg} bleed`, "#dc2626");
            }
            
            if (state.player.burn > 0) {
                const burnDmg = state.player.burn;
                state.player.hp -= burnDmg;
                state.player.burn = Math.max(0, state.player.burn - 1);
                spawnFloatingText(elPlayerPortrait, `-${burnDmg} burn`, "#f97316");
            }
            
            // Enemy ability effects
            if (state.enemy.ability === 'regen') {
                const regenAmt = Math.floor(state.enemy.maxHp * 0.08);
                state.enemy.hp = Math.min(state.enemy.hp + regenAmt, state.enemy.maxHp);
                spawnFloatingText(elEnemyPortrait, `+${regenAmt}`, "#10b981");
            }
            
            // Enemy attacks
            let attackCount = 1;
            if (state.enemy.ability === 'multiattack') {
                attackCount = 3;
            }
            
            let totalDmg = 0;
            for (let i = 0; i < attackCount; i++) {
                let dmg = state.enemy.damage;
                if (attackCount > 1) dmg = Math.floor(dmg / 2); // Split damage for multi-attack
                
                // Pierce ability ignores shield
                const pierces = state.enemy.ability === 'pierce';
                
                if (!pierces && state.player.shield > 0) {
                    if (state.player.shield >= dmg) {
                        state.player.shield -= dmg;
                        dmg = 0;
                    } else {
                        dmg -= state.player.shield;
                        state.player.shield = 0;
                    }
                }
                
                totalDmg += dmg;
            }
            
            if (totalDmg > 0) {
                state.player.hp -= totalDmg;
                state.stats.damageReceived += totalDmg;
                playSound('enemy');
                screenShake(totalDmg > 10);
                
                elPlayerPortrait.classList.add('animate-shake');
                setTimeout(() => elPlayerPortrait.classList.remove('animate-shake'), 500);
                
                const dmgText = attackCount > 1 ? `-${totalDmg} (x${attackCount})` : `-${totalDmg}`;
                spawnFloatingText(elPlayerPortrait, dmgText, "#f43f5e");
            } else {
                playSound('shield');
                spawnFloatingText(elPlayerPortrait, "BLOCKED", "#f59e0b");
            }
            
            // Apply enemy ability status effects
            if (state.enemy.ability === 'bleed' && Math.random() < 0.4) {
                state.player.bleed = 3;
                spawnFloatingText(elPlayerPortrait, "BLEEDING!", "#dc2626");
            }
            if (state.enemy.ability === 'burn' && Math.random() < 0.5) {
                state.player.burn = 4;
                spawnFloatingText(elPlayerPortrait, "BURNING!", "#f97316");
            }
            if (state.enemy.ability === 'curse' && Math.random() < 0.3) {
                state.player.cursed = true;
                spawnFloatingText(elPlayerPortrait, "CURSED!", "#6366f1");
            }
            if (state.enemy.ability === 'drain') {
                const drained = Math.floor(state.player.special * 0.3);
                state.player.special -= drained;
                if (drained > 0) {
                    spawnFloatingText(elPlayerPortrait, `-${drained} Surge`, "#0ea5e9");
                }
            }
            
            updateUI();
            
            if (state.player.hp <= 0) {
                setTimeout(() => {
                    // Show stats on game over
                    elGameoverStats.innerHTML = `
                        <div class="stats-grid">
                            <div>📍 Floor reached: <strong>${state.floor}</strong></div>
                            <div>☠️ Enemies defeated: <strong>${state.stats.enemiesDefeated}</strong></div>
                            <div>👑 Bosses defeated: <strong>${state.stats.bossesDefeated}</strong></div>
                            <div>⚔️ Damage dealt: <strong>${state.stats.damageDealt}</strong></div>
                            <div>💰 Gold earned: <strong>${state.stats.goldEarned}</strong></div>
                            <div>💥 Critical hits: <strong>${state.stats.criticalHits}</strong></div>
                            <div>🔗 Longest chain: <strong>${state.stats.longestChain}</strong></div>
                        </div>
                    `;
                    modalGameover.classList.add('visible');
                }, 500);
            } else {
                state.moves = MOVES_PER_TURN;
                state.turn++;
                state.combo = 0;
                elCombo.style.opacity = "0";
                elTurnStatus.textContent = `Your Turn: ${state.moves}`;
                elTurnStatus.classList.replace('text-rose-400', 'text-amber-400');
            }
            
        }, 1000);
    }

    function updateUI() {
        // Player
        elPlayerHpBar.style.width = `${(state.player.hp / state.player.maxHp) * 100}%`;
        elPlayerHpText.textContent = `${state.player.hp} / ${state.player.maxHp}`;
        
        elPlayerShield.textContent = state.player.shield > 0 ? `🛡️ ${state.player.shield}` : '';
        
        elPlayerSpecialBar.style.width = `${(state.player.special / state.player.maxSpecial) * 100}%`;
        elPlayerSpecialText.textContent = `Wild Surge: ${state.player.special}/${state.player.maxSpecial}`;
        
        elPlayerLevel.textContent = `Lvl ${state.player.level}`;
        
        if (elPlayerGold) {
            elPlayerGold.textContent = `💰 ${state.player.gold}`;
        }
        
        if (elPlayerPotions) {
            elPlayerPotions.textContent = `🧪 ${state.player.potions}`;
        }
        
        if (state.player.special >= state.player.maxSpecial) {
            btnSurge.classList.remove('hidden');
        } else {
            btnSurge.classList.add('hidden');
        }
        
        if (btnPotion) {
            if (state.player.potions > 0) {
                btnPotion.classList.remove('hidden');
                btnPotion.disabled = false;
            } else {
                btnPotion.classList.add('hidden');
            }
        }
        
        // Floor display
        if (elFloorDisplay) {
            const isBoss = state.floor % BOSS_EVERY === 0;
            elFloorDisplay.innerHTML = isBoss 
                ? `<span class="text-amber-400">⚔️ BOSS FLOOR ${state.floor}</span>`
                : `Floor ${state.floor}`;
        }

        // Enemy
        updateEnemyUI();
        
        // Game Status
        if (state.moves > 0) {
            elTurnStatus.textContent = `Your Turn: ${state.moves}`;
        }
    }
    
    function updateEnemyUI() {
        if (!state.enemy) return;
        elEnemyName.textContent = state.enemy.name;
        elEnemyLevel.textContent = state.enemy.isBoss ? `BOSS` : `Lvl ${state.enemy.level}`;
        elEnemyHpBar.style.width = `${Math.max(0, (state.enemy.hp / state.enemy.maxHp) * 100)}%`;
        elEnemyHpText.textContent = `${Math.max(0, state.enemy.hp)}/${state.enemy.maxHp}`;
        
        // Show enemy intent
        let intentHTML = `<span class="text-rose-400">⚔️ ${state.enemy.damage} DMG</span>`;
        if (state.enemy.abilityDesc) {
            intentHTML += ` <span class="text-violet-400 text-xs">(${state.enemy.abilityDesc})</span>`;
        }
        elEnemyStatus.innerHTML = intentHTML;
    }

    // Init call
    init();
    
    // Initial render
    setTimeout(renderBoard, 100);

});
