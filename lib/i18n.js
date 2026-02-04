// Internationalization system

const I18n = {
  currentLang: 'en',
  translations: {},
  
  languages: {
    en: 'English',
    ru: 'Русский'
  },

  async init() {
    const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
    const storage = await browserAPI.storage.sync.get(['language']);
    this.currentLang = storage.language || this.detectBrowserLanguage();
    await this.loadTranslations();
    this.applyTranslations();
    return this.currentLang;
  },

  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    return browserLang.startsWith('ru') ? 'ru' : 'en';
  },

  async loadTranslations() {
    try {
      const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
      const url = browserAPI.runtime.getURL(`_locales/${this.currentLang}/messages.json`);
      const response = await fetch(url);
      const messages = await response.json();

      this.translations = {};
      for (const [key, value] of Object.entries(messages)) {
        this.translations[key] = value.message;
      }
    } catch (error) {
      console.error('Failed to load translations:', error);
      if (this.currentLang !== 'en') {
        this.currentLang = 'en';
        await this.loadTranslations();
      }
    }
  },

  get(key, substitutions = {}) {
    let text = this.translations[key] || key;
    for (const [placeholder, value] of Object.entries(substitutions)) {
      text = text.replace(new RegExp(`\\$${placeholder.toUpperCase()}\\$`, 'g'), value);
    }
    return text;
  },

  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = this.get(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) el.placeholder = this.get(key);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) el.title = this.get(key);
    });
  },

  async setLanguage(lang) {
    if (this.languages[lang]) {
      const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
      this.currentLang = lang;
      await browserAPI.storage.sync.set({ language: lang });
      await this.loadTranslations();
      this.applyTranslations();
      return true;
    }
    return false;
  }
};

if (typeof window !== 'undefined') {
  window.I18n = I18n;
}
