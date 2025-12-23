/**
 * DoodlePlay - Main Application
 * Handles UI interactions, file uploads, and game creation
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize demo game
    initDemoGame();
    
    // Initialize upload functionality
    initUpload();
    
    // Initialize game type selection
    initGameTypeSelection();
    
    // Initialize create game button
    initCreateGame();
    
    // Initialize share modal
    initShareModal();
    
    // Initialize smooth scrolling for navigation
    initSmoothScroll();
    
    // Initialize navbar scroll effect
    initNavbarScroll();
});

// ===== Demo Game =====
let demoGame = null;

function initDemoGame() {
    const demoCanvas = document.getElementById('demo-game');
    if (!demoCanvas) return;
    
    demoGame = new DoodleGameEngine(demoCanvas, {
        gameType: 'flying',
        difficulty: 2,
        playerEmoji: '🐉'
    });
    
    demoGame.start();
}

// ===== File Upload =====
let uploadedImage = null;

function initUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const previewArea = document.getElementById('preview-area');
    const previewImage = document.getElementById('preview-image');
    const removeImageBtn = document.getElementById('remove-image');
    
    if (!uploadArea) return;
    
    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFileUpload(e.target.files[0]);
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFileUpload(file);
        }
    });
    
    // Remove image
    removeImageBtn.addEventListener('click', () => {
        uploadedImage = null;
        previewArea.classList.add('hidden');
        uploadArea.classList.remove('hidden');
        fileInput.value = '';
    });
}

function handleFileUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
        showToast('Please upload an image file (PNG, JPG, JPEG)', 'error');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showToast('File size must be less than 10MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImage = e.target.result;
        
        const uploadArea = document.getElementById('upload-area');
        const previewArea = document.getElementById('preview-area');
        const previewImage = document.getElementById('preview-image');
        
        previewImage.src = uploadedImage;
        uploadArea.classList.add('hidden');
        previewArea.classList.remove('hidden');
        
        showToast('Drawing uploaded! 🎨', 'success');
    };
    
    reader.readAsDataURL(file);
}

// ===== Game Type Selection =====
let selectedGameType = 'platformer';

function initGameTypeSelection() {
    const gameTypeBtns = document.querySelectorAll('.game-type-btn');
    
    gameTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            gameTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedGameType = btn.dataset.type;
        });
    });
}

// ===== Create Game =====
let userGame = null;

function initCreateGame() {
    const createBtn = document.getElementById('create-game-btn');
    const restartBtn = document.getElementById('restart-game');
    const shareBtn = document.getElementById('share-game');
    const downloadBtn = document.getElementById('download-game');
    
    if (!createBtn) return;
    
    createBtn.addEventListener('click', () => {
        createGame();
    });
    
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            if (userGame) {
                userGame.restart();
            }
        });
    }
    
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            document.getElementById('share-modal').classList.remove('hidden');
        });
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            downloadGame();
        });
    }
}

function createGame() {
    const gameName = document.getElementById('game-name').value || 'My Awesome Game';
    const gameDescription = document.getElementById('game-description').value;
    const difficulty = parseInt(document.getElementById('difficulty').value);
    
    // Show loading state
    const createBtn = document.getElementById('create-game-btn');
    createBtn.classList.add('loading');
    createBtn.disabled = true;
    
    // Simulate game generation (in real app, this would call an API)
    setTimeout(() => {
        createBtn.classList.remove('loading');
        createBtn.disabled = false;
        
        // Show game preview section
        const previewSection = document.getElementById('game-preview');
        previewSection.classList.remove('hidden');
        
        // Update title
        document.getElementById('generated-game-title').textContent = gameName;
        
        // Scroll to preview
        previewSection.scrollIntoView({ behavior: 'smooth' });
        
        // Initialize the user game
        initUserGame(difficulty);
        
        showToast('🎉 Your game is ready!', 'success');
    }, 2000);
}

function initUserGame(difficulty) {
    const userCanvas = document.getElementById('user-game');
    if (!userCanvas) return;
    
    // Stop existing game if any
    if (userGame) {
        userGame.stop();
    }
    
    // Determine player emoji based on game type
    const playerEmojis = {
        'platformer': '🦸',
        'flying': '🐉',
        'racing': '🏎️',
        'catching': '🧺'
    };
    
    userGame = new DoodleGameEngine(userCanvas, {
        gameType: selectedGameType,
        difficulty: difficulty,
        playerEmoji: playerEmojis[selectedGameType] || '🐉'
    });
    
    // If user uploaded an image, use it as the player
    if (uploadedImage) {
        userGame.setPlayerImage(uploadedImage);
    }
    
    userGame.start();
}

function downloadGame() {
    // In a real app, this would generate a downloadable game package
    showToast('Game download started! 📥', 'success');
    
    // Create a simple HTML file with the game embedded
    const gameHtml = generateStandaloneGame();
    const blob = new Blob([gameHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-doodleplay-game.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateStandaloneGame() {
    // Generate a standalone HTML file with the game
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My DoodlePlay Game</title>
    <style>
        body { 
            margin: 0; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            min-height: 100vh; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: sans-serif;
        }
        .game-container {
            background: white;
            padding: 20px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        canvas { display: block; border-radius: 10px; }
        .controls { text-align: center; margin-top: 15px; color: #666; }
    </style>
</head>
<body>
    <div class="game-container">
        <canvas id="game" width="600" height="400"></canvas>
        <div class="controls">Use ← → arrows to move, SPACE to jump/fly</div>
    </div>
    <script>
        // Embedded game engine would go here
        // For demo purposes, just show a message
        const canvas = document.getElementById('game');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, 600, 400);
        ctx.fillStyle = '#333';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎮 Your Game Would Load Here!', 300, 200);
        ctx.font = '16px sans-serif';
        ctx.fillText('Made with DoodlePlay', 300, 240);
    </script>
</body>
</html>`;
}

// ===== Share Modal =====
function initShareModal() {
    const modal = document.getElementById('share-modal');
    const closeBtn = document.getElementById('close-modal');
    const copyBtn = document.getElementById('copy-link');
    
    if (!modal) return;
    
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
    
    copyBtn.addEventListener('click', () => {
        const shareLink = document.getElementById('share-link');
        shareLink.select();
        document.execCommand('copy');
        showToast('Link copied! 📋', 'success');
    });
    
    // Social share buttons
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const shareUrl = 'https://doodleplay.com/game/abc123';
            const shareText = 'Check out this game I made with DoodlePlay! 🎮';
            
            if (btn.classList.contains('facebook')) {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
            } else if (btn.classList.contains('twitter')) {
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
            } else if (btn.classList.contains('email')) {
                window.location.href = `mailto:?subject=${encodeURIComponent('Check out my game!')}&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
            }
        });
    });
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ===== Navbar Scroll Effect =====
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
}

// ===== Toast Notifications =====
function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== Intersection Observer for Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.querySelectorAll('.step, .gallery-item, .testimonial-card, .pricing-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// ===== Fun Background Particles =====
function createBackgroundParticles() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'bg-particle';
        particle.style.cssText = `
            position: absolute;
            width: ${5 + Math.random() * 10}px;
            height: ${5 + Math.random() * 10}px;
            background: rgba(124, 58, 237, ${0.1 + Math.random() * 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: floatParticle ${5 + Math.random() * 10}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
            pointer-events: none;
        `;
        hero.appendChild(particle);
    }
}

// Add particle animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes floatParticle {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(20px, -30px) rotate(90deg); }
        50% { transform: translate(-10px, 20px) rotate(180deg); }
        75% { transform: translate(30px, 10px) rotate(270deg); }
    }
`;
document.head.appendChild(style);

createBackgroundParticles();

// ===== Easter Egg: Konami Code =====
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.code === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            showToast('🎉 Secret mode activated! All games unlocked!', 'success');
            document.body.style.animation = 'rainbow 2s linear';
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

// Rainbow animation for easter egg
const rainbowStyle = document.createElement('style');
rainbowStyle.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(rainbowStyle);
