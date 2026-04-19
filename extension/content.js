// === 1. STÍLUSOK (ID-val ellátva, hogy ki-be kapcsolhassuk őket) ===

// Várunk, amíg a document.head létezik
function injectStyles() {
    if (!document.head) {
        setTimeout(injectStyles, 100);
        return;
    }

    // a) Új, szuper-diszkrét jelölés: egy apró, halvány szürke pont a mondat végén
    const highlightStyle = document.createElement('style');
    highlightStyle.id = 'stealth-highlight-style';
    highlightStyle.textContent = `
        .stealth-correct-option {
            /* Diszkrét kijelölés, nincs háttér vagy szegély */
            position: relative;
        }
        .stealth-correct-option::after {
            content: '.' !important;
            color: rgba(0, 0, 0, 0.15) !important; /* Szinte teljesen láthatatlan halvány szürke pötty */
            font-size: 12px !important;
            opacity: 0.5 !important;
            margin-left: 3px !important;
            pointer-events: none !important;
        }
    `;
    document.head.appendChild(highlightStyle);

    // b) A láthatatlan kijelölés stílusa
    const selectionStyle = document.createElement('style');
    selectionStyle.id = 'stealth-selection-style';
    selectionStyle.textContent = `
        ::selection { background: transparent !important; color: inherit !important; }
        ::-moz-selection { background: transparent !important; color: inherit !important; }
    `;
    document.head.appendChild(selectionStyle);

    // Globális referenciák
    window.highlightStyle = highlightStyle;
    window.selectionStyle = selectionStyle;
}

injectStyles();

// === HELPER FÜGGVÉNYEK (elöl, hogy használhatóak legyenek) ===
function normalizeText(text) {
    if (!text) return "";
    return text.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^a-z0-9\s\-()]/gi, '')
        .trim();
}

function calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);

    if (maxLen === 0) return 1.0;

    const distance = levenshteinDistance(str1, str2);
    return 1 - (distance / maxLen);
}

function levenshteinDistance(s1, s2) {
    const len1 = s1.length;
    const len2 = s2.length;
    const d = [];

    for (let i = 0; i <= len1; i++) {
        d[i] = [i];
    }
    for (let j = 1; j <= len2; j++) {
        d[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            d[i][j] = Math.min(
                d[i - 1][j] + 1,
                d[i][j - 1] + 1,
                d[i - 1][j - 1] + cost
            );
        }
    }

    return d[len1][len2];
}

function findMatchingQuestion(currentText) {
    if (!currentText || currentText.length < 5) return null;
    return examDatabase.find(item => {
        // Teljes egyezés, vagy részleges beágyazódás
        if (currentText.includes(item.question) || item.question.includes(currentText)) return true;
        
        // Hasonlóság (felemelve 0.75-re, mert nagyon laza volt a kis különbségekre)
        const similarity = calculateSimilarity(currentText, item.question);
        if (similarity > 0.75) return true;
        
        // Szavas egyezés: nem elég 4 közös szó (pl. 'what', 'are', 'two', 'benefits'), 
        // a releváns szavak legalább 80%-ának egyeznie kell
        const itemWords = item.question.split(' ').filter(word => word.length > 3);
        const expectedWordCount = itemWords.length;
        const matchingWordCount = itemWords.filter(word => currentText.includes(word)).length;
        
        return expectedWordCount > 0 && matchingWordCount / expectedWordCount >= 0.8;
    });
}

// === DEBUG PANEL ===
let debugQuestionCount = 0;

function createDebugPanel() {
    // DEBUG PANEL LETILTVA - kommentezve maradt
    return;

    /*
    if (document.getElementById('stealth-debug-panel')) return;
    
    const panel = document.createElement('div');
    panel.id = 'stealth-debug-panel';
    panel.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 450px;
        max-height: 600px;
        background: rgba(0, 0, 0, 0.95);
        color: #00ff00;
        border: 2px solid #00ff00;
        border-radius: 8px;
        padding: 15px;
        font-family: monospace;
        font-size: 11px;
        overflow-y: auto;
        z-index: 10000;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
        user-select: text;
    `;
    
    const header = document.createElement('div');
    header.style.cssText = `
        font-weight: bold;
        margin-bottom: 10px;
        border-bottom: 1px solid #00ff00;
        padding-bottom: 10px;
        color: #00ff00;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    header.innerHTML = `
        <span>🔍 STEALTH HELPER - TALÁLT KÉRDÉSEK</span>
        <button id="stealth-copy-btn" style="
            background: #00ff00;
            color: #000;
            border: none;
            padding: 4px 8px;
            border-radius: 3px;
            cursor: pointer;
            font-weight: bold;
            font-size: 10px;
            font-family: monospace;
        ">COPY</button>
    `;
    
    panel.appendChild(header);
    
    const content = document.createElement('div');
    content.id = 'stealth-debug-content';
    content.style.cssText = `
        max-height: 500px;
        overflow-y: auto;
        user-select: text;
    `;
    
    panel.appendChild(content);
    document.body.appendChild(panel);
    window.stealthDebugPanel = panel;
    
    // Copy gomb funkció
    document.getElementById('stealth-copy-btn').addEventListener('click', () => {
        const text = document.getElementById('stealth-debug-content').innerText;
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('stealth-copy-btn');
            const originalText = btn.innerText;
            btn.innerText = '✓ COPIED!';
            btn.style.background = '#00ff00';
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = '#00ff00';
            }, 2000);
        });
    });
    */
}

function updateDebugPanel(questionText, answers) {
    // DEBUG LETILTVA
    return;
}

// Debug panel megjelenítése
window.addEventListener('load', createDebugPanel);


// === 2. A GYORSBILLENTYŰK (PÁNIKGOMBOK) ===
let isSelectionHidden = true; // Kijelölés rejtése
let isHighlightHidden = false; // Puska (vonal) rejtése
let stealthAnswerTimeout;

function showStealthAnswer(text) {
    let el = document.getElementById('stealth-answer-display');
    if (!el) {
        el = document.createElement('div');
        el.id = 'stealth-answer-display';
        el.style.cssText = `
            position: fixed;
            bottom: 5px;
            left: 5px;
            color: rgba(100, 100, 100, 0.7);
            font-size: 11px;
            font-family: monospace;
            z-index: 999999;
            pointer-events: none;
            background: rgba(255, 255, 255, 0.3);
            padding: 2px 5px;
            border-radius: 3px;
        `;
        document.body.appendChild(el);
    }

    el.innerText = text;
    el.style.opacity = '1';

    clearTimeout(stealthAnswerTimeout);
    stealthAnswerTimeout = setTimeout(() => {
        if (el) el.style.opacity = '0';
    }, 5000);
}

document.addEventListener('keydown', (e) => {
    // ALT + S : Kijelölés rejtésének ki/be kapcsolása
    if (e.altKey && e.key.toLowerCase() === 's') {
        isSelectionHidden = !isSelectionHidden;
        const styleEl = document.getElementById('stealth-selection-style');
        if (isSelectionHidden) {
            if (!styleEl && window.selectionStyle) document.head.appendChild(window.selectionStyle);
        } else {
            if (styleEl) styleEl.remove();
        }
    }

    // ALT + A : A helyes válasz jelölésének (vonalnak) a ki/be kapcsolása
    if (e.altKey && e.key.toLowerCase() === 'a') {
        isHighlightHidden = !isHighlightHidden;
        const hlStyleEl = document.getElementById('stealth-highlight-style');
        if (isHighlightHidden) {
            // Pánik mód: Eltüntetjük a puskát
            if (hlStyleEl) hlStyleEl.remove();
        } else {
            // Visszakapcsoljuk a puskát
            if (!hlStyleEl && window.highlightStyle) document.head.appendChild(window.highlightStyle);
        }
    }

    // ALT + Q : Kijelölt szöveg válaszának mutatása a bal alsó sarokban
    if (e.altKey && e.key.toLowerCase() === 'q') {
        let existingEl = document.getElementById('stealth-answer-display');
        // Ha már látszik a válasz, a gombnyomás azonnal elrejti
        if (existingEl && existingEl.style.opacity === '1') {
            existingEl.style.opacity = '0';
            return;
        }

        if (!isDatabaseLoaded || !examDatabase || examDatabase.length === 0) return;

        let selectedText = window.getSelection().toString().trim();
        if (selectedText.length < 5) return; // Kis engedmény a rövidebb szövegekre

        const currentText = normalizeText(selectedText);
        if (isBlacklisted(selectedText)) return;

        const match = findMatchingQuestion(currentText);

        if (match) {
            showStealthAnswer(match.answers.join(' | '));
        } else {
            showStealthAnswer("Nincs találat");
        }
    }
}, true);


// === 3. HELYI JSON ADATBÁZIS BETÖLTÉSE ===
let examDatabase = [];
let isDatabaseLoaded = false;
let searchAttempts = 0;
const maxSearchAttempts = 15; // Több próbálkozás
const searchInterval = 500; // 500ms között

// Blacklist - kiszűrjük a UI szövegeket
const blacklistTexts = [
    'select a space',
    'select space',
    'start the conversation',
    'click here',
    'loading',
    'please wait',
    'next',
    'previous',
    'submit',
    'cancel',
    'ok',
    'close',
    'exam',
    'final exam',
    'checkpoint',
    'course outline',
    'resources'
];

let processedQuestions = new Set(); // Nyomon követi a már feldolgozott kérdéseket

function isBlacklisted(text) {
    const normalized = normalizeText(text);
    return blacklistTexts.some(bl => normalized.includes(normalizeText(bl)));
}

function containsHungarianChars(text) {
    // Magyar karakterek: á, é, í, ó, ö, ő, ú, ü, ű
    return /[áéíóöőúüűÁÉÍÓÖŐÚÜŰ]/.test(text);
}

const jsonUrl = chrome.runtime.getURL('answers.json');

fetch(jsonUrl)
    .then(response => response.json())
    .then(data => {
        examDatabase = data.map(item => ({
            question: normalizeText(item.question),
            answers: item.answers.map(ans => normalizeText(ans)).filter(ans => ans.length > 1)
        })).filter(item => item.answers.length > 0);

        isDatabaseLoaded = true;
        console.log("✓ Adatbázis betöltve:", examDatabase.length, "kérdéssel");
        findQuestionsOnPage();
    })
    .catch(error => console.error("Hiba a JSON betöltésekor:", error));


// === 4. AUTOMATIKUS KERESÉS ÉS JELÖLÉS ===
window.addEventListener('load', () => {
    console.log("✓ Window load event");
    setTimeout(findQuestionsOnPage, 1000); // 1 másodperces késleltetés
});

// Agresszívebb intervallum alapú keresés
let lastSearchTime = 0;
setInterval(() => {
    if (isDatabaseLoaded && Date.now() - lastSearchTime > 2000) {
        lastSearchTime = Date.now();
        findQuestionsOnPage();
    }
}, 1000);

// MutationObserver az oldal módosításainak figyeléséhez
let mutationTimeout;
const observer = new MutationObserver(() => {
    clearTimeout(mutationTimeout);
    mutationTimeout = setTimeout(() => {
        if (isDatabaseLoaded) {
            console.log("★ MutationObserver aktiválva");
            findQuestionsOnPage();
        }
    }, 500); // 500ms késleltetés
});
observer.observe(document.body, { childList: true, subtree: true });

function findQuestionsOnPage() {
    if (!isDatabaseLoaded || examDatabase.length === 0) return;

    // DEBUG: Összes div-et vizsgálunk meg feltételek szerint
    const allDivs = document.querySelectorAll('div');

    let foundThisRound = 0;

    allDivs.forEach(el => {
        // Ha már jelölt, skip
        if (el.classList.contains('stealth-question-found')) return;

        const originalText = el.innerText.trim();
        const currentText = normalizeText(originalText);

        // Kiszűrjük a UI szövegeket és a túl rövid szövegeket
        if (currentText.length < 40 || isBlacklisted(originalText)) return;

        // Csak angol kérdésekre keresünk (magyar szövegek kiszűrése)
        if (containsHungarianChars(originalText)) return;

        // Kiszűrjük az már feldolgozott kérdéseket
        if (processedQuestions.has(currentText)) return;

        // Rugalmasabb keresés
        const match = findMatchingQuestion(currentText);

        if (match) {
            let childMatches = Array.from(el.children).some(child => {
                return normalizeText(child.innerText).includes(match.question);
            });

            if (childMatches) return;

            el.classList.add('stealth-question-found');
            processedQuestions.add(currentText); // Megjelöljük, mint feldolgozott
            highlightCorrectOptionsNearby(el, match.answers);
            foundThisRound++;

            console.log(`✅ MEGTALÁLVA: ${originalText.substring(0, 80)}`);
            // updateDebugPanel letiltva
        }
    });

    if (foundThisRound > 0) {
        console.log(`📊 Ebben a körben: ${foundThisRound} új kérdés`);
    }
}

function highlightCorrectOptionsNearby(questionElement, correctAnswersArray) {
    let parent = questionElement.parentElement;

    for (let i = 0; i < 6; i++) {
        if (!parent) break;

        // Bővített keresés: több elem típust keresünk
        const options = parent.querySelectorAll('li, label, span, div[class*="opt"], p, button');
        let foundCount = 0;

        options.forEach(opt => {
            if (opt.classList.contains('stealth-correct-option')) return;

            const optionText = normalizeText(opt.innerText);
            if (optionText.length < 2) return;

            let isCorrect = correctAnswersArray.some(correctAns => {
                if (correctAns.length < 2) return false;

                // Többféle egyeztetési módszer
                let isMatch = correctAns.includes(optionText) || optionText.includes(correctAns);
                let similarity = calculateSimilarity(optionText, correctAns);
                let lengthRatio = optionText.length / correctAns.length;

                return (isMatch && lengthRatio > 0.3 && lengthRatio < 3.0) || similarity > 0.8;
            });

            if (isCorrect) {
                opt.classList.add('stealth-correct-option');
                foundCount++;
            }
        });

        if (foundCount > 0 && foundCount >= correctAnswersArray.length) break;

        parent = parent.parentElement;
    }
}

// === 5. KERESÉS KIJELÖLÉS ALAPJÁN (NETACAD specifikus) ===
document.addEventListener('mouseup', () => {
    if (!isDatabaseLoaded || examDatabase.length === 0) return;

    // Kijelölt szöveg kinyerése
    let selectedText = window.getSelection().toString().trim();

    if (selectedText.length < 15) return; // Túl rövid szövegre ne keressünk

    const currentText = normalizeText(selectedText);
    if (isBlacklisted(selectedText)) return;

    // Keresés az adatbázisban a kijelölt szöveg alapján
    const match = findMatchingQuestion(currentText);

    if (match) {
        console.log(`✅ KIJELÖLÉS ALAPJÁN MEGTALÁLVA: ${selectedText.substring(0, 80)}`);
        highlightCorrectOptionsGlobal(match.answers);

        // Letiltjuk a sima kijelölést a testben, csak a "stealth" formázást mutatja, ami nem változtat a háttéren.
        // Ez opcionális, a kijelölés színét már amúgy is felülírtuk a stílusok között.
    }
}, true);

function highlightCorrectOptionsGlobal(correctAnswersArray) {
    // Végigmegyünk az összes olyan elemen globálisan, amibe válasz lehet írva (netacad.com specifikusan)
    const options = document.querySelectorAll('li, label, span, div[class*="opt"], div[class*="answer"], p, button, td');
    let foundCount = 0;

    options.forEach(opt => {
        if (opt.classList.contains('stealth-correct-option')) return;

        // Csak azokat az elemeket vizsgáljuk, amiknek nincs túl sok gyerekük (pl. ne az egész oldalt kijelölni)
        if (opt.children.length > 3 && opt.tagName.toLowerCase() !== 'label') return;

        const optionText = normalizeText(opt.innerText);
        if (optionText.length < 2) return;

        let isCorrect = correctAnswersArray.some(correctAns => {
            if (correctAns.length < 2) return false;

            let isMatch = correctAns.includes(optionText) || optionText.includes(correctAns);
            let similarity = calculateSimilarity(optionText, correctAns);
            let lengthRatio = optionText.length / correctAns.length;

            return (isMatch && lengthRatio > 0.3 && lengthRatio < 3.0) || similarity > 0.8;
        });

        if (isCorrect) {
            opt.classList.add('stealth-correct-option');
            foundCount++;
        }
    });

    if (foundCount > 0) {
        console.log(`📊 Kijelölés alapján bejelölve ${foundCount} db válasz on netacad.`);
    }
}

// Debug panel megjelenítése
window.addEventListener('load', createDebugPanel);