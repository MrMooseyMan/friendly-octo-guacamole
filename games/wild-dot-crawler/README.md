# Wild-Dot Crawler: Reforged

A rebuilt version of the original rune crawler with a much stronger game loop:

- **Branching route progression** across 3 acts
- **One consistent combat rule set** built around drag-chaining sigils
- **Enemy intent previews** so fights feel tactical instead of random
- **Boons, shops, shrines, caches, and campfires** between battles
- **Automatic Wildfalls** when refills create 4+ connected sigils
- **Mobile-first static web build** with no toolchain required

## How to Play

### Core loop
1. Start a run.
2. Pick routes through each act.
3. Fight enemies by dragging through **3 or more adjacent matching sigils**.
4. Take a boon after battles and use events to stabilize or greed for power.
5. Survive all 3 acts and defeat the final boss.

### Sigils
- **Claw**: direct damage
- **Bloom**: healing and debuff cleansing on long chains
- **Tide**: charges Bestial Surge
- **Guard**: builds armor
- **Venom**: damage plus poison
- **Wild**: connects to anything and grants bonus gold

### Combat flow
- You make **one chain per turn**
- After your chain resolves, the enemy performs its next **telegraphed intent**
- Poison ticks at the end of the affected unit's turn
- Long chains hit harder
- Refill-created 4+ clusters trigger **Wildfalls** automatically

## Node Types

- **Skirmish**: normal fight and boon
- **Elite Hunt**: harder fight, better rewards
- **Boss**: end-of-act showdown
- **Campfire**: heal or train
- **Trader**: spend gold
- **Shrine**: free blessing
- **Cache**: grab resources

## Running Locally

This is still a static web project.

Open `games/wild-dot-crawler/index.html` in a browser, or serve the repo root:

```bash
python3 -m http.server 8000
```

Then visit:

`http://localhost:8000/games/wild-dot-crawler/`

## Files

- `index.html` - game shell
- `style.css` - full visual treatment and layout
- `content.js` - encounters, sigils, boons, route templates
- `audio.js` - lightweight sound controller
- `storage.js` - localStorage meta/settings
- `main.js` - game loop, combat, board engine, UI rendering
