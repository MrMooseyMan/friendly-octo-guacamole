const META_KEY = 'wild-dot-crawler-reforged-meta';
const SETTINGS_KEY = 'wild-dot-crawler-reforged-settings';

const DEFAULT_META = {
    bestAct: 1,
    wins: 0,
    totalRuns: 0,
    totalGold: 0,
    bestNode: 0,
    lastRunSummary: null,
};

const DEFAULT_SETTINGS = {
    muted: false,
};

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function loadJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) {
            return clone(fallback);
        }

        return { ...clone(fallback), ...JSON.parse(raw) };
    } catch (error) {
        return clone(fallback);
    }
}

function saveJson(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        // Ignore storage failures in ephemeral/private sessions.
    }
}

export function loadMeta() {
    return loadJson(META_KEY, DEFAULT_META);
}

export function saveMeta(meta) {
    saveJson(META_KEY, meta);
}

export function loadSettings() {
    return loadJson(SETTINGS_KEY, DEFAULT_SETTINGS);
}

export function saveSettings(settings) {
    saveJson(SETTINGS_KEY, settings);
}
