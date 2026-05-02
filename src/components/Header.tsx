import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import MobileMenu from "./MobileMenu";
import "../styles/header.css";

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, logout, activeRole } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = activeRole === "admin"
    ? "/admin/dashboard"
    : activeRole === "cleaner"
      ? "/cleaner/dashboard"
      : "/dashboard";

  const navLinks =
    activeRole === "admin"
      ? [
          { label: "Bookings", path: "/admin/bookings" },
          { label: "Ratings", path: "/admin/ratings" },
        ]
      : activeRole === "cleaner"
        ? [{ label: "My Jobs", path: "/cleaner/assignments" }]
        : [
            { label: "Services", path: "/bookings" },
            { label: "My Bookings", path: "/my-bookings" },
          ];

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
            <button type="button" onClick={() => handleNavigate(dashboardPath)}>
              Dashboard
            </button>
            {navLinks.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => handleNavigate(link.path)}
              >
                {link.label}
              </button>
            ))}
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
        dashboardPath={dashboardPath}
        navLinks={navLinks}
        onPrimaryAction={handlePrimaryAction}
        onNavigate={handleNavigate}
      />
    </header>
  );
};

export default Header;

