# Nutrition Creature Generator

This is a demo application that generates unique "creatures" based on the nutrition facts of real-world food items. It uses the Open Food Facts API to fetch data from barcodes.

## How it works
1.  **Scan/Enter Barcode**: You input a barcode (EAN/UPC).
2.  **Fetch Data**: The app retrieves nutrition info (Calories, Sugar, Protein, etc.).
3.  **Generate Stats**:
    *   **HP**: Based on Calories
    *   **Speed**: Based on Sugar
    *   **Attack**: Based on Protein
    *   **Defense**: Based on Fat
    *   **Type**: Derived from dominant ingredients/nutrients (e.g., High Sugar -> Electric).
4.  **Visualize**: A unique name and image (via Robohash) are generated deterministically.

## Installation

1.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Usage

1.  Run the web application:
    ```bash
    python3 app.py
    ```
2.  Open your browser to `http://localhost:5000`.
3.  Try these barcodes:
    *   Coca-Cola: `5449000000996`
    *   Nutella: `3017620422003`
    *   Oats: `5000127150772`
