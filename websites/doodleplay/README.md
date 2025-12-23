# 🎨 DoodlePlay

**Turn Kids' Drawings Into Playable Games!**

DoodlePlay is a web application that transforms children's artwork into interactive, playable web games. Upload any drawing, choose a game type, and watch imagination come alive!

## ✨ Features

- **📤 Easy Upload**: Drag-and-drop or click to upload any drawing (JPG, PNG, GIF, WebP)
- **🎮 4 Game Types**:
  - 🏃 **Platformer** - Jump and run adventure
  - 🦅 **Flying** - Soar through the clouds
  - 🏎️ **Racing** - Lane-switching action
  - ⭐ **Catching** - Collect falling stars
- **🎚️ Adjustable Difficulty**: Easy, Medium, or Hard
- **📤 Share & Download**: Share games via link or download as standalone HTML
- **📱 Mobile Friendly**: Works on phones and tablets with touch controls
- **🎉 Easter Egg**: Try the Konami Code! (↑↑↓↓←→←→BA)

## 🚀 Getting Started

### Option 1: Open Directly
Simply open `index.html` in any modern web browser.

### Option 2: Local Server
For the best experience, run a local server:

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (npx)
npx serve
```

Then visit `http://localhost:8000`

## 🎮 How to Play

1. **Hero Demo Game** (on homepage):
   - ← → Arrow keys to move
   - SPACE to fly up
   - Collect stars ⭐, avoid obstacles 🌵
   - Reach 100 points to win!

2. **Create Your Own Game**:
   - Upload a drawing (or use without one)
   - Enter a game name
   - Choose a game type
   - Set difficulty
   - Click "Create My Game!"

## 📁 Project Structure

```
doodleplay/
├── index.html      # Main landing page
├── styles.css      # All styling and animations
├── game-engine.js  # Canvas-based 2D game engine
├── app.js          # Application logic and interactions
└── README.md       # This file
```

## 🛠️ Technical Details

- **Pure HTML/CSS/JS** - No frameworks or build tools required
- **Canvas API** - For smooth 2D game rendering
- **Responsive Design** - Works on all screen sizes
- **Modern CSS** - Flexbox, Grid, CSS Variables, Animations
- **Google Fonts** - Fredoka and Comic Neue

## 💡 Perfect For

- **Parents** wanting creative screen time for kids
- **Teachers** looking for art + tech classroom activities  
- **Kids** who want to see their drawings come alive
- **Anyone** who wants to have fun creating simple games!

## 📄 License

Made with ❤️ for creative kids everywhere.

---

*Built as a pitch-ready demo for DoodlePlay - the app that turns imagination into adventure!*
