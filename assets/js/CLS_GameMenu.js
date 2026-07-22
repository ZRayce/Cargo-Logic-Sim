// =========================================
// 0. BOOT & LOADING SCREEN BYPASS CHECK
// =========================================

window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('skipLoad') === 'true') {
        const bootScreen = document.getElementById('bootScreen');
        const loadingScreen = document.getElementById('loadingScreen');
        if (bootScreen) bootScreen.style.display = 'none';
        if (loadingScreen) loadingScreen.style.display = 'none';
    }
});

const bootScreen = document.getElementById('bootScreen');
const bootBtn = document.getElementById('bootBtn');
const loadingScreen = document.getElementById('loadingScreen');
const startupAudio = document.getElementById('startupSound');

if (bootBtn) {
    bootBtn.addEventListener('click', () => {
        // 1. Fade out and remove the Boot Screen
        bootScreen.style.opacity = '0';
        setTimeout(() => {
            bootScreen.style.display = 'none';
        }, 300);

        // 2. Show the Loading Screen to trigger CSS animations
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            
            // Force a tiny delay so the browser registers the display change before fading in
            setTimeout(() => {
                loadingScreen.style.opacity = '1';
            }, 10);
        }

        // 3. Play Startup Sound safely
        if (startupAudio) {
            const masterVolInput = document.getElementById('masterVol');
            const sfxVolInput = document.getElementById('sfxVol');
            const masterVolume = masterVolInput ? parseInt(masterVolInput.value, 10) / 100 : 1;
            const sfxVolume = sfxVolInput ? parseInt(sfxVolInput.value, 10) / 100 : 1;
            
            startupAudio.volume = masterVolume * sfxVolume;
            startupAudio.play().catch(e => console.log("Startup sound failed: ", e)); 
        }

        // 4. Wait for the Loading Bar to finish (2.5s), then fade out
        setTimeout(() => {
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500); 
            }
        }, 2500);
    });
}

// =========================================
// 1. AUDIO & VOLUME SYSTEM (ZERO-DELAY)
// =========================================
const hoverAudio = document.getElementById('hoverSound');
const clickAudio = document.getElementById('clickSound');
const notifyAudio = document.getElementById('notifySound');

const masterVolInput = document.getElementById('masterVol');
const masterVolText = document.getElementById('masterVolText');
const sfxVolInput = document.getElementById('sfxVol');
const sfxVolText = document.getElementById('sfxVolText');

// Update live percentage text when dragging sliders
if (masterVolInput && masterVolText) {
    masterVolInput.addEventListener('input', (e) => {
        masterVolText.textContent = e.target.value + '%';
    });
}

if (sfxVolInput && sfxVolText) {
    sfxVolInput.addEventListener('input', (e) => {
        sfxVolText.textContent = e.target.value + '%';
    });
}

// Master function to play sound INSTANTLY using cloning
function playSound(audioElement) {
    if (!audioElement || !audioElement.src) return;

    const masterVolume = masterVolInput ? parseInt(masterVolInput.value, 10) / 100 : 1;
    const sfxVolume = sfxVolInput ? parseInt(sfxVolInput.value, 10) / 100 : 1;
    const finalVolume = masterVolume * sfxVolume;

    if (finalVolume <= 0) return;

    // Clone the audio node so it plays instantly and allows overlapping clicks
    const soundClone = audioElement.cloneNode(true);
    soundClone.volume = finalVolume;
    soundClone.play().catch(() => {});
}

// Attach hover and click sound handlers to all interactive elements
document.querySelectorAll('.interactable').forEach(element => {
    element.addEventListener('mouseenter', () => playSound(hoverAudio));
    element.addEventListener('click', () => playSound(clickAudio));
});

// =========================================
// 2. MODAL SYSTEM
// =========================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        playSound(notifyAudio);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Button to Modal Mappings
const modalButtons = [
    { btnId: 'newsBtn', modalId: 'newsModal', preventDefault: false },
    { btnId: 'settingsBtn', modalId: 'settingsModal', preventDefault: false },
    { btnId: 'creditsBtn', modalId: 'creditsModal', preventDefault: false },
    { btnId: 'termsBtn', modalId: 'termsModal', preventDefault: true },
    { btnId: 'privacyBtn', modalId: 'privacyModal', preventDefault: true }
];

modalButtons.forEach(({ btnId, modalId, preventDefault }) => {
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.addEventListener('click', (e) => {
            if (preventDefault) e.preventDefault();
            openModal(modalId);
        });
    }
});

// Attach event listeners to all close 'X' buttons
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetModal = e.currentTarget.getAttribute('data-target');
        closeModal(targetModal);
    });
});

// Close modal when clicking dark overlay background
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.style.display = 'none';
        }
    });
});

// --- TUTORIAL NAVIGATION ---
const tutorialBtn = document.getElementById('tutorialBtn');
if (tutorialBtn) {
    tutorialBtn.addEventListener('click', () => {
        window.location.href = 'CLS_Tutorial.html';
    });
}

// =========================================
// 3. TRANSLATION / LOCALIZATION SYSTEM
// =========================================
const translations = {
    en: {
        newGame: "New Game",
        continue: "Continue",
        tycoon: "Tycoon",
        tutorial: "Tutorial",
        settings: "Settings",
        credits: "Credits",
        exitGame: "Exit Game"
    },
    tl: {
        newGame: "Bagong Laro",
        continue: "Ipagpatuloy",
        tycoon: "Negosyo",
        tutorial: "Pagsasanay",
        settings: "Mga Setting",
        credits: "Mga Kredito",
        exitGame: "Umalis"
    },
    de: {
        newGame: "Neues Spiel",
        continue: "Fortsetzen",
        tycoon: "Magnat",
        tutorial: "Anleitung",
        settings: "Einstellungen",
        credits: "Abspann",
        exitGame: "Spiel beenden"
    }
};

const langSelect = document.getElementById('langSelect');
if (langSelect) {
    langSelect.addEventListener('change', (event) => {
        const selectedLang = event.target.value;
        
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const icon = element.querySelector('i');
            
            if (translations[selectedLang] && translations[selectedLang][key]) {
                const iconHTML = icon ? icon.outerHTML : ''; 
                element.innerHTML = `${iconHTML} ${translations[selectedLang][key]}`;
            }
        });
    });
}