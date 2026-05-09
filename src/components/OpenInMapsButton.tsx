import "./OpenInMapsButton.css";

type OpenInMapsButtonProps = {
  latitude?: number | null;
  longitude?: number | null;
  address?: {
    latitude?: number | null;
    longitude?: number | null;
  };
  label?: string;
  mode?: "pin" | "directions";
  className?: string;
};

export default function OpenInMapsButton({
  latitude,
  longitude,
  address,
  label,
  mode = "pin",
  className,
}: OpenInMapsButtonProps) {
  const resolvedLatitude = latitude ?? address?.latitude;
  const resolvedLongitude = longitude ?? address?.longitude;
  const hasLocation = resolvedLatitude != null && resolvedLongitude != null;
  const buttonLabel =
    label || (mode === "directions" ? "Start route" : "View location in Maps");

  if (!hasLocation) {
    return (
      <button
        className={`maps-button disabled ${className ?? ""}`.trim()}
        disabled
        title="Location unavailable - customer hasn't shared live location"
        type="button"
      >
        {buttonLabel}
      </button>
    );
  }

  const coordinates = `${resolvedLatitude},${resolvedLongitude}`;
  const href =
    mode === "directions"
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coordinates)}&travelmode=driving&dir_action=navigate`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinates)}`;

  return (
    <a
      className={`maps-button ${className ?? ""}`.trim()}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {buttonLabel}
    </a>
  );
}
