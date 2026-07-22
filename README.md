# 📦 Cargo Logic Sim (CLS)

```
       .---.
      |o_o |
      |:_/ |   < SYSTEM ONLINE. INITIALIZING LOGISTICS ENGINE...
     //   \ \
    (|     | )
    /'\_   _/`\
    \___)=(___/
```

Cargo Logic Sim is a web-based educational puzzle game and programming simulator. Set in a retro-industrial terminal environment, players learn real-world coding concepts by writing scripts to control an automated factory bot, manipulate cargo, and navigate dynamic 2D grid challenges.

# ✨ Features
Custom Live Interpreter: A built-in JavaScript parser that unrolls custom logic, supporting directional movement, item manipulation, variables (let x = 5;), and standard for loops.

Dynamic 2D Simulation: Real-time DOM manipulation that renders bots, crates, target zones, hazard walls, and animated conveyor belts on a coordinate grid.

Efficiency Rating System: A 1-to-3 star grading mechanic that evaluates the player's solution based on raw lines of code written, encouraging loop optimization and clean syntax.

Progressive Learning Curve: 5 fully interactive tutorial modules that teach coding fundamentals (Movement, Pathfinding, Loops, Variables) complete with collision detection and error handling.

Immersive Arcade UI: A polished, responsive interface featuring retro VT323 typography, neon-glow assets, CSS keyframe animations (confetti, rolling belts), and zero-delay UI sound effects.

Persistent Progression: Utilizes browser localStorage to save unlocked modules and player progress.

Localization Support: Multi-language game menu supporting English, Tagalog, and German.

# 🛠️ Tech Stack
Frontend Framework: Vanilla HTML5, CSS3, JavaScript (ES6+)

Typography: Google Fonts (VT323)

Icons: FontAwesome 6

Architecture: Client-side execution (No backend or database required)

# 🎮 How to Play
The game runs entirely in the browser using vanilla web technologies. No build tools or installations are required.

1. Clone the repository:

# Bash
``
git clone [https://github.com/ZRayce/Cargo-Logic-Sim.git](https://github.com/ZRayce/Carg-Logic-Sim.git)
``
2. Open the project folder.

3. Launch CLS_GameMenu.html in any modern web browser (Chrome, Firefox, Brave, Edge).

4. Click Initialize System, navigate to the Tutorial, and start coding!

# 💻 Command Cheat SheetPlayers interact with the factory bot using the built-in terminal editor. Supported syntax includes:
1. CommandDescriptionmove(N|S|E|W)Moves the bot 1 tile (North, South, East, West).
2. pickup()Instructs the bot to pick up a crate on its current
3. tile.drop()Drops the currently held
4. crate.wait()Pauses bot execution for 1 cycle.let x = 5;Declares a custom variable to hold numeric data.for(let i=0; i<x; i++){...}Standard loop. Repeats the encapsulated commands x times.

(Pro-tip: You can use Shift + Enter inside the code editor to instantly run your script!)

```
# 📂 Project StructurePlaintextCargo-Logic-Sim/
├── assets/
│   ├── css/
│   │   ├── CLS_GameMenu.css    # Styling for the main terminal menu
│   │   └── CLS_Tutorial.css    # Styling for the grid, editor, and modals
│   ├── js/
│   │   ├── CLS_GameMenu.js     # Audio controllers, localization, and boot sequence
│   │   └── CLS_Tutorial.js     # Code parser, 2D engine, and collision logic
│   ├── images/                 # Backgrounds, logos, and UI graphics
│   └── sounds/                 # Interactive SFX (hover, success, error, etc.)
├── CLS_GameMenu.html           # Main entry point / Title Screen
└── CLS_Tutorial.html           # The interactive IDE and simulation workspace
```
# 👨‍💻 Development TeamThis project was built as an academic capstone/final project showcasing front-end architecture, custom parsing logic, and interactive UI/UX design.

Rayce Manuel E. Fillon – Lead Developer / Researcher
Rheniel Khen Tambal – Developer
Ryne Abel Tajena – Co-researchers
Mark Gabriel Perez – Co-researchers
