import React from "react";
import "./MobileMenu.css";

interface MobileMenuProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  dashboardPath: string;
  navLinks: { label: string; path: string }[];
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
  return (
    <div className={`mobile-menu ${isOpen ? "active" : ""}`}>
      {isAuthenticated && (
        <>
          <button onClick={() => onNavigate(dashboardPath)}>Dashboard</button>
          {navLinks.map((link) => (
            <button key={link.path} onClick={() => onNavigate(link.path)}>
              {link.label}
            </button>
          ))}
        </>
      )}
      <button onClick={onPrimaryAction}>
        {isAuthenticated ? "Logout" : "Book Now"}
      </button>
    </div>
  );
};

export default MobileMenu;

