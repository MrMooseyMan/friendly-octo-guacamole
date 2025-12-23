from flask import Flask, render_template, request, jsonify
import requests
from creature_generator import generate_creature

app = Flask(__name__)

# Open Food Facts API URL
OFF_API_URL = "https://world.openfoodfacts.org/api/v0/product/{}.json"

@app.route('/', methods=['GET', 'POST'])
def index():
    creature = None
    error = None
    barcode = ""

    if request.method == 'POST':
        barcode = request.form.get('barcode')
        if barcode:
            try:
                # Fetch data from Open Food Facts
                response = requests.get(OFF_API_URL.format(barcode))
                data = response.json()

                if data.get('status') == 1:
                    product = data['product']
                    creature = generate_creature(product)
                    creature = creature.to_dict()
                else:
                    error = "Product not found or invalid barcode."
            except Exception as e:
                error = f"Error connecting to nutrition database: {str(e)}"
        else:
            error = "Please enter a barcode."

    return render_template('index.html', creature=creature, error=error, barcode=barcode)

@app.route('/api/scan/<barcode>')
def scan_api(barcode):
    try:
        response = requests.get(OFF_API_URL.format(barcode))
        data = response.json()
        if data.get('status') == 1:
            product = data['product']
            creature = generate_creature(product)
            return jsonify(creature.to_dict())
        else:
            return jsonify({"error": "Product not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
