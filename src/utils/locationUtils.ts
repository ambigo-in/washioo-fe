import type { AddressPayload } from "../types/apiTypes";

export type Coordinates = {
  accuracy?: number | null;
  latitude: number;
  longitude: number;
};

export const normalizeCoordinate = (value: number) => Number(value.toFixed(6));

export const normalizeCoordinates = ({
  accuracy,
  latitude,
  longitude,
}: Coordinates): Coordinates => ({
  accuracy: accuracy == null ? null : Math.round(accuracy),
  latitude: normalizeCoordinate(latitude),
  longitude: normalizeCoordinate(longitude),
});

const geolocationOptions: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 120000,
  timeout: 5000,
};

export type LocationError = {
  type:
    | "unavailable"
    | "permission_denied"
    | "timeout"
    | "disabled"
    | "unknown";
  message: string;
  instructions?: string;
};

const createLocationError = (
  type: LocationError["type"],
  message: string,
  instructions?: string,
): LocationError => ({
  type,
  message,
  instructions,
});

const readCurrentPosition = (): Promise<Coordinates> =>
  new Promise<Coordinates>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        createLocationError(
          "unavailable",
          "Location services are not available in this browser.",
          "Please use a modern browser that supports location services.",
        ),
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(
          normalizeCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }),
        );
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(
              createLocationError(
                "permission_denied",
                "Location access was denied.",
                "Please allow location access in your browser settings and try again. Click the location icon in the address bar or check site settings.",
              ),
            );
            break;
          case error.POSITION_UNAVAILABLE:
            reject(
              createLocationError(
                "disabled",
                "Location services appear to be disabled.",
                "Please enable location services on your device and refresh the page. On mobile: Settings > Location > Turn on. On desktop: Check your system location settings.",
              ),
            );
            break;
          case error.TIMEOUT:
            reject(
              createLocationError(
                "timeout",
                "Location request timed out.",
                "Please ensure you have a stable internet connection and try again. If the problem persists, check your location settings.",
              ),
            );
            break;
          default:
            reject(
              createLocationError(
                "unknown",
                "Unable to capture location.",
                "Please try again or check your device's location settings.",
              ),
            );
        }
      },
      geolocationOptions,
    );
  });

export const getCurrentCoordinates = async (): Promise<Coordinates> => {
  try {
    return await readCurrentPosition();
  } catch (error) {
    if (error && typeof error === "object" && "type" in error) {
      throw error as LocationError;
    }
    throw createLocationError(
      "unknown",
      "Unable to capture location. Please try again.",
      "Please check your location settings and try again.",
    );
  }
};

export const locationAccuracyMessage = (accuracy?: number | null) => {
  if (accuracy == null) {
    return "Location captured. It will be used for service directions.";
  }

  if (accuracy <= 30) {
    return `Location captured with good accuracy, around ${accuracy}m.`;
  }

  if (accuracy <= 80) {
    return `Location captured, but accuracy is around ${accuracy}m. For a better pin, stand near an open area and tap again.`;
  }

  return `Location captured, but accuracy is low, around ${accuracy}m. Move outdoors or near a window and tap Use My Live Location again.`;
};

export const reverseGeocodeCoordinates = async ({
  latitude,
  longitude,
}: Coordinates): Promise<Partial<AddressPayload>> => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
  );
  if (!response.ok) throw new Error("Reverse geocode failed");

  const data = (await response.json()) as {
    address?: Record<string, string | undefined>;
    display_name?: string;
  };
  const address = data.address ?? {};
  const street = [
    address.house_number,
    address.road || address.neighbourhood || address.suburb,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    address_line1: street || data.display_name || undefined,
    city:
      address.city ||
      address.town ||
      address.village ||
      address.county ||
      undefined,
    state: address.state || undefined,
    pincode: address.postcode || undefined,
    country: address.country || "India",
  };
};
