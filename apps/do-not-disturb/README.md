# Do Not Disturb / "The Button"

A simple status toggle app.

## How it works

1.  **Green Light (Available)**: You are online, accepting calls/texts.
2.  **Red Light (Go Dark)**: You are offline. The screen turns dark red.
    *   Displays a reassurance message: "I am alive and well, just disconnected."
    *   Shows Emergency Contact info.
    *   Allows "visitors" (people looking at the screen) to leave a message in the "Vault".
    *   You don't see the Vault messages until you go back to Green.

## Usage

1.  Open `index.html`.
2.  Click "Settings" (gear icon) to set your name and emergency contact.
3.  Click "GO DARK" when you want to disconnect.
4.  Show this screen to anyone asking or keep it open.

## Tech

*   HTML/CSS/JS
*   Uses `localStorage` to save state and messages.
