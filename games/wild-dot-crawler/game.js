document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration ---
    const GRID_SIZE = 6;
    const BASE_MOVES_PER_TURN = 3;
    const MAX_FLOOR = 50;
    const BOSS_EVERY = 5;
    const META_KEY = 'wild-dot-crawler-meta';
    const MAX_CASCADE_DEPTH = 3;

    // --- Data ---
    const ICONS = {
        // RUNES
        red: `<svg viewBox="0 0 24 24"><path d="M19.1 1.9c-1.1-1.1-2.7-1.7-4.3-1.7-1.6 0-3.2.6-4.3 1.7L1.9 10.5c-1.1 1.1-1.7 2.7-1.7 4.3s.6 3.2 1.7 4.3l1.8 1.8c1.1 1.1 2.7 1.7 4.3 1.7s3.2-.6 4.3-1.7l8.6-8.6c1.1-1.1 1.7-2.7 1.7-4.3s-.6-3.2-1.7-4.3zM18 10.2l-8.6 8.6c-.4.4-1 .4-1.4 0l-1.8-1.8c-.4-.4-.4-1 0-1.4l8.6-8.6c.4-.4 1-.4 1.4 0l1.8 1.8c.4.4.4 1 0 1.4zM4.7 17.5l-1.8-1.8c-.8-.8-.8-2 0-2.8l8.6-8.6c.8-.8 2-.8 2.8 0l1.8 1.8c.8.8.8 2 0 2.8l-8.6 8.6c-.8.8-2 .8-2.8 0z"></path></svg>`,
        green: `<svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"></path><path d="M12 4c-2.1 0-4 1.3-4.8 3.2-.3.6.3 1.2.9 1.2h7.8c.6 0 1.2-.6.9-1.2C16 5.3 14.1 4 12 4z"></path><path d="M12 14c2.1 0 4-1.3 4.8-3.2.3-.6-.3-1.2-.9-1.2H8.1c-.6 0-1.2.6-.9 1.2C8 12.7 9.9 14 12 14z"></path><path d="M12 20c-2.1 0-4-1.3-4.8-3.2-.3-.6.3-1.2.9-1.2h7.8c.6 0 1.2-.6.9-1.2C16 18.7 14.1 20 12 20z"></path></svg>`,
        blue: `<svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-2.8-11.2c.4-.4 1-.4 1.4 0l3.5 3.5c.4.4.4 1 0 1.4l-3.5 3.5c-.4.4-1 .4-1.4 0l-3.5-3.5c-.4-.4-.4-1 0-1.4l3.5-3.5z"></path></svg>`,
        yellow: `<svg viewBox="0 0 24 24"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.2l8.2 4.1v7.4L12 19.8l-8.2-4.1V8.3L12 4.2zM4 8.3v7.4l8 4v-7.4l-8-4zM12 12.2l-8-4 8-4 8 4-8 4z"></path></svg>`,
        purple: `<svg viewBox="0 0 24 24"><path d="M12 2c-3.3 0-6 2.7-6 6 0 3.1 2.2 5.7 5.1 6V22h1.8v-8c2.9-.3 5.1-2.9 5.1-6 0-3.3-2.7-6-6-6zm0 10.5c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z"></path></svg>`,
        white: `<svg viewBox="0 0 24 24"><path d="M12 2l2.6 7.2H22l-6 4.4 2.3 7.2L12 16.4 5.7 20.8 8 13.6 2 9.2h7.4L12 2z"></path></svg>`,

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
        'frost-wisp': `<svg viewBox="0 0 100 100" fill="#38bdf8"><circle cx="50" cy="50" r="15" fill="#e0f2fe"></circle><path d="M50 30 L50 20 M50 70 L50 80 M30 50 L20 50 M70 50 L80 50 M35 35 L28 28 M65 65 L72 72 M35 65 L28 72 M65 35 L72 28" stroke="#bae6fd" stroke-width="3"></path><circle cx="50" cy="50" r="25" fill="#38bdf8" fill-opacity="0.3"></circle></svg>`,

        // BOSSES
        'ancient-treant': `<svg viewBox="0 0 100 100" fill="#166534"><path d="M40 90 L40 60 L30 60 L30 55 L35 50 L25 40 L35 35 L30 25 L45 30 L50 15 L55 30 L70 25 L65 35 L75 40 L65 50 L70 55 L70 60 L60 60 L60 90 Z"></path><circle cx="40" cy="45" r="6" fill="#fde047"></circle><circle cx="60" cy="45" r="6" fill="#fde047"></circle><path d="M40 60 C50 70, 50 70, 60 60" stroke="#84cc16" stroke-width="3" fill="none"></path></svg>`,
        'frost-giant': `<svg viewBox="0 0 100 100" fill="#0284c7"><path d="M30 30 L70 30 L80 50 L70 90 L30 90 L20 50 Z"></path><rect x="35" y="10" width="30" height="25" fill="#bae6fd"></rect><circle cx="40" cy="45" r="5" fill="#f0f9ff"></circle><circle cx="60" cy="45" r="5" fill="#f0f9ff"></circle><path d="M20 50 L10 70 L30 60 Z" fill="#0284c7"></path><path d="M80 50 L90 70 L70 60 Z" fill="#0284c7"></path></svg>`,
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
        { name: "Frost Wisp", icon: "frost-wisp", color: "text-sky-300", hpBase: 14, hpScale: 4, dmgBase: 3, dmgScale: 1, ability: "freeze", abilityDesc: "Freezes runes" },
    ];

    // Boss enemies (appear every 5 floors)
    const BOSSES = [
        { name: "Ancient Treant", icon: "ancient-treant", color: "text-green-500", hpBase: 50, hpScale: 15, dmgBase: 6, dmgScale: 2, ability: "summon", abilityDesc: "Summons roots", isBoss: true },
        { name: "Frost Giant", icon: "frost-giant", color: "text-sky-600", hpBase: 65, hpScale: 16, dmgBase: 9, dmgScale: 2.5, ability: "freeze_area", abilityDesc: "Freezes large area", isBoss: true },
        { name: "Elder Hydra", icon: "elder-hydra", color: "text-cyan-500", hpBase: 70, hpScale: 20, dmgBase: 8, dmgScale: 2.5, ability: "multiattack", abilityDesc: "Attacks 3 times", isBoss: true },
        { name: "Shadow Lord", icon: "shadow-lord", color: "text-gray-600", hpBase: 60, hpScale: 18, dmgBase: 10, dmgScale: 3, ability: "darkness", abilityDesc: "Hides some runes", isBoss: true },
        { name: "Dragon King", icon: "dragon-king", color: "text-yellow-500", hpBase: 100, hpScale: 25, dmgBase: 12, dmgScale: 3.5, ability: "inferno", abilityDesc: "Devastating fire breath", isBoss: true },
    ];

    const RUNE_TYPES = ['red', 'green', 'blue', 'yellow', 'purple', 'white'];

    // --- Upgrade Pool ---
    const UPGRADE_POOL = [
        { id: 'hp', name: 'Primal Vigor', icon: '\u{1F49A}', desc: '+8 Max HP & Full Heal', colorBg: 'emerald' },
        { id: 'attack', name: 'Sharpened Claws', icon: '\u{2694}\u{FE0F}', desc: '+1 Damage & +5% Crit', colorBg: 'rose' },
        { id: 'special', name: 'Wild Attunement', icon: '\u{26A1}', desc: 'Charge Surge Faster', colorBg: 'sky' },
        { id: 'thorns', name: 'Thorn Shield', icon: '\u{1F33F}', desc: 'Reflect 2 damage when hit', colorBg: 'lime' },
        { id: 'lifesteal', name: 'Vampiric Fang', icon: '\u{1F987}', desc: 'Attacks heal 15% of damage', colorBg: 'red' },
        { id: 'extramove', name: 'Swift Paws', icon: '\u{1F43E}', desc: '+1 Move per turn', colorBg: 'amber', unique: true },
        { id: 'goldfind', name: "Fortune's Favor", icon: '\u{1F340}', desc: '+50% gold earned', colorBg: 'yellow' },
        { id: 'surgedmg', name: 'Surge Mastery', icon: '\u{1F31F}', desc: '+50% Surge damage', colorBg: 'cyan' },
        { id: 'ironskin', name: 'Iron Bark', icon: '\u{1FAA8}', desc: '-20% damage taken', colorBg: 'stone' },
        { id: 'chainbonus', name: 'Chain Lightning', icon: '\u{26D3}\u{FE0F}', desc: '5+ chains deal 50% bonus', colorBg: 'indigo' },
        { id: 'regen', name: "Nature's Gift", icon: '\u{1F331}', desc: 'Heal 3 HP each turn', colorBg: 'green' },
        { id: 'shieldmaster', name: 'Aegis', icon: '\u{1F6E1}\u{FE0F}', desc: '+50% shield from yellow runes', colorBg: 'orange' },
    ];

    // --- Achievements ---
    const ACHIEVEMENTS = [
        { id: 'first_run', name: 'First Steps', desc: 'Complete your first run', check: m => m.totalRuns >= 1, perk: '+3 Starting HP' },
        { id: 'veteran', name: 'Veteran Explorer', desc: 'Complete 5 runs', check: m => m.totalRuns >= 5, perk: '+1 Starting Potion' },
        { id: 'boss_slayer', name: 'Boss Slayer', desc: 'Slay 5 bosses total', check: m => m.totalBossesKilled >= 5, perk: '+1 Starting Damage' },
        { id: 'hoarder', name: 'Treasure Hunter', desc: 'Earn 500 gold total', check: m => m.totalGoldEarned >= 500, perk: 'Start with 15 Gold' },
        { id: 'deep_delver', name: 'Deep Delver', desc: 'Reach floor 15', check: m => m.bestFloor >= 15, perk: '+5% Crit Chance' },
        { id: 'centurion', name: 'Centurion', desc: 'Slay 100 enemies total', check: m => m.totalEnemiesKilled >= 100, perk: '+2 Surge Charge' },
        { id: 'floor_30', name: 'Abyss Walker', desc: 'Reach floor 30', check: m => m.bestFloor >= 30, perk: '+10 Max HP' },
        { id: 'dragon', name: 'Dragon Slayer', desc: 'Defeat the Dragon King', check: m => m.dragonKingDefeated === true, perk: '+1 Move per Turn' },
    ];

    // --- Meta Persistence ---
    function loadMeta() {
        try {
            const saved = localStorage.getItem(META_KEY);
            if (saved) return JSON.parse(saved);
        } catch(e) {}
        return {
            totalRuns: 0,
            bestFloor: 0,
            totalEnemiesKilled: 0,
            totalBossesKilled: 0,
            totalGoldEarned: 0,
            dragonKingDefeated: false,
            achievements: [],
        };
    }

    function saveMeta() {
        try {
            localStorage.setItem(META_KEY, JSON.stringify(meta));
        } catch(e) {}
    }

    function checkNewAchievements() {
        const newOnes = [];
        ACHIEVEMENTS.forEach(a => {
            if (!meta.achievements.includes(a.id) && a.check(meta)) {
                meta.achievements.push(a.id);
                newOnes.push(a);
            }
        });
        if (newOnes.length > 0) saveMeta();
        return newOnes;
    }

    function applyMetaPerks(player) {
        meta.achievements.forEach(aId => {
            switch(aId) {
                case 'first_run': player.maxHp += 3; player.hp += 3; break;
                case 'veteran': player.potions += 1; break;
                case 'boss_slayer': player.dmgBonus += 1; break;
                case 'hoarder': player.gold += 15; break;
                case 'deep_delver': player.critChance += 0.05; break;
                case 'centurion': player.specialRechargeBonus += 2; break;
                case 'floor_30': player.maxHp += 10; player.hp += 10; break;
                // dragon: handled via getMovesPerTurn
            }
        });
    }

    function getMovesPerTurn() {
        let moves = BASE_MOVES_PER_TURN;
        if (state.player.upgrades.includes('extramove')) moves++;
        if (meta.achievements.includes('dragon')) moves++;
        return moves;
    }

    let meta = loadMeta();

    // --- State ---
    let state = {
        grid: [],
        selected: [],
        isDragging: false,
        processing: false,

        moves: BASE_MOVES_PER_TURN,
        turn: 1,
        combo: 0,

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
            critChance: 0.1,
            bleed: 0,
            burn: 0,
            cursed: false,
            // Upgrade tracking
            upgrades: [],
            // Perk values (set by upgrades)
            thorns: 0,
            lifestealPct: 0,
            goldFindBonus: 0,
            surgeDmgBonus: 0,
            dmgReduction: 0,
            chainBonusPct: 0,
            regenPerTurn: 0,
            shieldBonus: 0,
        },

        enemy: null,

        stats: {
            enemiesDefeated: 0,
            bossesDefeated: 0,
            damageDealt: 0,
            damageReceived: 0,
            goldEarned: 0,
            criticalHits: 0,
            longestChain: 0,
            potionsUsed: 0,
            cascades: 0,
        },

        audioReady: false
    };

    // --- DOM Elements ---
    const boardElement = document.getElementById('game-board');
    const connectorSvg = document.getElementById('connector-svg');
    const floatingTextContainer = document.getElementById('floating-text-container');

    const elTurnStatus = document.getElementById('turn-status-text');
    const elFloorDisplay = document.getElementById('floor-display');
    const elCombo = document.getElementById('combo-text');
    const elComboVal = document.getElementById('combo-value');

    const elPlayerHpBar = document.getElementById('player-hp-bar');
    const elPlayerHpText = document.getElementById('player-hp-text-overlay');
    const elPlayerShield = document.getElementById('player-shield-text');
    const elPlayerSpecialBar = document.getElementById('player-special-bar');
    const elPlayerSpecialText = document.getElementById('player-special-text');
    const elPlayerLevel = document.getElementById('player-level');
    const elPlayerPortrait = document.getElementById('player-portrait-container');
    const elPlayerGold = document.getElementById('player-gold');
    const elPlayerPotions = document.getElementById('player-potions');
    const elPerksDisplay = document.getElementById('perks-display');
    const btnSurge = document.getElementById('surge-btn');
    const btnPotion = document.getElementById('potion-btn');
    const btnShuffle = document.getElementById('shuffle-btn');

    const elEnemySection = document.getElementById('enemy-section');
    const elEnemyName = document.getElementById('enemy-name');
    const elEnemyLevel = document.getElementById('enemy-level');
    const elEnemyHpBar = document.getElementById('enemy-hp-bar');
    const elEnemyHpText = document.getElementById('enemy-hp-text');
    const elEnemyStatus = document.getElementById('enemy-action');
    const elEnemyPortrait = document.getElementById('enemy-portrait-container');

    const modalVictory = document.getElementById('modal');
    const elModalTitle = document.getElementById('modal-title');
    const elModalText = document.getElementById('modal-text');
    const elModalLoot = document.getElementById('modal-loot');
    const btnNextBattle = document.getElementById('modal-button');
    const modalGameover = document.getElementById('gameover-modal');
    const elGameoverStats = document.getElementById('gameover-stats');
    const btnRestart = document.getElementById('restart-button');
    const modalUpgrade = document.getElementById('upgrade-modal');
    const elUpgradeChoices = document.getElementById('upgrade-choices');
    const elAchievementNotif = document.getElementById('achievement-notification');

    // --- Audio System ---
    let synthBoop, synthConnect, synthHit, synthHeal, synthShield, synthPowerup, synthSurge, synthCrit, synthBoss, synthCascade;

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
        synthCascade = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 0.02, decay: 0.3, sustain: 0.1, release: 0.3 } }).toDestination();

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
                case 'cascade':
                    const cascadeNotes = ["E5", "G5", "B5", "D6"];
                    const cn = cascadeNotes[Math.min(val, cascadeNotes.length - 1)];
                    synthCascade.triggerAttackRelease(cn, "8n");
                    break;
                case 'achievement':
                    synthPowerup.triggerAttackRelease("C5", "8n");
                    setTimeout(() => synthPowerup.triggerAttackRelease("E5", "8n"), 120);
                    setTimeout(() => synthPowerup.triggerAttackRelease("G5", "8n"), 240);
                    break;
            }
        } catch (e) { console.error("Audio error", e); }
    }

    // --- Game Logic ---

    function init() {
        applyMetaPerks(state.player);
        state.moves = getMovesPerTurn();

        elPlayerPortrait.innerHTML = ICONS.player;
        spawnEnemy();
        generateGrid(true);
        updateUI();
        showActivePerks();

        // Listeners
        boardElement.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        btnSurge.addEventListener('click', activateSurge);
        btnPotion?.addEventListener('click', usePotion);
        btnShuffle?.addEventListener('click', shuffleBoard);
        btnNextBattle.addEventListener('click', nextBattle);
        btnRestart.addEventListener('click', restartGame);

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

    function showActivePerks() {
        if (!elPerksDisplay) return;
        if (meta.achievements.length === 0) {
            elPerksDisplay.style.display = 'none';
            return;
        }
        const perkNames = meta.achievements.map(aId => {
            const a = ACHIEVEMENTS.find(x => x.id === aId);
            return a ? a.perk : '';
        }).filter(Boolean);

        if (perkNames.length > 0) {
            elPerksDisplay.style.display = 'block';
            elPerksDisplay.innerHTML = perkNames.map(p =>
                `<span class="perk-tag">${p}</span>`
            ).join('');
            // Auto-hide after 3 seconds
            setTimeout(() => {
                elPerksDisplay.style.opacity = '0';
                setTimeout(() => { elPerksDisplay.style.display = 'none'; elPerksDisplay.style.opacity = '1'; }, 500);
            }, 3000);
        }
    }

    function spawnEnemy() {
        const isBossFight = state.floor % BOSS_EVERY === 0;

        let template;
        let scaleMult;

        if (isBossFight) {
            const bossIndex = Math.min(Math.floor(state.floor / BOSS_EVERY) - 1, BOSSES.length - 1);
            template = BOSSES[bossIndex];
            scaleMult = Math.floor(state.floor / BOSS_EVERY);
            playSound('boss');
        } else {
            const enemyIndex = Math.min(Math.floor((state.floor - 1) / 3), ENEMIES.length - 1);
            template = ENEMIES[Math.floor(Math.random() * (enemyIndex + 1))];
            scaleMult = state.floor;
        }

        // Late-game scaling: steeper after floor 20
        let hpMult = 1;
        let dmgMult = 1;
        if (state.floor > 20) {
            hpMult = 1 + (state.floor - 20) * 0.03;
            dmgMult = 1 + (state.floor - 20) * 0.02;
        }

        state.enemy = {
            name: template.name,
            icon: template.icon,
            colorClass: template.color,
            maxHp: Math.floor((template.hpBase + (scaleMult - 1) * template.hpScale) * hpMult),
            damage: Math.floor((template.dmgBase + (scaleMult - 1) * template.dmgScale * 0.5) * dmgMult),
            hp: 0,
            level: scaleMult,
            ability: template.ability,
            abilityDesc: template.abilityDesc,
            isBoss: template.isBoss || false,
            attackTimer: 1,
            armorReduction: template.ability === 'armor' ? 0.3 : 0,
            reflectDamage: template.ability === 'reflect' ? 0.2 : 0,
            enraged: false,
        };
        state.enemy.hp = state.enemy.maxHp;

        elEnemyPortrait.innerHTML = ICONS[template.icon] || ICONS['gloom-cap'];
        elEnemyName.className = `text-xl font-fantasy font-bold ${template.colorClass}`;

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

        // Ensure board diversity - no single color should dominate
        ensureBoardDiversity();
    }

    function ensureBoardDiversity() {
        const counts = {};
        RUNE_TYPES.forEach(t => counts[t] = 0);
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let y = 0; y < GRID_SIZE; y++) {
                if (state.grid[x][y]) counts[state.grid[x][y].type]++;
            }
        }

        // If any type has more than 12 tiles (1/3 of board), swap some
        const maxAllowed = 12;
        RUNE_TYPES.forEach(type => {
            while (counts[type] > maxAllowed) {
                // Find a rune of this type and change it to the least represented type
                const minType = RUNE_TYPES.reduce((a, b) => counts[a] < counts[b] ? a : b);
                for (let x = 0; x < GRID_SIZE; x++) {
                    for (let y = 0; y < GRID_SIZE; y++) {
                        if (state.grid[x][y] && state.grid[x][y].type === type && counts[type] > maxAllowed) {
                            state.grid[x][y].type = minType;
                            state.grid[x][y].el.className = `rune rune-${minType}`;
                            state.grid[x][y].el.innerHTML = ICONS[minType];
                            counts[type]--;
                            counts[minType]++;
                        }
                    }
                }
            }
        });
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

        state.grid[x][y] = { type, id, el, x, y, frozenTurns: 0 };
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

                    // Frozen state
                    if (rune.frozenTurns > 0) {
                        rune.el.classList.add('frozen');
                        rune.el.dataset.frozenTurns = rune.frozenTurns;
                    } else {
                        rune.el.classList.remove('frozen');
                        delete rune.el.dataset.frozenTurns;
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
        if (state.processing) return;
        state.isDragging = true;
        state.selected = [];
        const hit = getRuneAtEvent(e);
        if (hit) {
            const rune = state.grid[hit.x][hit.y];
            if (rune.frozenTurns > 0) {
                spawnFloatingText(rune.el, `Frozen ${rune.frozenTurns}t`, "#38bdf8");
                state.isDragging = false;
                return;
            }
            selectRune(hit.x, hit.y);
            boardElement.setPointerCapture(e.pointerId);
        }
    }

    function onPointerMove(e) {
        if (!state.isDragging || state.processing) return;
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
        if (a.frozenTurns > 0 || b.frozenTurns > 0) return false;
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
        state.processing = true;

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

        // Chain bonus upgrade
        if (len >= 5 && state.player.chainBonusPct > 0) {
            power = Math.floor(power * (1 + state.player.chainBonusPct));
        }

        // Critical hit check
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

        // Remove tiles and refill
        removeSelectedRunes();

        // Check for cascades, then finish the move
        setTimeout(() => {
            checkAndProcessCascades(0, () => {
                state.moves--;
                state.processing = false;
                if (state.moves <= 0) {
                    endTurn();
                } else {
                    updateUI();
                }
            });
        }, 350);
    }

    function applyEffect(type, power, comboMult, isCrit) {
        const baseDmg = 1 + state.player.dmgBonus;

        let msg = "";
        let color = "#fff";
        let effectValue = 0;

        switch (type) {
            case 'red': { // Damage
                effectValue = Math.floor(power * baseDmg * comboMult);
                damageEnemy(effectValue);
                // Lifesteal
                if (state.player.lifestealPct > 0) {
                    const stolen = Math.floor(effectValue * state.player.lifestealPct);
                    if (stolen > 0) healPlayer(stolen);
                }
                msg = isCrit ? `\u{1F4A5} ${effectValue}!` : `-${effectValue}`;
                color = "#f43f5e";
                playSound('attack');
                break;
            }
            case 'green': { // Heal
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
            }
            case 'blue': { // Special Charge
                const charge = Math.floor((power + state.player.specialRechargeBonus) * comboMult);
                chargeSpecial(charge);
                msg = `+${charge} Surge`;
                color = "#0ea5e9";
                playSound('powerup');
                break;
            }
            case 'yellow': { // Shield
                let block = Math.floor(power * 1.5 * comboMult);
                if (state.player.shieldBonus > 0) {
                    block = Math.floor(block * (1 + state.player.shieldBonus));
                }
                addShield(block);
                msg = `+${block} Shield`;
                color = "#f59e0b";
                playSound('shield');
                break;
            }
            case 'purple': { // Strong Damage
                effectValue = Math.floor(power * baseDmg * 1.3 * comboMult);
                damageEnemy(effectValue);
                if (state.player.lifestealPct > 0) {
                    const stolen = Math.floor(effectValue * state.player.lifestealPct);
                    if (stolen > 0) healPlayer(stolen);
                }
                msg = isCrit ? `\u{2620}\u{FE0F} ${effectValue}!` : `-${effectValue}!`;
                color = "#a78bfa";
                playSound('attack');
                break;
            }
            case 'white': { // Gold & XP
                // XP diminishes at higher levels
                const xpScale = 1 / (1 + state.player.level * 0.08);
                const xp = Math.max(1, Math.floor(power * 1.5 * xpScale));
                let gold = Math.floor(power * 2);
                if (state.player.goldFindBonus > 0) {
                    gold = Math.floor(gold * (1 + state.player.goldFindBonus));
                }
                gainXp(xp);
                gainGold(gold);
                msg = `+${xp} XP +${gold}g`;
                color = "#fef3c7";
                playSound('gold');
                break;
            }
        }

        // Show floating text
        const centerRune = state.selected.length > 0
            ? state.selected[Math.floor(state.selected.length / 2)]
            : null;
        if (centerRune && state.grid[centerRune.x] && state.grid[centerRune.x][centerRune.y]) {
            spawnFloatingText(state.grid[centerRune.x][centerRune.y].el, msg, color, isCrit);
        }

        // Increase combo
        state.combo++;
        elCombo.style.opacity = "1";
        elComboVal.innerText = `x${comboMult.toFixed(1)}`;
    }

    // Cascade version of applyEffect (no selected runes for floating text positioning)
    function applyCascadeEffect(type, power, comboMult, refEl) {
        const baseDmg = 1 + state.player.dmgBonus;
        let msg = "";
        let color = "#fff";

        switch (type) {
            case 'red': {
                const effectValue = Math.floor(power * baseDmg * comboMult);
                damageEnemy(effectValue);
                if (state.player.lifestealPct > 0) {
                    const stolen = Math.floor(effectValue * state.player.lifestealPct);
                    if (stolen > 0) healPlayer(stolen);
                }
                msg = `-${effectValue}`;
                color = "#f43f5e";
                break;
            }
            case 'green': {
                let heal = Math.floor(power * 1.5 * comboMult);
                if (state.player.cursed) heal = Math.floor(heal * 0.5);
                healPlayer(heal);
                msg = `+${heal} HP`;
                color = "#10b981";
                break;
            }
            case 'blue': {
                const charge = Math.floor((power + state.player.specialRechargeBonus) * comboMult);
                chargeSpecial(charge);
                msg = `+${charge} Surge`;
                color = "#0ea5e9";
                break;
            }
            case 'yellow': {
                let block = Math.floor(power * 1.5 * comboMult);
                if (state.player.shieldBonus > 0) block = Math.floor(block * (1 + state.player.shieldBonus));
                addShield(block);
                msg = `+${block} Shield`;
                color = "#f59e0b";
                break;
            }
            case 'purple': {
                const effectValue = Math.floor(power * baseDmg * 1.3 * comboMult);
                damageEnemy(effectValue);
                msg = `-${effectValue}!`;
                color = "#a78bfa";
                break;
            }
            case 'white': {
                const xpScale = 1 / (1 + state.player.level * 0.08);
                const xp = Math.max(1, Math.floor(power * 1.5 * xpScale));
                let gold = Math.floor(power * 2);
                if (state.player.goldFindBonus > 0) gold = Math.floor(gold * (1 + state.player.goldFindBonus));
                gainXp(xp);
                gainGold(gold);
                msg = `+${xp}XP +${gold}g`;
                color = "#fef3c7";
                break;
            }
        }

        if (refEl) spawnFloatingText(refEl, msg, color);
        state.combo++;
        elComboVal.innerText = `x${comboMult.toFixed(1)}`;
    }

    // --- Cascade System ---

    function findCascadeGroups() {
        const visited = new Set();
        const groups = [];

        for (let x = 0; x < GRID_SIZE; x++) {
            for (let y = 0; y < GRID_SIZE; y++) {
                const key = `${x},${y}`;
                if (visited.has(key)) continue;
                if (!state.grid[x][y]) continue;
                if (state.grid[x][y].frozenTurns > 0) continue;

                const group = [];
                const type = state.grid[x][y].type;
                floodFill(x, y, type, visited, group);

                if (group.length >= 3) {
                    groups.push({ type, cells: group });
                }
            }
        }

        return groups;
    }

    function floodFill(x, y, type, visited, group) {
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
        const key = `${x},${y}`;
        if (visited.has(key)) return;
        if (!state.grid[x][y] || state.grid[x][y].type !== type) return;
        if (state.grid[x][y].frozenTurns > 0) return;

        visited.add(key);
        group.push({ x, y });

        // Orthogonal only for cascades
        floodFill(x + 1, y, type, visited, group);
        floodFill(x - 1, y, type, visited, group);
        floodFill(x, y + 1, type, visited, group);
        floodFill(x, y - 1, type, visited, group);
    }

    function checkAndProcessCascades(depth, onComplete) {
        if (depth >= MAX_CASCADE_DEPTH) { onComplete(); return; }

        const groups = findCascadeGroups();
        if (groups.length === 0) { onComplete(); return; }

        state.stats.cascades++;

        // Highlight cascade runes
        groups.forEach(group => {
            group.cells.forEach(cell => {
                if (state.grid[cell.x][cell.y]) {
                    state.grid[cell.x][cell.y].el.classList.add('cascade-glow');
                }
            });
        });

        playSound('cascade', depth);
        spawnFloatingText(boardElement, `CASCADE x${depth + 1}!`, '#fbbf24', true);

        // After brief highlight, process
        setTimeout(() => {
            groups.forEach(group => {
                const comboMult = 1 + (state.combo * 0.15);
                const power = group.cells.length;

                // Get a reference element for floating text
                const midCell = group.cells[Math.floor(group.cells.length / 2)];
                const refEl = state.grid[midCell.x][midCell.y]?.el;

                applyCascadeEffect(group.type, power, comboMult, refEl);

                // Remove cells
                group.cells.forEach(cell => {
                    state.grid[cell.x][cell.y] = null;
                });
            });

            // Refill
            refillBoard();
            renderBoard();
            updateUI();

            // Check for more cascades
            setTimeout(() => checkAndProcessCascades(depth + 1, onComplete), 350);
        }, 300);
    }

    function refillBoard() {
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
    }

    function removeSelectedRunes() {
        state.selected.forEach(p => {
            state.grid[p.x][p.y] = null;
        });
        state.selected = [];
        connectorSvg.innerHTML = '';

        // Refill grid
        refillBoard();
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

        // Boss rage check
        if (state.enemy.isBoss && !state.enemy.enraged && state.enemy.hp <= state.enemy.maxHp * 0.5 && state.enemy.hp > 0) {
            state.enemy.enraged = true;
            state.enemy.damage = Math.floor(state.enemy.damage * 1.3);
            spawnFloatingText(elEnemyPortrait, "ENRAGED!", "#ef4444", true);
            screenShake(true);
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
        if (state.player.potions <= 0 || state.processing) return;

        state.player.potions--;
        state.stats.potionsUsed++;

        const healAmount = Math.floor(state.player.maxHp * 0.4);
        healPlayer(healAmount);

        state.player.bleed = 0;
        state.player.burn = 0;
        state.player.cursed = false;

        playSound('heal');
        spawnFloatingText(elPlayerPortrait, `+${healAmount} HP`, "#10b981");
        updateUI();
    }

    function shuffleBoard() {
        if (state.player.gold < 5 || state.processing) return;

        state.player.gold -= 5;
        updateUI();

        const types = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let y = 0; y < GRID_SIZE; y++) {
                if (state.grid[x][y]) {
                    types.push(state.grid[x][y].type);
                }
            }
        }

        for (let i = types.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [types[i], types[j]] = [types[j], types[i]];
        }

        let idx = 0;
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let y = 0; y < GRID_SIZE; y++) {
                if (state.grid[x][y]) {
                    const rune = state.grid[x][y];
                    rune.type = types[idx++];
                    rune.el.className = `rune rune-${rune.type}`;
                    rune.el.innerHTML = ICONS[rune.type];

                    if (rune.frozenTurns > 0) {
                        rune.frozenTurns = 0;
                        rune.el.classList.remove('frozen');
                        delete rune.el.dataset.frozenTurns;
                    }
                }
            }
        }

        state.selected = [];
        drawConnector();

        playSound('powerup');
        spawnFloatingText(boardElement, "SHUFFLED!", "#fbbf24");
        screenShake();
    }

    function activateSurge() {
        if (state.player.special < state.player.maxSpecial || state.processing) return;

        state.player.special = 0;
        playSound('surge');

        let surgeDmg = 15 + state.player.level * 3;
        if (state.player.surgeDmgBonus > 0) {
            surgeDmg = Math.floor(surgeDmg * (1 + state.player.surgeDmgBonus));
        }

        damageEnemy(surgeDmg);
        healPlayer(8);
        addShield(8);

        screenShake(true);
        document.body.classList.add('animate-pulse-bright');
        setTimeout(() => document.body.classList.remove('animate-pulse-bright'), 1000);

        spawnFloatingText(elEnemyPortrait, `\u{1F31F} SURGE -${surgeDmg}!`, "#0ea5e9", true);

        updateUI();
    }

    function enemyDefeated() {
        state.stats.enemiesDefeated++;
        if (state.enemy.isBoss) {
            state.stats.bossesDefeated++;
            // Track Dragon King kill for achievement
            if (state.enemy.name === "Dragon King") {
                meta.dragonKingDefeated = true;
            }
        }

        const baseGold = state.enemy.isBoss ? 30 : 10;
        let goldReward = baseGold + (state.floor * 3) + Math.floor(Math.random() * 10);
        if (state.player.goldFindBonus > 0) {
            goldReward = Math.floor(goldReward * (1 + state.player.goldFindBonus));
        }
        const xpReward = state.enemy.isBoss ? 30 : 15;

        gainGold(goldReward);
        gainXp(xpReward);

        const potionChance = state.enemy.isBoss ? 0.8 : 0.2;
        let potionDrop = 0;
        if (Math.random() < potionChance) {
            potionDrop = 1;
            state.player.potions++;
        }

        elModalTitle.textContent = state.enemy.isBoss ? "\u{1F3C6} Boss Defeated!" : "Victory!";
        elModalText.textContent = `You defeated the ${state.enemy.name}!`;
        elModalLoot.innerHTML = `
            <div class="loot-display">
                <span class="gold-reward">\u{1F4B0} +${goldReward} Gold</span>
                <span class="xp-reward">\u{2728} +${xpReward} XP</span>
                ${potionDrop ? '<span class="potion-reward">\u{1F9EA} +1 Potion</span>' : ''}
            </div>
        `;

        state.processing = false;
        modalVictory.classList.add('visible');
        playSound('gold');
    }

    function nextBattle() {
        modalVictory.classList.remove('visible');

        state.floor++;
        state.moves = getMovesPerTurn();
        state.turn = 1;
        state.combo = 0;

        const restHeal = Math.floor(state.player.maxHp * 0.1);
        healPlayer(restHeal);

        state.player.bleed = 0;
        state.player.burn = 0;

        spawnEnemy();
        updateUI();
        generateGrid(true);
        renderBoard();
    }

    function endRun() {
        // Update meta stats
        meta.totalRuns++;
        meta.totalEnemiesKilled += state.stats.enemiesDefeated;
        meta.totalBossesKilled += state.stats.bossesDefeated;
        meta.totalGoldEarned += state.stats.goldEarned;
        if (state.floor > meta.bestFloor) meta.bestFloor = state.floor;
        saveMeta();

        // Check for new achievements
        const newAchievements = checkNewAchievements();

        // Build game over stats
        let statsHTML = `
            <div class="stats-grid">
                <div>\u{1F4CD} Floor reached: <strong>${state.floor}</strong></div>
                <div>\u{2620}\u{FE0F} Enemies defeated: <strong>${state.stats.enemiesDefeated}</strong></div>
                <div>\u{1F451} Bosses defeated: <strong>${state.stats.bossesDefeated}</strong></div>
                <div>\u{2694}\u{FE0F} Damage dealt: <strong>${state.stats.damageDealt}</strong></div>
                <div>\u{1F4B0} Gold earned: <strong>${state.stats.goldEarned}</strong></div>
                <div>\u{1F4A5} Critical hits: <strong>${state.stats.criticalHits}</strong></div>
                <div>\u{1F517} Longest chain: <strong>${state.stats.longestChain}</strong></div>
                ${state.stats.cascades > 0 ? `<div>\u{1F300} Cascades: <strong>${state.stats.cascades}</strong></div>` : ''}
            </div>
        `;

        // Legacy stats
        statsHTML += `
            <div class="legacy-section">
                <h3 class="text-sm font-bold text-amber-400 mt-3 mb-1">Legacy</h3>
                <div class="text-xs text-slate-400">
                    Total runs: ${meta.totalRuns} | Best floor: ${meta.bestFloor} | Total kills: ${meta.totalEnemiesKilled}
                </div>
            </div>
        `;

        // New achievements
        if (newAchievements.length > 0) {
            statsHTML += `<div class="achievement-section mt-3">`;
            statsHTML += `<h3 class="text-sm font-bold text-emerald-400 mb-1">\u{1F3C6} New Achievements!</h3>`;
            newAchievements.forEach(a => {
                statsHTML += `
                    <div class="achievement-item">
                        <div class="text-sm font-bold text-white">${a.name}</div>
                        <div class="text-xs text-slate-400">${a.desc}</div>
                        <div class="text-xs text-emerald-400 font-bold">Perk: ${a.perk}</div>
                    </div>
                `;
            });
            statsHTML += `</div>`;
            playSound('achievement');
        }

        // Show unlocked perks count
        const totalPerks = meta.achievements.length;
        const totalAch = ACHIEVEMENTS.length;
        statsHTML += `
            <div class="text-xs text-center text-slate-500 mt-2">
                Perks: ${totalPerks}/${totalAch} unlocked
            </div>
        `;

        elGameoverStats.innerHTML = statsHTML;
        modalGameover.classList.add('visible');
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
        state.player.upgrades = [];
        state.player.thorns = 0;
        state.player.lifestealPct = 0;
        state.player.goldFindBonus = 0;
        state.player.surgeDmgBonus = 0;
        state.player.dmgReduction = 0;
        state.player.chainBonusPct = 0;
        state.player.regenPerTurn = 0;
        state.player.shieldBonus = 0;
        state.combo = 0;
        state.processing = false;

        state.stats = {
            enemiesDefeated: 0,
            bossesDefeated: 0,
            damageDealt: 0,
            damageReceived: 0,
            goldEarned: 0,
            criticalHits: 0,
            longestChain: 0,
            potionsUsed: 0,
            cascades: 0,
        };

        // Reload meta (may have new achievements)
        meta = loadMeta();

        // Apply meta perks to fresh state
        applyMetaPerks(state.player);
        state.moves = getMovesPerTurn();

        spawnEnemy();
        generateGrid(true);
        renderBoard();
        updateUI();
        showActivePerks();
    }

    function levelUp() {
        state.player.xp -= state.player.maxXp;
        state.player.maxXp = Math.floor(state.player.maxXp * 1.4);
        state.player.level++;

        // Full heal on level up
        state.player.hp = state.player.maxHp;

        // Generate random upgrade choices
        generateUpgradeChoices();

        modalUpgrade.classList.add('visible');
        playSound('powerup');
    }

    function generateUpgradeChoices() {
        // Filter out unique upgrades already taken
        const available = UPGRADE_POOL.filter(u => {
            if (u.unique && state.player.upgrades.includes(u.id)) return false;
            return true;
        });

        // Pick 3 random
        const shuffled = [...available];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const choices = shuffled.slice(0, 3);

        // Render choices
        elUpgradeChoices.innerHTML = '';
        choices.forEach(upgrade => {
            const btn = document.createElement('button');
            const colorMap = {
                emerald: { bg: 'rgba(6,78,59,0.5)', border: 'rgba(16,185,129,0.5)', text: '#10b981', hover: 'rgba(6,78,59,0.8)' },
                rose: { bg: 'rgba(136,19,55,0.5)', border: 'rgba(244,63,94,0.5)', text: '#f43f5e', hover: 'rgba(136,19,55,0.8)' },
                sky: { bg: 'rgba(12,74,110,0.5)', border: 'rgba(14,165,233,0.5)', text: '#0ea5e9', hover: 'rgba(12,74,110,0.8)' },
                lime: { bg: 'rgba(54,83,20,0.5)', border: 'rgba(132,204,22,0.5)', text: '#84cc16', hover: 'rgba(54,83,20,0.8)' },
                red: { bg: 'rgba(127,29,29,0.5)', border: 'rgba(239,68,68,0.5)', text: '#ef4444', hover: 'rgba(127,29,29,0.8)' },
                amber: { bg: 'rgba(120,53,15,0.5)', border: 'rgba(245,158,11,0.5)', text: '#f59e0b', hover: 'rgba(120,53,15,0.8)' },
                yellow: { bg: 'rgba(113,63,18,0.5)', border: 'rgba(234,179,8,0.5)', text: '#eab308', hover: 'rgba(113,63,18,0.8)' },
                cyan: { bg: 'rgba(22,78,99,0.5)', border: 'rgba(6,182,212,0.5)', text: '#06b6d4', hover: 'rgba(22,78,99,0.8)' },
                stone: { bg: 'rgba(68,64,60,0.5)', border: 'rgba(168,162,158,0.5)', text: '#a8a29e', hover: 'rgba(68,64,60,0.8)' },
                indigo: { bg: 'rgba(49,46,129,0.5)', border: 'rgba(99,102,241,0.5)', text: '#6366f1', hover: 'rgba(49,46,129,0.8)' },
                green: { bg: 'rgba(20,83,45,0.5)', border: 'rgba(34,197,94,0.5)', text: '#22c55e', hover: 'rgba(20,83,45,0.8)' },
                orange: { bg: 'rgba(124,45,18,0.5)', border: 'rgba(249,115,22,0.5)', text: '#f97316', hover: 'rgba(124,45,18,0.8)' },
            };
            const colors = colorMap[upgrade.colorBg] || colorMap.emerald;
            const taken = state.player.upgrades.filter(u => u === upgrade.id).length;
            const stackText = taken > 0 && !upgrade.unique ? ` (x${taken + 1})` : '';

            btn.className = 'upgrade-choice w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg flex flex-col items-center group';
            btn.style.cssText = `background: ${colors.bg}; border: 1px solid ${colors.border};`;
            btn.innerHTML = `
                <strong class="font-fantasy" style="color: ${colors.text}">${upgrade.icon} ${upgrade.name}${stackText}</strong>
                <span class="text-xs text-gray-300">${upgrade.desc}</span>
            `;
            btn.addEventListener('mouseenter', () => { btn.style.background = colors.hover; });
            btn.addEventListener('mouseleave', () => { btn.style.background = colors.bg; });
            btn.addEventListener('click', () => applyUpgrade(upgrade.id));

            elUpgradeChoices.appendChild(btn);
        });
    }

    function applyUpgrade(type) {
        state.player.upgrades.push(type);

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
            case 'thorns':
                state.player.thorns += 2;
                break;
            case 'lifesteal':
                state.player.lifestealPct += 0.15;
                break;
            case 'extramove':
                // Handled by getMovesPerTurn()
                state.moves = getMovesPerTurn();
                break;
            case 'goldfind':
                state.player.goldFindBonus += 0.5;
                break;
            case 'surgedmg':
                state.player.surgeDmgBonus += 0.5;
                break;
            case 'ironskin':
                state.player.dmgReduction += 0.2;
                break;
            case 'chainbonus':
                state.player.chainBonusPct += 0.5;
                break;
            case 'regen':
                state.player.regenPerTurn += 3;
                break;
            case 'shieldmaster':
                state.player.shieldBonus += 0.5;
                break;
        }
        modalUpgrade.classList.remove('visible');
        updateUI();
    }

    function freezeRunes(count, turns) {
        let available = [];
        for(let x = 0; x < GRID_SIZE; x++) {
            for(let y = 0; y < GRID_SIZE; y++) {
                if(state.grid[x][y] && state.grid[x][y].frozenTurns <= 0) {
                    available.push(state.grid[x][y]);
                }
            }
        }

        for (let i = available.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [available[i], available[j]] = [available[j], available[i]];
        }

        let frozenCount = 0;
        for(let i = 0; i < Math.min(count, available.length); i++) {
            const rune = available[i];
            rune.frozenTurns = turns;
            rune.el.classList.add('frozen');
            rune.el.dataset.frozenTurns = turns;
            frozenCount++;
        }

        if (frozenCount > 0) {
            playSound('shield');
            renderBoard();
        }
    }

    function endTurn() {
        state.processing = true;
        elTurnStatus.textContent = "ENEMY TURN...";
        elTurnStatus.classList.replace('text-amber-400', 'text-rose-400');

        setTimeout(() => {
            if (!state.enemy || state.enemy.hp <= 0) {
                state.processing = false;
                return;
            }

            // Decrement frozen runes
            for(let x = 0; x < GRID_SIZE; x++) {
                for(let y = 0; y < GRID_SIZE; y++) {
                    if(state.grid[x][y] && state.grid[x][y].frozenTurns > 0) {
                        state.grid[x][y].frozenTurns--;
                        if (state.grid[x][y].frozenTurns <= 0) {
                            state.grid[x][y].el.classList.remove('frozen');
                            delete state.grid[x][y].el.dataset.frozenTurns;
                        } else {
                            state.grid[x][y].el.dataset.frozenTurns = state.grid[x][y].frozenTurns;
                        }
                    }
                }
            }

            // Player regen upgrade
            if (state.player.regenPerTurn > 0) {
                healPlayer(state.player.regenPerTurn);
                spawnFloatingText(elPlayerPortrait, `+${state.player.regenPerTurn} regen`, "#22c55e");
            }

            // Apply player status effects
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
                if (attackCount > 1) dmg = Math.floor(dmg / 2);

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

                // Iron Bark damage reduction
                if (state.player.dmgReduction > 0 && dmg > 0) {
                    dmg = Math.max(1, Math.floor(dmg * (1 - state.player.dmgReduction)));
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

                // Thorns
                if (state.player.thorns > 0 && state.enemy.hp > 0) {
                    state.enemy.hp -= state.player.thorns;
                    state.stats.damageDealt += state.player.thorns;
                    spawnFloatingText(elEnemyPortrait, `-${state.player.thorns} thorns`, "#84cc16");
                    if (state.enemy.hp <= 0) {
                        enemyDefeated();
                        return;
                    }
                }
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

            if (state.enemy.ability === 'freeze') {
                freezeRunes(3, 2);
                spawnFloatingText(elEnemyPortrait, "FROST!", "#38bdf8");
            }

            if (state.enemy.ability === 'freeze_area') {
                freezeRunes(10, 2);
                spawnFloatingText(elEnemyPortrait, "BLIZZARD!", "#38bdf8");
            }

            // Boss inferno ability (Dragon King)
            if (state.enemy.ability === 'inferno') {
                const infernoRoll = Math.random();
                if (infernoRoll < 0.4) {
                    const burnDmg = Math.floor(state.enemy.damage * 0.5);
                    state.player.hp -= burnDmg;
                    state.player.burn = 5;
                    spawnFloatingText(elPlayerPortrait, `-${burnDmg} INFERNO!`, "#ef4444", true);
                    screenShake(true);
                }
            }

            // Boss darkness ability (Shadow Lord)
            if (state.enemy.ability === 'darkness') {
                if (Math.random() < 0.5) {
                    freezeRunes(4, 1);
                    spawnFloatingText(elEnemyPortrait, "DARKNESS!", "#1f2937");
                }
            }

            // Boss summon ability (Ancient Treant)
            if (state.enemy.ability === 'summon') {
                if (Math.random() < 0.4) {
                    const healAmt = Math.floor(state.enemy.maxHp * 0.05);
                    state.enemy.hp = Math.min(state.enemy.hp + healAmt, state.enemy.maxHp);
                    freezeRunes(2, 1);
                    spawnFloatingText(elEnemyPortrait, `+${healAmt} ROOTS!`, "#166534");
                }
            }

            renderBoard();
            updateUI();

            if (state.player.hp <= 0) {
                state.processing = false;
                setTimeout(() => endRun(), 500);
            } else {
                state.moves = getMovesPerTurn();
                state.turn++;
                state.combo = 0;
                elCombo.style.opacity = "0";
                state.processing = false;
                elTurnStatus.textContent = `Your Turn: ${state.moves}`;
                elTurnStatus.classList.replace('text-rose-400', 'text-amber-400');
            }

        }, 1000);
    }

    function updateUI() {
        // Player
        elPlayerHpBar.style.width = `${(state.player.hp / state.player.maxHp) * 100}%`;
        elPlayerHpText.textContent = `${state.player.hp} / ${state.player.maxHp}`;

        elPlayerShield.textContent = state.player.shield > 0 ? `\u{1F6E1}\u{FE0F} ${state.player.shield}` : '';

        elPlayerSpecialBar.style.width = `${(state.player.special / state.player.maxSpecial) * 100}%`;
        elPlayerSpecialText.textContent = `Wild Surge: ${state.player.special}/${state.player.maxSpecial}`;

        elPlayerLevel.textContent = `Lvl ${state.player.level}`;

        if (elPlayerGold) {
            elPlayerGold.textContent = `\u{1F4B0} ${state.player.gold}`;
        }

        if (elPlayerPotions) {
            elPlayerPotions.textContent = `\u{1F9EA} ${state.player.potions}`;
        }

        if (btnShuffle) {
            if (state.player.gold >= 5) {
                btnShuffle.classList.remove('opacity-50', 'cursor-not-allowed');
                btnShuffle.disabled = false;
            } else {
                btnShuffle.classList.add('opacity-50', 'cursor-not-allowed');
                btnShuffle.disabled = true;
            }
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
                ? `<span class="text-amber-400">\u{2694}\u{FE0F} BOSS FLOOR ${state.floor}</span>`
                : `Floor ${state.floor}`;
        }

        // Enemy
        updateEnemyUI();

        // Game Status
        if (state.moves > 0 && !state.processing) {
            elTurnStatus.textContent = `Your Turn: ${state.moves}`;
        }
    }

    function updateEnemyUI() {
        if (!state.enemy) return;
        elEnemyName.textContent = state.enemy.name;

        let levelText = state.enemy.isBoss ? `BOSS` : `Lvl ${state.enemy.level}`;
        if (state.enemy.enraged) levelText += ' \u{1F525}';
        elEnemyLevel.textContent = levelText;

        elEnemyHpBar.style.width = `${Math.max(0, (state.enemy.hp / state.enemy.maxHp) * 100)}%`;
        elEnemyHpText.textContent = `${Math.max(0, state.enemy.hp)}/${state.enemy.maxHp}`;

        // Show enemy intent
        let intentHTML = `<span class="text-rose-400">\u{2694}\u{FE0F} ${state.enemy.damage} DMG</span>`;
        if (state.enemy.abilityDesc) {
            intentHTML += ` <span class="text-violet-400 text-xs">(${state.enemy.abilityDesc})</span>`;
        }
        if (state.enemy.enraged) {
            intentHTML += ` <span class="text-red-500 text-xs font-bold">ENRAGED</span>`;
        }
        elEnemyStatus.innerHTML = intentHTML;
    }

    // Init call
    init();

    // Initial render
    setTimeout(renderBoard, 100);

});
