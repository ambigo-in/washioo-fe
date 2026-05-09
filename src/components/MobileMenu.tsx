import React from "react";
import { useLanguage } from "../i18n/LanguageContext";
import "./MobileMenu.css";

interface MobileMenuProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  dashboardPath: string;
  navLinks: { labelKey: string; path: string }[];
  onPrimaryAction: () => void;
  onNavigate: (path: string) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  isAuthenticated,
  dashboardPath,
  navLinks,
  onPrimaryAction,
  onNavigate,
}) => {
  const { t } = useLanguage();

  return (
    <div className={`mobile-menu ${isOpen ? "active" : ""}`}>
      {isAuthenticated && (
        <>
          <button onClick={() => onNavigate(dashboardPath)}>
            {t("common.dashboard")}
          </button>
          {navLinks.map((link) => (
            <button key={link.path} onClick={() => onNavigate(link.path)}>
              {t(link.labelKey)}
            </button>
          ))}
        </>
      )}
      <button onClick={onPrimaryAction}>
        {isAuthenticated ? t("common.logout") : t("customer.bookNow")}
      </button>
    </div>
  );
};

export default MobileMenu;

