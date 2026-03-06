import {
    ACT_PATHS,
    ACTS,
    BOONS,
    BOON_LOOKUP,
    CAMP_OPTIONS,
    GRID_SIZE,
    HELP_LINES,
    LEGEND_COPY,
    LOG_LIMIT,
    MAX_WILDFALLS,
    NODE_TYPES,
    PLAYER_PORTRAIT,
    RUNE_LOOKUP,
    RUNES,
    SCOUT_COST,
    SURGE_MAX,
} from './content.js';
import { AudioController } from './audio.js';
import { loadMeta, loadSettings, saveMeta, saveSettings } from './storage.js';

const ADJACENT_OFFSETS = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1],
];

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
    const copy = [...items];

    for (let index = copy.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }

    return copy;
}

function cloneEnemy(template) {
    return {
        ...template,
        guard: 0,
        poison: 0,
        weak: 0,
        strength: 0,
        currentIntentIndex: 0,
        maxHp: template.hp,
        hp: template.hp,
    };
}

function createPlayer() {
    return {
        hp: 72,
        maxHp: 72,
        guard: 0,
        surge: 0,
        potions: 2,
        gold: 25,
        attack: 4,
        healPower: 3,
        guardPower: 4,
        surgeGain: 3,
        venomDamage: 2,
        poisonPerVenom: 2,
        poison: 0,
        weak: 0,
        thorns: 0,
        potionBonus: 0,
        longChainDamageBonus: 0,
        startBattleGuard: 0,
        startBattleSurgePct: 0,
        firstChainBonus: 0,
        wildBonusGold: 0,
        wildBonusHeal: 0,
        scoutCostReduction: 0,
        shopDiscount: 0,
        cacheBonusGold: 0,
        surgeBonusDamage: 0,
        wildfallPower: 0.62,
        boons: [],
        boonIds: new Set(),
        battleFirstChainUsed: false,
    };
}

class WildDotCrawler {
    constructor() {
        this.meta = loadMeta();
        this.settings = loadSettings();
        this.audio = new AudioController({ muted: this.settings.muted });
        this.state = null;
        this.dom = this.getDom();

        this.renderLegend();
        this.bindEvents();
        this.startNewRun({ showOverlay: true });
    }

    getDom() {
        return {
            body: document.body,
            runSubtitle: document.getElementById('run-subtitle'),
            mapButton: document.getElementById('map-button'),
            packButton: document.getElementById('pack-button'),
            muteButton: document.getElementById('mute-button'),
            helpButton: document.getElementById('help-button'),
            newRunButton: document.getElementById('new-run-button'),
            metaBest: document.getElementById('meta-best'),
            metaWins: document.getElementById('meta-wins'),
            metaGold: document.getElementById('meta-gold'),
            metaRuns: document.getElementById('meta-runs'),
            playerPortrait: document.getElementById('player-portrait'),
            playerHpBar: document.getElementById('player-hp-bar'),
            playerHpText: document.getElementById('player-hp-text'),
            playerGuardBar: document.getElementById('player-guard-bar'),
            playerGuardText: document.getElementById('player-guard-text'),
            playerSurgeBar: document.getElementById('player-surge-bar'),
            playerSurgeText: document.getElementById('player-surge-text'),
            playerGold: document.getElementById('player-gold'),
            playerPotions: document.getElementById('player-potions'),
            playerStatuses: document.getElementById('player-statuses'),
            boonChipRow: document.getElementById('boon-chip-row'),
            playerBoonSummary: document.getElementById('player-boon-summary'),
            enemyPortrait: document.getElementById('enemy-portrait'),
            enemyName: document.getElementById('enemy-name'),
            enemyRole: document.getElementById('enemy-role'),
            enemyFlavor: document.getElementById('enemy-flavor'),
            enemyHpBar: document.getElementById('enemy-hp-bar'),
            enemyHpText: document.getElementById('enemy-hp-text'),
            enemyGuardBar: document.getElementById('enemy-guard-bar'),
            enemyGuardText: document.getElementById('enemy-guard-text'),
            enemyIntent: document.getElementById('enemy-intent'),
            enemyStatuses: document.getElementById('enemy-statuses'),
            actName: document.getElementById('act-name'),
            actTitle: document.getElementById('act-title'),
            nodeProgress: document.getElementById('node-progress'),
            threatLevel: document.getElementById('threat-level'),
            pathTrack: document.getElementById('path-track'),
            nextNodeBanner: document.getElementById('next-node-banner'),
            chainTitle: document.getElementById('chain-title'),
            chainPreview: document.getElementById('chain-preview'),
            board: document.getElementById('game-board'),
            connectorSvg: document.getElementById('connector-svg'),
            floatingTextLayer: document.getElementById('floating-text-layer'),
            surgeButton: document.getElementById('surge-button'),
            potionButton: document.getElementById('potion-button'),
            scoutButton: document.getElementById('scout-button'),
            objectiveTitle: document.getElementById('objective-title'),
            objectiveCopy: document.getElementById('objective-copy'),
            legendGrid: document.getElementById('legend-grid'),
            logList: document.getElementById('log-list'),
            turnCounter: document.getElementById('turn-counter'),
            lastLogLine: document.getElementById('last-log-line'),
            overlay: document.getElementById('overlay'),
        };
    }

    bindEvents() {
        this.dom.playerPortrait.innerHTML = PLAYER_PORTRAIT;
        this.dom.muteButton.textContent = this.settings.muted ? '🔈' : '🔊';

        window.addEventListener('pointerdown', () => this.audio.unlock(), { once: true });
        window.addEventListener('pointermove', (event) => this.onPointerMove(event));
        window.addEventListener('pointerup', () => this.onPointerUp());
        window.addEventListener('resize', () => this.drawConnector());

        this.dom.board.addEventListener('pointerdown', (event) => this.onPointerDown(event));
        this.dom.surgeButton.addEventListener('click', () => this.useSurge());
        this.dom.potionButton.addEventListener('click', () => this.drinkPotion());
        this.dom.scoutButton.addEventListener('click', () => this.scoutBoard());
        this.dom.mapButton.addEventListener('click', () => this.showMapOverlay());
        this.dom.packButton.addEventListener('click', () => this.showPackOverlay());
        this.dom.muteButton.addEventListener('click', () => this.toggleMute());
        this.dom.helpButton.addEventListener('click', () => this.showHelpOverlay());
        this.dom.newRunButton.addEventListener('click', () => this.confirmNewRun());
        this.dom.overlay.addEventListener('click', (event) => this.onOverlayClick(event));
    }

    startNewRun({ showOverlay = false } = {}) {
        this.state = {
            actIndex: 0,
            stageIndex: -1,
            journeyHistory: ACT_PATHS.map((path) => path.map(() => null)),
            board: [],
            selected: [],
            chainType: null,
            pointerActive: false,
            processing: false,
            currentNodeType: null,
            overlayContext: null,
            enemy: null,
            battleKind: null,
            turn: 1,
            logs: [
                'A fresh hunt begins. The board has been reforged around a tighter combat loop.',
            ],
            runStats: {
                nodesCleared: 0,
                enemiesDefeated: 0,
                elitesDefeated: 0,
                bossesDefeated: 0,
                damageDealt: 0,
                damageTaken: 0,
                goldCollected: 0,
                goldSpent: 0,
                wildfalls: 0,
                boonsCollected: 0,
            },
            player: createPlayer(),
        };

        this.generateBoard();
        this.renderAll();

        if (showOverlay) {
            this.showWelcomeOverlay();
        }
    }

    get currentAct() {
        return ACTS[this.state.actIndex];
    }

    renderLegend() {
        this.dom.legendGrid.innerHTML = LEGEND_COPY.map((entry) => `
            <article class="legend-card">
                <strong>${entry.title}</strong>
                <span>${entry.text}</span>
            </article>
        `).join('');
    }

    renderAll() {
        this.renderMeta();
        this.renderRunHeader();
        this.renderPathTrack();
        this.renderPlayer();
        this.renderEnemy();
        this.renderBoard();
        this.renderLog();
        this.renderObjectives();
        this.updateActionButtons();
    }

    renderMeta() {
        this.dom.metaBest.textContent = `Act ${this.meta.bestAct}`;
        this.dom.metaWins.textContent = `${this.meta.wins}`;
        this.dom.metaGold.textContent = `${this.meta.totalGold}`;
        this.dom.metaRuns.textContent = `${this.meta.totalRuns}`;
    }

    renderRunHeader() {
        const act = this.currentAct;
        this.dom.body.dataset.act = act.id;
        this.dom.runSubtitle.textContent = act.subtitle;
        this.dom.actName.textContent = act.shortName;
        this.dom.actTitle.textContent = act.name;
        this.dom.nodeProgress.textContent = `Node ${Math.max(0, this.state.stageIndex + 1)} / ${ACT_PATHS[this.state.actIndex].length}`;
        const threat = this.state.currentNodeType
            ? NODE_TYPES[this.state.currentNodeType]?.label ?? 'Wandering'
            : act.threat;
        this.dom.threatLevel.textContent = `Threat: ${threat.toLowerCase()}`;
    }

    renderPathTrack() {
        const path = ACT_PATHS[this.state.actIndex];
        const currentIndex = this.state.stageIndex;

        this.dom.pathTrack.innerHTML = path.map((stage, index) => {
            const chosenType = this.state.journeyHistory[this.state.actIndex][index];
            const displayType = chosenType ?? stage.type ?? 'choice';
            const nodeInfo = NODE_TYPES[displayType] ?? { icon: '❔', label: 'Route' };
            const statusClass = index < currentIndex
                ? 'completed'
                : index === currentIndex
                    ? 'current'
                    : 'pending';
            const choiceClass = stage.choices ? 'choice' : '';
            const label = chosenType ? nodeInfo.label : stage.choices ? 'Fork' : nodeInfo.label;

            return `
                <div class="path-node ${statusClass} ${choiceClass}">
                    <div class="path-icon">${chosenType ? nodeInfo.icon : stage.choices ? '🧭' : nodeInfo.icon}</div>
                    <strong>${label}</strong>
                    <span>${index < currentIndex ? 'Cleared' : index === currentIndex ? 'Current' : 'Ahead'}</span>
                </div>
            `;
        }).join('');

        if (this.state.stageIndex === -1) {
            this.dom.nextNodeBanner.textContent = 'Tap Begin Hunt to enter the first skirmish.';
            return;
        }

        const stage = path[this.state.stageIndex];
        if (stage?.choices && !this.state.journeyHistory[this.state.actIndex][this.state.stageIndex]) {
            this.dom.nextNodeBanner.textContent = 'A fork in the wilds opens. Choose your route.';
            return;
        }

        const currentType = this.state.journeyHistory[this.state.actIndex][this.state.stageIndex]
            ?? path[this.state.stageIndex]?.type
            ?? 'battle';
        this.dom.nextNodeBanner.textContent = NODE_TYPES[currentType].description;
    }

    renderPlayer() {
        const { player } = this.state;
        this.dom.playerHpBar.style.width = `${(player.hp / player.maxHp) * 100}%`;
        this.dom.playerHpText.textContent = `${Math.max(0, player.hp)} / ${player.maxHp}`;
        this.dom.playerGuardBar.style.width = `${Math.min(100, player.guard)}%`;
        this.dom.playerGuardText.textContent = `${player.guard}`;
        this.dom.playerSurgeBar.style.width = `${(player.surge / SURGE_MAX) * 100}%`;
        this.dom.playerSurgeText.textContent = `${player.surge} / ${SURGE_MAX}`;
        this.dom.playerGold.textContent = `${player.gold} gold`;
        this.dom.playerPotions.textContent = `${player.potions} potions`;

        const playerStatuses = [];
        if (player.poison > 0) {
            playerStatuses.push(this.makeChip('Poison', `${player.poison}/turn`, 'negative'));
        }
        if (player.weak > 0) {
            playerStatuses.push(this.makeChip('Weakened', `${player.weak} hit${player.weak > 1 ? 's' : ''}`, 'negative'));
        }
        if (player.thorns > 0) {
            playerStatuses.push(this.makeChip('Thorns', `${player.thorns} reflect`, 'positive'));
        }
        this.dom.playerStatuses.innerHTML = playerStatuses.join('');

        this.dom.boonChipRow.innerHTML = player.boons
            .slice(0, 4)
            .map((boonId) => `<span class="boon-chip">${BOON_LOOKUP[boonId].name}</span>`)
            .join('');
        this.dom.playerBoonSummary.textContent = player.boons.length
            ? `${player.boons.length} boon${player.boons.length === 1 ? '' : 's'} in your pack. Open Pack for full details.`
            : 'No boons yet. Hunt the wilds and build a run.';
    }

    renderEnemy() {
        const enemy = this.state.enemy;
        if (!enemy) {
            this.dom.enemyPortrait.innerHTML = '';
            this.dom.enemyRole.textContent = 'No encounter';
            this.dom.enemyName.textContent = 'The Wilds Stir';
            this.dom.enemyFlavor.textContent = 'Choose a route to begin or continue the run.';
            this.dom.enemyHpBar.style.width = '0%';
            this.dom.enemyHpText.textContent = '0 / 0';
            this.dom.enemyGuardBar.style.width = '0%';
            this.dom.enemyGuardText.textContent = '0';
            this.dom.enemyIntent.textContent = 'No active enemy intent.';
            this.dom.enemyStatuses.innerHTML = '';
            return;
        }

        this.dom.enemyPortrait.innerHTML = enemy.portrait;
        this.dom.enemyRole.textContent = enemy.role;
        this.dom.enemyName.textContent = enemy.name;
        this.dom.enemyFlavor.textContent = enemy.flavor;
        this.dom.enemyHpBar.style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;
        this.dom.enemyHpText.textContent = `${Math.max(0, enemy.hp)} / ${enemy.maxHp}`;
        this.dom.enemyGuardBar.style.width = `${Math.min(100, enemy.guard)}%`;
        this.dom.enemyGuardText.textContent = `${enemy.guard}`;
        this.dom.enemyIntent.textContent = this.describeIntent(this.getEnemyIntent());
        this.dom.enemyStatuses.innerHTML = [
            enemy.poison > 0 ? this.makeChip('Poison', `${enemy.poison}/turn`, 'negative') : '',
            enemy.weak > 0 ? this.makeChip('Weakened', `${enemy.weak} hit${enemy.weak > 1 ? 's' : ''}`, 'positive') : '',
            enemy.strength > 0 ? this.makeChip('Rage', `+${enemy.strength} damage`, 'neutral') : '',
        ].join('');
    }

    renderBoard(animateSpawn = false) {
        this.dom.board.innerHTML = this.state.board.map((runeId, index) => {
            const rune = RUNE_LOOKUP[runeId];
            const selectedClass = this.state.selected.includes(index) ? 'selected' : '';
            const spawnClass = animateSpawn ? 'spawned' : '';
            return `
                <button
                    class="rune-tile rune-${runeId} ${selectedClass} ${spawnClass}"
                    type="button"
                    data-index="${index}"
                    aria-label="${rune.name}"
                >
                    ${rune.icon}
                </button>
            `;
        }).join('');

        this.drawConnector();
    }

    renderLog() {
        this.dom.logList.innerHTML = this.state.logs.slice(0, LOG_LIMIT).map((entry) => `
            <li class="log-item">${entry}</li>
        `).join('');
        this.dom.turnCounter.textContent = `Turn ${this.state.turn}`;
        if (this.dom.lastLogLine) {
            this.dom.lastLogLine.textContent = this.state.logs[0] ?? 'A fresh hunt begins.';
        }
    }

    renderObjectives() {
        if (this.state.enemy) {
            this.dom.objectiveTitle.textContent = `Defeat ${this.state.enemy.name}`;
            this.dom.objectiveCopy.textContent = this.describeIntent(this.getEnemyIntent());
            return;
        }

        if (this.dom.overlay.classList.contains('hidden')) {
            this.dom.objectiveTitle.textContent = 'Travel the route';
            this.dom.objectiveCopy.textContent = 'Resolve the current node, then pick a safe or greedy path forward.';
            return;
        }

        this.dom.objectiveTitle.textContent = 'Choose your next move';
        this.dom.objectiveCopy.textContent = 'The route cards and event overlays carry the whole run forward.';
    }

    updateActionButtons() {
        const inCombat = Boolean(this.state.enemy);
        const scoutCost = this.getScoutCost();
        this.dom.surgeButton.disabled = !inCombat || this.state.processing || this.state.player.surge < SURGE_MAX;
        this.dom.potionButton.disabled = !inCombat || this.state.processing || this.state.player.potions <= 0;
        this.dom.scoutButton.disabled = !inCombat || this.state.processing || this.state.player.gold < scoutCost;
        this.dom.scoutButton.textContent = `Scout Board (${scoutCost}g)`;
    }

    makeChip(title, value, tone) {
        return `<span class="status-chip ${tone}"><strong>${title}</strong>${value}</span>`;
    }

    addLog(message) {
        this.state.logs.unshift(message);
        this.state.logs = this.state.logs.slice(0, LOG_LIMIT);
        this.renderLog();
    }

    toggleMute() {
        this.settings.muted = !this.settings.muted;
        this.audio.setMuted(this.settings.muted);
        saveSettings(this.settings);
        this.dom.muteButton.textContent = this.settings.muted ? '🔈' : '🔊';
    }

    confirmNewRun() {
        this.showOverlay({
            eyebrow: 'Start over?',
            title: 'Reforge the whole run',
            copy: 'This resets the current journey immediately. Your lifetime stats stay saved.',
            actions: [
                { label: 'Keep this run', action: 'close-overlay' },
                { label: 'Start fresh', action: 'restart-run', primary: true },
            ],
        });
    }

    showHelpOverlay() {
        this.showOverlay({
            eyebrow: 'How it works',
            title: 'One board, one route, one chain at a time',
            copy: `${HELP_LINES.map((line) => `• ${line}`).join('<br>')}<br><br>Use <strong>Map</strong> for the overworld route and <strong>Pack</strong> for boons, stats, and your current build.`,
            actions: [{ label: 'Back to the run', action: 'close-overlay', primary: true }],
        });
    }

    showMapOverlay() {
        const pathMarkup = this.dom.pathTrack.outerHTML.replace('id="path-track"', '');
        const summary = `
            <div class="summary-grid">
                <div class="summary-row">
                    <strong>Act</strong>
                    <span>${this.currentAct.shortName} — ${this.currentAct.name}</span>
                </div>
                <div class="summary-row">
                    <strong>Progress</strong>
                    <span>${Math.max(0, this.state.stageIndex + 1)} / ${ACT_PATHS[this.state.actIndex].length} nodes cleared</span>
                </div>
                <div class="summary-row">
                    <strong>Next node</strong>
                    <span>${this.dom.nextNodeBanner.textContent}</span>
                </div>
                <div class="summary-row">
                    <strong>Lifetime best</strong>
                    <span>Act ${this.meta.bestAct} • ${this.meta.wins} win${this.meta.wins === 1 ? '' : 's'}</span>
                </div>
            </div>
            <div class="overlay-grid">
                ${pathMarkup}
            </div>
        `;

        this.showOverlay({
            eyebrow: 'Overworld',
            title: 'Route Map',
            copy: summary,
            actions: [{ label: 'Back to fight', action: 'close-overlay', primary: true }],
        });
    }

    showPackOverlay() {
        const player = this.state.player;
        const boonMarkup = player.boons.length
            ? `<div class="overlay-grid">${player.boons.map((boonId, index) => `
                    <div class="summary-row">
                        <strong>${index + 1}. ${BOON_LOOKUP[boonId].name}</strong>
                        <span>${BOON_LOOKUP[boonId].description}</span>
                    </div>
                `).join('')}</div>`
            : `<div class="summary-row"><strong>No items yet</strong><span>Your pack is empty. Win battles, visit shrines, and shop smart.</span></div>`;

        const legendMarkup = LEGEND_COPY.map((entry) => `
            <div class="legend-card">
                <strong>${entry.title}</strong>
                <span>${entry.text}</span>
            </div>
        `).join('');

        this.showOverlay({
            eyebrow: 'Character',
            title: 'Pack and boons',
            copy: `
                <div class="summary-grid">
                    <div class="summary-row">
                        <strong>Vitals</strong>
                        <span>${player.hp}/${player.maxHp} HP • ${player.guard} guard • ${player.surge}/${SURGE_MAX} surge</span>
                    </div>
                    <div class="summary-row">
                        <strong>Supplies</strong>
                        <span>${player.gold} gold • ${player.potions} potions</span>
                    </div>
                    <div class="summary-row">
                        <strong>Power</strong>
                        <span>${player.attack} claw • ${player.healPower} bloom • ${player.guardPower} guard • ${player.venomDamage} venom</span>
                    </div>
                </div>
                ${boonMarkup}
                <div class="legend-grid">${legendMarkup}</div>
            `,
            actions: [{ label: 'Back to fight', action: 'close-overlay', primary: true }],
        });
    }

    showWelcomeOverlay() {
        const lastSummary = this.meta.lastRunSummary
            ? `<br><br><strong>Last run:</strong> ${this.meta.lastRunSummary}`
            : '';

        this.showOverlay({
            eyebrow: 'Wild-Dot Crawler',
            title: 'A cleaner, sharper crawl through the wilds',
            copy: `
                The main screen now stays focused on the boss and the dot board. Route planning lives in <strong>Map</strong>, and your build lives in <strong>Pack</strong>.
                ${lastSummary}
            `,
            actions: [
                { label: 'How to play', action: 'help-overlay' },
                { label: 'Begin hunt', action: 'begin-run', primary: true },
            ],
        });
    }

    showOverlay({ eyebrow, title, copy, choices = [], actions = [], context = {} }) {
        this.state.overlayContext = context;
        const choiceMarkup = choices.length
            ? `<div class="choice-grid">${choices.map((choice) => `
                    <button
                        class="choice-button ${choice.rare ? 'rare' : ''} ${choice.className ?? ''}"
                        type="button"
                        data-action="${choice.action}"
                        data-value="${choice.value ?? ''}"
                    >
                        <strong>${choice.title}</strong>
                        <span>${choice.description}</span>
                    </button>
                `).join('')}</div>`
            : '';

        const actionMarkup = actions.length
            ? `<div class="overlay-actions">${actions.map((action) => `
                    <button
                        class="${action.primary ? 'primary-button' : 'secondary-button'}"
                        type="button"
                        data-action="${action.action}"
                        data-value="${action.value ?? ''}"
                    >
                        ${action.label}
                    </button>
                `).join('')}</div>`
            : '';

        this.dom.overlay.innerHTML = `
            <div class="overlay-card">
                <p class="eyebrow">${eyebrow}</p>
                <h2>${title}</h2>
                <div class="overlay-copy">${copy}</div>
                ${choiceMarkup}
                ${actionMarkup}
            </div>
        `;
        this.dom.overlay.classList.remove('hidden');
        this.renderObjectives();
    }

    closeOverlay() {
        this.dom.overlay.innerHTML = '';
        this.dom.overlay.classList.add('hidden');
        this.state.overlayContext = null;
        this.renderObjectives();
    }

    onOverlayClick(event) {
        const button = event.target.closest('[data-action]');
        if (!button) {
            return;
        }

        const { action, value } = button.dataset;
        switch (action) {
            case 'close-overlay':
                this.closeOverlay();
                break;
            case 'help-overlay':
                this.showHelpOverlay();
                break;
            case 'begin-run':
                this.closeOverlay();
                this.advanceJourney();
                break;
            case 'restart-run':
                this.closeOverlay();
                this.startNewRun({ showOverlay: false });
                this.advanceJourney();
                break;
            case 'choose-node':
                this.closeOverlay();
                this.commitNodeChoice(value);
                break;
            case 'choose-boon': {
                const overlayContext = this.state.overlayContext ?? {};
                this.applyBoon(value);
                this.closeOverlay();
                if (overlayContext.after === 'win-run') {
                    this.finishRun(true);
                } else {
                    this.advanceJourney();
                }
                break;
            }
            case 'camp':
                this.applyCampChoice(value);
                break;
            case 'shop-buy':
                this.purchaseShopOffer(value);
                break;
            case 'shop-leave':
                this.closeOverlay();
                this.advanceJourney();
                break;
            case 'cache-continue':
                this.closeOverlay();
                this.advanceJourney();
                break;
            case 'summary-new-run':
                this.closeOverlay();
                this.startNewRun({ showOverlay: false });
                this.advanceJourney();
                break;
            case 'summary-home':
                this.closeOverlay();
                this.startNewRun({ showOverlay: true });
                break;
            default:
                break;
        }
    }

    advanceJourney() {
        const path = ACT_PATHS[this.state.actIndex];
        this.state.currentNodeType = null;
        this.state.stageIndex += 1;

        if (this.state.stageIndex >= path.length) {
            if (this.state.actIndex === ACTS.length - 1) {
                this.finishRun(true);
                return;
            }

            this.state.actIndex += 1;
            this.state.stageIndex = -1;
            this.renderAll();
            this.showOverlay({
                eyebrow: 'Act cleared',
                title: `The path opens into ${this.currentAct.name}`,
                copy: this.currentAct.subtitle,
                actions: [{ label: 'Press onward', action: 'begin-run', primary: true }],
            });
            return;
        }

        const stage = path[this.state.stageIndex];
        this.renderAll();

        if (stage.choices) {
            this.showNodeChoiceOverlay(stage.choices);
            return;
        }

        this.commitNodeChoice(stage.type);
    }

    showNodeChoiceOverlay(choiceTypes) {
        const choices = choiceTypes.map((type) => ({
            action: 'choose-node',
            value: type,
            title: `${NODE_TYPES[type].icon} ${NODE_TYPES[type].label}`,
            description: NODE_TYPES[type].description,
            className: `node-${type}`,
        }));

        this.showOverlay({
            eyebrow: 'Choose a route',
            title: 'Which trail do you follow?',
            copy: 'Greedier paths pay more, safer paths stabilize the run. Pick what the current board and your health can support.',
            choices,
        });
    }

    commitNodeChoice(type) {
        this.state.journeyHistory[this.state.actIndex][this.state.stageIndex] = type;
        this.state.currentNodeType = type;
        this.renderAll();
        this.enterNode(type);
    }

    enterNode(type) {
        switch (type) {
            case 'battle':
            case 'elite':
            case 'boss':
                this.startCombat(type);
                break;
            case 'camp':
                this.showCampOverlay();
                break;
            case 'shop':
                this.showShopOverlay();
                break;
            case 'shrine':
                this.showShrineOverlay();
                break;
            case 'cache':
                this.showCacheOverlay();
                break;
            default:
                break;
        }
    }

    startCombat(kind) {
        const act = this.currentAct;
        const template = kind === 'battle'
            ? sample(act.enemies)
            : kind === 'elite'
                ? act.elite
                : act.boss;
        this.state.enemy = cloneEnemy(template);
        this.state.battleKind = kind;
        this.state.turn = 1;
        this.state.player.battleFirstChainUsed = false;
        this.state.player.guard += this.state.player.startBattleGuard;
        const surgeBonus = Math.round(SURGE_MAX * this.state.player.startBattleSurgePct);
        this.state.player.surge = clamp(this.state.player.surge + surgeBonus, 0, SURGE_MAX);
        this.generateBoard();
        this.addLog(`${template.name} blocks the path. ${this.describeIntent(this.getEnemyIntent())}`);
        this.audio.trigger('enemy');
        this.renderAll();
    }

    getEnemyIntent() {
        if (!this.state.enemy) {
            return null;
        }

        const intents = this.state.enemy.intents;
        return intents[this.state.enemy.currentIntentIndex % intents.length];
    }

    describeIntent(intent) {
        if (!intent) {
            return 'No active intent.';
        }

        const parts = [intent.label];
        if (intent.damage) {
            parts.push(`${intent.hits ? `${intent.hits}x ` : ''}${intent.damage} dmg`);
        }
        if (intent.guard) {
            parts.push(`+${intent.guard} guard`);
        }
        if (intent.poison) {
            parts.push(`+${intent.poison} poison`);
        }
        if (intent.weak) {
            parts.push(`weaken ${intent.weak}`);
        }
        if (intent.surgeLoss) {
            parts.push(`drain ${intent.surgeLoss} surge`);
        }
        if (intent.heal) {
            parts.push(`heal ${intent.heal}`);
        }

        return parts.join(' • ');
    }

    showCampOverlay() {
        this.showOverlay({
            eyebrow: 'Campfire',
            title: 'Catch your breath',
            copy: 'Take a moment to recover or toughen up before the next fight.',
            choices: CAMP_OPTIONS.map((option) => ({
                action: 'camp',
                value: option.id,
                title: option.name,
                description: option.description,
                className: 'node-camp',
            })),
        });
    }

    applyCampChoice(choiceId) {
        const { player } = this.state;
        if (choiceId === 'rest') {
            const healAmount = Math.round(player.maxHp * 0.35);
            this.healPlayer(healAmount);
            player.poison = Math.max(0, player.poison - 3);
            this.addLog(`You rest by the fire and recover ${healAmount} HP.`);
        } else if (choiceId === 'sharpen') {
            player.attack += 1;
            player.venomDamage += 1;
            this.addLog('You sharpen your claws. Attack and venom both grow stronger.');
        } else if (choiceId === 'fortify') {
            player.maxHp += 12;
            player.hp = Math.min(player.maxHp, player.hp + 12);
            this.addLog('You brace the pack, gaining 12 max HP.');
        }

        this.closeOverlay();
        this.renderAll();
        this.advanceJourney();
    }

    showShopOverlay() {
        this.state.shopOffers = this.buildShopOffers();
        this.renderShopOverlay();
    }

    buildShopOffers() {
        const availableBoons = this.getAvailableBoons({ allowRare: true }).slice(0, 3);
        const priceMod = 1 - this.state.player.shopDiscount;
        const boonOffer = availableBoons[0];
        return [
            { id: 'heal', title: 'Field Dressing', description: 'Recover 20 HP.', price: Math.round(18 * priceMod) },
            { id: 'potion', title: 'Moon Tonic', description: '+1 potion.', price: Math.round(16 * priceMod) },
            boonOffer
                ? {
                    id: `boon:${boonOffer.id}`,
                    title: boonOffer.name,
                    description: boonOffer.description,
                    price: Math.round((boonOffer.rarity === 'rare' ? 38 : 26) * priceMod),
                    rare: boonOffer.rarity === 'rare',
                }
                : null,
        ].filter(Boolean);
    }

    renderShopOverlay() {
        const copy = `Spend gold to stabilize the run. You have ${this.state.player.gold} gold.`;
        this.showOverlay({
            eyebrow: 'Trader',
            title: 'A wagon under woven lanterns',
            copy,
            choices: this.state.shopOffers.map((offer) => ({
                action: 'shop-buy',
                value: offer.id,
                title: `${offer.title} — ${offer.price}g`,
                description: offer.description,
                rare: offer.rare,
                className: 'node-shop',
            })),
            actions: [{ label: 'Leave shop', action: 'shop-leave' }],
        });
    }

    purchaseShopOffer(offerId) {
        const offer = this.state.shopOffers.find((entry) => entry.id === offerId);
        if (!offer || this.state.player.gold < offer.price) {
            return;
        }

        this.state.player.gold -= offer.price;
        this.state.runStats.goldSpent += offer.price;

        if (offerId === 'heal') {
            this.healPlayer(20);
            this.addLog('The trader patches you up for 20 HP.');
        } else if (offerId === 'potion') {
            this.state.player.potions += 1;
            this.addLog('You buy a fresh moon tonic.');
        } else if (offerId.startsWith('boon:')) {
            const boonId = offerId.split(':')[1];
            this.applyBoon(boonId);
            this.state.shopOffers = this.state.shopOffers.filter((entry) => entry.id !== offerId);
            this.addLog(`You purchase ${BOON_LOOKUP[boonId].name}.`);
        }

        this.renderAll();
        this.renderShopOverlay();
    }

    showShrineOverlay() {
        const boonChoices = this.buildRewardChoices(3, true);
        this.showOverlay({
            eyebrow: 'Shrine',
            title: 'The wilds answer your call',
            copy: 'Take one blessing. Shrines are free, but they only appear when you gamble on them.',
            choices: boonChoices.map((boon) => ({
                action: 'choose-boon',
                value: boon.id,
                title: boon.name,
                description: boon.description,
                rare: boon.rarity === 'rare',
                className: 'node-shrine',
            })),
            context: { after: 'advance' },
        });
    }

    showCacheOverlay() {
        const goldGain = randomInt(18, 28) + this.state.player.cacheBonusGold;
        const gainedPotion = Math.random() < 0.45;
        this.state.player.gold += goldGain;
        this.state.runStats.goldCollected += goldGain;
        if (gainedPotion) {
            this.state.player.potions += 1;
        }
        this.addLog(`You crack open a hidden cache and claim ${goldGain} gold${gainedPotion ? ' plus a potion' : ''}.`);
        this.audio.trigger('reward');
        this.renderAll();
        this.showOverlay({
            eyebrow: 'Cache',
            title: 'You found hidden supplies',
            copy: `Inside the cache: ${goldGain} gold${gainedPotion ? ' and 1 potion' : ''}.`,
            actions: [{ label: 'Continue', action: 'cache-continue', primary: true }],
        });
    }

    getAvailableBoons({ allowRare = false } = {}) {
        return shuffle(BOONS.filter((boon) => {
            if (this.state.player.boonIds.has(boon.id)) {
                return false;
            }

            if (!allowRare && boon.rarity === 'rare') {
                return false;
            }

            return true;
        }));
    }

    buildRewardChoices(count, allowRare) {
        const available = this.getAvailableBoons({ allowRare });
        if (available.length >= count) {
            return available.slice(0, count);
        }

        const choices = [...available];
        const fallbackPool = shuffle(BOONS).filter((boon) => !choices.some((choice) => choice.id === boon.id));
        return [...choices, ...fallbackPool].slice(0, count);
    }

    applyBoon(boonId) {
        const boon = BOON_LOOKUP[boonId];
        if (!boon) {
            return;
        }

        const { player } = this.state;
        player.boons.push(boonId);
        player.boonIds.add(boonId);
        this.state.runStats.boonsCollected += 1;

        switch (boonId) {
            case 'feral_claws':
                player.attack += 2;
                break;
            case 'verdant_heart':
                player.healPower += 2;
                break;
            case 'tidal_focus':
                player.surgeGain += 2;
                break;
            case 'barkskin':
                player.guardPower += 2;
                break;
            case 'toxic_fangs':
                player.venomDamage += 1;
                player.poisonPerVenom += 1;
                break;
            case 'sun_pockets':
                player.wildBonusGold += 2;
                player.wildBonusHeal += 2;
                break;
            case 'trail_rations':
                player.potions += 1;
                player.potionBonus += 0.1;
                break;
            case 'thornmail':
                player.thorns += 4;
                break;
            case 'deep_roots':
                player.maxHp += 14;
                player.hp += 14;
                break;
            case 'moon_hunter':
                player.longChainDamageBonus += 0.25;
                break;
            case 'surge_engine':
                player.startBattleSurgePct += 0.35;
                player.surgeBonusDamage += 6;
                break;
            case 'pack_instinct':
                player.firstChainBonus += 0.2;
                break;
            case 'ashen_resolve':
                player.startBattleGuard += 16;
                player.scoutCostReduction += 4;
                break;
            case 'wild_echo':
                player.wildfallPower = 1;
                break;
            case 'merchant_map':
                player.shopDiscount += 0.2;
                player.cacheBonusGold += 8;
                break;
            default:
                break;
        }

        this.addLog(`You gain ${boon.name}${player.boons.filter((entry) => entry === boonId).length > 1 ? ' again' : ''}.`);
        this.audio.trigger('reward');
        this.renderAll();
    }

    getScoutCost() {
        return Math.max(4, SCOUT_COST - this.state.player.scoutCostReduction);
    }

    onPointerDown(event) {
        if (this.state.processing || !this.state.enemy) {
            return;
        }

        const cell = event.target.closest('[data-index]');
        if (!cell) {
            return;
        }

        event.preventDefault();
        const index = Number(cell.dataset.index);
        this.state.pointerActive = true;
        this.state.selected = [index];
        this.state.chainType = this.state.board[index] === 'wild' ? null : this.state.board[index];
        this.audio.trigger('select', 0);
        this.updateChainPreview();
        this.renderBoard();
    }

    onPointerMove(event) {
        if (!this.state.pointerActive || this.state.processing || !this.state.enemy) {
            return;
        }

        const cell = document.elementFromPoint(event.clientX, event.clientY)?.closest?.('[data-index]');
        if (!cell) {
            return;
        }

        const index = Number(cell.dataset.index);
        const lastIndex = this.state.selected[this.state.selected.length - 1];
        if (index === lastIndex) {
            return;
        }

        const previousIndex = this.state.selected[this.state.selected.length - 2];
        if (index === previousIndex) {
            this.state.selected.pop();
            this.recomputeChainType();
            this.updateChainPreview();
            this.renderBoard();
            return;
        }

        if (this.state.selected.includes(index)) {
            return;
        }

        if (!this.areAdjacent(index, lastIndex)) {
            return;
        }

        const runeId = this.state.board[index];
        if (!this.canAcceptRune(runeId, this.state.chainType)) {
            return;
        }

        this.state.selected.push(index);
        if (this.state.chainType === null && runeId !== 'wild') {
            this.state.chainType = runeId;
        }

        this.audio.trigger('select', this.state.selected.length - 1);
        this.updateChainPreview();
        this.renderBoard();
    }

    onPointerUp() {
        if (!this.state.pointerActive) {
            return;
        }

        this.state.pointerActive = false;
        if (this.state.selected.length >= 3 && this.state.enemy) {
            const type = this.state.chainType ?? 'wild';
            const selection = [...this.state.selected];
            this.clearSelection();
            this.resolvePlayerChain(selection, type);
            return;
        }

        this.clearSelection();
        this.updateChainPreview();
        this.renderBoard();
    }

    clearSelection() {
        this.state.selected = [];
        this.state.chainType = null;
        this.drawConnector();
    }

    recomputeChainType() {
        this.state.chainType = null;
        for (const index of this.state.selected) {
            const rune = this.state.board[index];
            if (rune !== 'wild') {
                this.state.chainType = rune;
                return;
            }
        }
    }

    updateChainPreview() {
        if (!this.state.selected.length) {
            this.dom.chainTitle.textContent = 'Trace a chain of 3 or more';
            this.dom.chainPreview.textContent = 'Long chains hit harder, and refills can trigger automatic Wildfalls.';
            return;
        }

        const type = this.state.chainType ?? 'wild';
        const preview = this.previewChain(type, this.state.selected);
        this.dom.chainTitle.textContent = preview.title;
        this.dom.chainPreview.textContent = preview.text;
    }

    previewChain(type, selected) {
        const count = selected.length;
        const wildCount = selected.filter((index) => this.state.board[index] === 'wild').length;
        const bonusPhrase = count >= 5 ? ' Long chain bonus active.' : '';
        if (type === 'wild') {
            const gold = count * (4 + this.state.player.wildBonusGold);
            return {
                title: `${count} Wild sigils`,
                text: `Gain about ${gold} gold, recover ${count * (1 + this.state.player.wildBonusHeal)} HP, and charge surge.${bonusPhrase}`,
            };
        }

        if (type === 'claw') {
            const damage = this.computeDamageValue(count, wildCount, false);
            return { title: `${count} Claw chain`, text: `Deal about ${damage} damage.${bonusPhrase}` };
        }
        if (type === 'bloom') {
            const heal = Math.round(count * this.state.player.healPower);
            return { title: `${count} Bloom chain`, text: `Recover about ${heal} HP.${count >= 5 ? ' Cleanses 1 poison and 1 weak.' : ''}` };
        }
        if (type === 'tide') {
            const surge = Math.round(count * this.state.player.surgeGain);
            return { title: `${count} Tide chain`, text: `Charge about ${surge} surge.${count >= 6 ? ' Grants 6 guard too.' : ''}` };
        }
        if (type === 'guard') {
            const guard = Math.round(count * this.state.player.guardPower + (count >= 5 ? 6 : 0));
            return { title: `${count} Guard chain`, text: `Gain about ${guard} guard.` };
        }

        const poison = this.state.player.poisonPerVenom + Math.floor((count - 1) / 2);
        return {
            title: `${count} Venom chain`,
            text: `Deal damage now and apply about ${poison} poison.${bonusPhrase}`,
        };
    }

    areAdjacent(a, b) {
        const ax = a % GRID_SIZE;
        const ay = Math.floor(a / GRID_SIZE);
        const bx = b % GRID_SIZE;
        const by = Math.floor(b / GRID_SIZE);
        return Math.abs(ax - bx) <= 1 && Math.abs(ay - by) <= 1;
    }

    canAcceptRune(runeId, currentType) {
        return currentType === null || runeId === currentType || runeId === 'wild';
    }

    drawConnector() {
        const selected = this.state.selected;
        if (!selected.length) {
            this.dom.connectorSvg.innerHTML = '';
            return;
        }

        const boardRect = this.dom.board.getBoundingClientRect();
        const points = selected.map((index) => {
            const element = this.dom.board.querySelector(`[data-index="${index}"]`);
            if (!element) {
                return null;
            }
            const rect = element.getBoundingClientRect();
            return `${rect.left - boardRect.left + rect.width / 2},${rect.top - boardRect.top + rect.height / 2}`;
        }).filter(Boolean);

        this.dom.connectorSvg.setAttribute('viewBox', `0 0 ${boardRect.width} ${boardRect.height}`);
        this.dom.connectorSvg.innerHTML = `<polyline class="connector-line" points="${points.join(' ')}"></polyline>`;
    }

    getWeightedRune() {
        const weights = this.currentAct.boardWeights;
        const roll = Math.random();
        let cursor = 0;
        for (const rune of RUNES) {
            cursor += weights[rune.id];
            if (roll <= cursor) {
                return rune.id;
            }
        }

        return 'claw';
    }

    generateBoard() {
        let board = [];
        let attempts = 0;
        do {
            board = Array.from({ length: GRID_SIZE * GRID_SIZE }, () => this.getWeightedRune());
            attempts += 1;
        } while (!this.boardHasMove(board) && attempts < 40);

        if (!this.boardHasMove(board)) {
            board = [...board];
            board[0] = 'claw';
            board[1] = 'claw';
            board[2] = 'claw';
        }

        this.state.board = board;
        this.clearSelection();
    }

    boardHasMove(board) {
        for (let index = 0; index < board.length; index += 1) {
            const visited = new Set([index]);
            if (this.searchMove(board, index, visited, board[index] === 'wild' ? null : board[index], 1)) {
                return true;
            }
        }
        return false;
    }

    searchMove(board, index, visited, chainType, length) {
        const currentRune = board[index];
        let effectiveType = chainType;
        if (effectiveType === null && currentRune !== 'wild') {
            effectiveType = currentRune;
        }

        if (length >= 3 && effectiveType !== null) {
            return true;
        }

        for (const neighbor of this.getNeighbors(index)) {
            if (visited.has(neighbor)) {
                continue;
            }
            const nextRune = board[neighbor];
            if (effectiveType !== null && nextRune !== effectiveType && nextRune !== 'wild') {
                continue;
            }
            visited.add(neighbor);
            if (this.searchMove(board, neighbor, visited, effectiveType, length + 1)) {
                return true;
            }
            visited.delete(neighbor);
        }

        return false;
    }

    getNeighbors(index) {
        const x = index % GRID_SIZE;
        const y = Math.floor(index / GRID_SIZE);
        const neighbors = [];

        for (const [dx, dy] of ADJACENT_OFFSETS) {
            const nextX = x + dx;
            const nextY = y + dy;
            if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
                continue;
            }
            neighbors.push(nextY * GRID_SIZE + nextX);
        }

        return neighbors;
    }

    async resolvePlayerChain(indices, type) {
        if (!this.state.enemy || this.state.processing) {
            return;
        }

        this.state.processing = true;
        const count = indices.length;
        const wildCount = indices.filter((index) => this.state.board[index] === 'wild').length;
        this.applyChainEffect(type, count, wildCount, false, 0);
        this.removeCells(indices);
        this.refillBoard();
        this.renderBoard(true);
        this.audio.trigger('resolve');
        await sleep(160);

        if (!this.state.enemy || this.state.enemy.hp <= 0) {
            this.state.processing = false;
            this.renderAll();
            this.handleCombatWin();
            return;
        }

        await this.resolveWildfalls();
        if (!this.state.enemy || this.state.enemy.hp <= 0) {
            this.state.processing = false;
            this.renderAll();
            this.handleCombatWin();
            return;
        }

        this.resolvePoisonTick('player');
        if (this.state.player.hp <= 0) {
            this.state.processing = false;
            this.finishRun(false);
            return;
        }

        await this.enemyTurn();
        this.state.processing = false;
        this.renderAll();
    }

    computeDamageValue(count, wildCount, isWildfall) {
        const player = this.state.player;
        let multiplier = 1 + Math.max(0, count - 3) * 0.14;
        if (count >= 5) {
            multiplier += player.longChainDamageBonus;
        }
        if (!isWildfall && !player.battleFirstChainUsed) {
            multiplier += player.firstChainBonus;
        }
        if (isWildfall) {
            multiplier *= player.wildfallPower;
        }

        let damage = Math.round((count * (player.attack + 1) + wildCount * 2) * multiplier);
        if (player.weak > 0) {
            damage = Math.round(damage * 0.8);
        }
        return damage;
    }

    applyChainEffect(type, count, wildCount, isWildfall, depth) {
        const player = this.state.player;
        const enemy = this.state.enemy;
        const supportMultiplier = isWildfall ? player.wildfallPower : 1;
        const sourceLabel = isWildfall ? 'Wildfall' : 'Chain';
        const markManualChain = () => {
            if (!isWildfall) {
                player.battleFirstChainUsed = true;
            }
        };

        if (type === 'claw') {
            const damage = this.computeDamageValue(count, wildCount, isWildfall);
            this.damageEnemy(damage);
            if (count >= 6 && enemy) {
                enemy.weak += 1;
            }
            if (player.weak > 0) {
                player.weak -= 1;
            }
            this.addLog(`${sourceLabel} claws tear for ${damage} damage.`);
            this.spawnFloatingText('enemy', `-${damage}`, '#fb7185');
            markManualChain();
            return;
        }

        if (type === 'bloom') {
            const healAmount = Math.round(count * player.healPower * (1 + Math.max(0, count - 3) * 0.08) * supportMultiplier)
                + (wildCount * player.wildBonusHeal);
            this.healPlayer(healAmount);
            if (count >= 5) {
                player.poison = Math.max(0, player.poison - 1);
                player.weak = Math.max(0, player.weak - 1);
            }
            this.audio.trigger('heal');
            this.addLog(`${sourceLabel} bloom restores ${healAmount} HP.`);
            this.spawnFloatingText('player', `+${healAmount}`, '#34d399');
            markManualChain();
            return;
        }

        if (type === 'tide') {
            const gain = Math.round(count * player.surgeGain * (1 + Math.max(0, count - 4) * 0.08) * supportMultiplier);
            player.surge = clamp(player.surge + gain, 0, SURGE_MAX);
            if (count >= 6) {
                player.guard += 6;
            }
            this.addLog(`${sourceLabel} tide charges ${gain} surge.`);
            this.spawnFloatingText('player', `+${gain} surge`, '#38bdf8');
            markManualChain();
            return;
        }

        if (type === 'guard') {
            const guardGain = Math.round((count * player.guardPower + (count >= 5 ? 6 : 0)) * supportMultiplier);
            player.guard += guardGain;
            this.audio.trigger('guard');
            this.addLog(`${sourceLabel} guard grants ${guardGain} protection.`);
            this.spawnFloatingText('player', `+${guardGain} guard`, '#fbbf24');
            markManualChain();
            return;
        }

        if (type === 'venom') {
            let damage = Math.round((count * player.venomDamage + wildCount) * (1 + Math.max(0, count - 3) * 0.14) * supportMultiplier);
            if (count >= 5) {
                damage = Math.round(damage * (1 + player.longChainDamageBonus));
            }
            if (player.weak > 0) {
                damage = Math.round(damage * 0.8);
                player.weak -= 1;
            }
            const poison = Math.round((player.poisonPerVenom + Math.floor((count - 1) / 2)) * supportMultiplier);
            this.damageEnemy(damage);
            if (enemy) {
                enemy.poison += poison;
            }
            this.addLog(`${sourceLabel} venom deals ${damage} and adds ${poison} poison.`);
            this.spawnFloatingText('enemy', `-${damage} / +${poison} poison`, '#a78bfa');
            markManualChain();
            return;
        }

        const goldGain = count * (4 + player.wildBonusGold);
        const healAmount = count * (1 + player.wildBonusHeal);
        player.gold += goldGain;
        player.surge = clamp(player.surge + count * 2, 0, SURGE_MAX);
        this.state.runStats.goldCollected += goldGain;
        this.healPlayer(healAmount);
        this.addLog(`${sourceLabel} wild sigils grant ${goldGain} gold and ${healAmount} HP.`);
        this.spawnFloatingText('player', `+${goldGain}g`, '#fef3c7');
        markManualChain();
    }

    removeCells(indices) {
        for (const index of indices) {
            this.state.board[index] = null;
        }
    }

    refillBoard() {
        const columns = Array.from({ length: GRID_SIZE }, () => []);
        for (let row = GRID_SIZE - 1; row >= 0; row -= 1) {
            for (let column = 0; column < GRID_SIZE; column += 1) {
                const index = row * GRID_SIZE + column;
                const rune = this.state.board[index];
                if (rune !== null) {
                    columns[column].push(rune);
                }
            }
        }

        for (let column = 0; column < GRID_SIZE; column += 1) {
            while (columns[column].length < GRID_SIZE) {
                columns[column].push(this.getWeightedRune());
            }
            for (let row = GRID_SIZE - 1; row >= 0; row -= 1) {
                const index = row * GRID_SIZE + column;
                this.state.board[index] = columns[column][GRID_SIZE - 1 - row];
            }
        }

        if (!this.boardHasMove(this.state.board)) {
            this.generateBoard();
            this.addLog('The wilds shift and reveal a fresh pattern.');
        }
    }

    findWildfallClusters() {
        const visited = new Set();
        const clusters = [];

        for (let index = 0; index < this.state.board.length; index += 1) {
            if (visited.has(index)) {
                continue;
            }
            const rune = this.state.board[index];
            if (rune === 'wild') {
                continue;
            }

            const queue = [index];
            const cluster = [];
            visited.add(index);

            while (queue.length) {
                const current = queue.shift();
                cluster.push(current);
                for (const neighbor of this.getNeighbors(current)) {
                    if (visited.has(neighbor) || this.state.board[neighbor] !== rune) {
                        continue;
                    }
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }

            if (cluster.length >= 4) {
                clusters.push({ type: rune, cells: cluster });
            }
        }

        return clusters.sort((a, b) => b.cells.length - a.cells.length);
    }

    async resolveWildfalls() {
        for (let depth = 1; depth <= MAX_WILDFALLS; depth += 1) {
            const clusters = this.findWildfallClusters();
            if (!clusters.length) {
                return;
            }

            const cluster = clusters[0];
            this.state.runStats.wildfalls += 1;
            this.addLog(`Wildfall ${depth}: ${cluster.cells.length} ${RUNE_LOOKUP[cluster.type].name} sigils erupt.`);
            this.applyChainEffect(cluster.type, cluster.cells.length, 0, true, depth);
            this.removeCells(cluster.cells);
            this.refillBoard();
            this.renderBoard(true);
            await sleep(170);
        }
    }

    damageEnemy(amount) {
        if (!this.state.enemy || amount <= 0) {
            return 0;
        }

        let damage = amount;
        if (this.state.enemy.guard > 0) {
            const absorbed = Math.min(this.state.enemy.guard, damage);
            this.state.enemy.guard -= absorbed;
            damage -= absorbed;
        }

        if (damage > 0) {
            this.state.enemy.hp = Math.max(0, this.state.enemy.hp - damage);
            this.state.runStats.damageDealt += damage;
        }

        this.renderEnemy();
        return damage;
    }

    healPlayer(amount) {
        this.state.player.hp = Math.min(this.state.player.maxHp, this.state.player.hp + amount);
    }

    damagePlayer(amount) {
        let damage = amount;
        if (this.state.player.guard > 0) {
            const absorbed = Math.min(this.state.player.guard, damage);
            this.state.player.guard -= absorbed;
            damage -= absorbed;
        }

        if (damage > 0) {
            this.state.player.hp = Math.max(0, this.state.player.hp - damage);
            this.state.runStats.damageTaken += damage;
            if (this.state.player.thorns > 0 && this.state.enemy) {
                this.damageEnemy(this.state.player.thorns);
                this.addLog(`Thornmail reflects ${this.state.player.thorns} damage.`);
            }
        }

        this.spawnFloatingText('player', `-${damage}`, '#fb7185');
        return damage;
    }

    resolvePoisonTick(target) {
        if (target === 'player' && this.state.player.poison > 0) {
            const poison = this.state.player.poison;
            this.state.player.hp = Math.max(0, this.state.player.hp - poison);
            this.state.player.poison -= 1;
            this.state.runStats.damageTaken += poison;
            this.addLog(`Poison burns for ${poison} damage.`);
            this.spawnFloatingText('player', `-${poison} poison`, '#a78bfa');
        }

        if (target === 'enemy' && this.state.enemy?.poison > 0) {
            const poison = this.state.enemy.poison;
            this.state.enemy.hp = Math.max(0, this.state.enemy.hp - poison);
            this.state.enemy.poison -= 1;
            this.state.runStats.damageDealt += poison;
            this.addLog(`${this.state.enemy.name} takes ${poison} poison damage.`);
            this.spawnFloatingText('enemy', `-${poison} poison`, '#a78bfa');
        }
    }

    async enemyTurn() {
        const enemy = this.state.enemy;
        if (!enemy) {
            return;
        }

        const intent = this.getEnemyIntent();
        if (!intent) {
            return;
        }

        let damage = intent.damage ?? 0;
        if (enemy.weak > 0 && damage > 0) {
            damage = Math.round(damage * 0.8);
            enemy.weak -= 1;
        }

        if (intent.guard) {
            enemy.guard += intent.guard;
        }
        if (intent.heal) {
            enemy.hp = Math.min(enemy.maxHp, enemy.hp + intent.heal);
        }

        const hits = intent.hits ?? 1;
        for (let index = 0; index < hits; index += 1) {
            if (damage > 0) {
                const finalDamage = damage + enemy.strength;
                this.damagePlayer(finalDamage);
                this.addLog(`${enemy.name} uses ${intent.label} for ${finalDamage} damage.`);
                await sleep(110);
            }
        }

        if (intent.poison) {
            this.state.player.poison += intent.poison;
        }
        if (intent.weak) {
            this.state.player.weak += intent.weak;
        }
        if (intent.surgeLoss) {
            this.state.player.surge = Math.max(0, this.state.player.surge - intent.surgeLoss);
        }

        this.resolvePoisonTick('enemy');
        enemy.currentIntentIndex += 1;
        this.state.turn += 1;
        this.audio.trigger('enemy');

        if (this.state.player.hp <= 0) {
            this.finishRun(false);
            return;
        }

        if (this.state.enemy.hp <= 0) {
            this.handleCombatWin();
        }
    }

    async useSurge() {
        if (!this.state.enemy || this.state.processing || this.state.player.surge < SURGE_MAX) {
            return;
        }

        this.state.processing = true;
        let damage = 18 + this.state.player.attack * 2 + this.state.player.surgeBonusDamage;
        if (this.state.player.weak > 0) {
            damage = Math.round(damage * 0.8);
            this.state.player.weak -= 1;
        }
        this.state.player.surge = 0;
        this.state.player.guard += 12;
        this.damageEnemy(damage);
        if (this.state.enemy) {
            this.state.enemy.weak += 1;
        }
        this.audio.trigger('surge');
        this.addLog(`Bestial Surge hits for ${damage} damage and leaves the enemy staggered.`);
        this.spawnFloatingText('enemy', `-${damage} surge`, '#38bdf8');
        this.resolvePoisonTick('player');

        if (this.state.enemy?.hp <= 0) {
            this.state.processing = false;
            this.handleCombatWin();
            return;
        }

        await this.enemyTurn();
        this.state.processing = false;
        this.renderAll();
    }

    drinkPotion() {
        if (!this.state.enemy || this.state.processing || this.state.player.potions <= 0) {
            return;
        }

        const healAmount = Math.round(this.state.player.maxHp * (0.4 + this.state.player.potionBonus));
        this.state.player.potions -= 1;
        this.healPlayer(healAmount);
        this.state.player.poison = Math.max(0, this.state.player.poison - 2);
        this.state.player.weak = Math.max(0, this.state.player.weak - 1);
        this.audio.trigger('heal');
        this.addLog(`You drink a potion, restoring ${healAmount} HP and clearing some debuffs.`);
        this.renderAll();
    }

    scoutBoard() {
        if (!this.state.enemy || this.state.processing) {
            return;
        }

        const scoutCost = this.getScoutCost();
        if (this.state.player.gold < scoutCost) {
            return;
        }

        this.state.player.gold -= scoutCost;
        this.state.runStats.goldSpent += scoutCost;
        this.generateBoard();
        this.addLog(`You scout ahead and redraw the board for ${scoutCost} gold.`);
        this.renderAll();
    }

    handleCombatWin() {
        const enemy = this.state.enemy;
        if (!enemy) {
            return;
        }

        const goldReward = enemy.gold + randomInt(0, 6);
        this.state.player.gold += goldReward;
        this.state.runStats.goldCollected += goldReward;
        this.state.runStats.nodesCleared += 1;

        if (this.state.battleKind === 'battle') {
            this.state.runStats.enemiesDefeated += 1;
        } else if (this.state.battleKind === 'elite') {
            this.state.runStats.elitesDefeated += 1;
        } else if (this.state.battleKind === 'boss') {
            this.state.runStats.bossesDefeated += 1;
        }

        const after = this.state.battleKind === 'boss' && this.state.actIndex === ACTS.length - 1
            ? 'win-run'
            : 'advance';
        const boonChoices = this.buildRewardChoices(3, this.state.battleKind !== 'battle');
        const title = this.state.battleKind === 'boss'
            ? `${enemy.name} falls`
            : `${enemy.name} defeated`;

        this.state.enemy = null;
        this.state.battleKind = null;
        this.audio.trigger('reward');
        this.renderAll();

        this.showOverlay({
            eyebrow: this.state.currentNodeType === 'boss' ? 'Boss down' : 'Victory',
            title,
            copy: `You collect ${goldReward} gold and choose one boon for the road.`,
            choices: boonChoices.map((boon) => ({
                action: 'choose-boon',
                value: boon.id,
                title: boon.name,
                description: boon.description,
                rare: boon.rarity === 'rare',
            })),
            context: { after },
        });
    }

    spawnFloatingText(target, text, color) {
        const anchor = target === 'enemy'
            ? this.dom.enemyPortrait
            : this.dom.playerPortrait;
        const layerRect = this.dom.floatingTextLayer.getBoundingClientRect();
        const anchorRect = anchor.getBoundingClientRect();
        const div = document.createElement('div');
        div.className = 'floating-text';
        div.textContent = text;
        div.style.left = `${anchorRect.left - layerRect.left + anchorRect.width / 2 - 20}px`;
        div.style.top = `${anchorRect.top - layerRect.top + 12}px`;
        div.style.color = color;
        this.dom.floatingTextLayer.append(div);
        window.setTimeout(() => div.remove(), 850);
    }

    finishRun(won) {
        const completedNode = this.state.actIndex * ACT_PATHS[0].length + Math.max(0, this.state.stageIndex + 1);
        this.meta.totalRuns += 1;
        this.meta.totalGold += this.state.runStats.goldCollected;
        this.meta.bestNode = Math.max(this.meta.bestNode, completedNode);
        this.meta.bestAct = Math.max(this.meta.bestAct, won ? ACTS.length : this.state.actIndex + 1);
        if (won) {
            this.meta.wins += 1;
        }

        this.meta.lastRunSummary = `${won ? 'Won' : 'Fell'} in ${this.currentAct.name} • ${this.state.runStats.nodesCleared} nodes • ${this.state.runStats.goldCollected} gold`;
        saveMeta(this.meta);
        this.renderMeta();

        const summaryRows = [
            ['Outcome', won ? 'Victory' : 'Defeat'],
            ['Nodes cleared', `${this.state.runStats.nodesCleared}`],
            ['Damage dealt', `${this.state.runStats.damageDealt}`],
            ['Damage taken', `${this.state.runStats.damageTaken}`],
            ['Gold collected', `${this.state.runStats.goldCollected}`],
            ['Wildfalls triggered', `${this.state.runStats.wildfalls}`],
            ['Boons found', `${this.state.runStats.boonsCollected}`],
        ];

        this.state.enemy = null;
        this.state.currentNodeType = null;
        this.renderAll();
        this.audio.trigger(won ? 'reward' : 'defeat');

        this.showOverlay({
            eyebrow: won ? 'Run complete' : 'The pack falls',
            title: won ? 'You conquered the Wildheart Avatar' : 'The wilds claim another run',
            copy: won
                ? 'The path is beaten, the Hollow listens, and the run becomes part of your legend.'
                : 'A stronger route or a greedier detour might have changed the story. The next run starts immediately stronger because you know more.',
            actions: [
                { label: 'Back to title', action: 'summary-home' },
                { label: 'Start another run', action: 'summary-new-run', primary: true },
            ],
            choices: [],
        });

        this.dom.overlay.querySelector('.overlay-card').insertAdjacentHTML(
            'beforeend',
            `<div class="summary-grid">${summaryRows.map(([label, value]) => `
                <div class="summary-row">
                    <strong>${label}</strong>
                    <span>${value}</span>
                </div>
            `).join('')}</div>`,
        );
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WildDotCrawler();
});
