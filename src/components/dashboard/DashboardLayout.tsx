import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LoadingButton } from "../ui";
import { useAuth } from "../../context/useAuth";
import { useAppSelector } from "../../store/hooks";
import {
  fetchNotifications,
  markNotificationRead,
} from "../../api/notificationApi";
import type { UserRole } from "../../types/apiTypes";
import type { NotificationItem } from "../../types/apiTypes";
import { registerCleanerPushNotifications } from "../../utils/pushNotifications";
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
  {
    path: "/vehicles",
    label: "My Vehicles",
    icon: "🚘",
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
  { path: "/admin/ratings", label: "Ratings", icon: "★", roles: ["admin"] },
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
  const { user, logout, activeRole } = useAuth();
  const { loading } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const pushRegistrationAttempted = useRef(false);

  const filteredNavItems = navItems.filter((item) =>
    activeRole ? item.roles.includes(activeRole) : false,
  );
  const unreadCount = notifications.filter((item) => !item.is_read).length;

  useEffect(() => {
    if (!activeRole) return;

    let cancelled = false;

    const loadNotifications = async () => {
      try {
        const response = await fetchNotifications(activeRole);
        if (!cancelled) setNotifications(response.notifications);
      } catch {
        if (!cancelled) setNotifications([]);
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 60000);

    if (activeRole === "cleaner" && !pushRegistrationAttempted.current) {
      pushRegistrationAttempted.current = true;
      registerCleanerPushNotifications().catch(() => {
        // The notification bell remains the fallback when browser push setup fails.
      });
    }

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [activeRole]);

  const handleLogout = async () => {
    await logout();
    navigate("/verify-phone");
  };

  const getRoleDisplay = (role?: UserRole | null) =>
    role ? role.charAt(0).toUpperCase() + role.slice(1) : "User";

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const getNotificationLandingPath = (role?: UserRole) => {
    switch (role) {
      case "cleaner":
        return "/cleaner/assignments";
      case "admin":
        return "/admin/bookings";
      case "customer":
        return "/my-bookings";
      default:
        return "/";
    }
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.is_read && activeRole) {
      try {
        const response = await markNotificationRead(
          activeRole,
          notification.id,
        );
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id ? response.notification : item,
          ),
        );
      } catch {
        setNotifications((current) =>
          current.map((item) =>
            item.id === notification.id ? { ...item, is_read: true } : item,
          ),
        );
      }
    }

    setNotificationOpen(false);
    navigate(
      notification.url || getNotificationLandingPath(activeRole || "customer"),
    );
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
          <span className="role-badge">{getRoleDisplay(activeRole)}</span>
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
          <LoadingButton
            className="logout-btn"
            isLoading={loading}
            loadingText="Logging out..."
            onClick={handleLogout}
          >
            Logout
          </LoadingButton>
        </div>
      </aside>

      <main className="dashboard-main">
        {title && (
          <header className="dashboard-header">
            <h1>{title}</h1>
            {activeRole && (
              <div className="notification-wrapper">
                <button
                  className="notification-button"
                  type="button"
                  aria-label="Cleaner notifications"
                  onClick={() => setNotificationOpen((current) => !current)}
                >
                  <span className="notification-bell" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="notification-count">{unreadCount}</span>
                  )}
                </button>
                {notificationOpen && (
                  <div className="notification-menu">
                    <div className="notification-menu-header">
                      <div>
                        <strong>Notifications</strong>
                        <div>{unreadCount} unread</div>
                      </div>
                      <button
                        type="button"
                        className="notification-view-all"
                        onClick={() => {
                          setNotificationOpen(false);
                          navigate("/notifications");
                        }}
                      >
                        View all
                      </button>
                    </div>
                    {notifications.length ? (
                      <div className="notification-list">
                        {notifications.map((notification) => (
                          <button
                            key={notification.id}
                            className={`notification-item ${
                              notification.is_read ? "" : "unread"
                            }`}
                            type="button"
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                          >
                            <span className="notification-title">
                              {notification.title}
                            </span>
                            <span className="notification-message">
                              {notification.message}
                            </span>
                            <span className="notification-time">
                              {new Date(
                                notification.created_at,
                              ).toLocaleString()}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="notification-empty">
                        No notifications yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </header>
        )}
        {children}
      </main>
    </div>
  );
}
