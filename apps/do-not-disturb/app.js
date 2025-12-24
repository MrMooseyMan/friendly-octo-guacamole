const app = document.getElementById('app');
const toggleBtn = document.getElementById('toggle-btn');
const statusText = document.getElementById('main-status-text');
const subStatusText = document.getElementById('sub-status-text');
const redDetails = document.getElementById('red-mode-details');
const vaultArea = document.getElementById('vault-area');
const msgInput = document.getElementById('visitor-msg-input');
const dropMsgBtn = document.getElementById('drop-msg-btn');
const vaultCount = document.getElementById('vault-count');
const vaultList = document.getElementById('vault-list');
const openVaultBtn = document.getElementById('open-vault-btn');

// Settings
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
const settingName = document.getElementById('setting-name');
const settingEmergency = document.getElementById('setting-emergency');
const userNameDisplay = document.getElementById('user-name-display');
const emergencyContactDisplay = document.getElementById('emergency-contact-display');

let state = {
    status: 'green', // 'green' or 'red'
    messages: [],
    settings: {
        name: 'Jamie',
        emergency: 'Mom: 555-0123'
    }
};

// Load state
function loadState() {
    const stored = localStorage.getItem('dnd_app_state');
    if (stored) {
        state = JSON.parse(stored);
        // Ensure settings exist if migrating from old version
        if (!state.settings) {
            state.settings = { name: 'Jamie', emergency: 'Mom: 555-0123' };
        }
    }
    updateUI();
}

function saveState() {
    localStorage.setItem('dnd_app_state', JSON.stringify(state));
}

function updateUI() {
    // Apply Settings
    userNameDisplay.textContent = state.settings.name;
    emergencyContactDisplay.textContent = `Contact: ${state.settings.emergency}`;
    
    // Apply Mode
    if (state.status === 'red') {
        app.classList.remove('mode-green');
        app.classList.add('mode-red');
        
        statusText.textContent = "DO NOT DISTURB";
        subStatusText.textContent = `${state.settings.name} is currently offline.`;
        
        redDetails.classList.remove('hidden');
        // In a real app, you might hide the vault button in red mode, 
        // but for usability in a single-screen app, we might keep it or hide it.
        // Hiding it reinforces the "Disconnected" feel.
        vaultArea.classList.add('hidden'); 
        
        toggleBtn.textContent = "I'M BACK (GO GREEN)";
        toggleBtn.style.backgroundColor = "#48bb78"; // Green button to go back
        
    } else {
        app.classList.remove('mode-red');
        app.classList.add('mode-green');
        
        statusText.textContent = "AVAILABLE";
        subStatusText.textContent = "I am free to talk. Text or call me!";
        
        redDetails.classList.add('hidden');
        vaultArea.classList.remove('hidden');
        
        toggleBtn.textContent = "GO DARK";
        toggleBtn.style.backgroundColor = ""; // Reset to CSS default (red/green based on class)
    }
    
    // Vault
    vaultCount.textContent = state.messages.length;
    renderVault();
}

function renderVault() {
    vaultList.innerHTML = '';
    if (state.messages.length === 0) {
        vaultList.innerHTML = '<li>No messages yet.</li>';
        return;
    }
    // Newest first
    [...state.messages].reverse().forEach(msg => {
        const li = document.createElement('li');
        const date = new Date(msg.date).toLocaleString();
        li.innerHTML = `<span class="msg-date">${date}</span> ${escapeHtml(msg.text)}`;
        vaultList.appendChild(li);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Events
toggleBtn.addEventListener('click', () => {
    state.status = state.status === 'green' ? 'red' : 'green';
    saveState();
    updateUI();
});

dropMsgBtn.addEventListener('click', () => {
    const text = msgInput.value.trim();
    if (text) {
        state.messages.push({
            text: text,
            date: new Date().toISOString()
        });
        saveState();
        msgInput.value = '';
        alert('Message secured in vault. Jamie will see it when she returns.');
        // Don't update UI immediately to show it in list, because we are in Red mode
        // and Vault is hidden.
        updateUI(); 
    }
});

openVaultBtn.addEventListener('click', () => {
    vaultList.classList.toggle('hidden');
    openVaultBtn.textContent = vaultList.classList.contains('hidden') ? 'Open Vault' : 'Close Vault';
});

// Settings Events
settingsBtn.addEventListener('click', () => {
    settingName.value = state.settings.name;
    settingEmergency.value = state.settings.emergency;
    settingsModal.classList.remove('hidden');
});

cancelSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});

saveSettingsBtn.addEventListener('click', () => {
    state.settings.name = settingName.value || 'Jamie';
    state.settings.emergency = settingEmergency.value || 'Mom: 555-0123';
    saveState();
    updateUI();
    settingsModal.classList.add('hidden');
});

// Close modal on outside click
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
    }
});

// Init
loadState();
