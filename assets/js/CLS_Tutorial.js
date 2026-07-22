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

// Confetti generator for success screen
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

// --- BACK BUTTON AUDIO DELAY ---
const backMenuBtn = document.getElementById('backMenuBtn');
if (backMenuBtn) {
    backMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        playSound(clickAudio);
        setTimeout(() => {
            window.location.href = 'CLS_GameMenu.html?skipLoad=true';
        }, 200);
    });
}

// --- MODAL HELPER FUNCTIONS ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        playSound(notifyAudio);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        closeModal(e.currentTarget.getAttribute('data-target'));
    });
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.style.display = 'none';
    });
});


// =========================================
// LESSON DATA DICTIONARY
// =========================================
const lessonData = {
    1: {
        title: "LESSON 1: MOVEMENT",
        desc: "Use the move() command to move your bot around.",
        code: ["move(N)", "move(N)", "move(E)", "move(E)"],
        objective: "Move your bot to the highlighted target zone."
    },
    2: {
        title: "LESSON 2: PICKUP & DROP",
        desc: "Pick up crates and transport them to the destination.",
        code: ["move(E)", "pickup()", "move(W)", "drop()"],
        objective: "Pick up the wooden crate and place it in the drop zone."
    },
    3: {
        title: "LESSON 3: CONDITIONS",
        desc: "Use if/else statements to make decisions based on sensors.",
        code: ["if (sensor.detect() == 'box') {", "    pickup();", "}", "else {", "    wait();", "}"],
        objective: "Program your bot to scan and conditionally pick up items."
    },
    4: {
        title: "LESSON 4: LOOPS",
        desc: "Repeat commands efficiently using loop structures.",
        code: ["repeat(4) {", "    move(N);", "    move(E);", "}"],
        objective: "Optimize the route using a repeat loop."
    },
    5: {
        title: "LESSON 5: VARIABLES",
        desc: "Store and track item counts with variables.",
        code: ["let count = 0;", "while(count < 5) {", "    processItem();", "    count++;", "}"],
        objective: "Store production tallies inside a custom variable."
    },
    6: {
        title: "LESSON 6: FUNCTIONS",
        desc: "Create reusable functions for complex factory routines.",
        code: ["function assembleUnit() {", "    pickup();", "    process();", "    drop();", "}"],
        objective: "Bundle commands into a single executable function."
    }
};


// =========================================
// PROGRESSION & PERSISTENCE (LOCALSTORAGE)
// =========================================
function getUnlockedLevel() {
    return parseInt(localStorage.getItem('cls_unlocked_lesson') || '1', 10);
}

function unlockNextLevel(currentLevel) {
    const unlocked = getUnlockedLevel();
    if (currentLevel >= unlocked && currentLevel < 6) {
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
// LESSON SWITCHING & INTERACTION
// =========================================
const lessonCards = document.querySelectorAll('.lesson-card');
const lessonTitle = document.getElementById('lessonTitle');
const lessonDesc = document.getElementById('lessonDesc');
const playerCodeInput = document.getElementById('playerCodeInput');
const objectiveText = document.getElementById('objectiveText');
const startBtn = document.getElementById('startLessonBtn');
let currentActiveLesson = 1;

// Initialize textarea with Lesson 1 code template
if (playerCodeInput) {
    playerCodeInput.value = lessonData[1].code.join('\n');
}

lessonCards.forEach(card => {
    card.addEventListener('click', () => {
        const lessonId = parseInt(card.getAttribute('data-lesson'), 10);
        const unlockedMax = getUnlockedLevel();
        
        if (lessonId > unlockedMax) {
            openModal('lockedModal');
            return;
        }

        lessonCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        currentActiveLesson = lessonId;

        const data = lessonData[lessonId];
        if (data) {
            lessonTitle.textContent = data.title;
            lessonDesc.textContent = data.desc;
            
            // Populate editable textarea with template code
            if (playerCodeInput) {
                playerCodeInput.value = data.code.join('\n');
            }

            objectiveText.textContent = data.objective;
        }
    });
});


// =========================================
// INTERACTIVE CODE VALIDATION & RUNNER
// =========================================
const simBot = document.querySelector('.sim-bot');

if (startBtn) {
    startBtn.addEventListener('click', () => {
        playSound(clickAudio);

        const userCode = playerCodeInput ? playerCodeInput.value.toLowerCase() : "";

        if (currentActiveLesson === 1) {
            // Validation check for Lesson 1
            const hasMoveN = userCode.includes('move(n)');
            const hasMoveE = userCode.includes('move(e)');

            if (!hasMoveN || !hasMoveE) {
                playSound(errorAudio);
                document.getElementById('errorMessage').textContent = "Missing required movement commands! Use move(N) and move(E).";
                openModal('errorModal');
                return;
            }

            // Correct Execution
            startBtn.textContent = "RUNNING...";
            startBtn.style.pointerEvents = 'none';

            if (simBot) {
                simBot.style.transition = "transform 1.2s ease-in-out";
                simBot.style.transform = "translateX(240px)";
            }

            setTimeout(() => {
                playSound(successAudio);
                openModal('successModal');
                triggerConfetti();
                
                unlockNextLevel(1);
                
                if (simBot) {
                    simBot.style.transition = "none";
                    simBot.style.transform = "translateX(0)";
                }
                
                startBtn.textContent = "START LESSON";
                startBtn.style.pointerEvents = 'auto';
            }, 1400);

        } else {
            // Placeholder template handler for higher lessons
            const requiredKeyword = currentActiveLesson === 2 ? 'pickup' : 'code';
            if (!userCode.includes(requiredKeyword)) {
                playSound(errorAudio);
                document.getElementById('errorMessage').textContent = `Invalid syntax. Missing required command for ${lessonData[currentActiveLesson].title}.`;
                openModal('errorModal');
                return;
            }

            startBtn.textContent = "RUNNING...";
            startBtn.style.pointerEvents = 'none';
            setTimeout(() => {
                playSound(successAudio);
                openModal('successModal');
                triggerConfetti();
                unlockNextLevel(currentActiveLesson);
                startBtn.textContent = "START LESSON";
                startBtn.style.pointerEvents = 'auto';
            }, 1200);
        }
    });
}

// Proceed button inside success modal
const nextLessonBtn = document.getElementById('nextLessonBtn');
if (nextLessonBtn) {
    nextLessonBtn.addEventListener('click', () => {
        closeModal('successModal');
        const nextLessonCard = document.querySelector(`[data-lesson="${currentActiveLesson + 1}"]`);
        if (nextLessonCard) nextLessonCard.click();
    });
}