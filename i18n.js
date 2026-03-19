// i18n.js - Internationalization system for Invoice Generator

class I18n {
  constructor() {
    this.currentLocale = "en-US";
    this.translations = {};
    this.supportedLocales = [
      { code: "en-US", name: "English (US)", flag: "🇺🇸" },
      { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷" },
      { code: "pt-PT", name: "Português (Portugal)", flag: "🇵🇹" },
      { code: "es", name: "Español", flag: "🇪🇸" },
      { code: "fr", name: "Français", flag: "🇫🇷" },
      { code: "nl", name: "Nederlands", flag: "🇳🇱" },
      { code: "ja", name: "日本語", flag: "🇯🇵" },
      { code: "zh", name: "中文", flag: "🇨🇳" },
      { code: "ar", name: "العربية", flag: "🇸🇦" },
      { code: "he", name: "עברית", flag: "🇮🇱" },
      { code: "de", name: "Deutsch", flag: "🇩🇪" },
      { code: "it", name: "Italiano", flag: "🇮🇹" },
      { code: "ru", name: "Русский", flag: "🇷🇺" },
      { code: "uk", name: "Українська", flag: "🇺🇦" },
      { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    ];
  }

  // Load translation file for a specific locale
  async loadTranslations(locale) {
    try {
      const response = await fetch(`/locales/${locale}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${locale}`);
      }
      const translations = await response.json();
      this.translations[locale] = translations;
      return translations;
    } catch (error) {
      console.error(`Error loading translations for ${locale}:`, error);
      // Fallback to en-US if available
      if (locale !== "en-US" && this.translations["en-US"]) {
        return this.translations["en-US"];
      }
      throw error;
    }
  }

  // Get translation by key path (e.g., "form.invoiceNumber")
  t(key, locale = null) {
    const targetLocale = locale || this.currentLocale;
    const translation = this.translations[targetLocale];

    if (!translation) {
      console.warn(`Translations not loaded for locale: ${targetLocale}`);
      return key;
    }

    // Navigate through nested keys
    const keys = key.split(".");
    let value = translation;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        console.warn(
          `Translation key not found: ${key} for locale: ${targetLocale}`,
        );
        return key;
      }
    }

    return value;
  }

  // Set current locale and load translations
  async setLocale(locale) {
    if (!this.supportedLocales.find((l) => l.code === locale)) {
      console.warn(`Unsupported locale: ${locale}`);
      return false;
    }

    // Load translations if not already loaded
    if (!this.translations[locale]) {
      await this.loadTranslations(locale);
    }

    this.currentLocale = locale;

    // Save to localStorage
    localStorage.setItem("invoiceGeneratorLocale", locale);

    // Update HTML lang attribute
    document.documentElement.lang = locale;

    // Update RTL for Arabic and Hebrew
    if (locale === "ar" || locale === "he") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }

    return true;
  }

  // Get current locale
  getLocale() {
    return this.currentLocale;
  }

  // Get current currency
  getCurrency() {
    // First, try to get the selected currency from the currency select element
    const currencySelect = document.getElementById("currency");
    if (currencySelect && currencySelect.value) {
      return currencySelect.value;
    }
    // Fallback to locale-based default currency
    return this.t("defaultCurrency") || "USD";
  }

  // Initialize i18n system
  async init() {
    // Check for saved locale in localStorage
    const savedLocale = localStorage.getItem("invoiceGeneratorLocale");

    // Detect browser locale
    const browserLocale = navigator.language || navigator.userLanguage;

    // Determine which locale to use
    let initialLocale = "en-US";

    if (
      savedLocale &&
      this.supportedLocales.find((l) => l.code === savedLocale)
    ) {
      initialLocale = savedLocale;
    } else if (this.supportedLocales.find((l) => l.code === browserLocale)) {
      initialLocale = browserLocale;
    } else {
      // Try to match just the language part (e.g., 'en' from 'en-GB')
      const lang = browserLocale.split("-")[0];
      const matchedLocale = this.supportedLocales.find((l) =>
        l.code.startsWith(lang),
      );
      if (matchedLocale) {
        initialLocale = matchedLocale.code;
      }
    }

    // Load and set the initial locale
    await this.loadTranslations(initialLocale);
    await this.setLocale(initialLocale);

    return initialLocale;
  }

  // Update all UI elements with translations
  updateUI() {
    // Update meta tags
    document.title = this.t("meta.title");
    this.updateMetaTag("description", this.t("meta.description"));
    this.updateMetaTag("keywords", this.t("meta.keywords"));

    // Alias map for keys introduced in HTML that differ from locale structure
    const aliasMap = {
      "ad.label": "common.adLabel"
    };

    // Update all elements with data-i18n attribute
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      let key = element.getAttribute("data-i18n");
      let value = this.t(key);
      // Fallback via alias map if key not found
      if (value === key && aliasMap[key]) {
        value = this.t(aliasMap[key]);
      }
      element.textContent = value;
    });

    // Update all placeholders with data-i18n-placeholder attribute
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const key = element.getAttribute("data-i18n-placeholder");
      element.placeholder = this.t(key);
    });

  }

  // Helper function to update meta tag
  updateMetaTag(name, content) {
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (meta) {
      meta.setAttribute("content", content);
    }
  }

  // Create language selector dropdown
  createLanguageSelector() {
    const header = document.querySelector(".app-header");
    if (!header) return;

    // Check if selector already exists
    if (document.getElementById("languageSelect")) return;

    const selectorContainer = document.createElement("div");
    selectorContainer.className = "language-selector";

    const select = document.createElement("select");
    select.id = "languageSelect";
    select.className = "language-select";
    select.style.cssText = `
            padding: 0.5rem 1rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            font-size: 0.9rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: all 0.2s ease;
        `;

    this.supportedLocales.forEach((locale) => {
      const option = document.createElement("option");
      option.value = locale.code;
      option.textContent = `${locale.flag} ${locale.name}`;
      if (locale.code === this.currentLocale) {
        option.selected = true;
      }
      select.appendChild(option);
    });

    select.addEventListener("change", async (e) => {
      const newLocale = e.target.value;
      await this.setLocale(newLocale);
      this.updateUI();

      // Update currency select to the locale's default currency if no currency is selected yet
      const currencySelect = document.getElementById("currency");
      if (currencySelect && !localStorage.getItem('invoiceGeneratorData')) {
        const defaultCurrency = this.t("defaultCurrency") || currencySelect.value;
        if (currencySelect.querySelector(`option[value="${defaultCurrency}"]`)) {
          currencySelect.value = defaultCurrency;
        }
      }

      // Trigger preview update if the function exists
      if (typeof updatePreview === "function") {
        updatePreview();
      }
    });

    // Add hover effect
    select.addEventListener("mouseenter", () => {
      select.style.borderColor = "#4a90e2";
    });

    select.addEventListener("mouseleave", () => {
      select.style.borderColor = "#ddd";
    });

    selectorContainer.appendChild(select);
    header.style.position = "relative";
    header.appendChild(selectorContainer);
  }

  // Format currency based on locale
  formatCurrency(amount) {
    const currency = this.getCurrency();
    const locale = this.currentLocale;

    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (error) {
      // Fallback formatting
      return `${currency} ${parseFloat(amount).toFixed(2)}`;
    }
  }
}

// Create global i18n instance
const i18n = new I18n();

// Initialize on DOM load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", async () => {
    await i18n.init();
    i18n.createLanguageSelector();
    i18n.updateUI();
  });
} else {
  // DOM already loaded
  (async () => {
    await i18n.init();
    i18n.createLanguageSelector();
    i18n.updateUI();
  })();
}
