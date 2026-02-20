# Wild-Dot Crawler — Wilds Edition

A puzzle RPG set in an explorable world of natural biomes. Connect essences, charge guardians, explore branching paths, and fight through diverse encounters. Inspired by the unreleased Dots Wilds.

## How to Play

**Goal:** Traverse the wilds, defeating creatures and bosses while growing stronger with your guardian companion.

### Controls
- **Drag** across essence nodes to connect 3+ of the same color
- **Diagonal connections** are allowed
- **White (Pure) essences** are wildcards that connect to any color
- **Form a loop** by dragging back to your starting node to clear ALL essences of that color!

### Essence Types
| Essence | Color | Effect |
|---------|-------|--------|
| Fire | Red | Deal damage to enemy |
| Life | Green | Heal yourself |
| Storm | Blue | Deal damage + chance to shock (increased damage taken) |
| Earth | Yellow | Gain shield (blocks damage) |
| Shadow | Purple | Deal damage + apply poison (damage over time) |
| Pure | White | Earn gold & XP (wildcard connector) |

### Guardian System
Choose one of 5 guardians to accompany you. Your guardian charges as you connect essences — matching your guardian's element charges it much faster!

| Guardian | Element | Ability |
|----------|---------|---------|
| Verdant Spirit | Life (Green) | **Renewal** — Full heal + cleanse all debuffs |
| Storm Hawk | Storm (Blue) | **Thunderbolt** — Massive damage + stun enemy |
| Stone Sentinel | Earth (Yellow) | **Fortify** — Massive shield + thorns |
| Ember Phoenix | Fire (Red) | **Inferno** — Fire burst + strong burn |
| Shadow Panther | Shadow (Purple) | **Shadowstrike** — Poison + weaken enemy attacks |

### Loop/Square Mechanic
Form a closed loop by connecting essences back to your starting node (minimum 4 essences). This clears **ALL** essences of that color from the board — a devastating move that deals massive damage, heals enormously, or shields heavily depending on the color!

### Branching Paths
After each encounter, choose your path through the wilds:
- **Battle** — Fight a creature blocking the path
- **Elite Battle** — Face a tougher foe for richer rewards
- **Rest Site** — Heal 30% HP and cleanse debuffs
- **Guardian Shrine** — Switch your guardian or get bonus charge
- **Treasure Cache** — Discover gold and items

Boss encounters are forced every 5 floors — no choice, you must face them!

### Biomes
The world is divided into 4 distinct regions:
- **Verdant Wilds** (Floors 1-12) — Lush forests and meadows
- **Frost Peaks** (Floors 13-24) — Frozen mountains and ice caves
- **Shadow Depths** (Floors 25-36) — Dark caverns and shadowy ruins
- **Dragon's Cradle** (Floors 37-50) — Volcanic landscape of ancient power

### Combat
- You get **3 moves per turn** (upgradeable)
- After your moves, the enemy attacks
- Shield absorbs damage before HP
- Defeat enemies to earn **gold, XP, and potions**

### Progression
- **Level Up**: Gain XP to level up and choose powerful upgrades
- **Upgrades**: 12 different upgrades including Guardian Mastery and Attunement
- **Achievements**: Unlock permanent perks across runs
- **Meta-progression**: Your achievements persist between runs

### Tips
1. **Match your guardian's element** for fast charging
2. **Form loops** for devastating board clears
3. **Build combos** — each match in a turn increases your multiplier
4. **Balance offense and defense** — shields and heals keep you alive
5. **Choose paths wisely** — rest before boss floors, treasure for resources
6. **Pick the right guardian** — Verdant for survival, Ember/Storm for aggression

## Tech Stack
- Vanilla JavaScript
- Tailwind CSS
- Tone.js for audio
- SVG graphics
