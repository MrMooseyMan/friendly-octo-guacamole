import requests
from creature_generator import generate_creature
import json

def test_product(barcode, name_hint=""):
    print(f"\nTesting {name_hint} ({barcode})...")
    url = f"https://world.openfoodfacts.org/api/v0/product/{barcode}.json"
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
        
        if data.get('status') == 1:
            product = data['product']
            creature = generate_creature(product)
            print(f"Name: {creature.name}")
            print(f"Type: {creature.type}")
            print(f"Stats: {creature.stats}")
            print(f"Desc: {creature.description}")
        else:
            print("Product not found")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_product("5449000000996", "Coca Cola")
    test_product("3017620422003", "Nutella")
    test_product("8000500003787", "Kinder Bueno")
