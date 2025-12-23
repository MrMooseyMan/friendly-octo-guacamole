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
    ENEMY: "enemy",
    WILD: "wild"
  };

  const COLORS = {
    sword: "#f43f5e",
    potion: "#34d399",
    shield: "#3b82f6",
    coin: "#fbbf24",
    enemy: "#a855f7",
    wild: "#ff00ff",
    bg: "#1e293b",
    line: "#ffffff"
  };

  const ICONS = {
    sword: "⚔️",
    potion: "❤️",
    shield: "🛡️",
    coin: "💰",
    enemy: "💀",
    wild: "✨"
  };

  // Monster types with names and icons for better identity
  const MONSTERS = [
    { name: "Slime", icon: "🟢", color: "#22c55e" },
    { name: "Goblin", icon: "👺", color: "#84cc16" },
    { name: "Rat", icon: "🐀", color: "#a3a3a3" },
    { name: "Bat", icon: "🦇", color: "#6b7280" },
    { name: "Spider", icon: "🕷️", color: "#4b5563" },
    { name: "Ghost", icon: "👻", color: "#a78bfa" },
    { name: "Skeleton", icon: "💀", color: "#f5f5f4" },
    { name: "Zombie", icon: "🧟", color: "#65a30d" },
    { name: "Imp", icon: "😈", color: "#ef4444" },
    { name: "Shadow", icon: "👤", color: "#1f2937" },
  ];

  // Stronger monsters for higher floors
  const ELITE_MONSTERS = [
    { name: "Ogre", icon: "👹", color: "#b45309" },
    { name: "Wraith", icon: "👥", color: "#7c3aed" },
    { name: "Demon", icon: "😈", color: "#dc2626" },
    { name: "Dragon", icon: "🐉", color: "#ea580c" },
    { name: "Reaper", icon: "💀", color: "#0f172a" },
  ];

  // Chain length bonus multipliers
  const CHAIN_BONUS = {
    4: 1.25,  // +25% for 4 tiles
    5: 1.5,   // +50% for 5 tiles
    6: 2.0,   // +100% for 6+ tiles
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
    floor: 1,
    enemiesKilledOnFloor: 0,
    enemiesNeededForFloor: 5,
    difficulty: 1,
    
    combo: 0,
    lastMoveWasGood: false,

    surge: 0,
    maxSurge: 100,

    animating: false,
    particles: [],
    shake: 0,
    floatingTexts: [],
  };

  // --- DOM ---
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  
  const ui = {
    hp: document.getElementById("hpText"),
    hpBar: document.getElementById("hpBar"),
    shield: document.getElementById("shieldText"),
    score: document.getElementById("scoreText"),
    floor: document.getElementById("floorText"),
    floorBar: document.getElementById("floorBar"),
    floorProgressText: document.getElementById("floorProgressText"),
    surgeBar: document.getElementById("surgeBar"),
    surgeBtn: document.getElementById("surgeBtn"),
    preview: document.getElementById("actionPreview"),
    previewText: document.getElementById("actionText"),
    overlay: document.getElementById("overlay"),
    overlayTitle: document.getElementById("overlayTitle"),
    overlayMsg: document.getElementById("overlayMessage"),
    // New UX elements
    turnBanner: document.getElementById("turnBanner"),
    turnText: document.getElementById("turnText"),
    combatLog: document.getElementById("combatLogContent"),
    monsterInfo: document.getElementById("monsterInfo"),
    monsterIcon: document.getElementById("monsterIcon"),
    monsterName: document.getElementById("monsterName"),
    monsterHp: document.getElementById("monsterHp"),
    threatIndicator: document.getElementById("threatIndicator"),
    threatCount: document.getElementById("threatCount"),
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

  // --- Particles ---
  function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      state.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 2,
        color,
        life: 1
      });
    }
  }

  // --- UI Updates ---
  function updateUI() {
    ui.hp.textContent = `${state.hp}/${state.maxHp}`;
    ui.shield.textContent = state.shield;
    ui.score.textContent = state.score;
    ui.floor.textContent = state.floor;
    
    // Update HP bar
    const hpPercent = (state.hp / state.maxHp) * 100;
    ui.hpBar.style.width = `${hpPercent}%`;
    
    // Change HP bar color based on health
    if (hpPercent <= 25) {
      ui.hpBar.style.background = "linear-gradient(90deg, #f43f5e, #dc2626)";
    } else if (hpPercent <= 50) {
      ui.hpBar.style.background = "linear-gradient(90deg, #fbbf24, #f59e0b)";
    } else {
      ui.hpBar.style.background = "linear-gradient(90deg, #34d399, #10b981)";
    }
    
    // Update floor progress
    const floorPercent = (state.enemiesKilledOnFloor / state.enemiesNeededForFloor) * 100;
    ui.floorBar.style.width = `${Math.min(floorPercent, 100)}%`;
    ui.floorProgressText.textContent = `${state.enemiesKilledOnFloor}/${state.enemiesNeededForFloor} slain`;
    
    // Update surge bar
    const surgePercent = (state.surge / state.maxSurge) * 100;
    ui.surgeBar.style.width = `${surgePercent}%`;
    ui.surgeBtn.disabled = state.surge < state.maxSurge;
    
    // Update threat indicator (count of monsters on board = damage per turn)
    const monsterCount = state.grid.flat().filter(t => t && t.type === TYPES.ENEMY).length;
    ui.threatCount.textContent = monsterCount;
    
    // Add danger class if threat is high relative to HP/shield
    const totalDefense = state.hp + state.shield;
    if (monsterCount >= totalDefense * 0.5) {
      ui.threatIndicator.classList.add("danger");
    } else {
      ui.threatIndicator.classList.remove("danger");
    }
  }

  function showOverlay(type, message = "") {
    if (!type) {
      ui.overlay.classList.remove("open");
      return;
    }
    
    ui.overlay.classList.add("open");
    
    if (type === "help") {
      ui.overlayTitle.textContent = "🐺 Wild Dot Crawler";
      ui.overlayMsg.textContent = "";
      document.getElementById("overlayHelp").style.display = "block";
      document.getElementById("startBtn").textContent = "⚔️ Start Run";
      document.getElementById("closeHelpBtn").style.display = state.turn > 0 ? "inline-block" : "none";
    } else if (type === "gameover") {
      ui.overlayTitle.textContent = "💀 Game Over!";
      // Handle multiline message
      ui.overlayMsg.innerHTML = message.replace(/\n/g, "<br>");
      document.getElementById("overlayHelp").style.display = "none";
      document.getElementById("startBtn").textContent = "🔄 Play Again";
      document.getElementById("closeHelpBtn").style.display = "none";
    }
  }

  // --- Logic ---

  function init() {
    // Wait for next frame to ensure DOM layout is complete
    requestAnimationFrame(() => {
      resize();
      // Resize again after a short delay to handle any late layout changes
      setTimeout(resize, 100);
    });
    
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
    state.floor = 1;
    state.enemiesKilledOnFloor = 0;
    state.enemiesNeededForFloor = 5;
    state.difficulty = 1;
    state.combo = 0;
    state.lastMoveWasGood = false;
    state.surge = 0;
    state.selection = [];
    state.isDragging = false;
    state.particles = [];
    state.floatingTexts = [];
    state.shake = 0;
    
    generateGrid(true);
    updateUI();
    clearCombatLog();
    hideMonsterInfo();
    addCombatLog("⚔️ Your adventure begins!", "info");
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

  function spawnTile(x, y, announce = false) {
    const r = Math.random();
    let type = TYPES.SWORD;
    
    // Adjustable probabilities - WILD is very rare (3%)
    if (r < 0.03) type = TYPES.WILD;
    else if (r < 0.28) type = TYPES.SWORD;
    else if (r < 0.48) type = TYPES.POTION;
    else if (r < 0.68) type = TYPES.SHIELD;
    else if (r < 0.85) type = TYPES.COIN;
    else type = TYPES.ENEMY;

    // Enemy HP scales with floor
    const hp = type === TYPES.ENEMY ? Math.floor(1 + state.floor * 0.3 + Math.random() * 2) : 0;
    const val = type === TYPES.ENEMY ? Math.ceil(hp / 2) : 1;
    
    // Give enemies a monster identity
    const monsterData = type === TYPES.ENEMY ? getRandomMonster() : null;

    const tile = {
      type,
      x, 
      y, 
      val,
      hp,
      maxHp: hp,
      monsterData,
      id: Math.random().toString(36)
    };
    
    // Announce new monster spawns (but not on initial grid generation)
    if (type === TYPES.ENEMY && announce && state.turn > 0) {
      const ts = getTileSize();
      setTimeout(() => {
        addCombatLog(`${monsterData.icon} ${monsterData.name} appears!`, "spawn");
        spawnFloatingText((x + 0.5) * ts, (y + 0.5) * ts, `${monsterData.icon}`, monsterData.color);
      }, 100);
    }
    
    return tile;
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
    
    // Same type always connects
    if (lastTile.type === tile.type) return true;

    // WILD tiles connect with everything!
    if (lastTile.type === TYPES.WILD || tile.type === TYPES.WILD) return true;

    // Sword <-> Enemy mixing for combat chains
    const isCombat = (t) => t === TYPES.SWORD || t === TYPES.ENEMY;
    if (isCombat(lastTile.type) && isCombat(tile.type)) return true;

    return false;
  }

  function addToSelection(x, y) {
    state.selection.push({ x, y });
    playSound("connect");
    updatePreview();
    
    const tile = getTile(x, y);
    const ts = getTileSize();
    spawnParticles((x + 0.5) * ts, (y + 0.5) * ts, COLORS[tile.type], 3);
    
    // Show monster info if selecting an enemy
    if (tile.type === TYPES.ENEMY) {
      showMonsterInfo(tile);
    }
  }

  function onPointerUp(e) {
    if (!state.isDragging) return;
    state.isDragging = false;
    
    if (state.selection.length >= 3 || (containsEnemy(state.selection) && state.selection.length >= 2)) {
      executeMove();
    } else {
      state.selection = [];
      ui.preview.classList.add("hidden");
      hideMonsterInfo();
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

  function getChainBonus(len) {
    if (len >= 6) return CHAIN_BONUS[6];
    if (len >= 5) return CHAIN_BONUS[5];
    if (len >= 4) return CHAIN_BONUS[4];
    return 1;
  }

  function analyzeSelection() {
    const sel = state.selection;
    if (sel.length === 0) return { valid: false };
    
    let swords = 0, potions = 0, shields = 0, coins = 0, enemies = 0, wilds = 0, enemyHpTotal = 0;
    const enemyTiles = [];

    // Count tile types
    for (const p of sel) {
      const t = getTile(p.x, p.y);
      if (t.type === TYPES.SWORD) swords++;
      else if (t.type === TYPES.POTION) potions++;
      else if (t.type === TYPES.SHIELD) shields++;
      else if (t.type === TYPES.COIN) coins++;
      else if (t.type === TYPES.WILD) wilds++;
      else if (t.type === TYPES.ENEMY) {
        enemies++;
        enemyHpTotal += t.hp;
        enemyTiles.push(t);
      }
    }

    const len = sel.length;
    const chainBonus = getChainBonus(len);
    const bonusText = chainBonus > 1 ? ` (${Math.round((chainBonus - 1) * 100)}% bonus!)` : "";
    let msg = "";
    
    // Determine primary action based on what we have most of (excluding enemies and wilds)
    const counts = [
      { type: "attack", count: swords + (enemies > 0 ? 1 : 0) },
      { type: "heal", count: potions },
      { type: "shield", count: shields },
      { type: "coin", count: coins }
    ];
    
    // If we have enemies in chain, prioritize attack
    if (enemies > 0 || swords > 0) {
      // Wilds count as swords in combat
      const totalDmg = Math.floor((swords + wilds) * chainBonus);
      
      // Get monster names for display
      const monsterNames = enemyTiles.slice(0, 2).map(e => 
        e.monsterData ? e.monsterData.name : "Monster"
      );
      const targetText = monsterNames.join(", ") + (enemies > 2 ? ` +${enemies - 2}` : "");
      
      if (totalDmg >= enemyHpTotal && enemies > 0) {
        msg = `⚔️ ${totalDmg} dmg → SLAY ${targetText}!${bonusText}`;
      } else if (enemies > 0) {
        msg = `⚔️ ${totalDmg} dmg → ${targetText}${bonusText}`;
      } else {
        msg = `⚔️ ${totalDmg} dmg (need a target!)`;
      }
      return { valid: enemies > 0 || swords >= 3, msg, type: "attack", dmg: totalDmg, wilds };
    }
    
    if (potions > 0) {
      const heal = Math.floor((potions + wilds + Math.floor(len / 3)) * chainBonus);
      msg = `❤️ Heal +${heal} HP${bonusText}`;
      return { valid: true, msg, type: "heal", value: heal };
    }
    
    if (shields > 0) {
      const armor = Math.floor((shields + wilds + Math.floor(len / 3)) * chainBonus);
      msg = `🛡️ Block +${armor} dmg${bonusText}`;
      return { valid: true, msg, type: "shield", value: armor };
    }
    
    if (coins > 0) {
      const val = Math.floor(((coins + wilds) * 2 + Math.floor(len / 2)) * chainBonus);
      msg = `💰 Collect +${val} gold${bonusText}`;
      return { valid: true, msg, type: "coin", value: val };
    }

    // Pure wild chain - treat as coins
    if (wilds > 0) {
      const val = Math.floor((wilds * 3) * chainBonus);
      msg = `✨ Wild bonus +${val} gold!${bonusText}`;
      return { valid: true, msg, type: "coin", value: val };
    }

    return { valid: false };
  }

  // --- Floating Text ---
  function spawnFloatingText(x, y, text, color) {
    state.floatingTexts.push({
      x, y,
      text,
      color,
      life: 1,
      vy: -2
    });
  }

  // --- Combat Log ---
  function addCombatLog(message, type = "info") {
    const entry = document.createElement("div");
    entry.className = `combat-log-entry ${type}`;
    entry.textContent = message;
    
    // Keep only last 5 entries
    while (ui.combatLog.children.length >= 5) {
      ui.combatLog.removeChild(ui.combatLog.firstChild);
    }
    
    ui.combatLog.appendChild(entry);
    
    // Auto-scroll to bottom
    ui.combatLog.parentElement.scrollTop = ui.combatLog.parentElement.scrollHeight;
  }

  function clearCombatLog() {
    ui.combatLog.innerHTML = "";
  }

  // --- Turn Banner ---
  function showTurnBanner(text, isEnemyTurn = false) {
    ui.turnText.textContent = text;
    ui.turnBanner.classList.remove("hidden", "enemy-turn");
    if (isEnemyTurn) {
      ui.turnBanner.classList.add("enemy-turn");
    }
    
    // Auto-hide after animation
    setTimeout(() => {
      ui.turnBanner.classList.add("hidden");
    }, 800);
  }

  // --- Monster Info Panel ---
  function showMonsterInfo(monster) {
    if (!monster) {
      ui.monsterInfo.classList.add("hidden");
      return;
    }
    
    ui.monsterIcon.textContent = monster.monsterData.icon;
    ui.monsterName.textContent = monster.monsterData.name;
    ui.monsterHp.textContent = `HP: ${monster.hp}/${monster.maxHp} • ATK: 1`;
    ui.monsterInfo.classList.remove("hidden");
  }

  function hideMonsterInfo() {
    ui.monsterInfo.classList.add("hidden");
  }

  // Get a random monster type based on floor
  function getRandomMonster() {
    if (state.floor >= 5 && Math.random() < 0.3) {
      return ELITE_MONSTERS[Math.floor(Math.random() * ELITE_MONSTERS.length)];
    }
    return MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
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
    hideMonsterInfo();
    
    const ts = getTileSize();
    const chainLen = state.selection.length;
    let killed = 0;
    const killedMonsters = [];

    if (analysis.type === "attack") {
      let remainingDmg = analysis.dmg;
      
      const enemiesInChain = state.selection
        .map(p => getTile(p.x, p.y))
        .filter(t => t.type === TYPES.ENEMY);
      
      for (const e of enemiesInChain) {
        const monsterName = e.monsterData ? e.monsterData.name : "Monster";
        const monsterIcon = e.monsterData ? e.monsterData.icon : "💀";
        
        if (remainingDmg >= e.hp) {
          const overkill = remainingDmg - e.hp;
          remainingDmg = overkill;
          e.dead = true;
          killed++;
          killedMonsters.push(e.monsterData);
          spawnFloatingText((e.x + 0.5) * ts, (e.y + 0.5) * ts, `${monsterIcon} SLAIN!`, "#22d3ee");
          addCombatLog(`⚔️ ${monsterName} slain!`, "kill");
        } else {
          const dmgDealt = remainingDmg;
          e.hp -= remainingDmg;
          spawnFloatingText((e.x + 0.5) * ts, (e.y + 0.5) * ts, `-${dmgDealt}`, "#ffaa00");
          addCombatLog(`⚔️ Hit ${monsterName} for ${dmgDealt} dmg!`, "attack");
          remainingDmg = 0;
        }
      }
      playSound("attack");
      state.score += killed * 10 * state.floor;
      
      // Track floor progression
      state.enemiesKilledOnFloor += killed;
      if (state.enemiesKilledOnFloor >= state.enemiesNeededForFloor) {
        advanceFloor();
      }
      
    } else if (analysis.type === "heal") {
      const healed = Math.min(analysis.value, state.maxHp - state.hp);
      state.hp = Math.min(state.hp + analysis.value, state.maxHp);
      playSound("heal");
      if (healed > 0) {
        spawnFloatingText(GRID_W * ts / 2, GRID_H * ts / 2, `+${healed} HP`, COLORS.potion);
        addCombatLog(`❤️ Healed ${healed} HP!`, "heal");
      }
    } else if (analysis.type === "shield") {
      state.shield += analysis.value;
      playSound("shield");
      spawnFloatingText(GRID_W * ts / 2, GRID_H * ts / 2, `+${analysis.value} 🛡️`, COLORS.shield);
      addCombatLog(`🛡️ Gained ${analysis.value} shield!`, "shield");
    } else if (analysis.type === "coin") {
      state.score += analysis.value;
      state.surge = Math.min(state.surge + analysis.value * 2, state.maxSurge);
      playSound("coin");
      spawnFloatingText(GRID_W * ts / 2, GRID_H * ts / 2, `+${analysis.value}`, COLORS.coin);
    }

    // Chain length bonus feedback
    if (chainLen >= 4) {
      const bonus = getChainBonus(chainLen);
      spawnFloatingText(GRID_W * ts / 2, 20, `${chainLen} CHAIN! x${bonus}`, "#fff");
      state.shake = Math.min(chainLen * 2, 15);
    }

    // Combo tracking
    if (killed > 0 || analysis.type === "heal" || analysis.type === "shield") {
      state.combo++;
      if (state.combo >= 3) {
        spawnFloatingText(GRID_W * ts / 2, GRID_H * ts - 20, `${state.combo}x COMBO!`, "#ff00ff");
      }
    } else if (analysis.type !== "coin") {
      state.combo = 0;
    }

    const toRemove = [];
    
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
    
    // Refill grid with new tiles (announce monster spawns)
    for (let x = 0; x < GRID_W; x++) {
      const col = state.grid[x];
      const newCol = col.filter(t => t !== null);
      while (newCol.length < GRID_H) {
        newCol.unshift(spawnTile(x, 0, true)); // announce = true for new spawns
      }
      newCol.forEach((t, i) => { t.y = i; t.x = x; });
      state.grid[x] = newCol;
    }

    // Enemy Retaliation - each enemy deals 1 damage
    const allEnemies = state.grid.flat().filter(t => t.type === TYPES.ENEMY);
    let totalEnemyDmg = allEnemies.length;
    
    if (totalEnemyDmg > 0) {
      // Show enemy turn banner
      setTimeout(() => {
        showTurnBanner(`${totalEnemyDmg} MONSTERS ATTACK!`, true);
        
        // Build attack message
        const monsterNames = allEnemies.slice(0, 3).map(e => 
          e.monsterData ? e.monsterData.icon : "💀"
        ).join("");
        const extras = allEnemies.length > 3 ? ` +${allEnemies.length - 3}` : "";
        addCombatLog(`${monsterNames}${extras} attack for ${totalEnemyDmg} dmg!`, "enemy-attack");
      }, 200);
      
      setTimeout(() => takeDamage(totalEnemyDmg), 450);
    }

    state.selection = [];
    state.turn++;
    state.difficulty = state.floor;
    
    updateUI();
    state.animating = false;
  }

  function advanceFloor() {
    state.floor++;
    state.enemiesKilledOnFloor = 0;
    state.enemiesNeededForFloor = 5 + state.floor * 2;
    
    // Bonus HP on floor advance
    state.maxHp += 2;
    state.hp = Math.min(state.hp + 5, state.maxHp);
    
    playSound("surge");
    state.shake = 15;
    
    const ts = getTileSize();
    
    // Show floor advancement banner
    showTurnBanner(`🏰 FLOOR ${state.floor}!`, false);
    
    spawnFloatingText(GRID_W * ts / 2, GRID_H * ts / 2, `FLOOR ${state.floor}!`, "#22d3ee");
    addCombatLog(`🏰 Reached Floor ${state.floor}! (+5 HP)`, "info");
    
    // Warn about elite monsters on higher floors
    if (state.floor === 5) {
      setTimeout(() => {
        addCombatLog(`⚠️ Elite monsters ahead!`, "spawn");
      }, 500);
    }
    
    // Spawn lots of particles for celebration
    for (let i = 0; i < 30; i++) {
      spawnParticles(
        Math.random() * GRID_W * ts,
        Math.random() * GRID_H * ts,
        ["#f43f5e", "#34d399", "#3b82f6", "#fbbf24", "#a855f7"][Math.floor(Math.random() * 5)],
        3
      );
    }
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
    
    showTurnBanner("⚡ SURGE POWER!", false);
    
    if (enemies.length > 0) {
      addCombatLog(`⚡ Transmuted ${enemies.length} monsters into gold!`, "kill");
    }
    
    for (const e of enemies) {
        const monsterIcon = e.monsterData ? e.monsterData.icon : "💀";
        spawnFloatingText((e.x + 0.5) * ts, (e.y + 0.5) * ts, `${monsterIcon}→💰`, "#fbbf24");
        e.type = TYPES.COIN; // Transmute enemies to gold
        e.val = 5;
        e.hp = 0;
        e.monsterData = null;
        spawnParticles((e.x + 0.5) * ts, (e.y + 0.5) * ts, COLORS.coin, 15);
    }
    
    state.shake = 20;
    updateUI();
  }

  function gameOver() {
    const isNewBest = state.score > state.bestScore;
    if (isNewBest) {
        localStorage.setItem("wildDot.best", state.score);
        state.bestScore = state.score;
    }
    
    // Count total monsters on board that killed you
    const killers = state.grid.flat().filter(t => t.type === TYPES.ENEMY);
    const killerNames = killers.slice(0, 3).map(e => 
      e.monsterData ? e.monsterData.icon : "💀"
    ).join(" ");
    
    const bestText = isNewBest ? "🎉 NEW HIGH SCORE!\n" : "";
    const deathMsg = killers.length > 0 ? `Overwhelmed by ${killers.length} monsters! ${killerNames}\n\n` : "";
    const message = `${deathMsg}${bestText}⭐ Score: ${state.score}\n🏰 Reached Floor ${state.floor}\n⚔️ Turns survived: ${state.turn}`;
    showOverlay("gameover", message);
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
    // Get parent dimensions, with fallback to reasonable defaults
    let parentWidth = parent.clientWidth || 400;
    let parentHeight = parent.clientHeight || 400;
    
    // Ensure minimum size for visibility
    const minSize = 300;
    const maxSize = 600;
    
    // Use the smaller of width/height to keep it square, clamped to min/max
    let size = Math.min(parentWidth, parentHeight, maxSize);
    size = Math.max(size, minSize);
    
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
    const time = Date.now() / 1000;
    for (let x = 0; x < GRID_W; x++) {
        if (!state.grid[x]) continue; // Safety check for uninitialized column
        for (let y = 0; y < GRID_H; y++) {
            const tile = state.grid[x][y];
            if (!tile) continue;
            
            const px = x * ts;
            const py = y * ts;
            const isSelected = state.selection.some(p => p.x === x && p.y === y);
            const m = 4;
            const size = ts - m*2;
            
            // Special rainbow effect for WILD tiles
            if (tile.type === TYPES.WILD) {
                const hue = (time * 100 + x * 30 + y * 30) % 360;
                ctx.fillStyle = isSelected ? "#fff" : `hsl(${hue}, 80%, 60%)`;
            } else {
                ctx.fillStyle = isSelected ? "#fff" : COLORS[tile.type];
            }
            
            if (isSelected) ctx.globalAlpha = 0.8;
            
            ctx.beginPath();
            if (ctx.roundRect) {
                 ctx.roundRect(px + m, py + m, size, size, 12);
            } else {
                 ctx.rect(px + m, py + m, size, size);
            }
            ctx.fill();
            
            // Add glow effect for WILD tiles
            if (tile.type === TYPES.WILD && !isSelected) {
                ctx.shadowColor = `hsl(${(time * 100) % 360}, 100%, 50%)`;
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            
            ctx.globalAlpha = 1;

            ctx.font = `${ts/2}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = tile.type === TYPES.ENEMY ? "#fff" : "#000";
            
            if (tile.type === TYPES.ENEMY) {
                 // Draw enemy with monster icon
                 const monsterIcon = tile.monsterData ? tile.monsterData.icon : ICONS[tile.type];
                 ctx.fillText(monsterIcon, px + ts/2, py + ts/2 - 8);
                 
                 // HP bar background
                 const barW = size * 0.7;
                 const barH = 6;
                 const barX = px + m + (size - barW) / 2;
                 const barY = py + ts - m - 12;
                 
                 ctx.fillStyle = "rgba(0,0,0,0.5)";
                 ctx.fillRect(barX, barY, barW, barH);
                 
                 // HP bar fill
                 const hpPercent = tile.hp / tile.maxHp;
                 ctx.fillStyle = hpPercent > 0.5 ? "#34d399" : hpPercent > 0.25 ? "#fbbf24" : "#f43f5e";
                 ctx.fillRect(barX, barY, barW * hpPercent, barH);
                 
                 // HP text
                 ctx.font = `bold ${ts/5}px sans-serif`;
                 ctx.fillStyle = "#fff";
                 ctx.fillText(`${tile.hp}`, px + ts/2, barY + barH/2 + 1);
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

    // Floating texts
    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        ft.y += ft.vy;
        ft.life -= 0.02;
        
        if (ft.life <= 0) {
            state.floatingTexts.splice(i, 1);
            continue;
        }
        
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.globalAlpha = ft.life;
        
        // Text shadow
        ctx.fillStyle = "#000";
        ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
        
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1;
    }

    // Chain length indicator while dragging
    if (state.selection.length >= 2) {
        const last = state.selection[state.selection.length - 1];
        const px = last.x * ts + ts / 2;
        const py = last.y * ts - 15;
        
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = state.selection.length >= 4 ? "#fbbf24" : "#fff";
        ctx.fillText(`${state.selection.length}`, px, py);
    }

    ctx.restore();
  }

  function loop() {
    draw();
    requestAnimationFrame(loop);
  }

  init();

})();
