import hashlib
import random

class CreatureGenerator:
    def __init__(self):
        self.elements = {
            'water': ['water', 'aqua', 'liquid', 'drink'],
            'fire': ['spicy', 'chili', 'pepper', 'hot'],
            'earth': ['grain', 'wheat', 'oat', 'flour', 'fiber'],
            'ice': ['frozen', 'ice', 'cream', 'cool'],
            'plant': ['fruit', 'vegetable', 'leaf', 'herb'],
            'sugar': ['sugar', 'sweet', 'candy', 'chocolate', 'syrup'],
            'toxic': ['chemical', 'preservative', 'artificial', 'color'],
        }

    def _get_hash_seed(self, barcode):
        """Create a deterministic seed from the barcode."""
        return int(hashlib.sha256(barcode.encode('utf-8')).hexdigest(), 16)

    def _determine_element(self, product_data):
        """Determine creature element based on ingredients/categories."""
        text = ((product_data.get('ingredients_text') or '') + ' ' + 
                (product_data.get('categories') or '')).lower()
        
        scores = {elem: 0 for elem in self.elements}
        
        for elem, keywords in self.elements.items():
            for keyword in keywords:
                if keyword in text:
                    scores[elem] += 1
        
        # Default to Normal if no matches
        max_elem = max(scores, key=scores.get)
        return max_elem.capitalize() if scores[max_elem] > 0 else 'Normal'

    def _generate_name(self, product_name, seed):
        """Generate a creature name from the product name."""
        random.seed(seed)
        
        # Clean up name
        words = [w for w in product_name.split() if len(w) > 3]
        if not words:
            words = ["Glitch", "Blob", "Thing"]
            
        base = random.choice(words)
        suffixes = ['or', 'ax', 'ix', 'on', 'us', 'a', 'o', 'ite', 'ling']
        prefixes = ['Mc', 'Super', 'Ultra', 'Mega', '']
        
        suffix = random.choice(suffixes)
        prefix = random.choice(prefixes)
        
        # Simple transformation: truncate and add suffix
        core_name = base[:4] + suffix
        return f"{prefix}{core_name}".capitalize()

    def generate(self, barcode, product_data):
        """
        Generate a creature based on product data.
        """
        seed = self._get_hash_seed(barcode)
        random.seed(seed)
        
        nutriments = product_data.get('nutriments', {})
        
        # Base stats scaling (normalized roughly to 0-100 range usually)
        # Using 100g values for consistency
        
        # HP: Based on Calories (Energy)
        kcal = nutriments.get('energy-kcal_100g', 0) or 0
        hp = min(int(kcal / 5) + 50, 999) # Cap at 999
        
        # Attack: Based on Protein
        protein = nutriments.get('proteins_100g', 0) or 0
        attack = min(int(protein * 5) + 10, 255)
        
        # Defense: Based on Fat
        fat = nutriments.get('fat_100g', 0) or 0
        defense = min(int(fat * 4) + 10, 255)
        
        # Speed: Based on Carbohydrates (sugar rush!)
        carbs = nutriments.get('carbohydrates_100g', 0) or 0
        speed = min(int(carbs * 2) + 10, 255)
        
        # Special Attack: Based on Sugar
        sugar = nutriments.get('sugars_100g', 0) or 0
        sp_attack = min(int(sugar * 3) + 10, 255)

        element = self._determine_element(product_data)
        name = self._generate_name(product_data.get('product_name') or 'Unknown', seed)
        
        # Procedural description
        descriptors = [
            "A wild creature born from the essence of nutrition.",
            f"It radiates {element.lower()} energy.",
            f"Its power level is over {int(hp + attack + defense)}!"
        ]
        
        # Visual characteristics (text-based for now)
        colors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'White', 'Black']
        body_types = ['Round', 'Spiky', 'Slimy', 'Muscular', 'Ghostly', 'Metallic']
        
        color = random.choice(colors)
        body = random.choice(body_types)

        return {
            "name": name,
            "element": element,
            "stats": {
                "hp": hp,
                "attack": attack,
                "defense": defense,
                "speed": speed,
                "sp_attack": sp_attack
            },
            "visuals": {
                "color": color,
                "body_type": body,
                "description": " ".join(descriptors)
            },
            "source_product": product_data.get('product_name') or 'Unknown Product'
        }
