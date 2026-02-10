import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const MetaUpdater: React.FC = () => {
  const { t, i18n } = useTranslation("meta");

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.title = t("title");

    const setMeta = (attr: string, value: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${value}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, value);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", t("description"));
    setMeta("property", "og:title", t("ogTitle"));
    setMeta("property", "og:description", t("ogDescription"));
    setMeta("name", "twitter:title", t("ogTitle"));
    setMeta("name", "twitter:description", t("ogDescription"));
  }, [t, i18n.language]);

  return null;
};

export default MetaUpdater;
