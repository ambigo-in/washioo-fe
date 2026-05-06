import {
  deleteCleanerPushSubscription,
  fetchCleanerPushPublicKey,
  saveCleanerPushSubscription,
} from "../api/cleanerApi";
import type { WebPushSubscriptionPayload } from "../types/cleanerTypes";

const SERVICE_WORKER_PATH = "/washioo-service-worker.js";

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
};

const supportsPushNotifications = () =>
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

const toSubscriptionPayload = (
  subscription: PushSubscription,
): WebPushSubscriptionPayload => {
  const payload = subscription.toJSON() as {
    endpoint?: string;
    expirationTime?: number | null;
    keys?: {
      p256dh?: string;
      auth?: string;
    };
  };

  if (!payload.endpoint || !payload.keys?.p256dh || !payload.keys.auth) {
    throw new Error("Browser returned an incomplete push subscription.");
  }

  return {
    endpoint: payload.endpoint,
    expirationTime: payload.expirationTime ?? null,
    keys: {
      p256dh: payload.keys.p256dh,
      auth: payload.keys.auth,
    },
  };
};

export const registerCleanerPushNotifications = async () => {
  if (!supportsPushNotifications()) return "unsupported";

  const response = await fetchCleanerPushPublicKey();
  if (!response.web_push.enabled || !response.web_push.public_key) {
    return "disabled";
  }

  if (Notification.permission === "denied") return "denied";

  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();

  if (permission !== "granted") return permission;

  const registration =
    await navigator.serviceWorker.register(SERVICE_WORKER_PATH);
  const existingSubscription = await registration.pushManager.getSubscription();

  const subscription =
    existingSubscription ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(response.web_push.public_key),
    }));

  await saveCleanerPushSubscription(toSubscriptionPayload(subscription));
  return "subscribed";
};

export const removeCleanerPushSubscription = async () => {
  if (!supportsPushNotifications()) return;

  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;

  try {
    await deleteCleanerPushSubscription(subscription.endpoint);
  } catch {
    // Local logout should continue even when a stale token or network issue
    // prevents backend subscription cleanup.
  }

  await subscription.unsubscribe();
};
