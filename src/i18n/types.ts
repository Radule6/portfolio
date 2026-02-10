import type enCommon from "./locales/en/common.json";
import type enHero from "./locales/en/hero.json";
import type enAbout from "./locales/en/about.json";
import type enProjects from "./locales/en/projects.json";
import type enContact from "./locales/en/contact.json";
import type enTerminal from "./locales/en/terminal.json";
import type enCommands from "./locales/en/commands.json";
import type enMeta from "./locales/en/meta.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: {
      common: typeof enCommon;
      hero: typeof enHero;
      about: typeof enAbout;
      projects: typeof enProjects;
      contact: typeof enContact;
      terminal: typeof enTerminal;
      commands: typeof enCommands;
      meta: typeof enMeta;
    };
  }
}
