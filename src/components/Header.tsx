import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import MobileMenu from "./MobileMenu";
import "../styles/header.css";

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handlePrimaryAction = async () => {
    if (isAuthenticated) {
      await logout();
      navigate("/");
    } else {
      navigate("/verify-phone");
    }
    setMenuOpen(false);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <header className="hero-header">
      <div className="logo-section" onClick={() => navigate("/")}>
        <div className="logo-icon">
          <img
            src="/logo.png"
            alt="Washioo Logo"
            className="logo-image"
          />
        </div>

        {/* <h1 className="logo-text">WashNow</h1> */}
      </div>

      <nav className="header-nav" aria-label="Primary navigation">
        {isAuthenticated && (
          <>
            <button type="button" onClick={() => handleNavigate("/bookings")}>
              Services
            </button>
            <button type="button" onClick={() => handleNavigate("/my-bookings")}>
              My Bookings
            </button>
          </>
        )}

        <button className="auth-button" onClick={handlePrimaryAction}>
          {isAuthenticated ? "Logout" : "Book Now"}
        </button>
      </nav>

      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <MobileMenu
        isOpen={menuOpen}
        isAuthenticated={isAuthenticated}
        onPrimaryAction={handlePrimaryAction}
        onNavigate={handleNavigate}
      />
    </header>
  );
};

export default Header;

