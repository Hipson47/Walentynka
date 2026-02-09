document.addEventListener('DOMContentLoaded', () => {
    // ===== DOM ELEMENTS =====
    const views = {
        intro: document.getElementById('view-intro'),
        ask: document.getElementById('view-ask'),
        celebrate: document.getElementById('view-celebrate'),
        choice: document.getElementById('view-choice'),
        final: document.getElementById('view-final')
    };

    const envelope = document.getElementById('envelope');
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');
    const askHeadline = document.getElementById('ask-headline');
    const choiceCards = document.querySelectorAll('.choice-card');
    const finalChoiceText = document.getElementById('final-choice-text');
    const psBtn = document.getElementById('ps-btn');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');

    // GIF elements
    const gifs = document.querySelectorAll('.gif');

    // ===== CONFIG =====
    const SPAWN_DURATION = 5500;
    const SPAWN_INTERVAL = 200;
    const CELEBRATE_DURATION = 2500;
    const EDGE_PADDING = 20;
    const YES_BUFFER = 90;
    const MOVE_THROTTLE = 150;

    // ===== STATE =====
    let currentState = 'intro';
    let selectedChoice = '';
    let lastMoveTime = 0;
    let noBtnHasEscaped = false;
    let heartsInterval = null;
    let lastFocusedElement = null;

    // ===== INIT =====
    function init() {
        setupGifFallbacks();
        setupQueryParams();
        setState('intro');
    }

    // ===== GIF FALLBACKS =====
    function setupGifFallbacks() {
        gifs.forEach(img => {
            img.addEventListener('error', () => {
                img.classList.add('hidden');
                img.style.display = 'none';
            });
            img.addEventListener('load', () => {
                img.classList.remove('hidden');
                img.style.display = '';
            });
        });
    }

    // ===== QUERY PARAMS =====
    function setupQueryParams() {
        const params = new URLSearchParams(window.location.search);
        let toName = params.get('to');

        if (toName) {
            // Sanitize: trim, collapse whitespace, limit length
            toName = toName.trim().replace(/\s+/g, ' ').slice(0, 50);
            if (toName) {
                askHeadline.textContent = `${toName}, czy zostaniesz moją walentynką?`;
            }
        }
    }

    // ===== STATE MACHINE =====
    function setState(newState) {
        currentState = newState;

        // Hide all views
        Object.values(views).forEach(view => {
            view.classList.add('hidden');
        });

        // Show target view
        if (views[newState]) {
            views[newState].classList.remove('hidden');
        }

        // State-specific entry hooks
        if (newState === 'ask') {
            resetNoButton();
        }

        if (newState === 'celebrate') {
            cleanupNoButton();
            startHearts();

            // Auto-advance to choice after celebration
            setTimeout(() => {
                if (currentState === 'celebrate') {
                    setState('choice');
                }
            }, CELEBRATE_DURATION);
        }

        if (newState !== 'ask') {
            cleanupNoButton();
        }
    }

    // ===== ENVELOPE =====
    envelope.addEventListener('click', () => {
        envelope.classList.add('opening');

        // Wait for animation, then go to ask
        setTimeout(() => {
            setState('ask');
        }, 500);
    });

    // ===== YES BUTTON =====
    yesBtn.addEventListener('click', () => {
        if (currentState === 'ask') {
            setState('celebrate');
        }
    });

    // ===== NO BUTTON (RUNAWAY) =====
    function resetNoButton() {
        noBtn.style.display = '';
        noBtn.style.position = '';
        noBtn.style.left = '';
        noBtn.style.top = '';
        noBtn.style.margin = '';
        noBtn.classList.remove('btn-runaway');
        noBtnHasEscaped = false;
    }

    function cleanupNoButton() {
        noBtn.style.display = 'none';
        noBtn.classList.remove('btn-runaway');
    }

    function moveNoButton() {
        if (currentState !== 'ask') return;

        // Throttle
        const now = Date.now();
        if (now - lastMoveTime < MOVE_THROTTLE) return;
        lastMoveTime = now;

        // First escape: switch to fixed
        if (!noBtnHasEscaped) {
            const rect = noBtn.getBoundingClientRect();
            noBtn.style.position = 'fixed';
            noBtn.style.left = rect.left + 'px';
            noBtn.style.top = rect.top + 'px';
            noBtn.style.margin = '0';
            noBtn.classList.add('btn-runaway');
            noBtnHasEscaped = true;
        }

        // Viewport bounds
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const btnRect = noBtn.getBoundingClientRect();
        const yesRect = yesBtn.getBoundingClientRect();
        const btnW = btnRect.width;
        const btnH = btnRect.height;
        const maxX = vw - btnW - EDGE_PADDING;
        const maxY = vh - btnH - EDGE_PADDING;

        // Find safe position
        let newX, newY, safe = false, attempts = 0;

        while (!safe && attempts < 20) {
            newX = EDGE_PADDING + Math.random() * (maxX - EDGE_PADDING);
            newY = EDGE_PADDING + Math.random() * (maxY - EDGE_PADDING);

            const overlapsYes = (
                newX < yesRect.right + YES_BUFFER &&
                newX + btnW > yesRect.left - YES_BUFFER &&
                newY < yesRect.bottom + YES_BUFFER &&
                newY + btnH > yesRect.top - YES_BUFFER
            );

            if (!overlapsYes) safe = true;
            attempts++;
        }

        noBtn.style.left = `${newX}px`;
        noBtn.style.top = `${newY}px`;
    }

    // No button events
    noBtn.addEventListener('mouseenter', (e) => {
        e.preventDefault();
        moveNoButton();
    });

    noBtn.addEventListener('pointerenter', (e) => {
        e.preventDefault();
        moveNoButton();
    });

    noBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        e.stopPropagation();
        moveNoButton();
    }, { passive: false });

    noBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        moveNoButton();
    });

    noBtn.addEventListener('focus', () => {
        moveNoButton();
        noBtn.blur();
    });

    // ===== HEARTS =====
    function createHeart() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const heart = document.createElement('span');
        heart.classList.add('heart');

        const hearts = ['❤️', '💕', '💗', '💖', '💘', '💝'];
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];

        const size = 18 + Math.random() * 24;
        const startLeft = Math.random() * 100;
        const duration = 3 + Math.random() * 2.5;

        heart.style.left = `${startLeft}vw`;
        heart.style.fontSize = `${size}px`;
        heart.style.animationDuration = `${duration}s`;
        heart.style.bottom = '-50px';

        document.body.appendChild(heart);

        setTimeout(() => {
            if (heart.parentNode) heart.remove();
        }, duration * 1000 + 100);
    }

    function startHearts() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        heartsInterval = setInterval(createHeart, SPAWN_INTERVAL);

        setTimeout(() => {
            if (heartsInterval) {
                clearInterval(heartsInterval);
                heartsInterval = null;
            }
        }, SPAWN_DURATION);
    }

    // ===== CHOICE CARDS =====
    choiceCards.forEach(card => {
        card.addEventListener('click', () => {
            selectedChoice = card.dataset.choice;
            finalChoiceText.textContent = `Wybrałaś: ${selectedChoice}`;
            setState('final');
        });
    });

    // ===== PS MODAL =====
    function openModal() {
        lastFocusedElement = document.activeElement;
        modalOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        modalClose.focus();
    }

    function closeModal() {
        modalOverlay.classList.add('hidden');
        document.body.style.overflow = '';
        if (lastFocusedElement) lastFocusedElement.focus();
    }

    psBtn.addEventListener('click', openModal);
    modalClose.addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
            closeModal();
        }
    });

    // ===== START =====
    init();
});
