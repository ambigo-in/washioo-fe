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
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 20000,
};

const readCurrentPosition = () =>
  new Promise<Coordinates>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location is not available in this browser."));
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
        if (error.code === error.PERMISSION_DENIED) {
          reject(
            new Error(
              "Location access denied. Please enable location permission to save address.",
            ),
          );
          return;
        }
        reject(new Error("Unable to capture location. Please try again."));
      },
      geolocationOptions,
    );
  });

export const getCurrentCoordinates = async () => {
  const readings: Coordinates[] = [];
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const reading = await readCurrentPosition();
      readings.push(reading);

      if ((reading.accuracy ?? Number.POSITIVE_INFINITY) <= 30) {
        return reading;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (readings.length === 0) {
    throw lastError instanceof Error
      ? lastError
      : new Error("Unable to capture location. Please try again.");
  }

  return readings.sort(
    (a, b) =>
      (a.accuracy ?? Number.POSITIVE_INFINITY) -
      (b.accuracy ?? Number.POSITIVE_INFINITY),
  )[0];
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
