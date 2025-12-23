const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let fireworks = [];
let particles = [];

// Utility functions
function random(min, max) {
    return Math.random() * (max - min) + min;
}

function calculateDistance(x1, y1, x2, y2) {
    const xDistance = x1 - x2;
    const yDistance = y1 - y2;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

// Setup
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Mouse coordinates
let mouseX, mouseY;
let isMouseDown = false;

function handleInteraction(x, y) {
    launchFirework(x, y);
}

canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isMouseDown = true;
    handleInteraction(e.clientX, e.clientY);
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isMouseDown = true;
    handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
});

canvas.addEventListener('mouseup', () => isMouseDown = false);
canvas.addEventListener('touchend', () => isMouseDown = false);

class Firework {
    constructor(tx, ty) {
        this.x = random(width * 0.1, width * 0.9);
        this.y = height;
        this.sx = this.x;
        this.sy = this.y;
        this.tx = tx;
        this.ty = ty;
        this.distanceToTarget = calculateDistance(this.sx, this.sy, this.tx, this.ty);
        this.distanceTraveled = 0;
        
        // Calculate angle and velocity
        const angle = Math.atan2(this.ty - this.y, this.tx - this.x);
        this.vx = Math.cos(angle) * 15; // Increased speed
        this.vy = Math.sin(angle) * 15;
        
        this.hue = random(0, 360);
        this.brightness = random(50, 70);
        this.coordinates = [];
        this.coordinateCount = 3;
        
        // Populate initial coordinates for trail
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.coordinateCount = 3; // Reset for update loop
    }

    update(index) {
        // Remove last coordinate
        this.coordinates.pop();
        // Add current coordinate
        this.coordinates.unshift([this.x, this.y]);

        // Speed up simulation
        this.vx *= 0.98; // Air resistance
        this.vy *= 0.98;
        this.vy += 0.05; // Gravity
        
        this.x += this.vx;
        this.y += this.vy;
        
        this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x, this.y);
        
        // Check if we reached target or started falling
        const distanceToTargetCurrent = calculateDistance(this.x, this.y, this.tx, this.ty);
        
        // Explode if close to target OR if vertical velocity becomes positive (falling)
        if (distanceToTargetCurrent < 50 || (this.vy >= 0 && this.distanceTraveled > 100)) {
            createParticles(this.x, this.y, this.hue);
            fireworks.splice(index, 1);
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
        ctx.stroke();
    }
}

class Particle {
    constructor(x, y, hue) {
        this.x = x;
        this.y = y;
        this.coordinates = [];
        this.coordinateCount = 5;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        
        const angle = random(0, Math.PI * 2);
        const speed = random(1, 15);
        
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        
        this.friction = 0.95;
        this.gravity = 0.8;
        
        this.hue = random(hue - 20, hue + 20);
        this.brightness = random(50, 80);
        this.alpha = 1;
        this.decay = random(0.015, 0.03);
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        
        this.x += this.vx;
        this.y += this.vy;
        
        this.alpha -= this.decay;
        
        if (this.alpha <= this.decay) {
            particles.splice(index, 1);
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
        ctx.stroke();
    }
}

function createParticles(x, y, hue) {
    const particleCount = 100; 
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(x, y, hue));
    }
}

function launchFirework(tx, ty) {
    fireworks.push(new Firework(tx, ty));
}

function loop() {
    requestAnimationFrame(loop);
    
    // Trail effect
    // We use destination-out to fade existing canvas content
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, width, height);
    
    ctx.globalCompositeOperation = 'lighter';
    
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }
    
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].draw();
        particles[i].update(i);
    }
    
    // Auto launch
    if (Math.random() < 0.05) { 
        launchFirework(random(width * 0.1, width * 0.9), random(height * 0.1, height * 0.5));
    }
}

loop();
