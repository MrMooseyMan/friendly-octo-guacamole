document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration ---
    const GRID_SIZE = 6;
    const MOVES_PER_TURN = 3;
    const MAX_LEVEL = 10;
    
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
    };

    const ENEMIES = [
        { name: "Gloom-cap", icon: "gloom-cap", color: "text-rose-400", hpBase: 10, hpScale: 5, dmgBase: 2, dmgScale: 1 },
        { name: "Briar-wolf", icon: "briar-wolf", color: "text-rose-500", hpBase: 15, hpScale: 6, dmgBase: 3, dmgScale: 1.5 },
        { name: "Gloom-sprite", icon: "gloom-sprite", color: "text-sky-400", hpBase: 8, hpScale: 4, dmgBase: 4, dmgScale: 1 },
        { name: "Shadow Stalker", icon: "shadow-stalker", color: "text-gray-400", hpBase: 20, hpScale: 8, dmgBase: 5, dmgScale: 2 },
        { name: "Grove Wraith", icon: "grove-wraith", color: "text-emerald-600", hpBase: 25, hpScale: 10, dmgBase: 3, dmgScale: 1 }
    ];

    const RUNE_TYPES = ['red', 'green', 'blue', 'yellow', 'purple', 'white'];

    // --- State ---
    let state = {
        grid: [], // 2D array of {type, id, el}
        selected: [], // Array of {x, y}
        isDragging: false,
        
        moves: MOVES_PER_TURN,
        turn: 1,
        combo: 0,
        
        player: {
            hp: 20,
            maxHp: 20,
            shield: 0,
            xp: 0,
            maxXp: 10,
            level: 1,
            special: 0,
            maxSpecial: 10,
            dmgBonus: 0,
            specialRechargeBonus: 0
        },
        
        enemy: null, // Current enemy object
        
        audioReady: false
    };

    // --- DOM Elements ---
    const boardElement = document.getElementById('game-board');
    const connectorSvg = document.getElementById('connector-svg');
    const floatingTextContainer = document.getElementById('floating-text-container');
    
    // Stats
    const elTurnStatus = document.getElementById('turn-status-text');
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
    const btnSurge = document.getElementById('surge-btn');
    
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
    const btnNextBattle = document.getElementById('modal-button');
    const modalGameover = document.getElementById('gameover-modal');
    const btnRestart = document.getElementById('restart-button');
    const modalUpgrade = document.getElementById('upgrade-modal');
    const btnsUpgrade = document.querySelectorAll('.upgrade-choice');

    // --- Audio System ---
    let synthBoop, synthConnect, synthHit, synthHeal, synthShield, synthPowerup, synthSurge;
    
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
        
        state.audioReady = true;
    }

    function playSound(type, val = 0) {
        if (!state.audioReady) return;
        try {
            switch (type) {
                case 'connect': 
                    // Pentatonic scale rising
                    const notes = ["C4", "D4", "E4", "G4", "A4", "C5", "D5", "E5"];
                    const note = notes[Math.min(val, notes.length - 1)];
                    synthConnect.triggerAttackRelease(note, "16n");
                    break;
                case 'attack': synthHit.triggerAttackRelease("16n"); break;
                case 'heal': synthHeal.triggerAttackRelease("C5", "8n"); break;
                case 'shield': synthShield.triggerAttackRelease("32n"); break;
                case 'powerup': synthPowerup.triggerAttackRelease("A5", "16n"); break;
                case 'surge': synthSurge.triggerAttackRelease("C2", "8n"); break;
                case 'enemy': synthSurge.triggerAttackRelease("G1", "4n"); break;
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
        // Force square aspect ratio manually if CSS grid fails
        const w = boardElement.clientWidth;
        boardElement.style.height = `${w}px`;
        // Re-render connector if needed
        drawConnector(); 
    }

    function spawnEnemy() {
        const levelIndex = Math.min(Math.floor((state.player.level - 1) / 2), ENEMIES.length - 1);
        const template = ENEMIES[levelIndex] || ENEMIES[0];
        
        // Scale enemy stats
        const scaleMult = state.player.level;
        
        state.enemy = {
            name: template.name,
            icon: template.icon,
            colorClass: template.color,
            maxHp: Math.floor(template.hpBase + (scaleMult - 1) * template.hpScale),
            damage: Math.floor(template.dmgBase + (scaleMult - 1) * template.dmgScale),
            hp: Math.floor(template.hpBase + (scaleMult - 1) * template.hpScale),
            level: scaleMult,
            attackTimer: 1
        };
        
        elEnemyPortrait.innerHTML = ICONS[template.icon] || ICONS['gloom-cap'];
        elEnemyName.className = `text-xl font-fantasy font-bold ${template.colorClass}`;
        
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
        
        // Place in grid visually
        // We use CSS Grid, so order matters. But we have a 2D array state.
        // It's easier to append all and let CSS Grid flow? No, CSS Grid flows row by row usually.
        // But our array is x,y (col, row). 
        // We need absolute positioning OR we just render the whole board each frame?
        // Better: Just keep DOM synced.
        // Actually, CSS grid flows row-major (y then x).
        // Let's use absolute positioning for smooth animations? 
        // No, the prompt used CSS Grid. Let's try to map DOM nodes to grid cells.
        // Simplest: Re-render the whole board container content when grid changes?
        // Performance might be OK for 6x6.
        
        state.grid[x][y] = { type, id, el, x, y };
    }
    
    function renderBoard() {
        // Clear board
        boardElement.innerHTML = '';
        // Render in row-major order for CSS Grid (row 0, row 1...)
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const rune = state.grid[x][y];
                if (rune) {
                    // Ensure correct data attributes
                    rune.el.dataset.x = x;
                    rune.el.dataset.y = y;
                    boardElement.appendChild(rune.el);
                    
                    // Highlight selected
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
        // Handle touch or mouse
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
            // Capture pointer to track outside board
            boardElement.setPointerCapture(e.pointerId);
        }
    }

    function onPointerMove(e) {
        if (!state.isDragging) return;
        const hit = getRuneAtEvent(e);
        if (!hit) return;
        
        const last = state.selected[state.selected.length - 1];
        
        // Avoid re-selecting same tile
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
        
        // Check adjacency and type
        if (last) {
            const dx = Math.abs(hit.x - last.x);
            const dy = Math.abs(hit.y - last.y);
            // Allow diagonals
            if (dx <= 1 && dy <= 1 && (dx + dy > 0)) {
                const lastRune = state.grid[last.x][last.y];
                const newRune = state.grid[hit.x][hit.y];
                
                // Allow matching same color OR white (wild)
                if (canConnect(lastRune, newRune)) {
                    // Check if already selected
                    if (!state.selected.some(s => s.x === hit.x && s.y === hit.y)) {
                        selectRune(hit.x, hit.y);
                    }
                }
            }
        }
    }

    function canConnect(a, b) {
        if (a.type === b.type) return true;
        // White is wildcard
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
            // Cancel
            state.selected = [];
            renderBoard();
        }
    }
    
    function drawConnector() {
        if (state.selected.length < 2) {
            connectorSvg.innerHTML = '';
            return;
        }
        
        // Calculate centers
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
        
        // Determine primary color (most frequent excluding white)
        const counts = {};
        runes.forEach(r => {
            if (r.type !== 'white') counts[r.type] = (counts[r.type] || 0) + 1;
        });
        
        // If all white, it's white. Otherwise max color.
        let primaryType = 'white';
        let maxCount = 0;
        for (const t in counts) {
            if (counts[t] > maxCount) {
                maxCount = counts[t];
                primaryType = t;
            }
        }
        
        // Calculate power
        // Base: 1 per tile. 
        // Bonus: length > 3 => +1 per tile over 3? Or multiplier?
        // Prompt says "Combo: x1.0".
        // Let's say power = length.
        let power = len;
        
        // Apply effect
        applyEffect(primaryType, power);
        
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

    function applyEffect(type, power) {
        // Base damage bonus from player
        const baseDmg = 1 + state.player.dmgBonus; 
        
        let msg = "";
        let color = "#fff";
        
        switch (type) {
            case 'red': // Damage
                const dmg = Math.floor(power * baseDmg);
                damageEnemy(dmg);
                msg = `-${dmg}`;
                color = "#f43f5e";
                playSound('attack');
                break;
            case 'green': // Heal
                const heal = Math.floor(power * 1.5);
                healPlayer(heal);
                msg = `+${heal} HP`;
                color = "#10b981";
                playSound('heal');
                break;
            case 'blue': // Special Charge
                const charge = power + state.player.specialRechargeBonus;
                chargeSpecial(charge);
                msg = `+${charge} Surge`;
                color = "#0ea5e9";
                playSound('powerup');
                break;
            case 'yellow': // Shield
                const block = Math.floor(power * 1.5);
                addShield(block);
                msg = `+${block} Shield`;
                color = "#f59e0b";
                playSound('shield');
                break;
            case 'purple': // Poison/Direct Dmg for now
                const pDmg = Math.floor(power * baseDmg * 1.2); // Stronger damage
                damageEnemy(pDmg);
                msg = `-${pDmg}!`;
                color = "#a78bfa";
                playSound('attack');
                break;
            case 'white': // XP / Omni
                const xp = Math.floor(power * 2);
                gainXp(xp);
                msg = `+${xp} XP`;
                color = "#f1f5f9";
                playSound('powerup');
                break;
        }
        
        // Show floating text at center of match
        const centerRune = state.selected[Math.floor(state.selected.length / 2)];
        if (centerRune) {
            spawnFloatingText(state.grid[centerRune.x][centerRune.y].el, msg, color);
        }
        
        // Increase combo
        state.combo++;
        elCombo.style.opacity = "1";
        elComboVal.innerText = `x${(1 + state.combo * 0.1).toFixed(1)}`;
    }

    function removeSelectedRunes() {
        // Remove from data
        state.selected.forEach(p => {
            state.grid[p.x][p.y] = null;
        });
        state.selected = [];
        connectorSvg.innerHTML = '';
        
        // Refill grid
        // 1. Shift down
        for (let x = 0; x < GRID_SIZE; x++) {
            const newCol = [];
            for (let y = 0; y < GRID_SIZE; y++) {
                if (state.grid[x][y]) newCol.push(state.grid[x][y]);
            }
            
            // 2. Fill top
            const missing = GRID_SIZE - newCol.length;
            for (let i = 0; i < missing; i++) {
                // Temporarily store nulls or new objects, we need to create them properly
            }
            
            // Reconstruct column state
            // We need to preserve the objects but update their y coords
            // And insert new ones at the beginning (top)
            
            const updatedCol = new Array(GRID_SIZE);
            // Place existing at bottom
            for (let i = 0; i < newCol.length; i++) {
                updatedCol[GRID_SIZE - newCol.length + i] = newCol[i];
                updatedCol[GRID_SIZE - newCol.length + i].y = GRID_SIZE - newCol.length + i;
            }
            
            // Place new at top
            for (let i = 0; i < missing; i++) {
                createRune(x, i, true); // This updates state.grid[x][i] directly
                // But we need to move it to updatedCol to avoid overwriting
                updatedCol[i] = state.grid[x][i]; // createRune put it in state.grid[x][i]
                updatedCol[i].y = i;
            }
            
            state.grid[x] = updatedCol;
        }
        
        renderBoard();
        
        // Reset combo text fade timer
        clearTimeout(state.comboTimer);
        state.comboTimer = setTimeout(() => {
            elCombo.style.opacity = "0";
        }, 2000);
    }

    function spawnFloatingText(targetEl, text, color) {
        if (!targetEl) return;
        const rect = targetEl.getBoundingClientRect();
        const parentRect = floatingTextContainer.getBoundingClientRect();
        
        const el = document.createElement('div');
        el.className = 'floating-text';
        el.textContent = text;
        el.style.color = color;
        el.style.left = (rect.left - parentRect.left + rect.width / 2 - 20) + 'px';
        el.style.top = (rect.top - parentRect.top) + 'px';
        
        floatingTextContainer.appendChild(el);
        setTimeout(() => el.remove(), 1000);
    }

    // --- Stats & Turns ---

    function damageEnemy(amount) {
        if (!state.enemy) return;
        state.enemy.hp -= amount;
        elEnemyHpBar.style.width = `${Math.max(0, (state.enemy.hp / state.enemy.maxHp) * 100)}%`;
        elEnemyHpText.textContent = `${state.enemy.hp}/${state.enemy.maxHp}`;
        
        // Shake enemy portrait
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

    function activateSurge() {
        if (state.player.special < state.player.maxSpecial) return;
        
        state.player.special = 0;
        playSound('surge');
        
        // Massive damage + heal + shield
        damageEnemy(10 + state.player.level * 2);
        healPlayer(5);
        addShield(5);
        
        // Visuals
        document.body.classList.add('animate-pulse-bright');
        setTimeout(() => document.body.classList.remove('animate-pulse-bright'), 1000);
        
        updateUI();
    }

    function enemyDefeated() {
        modalVictory.classList.add('visible');
        playSound('powerup');
        gainXp(10); // Bonus XP for kill
    }
    
    function nextBattle() {
        modalVictory.classList.remove('visible');
        // Increase difficulty slightly or just same level logic
        spawnEnemy();
        state.moves = MOVES_PER_TURN;
        state.turn = 1;
        state.player.shield = 0; // Shield resets between battles usually? Or keep it? Let's reset.
        updateUI();
        generateGrid(true); // New board
        renderBoard();
    }
    
    function restartGame() {
        modalGameover.classList.remove('visible');
        state.player.hp = state.player.maxHp;
        state.player.shield = 0;
        state.player.special = 0;
        state.player.xp = 0;
        state.player.level = 1;
        state.player.dmgBonus = 0;
        state.player.specialRechargeBonus = 0;
        state.moves = MOVES_PER_TURN;
        
        spawnEnemy();
        generateGrid(true);
        renderBoard();
        updateUI();
    }

    function levelUp() {
        state.player.xp -= state.player.maxXp;
        state.player.maxXp = Math.floor(state.player.maxXp * 1.5);
        state.player.level++;
        
        modalUpgrade.classList.add('visible');
        playSound('powerup');
    }
    
    function applyUpgrade(type) {
        switch (type) {
            case 'hp':
                state.player.maxHp += 5;
                state.player.hp = state.player.maxHp;
                break;
            case 'attack':
                state.player.dmgBonus += 1;
                break;
            case 'special':
                state.player.specialRechargeBonus += 1; // More surge per blue
                state.player.maxSpecial = Math.max(5, state.player.maxSpecial - 2); // Lower cost
                break;
        }
        modalUpgrade.classList.remove('visible');
        updateUI();
    }

    function endTurn() {
        // Enemy Turn
        elTurnStatus.textContent = "ENEMY TURN...";
        elTurnStatus.classList.replace('text-amber-400', 'text-rose-400');
        
        // Delay for dramatic effect
        setTimeout(() => {
            if (!state.enemy || state.enemy.hp <= 0) return;
            
            // Enemy attacks
            let dmg = state.enemy.damage;
            
            // Shield logic
            if (state.player.shield > 0) {
                if (state.player.shield >= dmg) {
                    state.player.shield -= dmg;
                    dmg = 0;
                } else {
                    dmg -= state.player.shield;
                    state.player.shield = 0;
                }
            }
            
            if (dmg > 0) {
                state.player.hp -= dmg;
                playSound('enemy');
                // Shake player portrait
                elPlayerPortrait.classList.add('animate-shake');
                setTimeout(() => elPlayerPortrait.classList.remove('animate-shake'), 500);
                
                spawnFloatingText(elPlayerPortrait, `-${dmg}`, "#f43f5e");
            } else {
                playSound('shield');
                spawnFloatingText(elPlayerPortrait, "BLOCKED", "#f59e0b");
            }
            
            updateUI();
            
            if (state.player.hp <= 0) {
                setTimeout(() => {
                    modalGameover.classList.add('visible');
                }, 500);
            } else {
                // Back to player
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
        
        elPlayerLevel.textContent = `Lvl ${state.player.level} (${state.player.xp}/${state.player.maxXp} XP)`;
        
        if (state.player.special >= state.player.maxSpecial) {
            btnSurge.classList.remove('hidden');
        } else {
            btnSurge.classList.add('hidden');
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
        elEnemyLevel.textContent = `Lvl ${state.enemy.level}`;
        elEnemyHpBar.style.width = `${Math.max(0, (state.enemy.hp / state.enemy.maxHp) * 100)}%`;
        elEnemyHpText.textContent = `${state.enemy.hp}/${state.enemy.maxHp}`;
        elEnemyStatus.innerHTML = `<span class="font-bold text-rose-400">⚔️ ${state.enemy.damage} DMG</span>`;
    }

    // Init call
    init();
    
    // Initial render
    setTimeout(renderBoard, 100);

});
