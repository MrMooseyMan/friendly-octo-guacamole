document.addEventListener('DOMContentLoaded', () => {

    // ========== CONFIGURATION ==========
    const GRID_SIZE = 6;
    const BASE_MOVES_PER_TURN = 3;
    const MAX_FLOOR = 50;
    const BOSS_EVERY = 5;
    const META_KEY = 'wild-dot-crawler-wilds-v1';
    const MAX_CASCADE_DEPTH = 3;

    // ========== BIOMES ==========
    const BIOMES = [
        { name: 'Verdant Wilds', floors: [1, 12], bg: 'linear-gradient(160deg, #0a1f0f 0%, #0f2e1a 40%, #0c2618 70%, #0a1a0f 100%)', accent: '#10b981' },
        { name: 'Frost Peaks', floors: [13, 24], bg: 'linear-gradient(160deg, #0c1525 0%, #0f2040 40%, #152540 70%, #0c1525 100%)', accent: '#38bdf8' },
        { name: 'Shadow Depths', floors: [25, 36], bg: 'linear-gradient(160deg, #15082e 0%, #1a0f2e 40%, #200d3a 70%, #12082a 100%)', accent: '#a78bfa' },
        { name: "Dragon's Cradle", floors: [37, 50], bg: 'linear-gradient(160deg, #2a0f0a 0%, #301510 40%, #2a0a08 70%, #200a05 100%)', accent: '#f43f5e' },
    ];

    // ========== GUARDIANS ==========
    const GUARDIANS = [
        { id: 'verdant', name: 'Verdant Spirit', element: 'green', icon: '\u{1F33F}', color: '#10b981',
          desc: 'Guardian of healing winds', abilityName: 'Renewal', abilityDesc: 'Full heal + cleanse all debuffs',
          chargePerElement: 15, chargePerOther: 3, maxCharge: 100 },
        { id: 'storm', name: 'Storm Hawk', element: 'blue', icon: '\u{26A1}', color: '#0ea5e9',
          desc: 'Lightning strikes devastate foes', abilityName: 'Thunderbolt', abilityDesc: 'Massive damage + stun enemy',
          chargePerElement: 15, chargePerOther: 3, maxCharge: 100 },
        { id: 'stone', name: 'Stone Sentinel', element: 'yellow', icon: '\u{1F6E1}\u{FE0F}', color: '#f59e0b',
          desc: 'Unbreakable earth guardian', abilityName: 'Fortify', abilityDesc: 'Massive shield + thorns',
          chargePerElement: 15, chargePerOther: 3, maxCharge: 100 },
        { id: 'ember', name: 'Ember Phoenix', element: 'red', icon: '\u{1F525}', color: '#f43f5e',
          desc: 'Flames that consume all', abilityName: 'Inferno', abilityDesc: 'Fire burst + strong burn on enemy',
          chargePerElement: 15, chargePerOther: 3, maxCharge: 100 },
        { id: 'shadow', name: 'Shadow Panther', element: 'purple', icon: '\u{1F311}', color: '#a78bfa',
          desc: 'Strikes from the darkness', abilityName: 'Shadowstrike', abilityDesc: 'Poison + weaken enemy attacks',
          chargePerElement: 15, chargePerOther: 3, maxCharge: 100 },
    ];

    // ========== PATH TYPES ==========
    const PATH_TYPES = [
        { type: 'battle', name: 'Battle', icon: '\u{2694}\u{FE0F}', desc: 'A creature blocks the path', weight: 40 },
        { type: 'elite', name: 'Elite Battle', icon: '\u{1F480}', desc: 'A powerful foe with rich spoils', weight: 12 },
        { type: 'rest', name: 'Rest Site', icon: '\u{1F3D5}\u{FE0F}', desc: 'A calm grove to rest and heal', weight: 22 },
        { type: 'shrine', name: 'Guardian Shrine', icon: '\u{1F3DB}\u{FE0F}', desc: 'Attune with a new guardian', weight: 10 },
        { type: 'treasure', name: 'Treasure Cache', icon: '\u{1F4B0}', desc: 'Riches hidden in the wilds', weight: 16 },
    ];

    // ========== SVG ICONS ==========
    const ICONS = {
        red: `<svg viewBox="0 0 24 24"><path d="M19.1 1.9c-1.1-1.1-2.7-1.7-4.3-1.7-1.6 0-3.2.6-4.3 1.7L1.9 10.5c-1.1 1.1-1.7 2.7-1.7 4.3s.6 3.2 1.7 4.3l1.8 1.8c1.1 1.1 2.7 1.7 4.3 1.7s3.2-.6 4.3-1.7l8.6-8.6c1.1-1.1 1.7-2.7 1.7-4.3s-.6-3.2-1.7-4.3zM18 10.2l-8.6 8.6c-.4.4-1 .4-1.4 0l-1.8-1.8c-.4-.4-.4-1 0-1.4l8.6-8.6c.4-.4 1-.4 1.4 0l1.8 1.8c.4.4.4 1 0 1.4z"></path></svg>`,
        green: `<svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8z"></path><path d="M12 4c-2.1 0-4 1.3-4.8 3.2-.3.6.3 1.2.9 1.2h7.8c.6 0 1.2-.6.9-1.2C16 5.3 14.1 4 12 4z"></path><path d="M12 14c2.1 0 4-1.3 4.8-3.2.3-.6-.3-1.2-.9-1.2H8.1c-.6 0-1.2.6-.9 1.2C8 12.7 9.9 14 12 14z"></path></svg>`,
        blue: `<svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-2.8-11.2c.4-.4 1-.4 1.4 0l3.5 3.5c.4.4.4 1 0 1.4l-3.5 3.5c-.4.4-1 .4-1.4 0l-3.5-3.5c-.4-.4-.4-1 0-1.4l3.5-3.5z"></path></svg>`,
        yellow: `<svg viewBox="0 0 24 24"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.2l8.2 4.1v7.4L12 19.8l-8.2-4.1V8.3L12 4.2zM4 8.3v7.4l8 4v-7.4l-8-4zM12 12.2l-8-4 8-4 8 4-8 4z"></path></svg>`,
        purple: `<svg viewBox="0 0 24 24"><path d="M12 2c-3.3 0-6 2.7-6 6 0 3.1 2.2 5.7 5.1 6V22h1.8v-8c2.9-.3 5.1-2.9 5.1-6 0-3.3-2.7-6-6-6zm0 10.5c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z"></path></svg>`,
        white: `<svg viewBox="0 0 24 24"><path d="M12 2l2.6 7.2H22l-6 4.4 2.3 7.2L12 16.4 5.7 20.8 8 13.6 2 9.2h7.4L12 2z"></path></svg>`,

        player: `<svg viewBox="0 0 100 100" fill="#10b981"><circle cx="50" cy="18" r="11"/><path d="M38 16c-4 -5, -10 -4, -14 2 c-2 4, 0 10, 5 9l6-5z" fill-opacity="0.8"/><path d="M62 16c4 -5, 10 -4, 14 2 c2 4, 0 10, -5 9l-6-5z" fill-opacity="0.8"/><path d="M42 30 l-4 32 l-7 28 h9 l5-22 l5 22 h9 l-7-28 l-4-32z"/><path d="M38 38 l-10 14 l4 3 l8-12z M62 38 l10 14 l-4 3 l-8-12z"/><line x1="28" y1="48" x2="22" y2="78" stroke="#10b981" stroke-width="3" stroke-linecap="round"/></svg>`,
        'gloom-cap': `<svg viewBox="0 0 100 100" fill="#a78bfa"><path d="M50 30 C 20 30, 20 60, 20 60 C 20 70, 30 80, 40 80 L 60 80 C 70 80, 80 70, 80 60 C 80 60, 80 30, 50 30 z"></path><path d="M45 80 L 45 90 L 55 90 L 55 80 z" fill-opacity="0.7"></path><circle cx="35" cy="50" r="5" fill="#fde047"></circle><circle cx="50" cy="45" r="5" fill="#fde047"></circle><circle cx="65" cy="50" r="5" fill="#fde047"></circle></svg>`,
        'briar-wolf': `<svg viewBox="0 0 100 100" fill="#f43f5e"><path d="M20 80 L 30 60 L 40 70 L 35 90 z M 30 60 L 45 50 L 50 30 L 60 40 L 75 45 L 80 60 L 60 75 L 50 85 L 40 70 z M 75 45 L 90 40 L 85 55 z M 50 30 L 45 20 L 55 20 z"></path><path d="M40 55 C 42 53, 47 53, 49 55" stroke="#f1f5f9" stroke-width="2"></path><path d="M60 58 C 62 56, 67 56, 69 58" stroke="#f1f5f9" stroke-width="2"></path></svg>`,
        'gloom-sprite': `<svg viewBox="0 0 100 100" fill="#0ea5e9"><circle cx="50" cy="50" r="15"></circle><path d="M50 35 A 20 20 0 0 0 35 50 A 5 5 0 0 0 40 50 A 15 15 0 0 1 50 35 z" fill-opacity="0.8"></path><path d="M50 65 A 20 20 0 0 1 65 50 A 5 5 0 0 1 60 50 A 15 15 0 0 0 50 65 z" fill-opacity="0.8"></path></svg>`,
        'shadow-stalker': `<svg viewBox="0 0 100 100" fill="#4b5563"><path d="M50 10 L 40 40 L 20 30 z M 60 40 L 80 30 L 50 10 z M 40 40 L 20 60 L 30 90 L 50 70 L 70 90 L 80 60 L 60 40 z"></path><circle cx="40" cy="50" r="5" fill="#f43f5e"></circle><circle cx="60" cy="50" r="5" fill="#f43f5e"></circle></svg>`,
        'grove-wraith': `<svg viewBox="0 0 100 100" fill="#166534"><path d="M50 20 C 40 30, 40 40, 40 40 L 30 80 L 40 70 L 50 90 L 60 70 L 70 80 L 60 40 C 60 40, 60 30, 50 20 z"></path><circle cx="45" cy="45" r="3" fill="#fde047"></circle><circle cx="55" cy="45" r="3" fill="#fde047"></circle></svg>`,
        'bone-crawler': `<svg viewBox="0 0 100 100" fill="#94a3b8"><ellipse cx="50" cy="50" rx="30" ry="15"></ellipse><circle cx="30" cy="50" r="8" fill="#1e293b"></circle><circle cx="50" cy="50" r="8" fill="#1e293b"></circle><circle cx="70" cy="50" r="8" fill="#1e293b"></circle><path d="M25 35 L25 25 M35 30 L35 22 M45 28 L45 20 M55 28 L55 20 M65 30 L65 22 M75 35 L75 25" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"></path></svg>`,
        'crystal-golem': `<svg viewBox="0 0 100 100" fill="#22d3ee"><polygon points="50,10 30,40 30,70 50,90 70,70 70,40"></polygon><polygon points="50,20 35,45 35,65 50,80 65,65 65,45" fill="#0891b2"></polygon><circle cx="40" cy="50" r="4" fill="#fef3c7"></circle><circle cx="60" cy="50" r="4" fill="#fef3c7"></circle></svg>`,
        'void-weaver': `<svg viewBox="0 0 100 100" fill="#6366f1"><circle cx="50" cy="50" r="25" fill="#1e1b4b"></circle><circle cx="50" cy="50" r="20" fill="#312e81"></circle><path d="M50 25 L55 45 L75 50 L55 55 L50 75 L45 55 L25 50 L45 45 Z" fill="#6366f1"></path><circle cx="50" cy="50" r="8" fill="#818cf8"></circle></svg>`,
        'inferno-beast': `<svg viewBox="0 0 100 100" fill="#ef4444"><path d="M30 80 L40 60 L35 40 L50 55 L65 40 L60 60 L70 80 L50 70 Z"></path><path d="M50 55 L45 30 L50 15 L55 30 Z" fill="#f97316"></path><circle cx="42" cy="55" r="4" fill="#fef3c7"></circle><circle cx="58" cy="55" r="4" fill="#fef3c7"></circle></svg>`,
        'frost-wisp': `<svg viewBox="0 0 100 100" fill="#38bdf8"><circle cx="50" cy="50" r="15" fill="#e0f2fe"></circle><path d="M50 30 L50 20 M50 70 L50 80 M30 50 L20 50 M70 50 L80 50 M35 35 L28 28 M65 65 L72 72 M35 65 L28 72 M65 35 L72 28" stroke="#bae6fd" stroke-width="3"></path><circle cx="50" cy="50" r="25" fill="#38bdf8" fill-opacity="0.3"></circle></svg>`,
        'ancient-treant': `<svg viewBox="0 0 100 100" fill="#166534"><path d="M40 90 L40 60 L30 60 L30 55 L35 50 L25 40 L35 35 L30 25 L45 30 L50 15 L55 30 L70 25 L65 35 L75 40 L65 50 L70 55 L70 60 L60 60 L60 90 Z"></path><circle cx="40" cy="45" r="6" fill="#fde047"></circle><circle cx="60" cy="45" r="6" fill="#fde047"></circle></svg>`,
        'frost-giant': `<svg viewBox="0 0 100 100" fill="#0284c7"><path d="M30 30 L70 30 L80 50 L70 90 L30 90 L20 50 Z"></path><rect x="35" y="10" width="30" height="25" fill="#bae6fd"></rect><circle cx="40" cy="45" r="5" fill="#f0f9ff"></circle><circle cx="60" cy="45" r="5" fill="#f0f9ff"></circle></svg>`,
        'elder-hydra': `<svg viewBox="0 0 100 100" fill="#0891b2"><path d="M50 90 L45 60 L35 55 L30 30 L35 45 L40 40 L50 25 L60 40 L65 45 L70 30 L65 55 L55 60 Z"></path><circle cx="30" cy="28" r="8" fill="#0e7490"></circle><circle cx="50" cy="20" r="10" fill="#0e7490"></circle><circle cx="70" cy="28" r="8" fill="#0e7490"></circle></svg>`,
        'shadow-lord': `<svg viewBox="0 0 100 100" fill="#1f2937"><path d="M50 10 L40 25 L25 20 L35 35 L20 45 L35 50 L25 80 L45 65 L50 90 L55 65 L75 80 L65 50 L80 45 L65 35 L75 20 L60 25 Z"></path><circle cx="42" cy="40" r="5" fill="#dc2626"></circle><circle cx="58" cy="40" r="5" fill="#dc2626"></circle></svg>`,
        'dragon-king': `<svg viewBox="0 0 100 100" fill="#eab308"><path d="M20 70 L30 55 L25 45 L35 50 L45 35 L50 20 L55 35 L65 50 L75 45 L70 55 L80 70 L65 65 L50 85 L35 65 Z"></path><path d="M45 35 L35 20 L45 25 Z M55 35 L65 20 L55 25 Z" fill="#ca8a04"></path><circle cx="42" cy="45" r="5" fill="#fef3c7"></circle><circle cx="58" cy="45" r="5" fill="#fef3c7"></circle></svg>`,
    };

    // ========== ENEMIES ==========
    const ENEMIES = [
        { name: "Gloom-cap", icon: "gloom-cap", color: "text-violet-400", hpBase: 12, hpScale: 4, dmgBase: 2, dmgScale: 1, ability: null, abilityDesc: "Basic attack" },
        { name: "Briar-wolf", icon: "briar-wolf", color: "text-rose-500", hpBase: 15, hpScale: 5, dmgBase: 3, dmgScale: 1.2, ability: "bleed", abilityDesc: "Can cause bleed" },
        { name: "Gloom-sprite", icon: "gloom-sprite", color: "text-sky-400", hpBase: 10, hpScale: 3, dmgBase: 4, dmgScale: 1, ability: "drain", abilityDesc: "Drains guardian charge" },
        { name: "Shadow Stalker", icon: "shadow-stalker", color: "text-gray-400", hpBase: 18, hpScale: 6, dmgBase: 5, dmgScale: 1.5, ability: "pierce", abilityDesc: "Pierces shields" },
        { name: "Grove Wraith", icon: "grove-wraith", color: "text-emerald-600", hpBase: 22, hpScale: 7, dmgBase: 3, dmgScale: 1, ability: "regen", abilityDesc: "Regenerates HP" },
        { name: "Bone Crawler", icon: "bone-crawler", color: "text-slate-400", hpBase: 25, hpScale: 8, dmgBase: 4, dmgScale: 1.3, ability: "armor", abilityDesc: "Takes reduced damage" },
        { name: "Crystal Golem", icon: "crystal-golem", color: "text-cyan-400", hpBase: 35, hpScale: 10, dmgBase: 6, dmgScale: 1.5, ability: "reflect", abilityDesc: "Reflects some damage" },
        { name: "Void Weaver", icon: "void-weaver", color: "text-indigo-400", hpBase: 20, hpScale: 6, dmgBase: 7, dmgScale: 2, ability: "curse", abilityDesc: "Curses reduce healing" },
        { name: "Inferno Beast", icon: "inferno-beast", color: "text-orange-500", hpBase: 28, hpScale: 9, dmgBase: 8, dmgScale: 2, ability: "burn", abilityDesc: "Burning damage over time" },
        { name: "Frost Wisp", icon: "frost-wisp", color: "text-sky-300", hpBase: 14, hpScale: 4, dmgBase: 3, dmgScale: 1, ability: "freeze", abilityDesc: "Freezes essences" },
    ];

    const BOSSES = [
        { name: "Ancient Treant", icon: "ancient-treant", color: "text-green-500", hpBase: 50, hpScale: 15, dmgBase: 6, dmgScale: 2, ability: "summon", abilityDesc: "Summons roots", isBoss: true },
        { name: "Frost Giant", icon: "frost-giant", color: "text-sky-600", hpBase: 65, hpScale: 16, dmgBase: 9, dmgScale: 2.5, ability: "freeze_area", abilityDesc: "Freezes large area", isBoss: true },
        { name: "Elder Hydra", icon: "elder-hydra", color: "text-cyan-500", hpBase: 70, hpScale: 20, dmgBase: 8, dmgScale: 2.5, ability: "multiattack", abilityDesc: "Attacks 3 times", isBoss: true },
        { name: "Shadow Lord", icon: "shadow-lord", color: "text-gray-600", hpBase: 60, hpScale: 18, dmgBase: 10, dmgScale: 3, ability: "darkness", abilityDesc: "Hides some essences", isBoss: true },
        { name: "Dragon King", icon: "dragon-king", color: "text-yellow-500", hpBase: 100, hpScale: 25, dmgBase: 12, dmgScale: 3.5, ability: "inferno", abilityDesc: "Devastating fire breath", isBoss: true },
    ];

    const RUNE_TYPES = ['red', 'green', 'blue', 'yellow', 'purple', 'white'];

    // ========== UPGRADES ==========
    const UPGRADE_POOL = [
        { id: 'hp', name: 'Primal Vigor', icon: '\u{1F49A}', desc: '+8 Max HP & Full Heal', colorBg: 'emerald' },
        { id: 'attack', name: 'Sharpened Claws', icon: '\u{2694}\u{FE0F}', desc: '+1 Damage & +5% Crit', colorBg: 'rose' },
        { id: 'guardiancharge', name: 'Attunement', icon: '\u{2728}', desc: 'Guardian charges 25% faster', colorBg: 'violet' },
        { id: 'thorns', name: 'Thorn Shield', icon: '\u{1F33F}', desc: 'Reflect 2 damage when hit', colorBg: 'lime' },
        { id: 'lifesteal', name: 'Vampiric Fang', icon: '\u{1F987}', desc: 'Attacks heal 15% of damage', colorBg: 'red' },
        { id: 'extramove', name: 'Swift Paws', icon: '\u{1F43E}', desc: '+1 Move per turn', colorBg: 'amber', unique: true },
        { id: 'goldfind', name: "Fortune's Favor", icon: '\u{1F340}', desc: '+50% gold earned', colorBg: 'yellow' },
        { id: 'guardiandmg', name: 'Guardian Mastery', icon: '\u{1F31F}', desc: '+50% Guardian ability power', colorBg: 'cyan' },
        { id: 'ironskin', name: 'Iron Bark', icon: '\u{1FAA8}', desc: '-20% damage taken', colorBg: 'stone' },
        { id: 'chainbonus', name: 'Chain Lightning', icon: '\u{26D3}\u{FE0F}', desc: '5+ chains deal 50% bonus', colorBg: 'indigo' },
        { id: 'regen', name: "Nature's Gift", icon: '\u{1F331}', desc: 'Heal 3 HP each turn', colorBg: 'green' },
        { id: 'shieldmaster', name: 'Aegis', icon: '\u{1F6E1}\u{FE0F}', desc: '+50% shield from earth', colorBg: 'orange' },
    ];

    // ========== ACHIEVEMENTS ==========
    const ACHIEVEMENTS = [
        { id: 'first_run', name: 'First Steps', desc: 'Complete your first run', check: m => m.totalRuns >= 1, perk: '+3 Starting HP' },
        { id: 'veteran', name: 'Veteran Explorer', desc: 'Complete 5 runs', check: m => m.totalRuns >= 5, perk: '+1 Starting Potion' },
        { id: 'boss_slayer', name: 'Boss Slayer', desc: 'Slay 5 bosses total', check: m => m.totalBossesKilled >= 5, perk: '+1 Starting Damage' },
        { id: 'hoarder', name: 'Treasure Hunter', desc: 'Earn 500 gold total', check: m => m.totalGoldEarned >= 500, perk: 'Start with 15 Gold' },
        { id: 'deep_delver', name: 'Deep Delver', desc: 'Reach floor 15', check: m => m.bestFloor >= 15, perk: '+5% Crit Chance' },
        { id: 'centurion', name: 'Centurion', desc: 'Slay 100 enemies total', check: m => m.totalEnemiesKilled >= 100, perk: '+10 Guardian Charge Start' },
        { id: 'floor_30', name: 'Abyss Walker', desc: 'Reach floor 30', check: m => m.bestFloor >= 30, perk: '+10 Max HP' },
        { id: 'dragon', name: 'Dragon Slayer', desc: 'Defeat the Dragon King', check: m => m.dragonKingDefeated === true, perk: '+1 Move per Turn' },
        { id: 'looper', name: 'Loop Master', desc: 'Form 10 loops total', check: m => m.totalLoops >= 10, perk: '+15% Loop Charge Bonus' },
    ];

    // ========== META PERSISTENCE ==========
    function loadMeta() {
        try { const s = localStorage.getItem(META_KEY); if (s) return JSON.parse(s); } catch(e) {}
        return { totalRuns: 0, bestFloor: 0, totalEnemiesKilled: 0, totalBossesKilled: 0, totalGoldEarned: 0, dragonKingDefeated: false, totalLoops: 0, achievements: [] };
    }
    function saveMeta() { try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch(e) {} }
    function checkNewAchievements() {
        const newOnes = [];
        ACHIEVEMENTS.forEach(a => { if (!meta.achievements.includes(a.id) && a.check(meta)) { meta.achievements.push(a.id); newOnes.push(a); } });
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
                case 'floor_30': player.maxHp += 10; player.hp += 10; break;
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

    // ========== STATE ==========
    let state = {
        grid: [],
        selected: [],
        isDragging: false,
        isLoop: false,
        processing: false,
        moves: BASE_MOVES_PER_TURN,
        turn: 1,
        combo: 0,
        floor: 1,
        guardian: null,
        player: {
            hp: 25, maxHp: 25, shield: 0, xp: 0, maxXp: 15, level: 1,
            dmgBonus: 0, gold: 0, potions: 1, critChance: 0.1,
            bleed: 0, burn: 0, cursed: false,
            upgrades: [],
            thorns: 0, lifestealPct: 0, goldFindBonus: 0,
            dmgReduction: 0, chainBonusPct: 0, regenPerTurn: 0, shieldBonus: 0,
            guardianChargeBonus: 0, guardianDmgBonus: 0,
            tempThorns: 0, tempThornsTurns: 0,
        },
        enemy: null,
        stats: { enemiesDefeated: 0, bossesDefeated: 0, damageDealt: 0, damageReceived: 0, goldEarned: 0, criticalHits: 0, longestChain: 0, potionsUsed: 0, cascades: 0, loopsFormed: 0 },
        audioReady: false
    };

    // ========== DOM REFERENCES ==========
    const boardElement = document.getElementById('game-board');
    const connectorSvg = document.getElementById('connector-svg');
    const floatingTextContainer = document.getElementById('floating-text-container');
    const elTurnStatus = document.getElementById('turn-status-text');
    const elFloorDisplay = document.getElementById('floor-display');
    const elBiomeDisplay = document.getElementById('biome-display');
    const elCombo = document.getElementById('combo-text');
    const elComboVal = document.getElementById('combo-value');
    const elPlayerHpBar = document.getElementById('player-hp-bar');
    const elPlayerHpText = document.getElementById('player-hp-text-overlay');
    const elPlayerShield = document.getElementById('player-shield-text');
    const elPlayerLevel = document.getElementById('player-level');
    const elPlayerPortrait = document.getElementById('player-portrait-container');
    const elPlayerGold = document.getElementById('player-gold');
    const elPlayerPotions = document.getElementById('player-potions');
    const elPlayerXpText = document.getElementById('player-xp-text');
    const elPerksDisplay = document.getElementById('perks-display');
    const elGuardianIcon = document.getElementById('guardian-icon');
    const elGuardianName = document.getElementById('guardian-name');
    const elGuardianChargeBar = document.getElementById('guardian-charge-bar');
    const elGuardianChargeText = document.getElementById('guardian-charge-text');
    const elGuardianBar = document.getElementById('guardian-bar');
    const btnGuardian = document.getElementById('guardian-btn');
    const btnPotion = document.getElementById('potion-btn');
    const btnShuffle = document.getElementById('shuffle-btn');
    const elEnemyName = document.getElementById('enemy-name');
    const elEnemyLevel = document.getElementById('enemy-level');
    const elEnemyHpBar = document.getElementById('enemy-hp-bar');
    const elEnemyHpText = document.getElementById('enemy-hp-text');
    const elEnemyStatus = document.getElementById('enemy-action');
    const elEnemyPortrait = document.getElementById('enemy-portrait-container');
    const elLoopIndicator = document.getElementById('loop-indicator');
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
    const modalPath = document.getElementById('path-modal');
    const elPathBiome = document.getElementById('path-biome-text');
    const elPathChoices = document.getElementById('path-choices');
    const modalGuardian = document.getElementById('guardian-modal');
    const elGuardianChoices = document.getElementById('guardian-choices');
    const modalEvent = document.getElementById('event-modal');

    // ========== AUDIO ==========
    let synthConnect, synthHit, synthHeal, synthShield, synthPowerup, synthSurge, synthCrit, synthBoss, synthCascade;
    async function initAudio() {
        if (state.audioReady) return;
        await Tone.start();
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
                case 'connect': { const n = ["C4","D4","E4","G4","A4","C5","D5","E5","G5","A5"]; synthConnect.triggerAttackRelease(n[Math.min(val, n.length-1)], "16n"); break; }
                case 'attack': synthHit.triggerAttackRelease("16n"); break;
                case 'heal': synthHeal.triggerAttackRelease("C5", "8n"); break;
                case 'shield': synthShield.triggerAttackRelease("32n"); break;
                case 'powerup': synthPowerup.triggerAttackRelease("A5", "16n"); break;
                case 'enemy': synthSurge.triggerAttackRelease("G1", "4n"); break;
                case 'crit': synthCrit.triggerAttackRelease("E5", "8n"); setTimeout(() => synthCrit.triggerAttackRelease("G5", "8n"), 100); break;
                case 'boss': synthBoss.triggerAttackRelease("C2", "2n"); break;
                case 'gold': synthPowerup.triggerAttackRelease("G5", "16n"); setTimeout(() => synthPowerup.triggerAttackRelease("C6", "16n"), 80); break;
                case 'cascade': { const cn = ["E5","G5","B5","D6"]; synthCascade.triggerAttackRelease(cn[Math.min(val, cn.length-1)], "8n"); break; }
                case 'achievement': synthPowerup.triggerAttackRelease("C5", "8n"); setTimeout(() => synthPowerup.triggerAttackRelease("E5", "8n"), 120); setTimeout(() => synthPowerup.triggerAttackRelease("G5", "8n"), 240); break;
                case 'loop': synthCascade.triggerAttackRelease("A5", "8n"); setTimeout(() => synthCascade.triggerAttackRelease("C6", "8n"), 100); break;
                case 'loop_clear': synthSurge.triggerAttackRelease("C2", "8n"); setTimeout(() => { synthPowerup.triggerAttackRelease("E5", "16n"); setTimeout(() => synthPowerup.triggerAttackRelease("G5", "16n"), 60); setTimeout(() => synthPowerup.triggerAttackRelease("C6", "16n"), 120); }, 100); break;
                case 'guardian': synthBoss.triggerAttackRelease("E3", "4n"); setTimeout(() => synthCrit.triggerAttackRelease("A5", "8n"), 150); setTimeout(() => synthCrit.triggerAttackRelease("E6", "8n"), 300); break;
            }
        } catch (e) {}
    }

    // ========== INITIALIZATION ==========
    function init() {
        applyMetaPerks(state.player);
        state.moves = getMovesPerTurn();
        elPlayerPortrait.innerHTML = ICONS.player;
        generateGrid(true);
        renderBoard(true);

        boardElement.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        btnGuardian.addEventListener('click', activateGuardian);
        btnPotion?.addEventListener('click', usePotion);
        btnShuffle?.addEventListener('click', shuffleBoard);
        btnNextBattle.addEventListener('click', onVictoryContinue);
        btnRestart.addEventListener('click', restartGame);
        document.body.addEventListener('click', initAudio, { once: true });
        resizeBoard();
        window.addEventListener('resize', resizeBoard);
        showActivePerks();
        applyBiome();
        showGuardianSelection(false);
    }

    function resizeBoard() {
        const w = boardElement.clientWidth;
        boardElement.style.height = `${w}px`;
        drawConnector();
    }

    function showActivePerks() {
        if (!elPerksDisplay || meta.achievements.length === 0) { if (elPerksDisplay) elPerksDisplay.style.display = 'none'; return; }
        const perkNames = meta.achievements.map(aId => { const a = ACHIEVEMENTS.find(x => x.id === aId); return a ? a.perk : ''; }).filter(Boolean);
        if (perkNames.length > 0) {
            elPerksDisplay.style.display = 'block';
            elPerksDisplay.innerHTML = perkNames.map(p => `<span class="perk-tag">${p}</span>`).join('');
            setTimeout(() => { elPerksDisplay.style.opacity = '0'; setTimeout(() => { elPerksDisplay.style.display = 'none'; elPerksDisplay.style.opacity = '1'; }, 500); }, 3000);
        }
    }

    // ========== BIOME ==========
    function getCurrentBiome() {
        for (const biome of BIOMES) {
            if (state.floor >= biome.floors[0] && state.floor <= biome.floors[1]) return biome;
        }
        return BIOMES[BIOMES.length - 1];
    }

    function applyBiome() {
        const biome = getCurrentBiome();
        document.body.style.background = biome.bg;
        document.body.style.backgroundAttachment = 'fixed';
        if (elBiomeDisplay) {
            elBiomeDisplay.textContent = biome.name;
            elBiomeDisplay.style.color = biome.accent;
        }
    }

    // ========== ENEMY SPAWNING ==========
    function spawnEnemy(isElite = false) {
        const isBoss = state.floor % BOSS_EVERY === 0;
        let template, scaleMult;
        if (isBoss) {
            template = BOSSES[Math.min(Math.floor(state.floor / BOSS_EVERY) - 1, BOSSES.length - 1)];
            scaleMult = Math.floor(state.floor / BOSS_EVERY);
            playSound('boss');
        } else {
            const idx = Math.min(Math.floor((state.floor - 1) / 3), ENEMIES.length - 1);
            template = ENEMIES[Math.floor(Math.random() * (idx + 1))];
            scaleMult = state.floor;
        }
        let hpMult = isElite ? 1.4 : 1;
        let dmgMult = isElite ? 1.2 : 1;
        if (state.floor > 20) { hpMult *= 1 + (state.floor - 20) * 0.03; dmgMult *= 1 + (state.floor - 20) * 0.02; }

        const maxHp = Math.floor((template.hpBase + (scaleMult - 1) * template.hpScale) * hpMult);
        state.enemy = {
            name: template.name, icon: template.icon, colorClass: template.color,
            maxHp, hp: maxHp,
            damage: Math.floor((template.dmgBase + (scaleMult - 1) * template.dmgScale * 0.5) * dmgMult),
            level: scaleMult, ability: template.ability, abilityDesc: template.abilityDesc,
            isBoss: template.isBoss || false, isElite: isElite, enraged: false,
            armorReduction: template.ability === 'armor' ? 0.3 : 0,
            reflectDamage: template.ability === 'reflect' ? 0.2 : 0,
            stunned: false, shocked: 0, weakened: false, weakenedTurns: 0,
            burnDot: 0, burnDotTurns: 0, poisonDot: 0, poisonDotTurns: 0,
        };
        elEnemyPortrait.innerHTML = ICONS[template.icon] || ICONS['gloom-cap'];
        elEnemyName.className = `text-xl font-fantasy font-bold ${template.colorClass}`;
        elEnemyPortrait.classList.toggle('boss-portrait', !!state.enemy.isBoss);
        updateEnemyUI();
    }

    // ========== GRID ==========
    function generateGrid(full = false) {
        if (full) state.grid = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            if (!state.grid[x]) state.grid[x] = [];
            for (let y = 0; y < GRID_SIZE; y++) {
                if (!state.grid[x][y]) {
                    const type = RUNE_TYPES[Math.floor(Math.random() * RUNE_TYPES.length)];
                    state.grid[x][y] = { type, x, y, frozenTurns: 0 };
                }
            }
        }
        ensureBoardDiversity();
    }

    function ensureBoardDiversity() {
        const counts = {};
        RUNE_TYPES.forEach(t => counts[t] = 0);
        for (let x = 0; x < GRID_SIZE; x++) for (let y = 0; y < GRID_SIZE; y++) if (state.grid[x][y]) counts[state.grid[x][y].type]++;
        RUNE_TYPES.forEach(type => {
            while (counts[type] > 12) {
                const minType = RUNE_TYPES.reduce((a, b) => counts[a] < counts[b] ? a : b);
                let found = false;
                for (let x = 0; x < GRID_SIZE && !found; x++) {
                    for (let y = 0; y < GRID_SIZE && !found; y++) {
                        if (state.grid[x][y] && state.grid[x][y].type === type) {
                            state.grid[x][y].type = minType; counts[type]--; counts[minType]++; found = true;
                        }
                    }
                }
                if (!found) break;
            }
        });
    }

    // ========== BOARD RENDERING ==========
    let cellElements = [];

    function renderBoard(fullRebuild = false) {
        if (fullRebuild || cellElements.length === 0) {
            boardElement.innerHTML = '';
            cellElements = [];
            for (let y = 0; y < GRID_SIZE; y++) {
                for (let x = 0; x < GRID_SIZE; x++) {
                    const cell = document.createElement('div');
                    cell.dataset.x = x;
                    cell.dataset.y = y;
                    boardElement.appendChild(cell);
                    cellElements.push(cell);
                }
            }
        }
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const cell = cellElements[y * GRID_SIZE + x];
                const rune = state.grid[x][y];
                if (!rune) continue;
                if (cell._type !== rune.type) {
                    cell.innerHTML = ICONS[rune.type];
                    cell._type = rune.type;
                }
                let cls = 'rune rune-' + rune.type;
                if (state.selected.some(s => s.x === x && s.y === y)) cls += ' selected';
                if (rune.frozenTurns > 0) cls += ' frozen';
                if (rune._cascading) cls += ' cascade-glow';
                if (rune._falling) { cls += ' animate-fall'; rune._falling = false; }
                cell.className = cls;
                if (rune.frozenTurns > 0) cell.dataset.frozenTurns = rune.frozenTurns;
                else delete cell.dataset.frozenTurns;
            }
        }
        drawConnector();
    }

    function updateSelectionVisuals() {
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const cell = cellElements[y * GRID_SIZE + x];
                if (!cell) continue;
                cell.classList.toggle('selected', state.selected.some(s => s.x === x && s.y === y));
            }
        }
        drawConnector();
    }

    function getCellFromEvent(e) {
        const rect = boardElement.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / rect.width * GRID_SIZE);
        const y = Math.floor((e.clientY - rect.top) / rect.height * GRID_SIZE);
        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) return { x, y };
        return null;
    }

    // ========== INPUT HANDLING ==========
    function onPointerDown(e) {
        if (state.processing) return;
        state.isDragging = true;
        state.isLoop = false;
        state.selected = [];
        const hit = getCellFromEvent(e);
        if (hit && state.grid[hit.x][hit.y]) {
            const rune = state.grid[hit.x][hit.y];
            if (rune.frozenTurns > 0) {
                const cell = cellElements[hit.y * GRID_SIZE + hit.x];
                spawnFloatingText(cell, `Frozen ${rune.frozenTurns}t`, "#38bdf8");
                state.isDragging = false;
                return;
            }
            state.selected.push({ x: hit.x, y: hit.y });
            playSound('connect', 0);
            updateSelectionVisuals();
            boardElement.setPointerCapture(e.pointerId);
        }
    }

    function onPointerMove(e) {
        if (!state.isDragging || state.processing) return;
        const hit = getCellFromEvent(e);
        if (!hit || !state.grid[hit.x] || !state.grid[hit.x][hit.y]) return;

        const last = state.selected[state.selected.length - 1];
        if (!last) return;
        if (last.x === hit.x && last.y === hit.y) {
            if (state.isLoop) { state.isLoop = false; hideLoopPreview(); }
            return;
        }

        // Loop detection: dragging back to the first cell
        if (state.selected.length >= 3) {
            const first = state.selected[0];
            if (hit.x === first.x && hit.y === first.y) {
                const dx = Math.abs(hit.x - last.x);
                const dy = Math.abs(hit.y - last.y);
                if (dx <= 1 && dy <= 1 && (dx + dy > 0)) {
                    if (!state.isLoop) {
                        state.isLoop = true;
                        showLoopPreview();
                        playSound('loop');
                    }
                    return;
                }
            }
        }

        if (state.isLoop) {
            state.isLoop = false;
            hideLoopPreview();
        }

        // Backtrack
        if (state.selected.length > 1) {
            const prev = state.selected[state.selected.length - 2];
            if (prev.x === hit.x && prev.y === hit.y) {
                state.selected.pop();
                playSound('connect', state.selected.length);
                updateSelectionVisuals();
                return;
            }
        }

        const dx = Math.abs(hit.x - last.x);
        const dy = Math.abs(hit.y - last.y);
        if (dx <= 1 && dy <= 1 && (dx + dy > 0)) {
            const lastRune = state.grid[last.x][last.y];
            const newRune = state.grid[hit.x][hit.y];
            if (canConnect(lastRune, newRune) && !state.selected.some(s => s.x === hit.x && s.y === hit.y)) {
                state.selected.push({ x: hit.x, y: hit.y });
                playSound('connect', state.selected.length - 1);
                updateSelectionVisuals();
            }
        }
    }

    function canConnect(a, b) {
        if (a.frozenTurns > 0 || b.frozenTurns > 0) return false;
        return a.type === b.type || a.type === 'white' || b.type === 'white';
    }

    function onPointerUp() {
        if (!state.isDragging) return;
        state.isDragging = false;
        if (state.isLoop && state.selected.length >= 3) {
            processLoop();
        } else if (state.selected.length >= 3) {
            processMatch();
        } else {
            state.selected = [];
            state.isLoop = false;
            hideLoopPreview();
            updateSelectionVisuals();
        }
    }

    function drawConnector() {
        if (state.selected.length < 2 || cellElements.length === 0) { connectorSvg.innerHTML = ''; return; }
        let pathStr = '';
        state.selected.forEach((pos, i) => {
            const cell = cellElements[pos.y * GRID_SIZE + pos.x];
            const rect = cell.getBoundingClientRect();
            const parentRect = boardElement.getBoundingClientRect();
            const cx = (rect.left - parentRect.left) + rect.width / 2;
            const cy = (rect.top - parentRect.top) + rect.height / 2;
            pathStr += i === 0 ? `M ${cx} ${cy}` : ` L ${cx} ${cy}`;
        });
        if (state.isLoop && state.selected.length >= 3) {
            const first = state.selected[0];
            const cell = cellElements[first.y * GRID_SIZE + first.x];
            const rect = cell.getBoundingClientRect();
            const parentRect = boardElement.getBoundingClientRect();
            pathStr += ` L ${(rect.left - parentRect.left) + rect.width / 2} ${(rect.top - parentRect.top) + rect.height / 2}`;
            connectorSvg.innerHTML = `<path d="${pathStr}" class="connector-line loop" />`;
        } else {
            connectorSvg.innerHTML = `<path d="${pathStr}" class="connector-line" />`;
        }
    }

    // ========== LOOP PREVIEW ==========
    function showLoopPreview() {
        const primaryType = getPrimaryType(state.selected);
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const cell = cellElements[y * GRID_SIZE + x];
                if (state.grid[x][y] && state.grid[x][y].type === primaryType) {
                    cell.classList.add('loop-target');
                }
            }
        }
        elLoopIndicator.style.display = 'block';
        drawConnector();
    }

    function hideLoopPreview() {
        cellElements.forEach(cell => cell.classList.remove('loop-target'));
        elLoopIndicator.style.display = 'none';
        drawConnector();
    }

    function getPrimaryType(cells) {
        const counts = {};
        cells.forEach(p => {
            const t = state.grid[p.x][p.y]?.type;
            if (t && t !== 'white') counts[t] = (counts[t] || 0) + 1;
        });
        let primaryType = 'white';
        let maxCount = 0;
        for (const t in counts) { if (counts[t] > maxCount) { maxCount = counts[t]; primaryType = t; } }
        return primaryType;
    }

    // ========== MATCH PROCESSING ==========
    function processMatch() {
        state.processing = true;
        const len = state.selected.length;
        if (len > state.stats.longestChain) state.stats.longestChain = len;

        const primaryType = getPrimaryType(state.selected);
        let power = len;
        const comboMult = 1 + (state.combo * 0.15);
        if (len >= 5 && state.player.chainBonusPct > 0) power = Math.floor(power * (1 + state.player.chainBonusPct));

        const critBonus = len >= 6 ? 0.2 : (len >= 5 ? 0.1 : 0);
        const isCrit = Math.random() < (state.player.critChance + critBonus);
        if (isCrit) { power = Math.floor(power * 1.75); state.stats.criticalHits++; playSound('crit'); screenShake(true); }

        applyMatchEffect(primaryType, power, comboMult, isCrit, state.selected);
        chargeGuardian(primaryType, len, false);

        state.selected.forEach(p => { state.grid[p.x][p.y] = null; });
        state.selected = [];
        connectorSvg.innerHTML = '';
        refillBoard();
        renderBoard();

        setTimeout(() => {
            checkCascades(0, () => {
                state.moves--;
                state.processing = false;
                if (state.moves <= 0) endTurn();
                else updateUI();
            });
        }, 250);
    }

    function processLoop() {
        state.processing = true;
        state.stats.loopsFormed++;
        meta.totalLoops = (meta.totalLoops || 0) + 1;
        saveMeta();

        const primaryType = getPrimaryType(state.selected);

        const allMatches = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let y = 0; y < GRID_SIZE; y++) {
                if (state.grid[x][y] && state.grid[x][y].type === primaryType) {
                    allMatches.push({ x, y });
                }
            }
        }

        const power = allMatches.length;
        if (power > state.stats.longestChain) state.stats.longestChain = power;
        const comboMult = 1 + (state.combo * 0.15);

        applyMatchEffect(primaryType, power, comboMult, false, allMatches);
        chargeGuardian(primaryType, allMatches.length, true);

        allMatches.forEach(p => { state.grid[p.x][p.y] = null; });
        state.selected = [];
        state.isLoop = false;
        hideLoopPreview();
        connectorSvg.innerHTML = '';

        screenShake(true);
        spawnFloatingText(boardElement, `\u{2B55} LOOP x${power}!`, '#fbbf24', true);
        playSound('loop_clear');

        refillBoard();
        renderBoard();

        setTimeout(() => {
            checkCascades(0, () => {
                state.moves--;
                state.processing = false;
                if (state.moves <= 0) endTurn();
                else updateUI();
            });
        }, 350);
    }

    function applyMatchEffect(type, power, comboMult, isCrit, cells) {
        const baseDmg = 1 + state.player.dmgBonus;
        let msg = "", color = "#fff", effectValue = 0;

        switch (type) {
            case 'red': {
                effectValue = Math.floor(power * baseDmg * comboMult);
                damageEnemy(effectValue);
                if (state.player.lifestealPct > 0) { const s = Math.floor(effectValue * state.player.lifestealPct); if (s > 0) healPlayer(s); }
                msg = isCrit ? `\u{1F4A5} ${effectValue}!` : `-${effectValue}`;
                color = "#f43f5e"; playSound('attack'); break;
            }
            case 'green': {
                let heal = Math.floor(power * 1.5 * comboMult);
                if (state.player.cursed) { heal = Math.floor(heal * 0.5); msg = `+${heal} (cursed)`; }
                else msg = `+${heal} HP`;
                healPlayer(heal); color = "#10b981"; playSound('heal'); break;
            }
            case 'blue': {
                effectValue = Math.floor(power * baseDmg * 0.8 * comboMult);
                damageEnemy(effectValue);
                if (state.player.lifestealPct > 0) { const s = Math.floor(effectValue * state.player.lifestealPct); if (s > 0) healPlayer(s); }
                if (power >= 4 && Math.random() < 0.3 && state.enemy) {
                    state.enemy.shocked = 2;
                    msg = isCrit ? `\u{26A1} ${effectValue} SHOCKED!` : `-${effectValue} shocked!`;
                } else {
                    msg = isCrit ? `\u{26A1} ${effectValue}!` : `-${effectValue}`;
                }
                color = "#0ea5e9"; playSound('attack'); break;
            }
            case 'yellow': {
                let block = Math.floor(power * 1.5 * comboMult);
                if (state.player.shieldBonus > 0) block = Math.floor(block * (1 + state.player.shieldBonus));
                addShield(block); msg = `+${block} Shield`; color = "#f59e0b"; playSound('shield'); break;
            }
            case 'purple': {
                effectValue = Math.floor(power * baseDmg * 0.7 * comboMult);
                damageEnemy(effectValue);
                if (state.player.lifestealPct > 0) { const s = Math.floor(effectValue * state.player.lifestealPct); if (s > 0) healPlayer(s); }
                if (state.enemy && state.enemy.hp > 0) {
                    const pdmg = Math.max(1, Math.floor(power * 0.5));
                    state.enemy.poisonDot = Math.max(state.enemy.poisonDot, pdmg);
                    state.enemy.poisonDotTurns = Math.max(state.enemy.poisonDotTurns, 2);
                }
                msg = isCrit ? `\u{2620}\u{FE0F} ${effectValue}+\u{1F9EA}!` : `-${effectValue}+\u{1F9EA}`;
                color = "#a78bfa"; playSound('attack'); break;
            }
            case 'white': {
                const xpScale = 1 / (1 + state.player.level * 0.08);
                const xp = Math.max(1, Math.floor(power * 1.5 * xpScale));
                let gold = Math.floor(power * 2);
                if (state.player.goldFindBonus > 0) gold = Math.floor(gold * (1 + state.player.goldFindBonus));
                gainXp(xp); gainGold(gold); msg = `+${xp} XP +${gold}g`; color = "#fef3c7"; playSound('gold'); break;
            }
        }

        if (cells.length > 0) {
            const mid = cells[Math.floor(cells.length / 2)];
            const cell = cellElements[mid.y * GRID_SIZE + mid.x];
            if (cell) spawnFloatingText(cell, msg, color, isCrit);
        }

        state.combo++;
        elCombo.style.opacity = "1";
        elComboVal.innerText = `x${comboMult.toFixed(1)}`;
        clearTimeout(state.comboTimer);
        state.comboTimer = setTimeout(() => { elCombo.style.opacity = "0"; }, 2000);
    }

    // ========== GUARDIAN SYSTEM ==========
    function chargeGuardian(matchType, dotCount, isLoop) {
        if (!state.guardian) return;
        const g = GUARDIANS.find(gd => gd.id === state.guardian.id);
        if (!g) return;

        let charge = 0;
        if (matchType === g.element || matchType === 'white') {
            charge = dotCount * g.chargePerElement;
        } else {
            charge = dotCount * g.chargePerOther;
        }

        if (isLoop) {
            charge = Math.floor(charge * 1.5);
            if (meta.achievements.includes('looper')) charge = Math.floor(charge * 1.15);
        }
        if (state.player.guardianChargeBonus > 0) charge = Math.floor(charge * (1 + state.player.guardianChargeBonus));

        state.guardian.charge = Math.min(state.guardian.charge + charge, g.maxCharge);
        updateGuardianUI();
    }

    function activateGuardian() {
        if (!state.guardian || state.processing) return;
        const g = GUARDIANS.find(gd => gd.id === state.guardian.id);
        if (!g || state.guardian.charge < g.maxCharge) return;

        state.guardian.charge = 0;
        const dmgMult = 1 + state.player.guardianDmgBonus;
        playSound('guardian');

        switch (g.id) {
            case 'verdant': {
                state.player.hp = state.player.maxHp;
                state.player.bleed = 0;
                state.player.burn = 0;
                state.player.cursed = false;
                spawnFloatingText(elPlayerPortrait, '\u{1F33F} RENEWAL!', '#10b981', true);
                break;
            }
            case 'storm': {
                const dmg = Math.floor((25 + state.player.level * 5) * dmgMult);
                damageEnemy(dmg);
                if (state.enemy && state.enemy.hp > 0) state.enemy.stunned = true;
                spawnFloatingText(elEnemyPortrait, `\u{26A1} -${dmg} STUN!`, '#0ea5e9', true);
                break;
            }
            case 'stone': {
                const shield = Math.floor(state.player.maxHp * 0.5 * dmgMult);
                state.player.shield += shield;
                state.player.tempThorns = Math.floor(5 * dmgMult);
                state.player.tempThornsTurns = 3;
                spawnFloatingText(elPlayerPortrait, `\u{1F6E1}\u{FE0F} +${shield} FORTIFY!`, '#f59e0b', true);
                break;
            }
            case 'ember': {
                const dmg = Math.floor((30 + state.player.level * 4) * dmgMult);
                damageEnemy(dmg);
                if (state.enemy && state.enemy.hp > 0) {
                    state.enemy.burnDot = Math.floor(3 * dmgMult);
                    state.enemy.burnDotTurns = 5;
                }
                spawnFloatingText(elEnemyPortrait, `\u{1F525} -${dmg} BURN!`, '#f43f5e', true);
                break;
            }
            case 'shadow': {
                if (state.enemy && state.enemy.hp > 0) {
                    const pdmg = Math.max(2, Math.floor(state.enemy.maxHp * 0.05 * dmgMult));
                    state.enemy.poisonDot = pdmg;
                    state.enemy.poisonDotTurns = 4;
                    state.enemy.weakened = true;
                    state.enemy.weakenedTurns = 3;
                }
                spawnFloatingText(elEnemyPortrait, '\u{1F311} SHADOWSTRIKE!', '#a78bfa', true);
                break;
            }
        }

        screenShake(true);
        document.body.classList.add('animate-pulse-bright');
        setTimeout(() => document.body.classList.remove('animate-pulse-bright'), 1000);
        updateUI();
        updateGuardianUI();
    }

    function showGuardianSelection(isShrine) {
        const title = document.getElementById('guardian-modal-title');
        title.textContent = isShrine ? '\u{1F3DB}\u{FE0F} Guardian Shrine' : '\u{1F3DB}\u{FE0F} Choose Your Guardian';
        elGuardianChoices.innerHTML = '';

        GUARDIANS.forEach(g => {
            const card = document.createElement('div');
            const isEquipped = state.guardian && state.guardian.id === g.id;
            card.className = 'guardian-card' + (isEquipped ? ' equipped' : '');
            card.innerHTML = `
                <div class="text-2xl w-9 text-center">${g.icon}</div>
                <div class="flex-1">
                    <div class="text-sm font-bold" style="color: ${g.color}">${g.name}${isEquipped ? ' \u{2713}' : ''}</div>
                    <div class="text-xs text-slate-400">${g.desc}</div>
                    <div class="text-[10px] text-slate-500 mt-0.5"><strong>${g.abilityName}:</strong> ${g.abilityDesc}</div>
                    <div class="text-[10px] text-slate-600">Charges from <span style="color:${g.color}">${g.element}</span> essences</div>
                </div>`;
            card.onclick = () => {
                if (isShrine && state.guardian && state.guardian.id === g.id) {
                    state.guardian.charge = Math.min(state.guardian.charge + 30, g.maxCharge);
                } else {
                    const startCharge = isShrine ? 30 : (meta.achievements.includes('centurion') ? 10 : 0);
                    state.guardian = { id: g.id, charge: startCharge };
                }
                modalGuardian.classList.remove('visible');
                updateGuardianUI();
                if (!isShrine) {
                    startCombatEncounter(false);
                } else {
                    advanceToNextEncounter();
                }
            };
            elGuardianChoices.appendChild(card);
        });

        modalGuardian.classList.add('visible');
    }

    function updateGuardianUI() {
        if (!state.guardian) return;
        const g = GUARDIANS.find(gd => gd.id === state.guardian.id);
        if (!g) return;

        elGuardianIcon.textContent = g.icon;
        elGuardianName.textContent = g.name;
        elGuardianName.style.color = g.color;
        const pct = (state.guardian.charge / g.maxCharge) * 100;
        elGuardianChargeBar.style.width = pct + '%';
        elGuardianChargeText.textContent = `${state.guardian.charge}/${g.maxCharge}`;

        elGuardianChargeBar.className = 'hp-bar guardian-bar-fill ' + g.id;

        const container = elGuardianBar.querySelector('.guardian-bar-container');
        const isCharged = state.guardian.charge >= g.maxCharge;
        container.classList.toggle('charged', isCharged);
        container.style.setProperty('--guardian-color', g.color);
        btnGuardian.classList.toggle('hidden', !isCharged);
    }

    // ========== CASCADE SYSTEM ==========
    function findCascadeLines() {
        const matched = new Set();
        const groups = [];
        for (let y = 0; y < GRID_SIZE; y++) {
            let x = 0;
            while (x < GRID_SIZE) {
                const r = state.grid[x][y];
                if (!r || r.frozenTurns > 0) { x++; continue; }
                const type = r.type;
                let len = 1;
                while (x + len < GRID_SIZE && state.grid[x + len][y] && state.grid[x + len][y].type === type && state.grid[x + len][y].frozenTurns <= 0) len++;
                if (len >= 3) {
                    const cells = [];
                    for (let i = 0; i < len; i++) { matched.add(`${x + i},${y}`); cells.push({ x: x + i, y }); }
                    groups.push({ type, cells });
                }
                x += Math.max(len, 1);
            }
        }
        for (let x = 0; x < GRID_SIZE; x++) {
            let y = 0;
            while (y < GRID_SIZE) {
                const r = state.grid[x][y];
                if (!r || r.frozenTurns > 0) { y++; continue; }
                const type = r.type;
                let len = 1;
                while (y + len < GRID_SIZE && state.grid[x][y + len] && state.grid[x][y + len].type === type && state.grid[x][y + len].frozenTurns <= 0) len++;
                if (len >= 3) {
                    const cells = [];
                    for (let i = 0; i < len; i++) {
                        const key = `${x},${y + i}`;
                        if (!matched.has(key)) { matched.add(key); cells.push({ x, y: y + i }); }
                    }
                    if (cells.length > 0) groups.push({ type, cells });
                }
                y += Math.max(len, 1);
            }
        }
        return groups;
    }

    function checkCascades(depth, onComplete) {
        if (depth >= MAX_CASCADE_DEPTH) { onComplete(); return; }
        if (state.enemy && state.enemy.hp <= 0) { onComplete(); return; }
        const groups = findCascadeLines();
        if (groups.length === 0) { onComplete(); return; }
        state.stats.cascades++;
        groups.forEach(g => g.cells.forEach(c => { if (state.grid[c.x][c.y]) state.grid[c.x][c.y]._cascading = true; }));
        renderBoard();
        playSound('cascade', depth);
        spawnFloatingText(boardElement, `CASCADE x${depth + 1}!`, '#fbbf24', true);
        setTimeout(() => {
            groups.forEach(g => {
                const comboMult = 1 + (state.combo * 0.15);
                applyMatchEffect(g.type, g.cells.length, comboMult, false, g.cells);
                chargeGuardian(g.type, g.cells.length, false);
                g.cells.forEach(c => { state.grid[c.x][c.y] = null; });
            });
            refillBoard();
            renderBoard();
            updateUI();
            setTimeout(() => checkCascades(depth + 1, onComplete), 250);
        }, 200);
    }

    function refillBoard() {
        for (let x = 0; x < GRID_SIZE; x++) {
            const col = [];
            for (let y = 0; y < GRID_SIZE; y++) { if (state.grid[x][y]) col.push(state.grid[x][y]); }
            const missing = GRID_SIZE - col.length;
            const newCol = new Array(GRID_SIZE);
            for (let i = 0; i < col.length; i++) {
                newCol[GRID_SIZE - col.length + i] = col[i];
                newCol[GRID_SIZE - col.length + i].y = GRID_SIZE - col.length + i;
            }
            for (let i = 0; i < missing; i++) {
                const type = RUNE_TYPES[Math.floor(Math.random() * RUNE_TYPES.length)];
                newCol[i] = { type, x, y: i, frozenTurns: 0, _falling: true };
            }
            state.grid[x] = newCol;
        }
    }

    // ========== EFFECTS ==========
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
        const c = document.getElementById('game-container');
        c.classList.add(big ? 'shake-big' : 'shake-small');
        setTimeout(() => c.classList.remove('shake-big', 'shake-small'), 300);
    }

    // ========== COMBAT HELPERS ==========
    function damageEnemy(amount) {
        if (!state.enemy) return;
        if (state.enemy.armorReduction > 0) amount = Math.floor(amount * (1 - state.enemy.armorReduction));
        if (state.enemy.shocked && state.enemy.shocked > 0) amount = Math.floor(amount * 1.15);
        state.enemy.hp -= amount;
        state.stats.damageDealt += amount;
        if (state.enemy.reflectDamage > 0) {
            const r = Math.floor(amount * state.enemy.reflectDamage);
            if (r > 0) { state.player.hp -= r; spawnFloatingText(elPlayerPortrait, `-${r} reflected`, "#22d3ee"); }
        }
        if (state.enemy.isBoss && !state.enemy.enraged && state.enemy.hp <= state.enemy.maxHp * 0.5 && state.enemy.hp > 0) {
            state.enemy.enraged = true; state.enemy.damage = Math.floor(state.enemy.damage * 1.3);
            spawnFloatingText(elEnemyPortrait, "ENRAGED!", "#ef4444", true); screenShake(true);
        }
        updateEnemyUI();
        elEnemyPortrait.classList.add('animate-shake');
        setTimeout(() => elEnemyPortrait.classList.remove('animate-shake'), 500);
        if (state.enemy.hp <= 0) enemyDefeated();
    }

    function healPlayer(amount) { state.player.hp = Math.min(state.player.hp + amount, state.player.maxHp); updateUI(); }
    function addShield(amount) { state.player.shield += amount; updateUI(); }
    function gainXp(amount) { state.player.xp += amount; if (state.player.xp >= state.player.maxXp) levelUp(); updateUI(); }
    function gainGold(amount) { state.player.gold += amount; state.stats.goldEarned += amount; updateUI(); }

    function usePotion() {
        if (state.player.potions <= 0 || state.processing) return;
        state.player.potions--; state.stats.potionsUsed++;
        const heal = Math.floor(state.player.maxHp * 0.4);
        healPlayer(heal);
        state.player.bleed = 0; state.player.burn = 0; state.player.cursed = false;
        playSound('heal'); spawnFloatingText(elPlayerPortrait, `+${heal} HP`, "#10b981"); updateUI();
    }

    function shuffleBoard() {
        if (state.player.gold < 5 || state.processing) return;
        state.player.gold -= 5;
        const types = [];
        for (let x = 0; x < GRID_SIZE; x++) for (let y = 0; y < GRID_SIZE; y++) if (state.grid[x][y]) types.push(state.grid[x][y].type);
        for (let i = types.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [types[i], types[j]] = [types[j], types[i]]; }
        let idx = 0;
        for (let x = 0; x < GRID_SIZE; x++) for (let y = 0; y < GRID_SIZE; y++) {
            if (state.grid[x][y]) { state.grid[x][y].type = types[idx++]; state.grid[x][y].frozenTurns = 0; }
        }
        state.selected = [];
        renderBoard();
        playSound('powerup'); spawnFloatingText(boardElement, "SHUFFLED!", "#fbbf24"); screenShake(); updateUI();
    }

    function freezeRunes(count, turns) {
        let avail = [];
        for (let x = 0; x < GRID_SIZE; x++) for (let y = 0; y < GRID_SIZE; y++) if (state.grid[x][y] && state.grid[x][y].frozenTurns <= 0) avail.push(state.grid[x][y]);
        for (let i = avail.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [avail[i], avail[j]] = [avail[j], avail[i]]; }
        for (let i = 0; i < Math.min(count, avail.length); i++) avail[i].frozenTurns = turns;
        if (count > 0) { playSound('shield'); renderBoard(); }
    }

    // ========== TURN MANAGEMENT ==========
    function endTurn() {
        state.processing = true;
        elTurnStatus.textContent = "ENEMY TURN...";
        elTurnStatus.classList.replace('text-amber-400', 'text-rose-400');

        setTimeout(() => {
            if (!state.enemy || state.enemy.hp <= 0) { state.processing = false; return; }

            // Thaw frozen
            for (let x = 0; x < GRID_SIZE; x++) for (let y = 0; y < GRID_SIZE; y++) {
                if (state.grid[x][y] && state.grid[x][y].frozenTurns > 0) state.grid[x][y].frozenTurns--;
            }

            // Player regen
            if (state.player.regenPerTurn > 0) { healPlayer(state.player.regenPerTurn); spawnFloatingText(elPlayerPortrait, `+${state.player.regenPerTurn} regen`, "#22c55e"); }

            // Player status effects
            if (state.player.bleed > 0) { state.player.hp -= state.player.bleed; state.player.bleed = Math.max(0, state.player.bleed - 1); spawnFloatingText(elPlayerPortrait, `-${state.player.bleed + 1} bleed`, "#dc2626"); }
            if (state.player.burn > 0) { state.player.hp -= state.player.burn; state.player.burn = Math.max(0, state.player.burn - 1); spawnFloatingText(elPlayerPortrait, `-${state.player.burn + 1} burn`, "#f97316"); }

            // Enemy DoTs
            if (state.enemy.burnDotTurns > 0) {
                state.enemy.hp -= state.enemy.burnDot;
                state.enemy.burnDotTurns--;
                spawnFloatingText(elEnemyPortrait, `-${state.enemy.burnDot} burn`, '#f97316');
                if (state.enemy.hp <= 0) { updateEnemyUI(); enemyDefeated(); state.processing = false; return; }
            }
            if (state.enemy.poisonDotTurns > 0) {
                state.enemy.hp -= state.enemy.poisonDot;
                state.enemy.poisonDotTurns--;
                spawnFloatingText(elEnemyPortrait, `-${state.enemy.poisonDot} poison`, '#a78bfa');
                if (state.enemy.hp <= 0) { updateEnemyUI(); enemyDefeated(); state.processing = false; return; }
            }

            // Enemy regen
            if (state.enemy.ability === 'regen') { const r = Math.floor(state.enemy.maxHp * 0.08); state.enemy.hp = Math.min(state.enemy.hp + r, state.enemy.maxHp); spawnFloatingText(elEnemyPortrait, `+${r}`, "#10b981"); }

            // Shocked debuff tick
            if (state.enemy.shocked > 0) state.enemy.shocked--;

            // Check stun
            if (state.enemy.stunned) {
                state.enemy.stunned = false;
                spawnFloatingText(elEnemyPortrait, 'STUNNED! Skip turn', '#0ea5e9');
            } else {
                // Enemy attack
                let atkCount = state.enemy.ability === 'multiattack' ? 3 : 1;
                let dmg = state.enemy.damage;
                if (state.enemy.weakened) {
                    dmg = Math.floor(dmg * 0.7);
                    state.enemy.weakenedTurns--;
                    if (state.enemy.weakenedTurns <= 0) state.enemy.weakened = false;
                }
                let totalDmg = 0;
                for (let i = 0; i < atkCount; i++) {
                    let hitDmg = atkCount > 1 ? Math.floor(dmg / 2) : dmg;
                    const pierces = state.enemy.ability === 'pierce';
                    if (!pierces && state.player.shield > 0) {
                        if (state.player.shield >= hitDmg) { state.player.shield -= hitDmg; hitDmg = 0; } else { hitDmg -= state.player.shield; state.player.shield = 0; }
                    }
                    if (state.player.dmgReduction > 0 && hitDmg > 0) hitDmg = Math.max(1, Math.floor(hitDmg * (1 - state.player.dmgReduction)));
                    totalDmg += hitDmg;
                }

                if (totalDmg > 0) {
                    state.player.hp -= totalDmg; state.stats.damageReceived += totalDmg;
                    playSound('enemy'); screenShake(totalDmg > 10);
                    elPlayerPortrait.classList.add('animate-shake');
                    setTimeout(() => elPlayerPortrait.classList.remove('animate-shake'), 500);
                    spawnFloatingText(elPlayerPortrait, atkCount > 1 ? `-${totalDmg} (x${atkCount})` : `-${totalDmg}`, "#f43f5e");

                    // Thorns
                    const totalThorns = state.player.thorns + (state.player.tempThorns || 0);
                    if (totalThorns > 0 && state.enemy.hp > 0) {
                        state.enemy.hp -= totalThorns; state.stats.damageDealt += totalThorns;
                        spawnFloatingText(elEnemyPortrait, `-${totalThorns} thorns`, "#84cc16");
                        if (state.enemy.hp <= 0) { updateEnemyUI(); enemyDefeated(); return; }
                    }
                } else { playSound('shield'); spawnFloatingText(elPlayerPortrait, "BLOCKED", "#f59e0b"); }

                // Enemy abilities
                if (state.enemy.ability === 'bleed' && Math.random() < 0.4) { state.player.bleed = 3; spawnFloatingText(elPlayerPortrait, "BLEEDING!", "#dc2626"); }
                if (state.enemy.ability === 'burn' && Math.random() < 0.5) { state.player.burn = 4; spawnFloatingText(elPlayerPortrait, "BURNING!", "#f97316"); }
                if (state.enemy.ability === 'curse' && Math.random() < 0.3) { state.player.cursed = true; spawnFloatingText(elPlayerPortrait, "CURSED!", "#6366f1"); }
                if (state.enemy.ability === 'drain') {
                    if (state.guardian) {
                        const d = Math.floor(state.guardian.charge * 0.3);
                        state.guardian.charge -= d;
                        if (d > 0) { spawnFloatingText(elPlayerPortrait, `-${d} charge`, "#0ea5e9"); updateGuardianUI(); }
                    }
                }
                if (state.enemy.ability === 'freeze') { freezeRunes(3, 2); spawnFloatingText(elEnemyPortrait, "FROST!", "#38bdf8"); }
                if (state.enemy.ability === 'freeze_area') { freezeRunes(10, 2); spawnFloatingText(elEnemyPortrait, "BLIZZARD!", "#38bdf8"); }
                if (state.enemy.ability === 'inferno' && Math.random() < 0.4) { const b = Math.floor(state.enemy.damage * 0.5); state.player.hp -= b; state.player.burn = 5; spawnFloatingText(elPlayerPortrait, `-${b} INFERNO!`, "#ef4444", true); screenShake(true); }
                if (state.enemy.ability === 'darkness' && Math.random() < 0.5) { freezeRunes(4, 1); spawnFloatingText(elEnemyPortrait, "DARKNESS!", "#1f2937"); }
                if (state.enemy.ability === 'summon' && Math.random() < 0.4) { const h = Math.floor(state.enemy.maxHp * 0.05); state.enemy.hp = Math.min(state.enemy.hp + h, state.enemy.maxHp); freezeRunes(2, 1); spawnFloatingText(elEnemyPortrait, `+${h} ROOTS!`, "#166534"); }
            }

            // Temp thorns decay
            if (state.player.tempThornsTurns > 0) {
                state.player.tempThornsTurns--;
                if (state.player.tempThornsTurns <= 0) state.player.tempThorns = 0;
            }

            renderBoard();
            updateUI();

            if (state.player.hp <= 0) { state.processing = false; setTimeout(() => endRun(), 500); }
            else {
                state.moves = getMovesPerTurn(); state.turn++; state.combo = 0; elCombo.style.opacity = "0";
                state.processing = false;
                elTurnStatus.textContent = `Your Turn: ${state.moves}`;
                elTurnStatus.classList.replace('text-rose-400', 'text-amber-400');
            }
        }, 800);
    }

    // ========== PATH SELECTION ==========
    function showPathSelection() {
        const biome = getCurrentBiome();
        if (elPathBiome) { elPathBiome.textContent = biome.name; elPathBiome.style.color = biome.accent; }
        elPathChoices.innerHTML = '';

        const paths = generatePaths();
        paths.forEach(path => {
            const card = document.createElement('div');
            card.className = 'path-card';
            let detail = '';
            if (path.type === 'battle' || path.type === 'elite') {
                detail = `<div class="text-[10px] text-slate-500">${path.enemyPreview || 'Unknown creature'}</div>`;
            } else if (path.type === 'rest') {
                detail = `<div class="text-[10px] text-emerald-500">Heal 30% HP + cleanse</div>`;
            } else if (path.type === 'shrine') {
                detail = `<div class="text-[10px] text-violet-500">Switch or boost guardian</div>`;
            } else if (path.type === 'treasure') {
                detail = `<div class="text-[10px] text-amber-500">Gold + chance for potion</div>`;
            }
            card.innerHTML = `
                <div class="path-card-icon">${path.icon}</div>
                <div class="flex-1">
                    <div class="text-sm font-bold text-slate-200">${path.name}</div>
                    <div class="text-xs text-slate-400">${path.desc}</div>
                    ${detail}
                </div>`;
            card.onclick = () => handlePathChoice(path);
            elPathChoices.appendChild(card);
        });

        modalPath.classList.add('visible');
    }

    function generatePaths() {
        const paths = [];
        const battleType = PATH_TYPES.find(t => t.type === 'battle');
        paths.push(createPath(battleType));

        const usedTypes = new Set(['battle']);
        for (let i = 0; i < 2; i++) {
            const available = PATH_TYPES.filter(t => !usedTypes.has(t.type));
            if (available.length === 0) break;
            const totalWeight = available.reduce((sum, t) => sum + t.weight, 0);
            let r = Math.random() * totalWeight;
            let picked = available[0];
            for (const t of available) {
                r -= t.weight;
                if (r <= 0) { picked = t; break; }
            }
            usedTypes.add(picked.type);
            paths.push(createPath(picked));
        }

        for (let i = paths.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [paths[i], paths[j]] = [paths[j], paths[i]];
        }
        return paths;
    }

    function createPath(pathType) {
        const path = { ...pathType };
        if (path.type === 'battle' || path.type === 'elite') {
            const idx = Math.min(Math.floor((state.floor) / 3), ENEMIES.length - 1);
            const template = ENEMIES[Math.floor(Math.random() * (idx + 1))];
            path.enemyPreview = template.name;
        }
        return path;
    }

    function handlePathChoice(path) {
        modalPath.classList.remove('visible');
        state.floor++;
        applyBiome();

        switch (path.type) {
            case 'battle':
            case 'elite':
                startCombatEncounter(path.type === 'elite');
                break;
            case 'rest':
                handleRestEvent();
                break;
            case 'shrine':
                showGuardianSelection(true);
                break;
            case 'treasure':
                handleTreasureEvent();
                break;
        }
    }

    function startCombatEncounter(isElite) {
        state.moves = getMovesPerTurn();
        state.turn = 1;
        state.combo = 0;
        spawnEnemy(isElite);
        generateGrid(true);
        renderBoard(true);
        updateUI();
    }

    // ========== EVENT HANDLERS ==========
    function handleRestEvent() {
        const heal = Math.floor(state.player.maxHp * 0.3);
        healPlayer(heal);
        state.player.bleed = 0;
        state.player.burn = 0;
        state.player.cursed = false;
        showEventModal(
            '\u{1F3D5}\u{FE0F} Rest Site',
            'You find a peaceful clearing. The natural essences here soothe your wounds.',
            `<div class="text-emerald-400 font-bold text-lg">+${heal} HP</div><div class="text-xs text-slate-400 mt-1">All debuffs cleansed</div>`,
            () => advanceToNextEncounter()
        );
        updateUI();
    }

    function handleTreasureEvent() {
        let gold = 20 + Math.floor(Math.random() * 30) + state.floor * 2;
        if (state.player.goldFindBonus > 0) gold = Math.floor(gold * (1 + state.player.goldFindBonus));
        gainGold(gold);
        let extra = '';
        if (Math.random() < 0.4) {
            state.player.potions++;
            extra = '<div class="text-emerald-400 font-bold mt-1">\u{1F9EA} +1 Potion found!</div>';
        }
        if (state.guardian && Math.random() < 0.3) {
            const bonus = 20;
            const g = GUARDIANS.find(gd => gd.id === state.guardian.id);
            if (g) {
                state.guardian.charge = Math.min(state.guardian.charge + bonus, g.maxCharge);
                extra += `<div class="text-violet-400 font-bold mt-1">\u{2728} +${bonus} guardian charge</div>`;
                updateGuardianUI();
            }
        }
        showEventModal(
            '\u{1F4B0} Treasure Cache',
            'Hidden among the roots of an ancient tree, you discover a cache of riches!',
            `<div class="text-amber-400 font-bold text-lg">+${gold} Gold</div>${extra}`,
            () => advanceToNextEncounter()
        );
        updateUI();
    }

    function showEventModal(title, text, detailsHtml, onClose) {
        document.getElementById('event-title').textContent = title;
        document.getElementById('event-text').textContent = text;
        document.getElementById('event-details').innerHTML = detailsHtml;
        const btn = document.getElementById('event-button');
        btn.onclick = () => {
            modalEvent.classList.remove('visible');
            if (onClose) onClose();
        };
        modalEvent.classList.add('visible');
    }

    function advanceToNextEncounter() {
        healPlayer(Math.floor(state.player.maxHp * 0.05));

        if ((state.floor + 1) % BOSS_EVERY === 0) {
            state.floor++;
            applyBiome();
            startCombatEncounter(false);
        } else {
            showPathSelection();
        }
    }

    // ========== VICTORY / DEFEAT ==========
    function enemyDefeated() {
        state.stats.enemiesDefeated++;
        if (state.enemy.isBoss) { state.stats.bossesDefeated++; if (state.enemy.name === "Dragon King") meta.dragonKingDefeated = true; }
        const baseGold = state.enemy.isBoss ? 30 : (state.enemy.isElite ? 20 : 10);
        let goldReward = baseGold + (state.floor * 3) + Math.floor(Math.random() * 10);
        if (state.player.goldFindBonus > 0) goldReward = Math.floor(goldReward * (1 + state.player.goldFindBonus));
        const xpReward = state.enemy.isBoss ? 30 : (state.enemy.isElite ? 20 : 15);
        gainGold(goldReward); gainXp(xpReward);
        let potionDrop = 0;
        if (Math.random() < (state.enemy.isBoss ? 0.8 : (state.enemy.isElite ? 0.5 : 0.2))) { potionDrop = 1; state.player.potions++; }

        elModalTitle.textContent = state.enemy.isBoss ? "\u{1F3C6} Boss Defeated!" : (state.enemy.isElite ? "\u{1F4A0} Elite Defeated!" : "Victory!");
        elModalText.textContent = `You defeated the ${state.enemy.name}!`;
        elModalLoot.innerHTML = `<div class="loot-display"><span class="gold-reward">\u{1F4B0} +${goldReward} Gold</span><span class="xp-reward">\u{2728} +${xpReward} XP</span>${potionDrop ? '<span class="potion-reward">\u{1F9EA} +1 Potion</span>' : ''}</div>`;
        state.processing = false;
        modalVictory.classList.add('visible');
        playSound('gold');
    }

    function onVictoryContinue() {
        modalVictory.classList.remove('visible');
        advanceToNextEncounter();
    }

    function endRun() {
        meta.totalRuns++; meta.totalEnemiesKilled += state.stats.enemiesDefeated;
        meta.totalBossesKilled += state.stats.bossesDefeated; meta.totalGoldEarned += state.stats.goldEarned;
        if (state.floor > meta.bestFloor) meta.bestFloor = state.floor;
        saveMeta();
        const newAch = checkNewAchievements();

        let html = `<div class="stats-grid">
            <div>\u{1F4CD} Floor reached: <strong>${state.floor}</strong></div>
            <div>\u{2620}\u{FE0F} Enemies defeated: <strong>${state.stats.enemiesDefeated}</strong></div>
            <div>\u{1F451} Bosses defeated: <strong>${state.stats.bossesDefeated}</strong></div>
            <div>\u{2694}\u{FE0F} Damage dealt: <strong>${state.stats.damageDealt}</strong></div>
            <div>\u{1F4B0} Gold earned: <strong>${state.stats.goldEarned}</strong></div>
            <div>\u{1F4A5} Critical hits: <strong>${state.stats.criticalHits}</strong></div>
            <div>\u{1F517} Longest chain: <strong>${state.stats.longestChain}</strong></div>
            ${state.stats.cascades > 0 ? `<div>\u{1F300} Cascades: <strong>${state.stats.cascades}</strong></div>` : ''}
            ${state.stats.loopsFormed > 0 ? `<div>\u{2B55} Loops formed: <strong>${state.stats.loopsFormed}</strong></div>` : ''}
            <div>\u{1F3DB}\u{FE0F} Guardian: <strong>${state.guardian ? GUARDIANS.find(g => g.id === state.guardian.id)?.name : 'None'}</strong></div>
        </div>
        <div class="legacy-section"><h3 class="text-sm font-bold text-amber-400 mt-3 mb-1">Legacy</h3>
            <div class="text-xs text-slate-400">Runs: ${meta.totalRuns} | Best: Floor ${meta.bestFloor} | Kills: ${meta.totalEnemiesKilled}</div>
        </div>`;

        if (newAch.length > 0) {
            html += `<div class="achievement-section mt-3"><h3 class="text-sm font-bold text-emerald-400 mb-1">\u{1F3C6} New Achievements!</h3>`;
            newAch.forEach(a => { html += `<div class="achievement-item"><div class="text-sm font-bold text-white">${a.name}</div><div class="text-xs text-slate-400">${a.desc}</div><div class="text-xs text-emerald-400 font-bold">Perk: ${a.perk}</div></div>`; });
            html += `</div>`; playSound('achievement');
        }
        html += `<div class="text-xs text-center text-slate-500 mt-2">Perks: ${meta.achievements.length}/${ACHIEVEMENTS.length} unlocked</div>`;
        elGameoverStats.innerHTML = html;
        modalGameover.classList.add('visible');
    }

    function restartGame() {
        modalGameover.classList.remove('visible');
        state.floor = 1;
        state.guardian = null;
        state.player = {
            hp: 25, maxHp: 25, shield: 0, xp: 0, maxXp: 15, level: 1,
            dmgBonus: 0, gold: 0, potions: 1, critChance: 0.1,
            bleed: 0, burn: 0, cursed: false,
            upgrades: [],
            thorns: 0, lifestealPct: 0, goldFindBonus: 0,
            dmgReduction: 0, chainBonusPct: 0, regenPerTurn: 0, shieldBonus: 0,
            guardianChargeBonus: 0, guardianDmgBonus: 0,
            tempThorns: 0, tempThornsTurns: 0,
        };
        state.combo = 0; state.processing = false; state.isLoop = false;
        state.stats = { enemiesDefeated: 0, bossesDefeated: 0, damageDealt: 0, damageReceived: 0, goldEarned: 0, criticalHits: 0, longestChain: 0, potionsUsed: 0, cascades: 0, loopsFormed: 0 };
        meta = loadMeta();
        applyMetaPerks(state.player);
        state.moves = getMovesPerTurn();
        generateGrid(true); renderBoard(true); updateUI(); showActivePerks();
        applyBiome();
        showGuardianSelection(false);
    }

    // ========== LEVEL UP ==========
    function levelUp() {
        state.player.xp -= state.player.maxXp;
        state.player.maxXp = Math.floor(state.player.maxXp * 1.4);
        state.player.level++;
        state.player.hp = state.player.maxHp;
        generateUpgradeChoices();
        modalUpgrade.classList.add('visible');
        playSound('powerup');
    }

    function generateUpgradeChoices() {
        const available = UPGRADE_POOL.filter(u => !(u.unique && state.player.upgrades.includes(u.id)));
        const shuffled = [...available];
        for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
        const choices = shuffled.slice(0, 3);

        const colorMap = {
            emerald: ['rgba(6,78,59,0.5)', 'rgba(16,185,129,0.5)', '#10b981', 'rgba(6,78,59,0.8)'],
            rose: ['rgba(136,19,55,0.5)', 'rgba(244,63,94,0.5)', '#f43f5e', 'rgba(136,19,55,0.8)'],
            violet: ['rgba(76,29,149,0.5)', 'rgba(139,92,246,0.5)', '#8b5cf6', 'rgba(76,29,149,0.8)'],
            lime: ['rgba(54,83,20,0.5)', 'rgba(132,204,22,0.5)', '#84cc16', 'rgba(54,83,20,0.8)'],
            red: ['rgba(127,29,29,0.5)', 'rgba(239,68,68,0.5)', '#ef4444', 'rgba(127,29,29,0.8)'],
            amber: ['rgba(120,53,15,0.5)', 'rgba(245,158,11,0.5)', '#f59e0b', 'rgba(120,53,15,0.8)'],
            yellow: ['rgba(113,63,18,0.5)', 'rgba(234,179,8,0.5)', '#eab308', 'rgba(113,63,18,0.8)'],
            cyan: ['rgba(22,78,99,0.5)', 'rgba(6,182,212,0.5)', '#06b6d4', 'rgba(22,78,99,0.8)'],
            stone: ['rgba(68,64,60,0.5)', 'rgba(168,162,158,0.5)', '#a8a29e', 'rgba(68,64,60,0.8)'],
            indigo: ['rgba(49,46,129,0.5)', 'rgba(99,102,241,0.5)', '#6366f1', 'rgba(49,46,129,0.8)'],
            green: ['rgba(20,83,45,0.5)', 'rgba(34,197,94,0.5)', '#22c55e', 'rgba(20,83,45,0.8)'],
            orange: ['rgba(124,45,18,0.5)', 'rgba(249,115,22,0.5)', '#f97316', 'rgba(124,45,18,0.8)'],
        };

        elUpgradeChoices.innerHTML = '';
        choices.forEach(u => {
            const c = colorMap[u.colorBg] || colorMap.emerald;
            const taken = state.player.upgrades.filter(id => id === u.id).length;
            const stack = taken > 0 && !u.unique ? ` (x${taken + 1})` : '';
            const btn = document.createElement('button');
            btn.className = 'upgrade-choice w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg flex flex-col items-center';
            btn.style.cssText = `background:${c[0]};border:1px solid ${c[1]};`;
            btn.innerHTML = `<strong class="font-fantasy" style="color:${c[2]}">${u.icon} ${u.name}${stack}</strong><span class="text-xs text-gray-300">${u.desc}</span>`;
            btn.onmouseenter = () => btn.style.background = c[3];
            btn.onmouseleave = () => btn.style.background = c[0];
            btn.onclick = () => applyUpgrade(u.id);
            elUpgradeChoices.appendChild(btn);
        });
    }

    function applyUpgrade(type) {
        state.player.upgrades.push(type);
        switch (type) {
            case 'hp': state.player.maxHp += 8; state.player.hp = state.player.maxHp; break;
            case 'attack': state.player.dmgBonus += 1; state.player.critChance += 0.05; break;
            case 'guardiancharge': state.player.guardianChargeBonus += 0.25; break;
            case 'thorns': state.player.thorns += 2; break;
            case 'lifesteal': state.player.lifestealPct += 0.15; break;
            case 'extramove': state.moves = getMovesPerTurn(); break;
            case 'goldfind': state.player.goldFindBonus += 0.5; break;
            case 'guardiandmg': state.player.guardianDmgBonus += 0.5; break;
            case 'ironskin': state.player.dmgReduction += 0.2; break;
            case 'chainbonus': state.player.chainBonusPct += 0.5; break;
            case 'regen': state.player.regenPerTurn += 3; break;
            case 'shieldmaster': state.player.shieldBonus += 0.5; break;
        }
        modalUpgrade.classList.remove('visible');
        updateUI();
    }

    // ========== UI UPDATES ==========
    function updateUI() {
        elPlayerHpBar.style.width = `${(state.player.hp / state.player.maxHp) * 100}%`;
        elPlayerHpText.textContent = `${state.player.hp} / ${state.player.maxHp}`;
        elPlayerShield.textContent = state.player.shield > 0 ? `\u{1F6E1}\u{FE0F} ${state.player.shield}` : '';
        elPlayerLevel.textContent = `Lvl ${state.player.level}`;
        if (elPlayerXpText) elPlayerXpText.textContent = `XP: ${state.player.xp}/${state.player.maxXp}`;
        if (elPlayerGold) elPlayerGold.textContent = `\u{1F4B0} ${state.player.gold}`;
        if (elPlayerPotions) elPlayerPotions.textContent = `\u{1F9EA} ${state.player.potions}`;
        if (btnShuffle) { btnShuffle.disabled = state.player.gold < 5; btnShuffle.classList.toggle('opacity-50', state.player.gold < 5); }
        if (btnPotion) { const show = state.player.potions > 0; btnPotion.classList.toggle('hidden', !show); btnPotion.disabled = !show; }
        if (elFloorDisplay) {
            const isBoss = state.floor % BOSS_EVERY === 0;
            elFloorDisplay.innerHTML = isBoss ? `<span class="text-amber-400">\u{2694}\u{FE0F} BOSS - Encounter ${state.floor}</span>` : `Encounter ${state.floor}`;
        }
        updateEnemyUI();
        if (state.moves > 0 && !state.processing) elTurnStatus.textContent = `Your Turn: ${state.moves}`;
    }

    function updateEnemyUI() {
        if (!state.enemy) return;
        elEnemyName.textContent = state.enemy.name + (state.enemy.isElite ? ' \u{1F48E}' : '');
        let lvl = state.enemy.isBoss ? 'BOSS' : `Lvl ${state.enemy.level}`;
        if (state.enemy.enraged) lvl += ' \u{1F525}';
        if (state.enemy.isElite) lvl = 'ELITE ' + lvl;
        elEnemyLevel.textContent = lvl;
        elEnemyHpBar.style.width = `${Math.max(0, (state.enemy.hp / state.enemy.maxHp) * 100)}%`;
        elEnemyHpText.textContent = `${Math.max(0, state.enemy.hp)}/${state.enemy.maxHp}`;
        let intent = `<span class="text-rose-400">\u{2694}\u{FE0F} ${state.enemy.damage} DMG</span>`;
        if (state.enemy.abilityDesc) intent += ` <span class="text-violet-400 text-xs">(${state.enemy.abilityDesc})</span>`;
        if (state.enemy.enraged) intent += ` <span class="text-red-500 text-xs font-bold">ENRAGED</span>`;
        if (state.enemy.stunned) intent += ` <span class="text-sky-400 text-xs font-bold">STUNNED</span>`;
        if (state.enemy.weakened) intent += ` <span class="text-violet-400 text-xs font-bold">WEAK</span>`;
        if (state.enemy.poisonDotTurns > 0) intent += ` <span class="text-emerald-400 text-xs">\u{1F9EA}${state.enemy.poisonDotTurns}t</span>`;
        if (state.enemy.burnDotTurns > 0) intent += ` <span class="text-orange-400 text-xs">\u{1F525}${state.enemy.burnDotTurns}t</span>`;
        elEnemyStatus.innerHTML = intent;
    }

    init();
});
