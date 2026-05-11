import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useAuth } from "../context/useAuth";
import {
  fetchNotifications,
  markNotificationRead,
} from "../api/notificationApi";
import type { NotificationItem } from "../types/apiTypes";
import {
  getFilteredNotifications,
  getNotificationTargetPath,
} from "../utils/notificationUtils";
import { formatDisplayDateTime } from "../utils/dateTimeUtils";
import "./NotificationsPage.css";

export default function NotificationsPage() {
  const { activeRole } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!activeRole) return;

    let cancelled = false;

    const loadNotifications = async () => {
      setLoading(true);
      try {
        const response = await fetchNotifications(activeRole);
        if (!cancelled) {
          const filtered = getFilteredNotifications(
            response.notifications,
            activeRole,
          );
          setNotifications(filtered);
        }
      } catch {
        if (!cancelled) setNotifications([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadNotifications();
    return () => {
      cancelled = true;
    };
  }, [activeRole]);

  const handleOpenNotification = async (notification: NotificationItem) => {
    if (!activeRole) return;

    if (!notification.is_read) {
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

    navigate(getNotificationTargetPath(notification, activeRole));
  };

  const handleMarkAllRead = async () => {
    if (!activeRole || updating) return;

    const unread = notifications.filter((item) => !item.is_read);
    if (!unread.length) return;

    setUpdating(true);
    try {
      await Promise.all(
        unread.map((notification) =>
          markNotificationRead(activeRole, notification.id),
        ),
      );
      setNotifications((current) =>
        current.map((item) => ({ ...item, is_read: true })),
      );
    } finally {
      setUpdating(false);
    }
  };

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return (
    <DashboardLayout title="Notifications">
      <section className="notifications-page">
        <div className="notifications-header">
          <div>
            <h2>Important alerts</h2>
            <p>
              Stay up to date with service updates, assignment changes, and
              payment alerts.
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              className="notifications-mark-all"
              onClick={handleMarkAllRead}
              disabled={updating}
            >
              {updating ? "Updating..." : "Mark all as read"}
            </button>
          )}
        </div>

        {loading ? (
          <div className="notifications-empty">Loading notifications...</div>
        ) : notifications.length ? (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`notifications-card ${notification.is_read ? "read" : "unread"}`}
                onClick={() => handleOpenNotification(notification)}
              >
                <div className="notifications-card-header">
                  <strong>{notification.title}</strong>
                  {!notification.is_read && <span>New</span>}
                </div>
                <p>{notification.message}</p>
                <small>{formatDisplayDateTime(notification.created_at)}</small>
              </button>
            ))}
          </div>
        ) : (
          <div className="notifications-empty">
            No notifications found. We’ll keep you informed here when something
            important happens.
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
