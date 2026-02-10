import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import enHero from "./locales/en/hero.json";
import enAbout from "./locales/en/about.json";
import enProjects from "./locales/en/projects.json";
import enContact from "./locales/en/contact.json";
import enTerminal from "./locales/en/terminal.json";
import enCommands from "./locales/en/commands.json";
import enMeta from "./locales/en/meta.json";

import hrCommon from "./locales/hr/common.json";
import hrHero from "./locales/hr/hero.json";
import hrAbout from "./locales/hr/about.json";
import hrProjects from "./locales/hr/projects.json";
import hrContact from "./locales/hr/contact.json";
import hrTerminal from "./locales/hr/terminal.json";
import hrCommands from "./locales/hr/commands.json";
import hrMeta from "./locales/hr/meta.json";

import deCommon from "./locales/de/common.json";
import deHero from "./locales/de/hero.json";
import deAbout from "./locales/de/about.json";
import deProjects from "./locales/de/projects.json";
import deContact from "./locales/de/contact.json";
import deTerminal from "./locales/de/terminal.json";
import deCommands from "./locales/de/commands.json";
import deMeta from "./locales/de/meta.json";

const STORAGE_KEY = "radule-lang";

const supportedLanguages = ["en", "hr", "de"] as const;
type SupportedLanguage = (typeof supportedLanguages)[number];

function getInitialLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && supportedLanguages.includes(stored as SupportedLanguage)) {
    return stored as SupportedLanguage;
  }
  const browserLang = navigator.language.split("-")[0];
  if (supportedLanguages.includes(browserLang as SupportedLanguage)) {
    return browserLang as SupportedLanguage;
  }
  return "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      hero: enHero,
      about: enAbout,
      projects: enProjects,
      contact: enContact,
      terminal: enTerminal,
      commands: enCommands,
      meta: enMeta,
    },
    hr: {
      common: hrCommon,
      hero: hrHero,
      about: hrAbout,
      projects: hrProjects,
      contact: hrContact,
      terminal: hrTerminal,
      commands: hrCommands,
      meta: hrMeta,
    },
    de: {
      common: deCommon,
      hero: deHero,
      about: deAbout,
      projects: deProjects,
      contact: deContact,
      terminal: deTerminal,
      commands: deCommands,
      meta: deMeta,
    },
  },
  lng: getInitialLanguage(),
  fallbackLng: "en",
  defaultNS: "common",
  ns: ["common", "hero", "about", "projects", "contact", "terminal", "commands", "meta"],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

// Persist language choice
i18n.on("languageChanged", (lng) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, lng);
  }
});

export default i18n;
