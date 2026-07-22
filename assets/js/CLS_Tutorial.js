// =========================================
// AUDIO & CONFETTI SYSTEM
// =========================================
const hoverAudio = document.getElementById('hoverSound');
const clickAudio = document.getElementById('clickSound');
const notifyAudio = document.getElementById('notifySound');
const successAudio = document.getElementById('successSound');
const errorAudio = document.getElementById('errorSound');

function playSound(audioElement) {
    if (!audioElement || !audioElement.src) return;
    const soundClone = audioElement.cloneNode(true);
    soundClone.volume = 0.8;
    soundClone.play().catch(() => {});
}

document.querySelectorAll('.interactable').forEach(element => {
    element.addEventListener('mouseenter', () => playSound(hoverAudio));
    element.addEventListener('click', () => playSound(clickAudio));
});

function triggerConfetti() {
    const container = document.getElementById('confettiContainer');
    if (!container) return;
    container.innerHTML = ""; 
    const colors = ['#f59e0b', '#38bdf8', '#10b981', '#ef4444', '#a855f7'];
    for (let i = 0; i < 70; i++) {
        const piece = document.createElement('div');
        piece.classList.add('confetti-piece');
        piece.style.left = Math.random() * 100 + '%';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = (Math.random() * 1.5 + 1) + 's';
        piece.style.animationDelay = (Math.random() * 0.5) + 's';
        container.appendChild(piece);
    }
}

// =========================================
// UI EVENT LISTENERS
// =========================================
const backMenuBtn = document.getElementById('backMenuBtn');
if (backMenuBtn) {
    backMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        playSound(clickAudio);
        setTimeout(() => window.location.href = 'CLS_GameMenu.html?skipLoad=true', 200);
    });
}

const cheatSheetBtn = document.getElementById('cheatSheetBtn');
if (cheatSheetBtn) cheatSheetBtn.addEventListener('click', () => openModal('cheatSheetModal'));

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) { modal.style.display = 'flex'; playSound(notifyAudio); }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => closeModal(e.currentTarget.getAttribute('data-target')));
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.style.display = 'none';
    });
});

// =========================================
// LESSON DATA & 2D STAGE CONFIGURATION
// Grid Size: X (0-9), Y (0-4)
// =========================================
const lessonData = {
    1: {
        title: "LESSON 1: MOVEMENT",
        desc: "Navigate the 2D grid to the target.",
        hintCode: ["move(E)", "// Type more commands..."],
        objective: "Move your bot East to reach the target.",
        stage: { startX: 2, startY: 2, targetX: 7, targetY: 2, hasCrate: false, obstacles: [], optimalLines: 5 }
    },
    2: {
        title: "LESSON 2: PICKUP & DROP",
        desc: "Pick up crates and transport them.",
        hintCode: ["// Hint: Use pickup() when on the crate", "move(E)"],
        objective: "Pick up the crate and drop it in the target zone.",
        stage: { startX: 1, startY: 2, targetX: 8, targetY: 2, hasCrate: true, crateStartX: 4, crateStartY: 2, obstacles: [], optimalLines: 6 }
    },
    3: {
        title: "LESSON 3: PATHFINDING",
        desc: "Move in 2D space.",
        hintCode: ["move(S)", "move(E)", "// Go around the hazard!"],
        objective: "Navigate around obstacles to reach the target.",
        stage: { 
            startX: 2, startY: 1, targetX: 6, targetY: 1, hasCrate: false, 
            obstacles: [{x: 4, y: 1}, {x: 4, y: 2}], 
            optimalLines: 6 
        }
    },
    4: {
        title: "LESSON 4: LOOPS",
        desc: "Use repeat() to write cleaner code.",
        hintCode: ["repeat(3){", "  move(E)", "}", "// Target is 5 blocks away!"],
        objective: "Use a loop to cross the grid efficiently.",
        stage: { startX: 1, startY: 2, targetX: 8, targetY: 2, hasCrate: false, obstacles: [], optimalLines: 3 }
    },
    5: {
        title: "LESSON 5: VARIABLES",
        desc: "Store numbers in variables to drive loops.",
        hintCode: ["let steps = 4;", "repeat(steps){", "  move(E)", "}"],
        objective: "Define a variable to reach the far target.",
        stage: { startX: 0, startY: 2, targetX: 9, targetY: 2, hasCrate: false, obstacles: [], optimalLines: 4 }
    }
};

function getUnlockedLevel() { return parseInt(localStorage.getItem('cls_unlocked_lesson') || '1', 10); }

function unlockNextLevel(currentLevel) {
    const unlocked = getUnlockedLevel();
    if (currentLevel >= unlocked && currentLevel < 5) { // 5 is currently max
        localStorage.setItem('cls_unlocked_lesson', currentLevel + 1);
        updateSidebarLocks();
    }
}

function updateSidebarLocks() {
    const unlockedMax = getUnlockedLevel();
    document.querySelectorAll('.lesson-card').forEach(card => {
        const lessonNum = parseInt(card.getAttribute('data-lesson'), 10);
        const lockIcon = card.querySelector('.lock-icon');
        if (lessonNum <= unlockedMax) {
            card.classList.remove('locked');
            if (lockIcon) lockIcon.style.display = 'none';
        } else {
            card.classList.add('locked');
            if (lockIcon) lockIcon.style.display = 'block';
        }
    });
}
updateSidebarLocks();

// =========================================
// 2D ENGINE & LIVE INTERPRETER
// =========================================
const simBot = document.getElementById('simBot');
const simCrate = document.getElementById('simCrate');
const simTarget = document.getElementById('simTarget');
const playerCodeInput = document.getElementById('playerCodeInput');
const startBtn = document.getElementById('startLessonBtn');

let currentActiveLesson = 1;
let botX = 0, botY = 0, crateX = 0, crateY = 0;
let hasCrate = false, holdingCrate = false;
let isRunning = false;

// Convert Grid X/Y (0-9, 0-4) to Percentages
const getPos = (x, isX) => isX ? `${(x * 10) + 5}%` : `${(x * 20) + 10}%`;

function renderStage(lessonId) {
    const stage = lessonData[lessonId]?.stage;
    if (!stage) return;

    botX = stage.startX; botY = stage.startY;
    hasCrate = stage.hasCrate; holdingCrate = false;
    
    simBot.style.transition = "none";
    simBot.style.left = getPos(botX, true);
    simBot.style.top = getPos(botY, false);

    simTarget.style.left = getPos(stage.targetX, true);
    simTarget.style.top = getPos(stage.targetY, false);

    if (hasCrate) {
        crateX = stage.crateStartX; crateY = stage.crateStartY;
        simCrate.style.display = 'block';
        simCrate.style.transition = "none";
        simCrate.style.left = getPos(crateX, true);
        simCrate.style.top = getPos(crateY, false);
    } else {
        simCrate.style.display = 'none';
    }

    // Render Obstacles dynamically
    const obsContainer = document.getElementById('obstaclesContainer');
    obsContainer.innerHTML = ''; 
    if (stage.obstacles) {
        stage.obstacles.forEach(obs => {
            const div = document.createElement('div');
            div.className = 'sim-obstacle';
            div.style.left = `${obs.x * 10}%`;
            div.style.top = `${obs.y * 20}%`;
            obsContainer.appendChild(div);
        });
    }
}

// Initial Setup
if (playerCodeInput) playerCodeInput.value = lessonData[1].hintCode.join('\n');
renderStage(1);

document.querySelectorAll('.lesson-card').forEach(card => {
    card.addEventListener('click', () => {
        if (isRunning) return;
        const lessonId = parseInt(card.getAttribute('data-lesson'), 10);
        if (lessonId > getUnlockedLevel()) { openModal('lockedModal'); return; }

        document.querySelectorAll('.lesson-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        currentActiveLesson = lessonId;

        const data = lessonData[lessonId];
        if (data) {
            document.getElementById('lessonTitle').textContent = data.title;
            document.getElementById('lessonDesc').textContent = data.desc;
            document.getElementById('objectiveText').textContent = data.objective;
            if (playerCodeInput) playerCodeInput.value = data.hintCode.join('\n');
            renderStage(lessonId);
        }
    });
});

// Code Parser & Loop Unroller
// NEW PARSER: Handles comments properly before unrolling loops!
function parseCode(rawCode) {
    // 1. Strip out all // comments FIRST so they don't eat the actual code
    let code = rawCode.replace(/\/\/.*$/gm, '');
    
    // 2. Now strip whitespace and convert to lowercase for easy matching
    code = code.toLowerCase().replace(/\s+/g, '');
    
    // 3. Store variables: let steps=4;
    const varMatch = code.match(/let([a-z]+)=(\d+);?/);
    let varName = "", varValue = 0;
    if (varMatch) {
        varName = varMatch[1];
        varValue = parseInt(varMatch[2]);
    }

    // 4. Unroll standard JS loops: for(let i=0; i<5; i++){...} 
    let loopRegex = /for\(let([a-z]+)=(\d+);\1<([a-z0-9]+);\1\+\+\)\{([^}]+)\}/g;
    code = code.replace(loopRegex, (match, iter, start, limit, body) => {
        let max = isNaN(limit) ? (limit === varName ? varValue : 0) : parseInt(limit);
        let count = Math.max(0, max - parseInt(start));
        return (body + ';').repeat(count);
    });
    
    return code.split(/[\n;]/).filter(c => c.length > 0);
}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function executeInterpreter() {
    if (isRunning) return;
    isRunning = true;
    playSound(clickAudio);

    const userCode = playerCodeInput.value;
    const commands = parseCode(userCode);
    const stage = lessonData[currentActiveLesson].stage;
    
    // Reset stage to start execution fresh
    renderStage(currentActiveLesson);
    
    startBtn.textContent = "RUNNING...";
    startBtn.style.pointerEvents = 'none';
    playerCodeInput.style.display = 'none';
    
    const execDisplay = document.getElementById('executionDisplay');
    const cmdSpan = document.getElementById('currentCommand');
    execDisplay.style.display = 'block';

    simBot.style.transition = "left 0.4s ease, top 0.4s ease";
    if (hasCrate) simCrate.style.transition = "left 0.4s ease, top 0.4s ease";

    let errorMsg = null;

    for (let cmd of commands) {
        // Skip variable declaration in execution loop
        if (cmd.startsWith('let')) continue;

        cmdSpan.textContent = cmd;
        await delay(300);

        if (cmd === 'move(n)') botY -= 1;
        else if (cmd === 'move(s)') botY += 1;
        else if (cmd === 'move(e)') botX += 1;
        else if (cmd === 'move(w)') botX -= 1;
        else if (cmd === 'pickup()') {
            if (hasCrate && botX === crateX && botY === crateY) holdingCrate = true;
        }
        else if (cmd === 'drop()') holdingCrate = false;
        else if (cmd === 'wait()') await delay(200);
        else { errorMsg = `Invalid Syntax: ${cmd}`; break; }

        // Collision Checks
        if (botX < 0 || botX > 9 || botY < 0 || botY > 4) { 
            errorMsg = "System failure: Bot crashed into map boundaries!"; break; 
        }
        if (stage.obstacles && stage.obstacles.some(obs => obs.x === botX && obs.y === botY)) {
            errorMsg = "Crash! Bot hit a hazard block!"; break;
        }

        // Apply DOM Movement
        simBot.style.left = getPos(botX, true);
        simBot.style.top = getPos(botY, false);

        if (holdingCrate) {
            crateX = botX; crateY = botY;
            simCrate.style.left = getPos(crateX, true);
            simCrate.style.top = getPos(crateY, false);
        }

        await delay(500);
    }

    execDisplay.style.display = 'none';
    playerCodeInput.style.display = 'block';

    if (errorMsg) {
        triggerError(errorMsg);
    } else {
        // Validate Objectives
        let success = false;
        if (currentActiveLesson === 1 || currentActiveLesson === 3 || currentActiveLesson === 4 || currentActiveLesson === 5) {
            success = (botX === stage.targetX && botY === stage.targetY);
        } else if (currentActiveLesson === 2) {
            success = (crateX === stage.targetX && crateY === stage.targetY && !holdingCrate);
        }

        if (success) {
            // Count actual actions taken, ignore let statements
            const actionCount = commands.filter(c => !c.startsWith('let')).length;
            calculateStars(actionCount, stage.optimalLines);
            setTimeout(() => {
                playSound(successAudio);
                openModal('successModal');
                triggerConfetti();
                unlockNextLevel(currentActiveLesson);
                resetUI();
            }, 300);
        } else {
            triggerError("Objective not reached! Ensure the bot ends exactly on the target.");
        }
    }
}

function triggerError(msg) {
    playSound(errorAudio);
    document.getElementById('errorMessage').textContent = msg;
    openModal('errorModal');
    resetUI();
}

function resetUI() {
    startBtn.textContent = "START LESSON";
    startBtn.style.pointerEvents = 'auto';
    isRunning = false;
}

function calculateStars(used, optimal) {
    const star1 = document.getElementById('star1');
    const star2 = document.getElementById('star2');
    const star3 = document.getElementById('star3');
    const msg = document.getElementById('efficiencyMsg');
    
    star1.className = "fas fa-star active";
    star2.className = used <= optimal + 2 ? "fas fa-star active" : "fas fa-star";
    star3.className = used <= optimal ? "fas fa-star active" : "fas fa-star";

    if (used <= optimal) msg.textContent = "Flawless optimization. 3 Stars!";
    else if (used <= optimal + 2) msg.textContent = "Good logic, but can be optimized. 2 Stars!";
    else msg.textContent = "Objective met, but highly inefficient. 1 Star.";
}

if (startBtn) startBtn.addEventListener('click', executeInterpreter);

const nextLessonBtn = document.getElementById('nextLessonBtn');
if (nextLessonBtn) {
    nextLessonBtn.addEventListener('click', () => {
        closeModal('successModal');
        // Only try to go to the next level if it isn't the last one
        if (currentActiveLesson < 5) {
            const nextCard = document.querySelector(`[data-lesson="${currentActiveLesson + 1}"]`);
            if (nextCard) nextCard.click();
        }
    });
}

// Press Shift + Enter inside the code box to run the simulation
if (playerCodeInput) {
    playerCodeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault(); // Stops it from making a new line
            executeInterpreter();
        }
    });
}