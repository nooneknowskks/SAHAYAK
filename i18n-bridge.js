/**
 * Sahayak AI — Language bridge (custom JSON locale modules, no full page reload).
 *
 * Flow:
 * 1. Locale dictionaries live in /locales/{lang}.js as ES modules.
 * 2. `t(key)` resolves against active language, falling back to English, then the key.
 * 3. `setLanguage(lang)` updates global state, persists to localStorage, reapplies
 *    all [data-i18n] nodes, and notifies subscribers (dashboard, chat, toasts).
 * 4. Template strings use {{name}}-style placeholders via t(key, { name: '...' }).
 */

import en from "./locales/en.js";
import hi from "./locales/hi.js";
import mr from "./locales/mr.js";

const catalog = { en, hi, mr };
const FALLBACK = "en";

let activeLang =
  typeof localStorage !== "undefined"
    ? localStorage.getItem("sahayak_lang") || FALLBACK
    : FALLBACK;

const subscribers = new Set();

function mergedDict(lang) {
  const base = catalog[FALLBACK] || {};
  const over = catalog[lang] || {};
  return { ...base, ...over };
}

/** Translate a key; optional `vars` replaces {{var}} in the string. */
export function t(key, vars) {
  const dict = mergedDict(activeLang);
  let str = dict[key];
  if (str === undefined) str = (catalog[FALLBACK] && catalog[FALLBACK][key]) || key;
  if (vars && typeof str === "string") {
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), String(v));
    });
  }
  return str;
}

export function getLocale() {
  return activeLang;
}

/** Re-apply every [data-i18n] attribute in the document (inputs use placeholder). */
export function applyToDocument() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    const val = t(key);
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.placeholder = val;
    } else {
      el.textContent = val;
    }
  });
  document.documentElement.lang = activeLang;
}

function notify() {
  applyToDocument();
  subscribers.forEach((fn) => {
    try {
      fn(activeLang);
    } catch (e) {
      console.warn("i18n subscriber error", e);
    }
  });
}

/**
 * Switch UI language: persists, updates DOM i18n nodes, chat strings, and listeners.
 */
export function setLanguage(lang) {
  if (!catalog[lang]) {
    console.warn("Unknown locale:", lang);
    return;
  }
  activeLang = lang;
  localStorage.setItem("sahayak_lang", lang);
  notify();
}

export function subscribe(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

export function initI18nFromStorage() {
  if (!catalog[activeLang]) activeLang = FALLBACK;
  notify();
}
