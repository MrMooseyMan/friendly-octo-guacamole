/**
 * DoodlePlay Game Engine
 * A simple 2D Canvas-based game engine for turning drawings into games
 */

class GameEngine {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas with id "${canvasId}" not found`);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game options
        this.options = {
            gameType: options.gameType || 'flying',
            difficulty: options.difficulty || 2,
            characterEmoji: options.characterEmoji || '🐉',
            characterImage: options.characterImage || null,
            onScoreUpdate: options.onScoreUpdate || null,
            onLivesUpdate: options.onLivesUpdate || null,
            onGameOver: options.onGameOver || null,
            onWin: options.onWin || null,
            ...options
        };
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.lives = 3;
        this.gameTime = 0;
        
        // Player
        this.player = {
            x: 50,
            y: this.height / 2,
            width: 50,
            height: 50,
            velocityX: 0,
            velocityY: 0,
            isJumping: false,
            isFlying: false
        };
        
        // Game objects
        this.collectibles = [];
        this.obstacles = [];
        this.particles = [];
        this.clouds = [];
        
        // Input state
        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false,
            space: false
        };
        
        // Difficulty settings
        this.difficultySettings = {
            1: { speed: 2, spawnRate: 0.02, gravity: 0.3 },
            2: { speed: 3, spawnRate: 0.03, gravity: 0.4 },
            3: { speed: 4.5, spawnRate: 0.045, gravity: 0.5 }
        };
        
        this.settings = this.difficultySettings[this.options.difficulty];
        
        // Animation
        this.animationFrame = null;
        this.lastTime = 0;
        
        // Initialize
        this.initClouds();
        this.bindEvents();
    }
    
    // Initialize background clouds
    initClouds() {
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.width,
                y: Math.random() * (this.height * 0.4),
                size: 30 + Math.random() * 40,
                speed: 0.3 + Math.random() * 0.5
            });
        }
    }
    
    // Bind keyboard and touch events
    bindEvents() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    }
    
    handleKeyDown(e) {
        if (!this.isRunning) return;
        
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
                this.keys.left = true;
                e.preventDefault();
                break;
            case 'ArrowRight':
            case 'd':
                this.keys.right = true;
                e.preventDefault();
                break;
            case 'ArrowUp':
            case 'w':
                this.keys.up = true;
                e.preventDefault();
                break;
            case 'ArrowDown':
            case 's':
                this.keys.down = true;
                e.preventDefault();
                break;
            case ' ':
                this.keys.space = true;
                e.preventDefault();
                break;
        }
    }
    
    handleKeyUp(e) {
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
                this.keys.left = false;
                break;
            case 'ArrowRight':
            case 'd':
                this.keys.right = false;
                break;
            case 'ArrowUp':
            case 'w':
                this.keys.up = false;
                break;
            case 'ArrowDown':
            case 's':
                this.keys.down = false;
                break;
            case ' ':
                this.keys.space = false;
                break;
        }
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        
        if (x < this.width / 3) {
            this.keys.left = true;
        } else if (x > this.width * 2 / 3) {
            this.keys.right = true;
        } else {
            this.keys.space = true;
        }
    }
    
    handleTouchEnd(e) {
        this.keys.left = false;
        this.keys.right = false;
        this.keys.space = false;
    }
    
    handleTouchMove(e) {
        e.preventDefault();
    }
    
    // Start the game
    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.score = 0;
        this.lives = 3;
        this.gameTime = 0;
        
        this.player.x = 50;
        this.player.y = this.height / 2;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        
        this.collectibles = [];
        this.obstacles = [];
        this.particles = [];
        
        this.updateUI();
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    // Stop the game
    stop() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
    
    // Pause/unpause
    togglePause() {
        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }
    
    // Main game loop
    gameLoop(currentTime = performance.now()) {
        if (!this.isRunning || this.isPaused) return;
        
        const deltaTime = (currentTime - this.lastTime) / 16.67; // Normalize to ~60fps
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        this.animationFrame = requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    // Update game state
    update(dt) {
        this.gameTime += dt;
        
        // Update based on game type
        switch(this.options.gameType) {
            case 'flying':
                this.updateFlyingGame(dt);
                break;
            case 'platformer':
                this.updatePlatformerGame(dt);
                break;
            case 'racing':
                this.updateRacingGame(dt);
                break;
            case 'catching':
                this.updateCatchingGame(dt);
                break;
        }
        
        // Update particles
        this.updateParticles(dt);
        
        // Update clouds
        this.updateClouds(dt);
        
        // Check win condition
        if (this.score >= 100) {
            this.win();
        }
    }
    
    // Flying game mechanics
    updateFlyingGame(dt) {
        const speed = this.settings.speed;
        const gravity = this.settings.gravity;
        
        // Apply gravity
        this.player.velocityY += gravity * dt;
        
        // Fly up when space is pressed
        if (this.keys.space) {
            this.player.velocityY = -5;
            this.player.isFlying = true;
            this.spawnFlyingParticles();
        } else {
            this.player.isFlying = false;
        }
        
        // Horizontal movement
        if (this.keys.left) {
            this.player.x -= speed * 1.5 * dt;
        }
        if (this.keys.right) {
            this.player.x += speed * 1.5 * dt;
        }
        
        // Apply velocity
        this.player.y += this.player.velocityY * dt;
        
        // Keep player in bounds
        this.player.x = Math.max(10, Math.min(this.width - this.player.width - 10, this.player.x));
        this.player.y = Math.max(10, Math.min(this.height - this.player.height - 10, this.player.y));
        
        // Spawn collectibles
        if (Math.random() < this.settings.spawnRate * dt) {
            this.spawnCollectible();
        }
        
        // Spawn obstacles
        if (Math.random() < this.settings.spawnRate * 0.5 * dt) {
            this.spawnObstacle();
        }
        
        // Update collectibles
        this.collectibles.forEach((c, i) => {
            c.x -= speed * dt;
            if (c.x + c.size < 0) {
                this.collectibles.splice(i, 1);
            }
        });
        
        // Update obstacles
        this.obstacles.forEach((o, i) => {
            o.x -= speed * 1.2 * dt;
            if (o.x + o.width < 0) {
                this.obstacles.splice(i, 1);
            }
        });
        
        // Check collisions
        this.checkCollisions();
    }
    
    // Platformer game mechanics
    updatePlatformerGame(dt) {
        const speed = this.settings.speed;
        const gravity = this.settings.gravity * 1.5;
        const groundY = this.height - 60;
        
        // Apply gravity
        this.player.velocityY += gravity * dt;
        
        // Jump when space is pressed
        if (this.keys.space && !this.player.isJumping) {
            this.player.velocityY = -12;
            this.player.isJumping = true;
            this.spawnJumpParticles();
        }
        
        // Horizontal movement
        if (this.keys.left) {
            this.player.velocityX = -speed * 2;
        } else if (this.keys.right) {
            this.player.velocityX = speed * 2;
        } else {
            this.player.velocityX *= 0.8;
        }
        
        // Apply velocity
        this.player.x += this.player.velocityX * dt;
        this.player.y += this.player.velocityY * dt;
        
        // Ground collision
        if (this.player.y >= groundY - this.player.height) {
            this.player.y = groundY - this.player.height;
            this.player.velocityY = 0;
            this.player.isJumping = false;
        }
        
        // Keep player in horizontal bounds
        this.player.x = Math.max(10, Math.min(this.width - this.player.width - 10, this.player.x));
        
        // Spawn collectibles
        if (Math.random() < this.settings.spawnRate * dt) {
            this.spawnCollectible(true);
        }
        
        // Update collectibles
        this.collectibles.forEach((c, i) => {
            c.x -= speed * 0.8 * dt;
            if (c.x + c.size < 0) {
                this.collectibles.splice(i, 1);
            }
        });
        
        // Check collisions
        this.checkCollisions();
    }
    
    // Racing game mechanics
    updateRacingGame(dt) {
        const speed = this.settings.speed;
        const lanes = [this.height * 0.25, this.height * 0.5, this.height * 0.75];
        
        // Change lanes
        if (this.keys.up && this.player.targetLane > 0) {
            this.player.targetLane--;
            this.keys.up = false;
        }
        if (this.keys.down && this.player.targetLane < 2) {
            this.player.targetLane++;
            this.keys.down = false;
        }
        
        if (this.player.targetLane === undefined) {
            this.player.targetLane = 1;
        }
        
        // Smooth lane transition
        const targetY = lanes[this.player.targetLane] - this.player.height / 2;
        this.player.y += (targetY - this.player.y) * 0.1 * dt;
        
        // Score over time for racing
        this.score += 0.1 * dt;
        this.updateUI();
        
        // Spawn obstacles
        if (Math.random() < this.settings.spawnRate * dt) {
            const lane = Math.floor(Math.random() * 3);
            this.obstacles.push({
                x: this.width,
                y: lanes[lane] - 25,
                width: 40,
                height: 50,
                emoji: '🚗'
            });
        }
        
        // Spawn collectibles
        if (Math.random() < this.settings.spawnRate * 0.5 * dt) {
            const lane = Math.floor(Math.random() * 3);
            this.collectibles.push({
                x: this.width,
                y: lanes[lane] - 15,
                size: 30,
                emoji: '⭐'
            });
        }
        
        // Update objects
        this.collectibles.forEach((c, i) => {
            c.x -= speed * 1.5 * dt;
            if (c.x + c.size < 0) {
                this.collectibles.splice(i, 1);
            }
        });
        
        this.obstacles.forEach((o, i) => {
            o.x -= speed * 2 * dt;
            if (o.x + o.width < 0) {
                this.obstacles.splice(i, 1);
            }
        });
        
        // Check collisions
        this.checkCollisions();
    }
    
    // Catching game mechanics
    updateCatchingGame(dt) {
        const speed = this.settings.speed;
        
        // Move player with arrow keys
        if (this.keys.left) {
            this.player.x -= speed * 2.5 * dt;
        }
        if (this.keys.right) {
            this.player.x += speed * 2.5 * dt;
        }
        
        // Keep player at bottom
        this.player.y = this.height - this.player.height - 20;
        
        // Keep player in bounds
        this.player.x = Math.max(10, Math.min(this.width - this.player.width - 10, this.player.x));
        
        // Spawn falling collectibles
        if (Math.random() < this.settings.spawnRate * 1.5 * dt) {
            this.collectibles.push({
                x: Math.random() * (this.width - 30) + 15,
                y: -30,
                size: 30,
                velocityY: speed * 0.8,
                emoji: Math.random() > 0.3 ? '⭐' : '💎'
            });
        }
        
        // Spawn bad items occasionally
        if (Math.random() < this.settings.spawnRate * 0.3 * dt) {
            this.obstacles.push({
                x: Math.random() * (this.width - 30) + 15,
                y: -30,
                width: 30,
                height: 30,
                velocityY: speed * 1.2,
                emoji: '💣'
            });
        }
        
        // Update collectibles
        this.collectibles.forEach((c, i) => {
            c.y += c.velocityY * dt;
            if (c.y > this.height + c.size) {
                this.collectibles.splice(i, 1);
            }
        });
        
        // Update obstacles
        this.obstacles.forEach((o, i) => {
            o.y += o.velocityY * dt;
            if (o.y > this.height + o.height) {
                this.obstacles.splice(i, 1);
            }
        });
        
        // Check collisions
        this.checkCollisions();
    }
    
    // Spawn a collectible
    spawnCollectible(forPlatformer = false) {
        const emojis = ['⭐', '💎', '🌟', '✨', '🍎', '🍊'];
        let y;
        
        if (forPlatformer) {
            y = this.height - 80 - Math.random() * 120;
        } else {
            y = Math.random() * (this.height - 60) + 30;
        }
        
        this.collectibles.push({
            x: this.width + 20,
            y: y,
            size: 25,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            rotation: 0
        });
    }
    
    // Spawn an obstacle
    spawnObstacle() {
        const types = [
            { emoji: '🌵', width: 30, height: 50 },
            { emoji: '🪨', width: 40, height: 30 },
            { emoji: '☁️', width: 50, height: 35 }
        ];
        const type = types[Math.floor(Math.random() * types.length)];
        
        this.obstacles.push({
            x: this.width + 20,
            y: Math.random() * (this.height - type.height - 40) + 20,
            ...type
        });
    }
    
    // Check collisions between player and objects
    checkCollisions() {
        const px = this.player.x;
        const py = this.player.y;
        const pw = this.player.width;
        const ph = this.player.height;
        
        // Check collectible collisions
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const c = this.collectibles[i];
            if (this.isColliding(px, py, pw, ph, c.x, c.y, c.size, c.size)) {
                this.collectibles.splice(i, 1);
                this.score += c.emoji === '💎' ? 5 : 1;
                this.spawnCollectionParticles(c.x + c.size / 2, c.y + c.size / 2);
                this.updateUI();
            }
        }
        
        // Check obstacle collisions
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const o = this.obstacles[i];
            if (this.isColliding(px, py, pw, ph, o.x, o.y, o.width, o.height)) {
                this.obstacles.splice(i, 1);
                this.lives--;
                this.spawnHitParticles(o.x + o.width / 2, o.y + o.height / 2);
                this.updateUI();
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        }
    }
    
    // Simple AABB collision detection
    isColliding(x1, y1, w1, h1, x2, y2, w2, h2) {
        const padding = 5;
        return x1 + padding < x2 + w2 &&
               x1 + w1 - padding > x2 &&
               y1 + padding < y2 + h2 &&
               y1 + h1 - padding > y2;
    }
    
    // Particle effects
    spawnFlyingParticles() {
        for (let i = 0; i < 2; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height,
                size: 5 + Math.random() * 5,
                velocityX: -1 - Math.random() * 2,
                velocityY: 1 + Math.random() * 2,
                life: 1,
                decay: 0.05,
                color: `hsl(${Math.random() * 60 + 20}, 100%, 70%)`
            });
        }
    }
    
    spawnJumpParticles() {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: this.player.x + Math.random() * this.player.width,
                y: this.player.y + this.player.height,
                size: 4 + Math.random() * 4,
                velocityX: (Math.random() - 0.5) * 4,
                velocityY: Math.random() * 2,
                life: 1,
                decay: 0.08,
                color: '#D4A574'
            });
        }
    }
    
    spawnCollectionParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            this.particles.push({
                x: x,
                y: y,
                size: 6,
                velocityX: Math.cos(angle) * 3,
                velocityY: Math.sin(angle) * 3,
                life: 1,
                decay: 0.06,
                color: `hsl(${50 + Math.random() * 20}, 100%, 60%)`
            });
        }
    }
    
    spawnHitParticles(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                size: 8,
                velocityX: (Math.random() - 0.5) * 8,
                velocityY: (Math.random() - 0.5) * 8,
                life: 1,
                decay: 0.04,
                color: `hsl(${Math.random() * 30}, 100%, 50%)`
            });
        }
    }
    
    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.velocityX * dt;
            p.y += p.velocityY * dt;
            p.life -= p.decay * dt;
            p.size *= 0.98;
            
            if (p.life <= 0 || p.size < 0.5) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateClouds(dt) {
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed * dt;
            if (cloud.x + cloud.size < 0) {
                cloud.x = this.width + cloud.size;
                cloud.y = Math.random() * (this.height * 0.4);
            }
        });
    }
    
    // Rendering
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw clouds
        this.drawClouds();
        
        // Draw ground for platformer
        if (this.options.gameType === 'platformer') {
            this.drawGround();
        }
        
        // Draw racing lanes
        if (this.options.gameType === 'racing') {
            this.drawRacingLanes();
        }
        
        // Draw collectibles
        this.drawCollectibles();
        
        // Draw obstacles
        this.drawObstacles();
        
        // Draw particles
        this.drawParticles();
        
        // Draw player
        this.drawPlayer();
    }
    
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        
        switch(this.options.gameType) {
            case 'flying':
                gradient.addColorStop(0, '#87CEEB');
                gradient.addColorStop(1, '#98FB98');
                break;
            case 'platformer':
                gradient.addColorStop(0, '#FFE4B5');
                gradient.addColorStop(1, '#FFA07A');
                break;
            case 'racing':
                gradient.addColorStop(0, '#2C3E50');
                gradient.addColorStop(1, '#3498DB');
                break;
            case 'catching':
                gradient.addColorStop(0, '#E8D5B7');
                gradient.addColorStop(1, '#F5DEB3');
                break;
            default:
                gradient.addColorStop(0, '#87CEEB');
                gradient.addColorStop(1, '#98FB98');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.clouds.forEach(cloud => {
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.size * 0.4, cloud.y - cloud.size * 0.1, cloud.size * 0.4, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.size * 0.8, cloud.y, cloud.size * 0.45, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawGround() {
        const groundY = this.height - 60;
        
        // Grass
        this.ctx.fillStyle = '#7CB342';
        this.ctx.fillRect(0, groundY, this.width, 60);
        
        // Grass texture
        this.ctx.fillStyle = '#8BC34A';
        for (let x = 0; x < this.width; x += 15) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, groundY);
            this.ctx.lineTo(x + 5, groundY - 10);
            this.ctx.lineTo(x + 10, groundY);
            this.ctx.fill();
        }
        
        // Dirt
        this.ctx.fillStyle = '#8D6E63';
        this.ctx.fillRect(0, groundY + 20, this.width, 40);
    }
    
    drawRacingLanes() {
        const laneHeight = this.height / 3;
        
        // Road
        this.ctx.fillStyle = '#555';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Lane dividers
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([30, 20]);
        
        for (let i = 1; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, laneHeight * i);
            this.ctx.lineTo(this.width, laneHeight * i);
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
    }
    
    drawCollectibles() {
        this.collectibles.forEach(c => {
            this.ctx.font = `${c.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Floating animation
            const floatY = Math.sin(this.gameTime * 0.1 + c.x * 0.01) * 3;
            
            this.ctx.save();
            this.ctx.translate(c.x + c.size / 2, c.y + c.size / 2 + floatY);
            this.ctx.rotate(Math.sin(this.gameTime * 0.05) * 0.1);
            this.ctx.fillText(c.emoji, 0, 0);
            this.ctx.restore();
        });
    }
    
    drawObstacles() {
        this.obstacles.forEach(o => {
            const size = Math.max(o.width, o.height);
            this.ctx.font = `${size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(o.emoji, o.x + o.width / 2, o.y + o.height / 2);
        });
    }
    
    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }
    
    drawPlayer() {
        const { x, y, width, height } = this.player;
        
        // Draw character
        if (this.options.characterImage) {
            this.ctx.drawImage(this.options.characterImage, x, y, width, height);
        } else {
            this.ctx.font = `${width}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Add bounce effect when flying
            let offsetY = 0;
            if (this.player.isFlying) {
                offsetY = Math.sin(this.gameTime * 0.3) * 3;
            }
            
            this.ctx.fillText(
                this.options.characterEmoji,
                x + width / 2,
                y + height / 2 + offsetY
            );
        }
    }
    
    // Update score/lives display
    updateUI() {
        if (this.options.onScoreUpdate) {
            this.options.onScoreUpdate(Math.floor(this.score));
        }
        if (this.options.onLivesUpdate) {
            this.options.onLivesUpdate(this.lives);
        }
    }
    
    // Game over
    gameOver() {
        this.stop();
        if (this.options.onGameOver) {
            this.options.onGameOver(this.score);
        }
    }
    
    // Win
    win() {
        this.stop();
        if (this.options.onWin) {
            this.options.onWin(this.score);
        }
    }
    
    // Resize canvas
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
    }
}

// Export for use in modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}
