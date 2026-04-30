import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MobileMenu from "./MobileMenu";
import "../styles/header.css";

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handlePrimaryAction = () => {
    if (isAuthenticated) {
      logout();
      navigate("/");
    } else {
      navigate("/verify-phone");
    }
    setMenuOpen(false);
  };

  return (
    <header className="hero-header">
      <div className="logo-section" onClick={() => navigate("/")}>
        <div className="logo-icon">✨</div>
        <h1 className="logo-text">WashNow</h1>
      </div>

      <button className="auth-button" onClick={handlePrimaryAction}>
        {isAuthenticated ? "Logout" : "Book Now"}
      </button>

      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <MobileMenu
        isOpen={menuOpen}
        isAuthenticated={isAuthenticated}
        onPrimaryAction={handlePrimaryAction}
      />
    </header>
  );
};

export default Header;
