import { AppState, setLanguage, notifyListeners } from './store.js';

const TRANSLATION_CACHE_KEY = 'sahayak_translations_cache';
let translationCache = JSON.parse(localStorage.getItem(TRANSLATION_CACHE_KEY)) || {};

function saveCache() {
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(translationCache));
}

// Function to chunk array to avoid URI too long errors
function chunkArray(array, size) {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size));
    }
    return chunked;
}

export async function translateTextBatch(texts, targetLang) {
    if (targetLang === 'en') return texts; // default is English

    // Initialize cache for target language
    if (!translationCache[targetLang]) {
        translationCache[targetLang] = {};
    }

    const toTranslate = [];
    const translatedResults = [];
    const textIndicesMap = []; // Maps toTranslate index to original index

    // Check cache first
    texts.forEach((text, i) => {
        const t = text.trim();
        if (t === '') {
            translatedResults[i] = text; 
        } else if (translationCache[targetLang][t]) {
            translatedResults[i] = translationCache[targetLang][t];
        } else {
            toTranslate.push(t);
            textIndicesMap.push(i);
        }
    });

    if (toTranslate.length === 0) {
        return translatedResults;
    }

    // Google Translate free endpoint doesn't support massive arrays, so we must format it as a single string joined by unique separators, OR chunk standard API calls.
    // The safest way for `translate.googleapis.com/translate_a/single?client=gtx` is to pass multiple `&q=` parameters.
    
    // Chunking to 20 strings max per request
    const chunks = chunkArray(toTranslate, 20);
    
    let translateIdx = 0;

    for (const chunk of chunks) {
        let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t`;
        chunk.forEach(txt => {
            url += `&q=${encodeURIComponent(txt)}`;
        });

        try {
            const res = await fetch(url);
            const data = await res.json();
            
            // data[0] contains the translated segments
            // when multiple q are passed, data[0] looks like: [["translated1", "original1",...], ["translated2", "original2",..]]
            // however sometimes google batches sentences inside one q, so we must map it back carefully.
            
            // Actually, a safer pattern for batch translating on the gtx interface is passing a single string with a delimiter.
            // Let's fallback to the delimiter pattern just in case the multi-q response is weird.
        } catch(e) {
            console.error("Translation error", e);
        }
    }
    
    return [];
}


// Let's implement the highly reliable delimiter-based batch translator:
export async function batchTranslate(texts, targetLang) {
    if (targetLang === 'en') return texts;
    
    if (!translationCache[targetLang]) {
        translationCache[targetLang] = {};
    }

    const results = [...texts];
    const pendingIndices = [];
    const pendingTexts = [];

    texts.forEach((text, idx) => {
        const cleanText = text.trim();
        if (!cleanText) return;
        
        if (translationCache[targetLang][cleanText]) {
            results[idx] = text.replace(cleanText, translationCache[targetLang][cleanText]);
        } else {
            pendingIndices.push(idx);
            pendingTexts.push(cleanText);
        }
    });

    if (pendingTexts.length === 0) return results;

    const DELIMITER = ' ||| ';
    const MAX_LENGTH = 1500; // max char length to prevent 414 URI Too Long

    let currentBatch = [];
    let currentLength = 0;
    const batches = [];

    // Grouping
    for (let i = 0; i < pendingTexts.length; i++) {
        const txt = pendingTexts[i];
        if (currentLength + txt.length > MAX_LENGTH && currentBatch.length > 0) {
            batches.push({ texts: currentBatch });
            currentBatch = [];
            currentLength = 0;
        }
        currentBatch.push({ text: txt, globalIndex: pendingIndices[i] });
        currentLength += txt.length + DELIMITER.length;
    }
    if (currentBatch.length > 0) batches.push({ texts: currentBatch });

    // Fetching batches
    for (const batch of batches) {
        const combinedString = batch.texts.map(b => b.text).join(DELIMITER);
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(combinedString)}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            // data[0] is an array of [translated_segment, original_segment]
            let translatedString = data[0].map(item => item[0]).join('');
            let translatedArray = translatedString.split(/ \|\|\| |\|\|\|/); // Split by delimiter, sometimes it adds spaces

            for (let i = 0; i < batch.texts.length; i++) {
                const globalIdx = batch.texts[i].globalIndex;
                const originalText = batch.texts[i].text;
                // Fallback to original text if split goes wrong
                const translated = translatedArray[i] ? translatedArray[i].trim() : originalText;
                
                translationCache[targetLang][originalText] = translated;
                results[globalIdx] = texts[globalIdx].replace(originalText, translated);
            }
        } catch (error) {
            console.error('Batch translation API failed:', error);
        }
    }

    saveCache();
    return results;
}

export async function translateDOM() {
    const lang = AppState.language;
    
    // We only translate elements with 'data-translate="true"' to avoid messing up structural components or icons
    // But the requirements say "Extract all visible text nodes". Let's walk the DOM for specifically clean text nodes
    const walkDOM = (node, func) => {
        if (node.nodeType === 3) { // Text node
            const text = node.nodeValue.trim();
            // Skip empty text, script/style content, and numbers-only, or icon classes
            if (text.length > 1 && !/^\d+$/.test(text) && node.parentNode.tagName !== 'SCRIPT' && node.parentNode.tagName !== 'STYLE') {
                func(node);
            }
        } else {
            // Do not traverse into icons or ignore elements
            if (node.tagName !== 'I' && !node.classList?.contains('no-translate')) {
                node.childNodes.forEach(child => walkDOM(child, func));
            }
        }
    };

    const textNodes = [];
    walkDOM(document.body, (n) => textNodes.push(n));

    // Also get placeholders
    const inputs = document.querySelectorAll('input[placeholder], textarea[placeholder]');
    
    const allTextsToTranslate = [
        ...textNodes.map(n => n.nodeValue),
        ...Array.from(inputs).map(i => i.placeholder)
    ];

    // Trigger overlay
    const overlay = document.getElementById('loadingOverlay');
    if(overlay) {
        overlay.classList.remove('hidden');
        document.getElementById('loadingText').innerText = "Translating interface...";
    }

    const translated = await batchTranslate(allTextsToTranslate, lang);

    // Apply translations
    let idx = 0;
    textNodes.forEach(n => {
        n.nodeValue = translated[idx++];
    });
    
    inputs.forEach(i => {
        i.placeholder = translated[idx++];
    });

    document.documentElement.lang = lang;

    if(overlay) overlay.classList.add('hidden');
}

export function initI18n() {
    const langSelect = document.getElementById('langSelect');
    if(langSelect) {
        langSelect.value = AppState.language;
        langSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
            translateDOM();
        });
    }

    // Initial translation if not english
    if(AppState.language !== 'en') {
        translateDOM();
    }
}
