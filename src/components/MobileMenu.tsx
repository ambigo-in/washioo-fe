import React from "react";

interface MobileMenuProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  onPrimaryAction: () => void;
  onNavigate: (path: string) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  isAuthenticated,
  onPrimaryAction,
  onNavigate,
}) => {
  return (
    <div className={`mobile-menu ${isOpen ? "active" : ""}`}>
      {isAuthenticated && (
        <>
          <button onClick={() => onNavigate("/bookings")}>Services</button>
          <button onClick={() => onNavigate("/my-bookings")}>My Bookings</button>
        </>
      )}
      <button onClick={onPrimaryAction}>
        {isAuthenticated ? "Logout" : "Book Now"}
      </button>
    </div>
  );
};

export default MobileMenu;

