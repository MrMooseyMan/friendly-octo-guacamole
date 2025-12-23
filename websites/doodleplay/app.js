/**
 * DoodlePlay Application
 * Handles UI interactions, file upload, and game creation
 */

// Game instances
let heroGame = null;
let demoGame = null;
let createdGame = null;

// State
let uploadedImage = null;
let selectedGameType = 'platformer';
let selectedDifficulty = 2;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initHeroGame();
    initDemoGame();
    initUploadArea();
    initGameTypeButtons();
    initDifficultySlider();
    initMobileMenu();
    initKonamiCode();
});

// ===== Hero Game =====

function initHeroGame() {
    heroGame = new GameEngine('hero-game', {
        gameType: 'flying',
        difficulty: 2,
        characterEmoji: '🐉',
        onScoreUpdate: (score) => {
            // Hero game doesn't show score
        },
        onLivesUpdate: (lives) => {
            // Hero game doesn't show lives
        },
        onGameOver: () => {
            showGameOverlay('hero-game', 'game-start-overlay');
        },
        onWin: () => {
            showGameOverlay('hero-game', 'game-start-overlay');
        }
    });
}

function startHeroGame() {
    const overlay = document.getElementById('game-start-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
    if (heroGame) {
        heroGame.start();
    }
}

// ===== Demo Game =====

function initDemoGame() {
    demoGame = new GameEngine('demo-game', {
        gameType: 'flying',
        difficulty: 2,
        characterEmoji: '🐉',
        onScoreUpdate: (score) => {
            const el = document.getElementById('demo-score');
            if (el) el.textContent = score;
        },
        onLivesUpdate: (lives) => {
            const el = document.getElementById('demo-lives');
            if (el) el.textContent = '❤️'.repeat(Math.max(0, lives));
        },
        onGameOver: (score) => {
            setTimeout(() => {
                alert(`Game Over! Score: ${Math.floor(score)}`);
                demoGame.start();
            }, 100);
        },
        onWin: (score) => {
            setTimeout(() => {
                alert(`You Win! Score: ${Math.floor(score)}`);
                demoGame.start();
            }, 100);
        }
    });
    
    // Auto-start demo game when it comes into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && demoGame && !demoGame.isRunning) {
                demoGame.start();
            }
        });
    }, { threshold: 0.5 });
    
    const demoCanvas = document.getElementById('demo-game');
    if (demoCanvas) {
        observer.observe(demoCanvas);
    }
}

// ===== Upload Area =====

function initUploadArea() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    
    if (!uploadArea || !fileInput) return;
    
    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
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
}

function handleFileUpload(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        uploadedImage = e.target.result;
        showUploadPreview(uploadedImage);
    };
    
    reader.readAsDataURL(file);
}

function showUploadPreview(imageSrc) {
    const uploadArea = document.getElementById('upload-area');
    const preview = document.getElementById('upload-preview');
    const previewImage = document.getElementById('preview-image');
    
    if (uploadArea) uploadArea.style.display = 'none';
    if (preview) {
        preview.style.display = 'block';
        previewImage.src = imageSrc;
    }
}

function removeUpload() {
    uploadedImage = null;
    
    const uploadArea = document.getElementById('upload-area');
    const preview = document.getElementById('upload-preview');
    const fileInput = document.getElementById('file-input');
    
    if (uploadArea) uploadArea.style.display = 'block';
    if (preview) preview.style.display = 'none';
    if (fileInput) fileInput.value = '';
}

// ===== Game Type Selection =====

function initGameTypeButtons() {
    const buttons = document.querySelectorAll('.game-type-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedGameType = btn.dataset.type;
        });
    });
}

// ===== Difficulty Slider =====

function initDifficultySlider() {
    const slider = document.getElementById('difficulty');
    const label = document.getElementById('difficulty-label');
    
    if (!slider || !label) return;
    
    const labels = ['Easy', 'Medium', 'Hard'];
    
    slider.addEventListener('input', () => {
        selectedDifficulty = parseInt(slider.value);
        label.textContent = labels[selectedDifficulty - 1];
    });
}

// ===== Create Game =====

function createGame() {
    const gameName = document.getElementById('game-name')?.value || 'My Awesome Game';
    const gameDesc = document.getElementById('game-desc')?.value || 'A fun adventure!';
    
    // Show game display section
    const gameDisplay = document.getElementById('game-display');
    const gameTitle = document.getElementById('created-game-title');
    
    if (gameDisplay) {
        gameDisplay.style.display = 'block';
        gameDisplay.scrollIntoView({ behavior: 'smooth' });
    }
    
    if (gameTitle) {
        gameTitle.textContent = `🎮 ${gameName}`;
    }
    
    // Character based on game type
    const characters = {
        platformer: '🏃',
        flying: '🐉',
        racing: '🚗',
        catching: '🧺'
    };
    
    // Create and start the game
    createdGame = new GameEngine('created-game', {
        gameType: selectedGameType,
        difficulty: selectedDifficulty,
        characterEmoji: characters[selectedGameType],
        characterImage: uploadedImage ? createImageFromSrc(uploadedImage) : null,
        onScoreUpdate: (score) => {
            const el = document.getElementById('created-score');
            if (el) el.textContent = score;
        },
        onLivesUpdate: (lives) => {
            const el = document.getElementById('created-lives');
            if (el) el.textContent = '❤️'.repeat(Math.max(0, lives));
        },
        onGameOver: (score) => {
            setTimeout(() => {
                const playAgain = confirm(`Game Over! Score: ${Math.floor(score)}\n\nPlay again?`);
                if (playAgain) {
                    createdGame.start();
                }
            }, 100);
        },
        onWin: (score) => {
            setTimeout(() => {
                const playAgain = confirm(`🎉 You Win! Score: ${Math.floor(score)}\n\nPlay again?`);
                if (playAgain) {
                    createdGame.start();
                }
            }, 100);
        }
    });
    
    createdGame.start();
}

function createImageFromSrc(src) {
    const img = new Image();
    img.src = src;
    return img;
}

function restartCreatedGame() {
    if (createdGame) {
        createdGame.start();
    }
}

// ===== Share Modal =====

function shareGame() {
    const modal = document.getElementById('share-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeShareModal() {
    const modal = document.getElementById('share-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function copyShareLink() {
    const linkInput = document.getElementById('share-link');
    if (linkInput) {
        linkInput.select();
        document.execCommand('copy');
        
        // Visual feedback
        const btn = linkInput.nextElementSibling;
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        }
    }
}

// ===== Download Game =====

function downloadGame() {
    const gameName = document.getElementById('game-name')?.value || 'my-doodle-game';
    const gameType = selectedGameType;
    const difficulty = selectedDifficulty;
    
    // Create a standalone HTML file
    const html = generateGameHTML(gameName, gameType, difficulty);
    
    // Download it
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${gameName.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateGameHTML(name, type, difficulty) {
    const characters = {
        platformer: '🏃',
        flying: '🐉',
        racing: '🚗',
        catching: '🧺'
    };
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Made with DoodlePlay</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        h1 {
            color: white;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        .game-container {
            background: white;
            border-radius: 20px;
            padding: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        canvas {
            display: block;
            border-radius: 10px;
        }
        .hud {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 1.2rem;
            font-weight: bold;
        }
        .controls {
            color: white;
            margin-top: 15px;
            text-align: center;
            opacity: 0.8;
        }
        .btn {
            background: white;
            border: none;
            padding: 10px 25px;
            border-radius: 25px;
            font-size: 1rem;
            cursor: pointer;
            margin-top: 15px;
        }
        .btn:hover { transform: scale(1.05); }
        .credit {
            color: white;
            margin-top: 20px;
            opacity: 0.7;
            font-size: 0.9rem;
        }
        .credit a { color: white; }
    </style>
</head>
<body>
    <h1>🎮 ${name}</h1>
    <div class="game-container">
        <div class="hud">
            <span>Score: <span id="score">0</span></span>
            <span id="lives">❤️❤️❤️</span>
        </div>
        <canvas id="game" width="600" height="400"></canvas>
    </div>
    <p class="controls">
        ${type === 'catching' ? '← → to move' : type === 'racing' ? '↑ ↓ to change lanes' : '← → to move, SPACE to jump/fly'}
    </p>
    <button class="btn" onclick="game.start()">Restart</button>
    <p class="credit">Made with ❤️ using <a href="https://doodleplay.app">DoodlePlay</a></p>
    
    <script>
    // Embedded mini game engine
    class MiniGame {
        constructor(id, opts) {
            this.canvas = document.getElementById(id);
            this.ctx = this.canvas.getContext('2d');
            this.w = this.canvas.width;
            this.h = this.canvas.height;
            this.type = opts.type;
            this.diff = opts.difficulty;
            this.emoji = opts.emoji;
            this.player = {x: 50, y: this.h/2, w: 50, h: 50, vy: 0, vx: 0, jumping: false, lane: 1};
            this.items = [];
            this.obs = [];
            this.score = 0;
            this.lives = 3;
            this.running = false;
            this.keys = {};
            this.settings = {1: {s: 2, r: 0.02, g: 0.3}, 2: {s: 3, r: 0.03, g: 0.4}, 3: {s: 4.5, r: 0.045, g: 0.5}}[this.diff];
            document.addEventListener('keydown', e => { this.keys[e.key] = true; e.preventDefault(); });
            document.addEventListener('keyup', e => { this.keys[e.key] = false; });
        }
        start() {
            this.score = 0; this.lives = 3; this.items = []; this.obs = [];
            this.player.y = this.h/2; this.player.vy = 0; this.player.lane = 1;
            this.running = true; this.loop();
        }
        loop() {
            if (!this.running) return;
            this.update(); this.render();
            requestAnimationFrame(() => this.loop());
        }
        update() {
            const s = this.settings;
            if (this.type === 'flying') {
                this.player.vy += s.g;
                if (this.keys[' ']) this.player.vy = -5;
                if (this.keys['ArrowLeft']) this.player.x -= s.s * 1.5;
                if (this.keys['ArrowRight']) this.player.x += s.s * 1.5;
                this.player.y += this.player.vy;
            } else if (this.type === 'platformer') {
                this.player.vy += s.g * 1.5;
                if (this.keys[' '] && !this.player.jumping) { this.player.vy = -12; this.player.jumping = true; }
                if (this.keys['ArrowLeft']) this.player.vx = -s.s * 2;
                else if (this.keys['ArrowRight']) this.player.vx = s.s * 2;
                else this.player.vx *= 0.8;
                this.player.x += this.player.vx;
                this.player.y += this.player.vy;
                if (this.player.y >= this.h - 110) { this.player.y = this.h - 110; this.player.vy = 0; this.player.jumping = false; }
            } else if (this.type === 'racing') {
                const lanes = [this.h * 0.25, this.h * 0.5, this.h * 0.75];
                if (this.keys['ArrowUp'] && this.player.lane > 0) { this.player.lane--; this.keys['ArrowUp'] = false; }
                if (this.keys['ArrowDown'] && this.player.lane < 2) { this.player.lane++; this.keys['ArrowDown'] = false; }
                this.player.y += (lanes[this.player.lane] - this.player.h/2 - this.player.y) * 0.1;
                this.score += 0.1;
            } else if (this.type === 'catching') {
                if (this.keys['ArrowLeft']) this.player.x -= s.s * 2.5;
                if (this.keys['ArrowRight']) this.player.x += s.s * 2.5;
                this.player.y = this.h - this.player.h - 20;
            }
            this.player.x = Math.max(10, Math.min(this.w - 60, this.player.x));
            this.player.y = Math.max(10, Math.min(this.h - 60, this.player.y));
            if (Math.random() < s.r) this.spawnItem();
            if (Math.random() < s.r * 0.5) this.spawnObs();
            this.items.forEach((i, idx) => {
                if (this.type === 'catching') i.y += s.s; else i.x -= s.s;
                if (i.x < -30 || i.y > this.h + 30) this.items.splice(idx, 1);
            });
            this.obs.forEach((o, idx) => {
                if (this.type === 'catching') o.y += s.s * 1.2; else o.x -= s.s * 1.2;
                if (o.x < -40 || o.y > this.h + 40) this.obs.splice(idx, 1);
            });
            this.checkCollisions();
            document.getElementById('score').textContent = Math.floor(this.score);
            document.getElementById('lives').textContent = '❤️'.repeat(Math.max(0, this.lives));
            if (this.score >= 100) { this.running = false; setTimeout(() => alert('🎉 You Win! Score: ' + Math.floor(this.score)), 100); }
        }
        spawnItem() {
            const emojis = ['⭐', '💎', '🌟'];
            if (this.type === 'catching') {
                this.items.push({x: Math.random() * (this.w - 30), y: -30, s: 25, e: emojis[Math.floor(Math.random() * 3)]});
            } else {
                this.items.push({x: this.w, y: Math.random() * (this.h - 80) + 30, s: 25, e: emojis[Math.floor(Math.random() * 3)]});
            }
        }
        spawnObs() {
            if (this.type === 'catching') {
                this.obs.push({x: Math.random() * (this.w - 30), y: -30, w: 30, h: 30, e: '💣'});
            } else if (this.type === 'racing') {
                const lanes = [this.h * 0.25, this.h * 0.5, this.h * 0.75];
                this.obs.push({x: this.w, y: lanes[Math.floor(Math.random() * 3)] - 25, w: 40, h: 50, e: '🚗'});
            } else {
                this.obs.push({x: this.w, y: Math.random() * (this.h - 80) + 30, w: 35, h: 35, e: '🌵'});
            }
        }
        checkCollisions() {
            const p = this.player;
            this.items = this.items.filter(i => {
                if (p.x < i.x + i.s && p.x + p.w > i.x && p.y < i.y + i.s && p.y + p.h > i.y) {
                    this.score += i.e === '💎' ? 5 : 1;
                    return false;
                }
                return true;
            });
            this.obs = this.obs.filter(o => {
                if (p.x + 5 < o.x + o.w && p.x + p.w - 5 > o.x && p.y + 5 < o.y + o.h && p.y + p.h - 5 > o.y) {
                    this.lives--;
                    if (this.lives <= 0) { this.running = false; setTimeout(() => alert('Game Over! Score: ' + Math.floor(this.score)), 100); }
                    return false;
                }
                return true;
            });
        }
        render() {
            const c = this.ctx;
            const grad = c.createLinearGradient(0, 0, 0, this.h);
            if (this.type === 'flying') { grad.addColorStop(0, '#87CEEB'); grad.addColorStop(1, '#98FB98'); }
            else if (this.type === 'platformer') { grad.addColorStop(0, '#FFE4B5'); grad.addColorStop(1, '#FFA07A'); }
            else if (this.type === 'racing') { grad.addColorStop(0, '#2C3E50'); grad.addColorStop(1, '#3498DB'); }
            else { grad.addColorStop(0, '#E8D5B7'); grad.addColorStop(1, '#F5DEB3'); }
            c.fillStyle = grad; c.fillRect(0, 0, this.w, this.h);
            if (this.type === 'platformer') {
                c.fillStyle = '#7CB342'; c.fillRect(0, this.h - 60, this.w, 60);
            }
            if (this.type === 'racing') {
                c.fillStyle = '#555'; c.fillRect(0, 0, this.w, this.h);
                c.strokeStyle = '#FFD700'; c.lineWidth = 3; c.setLineDash([30, 20]);
                [1, 2].forEach(i => { c.beginPath(); c.moveTo(0, this.h/3 * i); c.lineTo(this.w, this.h/3 * i); c.stroke(); });
                c.setLineDash([]);
            }
            this.items.forEach(i => { c.font = i.s + 'px Arial'; c.textAlign = 'center'; c.fillText(i.e, i.x + i.s/2, i.y + i.s/2 + 8); });
            this.obs.forEach(o => { c.font = Math.max(o.w, o.h) + 'px Arial'; c.textAlign = 'center'; c.fillText(o.e, o.x + o.w/2, o.y + o.h/2 + 10); });
            c.font = this.player.w + 'px Arial'; c.textAlign = 'center'; c.fillText(this.emoji, this.player.x + this.player.w/2, this.player.y + this.player.h/2 + 15);
        }
    }
    const game = new MiniGame('game', { type: '${type}', difficulty: ${difficulty}, emoji: '${characters[type]}' });
    game.start();
    </script>
</body>
</html>`;
}

// ===== Helper Functions =====

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function showGameOverlay(gameId, overlayId) {
    const overlay = document.getElementById(overlayId);
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

// ===== Mobile Menu =====

function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });
    }
}

// ===== Easter Egg: Konami Code =====

function initKonamiCode() {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    
    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            
            if (konamiIndex === konamiCode.length) {
                activateKonamiEasterEgg();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
}

function activateKonamiEasterEgg() {
    // Fun confetti-like effect
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#60A5FA'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * 100}vw;
            top: -10px;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
            pointer-events: none;
            z-index: 9999;
            animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
        `;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 4000);
    }
    
    // Add animation style
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = `
            @keyframes confettiFall {
                to {
                    top: 100vh;
                    transform: rotate(${Math.random() * 720}deg);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('🎉 Konami Code activated! You found the secret!');
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('share-modal');
    if (e.target === modal) {
        closeShareModal();
    }
});

// Prevent scroll when modal is open
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeShareModal();
    }
});
