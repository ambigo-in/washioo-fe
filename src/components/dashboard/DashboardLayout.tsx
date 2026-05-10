import React, { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LoadingButton } from "../ui";
import { useAuth } from "../../context/useAuth";
import { useAppSelector } from "../../store/hooks";
import {
  fetchNotifications,
  markNotificationRead,
} from "../../api/notificationApi";
import type { NotificationItem, UserRole } from "../../types/apiTypes";
import { registerCleanerPushNotifications } from "../../utils/pushNotifications";
import {
  getFilteredNotifications,
  getNotificationTargetPath,
} from "../../utils/notificationUtils";
import {
  useLanguage,
  type LanguageCode,
  type TranslationKey,
} from "../../i18n/LanguageContext";
import "./DashboardLayout.css";

interface NavItem {
  path: string;
  labelKey: TranslationKey;
  icon: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { path: "/dashboard", labelKey: "common.dashboard", icon: "⌂", roles: ["customer"] },
  { path: "/bookings", labelKey: "nav.bookService", icon: "▣", roles: ["customer"] },
  { path: "/my-bookings", labelKey: "nav.myBookings", icon: "≡", roles: ["customer"] },
  { path: "/addresses", labelKey: "nav.addresses", icon: "⌖", roles: ["customer"] },
  { path: "/vehicles", labelKey: "nav.vehicles", icon: "◇", roles: ["customer"] },
  { path: "/profile", labelKey: "nav.profile", icon: "○", roles: ["customer"] },
  {
    path: "/cleaner/dashboard",
    labelKey: "common.dashboard",
    icon: "⌂",
    roles: ["cleaner"],
  },
  { path: "/cleaner/assignments", labelKey: "nav.myJobs", icon: "≡", roles: ["cleaner"] },
  {
    path: "/cleaner/history",
    labelKey: "history.workHistory",
    icon: "◷",
    roles: ["cleaner"],
  },
  { path: "/cleaner/availability", labelKey: "nav.availability", icon: "◌", roles: ["cleaner"] },
  { path: "/cleaner/profile", labelKey: "nav.profile", icon: "○", roles: ["cleaner"] },
  { path: "/admin/dashboard", labelKey: "common.dashboard", icon: "▥", roles: ["admin"] },
  { path: "/admin/bookings", labelKey: "nav.bookings", icon: "≡", roles: ["admin"] },
  { path: "/admin/payments", labelKey: "nav.payments", icon: "□", roles: ["admin"] },
  { path: "/admin/ratings", labelKey: "nav.ratings", icon: "☆", roles: ["admin"] },
  { path: "/admin/cleaners", labelKey: "nav.cleaners", icon: "◍", roles: ["admin"] },
  { path: "/admin/services", labelKey: "nav.services", icon: "⚙", roles: ["admin"] },
  { path: "/admin/users", labelKey: "nav.users", icon: "◎", roles: ["admin"] },
  { path: "/admin/settings", labelKey: "nav.settings", icon: "⚙", roles: ["admin"] },
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
  const { language, setLanguage, t } = useLanguage();
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
        if (!cancelled) {
          setNotifications(
            getFilteredNotifications(response.notifications, activeRole),
          );
        }
      } catch {
        if (!cancelled) setNotifications([]);
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 60000);
    window.addEventListener("washioo:notifications-refresh", loadNotifications);

    if (activeRole === "cleaner" && !pushRegistrationAttempted.current) {
      pushRegistrationAttempted.current = true;
      registerCleanerPushNotifications().catch(() => {
        // The notification bell remains the fallback when browser push setup fails.
      });
    }

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("washioo:notifications-refresh", loadNotifications);
    };
  }, [activeRole]);

  const handleLogout = async () => {
    await logout();
    navigate("/verify-phone");
  };

  const getRoleDisplay = (role?: UserRole | null) =>
    role ? role.charAt(0).toUpperCase() + role.slice(1) : t("common.user");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
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
    navigate(getNotificationTargetPath(notification, activeRole));
  };

  return (
    <div className="dashboard-layout">
      <header className="mobile-header">
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          ☰
        </button>
        <span className="mobile-logo">Washioo</span>
        <div className="mobile-user">{user?.full_name?.charAt(0) || "U"}</div>
      </header>

      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={closeSidebar}
      />

      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Washioo</h2>
          <span className="role-badge">{getRoleDisplay(activeRole)}</span>
        </div>

        {activeRole !== "admin" && (
          <label className="language-select">
            <span>{t("language.label")}</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as LanguageCode)}
            >
              <option value="en">{t("language.english")}</option>
              <option value="te">{t("language.telugu")}</option>
              <option value="hi">{t("language.hindi")}</option>
            </select>
          </label>
        )}

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
              <span className="nav-label">{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="user-info">
              <p className="user-name">{user.full_name || t("common.user")}</p>
              <p className="user-phone">{user.phone}</p>
            </div>
          )}
          <LoadingButton
            className="logout-btn"
            isLoading={loading}
            loadingText="Logging out..."
            onClick={handleLogout}
          >
            {t("common.logout")}
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
                  aria-label="Notifications"
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
                        <strong>{t("common.notifications")}</strong>
                        <div>
                          {unreadCount} {t("common.unread")}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="notification-view-all"
                        onClick={() => {
                          setNotificationOpen(false);
                          navigate("/notifications");
                        }}
                      >
                        {t("actions.viewAll")}
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
