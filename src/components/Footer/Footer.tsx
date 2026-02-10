import React from "react";
import { useTranslation } from "react-i18next";

const Footer: React.FC = () => {
  const { t } = useTranslation("common");

  return (
    <footer className="bg-surface border-t border-border px-6 sm:px-10 lg:px-16 py-8 sm:py-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-display text-sm font-semibold tracking-tight text-text-muted">
          RADULE<span className="gradient-text">.DEV</span>
        </span>
        <span className="font-body text-xs text-text-muted">
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </span>
      </div>
    </footer>
  );
};

export default Footer;
