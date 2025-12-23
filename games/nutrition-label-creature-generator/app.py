from flask import Flask, render_template, jsonify, request
import requests
from creature_generator import CreatureGenerator

app = Flask(__name__)
generator = CreatureGenerator()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/scan', methods=['POST'])
def scan():
    data = request.json
    barcode = data.get('barcode')
    
    if not barcode:
        return jsonify({"error": "No barcode provided"}), 400

    # Fetch from OpenFoodFacts
    url = f"https://world.openfoodfacts.org/api/v0/product/{barcode}.json"
    try:
        response = requests.get(url, timeout=10)
        product_data = response.json()
        
        if product_data.get('status') == 0:
            return jsonify({"error": "Product not found"}), 404
            
        product = product_data.get('product', {})
        creature = generator.generate(barcode, product)
        
        return jsonify(creature)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
