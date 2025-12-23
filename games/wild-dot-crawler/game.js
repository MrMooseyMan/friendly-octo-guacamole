(() => {
  "use strict";

  // --- Configuration ---
  const GRID_W = 6;
  const GRID_H = 6;
  
  const TYPES = {
    SWORD: "sword",
    POTION: "potion",
    SHIELD: "shield",
    COIN: "coin",
    ENEMY: "enemy"
  };

  const COLORS = {
    sword: "#f43f5e",
    potion: "#34d399",
    shield: "#3b82f6",
    coin: "#fbbf24",
    enemy: "#a855f7",
    bg: "#1e293b",
    line: "#ffffff"
  };

  const ICONS = {
    sword: "⚔️",
    potion: "♥",
    shield: "🛡️",
    coin: "🪙",
    enemy: "💀"
  };

  // --- State ---
  const state = {
    grid: [], 
    selection: [], 
    isDragging: false,
    
    hp: 10,
    maxHp: 10,
    shield: 0,
    score: 0,
    bestScore: Number(localStorage.getItem("wildDot.best")) || 0,
    
    turn: 0,
    difficulty: 1,

    surge: 0,
    maxSurge: 100,

    animating: false,
    particles: [],
    shake: 0,
  };

  // --- DOM ---
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  
  const ui = {
    hp: document.getElementById("hpText"),
    shield: document.getElementById("shieldText"),
    score: document.getElementById("scoreText"),
    best: document.getElementById("bestText"),
    surgeBar: document.getElementById("surgeBar"),
    surgeBtn: document.getElementById("surgeBtn"),
    preview: document.getElementById("actionPreview"),
    previewText: document.getElementById("actionText"),
    overlay: document.getElementById("overlay"),
    overlayTitle: document.getElementById("overlayTitle"),
    overlayMsg: document.getElementById("overlayMessage"),
  };

  // --- Audio ---
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function playTone(freq, type = "sine", duration = 0.1) {
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }

  function playSound(effect) {
    if (effect === "connect") playTone(400 + state.selection.length * 50, "sine", 0.05);
    if (effect === "attack") playTone(150, "square", 0.1);
    if (effect === "heal") playTone(600, "triangle", 0.15);
    if (effect === "coin") playTone(800, "sine", 0.1);
    if (effect === "shield") playTone(300, "sawtooth", 0.1);
    if (effect === "surge") {
      playTone(200, "square", 0.3);
      setTimeout(() => playTone(400, "square", 0.3), 100);
      setTimeout(() => playTone(600, "square", 0.3), 200);
    }
    if (effect === "enemy_hit") playTone(100, "sawtooth", 0.1);
  }

  // --- Logic ---

  function init() {
    resize();
    window.addEventListener("resize", resize);
    
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    
    document.getElementById("startBtn").addEventListener("click", newGame);
    document.getElementById("newBtn").addEventListener("click", newGame);
    document.getElementById("helpBtn").addEventListener("click", () => showOverlay("help"));
    document.getElementById("closeHelpBtn").addEventListener("click", () => showOverlay(null));
    ui.surgeBtn.addEventListener("click", activateSurge);

    requestAnimationFrame(loop);
    showOverlay("help");
  }

  function newGame() {
    state.hp = 10;
    state.maxHp = 10;
    state.shield = 0;
    state.score = 0;
    state.turn = 0;
    state.difficulty = 1;
    state.surge = 0;
    state.selection = [];
    state.isDragging = false;
    state.particles = [];
    state.shake = 0;
    
    generateGrid(true);
    updateUI();
    showOverlay(null);
  }

  function generateGrid(full = false) {
    if (full) state.grid = [];
    
    for (let x = 0; x < GRID_W; x++) {
      if (!state.grid[x]) state.grid[x] = [];
      for (let y = 0; y < GRID_H; y++) {
        if (!state.grid[x][y]) {
          state.grid[x][y] = spawnTile(x, y);
        }
      }
    }
  }

  function spawnTile(x, y) {
    const r = Math.random();
    let type = TYPES.SWORD;
    
    // Adjustable probabilities
    if (r < 0.25) type = TYPES.SWORD;
    else if (r < 0.45) type = TYPES.POTION;
    else if (r < 0.65) type = TYPES.SHIELD;
    else if (r < 0.85) type = TYPES.COIN;
    else type = TYPES.ENEMY;

    const hp = type === TYPES.ENEMY ? Math.floor(1 + state.difficulty * 0.5 + Math.random() * 2) : 0;
    const val = type === TYPES.ENEMY ? Math.ceil(hp / 2) : 1;

    return {
      type,
      x, 
      y, 
      val,
      hp,
      maxHp: hp,
      id: Math.random().toString(36)
    };
  }

  function getTile(x, y) {
    if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) return null;
    return state.grid[x][y];
  }

  // --- Interaction ---

  function getGridPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    // Coordinates in CSS pixels relative to canvas top-left
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const logicalWidth = canvas.width / scale;
    const ts = getTileSize();
    const boardSize = ts * GRID_W;
    
    const padX = (logicalWidth - boardSize) / 2;
    const padY = (logicalWidth - boardSize) / 2;

    const gx = Math.floor((x - padX) / ts);
    const gy = Math.floor((y - padY) / ts);
    return { x: gx, y: gy };
  }

  function onPointerDown(e) {
    if (state.animating || ui.overlay.classList.contains("open")) return;
    state.isDragging = true;
    state.selection = [];
    
    const p = getGridPos(e);
    const tile = getTile(p.x, p.y);
    if (tile) {
      // Capture pointer for smooth drag outside canvas if needed
      canvas.setPointerCapture(e.pointerId);
      addToSelection(p.x, p.y);
    }
  }

  function onPointerMove(e) {
    if (!state.isDragging) return;
    const p = getGridPos(e);
    const tile = getTile(p.x, p.y);
    if (!tile) return;

    const last = state.selection[state.selection.length - 1];
    if (last && last.x === p.x && last.y === p.y) return;

    // Check backtrack
    const index = state.selection.findIndex(s => s.x === p.x && s.y === p.y);
    if (index !== -1) {
      if (index === state.selection.length - 2) {
        state.selection.pop();
        playSound("connect");
        updatePreview();
      }
      return;
    }

    if (last) {
      const dx = Math.abs(p.x - last.x);
      const dy = Math.abs(p.y - last.y);
      // Allow diagonals (Chebyshev distance = 1)
      if (Math.max(dx, dy) !== 1) return;
    }

    if (canConnect(last, tile)) {
      addToSelection(p.x, p.y);
    }
  }

  function canConnect(lastPos, tile) {
    if (!lastPos) return true;
    const lastTile = getTile(lastPos.x, lastPos.y);
    
    if (lastTile.type === tile.type) return true;

    // Sword <-> Enemy mixing
    const mixed = (t1, t2) => (t1 === TYPES.SWORD || t1 === TYPES.ENEMY) && (t2 === TYPES.SWORD || t2 === TYPES.ENEMY);
    if (mixed(lastTile.type, tile.type)) return true;

    return false;
  }

  function addToSelection(x, y) {
    state.selection.push({ x, y });
    playSound("connect");
    updatePreview();
    
    const ts = getTileSize();
    spawnParticles((x + 0.5) * ts, (y + 0.5) * ts, COLORS[getTile(x, y).type], 3);
  }

  function onPointerUp(e) {
    if (!state.isDragging) return;
    state.isDragging = false;
    
    if (state.selection.length >= 3 || (containsEnemy(state.selection) && state.selection.length >= 2)) {
      executeMove();
    } else {
      state.selection = [];
      ui.preview.classList.add("hidden");
    }
  }

  function containsEnemy(sel) {
    return sel.some(p => getTile(p.x, p.y).type === TYPES.ENEMY);
  }

  function updatePreview() {
    if (state.selection.length < 2) {
      ui.preview.classList.add("hidden");
      return;
    }
    
    const analysis = analyzeSelection();
    if (analysis.valid) {
      ui.previewText.textContent = analysis.msg;
      ui.preview.classList.remove("hidden");
    } else {
      ui.preview.classList.add("hidden");
    }
  }

  function analyzeSelection() {
    const sel = state.selection;
    if (sel.length === 0) return { valid: false };
    
    let swords = 0, potions = 0, shields = 0, coins = 0, enemies = 0, enemyHpTotal = 0;

    for (const p of sel) {
      const t = getTile(p.x, p.y);
      if (t.type === TYPES.SWORD) swords++;
      if (t.type === TYPES.POTION) potions++;
      if (t.type === TYPES.SHIELD) shields++;
      if (t.type === TYPES.COIN) coins++;
      if (t.type === TYPES.ENEMY) {
        enemies++;
        enemyHpTotal += t.hp;
      }
    }

    const len = sel.length;
    let msg = "";
    
    if (swords > 0 || enemies > 0) {
      const dmg = swords;
      if (dmg >= enemyHpTotal) {
        msg = `Attack ${dmg} (Kill ${enemies})`;
      } else {
        msg = `Attack ${dmg} (Hit ${enemies})`;
      }
      return { valid: true, msg, type: "attack", dmg };
    }
    
    if (potions > 0) {
      const heal = potions + Math.floor(len / 3);
      msg = `Heal ${heal}`;
      return { valid: true, msg, type: "heal", value: heal };
    }
    
    if (shields > 0) {
      const armor = shields + Math.floor(len / 3);
      msg = `Shield ${armor}`;
      return { valid: true, msg, type: "shield", value: armor };
    }
    
    if (coins > 0) {
      const val = coins * 2 + Math.floor(len / 2);
      msg = `Collect ${val}`;
      return { valid: true, msg, type: "coin", value: val };
    }

    return { valid: false };
  }

  // --- Execution ---

  function executeMove() {
    const analysis = analyzeSelection();
    if (!analysis.valid) {
      state.selection = [];
      ui.preview.classList.add("hidden");
      return;
    }

    ui.preview.classList.add("hidden");
    state.animating = true;

    if (analysis.type === "attack") {
      let remainingDmg = analysis.dmg;
      let killed = 0;
      
      const enemiesInChain = state.selection
        .map(p => getTile(p.x, p.y))
        .filter(t => t.type === TYPES.ENEMY);
      
      for (const e of enemiesInChain) {
        if (remainingDmg >= e.hp) {
          remainingDmg -= e.hp;
          e.dead = true;
          killed++;
        } else {
          e.hp -= remainingDmg;
          remainingDmg = 0;
        }
      }
      playSound("attack");
      state.score += killed * 10;
      
    } else if (analysis.type === "heal") {
      state.hp = Math.min(state.hp + analysis.value, state.maxHp);
      playSound("heal");
    } else if (analysis.type === "shield") {
      state.shield += analysis.value;
      playSound("shield");
    } else if (analysis.type === "coin") {
      state.score += analysis.value;
      state.surge = Math.min(state.surge + analysis.value * 2, state.maxSurge);
      playSound("coin");
    }

    const toRemove = [];
    const ts = getTileSize();
    
    for (const p of state.selection) {
      const t = getTile(p.x, p.y);
      if (t.type === TYPES.ENEMY && !t.dead) continue; 
      toRemove.push(p);
      spawnParticles((p.x + 0.5) * ts, (p.y + 0.5) * ts, COLORS[t.type], 8);
    }

    toRemove.sort((a, b) => a.y - b.y);
    for (const p of toRemove) {
      state.grid[p.x][p.y] = null;
    }
    
    for (let x = 0; x < GRID_W; x++) {
      const col = state.grid[x];
      const newCol = col.filter(t => t !== null);
      while (newCol.length < GRID_H) {
        newCol.unshift(spawnTile(x, 0));
      }
      newCol.forEach((t, i) => { t.y = i; t.x = x; });
      state.grid[x] = newCol;
    }

    // Enemy Retaliation
    // All enemies on board deal 1 damage each to shield/hp
    const allEnemies = state.grid.flat().filter(t => t.type === TYPES.ENEMY);
    let totalEnemyDmg = allEnemies.reduce((sum, e) => sum + 1, 0);
    
    if (totalEnemyDmg > 0) {
        setTimeout(() => takeDamage(totalEnemyDmg), 250);
    }

    state.selection = [];
    state.turn++;
    state.difficulty = 1 + Math.floor(state.turn / 10);
    
    updateUI();
    state.animating = false;
  }

  function takeDamage(amount) {
    if (state.shield >= amount) {
        state.shield -= amount;
        playSound("shield");
    } else {
        const overflow = amount - state.shield;
        state.shield = 0;
        state.hp -= overflow;
        state.shake = 10;
        playSound("enemy_hit");
    }
    
    const ts = getTileSize();
    spawnParticles(GRID_W * ts / 2, GRID_H * ts / 2, "#fff", 10); 

    if (state.hp <= 0) {
        state.hp = 0;
        updateUI();
        setTimeout(gameOver, 600);
    }
    updateUI();
  }

  function activateSurge() {
    if (state.surge < state.maxSurge) return;
    
    state.surge = 0;
    playSound("surge");
    
    const enemies = state.grid.flat().filter(t => t.type === TYPES.ENEMY);
    const ts = getTileSize();
    
    for (const e of enemies) {
        e.type = TYPES.COIN; // Transmute enemies to gold
        e.val = 5;
        e.hp = 0;
        spawnParticles((e.x + 0.5) * ts, (e.y + 0.5) * ts, COLORS.enemy, 15);
    }
    
    state.shake = 20;
    updateUI();
  }

  function gameOver() {
    if (state.score > state.bestScore) {
        localStorage.setItem("wildDot.best", state.score);
        state.bestScore = state.score;
    }
    showOverlay("gameover", `Final Score: ${state.score}`);
  }

  // --- Rendering ---

  function getTileSize() {
     const scale = window.devicePixelRatio || 1;
     const logicalWidth = canvas.width / scale;
     const boardSize = Math.min(logicalWidth, logicalWidth); 
     return boardSize / GRID_W;
  }

  function resize() {
    const parent = canvas.parentElement;
    const size = Math.min(parent.clientWidth, parent.clientHeight, 600); 
    const scale = window.devicePixelRatio || 1;
    canvas.width = size * scale;
    canvas.height = size * scale;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(scale, scale);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
  }

  function draw() {
    const scale = window.devicePixelRatio || 1;
    const ts = getTileSize();
    const boardSize = ts * GRID_W;
    const logicalWidth = canvas.width / scale;
    const padX = (logicalWidth - boardSize) / 2;
    const padY = (logicalWidth - boardSize) / 2;
    
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, logicalWidth, logicalWidth); // Clear logical area
    
    let sx = 0, sy = 0;
    if (state.shake > 0) {
        sx = (Math.random() - 0.5) * state.shake;
        sy = (Math.random() - 0.5) * state.shake;
        state.shake *= 0.9;
        if (state.shake < 0.5) state.shake = 0;
    }

    ctx.save();
    ctx.translate(padX + sx, padY + sy);

    // Tiles
    for (let x = 0; x < GRID_W; x++) {
        for (let y = 0; y < GRID_H; y++) {
            const tile = state.grid[x][y];
            if (!tile) continue;
            
            const px = x * ts;
            const py = y * ts;
            const isSelected = state.selection.some(p => p.x === x && p.y === y);
            const m = 4;
            const size = ts - m*2;
            
            ctx.fillStyle = isSelected ? "#fff" : COLORS[tile.type];
            if (isSelected) ctx.globalAlpha = 0.8;
            
            ctx.beginPath();
            if (ctx.roundRect) {
                 ctx.roundRect(px + m, py + m, size, size, 12);
            } else {
                 ctx.rect(px + m, py + m, size, size);
            }
            ctx.fill();
            ctx.globalAlpha = 1;

            ctx.font = `${ts/2}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = tile.type === TYPES.ENEMY ? "#fff" : "#000";
            
            if (tile.type === TYPES.ENEMY) {
                 ctx.fillText(`${ICONS[tile.type]}`, px + ts/2, py + ts/2 - 5);
                 ctx.font = `bold ${ts/4}px sans-serif`;
                 ctx.fillText(`${tile.hp}`, px + ts/2, py + ts/2 + 15);
            } else {
                 ctx.fillText(ICONS[tile.type], px + ts/2, py + ts/2);
            }
        }
    }

    // Connector
    if (state.selection.length > 1) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        const start = state.selection[0];
        ctx.moveTo(start.x * ts + ts/2, start.y * ts + ts/2);
        for (let i = 1; i < state.selection.length; i++) {
            const p = state.selection[i];
            ctx.lineTo(p.x * ts + ts/2, p.y * ts + ts/2);
        }
        ctx.stroke();
    }

    // Particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        p.vy += 0.5; 
        
        if (p.life <= 0) {
            state.particles.splice(i, 1);
            continue;
        }
        
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function loop() {
    draw();
    requestAnimationFrame(loop);
  }

  init();

})();
