import React from "react";
import "./MobileMenu.css";

interface MobileMenuProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  dashboardPath: string;
  onPrimaryAction: () => void;
  onNavigate: (path: string) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  isAuthenticated,
  dashboardPath,
  onPrimaryAction,
  onNavigate,
}) => {
  return (
    <div className={`mobile-menu ${isOpen ? "active" : ""}`}>
      {isAuthenticated && (
        <>
          <button onClick={() => onNavigate(dashboardPath)}>Dashboard</button>
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

