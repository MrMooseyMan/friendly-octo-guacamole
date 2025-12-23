/**
 * DoodlePlay Game Engine
 * A simple 2D game engine for turning drawings into playable games
 */

class DoodleGameEngine {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Game options
        this.options = {
            gameType: options.gameType || 'platformer',
            difficulty: options.difficulty || 2,
            playerImage: options.playerImage || null,
            playerEmoji: options.playerEmoji || '🐉',
            backgroundColor: options.backgroundColor || null,
            ...options
        };
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.won = false;
        
        // Player state
        this.player = {
            x: 100,
            y: this.height / 2,
            width: 60,
            height: 60,
            velocityX: 0,
            velocityY: 0,
            isJumping: false,
            isFlying: false
        };
        
        // Game objects
        this.platforms = [];
        this.collectibles = [];
        this.obstacles = [];
        this.particles = [];
        this.clouds = [];
        
        // Input state
        this.keys = {};
        
        // Animation
        this.animationFrame = null;
        this.lastTime = 0;
        this.frameCount = 0;
        
        // Difficulty settings
        this.difficultySettings = {
            1: { speed: 2, spawnRate: 0.02, collectibleValue: 10 },
            2: { speed: 3, spawnRate: 0.03, collectibleValue: 10 },
            3: { speed: 4, spawnRate: 0.04, collectibleValue: 10 }
        };
        
        this.settings = this.difficultySettings[this.options.difficulty];
        
        // Initialize
        this.init();
    }
    
    init() {
        // Setup input handlers
        this.setupInput();
        
        // Generate initial game objects based on game type
        this.generateInitialObjects();
        
        // Generate background clouds
        this.generateClouds();
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Prevent scrolling with arrow keys and space
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Touch controls for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            
            if (x < rect.width / 2) {
                this.keys['ArrowLeft'] = true;
            } else {
                this.keys['ArrowRight'] = true;
            }
            this.keys['Space'] = true;
        });
        
        this.canvas.addEventListener('touchend', () => {
            this.keys['ArrowLeft'] = false;
            this.keys['ArrowRight'] = false;
            this.keys['Space'] = false;
        });
    }
    
    generateClouds() {
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.width,
                y: Math.random() * (this.height * 0.4),
                size: 30 + Math.random() * 40,
                speed: 0.2 + Math.random() * 0.3
            });
        }
    }
    
    generateInitialObjects() {
        switch (this.options.gameType) {
            case 'platformer':
                this.generatePlatforms();
                break;
            case 'flying':
                // Flying games don't need initial platforms
                break;
            case 'racing':
                this.generateRacingTrack();
                break;
            case 'catching':
                // Catching games spawn collectibles dynamically
                break;
        }
    }
    
    generatePlatforms() {
        // Ground platform
        this.platforms.push({
            x: 0,
            y: this.height - 40,
            width: this.width,
            height: 40,
            type: 'ground'
        });
        
        // Floating platforms
        const platformCount = 3;
        for (let i = 0; i < platformCount; i++) {
            this.platforms.push({
                x: 150 + i * 150,
                y: this.height - 120 - Math.random() * 80,
                width: 100,
                height: 20,
                type: 'floating'
            });
        }
    }
    
    generateRacingTrack() {
        // Simple racing track with lanes
        this.player.y = this.height / 2;
        this.player.lanes = [
            this.height * 0.3,
            this.height * 0.5,
            this.height * 0.7
        ];
        this.player.currentLane = 1;
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.gameOver = false;
        this.won = false;
        this.score = 0;
        this.lives = 3;
        
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
    
    restart() {
        this.stop();
        
        // Reset player
        this.player.x = 100;
        this.player.y = this.height / 2;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.player.isJumping = false;
        
        // Clear game objects
        this.collectibles = [];
        this.obstacles = [];
        this.particles = [];
        
        // Regenerate initial objects
        this.platforms = [];
        this.generateInitialObjects();
        
        // Restart
        this.start();
    }
    
    pause() {
        this.isPaused = !this.isPaused;
    }
    
    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;
        
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        if (!this.isPaused) {
            this.update(deltaTime);
        }
        
        this.render();
        
        this.animationFrame = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        if (this.gameOver || this.won) return;
        
        this.frameCount++;
        
        // Update based on game type
        switch (this.options.gameType) {
            case 'platformer':
                this.updatePlatformer(deltaTime);
                break;
            case 'flying':
                this.updateFlying(deltaTime);
                break;
            case 'racing':
                this.updateRacing(deltaTime);
                break;
            case 'catching':
                this.updateCatching(deltaTime);
                break;
        }
        
        // Update collectibles
        this.updateCollectibles();
        
        // Update obstacles
        this.updateObstacles();
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Update clouds
        this.updateClouds();
        
        // Spawn new objects
        this.spawnObjects();
        
        // Check win condition
        if (this.score >= 100) {
            this.won = true;
        }
    }
    
    updatePlatformer(deltaTime) {
        const gravity = 1500;
        const moveSpeed = 300;
        const jumpPower = -500;
        
        // Horizontal movement
        if (this.keys['ArrowLeft']) {
            this.player.velocityX = -moveSpeed;
        } else if (this.keys['ArrowRight']) {
            this.player.velocityX = moveSpeed;
        } else {
            this.player.velocityX *= 0.8;
        }
        
        // Jump
        if (this.keys['Space'] && !this.player.isJumping) {
            this.player.velocityY = jumpPower;
            this.player.isJumping = true;
            this.createJumpParticles();
        }
        
        // Apply gravity
        this.player.velocityY += gravity * deltaTime;
        
        // Update position
        this.player.x += this.player.velocityX * deltaTime;
        this.player.y += this.player.velocityY * deltaTime;
        
        // Platform collision
        for (const platform of this.platforms) {
            if (this.checkCollision(this.player, platform)) {
                if (this.player.velocityY > 0) {
                    this.player.y = platform.y - this.player.height;
                    this.player.velocityY = 0;
                    this.player.isJumping = false;
                }
            }
        }
        
        // Screen boundaries
        this.player.x = Math.max(0, Math.min(this.width - this.player.width, this.player.x));
        
        // Fall off screen
        if (this.player.y > this.height) {
            this.loseLife();
        }
    }
    
    updateFlying(deltaTime) {
        const flySpeed = 200;
        const moveSpeed = 300;
        
        // Vertical movement
        if (this.keys['Space'] || this.keys['ArrowUp']) {
            this.player.velocityY = -flySpeed;
            this.player.isFlying = true;
            
            // Create trail particles when flying up
            if (this.frameCount % 3 === 0) {
                this.createFlyingParticles();
            }
        } else {
            this.player.velocityY += 400 * deltaTime; // Gravity
            this.player.isFlying = false;
        }
        
        // Horizontal movement
        if (this.keys['ArrowLeft']) {
            this.player.velocityX = -moveSpeed;
        } else if (this.keys['ArrowRight']) {
            this.player.velocityX = moveSpeed;
        } else {
            this.player.velocityX *= 0.95;
        }
        
        // Update position
        this.player.x += this.player.velocityX * deltaTime;
        this.player.y += this.player.velocityY * deltaTime;
        
        // Clamp to screen
        this.player.y = Math.max(0, Math.min(this.height - this.player.height, this.player.y));
        this.player.x = Math.max(0, Math.min(this.width - this.player.width, this.player.x));
    }
    
    updateRacing(deltaTime) {
        // Lane switching
        if (this.keys['ArrowUp'] && this.player.currentLane > 0) {
            this.player.currentLane--;
            this.keys['ArrowUp'] = false;
        }
        if (this.keys['ArrowDown'] && this.player.currentLane < 2) {
            this.player.currentLane++;
            this.keys['ArrowDown'] = false;
        }
        
        // Smooth lane transition
        const targetY = this.player.lanes[this.player.currentLane] - this.player.height / 2;
        this.player.y += (targetY - this.player.y) * 0.1;
        
        // Boost
        if (this.keys['Space']) {
            this.settings.speed = this.difficultySettings[this.options.difficulty].speed * 1.5;
            if (this.frameCount % 2 === 0) {
                this.createBoostParticles();
            }
        } else {
            this.settings.speed = this.difficultySettings[this.options.difficulty].speed;
        }
    }
    
    updateCatching(deltaTime) {
        const moveSpeed = 400;
        
        // Horizontal movement
        if (this.keys['ArrowLeft']) {
            this.player.x -= moveSpeed * deltaTime;
        }
        if (this.keys['ArrowRight']) {
            this.player.x += moveSpeed * deltaTime;
        }
        
        // Keep at bottom of screen
        this.player.y = this.height - this.player.height - 20;
        
        // Screen boundaries
        this.player.x = Math.max(0, Math.min(this.width - this.player.width, this.player.x));
    }
    
    updateCollectibles() {
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const collectible = this.collectibles[i];
            
            // Move collectible
            collectible.x -= this.settings.speed;
            
            // Falling collectibles for catching game
            if (this.options.gameType === 'catching') {
                collectible.y += collectible.fallSpeed || 3;
            }
            
            // Animate
            collectible.angle += 0.05;
            collectible.bobOffset = Math.sin(collectible.angle) * 5;
            
            // Check collection
            if (this.checkCollision(this.player, collectible)) {
                this.score += this.settings.collectibleValue;
                this.createCollectParticles(collectible.x, collectible.y);
                this.collectibles.splice(i, 1);
                continue;
            }
            
            // Remove if off screen
            if (collectible.x < -50 || collectible.y > this.height + 50) {
                this.collectibles.splice(i, 1);
            }
        }
    }
    
    updateObstacles() {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            
            // Move obstacle
            obstacle.x -= this.settings.speed;
            
            // Check collision
            if (this.checkCollision(this.player, obstacle)) {
                this.loseLife();
                this.obstacles.splice(i, 1);
                continue;
            }
            
            // Remove if off screen
            if (obstacle.x < -100) {
                this.obstacles.splice(i, 1);
            }
        }
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.velocityX * deltaTime;
            particle.y += particle.velocityY * deltaTime;
            particle.velocityY += 200 * deltaTime; // Gravity
            particle.life -= deltaTime;
            particle.alpha = Math.max(0, particle.life / particle.maxLife);
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateClouds() {
        for (const cloud of this.clouds) {
            cloud.x -= cloud.speed;
            if (cloud.x < -cloud.size) {
                cloud.x = this.width + cloud.size;
                cloud.y = Math.random() * (this.height * 0.4);
            }
        }
    }
    
    spawnObjects() {
        // Spawn collectibles
        if (Math.random() < this.settings.spawnRate) {
            this.spawnCollectible();
        }
        
        // Spawn obstacles
        if (Math.random() < this.settings.spawnRate * 0.5) {
            this.spawnObstacle();
        }
    }
    
    spawnCollectible() {
        const collectible = {
            x: this.width + 20,
            y: 0,
            width: 30,
            height: 30,
            angle: 0,
            bobOffset: 0,
            emoji: ['⭐', '🌟', '💎', '🪙'][Math.floor(Math.random() * 4)]
        };
        
        switch (this.options.gameType) {
            case 'platformer':
                collectible.y = this.height - 80 - Math.random() * 150;
                break;
            case 'flying':
                collectible.y = 50 + Math.random() * (this.height - 100);
                break;
            case 'racing':
                collectible.y = this.player.lanes[Math.floor(Math.random() * 3)] - 15;
                break;
            case 'catching':
                collectible.y = -30;
                collectible.x = Math.random() * (this.width - 50);
                collectible.fallSpeed = 2 + Math.random() * 3;
                break;
        }
        
        this.collectibles.push(collectible);
    }
    
    spawnObstacle() {
        const obstacle = {
            x: this.width + 20,
            y: 0,
            width: 40,
            height: 40,
            emoji: ['🪨', '🌵', '💀', '⚡'][Math.floor(Math.random() * 4)]
        };
        
        switch (this.options.gameType) {
            case 'platformer':
                obstacle.y = this.height - 80;
                break;
            case 'flying':
                obstacle.y = 50 + Math.random() * (this.height - 100);
                break;
            case 'racing':
                obstacle.y = this.player.lanes[Math.floor(Math.random() * 3)] - 20;
                break;
            case 'catching':
                return; // No obstacles in catching game
        }
        
        this.obstacles.push(obstacle);
    }
    
    loseLife() {
        this.lives--;
        this.createHitParticles();
        
        // Reset player position
        this.player.x = 100;
        this.player.y = this.height / 2;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        
        if (this.lives <= 0) {
            this.gameOver = true;
        }
    }
    
    checkCollision(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }
    
    createJumpParticles() {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height,
                velocityX: (Math.random() - 0.5) * 200,
                velocityY: Math.random() * 100,
                size: 5 + Math.random() * 5,
                color: `hsl(${200 + Math.random() * 60}, 70%, 60%)`,
                life: 0.5,
                maxLife: 0.5,
                alpha: 1
            });
        }
    }
    
    createFlyingParticles() {
        this.particles.push({
            x: this.player.x,
            y: this.player.y + this.player.height / 2,
            velocityX: -100 - Math.random() * 50,
            velocityY: (Math.random() - 0.5) * 50,
            size: 4 + Math.random() * 4,
            color: `hsl(${40 + Math.random() * 20}, 100%, 60%)`,
            life: 0.4,
            maxLife: 0.4,
            alpha: 1
        });
    }
    
    createBoostParticles() {
        this.particles.push({
            x: this.player.x,
            y: this.player.y + this.player.height / 2,
            velocityX: -150,
            velocityY: (Math.random() - 0.5) * 30,
            size: 6,
            color: '#FF6B6B',
            life: 0.3,
            maxLife: 0.3,
            alpha: 1
        });
    }
    
    createCollectParticles(x, y) {
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            this.particles.push({
                x: x,
                y: y,
                velocityX: Math.cos(angle) * 150,
                velocityY: Math.sin(angle) * 150,
                size: 4 + Math.random() * 4,
                color: `hsl(${45 + Math.random() * 15}, 100%, 50%)`,
                life: 0.5,
                maxLife: 0.5,
                alpha: 1
            });
        }
    }
    
    createHitParticles() {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height / 2,
                velocityX: (Math.random() - 0.5) * 300,
                velocityY: (Math.random() - 0.5) * 300,
                size: 5 + Math.random() * 8,
                color: `hsl(${0 + Math.random() * 30}, 80%, 50%)`,
                life: 0.6,
                maxLife: 0.6,
                alpha: 1
            });
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw clouds
        this.drawClouds();
        
        // Draw platforms
        this.drawPlatforms();
        
        // Draw collectibles
        this.drawCollectibles();
        
        // Draw obstacles
        this.drawObstacles();
        
        // Draw particles
        this.drawParticles();
        
        // Draw player
        this.drawPlayer();
        
        // Draw UI
        this.drawUI();
        
        // Draw game over or win screen
        if (this.gameOver) {
            this.drawGameOver();
        } else if (this.won) {
            this.drawWin();
        }
    }
    
    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.7, '#E0F7FA');
        gradient.addColorStop(1, '#C8E6C9');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Ground for platformer
        if (this.options.gameType === 'platformer') {
            this.ctx.fillStyle = '#8BC34A';
            this.ctx.fillRect(0, this.height - 40, this.width, 40);
        }
        
        // Racing lanes
        if (this.options.gameType === 'racing') {
            this.ctx.fillStyle = '#607D8B';
            this.ctx.fillRect(0, this.height * 0.2, this.width, this.height * 0.6);
            
            // Lane dividers
            this.ctx.setLineDash([20, 20]);
            this.ctx.strokeStyle = '#FFF';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.height * 0.4);
            this.ctx.lineTo(this.width, this.height * 0.4);
            this.ctx.moveTo(0, this.height * 0.6);
            this.ctx.lineTo(this.width, this.height * 0.6);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }
    
    drawClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        for (const cloud of this.clouds) {
            this.drawCloud(cloud.x, cloud.y, cloud.size);
        }
    }
    
    drawCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.4, y - size * 0.2, size * 0.4, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.8, y, size * 0.45, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.4, y + size * 0.1, size * 0.35, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawPlatforms() {
        for (const platform of this.platforms) {
            if (platform.type === 'ground') continue;
            
            // Platform shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(platform.x + 5, platform.y + 5, platform.width, platform.height);
            
            // Platform
            const gradient = this.ctx.createLinearGradient(
                platform.x, platform.y,
                platform.x, platform.y + platform.height
            );
            gradient.addColorStop(0, '#A5D6A7');
            gradient.addColorStop(1, '#81C784');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.roundRect(platform.x, platform.y, platform.width, platform.height, 8);
            this.ctx.fill();
            
            // Platform top highlight
            this.ctx.fillStyle = '#C8E6C9';
            this.ctx.beginPath();
            this.ctx.roundRect(platform.x, platform.y, platform.width, 5, [8, 8, 0, 0]);
            this.ctx.fill();
        }
    }
    
    drawCollectibles() {
        for (const collectible of this.collectibles) {
            this.ctx.save();
            this.ctx.translate(
                collectible.x + collectible.width / 2,
                collectible.y + collectible.bobOffset + collectible.height / 2
            );
            this.ctx.rotate(Math.sin(collectible.angle * 2) * 0.1);
            
            this.ctx.font = `${collectible.width}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(collectible.emoji, 0, 0);
            
            this.ctx.restore();
        }
    }
    
    drawObstacles() {
        for (const obstacle of this.obstacles) {
            this.ctx.font = `${obstacle.width}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(
                obstacle.emoji,
                obstacle.x + obstacle.width / 2,
                obstacle.y + obstacle.height / 2
            );
        }
    }
    
    drawParticles() {
        for (const particle of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }
    
    drawPlayer() {
        this.ctx.save();
        
        // Apply bob animation for flying
        let bobOffset = 0;
        if (this.options.gameType === 'flying') {
            bobOffset = Math.sin(this.frameCount * 0.1) * 3;
        }
        
        // Tilt when moving
        let tilt = 0;
        if (this.player.velocityX > 50) tilt = 0.1;
        if (this.player.velocityX < -50) tilt = -0.1;
        if (this.player.velocityY < -50) tilt = -0.15;
        
        this.ctx.translate(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height / 2 + bobOffset
        );
        this.ctx.rotate(tilt);
        
        // Draw player image or emoji
        if (this.options.playerImage) {
            this.ctx.drawImage(
                this.options.playerImage,
                -this.player.width / 2,
                -this.player.height / 2,
                this.player.width,
                this.player.height
            );
        } else {
            this.ctx.font = `${this.player.width}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.options.playerEmoji, 0, 0);
        }
        
        this.ctx.restore();
    }
    
    drawUI() {
        // Score
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.beginPath();
        this.ctx.roundRect(10, 10, 120, 40, 10);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 20px Fredoka';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`⭐ ${this.score}`, 25, 30);
        
        // Lives
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.beginPath();
        this.ctx.roundRect(this.width - 100, 10, 90, 40, 10);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('❤️'.repeat(this.lives), this.width - 55, 30);
        
        // Goal indicator
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.beginPath();
        this.ctx.roundRect(this.width / 2 - 60, 10, 120, 25, 8);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '14px Fredoka';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Goal: 100 ⭐`, this.width / 2, 22);
    }
    
    drawGameOver() {
        // Overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Game over text
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.font = 'bold 48px Fredoka';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('Game Over!', this.width / 2, this.height / 2 - 30);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '24px Fredoka';
        this.ctx.fillText(`Score: ${this.score} ⭐`, this.width / 2, this.height / 2 + 20);
        
        this.ctx.font = '18px Fredoka';
        this.ctx.fillStyle = '#AAA';
        this.ctx.fillText('Press SPACE to try again', this.width / 2, this.height / 2 + 60);
        
        // Restart on space
        if (this.keys['Space']) {
            this.keys['Space'] = false;
            this.restart();
        }
    }
    
    drawWin() {
        // Overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Win text
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 48px Fredoka';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🎉 You Win! 🎉', this.width / 2, this.height / 2 - 30);
        
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '24px Fredoka';
        this.ctx.fillText(`Final Score: ${this.score} ⭐`, this.width / 2, this.height / 2 + 20);
        
        this.ctx.font = '18px Fredoka';
        this.ctx.fillStyle = '#AAA';
        this.ctx.fillText('Press SPACE to play again', this.width / 2, this.height / 2 + 60);
        
        // Restart on space
        if (this.keys['Space']) {
            this.keys['Space'] = false;
            this.restart();
        }
    }
    
    // Set player image from uploaded file
    setPlayerImage(imageUrl) {
        const img = new Image();
        img.onload = () => {
            this.options.playerImage = img;
        };
        img.src = imageUrl;
    }
    
    // Update game type
    setGameType(type) {
        this.options.gameType = type;
        this.platforms = [];
        this.generateInitialObjects();
    }
    
    // Update difficulty
    setDifficulty(level) {
        this.options.difficulty = level;
        this.settings = this.difficultySettings[level];
    }
}

// Export for use in app.js
window.DoodleGameEngine = DoodleGameEngine;
