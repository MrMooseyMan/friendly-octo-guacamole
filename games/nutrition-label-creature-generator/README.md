# Nutrition Mon 🥑

A simple demo app that scans barcode nutrition labels and generates unique creatures with stats based on the food's nutritional value.

## How it works

1. **Scan**: Enters a barcode (or uses a demo button).
2. **Fetch**: The app queries the [OpenFoodFacts API](https://world.openfoodfacts.org/) to get product details.
3. **Generate**:
   - **HP**: Based on Calories
   - **Speed**: Based on Carbs (Sugar rush!)
   - **Attack**: Based on Protein
   - **Defense**: Based on Fat
   - **Element**: Derived from ingredients (e.g., Spicy -> Fire, Wheat -> Earth)
   - **Name**: Procedurally generated from the product name.

## Setup & Run

1. Install dependencies:
   ```bash
   pip install flask requests
   ```

2. Run the app:
   ```bash
   python app.py
   ```

3. Open your browser to `http://localhost:5000`.

## Demo Barcodes

- **737628064502**: Instant Noodles
- **5449000000996**: Coca-Cola
- **3017620422003**: Nutella
