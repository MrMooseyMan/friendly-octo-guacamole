/**
 * Do Not Disturb App
 * A simple toggle to let people know you're going dark.
 */

// DOM Elements
const app = document.getElementById('app');
const userName = document.getElementById('user-name');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const toggleBtn = document.getElementById('toggle-btn');
const toggleText = document.getElementById('toggle-text');
const darkMessage = document.getElementById('dark-message');
const availableMessage = document.getElementById('available-message');
const emergencyContact = document.getElementById('emergency-contact');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const nameInput = document.getElementById('name-input');
const emergencyInput = document.getElementById('emergency-input');
const saveSettings = document.getElementById('save-settings');
const cancelSettings = document.getElementById('cancel-settings');
const messageInput = document.getElementById('message-input');
const submitMessage = document.getElementById('submit-message');
const vaultToggle = document.getElementById('vault-toggle');
const vaultContents = document.getElementById('vault-contents');
const vaultCount = document.getElementById('vault-count');
const messagesList = document.getElementById('messages-list');
const clearVault = document.getElementById('clear-vault');

// State
let state = {
    isDark: false,
    name: 'Jamie',
    emergencyInfo: 'Call 911 or contact a family member',
    messages: []
};

// Load state from localStorage
function loadState() {
    const saved = localStorage.getItem('dnd-state');
    if (saved) {
        try {
            state = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load state:', e);
        }
    }
    updateUI();
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('dnd-state', JSON.stringify(state));
}

// Update UI based on state
function updateUI() {
    // Update name
    userName.textContent = state.name;
    
    // Update emergency contact
    emergencyContact.textContent = state.emergencyInfo;
    
    // Update status classes and text
    if (state.isDark) {
        app.classList.remove('available');
        app.classList.add('dark');
        statusText.textContent = 'Do Not Disturb';
        toggleText.textContent = 'Come Back';
        darkMessage.classList.remove('hidden');
        availableMessage.classList.add('hidden');
    } else {
        app.classList.remove('dark');
        app.classList.add('available');
        statusText.textContent = 'Available';
        toggleText.textContent = 'Go Dark';
        darkMessage.classList.add('hidden');
        availableMessage.classList.remove('hidden');
    }
    
    // Update vault
    updateVaultUI();
}

// Update vault display
function updateVaultUI() {
    vaultCount.textContent = `(${state.messages.length})`;
    
    if (state.messages.length === 0) {
        messagesList.innerHTML = '<p class="no-messages">No messages yet</p>';
        clearVault.classList.add('hidden');
    } else {
        messagesList.innerHTML = state.messages.map((msg, index) => `
            <div class="message-item" data-index="${index}">
                <div class="timestamp">${formatDate(msg.timestamp)}</div>
                <div class="content">${escapeHtml(msg.content)}</div>
            </div>
        `).join('');
        clearVault.classList.remove('hidden');
    }
}

// Format date for display
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Toggle dark mode
function toggleDarkMode() {
    state.isDark = !state.isDark;
    saveState();
    updateUI();
    
    // Haptic feedback if available
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// Add message to vault
function addMessage(content) {
    if (!content.trim()) return;
    
    state.messages.push({
        content: content.trim(),
        timestamp: Date.now()
    });
    saveState();
    updateVaultUI();
    messageInput.value = '';
    
    // Show confirmation
    showToast('Message saved to vault! 📨');
}

// Clear all messages
function clearAllMessages() {
    if (confirm('Are you sure you want to clear all messages?')) {
        state.messages = [];
        saveState();
        updateVaultUI();
    }
}

// Show toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        font-size: 1rem;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Open settings modal
function openSettings() {
    nameInput.value = state.name;
    emergencyInput.value = state.emergencyInfo;
    settingsModal.classList.remove('hidden');
}

// Close settings modal
function closeSettings() {
    settingsModal.classList.add('hidden');
}

// Save settings
function saveSettingsHandler() {
    const newName = nameInput.value.trim();
    const newEmergency = emergencyInput.value.trim();
    
    if (newName) {
        state.name = newName;
    }
    if (newEmergency) {
        state.emergencyInfo = newEmergency;
    }
    
    saveState();
    updateUI();
    closeSettings();
    showToast('Settings saved! ✓');
}

// Event Listeners
toggleBtn.addEventListener('click', toggleDarkMode);
settingsBtn.addEventListener('click', openSettings);
saveSettings.addEventListener('click', saveSettingsHandler);
cancelSettings.addEventListener('click', closeSettings);

submitMessage.addEventListener('click', () => {
    addMessage(messageInput.value);
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        addMessage(messageInput.value);
    }
});

vaultToggle.addEventListener('click', () => {
    vaultContents.classList.toggle('hidden');
});

clearVault.addEventListener('click', clearAllMessages);

// Close modal on outside click
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        closeSettings();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSettings();
    }
});

// Initialize
loadState();

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);
