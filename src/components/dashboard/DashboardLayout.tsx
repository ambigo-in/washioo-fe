import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import type { UserRole } from "../../types/apiTypes";
import "./DashboardLayout.css";

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // Customer routes
  { path: "/dashboard", label: "Dashboard", icon: "🏠", roles: ["customer"] },
  { path: "/bookings", label: "Book Service", icon: "🚗", roles: ["customer"] },
  {
    path: "/my-bookings",
    label: "My Bookings",
    icon: "📋",
    roles: ["customer"],
  },
    {
      path: "/addresses",
      label: "My Addresses",
      icon: "📍",
      roles: ["customer"],
    },
    { path: "/profile", label: "Profile", icon: "👤", roles: ["customer"] },

  // Cleaner routes
  {
    path: "/cleaner/dashboard",
    label: "Dashboard",
    icon: "🏠",
    roles: ["cleaner"],
  },
  {
    path: "/cleaner/assignments",
    label: "My Jobs",
    icon: "📋",
    roles: ["cleaner"],
  },
    {
      path: "/cleaner/history",
      label: "Work History",
      icon: "📜",
      roles: ["cleaner"],
    },
  {
    path: "/cleaner/availability",
    label: "Availability",
    icon: "⏰",
    roles: ["cleaner"],
  },
    {
      path: "/cleaner/profile",
      label: "Profile",
      icon: "👤",
      roles: ["cleaner"],
    },

  // Admin routes
  {
    path: "/admin/dashboard",
    label: "Dashboard",
    icon: "📊",
    roles: ["admin"],
  },
  { path: "/admin/bookings", label: "Bookings", icon: "📋", roles: ["admin"] },
  { path: "/admin/payments", label: "Payments", icon: "💳", roles: ["admin"] },
  { path: "/admin/cleaners", label: "Cleaners", icon: "🧹", roles: ["admin"] },
  { path: "/admin/services", label: "Services", icon: "🔧", roles: ["admin"] },
    { path: "/admin/users", label: "Users", icon: "👥", roles: ["admin"] },
    { path: "/admin/settings", label: "Settings", icon: "⚙️", roles: ["admin"] },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  const { user, logout, roles } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNavItems = navItems.filter((item) =>
    item.roles.some((role) => roles.includes(role)),
  );

  const handleLogout = async () => {
    await logout();
    navigate("/verify-phone");
  };

  const getRoleDisplay = () => {
    if (roles.includes("admin")) return "Admin";
    if (roles.includes("cleaner")) return "Cleaner";
    if (roles.includes("customer")) return "Customer";
    return "User";
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          ☰
        </button>
        <span className="mobile-logo">Washioo</span>
        <div className="mobile-user">{user?.full_name?.charAt(0) || "U"}</div>
      </header>

      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={closeSidebar}
      />

      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Washioo</h2>
          <span className="role-badge">{getRoleDisplay()}</span>
        </div>

        <nav className="sidebar-nav">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
              onClick={closeSidebar}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="user-info">
              <p className="user-name">{user.full_name || "User"}</p>
              <p className="user-phone">{user.phone}</p>
            </div>
          )}
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        {title && (
          <header className="dashboard-header">
            <h1>{title}</h1>
          </header>
        )}
        {children}
      </main>
    </div>
  );
}
