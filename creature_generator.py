import hashlib

class Creature:
    def __init__(self, name, stats, creature_type, image_url, description):
        self.name = name
        self.stats = stats
        self.type = creature_type
        self.image_url = image_url
        self.description = description

    def to_dict(self):
        return {
            "name": self.name,
            "stats": self.stats,
            "type": self.type,
            "image_url": self.image_url,
            "description": self.description
        }

def generate_creature(product_data):
    """
    Generates a creature based on product nutrition data.
    """
    nutriments = product_data.get('nutriments', {})
    
    # Try to find a valid name
    product_name = product_data.get('product_name', '')
    if not product_name:
        product_name = product_data.get('product_name_en', '')
    if not product_name:
        product_name = product_data.get('generic_name', '')
    if not product_name:
        product_name = "Unknown Artifact"

    # 1. Deterministic Stats Calculation
    # Normalize values somewhat to game-like stats (0-255 scale logic similar to Pokemon)
    
    calories = nutriments.get('energy-kcal_100g', 0) or 0
    sugars = nutriments.get('sugars_100g', 0) or 0
    fat = nutriments.get('fat_100g', 0) or 0
    protein = nutriments.get('proteins_100g', 0) or 0
    salt = nutriments.get('salt_100g', 0) or 0
    fiber = nutriments.get('fiber_100g', 0) or 0

    # Base Stats Logic
    hp = min(int(calories / 2) + 20, 255)  # Calories -> HP
    speed = min(int(sugars * 4) + 10, 255) # Sugar -> Speed
    defense = min(int(fat * 3) + 10, 255)   # Fat -> Defense
    attack = min(int(protein * 5) + 10, 255) # Protein -> Attack
    sp_atk = min(int(salt * 20) + 10, 255)   # Salt -> Special Attack (Reacts violently?)
    sp_def = min(int(fiber * 10) + 10, 255)  # Fiber -> Special Defense (Toughness)

    stats = {
        "HP": hp,
        "Attack": attack,
        "Defense": defense,
        "Speed": speed,
        "Sp. Atk": sp_atk,
        "Sp. Def": sp_def,
        "Total": hp + attack + defense + speed + sp_atk + sp_def
    }

    # 2. Determine Type
    # Simple logic to determine type based on highest contributing factor relative to "normal"
    types = []
    
    # Check for keywords first
    lower_name = product_name.lower()
    if 'water' in lower_name or 'aqua' in lower_name or 'drink' in lower_name:
        types.append("Water")
    if 'spicy' in lower_name or 'chili' in lower_name or 'pepper' in lower_name:
        types.append("Fire")
    if 'ice' in lower_name or 'frozen' in lower_name:
        types.append("Ice")
    if 'choco' in lower_name or 'cacao' in lower_name:
        types.append("Dark")
        
    # Check nutrients
    if sugars > 10: types.append("Electric") # High energy
    if protein > 8: types.append("Fighting") # Strong
    if fat > 10: types.append("Ground") # Heavy
    if salt > 0.8: types.append("Rock") # Salty
    if fiber > 2: types.append("Grass") # Plant-based
    
    # Prioritize types
    if not types:
        if calories > 300:
            types.append("Normal") # Just a big normal guy
        else:
            types.append("Normal") # Small normal guy
    
    # Deduplicate and limit
    unique_types = []
    for t in types:
        if t not in unique_types:
            unique_types.append(t)
            
    creature_type = "/".join(unique_types[:2]) # Max 2 types

    # 3. Generate Name
    # Create a name by mixing the product name with some suffix
    # or just use the product name creatively.
    # Let's try to make it sound "monster-y"
    clean_name = "".join(c for c in product_name if c.isalnum())
    if not clean_name:
        clean_name = "Unknown"
    
    clean_name = clean_name.capitalize()
    
    if len(clean_name) > 8:
        clean_name = clean_name[:8]
    
    suffixes = ["or", "mon", "ax", "us", "ix", "zor", "gorg", "th", "ra"]
    # Pick suffix deterministically based on name hash
    name_hash = int(hashlib.sha256(product_name.encode('utf-8')).hexdigest(), 16)
    suffix = suffixes[name_hash % len(suffixes)]
    
    generated_name = f"{clean_name}{suffix}"

    # 4. Generate Image (Identicon/MonsterID)
    # Using robohash.org for ease, it generates robots/monsters from text strings.
    # Set 2 is monsters.
    # Use generated_name for consistent image
    image_url = f"https://robohash.org/{generated_name}?set=set2&size=200x200"

    # 5. Description
    description = f"A {creature_type} type creature found in {product_name}. "
    
    traits = []
    if speed > 80: traits.append("moves with incredible speed")
    elif speed < 20: traits.append("is somewhat sluggish")
    
    if defense > 80: traits.append("has an impenetrable hide")
    
    if attack > 80: traits.append("possesses great strength")
    
    if sp_atk > 80: traits.append("radiates unstable energy")
    
    if hp > 150: traits.append("has massive stamina")
    
    if traits:
        description += "It " + " and ".join(traits) + "."
    else:
        description += "It seems fairly balanced and approachable."

    return Creature(generated_name, stats, creature_type, image_url, description)
