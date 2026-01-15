// i18n system for KDS-AI dev-app
import { es } from './es';
import { en } from './en';
import { de } from './de';

type Lang = 'es' | 'en' | 'de';
type Translations = typeof es;

const translations: Record<Lang, Translations> = { es, en, de };

let currentLang: Lang = 'en'; // Default to English
const listeners: Array<(lang: Lang) => void> = [];

// Load language preference from localStorage
const storedLang = localStorage.getItem('kds-lang');
if (storedLang === 'en' || storedLang === 'es' || storedLang === 'de') {
  currentLang = storedLang;
}

export function getCurrentLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang): void {
  if (lang !== currentLang) {
    currentLang = lang;
    localStorage.setItem('kds-lang', lang);
    listeners.forEach(fn => fn(lang));
  }
}

export function onLangChange(callback: (lang: Lang) => void): () => void {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  };
}

// Translation function with parameter substitution
export function t(key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = translations[currentLang];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }
  
  if (typeof value !== 'string') {
    console.warn(`Translation value is not a string: ${key}`);
    return key;
  }
  
  // Replace parameters {param} with values
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  }
  
  return value;
}
