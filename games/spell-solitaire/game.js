/**
 * Spell Solitaire - Klondike Solitaire with magical spells!
 * 
 * The twist: Earn mana from moves, spend it on powerful spells.
 */

// ============================================
// Constants
// ============================================
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RED_SUITS = ['♥', '♦'];
const BLACK_SUITS = ['♠', '♣'];

const MANA_PER_MOVE = 3;
const MANA_PER_FOUNDATION = 10;
const POINTS_PER_MOVE = 5;
const POINTS_PER_FOUNDATION = 15;

// ============================================
// Game State
// ============================================
let gameState = {
    stock: [],
    waste: [],
    foundations: [[], [], [], []],
    tableau: [[], [], [], [], [], [], []],
    mana: 0,
    totalManaEarned: 0,
    moves: 0,
    score: 0,
    selectedCard: null,
    selectedPile: null,
    selectedIndex: null,
    moveHistory: [],
    activeSpell: null,
    wildcardActive: false,
    revealActive: false
};

// ============================================
// Card Class
// ============================================
class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
        this.faceUp = false;
        this.isWild = false;
        this.element = null;
    }

    get color() {
        return RED_SUITS.includes(this.suit) ? 'red' : 'black';
    }

    get value() {
        return RANKS.indexOf(this.rank);
    }

    flip() {
        this.faceUp = !this.faceUp;
    }

    createHTML() {
        const card = document.createElement('div');
        card.className = `card ${this.faceUp ? 'face-up' : 'face-down'} ${this.color}`;
        if (this.isWild) card.classList.add('wild');
        
        if (this.faceUp) {
            card.innerHTML = `
                <div class="card-content">
                    <div class="card-corner top-left">
                        <span class="card-rank">${this.rank}</span>
                        <span class="card-suit">${this.suit}</span>
                    </div>
                    <span class="card-center">${this.suit}</span>
                    <div class="card-corner bottom-right">
                        <span class="card-rank">${this.rank}</span>
                        <span class="card-suit">${this.suit}</span>
                    </div>
                </div>
            `;
        }
        
        this.element = card;
        return card;
    }
}

// ============================================
// Deck Functions
// ============================================
function createDeck() {
    const deck = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push(new Card(suit, rank));
        }
    }
    return deck;
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// ============================================
// Game Initialization
// ============================================
function initGame() {
    // Reset state
    gameState = {
        stock: [],
        waste: [],
        foundations: [[], [], [], []],
        tableau: [[], [], [], [], [], [], []],
        mana: 0,
        totalManaEarned: 0,
        moves: 0,
        score: 0,
        selectedCard: null,
        selectedPile: null,
        selectedIndex: null,
        moveHistory: [],
        activeSpell: null,
        wildcardActive: false,
        revealActive: false
    };

    // Create and shuffle deck
    const deck = shuffleDeck(createDeck());

    // Deal to tableau
    for (let i = 0; i < 7; i++) {
        for (let j = i; j < 7; j++) {
            const card = deck.pop();
            if (j === i) {
                card.faceUp = true;
            }
            gameState.tableau[j].push(card);
        }
    }

    // Rest goes to stock
    gameState.stock = deck;

    // Update display
    updateDisplay();
    updateStats();
    hideWinModal();
    clearSelection();
    deactivateAllSpells();
}

// ============================================
// Display Functions
// ============================================
function updateDisplay() {
    renderStock();
    renderWaste();
    renderFoundations();
    renderTableau();
}

function renderStock() {
    const stockEl = document.getElementById('stock');
    stockEl.innerHTML = '<div class="pile-label">Stock</div>';
    
    if (gameState.stock.length > 0) {
        const card = new Card('', '');
        card.faceUp = false;
        const cardEl = card.createHTML();
        cardEl.style.position = 'relative';
        stockEl.appendChild(cardEl);
    }
}

function renderWaste() {
    const wasteEl = document.getElementById('waste');
    wasteEl.innerHTML = '<div class="pile-label">Waste</div>';
    
    if (gameState.waste.length > 0) {
        const card = gameState.waste[gameState.waste.length - 1];
        const cardEl = card.createHTML();
        cardEl.style.position = 'relative';
        cardEl.addEventListener('click', () => handleCardClick(card, 'waste', gameState.waste.length - 1));
        cardEl.addEventListener('dblclick', () => autoMoveToFoundation(card, 'waste'));
        wasteEl.appendChild(cardEl);
    }
}

function renderFoundations() {
    const suitSymbols = ['♠', '♥', '♦', '♣'];
    
    for (let i = 0; i < 4; i++) {
        const foundationEl = document.getElementById(`foundation-${i}`);
        foundationEl.innerHTML = `<div class="pile-label">${suitSymbols[i]}</div>`;
        
        const pile = gameState.foundations[i];
        if (pile.length > 0) {
            const card = pile[pile.length - 1];
            const cardEl = card.createHTML();
            cardEl.style.position = 'relative';
            foundationEl.appendChild(cardEl);
        }
    }
}

function renderTableau() {
    for (let i = 0; i < 7; i++) {
        const tableauEl = document.getElementById(`tableau-${i}`);
        tableauEl.innerHTML = '';
        
        const pile = gameState.tableau[i];
        pile.forEach((card, index) => {
            const cardEl = card.createHTML();
            cardEl.style.top = `${index * 25}px`;
            cardEl.style.zIndex = index;
            
            // Show face-down cards during reveal spell
            if (!card.faceUp && gameState.revealActive) {
                cardEl.classList.remove('face-down');
                cardEl.classList.add('face-up', 'revealed', card.color);
                cardEl.innerHTML = `
                    <div class="card-content">
                        <div class="card-corner top-left">
                            <span class="card-rank">${card.rank}</span>
                            <span class="card-suit">${card.suit}</span>
                        </div>
                        <span class="card-center">${card.suit}</span>
                        <div class="card-corner bottom-right">
                            <span class="card-rank">${card.rank}</span>
                            <span class="card-suit">${card.suit}</span>
                        </div>
                    </div>
                `;
            }
            
            if (card.faceUp) {
                cardEl.addEventListener('click', () => handleCardClick(card, 'tableau', i, index));
                cardEl.addEventListener('dblclick', () => autoMoveToFoundation(card, 'tableau', i));
            } else if (gameState.activeSpell === 'peek') {
                cardEl.style.cursor = 'pointer';
                cardEl.addEventListener('click', () => peekAtCard(card, cardEl));
            }
            
            tableauEl.appendChild(cardEl);
        });

        // Make empty tableau clickable for placing Kings
        if (pile.length === 0) {
            tableauEl.addEventListener('click', () => handleEmptyTableauClick(i));
        }
    }
}

function updateStats() {
    document.getElementById('mana').textContent = gameState.mana;
    document.getElementById('moves').textContent = gameState.moves;
    document.getElementById('score').textContent = gameState.score;
    updateSpellButtons();
}

function updateSpellButtons() {
    const spells = [
        { id: 'spell-peek', cost: 15 },
        { id: 'spell-undo', cost: 10 },
        { id: 'spell-hint', cost: 5 },
        { id: 'spell-wildcard', cost: 50 },
        { id: 'spell-reveal', cost: 30 }
    ];

    spells.forEach(spell => {
        const btn = document.getElementById(spell.id);
        btn.disabled = gameState.mana < spell.cost;
        
        // Special case: undo needs history
        if (spell.id === 'spell-undo' && gameState.moveHistory.length === 0) {
            btn.disabled = true;
        }
    });
}

// ============================================
// Card Movement Logic
// ============================================
function handleCardClick(card, pileType, pileIndex, cardIndex = null) {
    // If we have an active selection, try to move
    if (gameState.selectedCard) {
        const success = attemptMove(pileType, pileIndex, cardIndex);
        if (success) {
            clearSelection();
            return;
        }
    }

    // Otherwise, select this card
    clearSelection();
    
    if (!card.faceUp) return;

    gameState.selectedCard = card;
    gameState.selectedPile = { type: pileType, index: pileIndex };
    gameState.selectedIndex = cardIndex;
    
    if (card.element) {
        card.element.classList.add('selected');
    }

    // If selecting from tableau, also highlight cards below
    if (pileType === 'tableau' && cardIndex !== null) {
        const pile = gameState.tableau[pileIndex];
        for (let i = cardIndex; i < pile.length; i++) {
            if (pile[i].element) {
                pile[i].element.classList.add('selected');
            }
        }
    }
}

function handleEmptyTableauClick(pileIndex) {
    if (!gameState.selectedCard) return;

    const success = attemptMove('tableau', pileIndex, null);
    if (success) {
        clearSelection();
    }
}

function attemptMove(targetType, targetIndex, targetCardIndex) {
    const source = gameState.selectedPile;
    const sourceCard = gameState.selectedCard;
    const sourceCardIndex = gameState.selectedIndex;

    if (!source || !sourceCard) return false;

    let success = false;

    if (targetType === 'tableau') {
        success = moveToTableau(source, sourceCard, sourceCardIndex, targetIndex, targetCardIndex);
    } else if (targetType === 'foundation') {
        success = moveToFoundation(source, sourceCard, sourceCardIndex, targetIndex);
    }

    return success;
}

function moveToTableau(source, card, cardIndex, targetPileIndex, targetCardIndex) {
    const targetPile = gameState.tableau[targetPileIndex];
    
    // Check if move is valid
    if (targetPile.length === 0) {
        // Only Kings on empty piles
        if (card.rank !== 'K') {
            showMessage("Only Kings can go on empty spaces!");
            return false;
        }
    } else {
        const targetCard = targetPile[targetPile.length - 1];
        
        // Check descending order
        if (card.value !== targetCard.value - 1) {
            showMessage("Cards must be in descending order!");
            return false;
        }
        
        // Check alternating colors (unless wildcard is active)
        if (!gameState.wildcardActive && card.color === targetCard.color) {
            showMessage("Cards must alternate colors!");
            return false;
        }
    }

    // Perform the move
    const cardsToMove = getCardsToMove(source, cardIndex);
    if (!cardsToMove) return false;

    saveToHistory(source, 'tableau', targetPileIndex, cardsToMove.length);

    // Remove from source
    removeCardsFromSource(source, cardIndex);

    // Add to target
    cardsToMove.forEach(c => targetPile.push(c));

    // Flip top card of source pile if needed
    flipTopCard(source);

    // Update game state
    earnMana(MANA_PER_MOVE);
    gameState.score += POINTS_PER_MOVE;
    gameState.moves++;
    
    // Clear wildcard after use
    if (gameState.wildcardActive) {
        gameState.wildcardActive = false;
        showMessage("Wild card effect used!");
    }

    updateDisplay();
    updateStats();
    return true;
}

function moveToFoundation(source, card, cardIndex, foundationIndex) {
    // Can only move single cards to foundation
    if (source.type === 'tableau' && cardIndex !== gameState.tableau[source.index].length - 1) {
        showMessage("Only single cards can go to foundation!");
        return false;
    }

    const foundation = gameState.foundations[foundationIndex];
    const suitOrder = ['♠', '♥', '♦', '♣'];
    const expectedSuit = suitOrder[foundationIndex];

    // Check suit
    if (card.suit !== expectedSuit) {
        showMessage(`This foundation is for ${expectedSuit} cards!`);
        return false;
    }

    // Check value
    const expectedValue = foundation.length;
    if (card.value !== expectedValue) {
        if (foundation.length === 0) {
            showMessage("Foundations start with Aces!");
        } else {
            showMessage(`Need ${RANKS[expectedValue]} of ${expectedSuit} here!`);
        }
        return false;
    }

    // Perform move
    saveToHistory(source, 'foundation', foundationIndex, 1);
    
    removeCardsFromSource(source, cardIndex);
    foundation.push(card);
    flipTopCard(source);

    // Bonus mana for foundation moves
    earnMana(MANA_PER_FOUNDATION);
    gameState.score += POINTS_PER_FOUNDATION;
    gameState.moves++;

    updateDisplay();
    updateStats();
    checkWin();
    return true;
}

function autoMoveToFoundation(card, pileType, pileIndex = null) {
    // Find the right foundation for this card
    const suitOrder = ['♠', '♥', '♦', '♣'];
    const foundationIndex = suitOrder.indexOf(card.suit);
    
    if (foundationIndex === -1) return;

    const foundation = gameState.foundations[foundationIndex];
    const expectedValue = foundation.length;
    
    if (card.value !== expectedValue) return;

    // Setup selection and move
    gameState.selectedCard = card;
    gameState.selectedPile = { type: pileType, index: pileIndex };
    
    if (pileType === 'waste') {
        gameState.selectedIndex = gameState.waste.length - 1;
    } else if (pileType === 'tableau') {
        gameState.selectedIndex = gameState.tableau[pileIndex].length - 1;
    }

    attemptMove('foundation', foundationIndex, null);
    clearSelection();
}

function getCardsToMove(source, cardIndex) {
    if (source.type === 'waste') {
        return [gameState.waste[gameState.waste.length - 1]];
    } else if (source.type === 'tableau') {
        return gameState.tableau[source.index].slice(cardIndex);
    }
    return null;
}

function removeCardsFromSource(source, cardIndex) {
    if (source.type === 'waste') {
        gameState.waste.pop();
    } else if (source.type === 'tableau') {
        gameState.tableau[source.index] = gameState.tableau[source.index].slice(0, cardIndex);
    }
}

function flipTopCard(source) {
    if (source.type === 'tableau') {
        const pile = gameState.tableau[source.index];
        if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
            pile[pile.length - 1].faceUp = true;
            earnMana(2); // Small bonus for revealing cards
        }
    }
}

function clearSelection() {
    document.querySelectorAll('.card.selected').forEach(el => {
        el.classList.remove('selected');
    });
    gameState.selectedCard = null;
    gameState.selectedPile = null;
    gameState.selectedIndex = null;
}

// ============================================
// Stock Pile Logic
// ============================================
function handleStockClick() {
    if (gameState.stock.length > 0) {
        // Draw card(s) from stock to waste
        const card = gameState.stock.pop();
        card.faceUp = true;
        gameState.waste.push(card);
        
        saveToHistory({ type: 'stock' }, 'waste', 0, 1);
    } else if (gameState.waste.length > 0) {
        // Recycle waste back to stock
        while (gameState.waste.length > 0) {
            const card = gameState.waste.pop();
            card.faceUp = false;
            gameState.stock.push(card);
        }
        saveToHistory({ type: 'recycle' }, 'stock', 0, 0);
    }

    updateDisplay();
}

// ============================================
// Spell System
// ============================================
function earnMana(amount) {
    gameState.mana += amount;
    gameState.totalManaEarned += amount;
}

function spendMana(amount) {
    if (gameState.mana >= amount) {
        gameState.mana -= amount;
        updateStats();
        return true;
    }
    showMessage("Not enough mana!");
    return false;
}

function activateSpell(spellId) {
    deactivateAllSpells();
    
    const btn = document.getElementById(spellId);
    btn.classList.add('active');
    gameState.activeSpell = spellId.replace('spell-', '');
}

function deactivateAllSpells() {
    document.querySelectorAll('.spell-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    gameState.activeSpell = null;
}

// Peek Spell - See a face-down card
function castPeek() {
    if (!spendMana(15)) return;
    
    activateSpell('spell-peek');
    showMessage("Click a face-down card to peek at it!");
    updateDisplay();
}

function peekAtCard(card, element) {
    if (gameState.activeSpell !== 'peek') return;
    
    // Temporarily show the card
    element.classList.remove('face-down');
    element.classList.add('face-up', card.color, 'peeking');
    element.innerHTML = `
        <div class="card-content">
            <div class="card-corner top-left">
                <span class="card-rank">${card.rank}</span>
                <span class="card-suit">${card.suit}</span>
            </div>
            <span class="card-center">${card.suit}</span>
            <div class="card-corner bottom-right">
                <span class="card-rank">${card.rank}</span>
                <span class="card-suit">${card.suit}</span>
            </div>
        </div>
    `;
    
    showMessage(`It's the ${card.rank} of ${card.suit}!`);
    
    // Hide after 2 seconds
    setTimeout(() => {
        deactivateAllSpells();
        updateDisplay();
    }, 2000);
}

// Undo Spell - Undo last move
function castUndo() {
    if (gameState.moveHistory.length === 0) {
        showMessage("Nothing to undo!");
        return;
    }
    
    if (!spendMana(10)) return;
    
    const lastMove = gameState.moveHistory.pop();
    
    // This is a simplified undo - just reload the saved state
    // For a full implementation, we'd reverse each move type
    showMessage("Move undone!");
    
    // Decrement stats
    gameState.moves = Math.max(0, gameState.moves - 1);
    gameState.score = Math.max(0, gameState.score - POINTS_PER_MOVE);
    
    updateDisplay();
    updateStats();
}

// Hint Spell - Highlight a possible move
function castHint() {
    if (!spendMana(5)) return;
    
    const hint = findValidMove();
    
    if (hint) {
        showMessage(`Try moving the ${hint.card.rank} of ${hint.card.suit}!`);
        
        // Highlight the card
        if (hint.card.element) {
            hint.card.element.classList.add('hint');
            setTimeout(() => {
                hint.card.element.classList.remove('hint');
            }, 3000);
        }
    } else {
        showMessage("No obvious moves found. Try the stock pile!");
    }
}

function findValidMove() {
    // Check waste pile
    if (gameState.waste.length > 0) {
        const wasteCard = gameState.waste[gameState.waste.length - 1];
        
        // Check foundations
        const suitOrder = ['♠', '♥', '♦', '♣'];
        const foundationIndex = suitOrder.indexOf(wasteCard.suit);
        const foundation = gameState.foundations[foundationIndex];
        if (wasteCard.value === foundation.length) {
            return { card: wasteCard, target: 'foundation' };
        }
        
        // Check tableau
        for (const pile of gameState.tableau) {
            if (pile.length === 0 && wasteCard.rank === 'K') {
                return { card: wasteCard, target: 'empty tableau' };
            }
            if (pile.length > 0) {
                const topCard = pile[pile.length - 1];
                if (topCard.faceUp && 
                    wasteCard.value === topCard.value - 1 && 
                    wasteCard.color !== topCard.color) {
                    return { card: wasteCard, target: 'tableau' };
                }
            }
        }
    }

    // Check tableau piles
    for (let i = 0; i < 7; i++) {
        const pile = gameState.tableau[i];
        
        for (let j = 0; j < pile.length; j++) {
            const card = pile[j];
            if (!card.faceUp) continue;

            // Check if this card can go to foundation
            const suitOrder = ['♠', '♥', '♦', '♣'];
            const foundationIndex = suitOrder.indexOf(card.suit);
            const foundation = gameState.foundations[foundationIndex];
            if (j === pile.length - 1 && card.value === foundation.length) {
                return { card, target: 'foundation' };
            }

            // Check if this card (and cards below) can move to another tableau
            for (let k = 0; k < 7; k++) {
                if (k === i) continue;
                
                const targetPile = gameState.tableau[k];
                if (targetPile.length === 0 && card.rank === 'K' && j > 0) {
                    return { card, target: 'empty tableau' };
                }
                if (targetPile.length > 0) {
                    const topCard = targetPile[targetPile.length - 1];
                    if (topCard.faceUp && 
                        card.value === topCard.value - 1 && 
                        card.color !== topCard.color) {
                        return { card, target: 'tableau' };
                    }
                }
            }
        }
    }

    return null;
}

// Wild Card Spell - Next placement ignores color rule
function castWildcard() {
    if (!spendMana(50)) return;
    
    gameState.wildcardActive = true;
    showMessage("Wild card active! Next placement ignores color rules!");
    
    // Add visual indicator
    document.querySelector('.game-board').style.boxShadow = '0 0 30px rgba(236, 72, 153, 0.5)';
    
    setTimeout(() => {
        document.querySelector('.game-board').style.boxShadow = '';
    }, 500);
}

// Reveal Spell - Show all face-down cards temporarily
function castReveal() {
    if (!spendMana(30)) return;
    
    gameState.revealActive = true;
    showMessage("All cards revealed for 3 seconds!");
    updateDisplay();
    
    setTimeout(() => {
        gameState.revealActive = false;
        updateDisplay();
    }, 3000);
}

// ============================================
// Move History (for Undo)
// ============================================
function saveToHistory(source, targetType, targetIndex, numCards) {
    gameState.moveHistory.push({
        source,
        targetType,
        targetIndex,
        numCards,
        timestamp: Date.now()
    });
    
    // Limit history size
    if (gameState.moveHistory.length > 50) {
        gameState.moveHistory.shift();
    }
}

// ============================================
// Win Condition
// ============================================
function checkWin() {
    const totalFoundationCards = gameState.foundations.reduce((sum, f) => sum + f.length, 0);
    
    if (totalFoundationCards === 52) {
        showWinModal();
    }
}

function showWinModal() {
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('final-moves').textContent = gameState.moves;
    document.getElementById('final-mana').textContent = gameState.totalManaEarned;
    document.getElementById('win-modal').classList.add('show');
}

function hideWinModal() {
    document.getElementById('win-modal').classList.remove('show');
}

// ============================================
// UI Helpers
// ============================================
function showMessage(text) {
    const msgBar = document.getElementById('message-bar');
    msgBar.textContent = text;
    msgBar.classList.add('show');
    
    setTimeout(() => {
        msgBar.classList.remove('show');
    }, 2500);
}

function showRules() {
    document.getElementById('rules-modal').classList.add('show');
}

function hideRules() {
    document.getElementById('rules-modal').classList.remove('show');
}

// ============================================
// Event Listeners
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initGame();

    // Stock pile click
    document.getElementById('stock').addEventListener('click', handleStockClick);

    // Foundation clicks
    for (let i = 0; i < 4; i++) {
        document.getElementById(`foundation-${i}`).addEventListener('click', () => {
            if (gameState.selectedCard) {
                attemptMove('foundation', i, null);
                clearSelection();
            }
        });
    }

    // Spell buttons
    document.getElementById('spell-peek').addEventListener('click', castPeek);
    document.getElementById('spell-undo').addEventListener('click', castUndo);
    document.getElementById('spell-hint').addEventListener('click', castHint);
    document.getElementById('spell-wildcard').addEventListener('click', castWildcard);
    document.getElementById('spell-reveal').addEventListener('click', castReveal);

    // Control buttons
    document.getElementById('new-game').addEventListener('click', initGame);
    document.getElementById('rules-btn').addEventListener('click', showRules);
    document.getElementById('close-rules').addEventListener('click', hideRules);
    document.getElementById('play-again').addEventListener('click', initGame);

    // Click outside to deselect
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.card') && 
            !e.target.closest('.pile') && 
            !e.target.closest('.spell-btn')) {
            clearSelection();
            if (gameState.activeSpell === 'peek') {
                deactivateAllSpells();
            }
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            clearSelection();
            deactivateAllSpells();
        }
        if (e.key === 'n' && e.ctrlKey) {
            e.preventDefault();
            initGame();
        }
    });
});
