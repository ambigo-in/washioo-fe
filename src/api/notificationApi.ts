import { apiRequest, withQuery, type PaginationParams } from "./client";
import type { NotificationItem, UserRole } from "../types/apiTypes";

export const fetchNotifications = (
  role: UserRole,
  params: PaginationParams & { unread_only?: boolean } = {},
) => {
  return apiRequest<{
    message: string;
    notifications: NotificationItem[];
    total: number;
  }>(
    withQuery(`/${role}/notifications`, {
      unread_only: false,
      limit: 50,
      offset: 0,
      ...params,
    }),
    { auth: true },
  );
};

export const markNotificationRead = (role: UserRole, notificationId: string) =>
  apiRequest<{ message: string; notification: NotificationItem }>(
    `/${role}/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      auth: true,
    },
  );
