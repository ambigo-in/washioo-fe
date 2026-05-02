import type { AddressPayload } from "../types/apiTypes";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export const normalizeCoordinate = (value: number) => Number(value.toFixed(6));

export const normalizeCoordinates = ({
  latitude,
  longitude,
}: Coordinates): Coordinates => ({
  latitude: normalizeCoordinate(latitude),
  longitude: normalizeCoordinate(longitude),
});

export const getCurrentCoordinates = () =>
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
      { enableHighAccuracy: true, timeout: 12000 },
    );
  });

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
