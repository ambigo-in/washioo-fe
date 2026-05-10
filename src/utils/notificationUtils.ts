import type { NotificationItem, UserRole } from "../types/apiTypes";

const cleanerTypes = new Set([
  "booking_assigned",
  "service_scheduled_today",
]);

const customerTypes = new Set([
  "cleaner_assigned",
  "booking_accepted",
  "cleaner_started_route",
  "service_started",
  "service_completed",
  "customer_rating",
  "payment_collected",
]);

const adminTypes = new Set([
  "booking_assignment_accepted",
  "booking_assignment_rejected",
]);

export const getNotificationLandingPath = (role?: UserRole) => {
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

export const getFilteredNotifications = (
  notifications: NotificationItem[],
  role?: UserRole | null,
) => {
  if (!role) return notifications;

  const allowedTypes =
    role === "cleaner"
      ? cleanerTypes
      : role === "admin"
        ? adminTypes
        : customerTypes;

  return notifications.filter((notification) =>
    allowedTypes.has(notification.notification_type),
  );
};

export const getNotificationTargetPath = (
  notification: NotificationItem,
  role?: UserRole | null,
) => {
  if (role === "cleaner" && notification.notification_type === "booking_assigned") {
    return "/cleaner/assignments?status=assigned";
  }

  if (
    role === "cleaner" &&
    notification.url?.startsWith("/cleaner/bookings/")
  ) {
    return "/cleaner/assignments?status=assigned";
  }

  return notification.url || getNotificationLandingPath(role ?? undefined);
};
