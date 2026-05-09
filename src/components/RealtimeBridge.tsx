import { useEffect, useRef } from "react";
import { connectRealtime, type RealtimeConnection, type RealtimeEvent } from "../api/realtimeClient";
import { useAppDispatch } from "../store/hooks";
import type { UserRole } from "../types/apiTypes";
import { loadAdminBookings } from "../store/slices/adminSlice";
import { loadCleanerAssignments, loadCleanerProfile } from "../store/slices/cleanerSlice";
import { loadCustomerBookings } from "../store/slices/customerSlice";

type RealtimeBridgeProps = {
  isAuthenticated: boolean;
  activeRole: UserRole | null;
};

const notificationEvents = new Set([
  "notification_created",
]);

const dataRefreshEvents = new Set([
  "booking_auto_assigned",
  "booking_assignment_updated",
  "admin_action_required",
  "booking_status_changed",
  "assignment_accepted",
  "assignment_rejected",
  "service_started",
  "service_completed",
]);

const reconnectDelaysMs = [3000, 10000, 30000, 60000, 120000];

export default function RealtimeBridge({
  isAuthenticated,
  activeRole,
}: RealtimeBridgeProps) {
  const dispatch = useAppDispatch();
  const reconnectTimer = useRef<number | null>(null);
  const refreshTimer = useRef<number | null>(null);
  const connection = useRef<RealtimeConnection | null>(null);
  const reconnectAttempt = useRef(0);

  useEffect(() => {
    if (!isAuthenticated || !activeRole) return undefined;

    let active = true;

    const closeConnection = () => {
      connection.current?.close();
      connection.current = null;
    };

    const scheduleReconnect = () => {
      if (!active || reconnectTimer.current != null) return;
      const delay =
        reconnectDelaysMs[
          Math.min(reconnectAttempt.current, reconnectDelaysMs.length - 1)
        ];
      reconnectAttempt.current += 1;
      reconnectTimer.current = window.setTimeout(() => {
        reconnectTimer.current = null;
        openConnection();
      }, delay);
    };

    const handleEvent = (event: RealtimeEvent) => {
      if (notificationEvents.has(event.type)) {
        window.dispatchEvent(new CustomEvent("washioo:notifications-refresh"));
      }

      if (!dataRefreshEvents.has(event.type)) {
        return;
      }

      if (refreshTimer.current != null) return;
      refreshTimer.current = window.setTimeout(() => {
        refreshTimer.current = null;

      if (activeRole === "cleaner") {
        dispatch(loadCleanerAssignments(undefined));
        dispatch(loadCleanerProfile());
      } else if (activeRole === "customer") {
        dispatch(loadCustomerBookings(undefined));
      } else if (activeRole === "admin") {
        dispatch(loadAdminBookings("all"));
      }
      }, 500);
    };

    const openConnection = () => {
      closeConnection();
      connection.current = connectRealtime({
        onEvent: handleEvent,
        onDisconnect: scheduleReconnect,
        onOpen: () => {
          reconnectAttempt.current = 0;
        },
      });
      if (!connection.current) scheduleReconnect();
    };

    openConnection();

    return () => {
      active = false;
      if (reconnectTimer.current != null) {
        window.clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
      if (refreshTimer.current != null) {
        window.clearTimeout(refreshTimer.current);
        refreshTimer.current = null;
      }
      reconnectAttempt.current = 0;
      closeConnection();
    };
  }, [activeRole, dispatch, isAuthenticated]);

  return null;
}
