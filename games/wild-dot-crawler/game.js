(() => {
  "use strict";

  /**
   * Wild Dot Crawler
   * - Turn-based dungeon crawl.
   * - Player moves, then enemies move.
   * - Find stairs to go deeper, collect gems and hearts.
   */

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d", { alpha: false });

  const hpText = document.getElementById("hpText");
  const floorText = document.getElementById("floorText");
  const scoreText = document.getElementById("scoreText");
  const bestText = document.getElementById("bestText");
  const logEl = document.getElementById("log");

  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayMessage = document.getElementById("overlayMessage");
  const overlayHelp = document.getElementById("overlayHelp");
  const startBtn = document.getElementById("startBtn");
  const closeHelpBtn = document.getElementById("closeHelpBtn");
  const helpBtn = document.getElementById("helpBtn");
  const newBtn = document.getElementById("newBtn");

  const dpad = document.querySelector(".dpad");

  const COLORS = {
    bg: "#050812",
    floor: "#1f2a44",
    wall: "#0a0f1f",
    fog: "#050812",
    seen: "rgba(5, 8, 18, 0.55)",
    player: "#22d3ee",
    enemy: "#fb7185",
    gem: "#fbbf24",
    heart: "#34d399",
    stairs: "#4ade80",
    text: "#e7edf7",
  };

  const TILE = {
    WALL: 0,
    FLOOR: 1,
  };

  const ITEM = {
    GEM: "gem",
    HEART: "heart",
    STAIRS: "stairs",
  };

  const DIRS = {
    up: { dx: 0, dy: -1 },
    down: { dx: 0, dy: 1 },
    left: { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 },
  };

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  function randInt(min, maxInclusive) {
    return min + Math.floor(Math.random() * (maxInclusive - min + 1));
  }

  function choice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function keyOf(x, y) {
    return `${x},${y}`;
  }

  function manhattan(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  function inBounds(w, h, x, y) {
    return x >= 0 && y >= 0 && x < w && y < h;
  }

  function setOverlayOpen(open) {
    overlay.classList.toggle("open", open);
  }

  function setOverlayMode(mode, message = "") {
    // mode: "help" | "gameover"
    const isGameOver = mode === "gameover";
    overlayTitle.textContent = isGameOver ? "Game Over" : "How to play";
    overlayMessage.textContent = message;
    overlayHelp.style.display = isGameOver ? "none" : "block";
    startBtn.textContent = isGameOver ? "New run" : "Start run";
    closeHelpBtn.style.display = isGameOver ? "none" : "inline-flex";
  }

  function clearLog() {
    logEl.textContent = "";
  }

  function log(msg) {
    const line = document.createElement("div");
    line.textContent = msg;
    logEl.prepend(line);
  }

  function loadBest() {
    const raw = localStorage.getItem("wildDotCrawler.bestScore");
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  function saveBest(score) {
    const best = loadBest();
    if (score > best) {
      localStorage.setItem("wildDotCrawler.bestScore", String(score));
    }
  }

  function makeRng(seed) {
    // Mulberry32
    let a = seed >>> 0;
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randIntR(rng, min, maxInclusive) {
    return min + Math.floor(rng() * (maxInclusive - min + 1));
  }

  function choiceR(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
  }

  function rectsOverlap(a, b) {
    return (
      a.x <= b.x + b.w - 1 &&
      a.x + a.w - 1 >= b.x &&
      a.y <= b.y + b.h - 1 &&
      a.y + a.h - 1 >= b.y
    );
  }

  function carveRoom(grid, room) {
    for (let y = room.y; y < room.y + room.h; y++) {
      for (let x = room.x; x < room.x + room.w; x++) {
        grid[y][x] = TILE.FLOOR;
      }
    }
  }

  function carveCorridor(grid, a, b, rng) {
    // "L" corridor with a small random twist for variety.
    let x = a.x;
    let y = a.y;
    const first = rng() < 0.5 ? "x" : "y";
    const stepX = x < b.x ? 1 : -1;
    const stepY = y < b.y ? 1 : -1;

    const walkX = () => {
      while (x !== b.x) {
        grid[y][x] = TILE.FLOOR;
        x += stepX;
      }
    };
    const walkY = () => {
      while (y !== b.y) {
        grid[y][x] = TILE.FLOOR;
        y += stepY;
      }
    };

    if (first === "x") {
      walkX();
      walkY();
    } else {
      walkY();
      walkX();
    }
    grid[y][x] = TILE.FLOOR;
  }

  function generateDungeon({ w, h, floor, seed }) {
    const rng = makeRng(seed);
    const grid = Array.from({ length: h }, () =>
      Array.from({ length: w }, () => TILE.WALL),
    );

    const rooms = [];
    const maxRooms = clamp(10 + floor * 2, 10, 26);
    const minSize = 4;
    const maxSize = clamp(8 + Math.floor(floor / 2), 8, 12);
    const attempts = 300;

    for (let i = 0; i < attempts && rooms.length < maxRooms; i++) {
      const rw = randIntR(rng, minSize, maxSize);
      const rh = randIntR(rng, minSize, maxSize);
      const rx = randIntR(rng, 1, w - rw - 2);
      const ry = randIntR(rng, 1, h - rh - 2);
      const room = { x: rx, y: ry, w: rw, h: rh };

      // Add padding so rooms don't touch (makes corridors clearer).
      const padded = { x: rx - 1, y: ry - 1, w: rw + 2, h: rh + 2 };
      if (rooms.some((r) => rectsOverlap(padded, r))) continue;

      carveRoom(grid, room);
      rooms.push(room);
    }

    // Connect rooms (sorted by x) for decent connectivity.
    rooms.sort((a, b) => (a.x + a.w / 2) - (b.x + b.w / 2));
    for (let i = 1; i < rooms.length; i++) {
      const prev = rooms[i - 1];
      const cur = rooms[i];
      const a = {
        x: Math.floor(prev.x + prev.w / 2),
        y: Math.floor(prev.y + prev.h / 2),
      };
      const b = {
        x: Math.floor(cur.x + cur.w / 2),
        y: Math.floor(cur.y + cur.h / 2),
      };
      carveCorridor(grid, a, b, rng);
    }

    // Pick start room and a farthest-ish room for stairs.
    const startRoom = rooms.length ? rooms[0] : { x: 2, y: 2, w: 3, h: 3 };
    const start = {
      x: Math.floor(startRoom.x + startRoom.w / 2),
      y: Math.floor(startRoom.y + startRoom.h / 2),
    };

    const stairsRoom = rooms.length ? rooms[rooms.length - 1] : startRoom;
    const stairs = {
      x: Math.floor(stairsRoom.x + stairsRoom.w / 2),
      y: Math.floor(stairsRoom.y + stairsRoom.h / 2),
    };

    // Items & enemies spawn on floor tiles, away from start.
    const floorCells = [];
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        if (grid[y][x] === TILE.FLOOR) floorCells.push({ x, y });
      }
    }

    function popSpawn(predicate) {
      const candidates = floorCells.filter(predicate);
      const p = candidates.length
        ? choiceR(rng, candidates)
        : (floorCells.length ? choiceR(rng, floorCells) : start);
      // Remove from pool so items don't stack.
      const idx = floorCells.findIndex((c) => c.x === p.x && c.y === p.y);
      if (idx !== -1) floorCells.splice(idx, 1);
      return p;
    }

    const items = new Map();
    items.set(keyOf(stairs.x, stairs.y), { type: ITEM.STAIRS });

    const gemCount = clamp(8 + floor * 2, 8, 22);
    const heartCount = clamp(2 + Math.floor(floor / 2), 2, 8);

    for (let i = 0; i < gemCount; i++) {
      const p = popSpawn((c) => manhattan(c, start) > 6 && manhattan(c, stairs) > 2);
      items.set(keyOf(p.x, p.y), { type: ITEM.GEM, value: 5 + floor });
    }

    for (let i = 0; i < heartCount; i++) {
      const p = popSpawn((c) => manhattan(c, start) > 6 && manhattan(c, stairs) > 2);
      items.set(keyOf(p.x, p.y), { type: ITEM.HEART, value: 2 + Math.floor(floor / 3) });
    }

    const enemyCount = clamp(3 + floor, 3, 12);
    const enemies = [];
    for (let i = 0; i < enemyCount; i++) {
      const p = popSpawn((c) => manhattan(c, start) > 7 && manhattan(c, stairs) > 3);
      enemies.push({
        id: `e${i}`,
        x: p.x,
        y: p.y,
        hp: 2 + Math.floor(floor / 2),
        dmg: 1 + Math.floor(floor / 3),
      });
    }

    return { grid, start, items, enemies, seed };
  }

  function computeFov({ w, h, player, grid, radius }) {
    // Simple diamond-shaped vision (fast and readable).
    const visible = new Set();
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const dist = Math.abs(dx) + Math.abs(dy);
        if (dist > radius) continue;
        const x = player.x + dx;
        const y = player.y + dy;
        if (!inBounds(w, h, x, y)) continue;
        visible.add(keyOf(x, y));
      }
    }
    return visible;
  }

  function makeGame() {
    const best = loadBest();
    bestText.textContent = String(best);

    const state = {
      w: 31,
      h: 31,
      tileSize: 20,
      running: false,
      seed: randInt(1, 2_000_000_000),
      floor: 1,
      score: 0,
      player: {
        x: 0,
        y: 0,
        hp: 12,
        maxHp: 12,
      },
      enemies: [],
      grid: [],
      items: new Map(),
      seen: new Set(),
      visible: new Set(),
      vision: 7,
      turn: 0,
    };

    function applyDungeon(dungeon) {
      state.grid = dungeon.grid;
      state.items = dungeon.items;
      state.enemies = dungeon.enemies;
      state.player.x = dungeon.start.x;
      state.player.y = dungeon.start.y;
      state.seen = new Set();
      state.visible = new Set();
      updateFov();
      draw();
    }

    function updateHud() {
      hpText.textContent = `${state.player.hp}/${state.player.maxHp}`;
      floorText.textContent = String(state.floor);
      scoreText.textContent = String(state.score);
      bestText.textContent = String(loadBest());
    }

    function updateFov() {
      state.visible = computeFov({
        w: state.w,
        h: state.h,
        player: state.player,
        grid: state.grid,
        radius: state.vision,
      });
      for (const k of state.visible) state.seen.add(k);
    }

    function isWalkable(x, y) {
      if (!inBounds(state.w, state.h, x, y)) return false;
      return state.grid[y][x] === TILE.FLOOR;
    }

    function enemyAt(x, y) {
      return state.enemies.find((e) => e.x === x && e.y === y) ?? null;
    }

    function tryMovePlayer(dx, dy) {
      if (!state.running) return;
      const nx = state.player.x + dx;
      const ny = state.player.y + dy;
      if (!isWalkable(nx, ny)) {
        log("Bump.");
        return;
      }

      const target = enemyAt(nx, ny);
      if (target) {
        // Attack instead of moving into them.
        target.hp -= 1;
        log("You boop an enemy.");
        if (target.hp <= 0) {
          state.enemies = state.enemies.filter((e) => e !== target);
          state.score += 10 + state.floor * 2;
          log("Enemy popped!");
        }
        endTurn();
        return;
      }

      state.player.x = nx;
      state.player.y = ny;
      state.turn += 1;

      const item = state.items.get(keyOf(nx, ny));
      if (item) {
        if (item.type === ITEM.GEM) {
          state.score += item.value;
          log(`Gem +${item.value}.`);
          state.items.delete(keyOf(nx, ny));
        } else if (item.type === ITEM.HEART) {
          const before = state.player.hp;
          state.player.hp = clamp(state.player.hp + item.value, 0, state.player.maxHp);
          log(`Heart +${state.player.hp - before} HP.`);
          state.items.delete(keyOf(nx, ny));
        } else if (item.type === ITEM.STAIRS) {
          log("You found the stairs...");
          nextFloor();
          return;
        }
      }

      endTurn();
    }

    function nextFloor() {
      state.floor += 1;
      state.score += 25 + state.floor * 5;
      // Tiny ramp: +1 max HP every 2 floors.
      if (state.floor % 2 === 0) {
        state.player.maxHp += 1;
        state.player.hp = clamp(state.player.hp + 1, 0, state.player.maxHp);
        log("You feel tougher. +1 Max HP.");
      }

      state.seed = (state.seed * 1103515245 + 12345) >>> 0;
      const dungeon = generateDungeon({
        w: state.w,
        h: state.h,
        floor: state.floor,
        seed: state.seed,
      });
      applyDungeon(dungeon);
      updateHud();
      log(`Floor ${state.floor}.`);
    }

    function endTurn() {
      updateFov();
      moveEnemies();
      updateHud();
      draw();
      if (state.player.hp <= 0) {
        lose();
      }
    }

    function lose() {
      state.running = false;
      saveBest(state.score);
      updateHud();
      setOverlayMode(
        "gameover",
        `You reached floor ${state.floor}. Score: ${state.score}.`,
      );
      setOverlayOpen(true);
      clearLog();
      log("Game over.");
    }

    function moveEnemies() {
      // Enemies move one step each. If adjacent, they attack instead.
      for (const e of state.enemies) {
        const dist = manhattan(e, state.player);
        if (dist === 1) {
          state.player.hp = Math.max(0, state.player.hp - e.dmg);
          log(`Ouch! -${e.dmg} HP.`);
          continue;
        }

        const step = pickEnemyStep(e);
        if (!step) continue;
        const nx = e.x + step.dx;
        const ny = e.y + step.dy;
        if (!isWalkable(nx, ny)) continue;
        if (nx === state.player.x && ny === state.player.y) continue;
        if (enemyAt(nx, ny)) continue;
        e.x = nx;
        e.y = ny;
      }
    }

    function pickEnemyStep(enemy) {
      // If player is within "aggro" radius, drift toward them.
      const aggro = clamp(6 + Math.floor(state.floor / 2), 6, 10);
      const dist = manhattan(enemy, state.player);
      const options = Object.values(DIRS);

      if (dist <= aggro) {
        const scored = options
          .map((d) => ({ d, score: dist - manhattan({ x: enemy.x + d.dx, y: enemy.y + d.dy }, state.player) }))
          .sort((a, b) => b.score - a.score);
        const best = scored[0]?.score ?? 0;
        const top = scored.filter((s) => s.score === best).map((s) => s.d);
        return choice(top);
      }

      // Otherwise, random wander.
      return choice(options);
    }

    function draw() {
      // Resize tile size based on canvas size (CSS can scale canvas, but we keep internal crisp).
      const size = Math.min(canvas.width, canvas.height);
      state.tileSize = Math.floor(size / state.w);

      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const ts = state.tileSize;
      const padX = Math.floor((canvas.width - ts * state.w) / 2);
      const padY = Math.floor((canvas.height - ts * state.h) / 2);

      const drawCell = (x, y, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(padX + x * ts, padY + y * ts, ts, ts);
      };

      // Base dungeon with fog.
      for (let y = 0; y < state.h; y++) {
        for (let x = 0; x < state.w; x++) {
          const k = keyOf(x, y);
          const isSeen = state.seen.has(k);
          const isVisible = state.visible.has(k);

          if (!isSeen) {
            drawCell(x, y, COLORS.fog);
            continue;
          }

          const base = state.grid[y][x] === TILE.FLOOR ? COLORS.floor : COLORS.wall;
          drawCell(x, y, base);
          if (!isVisible) {
            ctx.fillStyle = COLORS.seen;
            ctx.fillRect(padX + x * ts, padY + y * ts, ts, ts);
          }
        }
      }

      // Items (only if seen; drawn brighter if visible).
      for (const [k, item] of state.items.entries()) {
        if (!state.seen.has(k)) continue;
        const [xStr, yStr] = k.split(",");
        const x = Number(xStr);
        const y = Number(yStr);
        const isVisible = state.visible.has(k);

        let color = COLORS.gem;
        if (item.type === ITEM.HEART) color = COLORS.heart;
        if (item.type === ITEM.STAIRS) color = COLORS.stairs;

        if (!isVisible) {
          // Dim.
          ctx.globalAlpha = 0.65;
        }

        // Draw as small rounded squares.
        const px = padX + x * ts;
        const py = padY + y * ts;
        const m = Math.max(2, Math.floor(ts * 0.22));
        ctx.fillStyle = color;
        roundRect(px + m, py + m, ts - 2 * m, ts - 2 * m, Math.floor(ts * 0.22));
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Enemies (only if visible).
      for (const e of state.enemies) {
        const k = keyOf(e.x, e.y);
        if (!state.visible.has(k)) continue;
        drawDot(e.x, e.y, COLORS.enemy);
      }

      // Player
      drawDot(state.player.x, state.player.y, COLORS.player);

      function drawDot(x, y, color) {
        const cxp = padX + x * ts + ts / 2;
        const cyp = padY + y * ts + ts / 2;
        const r = ts * 0.36;
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(cxp, cyp, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = Math.max(1, Math.floor(ts * 0.06));
        ctx.stroke();
      }
    }

    function roundRect(x, y, w, h, r) {
      const rr = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    }

    function fitCanvasToContainer() {
      // Keep a square internal resolution for crisp pixel-ish look.
      const rect = canvas.getBoundingClientRect();
      const cssSize = Math.floor(Math.min(rect.width, window.innerHeight * 0.62));
      const device = window.devicePixelRatio || 1;
      const internal = clamp(Math.floor(cssSize * device), 420, 980);
      canvas.width = internal;
      canvas.height = internal;
      draw();
    }

    function startNewRun() {
      state.running = true;
      state.floor = 1;
      state.score = 0;
      state.turn = 0;
      state.player.maxHp = 12;
      state.player.hp = 12;
      state.vision = 7;
      state.seed = randInt(1, 2_000_000_000);

      clearLog();
      log("Find the stairs (green). Gems = score. Hearts = HP.");

      const dungeon = generateDungeon({
        w: state.w,
        h: state.h,
        floor: state.floor,
        seed: state.seed,
      });
      applyDungeon(dungeon);
      updateHud();
      setOverlayMode("help", "");
      setOverlayOpen(false);
      fitCanvasToContainer();
    }

    return {
      state,
      fitCanvasToContainer,
      startNewRun,
      move: (dir) => {
        const d = DIRS[dir];
        if (!d) return;
        tryMovePlayer(d.dx, d.dy);
      },
      toggleHelp: () => setOverlayOpen(!overlay.classList.contains("open")),
      showHelp: () => setOverlayOpen(true),
      hideHelp: () => setOverlayOpen(false),
    };
  }

  const game = makeGame();
  game.fitCanvasToContainer();
  setOverlayMode("help", "");
  game.showHelp();

  function handleKeyDown(e) {
    const key = e.key.toLowerCase();
    const map = {
      arrowup: "up",
      w: "up",
      arrowdown: "down",
      s: "down",
      arrowleft: "left",
      a: "left",
      arrowright: "right",
      d: "right",
    };

    if (key in map) {
      e.preventDefault();
      game.move(map[key]);
      return;
    }

    if (key === "?" || (key === "/" && e.shiftKey)) {
      e.preventDefault();
      game.toggleHelp();
      return;
    }

    if (key === "r") {
      e.preventDefault();
      game.startNewRun();
      return;
    }
  }

  window.addEventListener("keydown", handleKeyDown, { passive: false });
  window.addEventListener("resize", () => game.fitCanvasToContainer());

  dpad?.addEventListener("pointerdown", (e) => {
    const btn = e.target.closest("[data-move]");
    if (!btn) return;
    e.preventDefault();
    game.move(btn.dataset.move);
  });

  startBtn.addEventListener("click", () => game.startNewRun());
  closeHelpBtn.addEventListener("click", () => game.hideHelp());
  helpBtn.addEventListener("click", () => game.toggleHelp());
  newBtn.addEventListener("click", () => game.startNewRun());

  // Prevent long-press / context menu on mobile.
  document.addEventListener("contextmenu", (e) => e.preventDefault());
})();

