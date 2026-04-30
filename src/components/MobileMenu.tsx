import React from "react";

interface MobileMenuProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  onPrimaryAction: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  isAuthenticated,
  onPrimaryAction,
}) => {
  return (
    <div className={`mobile-menu ${isOpen ? "active" : ""}`}>
      <button onClick={onPrimaryAction}>
        {isAuthenticated ? "Logout" : "Book Now"}
      </button>
    </div>
  );
};

export default MobileMenu;
