export const GRID_SIZE = 6;
export const SURGE_MAX = 18;
export const SCOUT_COST = 12;
export const MAX_WILDFALLS = 4;
export const WILDFALL_TRIGGER_SIZE = 5;
export const LOG_LIMIT = 7;

export const PLAYER_PORTRAIT = `
<svg viewBox="0 0 100 100" fill="none">
    <defs>
        <linearGradient id="wolfGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#6ee7b7" />
            <stop offset="100%" stop-color="#14b8a6" />
        </linearGradient>
    </defs>
    <path fill="url(#wolfGlow)" d="M50 10 29 22l-9 26 10 28 20 14 20-14 10-28-9-26Z"/>
    <path fill="#082f49" d="M38 46 50 34l12 12-4 18H42Z"/>
    <path fill="#d1fae5" d="M34 33 23 16l17 10Zm32 0 11-17-17 10ZM39 60c4 5 18 5 22 0-4 11-18 14-22 0Z"/>
    <circle cx="40" cy="49" r="4" fill="#ecfeff"/>
    <circle cx="60" cy="49" r="4" fill="#ecfeff"/>
</svg>`;

const sigil = (paths) => `<svg viewBox="0 0 64 64" fill="none">${paths}</svg>`;

export const RUNES = [
    {
        id: 'claw',
        name: 'Claw',
        color: '#fb7185',
        label: 'Deal heavy damage.',
        icon: sigil(`
            <path d="M18 48c8-19 15-29 20-32 2 10 1 22-5 35" fill="#fb7185"/>
            <path d="M34 50c8-17 15-25 20-28 2 9 1 20-5 31" fill="#fda4af"/>
            <path d="M16 52c12-3 22-5 34-5" stroke="#ffe4e6" stroke-width="4" stroke-linecap="round"/>
        `),
    },
    {
        id: 'bloom',
        name: 'Bloom',
        color: '#34d399',
        label: 'Heal and cleanse on long chains.',
        icon: sigil(`
            <path d="M32 54c-4-7-5-17-2-26 5 2 9 8 10 14 2-7 7-12 13-14 2 10 1 19-5 26" fill="#34d399"/>
            <path d="M32 12c7 5 11 12 11 20-7 0-13-3-19-9 0-6 3-11 8-11Z" fill="#6ee7b7"/>
            <path d="M32 24v30" stroke="#d1fae5" stroke-width="4" stroke-linecap="round"/>
        `),
    },
    {
        id: 'tide',
        name: 'Tide',
        color: '#38bdf8',
        label: 'Charge Bestial Surge.',
        icon: sigil(`
            <path d="M15 36c7-10 13-16 17-18 0 11 4 20 17 28-11 2-17 1-34-10Z" fill="#38bdf8"/>
            <path d="M26 22c9 5 15 12 18 22" stroke="#e0f2fe" stroke-width="4" stroke-linecap="round"/>
            <circle cx="45" cy="19" r="6" fill="#bae6fd"/>
        `),
    },
    {
        id: 'guard',
        name: 'Guard',
        color: '#fbbf24',
        label: 'Gain sturdy guard.',
        icon: sigil(`
            <path d="M32 10 15 18v13c0 13 7 22 17 28 10-6 17-15 17-28V18Z" fill="#fbbf24"/>
            <path d="M32 16v37" stroke="#fef3c7" stroke-width="4" stroke-linecap="round"/>
            <path d="M22 25h20" stroke="#fef3c7" stroke-width="4" stroke-linecap="round"/>
        `),
    },
    {
        id: 'venom',
        name: 'Venom',
        color: '#a78bfa',
        label: 'Deal damage and apply poison.',
        icon: sigil(`
            <path d="M32 10c12 0 19 7 19 18 0 12-11 18-19 26-8-8-19-14-19-26 0-11 7-18 19-18Z" fill="#a78bfa"/>
            <path d="M28 44h8l-3 10h-3Z" fill="#ede9fe"/>
            <circle cx="24" cy="29" r="4" fill="#ede9fe"/>
            <circle cx="40" cy="29" r="4" fill="#ede9fe"/>
        `),
    },
    {
        id: 'wild',
        name: 'Wild',
        color: '#e2e8f0',
        label: 'Counts as any sigil and grants bonus gold.',
        icon: sigil(`
            <path d="m32 10 6 15 16 1-13 10 4 17-13-8-13 8 4-17-13-10 16-1Z" fill="#e2e8f0"/>
            <circle cx="32" cy="32" r="7" fill="#f8fafc"/>
        `),
    },
];

export const RUNE_LOOKUP = Object.fromEntries(RUNES.map((rune) => [rune.id, rune]));

const portrait = (fillA, fillB, details) => `
<svg viewBox="0 0 100 100" fill="none">
    <defs>
        <linearGradient id="p" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${fillA}" />
            <stop offset="100%" stop-color="${fillB}" />
        </linearGradient>
    </defs>
    ${details}
</svg>`;

const enemiesThorn = [
    {
        id: 'briar-boar',
        name: 'Briar Boar',
        role: 'Bruiser',
        flavor: 'A charging knot of bark, tusk, and spite.',
        portrait: portrait('#86efac', '#15803d', `
            <path fill="url(#p)" d="M18 66 28 38l22-12 24 12 8 28-18 10H36Z"/>
            <path fill="#fef3c7" d="M28 58 16 76l17-9ZM72 58l12 18-17-9Z"/>
            <circle cx="40" cy="50" r="5" fill="#ecfccb"/>
            <circle cx="60" cy="50" r="5" fill="#ecfccb"/>
        `),
        hp: 48,
        gold: 18,
        intents: [
            { type: 'strike', label: 'Antler Charge', damage: 8 },
            { type: 'guard', label: 'Barkhide', damage: 5, guard: 10 },
            { type: 'strike', label: 'Root-Stomp', damage: 11 },
        ],
    },
    {
        id: 'mire-lynx',
        name: 'Mire Lynx',
        role: 'Skirmisher',
        flavor: 'Fast paws. Quicker venom.',
        portrait: portrait('#67e8f9', '#2563eb', `
            <path fill="url(#p)" d="M22 72 32 42l18-16 16 10 10 26-18 12H34Z"/>
            <path fill="#dbeafe" d="M38 34 28 16l18 11ZM64 36l10-20-18 11Z"/>
            <circle cx="42" cy="48" r="4" fill="#f8fafc"/>
            <circle cx="58" cy="48" r="4" fill="#f8fafc"/>
        `),
        hp: 42,
        gold: 20,
        intents: [
            { type: 'poison', label: 'Spore Swipe', damage: 5, poison: 3 },
            { type: 'strike', label: 'Pounce', damage: 10 },
            { type: 'sap', label: 'Moon Drain', damage: 5, surgeLoss: 5 },
        ],
    },
    {
        id: 'moss-shaman',
        name: 'Moss Shaman',
        role: 'Caster',
        flavor: 'Its chants turn the canopy against you.',
        portrait: portrait('#d8b4fe', '#7c3aed', `
            <path fill="url(#p)" d="M30 22c-10 9-13 18-13 29l9 25h48l9-25c0-11-3-20-13-29H30Z"/>
            <path fill="#fae8ff" d="M43 18h14l7 10H36ZM38 56c4 7 20 7 24 0-2 11-22 14-24 0Z"/>
            <circle cx="42" cy="44" r="4" fill="#fdf4ff"/>
            <circle cx="58" cy="44" r="4" fill="#fdf4ff"/>
        `),
        hp: 44,
        gold: 19,
        intents: [
            { type: 'weaken', label: 'Withering Hex', damage: 4, weak: 2 },
            { type: 'heal', label: 'Sap Ritual', heal: 12, guard: 6 },
            { type: 'strike', label: 'Thorn Spear', damage: 9 },
        ],
    },
];

const enemiesMoon = [
    {
        id: 'fen-widow',
        name: 'Fen Widow',
        role: 'Hunter',
        flavor: 'She waits in the moon-slick reeds.',
        portrait: portrait('#c084fc', '#4338ca', `
            <path fill="url(#p)" d="M50 16 30 30 18 54l14 20h36l14-20-12-24Z"/>
            <path stroke="#ede9fe" stroke-width="5" stroke-linecap="round" d="M32 40 18 32m18 20-18 8m50-20 14-8m-14 20 18 8"/>
            <circle cx="42" cy="46" r="4" fill="#faf5ff"/>
            <circle cx="58" cy="46" r="4" fill="#faf5ff"/>
        `),
        hp: 58,
        gold: 24,
        intents: [
            { type: 'poison', label: 'Silk Venom', damage: 6, poison: 4 },
            { type: 'guard', label: 'Moon Web', damage: 4, guard: 12 },
            { type: 'strike', label: 'Widow Bite', damage: 12 },
        ],
    },
    {
        id: 'mist-bear',
        name: 'Mist Bear',
        role: 'Bulwark',
        flavor: 'It wanders like a storm with teeth.',
        portrait: portrait('#93c5fd', '#1d4ed8', `
            <path fill="url(#p)" d="M22 72V44l14-16h28l14 16v28H22Z"/>
            <path fill="#dbeafe" d="M34 30 24 18l14 4ZM66 30l10-12-14 4Z"/>
            <circle cx="40" cy="50" r="5" fill="#eff6ff"/>
            <circle cx="60" cy="50" r="5" fill="#eff6ff"/>
        `),
        hp: 64,
        gold: 22,
        intents: [
            { type: 'guard', label: 'Mist Hide', damage: 5, guard: 16 },
            { type: 'strike', label: 'Crushing Paw', damage: 13 },
            { type: 'weaken', label: 'Fog Roar', damage: 6, weak: 1 },
        ],
    },
    {
        id: 'moon-eel',
        name: 'Moon Eel',
        role: 'Leech',
        flavor: 'It feeds on fear and stolen magic.',
        portrait: portrait('#67e8f9', '#0f766e', `
            <path fill="url(#p)" d="M16 56c13-27 35-33 58-28-7 7-8 14-2 22 2 15-14 28-32 28-11 0-18-7-24-22Z"/>
            <circle cx="57" cy="38" r="5" fill="#ecfeff"/>
            <path stroke="#ecfeff" stroke-width="4" stroke-linecap="round" d="M34 58c7 8 16 9 27 3"/>
        `),
        hp: 54,
        gold: 25,
        intents: [
            { type: 'sap', label: 'Current Leech', damage: 6, surgeLoss: 7 },
            { type: 'strike', label: 'Rip Tide', damage: 11 },
            { type: 'heal', label: 'Absorb Mist', heal: 10 },
        ],
    },
];

const enemiesEmber = [
    {
        id: 'ash-drake',
        name: 'Ash Drake',
        role: 'Raider',
        flavor: 'Its scales glow from the inside.',
        portrait: portrait('#fb7185', '#ea580c', `
            <path fill="url(#p)" d="M20 70 34 40l18-16 24 18-12 28H20Z"/>
            <path fill="#fed7aa" d="M46 32 36 14l14 10Zm16 2 12-16-7 18Z"/>
            <circle cx="44" cy="50" r="4" fill="#fff7ed"/>
            <circle cx="60" cy="50" r="4" fill="#fff7ed"/>
        `),
        hp: 70,
        gold: 28,
        intents: [
            { type: 'strike', label: 'Cinder Snap', damage: 14 },
            { type: 'poison', label: 'Smolder Breath', damage: 7, poison: 4 },
            { type: 'guard', label: 'Ash Veil', damage: 6, guard: 14 },
        ],
    },
    {
        id: 'obsidian-guard',
        name: 'Obsidian Guard',
        role: 'Sentinel',
        flavor: 'A fortress of broken volcanic glass.',
        portrait: portrait('#fca5a5', '#7f1d1d', `
            <path fill="url(#p)" d="M30 18 18 44l14 34h36l14-34-12-26Z"/>
            <path stroke="#fee2e2" stroke-width="4" d="M50 16v50M33 36h34"/>
            <circle cx="40" cy="48" r="4" fill="#fef2f2"/>
            <circle cx="60" cy="48" r="4" fill="#fef2f2"/>
        `),
        hp: 76,
        gold: 26,
        intents: [
            { type: 'guard', label: 'Raise Bastion', damage: 7, guard: 18 },
            { type: 'strike', label: 'Glass Cleave', damage: 15 },
            { type: 'weaken', label: 'Fracture Bell', damage: 8, weak: 2 },
        ],
    },
    {
        id: 'hex-crow',
        name: 'Hex Crow',
        role: 'Hexer',
        flavor: 'Every feather carries a curse.',
        portrait: portrait('#ddd6fe', '#7c3aed', `
            <path fill="url(#p)" d="M18 58 36 28l20-8 20 18-8 28H34Z"/>
            <path fill="#f5f3ff" d="M34 28 22 16l16 6Zm30 1 16-9-9 16Z"/>
            <circle cx="43" cy="45" r="4" fill="#faf5ff"/>
            <circle cx="59" cy="45" r="4" fill="#faf5ff"/>
        `),
        hp: 66,
        gold: 29,
        intents: [
            { type: 'sap', label: 'Spell Peck', damage: 7, surgeLoss: 6 },
            { type: 'weaken', label: 'Ash Curse', damage: 7, weak: 2 },
            { type: 'strike', label: 'Diving Slash', damage: 14 },
        ],
    },
];

export const ACTS = [
    {
        id: 'thorn',
        shortName: 'Act I',
        name: 'Thornwild Verge',
        subtitle: 'Dense roots, hungry beasts, and moonlit traps.',
        threat: 'low',
        boardWeights: { claw: 0.2, bloom: 0.19, tide: 0.15, guard: 0.17, venom: 0.14, wild: 0.15 },
        enemies: enemiesThorn,
        elite: {
            id: 'thorn-matriarch',
            name: 'Thorn Matriarch',
            role: 'Elite',
            flavor: 'She commands the roots like a war drum.',
            portrait: portrait('#bbf7d0', '#15803d', `
                <path fill="url(#p)" d="M50 12 28 24 16 50l12 26h44l12-26-12-26Z"/>
                <path fill="#ecfccb" d="M28 28 16 16l18 10Zm44 0 12-12-18 10Z"/>
                <circle cx="42" cy="46" r="5" fill="#f7fee7"/>
                <circle cx="58" cy="46" r="5" fill="#f7fee7"/>
                <path stroke="#f7fee7" stroke-width="4" stroke-linecap="round" d="M34 62c7 6 25 6 32 0"/>
            `),
            hp: 88,
            gold: 44,
            elite: true,
            intents: [
                { type: 'guard', label: 'Rootwall', damage: 8, guard: 18 },
                { type: 'poison', label: 'Needle Rain', damage: 7, poison: 4 },
                { type: 'strike', label: 'Matriarch Slam', damage: 16 },
            ],
        },
        boss: {
            id: 'elder-stag',
            name: 'Elder Stag',
            role: 'Boss',
            flavor: 'The first sovereign of the wild path.',
            portrait: portrait('#6ee7b7', '#166534', `
                <path fill="url(#p)" d="M24 78V42l18-16h16l18 16v36H24Z"/>
                <path fill="#fef3c7" d="M34 36 22 10l18 16Zm32 0L78 10 60 26Z"/>
                <circle cx="42" cy="48" r="5" fill="#f7fee7"/>
                <circle cx="58" cy="48" r="5" fill="#f7fee7"/>
            `),
            hp: 142,
            gold: 70,
            boss: true,
            intents: [
                { type: 'guard', label: 'Verdant Mantle', damage: 7, guard: 22 },
                { type: 'strike', label: 'Crown Charge', damage: 18 },
                { type: 'weaken', label: 'Howl of Briars', damage: 9, weak: 2 },
            ],
        },
    },
    {
        id: 'moon',
        shortName: 'Act II',
        name: 'Moonfen Hollow',
        subtitle: 'Cold water, long shadows, and stealing magic.',
        threat: 'rising',
        boardWeights: { claw: 0.18, bloom: 0.16, tide: 0.2, guard: 0.14, venom: 0.18, wild: 0.14 },
        enemies: enemiesMoon,
        elite: {
            id: 'marsh-oracle',
            name: 'Marsh Oracle',
            role: 'Elite',
            flavor: 'It sees your next mistake before you do.',
            portrait: portrait('#bfdbfe', '#312e81', `
                <path fill="url(#p)" d="M50 14 24 32l-8 26 16 18h36l16-18-8-26Z"/>
                <circle cx="50" cy="42" r="12" fill="#eff6ff"/>
                <circle cx="50" cy="42" r="5" fill="#4f46e5"/>
                <path stroke="#dbeafe" stroke-width="4" stroke-linecap="round" d="M30 66c9 5 31 5 40 0"/>
            `),
            hp: 102,
            gold: 48,
            elite: true,
            intents: [
                { type: 'sap', label: 'Future Theft', damage: 7, surgeLoss: 8 },
                { type: 'guard', label: 'Mirror Marsh', damage: 6, guard: 20 },
                { type: 'weaken', label: 'Foretold Misstep', damage: 8, weak: 2 },
            ],
        },
        boss: {
            id: 'tide-hydra',
            name: 'Tide Hydra',
            role: 'Boss',
            flavor: 'Three hungry heads, one endless flood.',
            portrait: portrait('#67e8f9', '#1d4ed8', `
                <path fill="url(#p)" d="M50 82 42 60l-12-8-6-24 14 16 12-16 12 16 14-16-6 24-12 8Z"/>
                <circle cx="30" cy="26" r="10" fill="#93c5fd"/>
                <circle cx="50" cy="18" r="12" fill="#bfdbfe"/>
                <circle cx="70" cy="26" r="10" fill="#93c5fd"/>
                <circle cx="27" cy="24" r="3" fill="#eff6ff"/>
                <circle cx="50" cy="16" r="4" fill="#eff6ff"/>
                <circle cx="73" cy="24" r="3" fill="#eff6ff"/>
            `),
            hp: 168,
            gold: 78,
            boss: true,
            intents: [
                { type: 'sap', label: 'Floodbite', damage: 9, surgeLoss: 8 },
                { type: 'poison', label: 'Drowned Venom', damage: 10, poison: 5 },
                { type: 'strike', label: 'Triple Snap', damage: 20, hits: 2 },
            ],
        },
    },
    {
        id: 'ember',
        shortName: 'Act III',
        name: 'Emberglass Rise',
        subtitle: 'A burning climb to the last wild heart.',
        threat: 'severe',
        boardWeights: { claw: 0.22, bloom: 0.13, tide: 0.15, guard: 0.16, venom: 0.19, wild: 0.15 },
        enemies: enemiesEmber,
        elite: {
            id: 'ember-champion',
            name: 'Ember Champion',
            role: 'Elite',
            flavor: 'A duelist forged in the mountain furnace.',
            portrait: portrait('#f97316', '#991b1b', `
                <path fill="url(#p)" d="M28 18 16 46l14 32h40l14-32-12-28Z"/>
                <path fill="#ffedd5" d="M50 16 42 30h16Z"/>
                <circle cx="42" cy="46" r="5" fill="#fff7ed"/>
                <circle cx="58" cy="46" r="5" fill="#fff7ed"/>
                <path stroke="#ffedd5" stroke-width="4" stroke-linecap="round" d="M34 64c7 4 25 4 32 0"/>
            `),
            hp: 118,
            gold: 54,
            elite: true,
            intents: [
                { type: 'strike', label: 'Champion Rush', damage: 17 },
                { type: 'guard', label: 'Smolder Guard', damage: 7, guard: 18 },
                { type: 'weaken', label: 'Crest Breaker', damage: 10, weak: 2 },
            ],
        },
        boss: {
            id: 'wildheart-avatar',
            name: 'Wildheart Avatar',
            role: 'Final Boss',
            flavor: 'The wild itself answers your challenge.',
            portrait: portrait('#fbbf24', '#be123c', `
                <path fill="url(#p)" d="M50 10 30 24 16 48l14 30h40l14-30-14-24Z"/>
                <path fill="#fef3c7" d="M38 28 30 10l15 12Zm24 0 8-18-15 12Z"/>
                <circle cx="42" cy="46" r="5" fill="#fff7ed"/>
                <circle cx="58" cy="46" r="5" fill="#fff7ed"/>
                <path stroke="#fee2e2" stroke-width="4" stroke-linecap="round" d="M33 64c8 6 26 6 34 0"/>
            `),
            hp: 196,
            gold: 120,
            boss: true,
            intents: [
                { type: 'guard', label: 'Primal Halo', damage: 8, guard: 24 },
                { type: 'poison', label: 'Heartflame', damage: 11, poison: 5 },
                { type: 'strike', label: 'World Rend', damage: 24 },
                { type: 'sap', label: 'Starving Eclipse', damage: 10, surgeLoss: 10 },
            ],
        },
    },
];

export const NODE_TYPES = {
    battle: { label: 'Skirmish', icon: '⚔️', description: 'Fight a standard enemy and choose a boon.' },
    elite: { label: 'Elite Hunt', icon: '👑', description: 'Harder enemy, better gold, rarer boons.' },
    boss: { label: 'Boss', icon: '🐺', description: 'Act-ending fight with huge rewards.' },
    camp: { label: 'Campfire', icon: '🔥', description: 'Recover or train before the next hunt.' },
    shop: { label: 'Trader', icon: '🛒', description: 'Spend gold on supplies or boons.' },
    shrine: { label: 'Shrine', icon: '✨', description: 'Receive a free blessing from the wilds.' },
    cache: { label: 'Cache', icon: '💎', description: 'Collect treasure and a little breathing room.' },
};

export const ACT_PATHS = [
    [{ type: 'battle' }, { choices: ['battle', 'cache'] }, { choices: ['battle', 'shrine'] }, { choices: ['camp', 'shop'] }, { choices: ['battle', 'elite'] }, { type: 'boss' }],
    [{ type: 'battle' }, { choices: ['battle', 'cache'] }, { choices: ['battle', 'shrine'] }, { choices: ['camp', 'shop'] }, { choices: ['battle', 'elite'] }, { type: 'boss' }],
    [{ type: 'battle' }, { choices: ['battle', 'cache'] }, { choices: ['battle', 'shrine'] }, { choices: ['camp', 'shop'] }, { choices: ['battle', 'elite'] }, { type: 'boss' }],
];

export const BOONS = [
    { id: 'feral_claws', name: 'Feral Claws', rarity: 'common', description: '+2 claw damage per matched Claw sigil.' },
    { id: 'verdant_heart', name: 'Verdant Heart', rarity: 'common', description: '+2 healing per Bloom sigil.' },
    { id: 'tidal_focus', name: 'Tidal Focus', rarity: 'common', description: '+2 surge charge per Tide sigil.' },
    { id: 'barkskin', name: 'Barkskin', rarity: 'common', description: '+2 guard per Guard sigil.' },
    { id: 'toxic_fangs', name: 'Toxic Fangs', rarity: 'common', description: '+1 direct damage and +1 poison from Venom sigils.' },
    { id: 'sun_pockets', name: 'Sun Pockets', rarity: 'common', description: 'Wild sigils grant +2 bonus gold and +2 healing.' },
    { id: 'trail_rations', name: 'Trail Rations', rarity: 'common', description: '+1 potion now and potions heal 10% more.' },
    { id: 'thornmail', name: 'Thornmail', rarity: 'common', description: 'Reflect 4 damage whenever you are hit.' },
    { id: 'deep_roots', name: 'Deep Roots', rarity: 'rare', description: '+14 max HP and heal for 14 immediately.' },
    { id: 'moon_hunter', name: 'Moon Hunter', rarity: 'rare', description: 'Long chains deal 25% more damage.' },
    { id: 'surge_engine', name: 'Surge Engine', rarity: 'rare', description: 'Start battles with 35% surge and +6 surge max damage.' },
    { id: 'pack_instinct', name: 'Pack Instinct', rarity: 'rare', description: 'First chain each battle gains 20% bonus power.' },
    { id: 'ashen_resolve', name: 'Ashen Resolve', rarity: 'rare', description: 'Start each battle with 16 guard and +1 scout discount use.' },
    { id: 'wild_echo', name: 'Wild Echo', rarity: 'rare', description: 'Wildfalls resolve at full power instead of reduced power.' },
    { id: 'merchant_map', name: 'Merchant Map', rarity: 'rare', description: 'Shops cost 20% less and caches hold more gold.' },
];

export const CAMP_OPTIONS = [
    { id: 'rest', name: 'Rest by the fire', description: 'Recover 35% max HP and clear 3 poison.' },
    { id: 'sharpen', name: 'Sharpen your claws', description: '+1 attack and +1 venom damage for the rest of the run.' },
    { id: 'fortify', name: 'Brace the pack', description: '+12 max HP and heal 12.' },
];

export const LEGEND_COPY = [
    { title: 'Claw', text: 'Primary damage sigil. Long chains become savage finishers.' },
    { title: 'Bloom', text: 'Keeps you alive and clears debuffs when chained deep.' },
    { title: 'Tide', text: 'Builds your Bestial Surge meter and fuels tempo swings.' },
    { title: 'Guard', text: 'Converts turns into sturdy protection before enemy hits land.' },
    { title: 'Venom', text: 'Mixes burst damage with poison for drawn-out fights.' },
    { title: 'Wild', text: 'Links to any sigil and throws extra gold into the run.' },
];

export const HELP_LINES = [
    'Drag across adjacent sigils to make a chain of 3 or more of one type. Wild sigils count as any type.',
    'Each battle is one chain per turn. After your chain resolves, the enemy performs its next intent.',
    'Each route node is a full encounter or event. Winning a battle clears that node, then the route moves on.',
    'Long chains gain bonus power, but the biggest bursts are softened so fights last more than one move.',
    'Refill bursts of 5 or more matching sigils trigger automatic Wildfalls.',
    'Clear acts by surviving six nodes, including an elite or detour if you want bigger rewards.',
    'Use the Route Map, Sigil Guide, and Battle Feed on the main screen whenever you lose track of what just happened.',
    'Campfires recover you, shrines grant free boons, caches hand out treasure, and shops convert gold into staying power.',
];

export const BOON_LOOKUP = Object.fromEntries(BOONS.map((boon) => [boon.id, boon]));
