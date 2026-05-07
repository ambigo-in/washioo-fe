import "./OpenInMapsButton.css";

type OpenInMapsButtonProps = {
  latitude?: number | null;
  longitude?: number | null;
  label?: string;
  mode?: "pin" | "directions";
};

export default function OpenInMapsButton({
  latitude,
  longitude,
  label,
  mode = "pin",
}: OpenInMapsButtonProps) {
  const hasLocation = latitude != null && longitude != null;
  const buttonLabel =
    label || (mode === "directions" ? "Start route" : "View location in Maps");

  if (!hasLocation) {
    return (
      <button
        className="maps-button disabled"
        disabled
        title="Location unavailable - customer hasn't shared live location"
        type="button"
      >
        {buttonLabel}
      </button>
    );
  }

  const coordinates = `${latitude},${longitude}`;
  const href =
    mode === "directions"
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coordinates)}&travelmode=driving&dir_action=navigate`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinates)}`;

  return (
    <a
      className="maps-button"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {buttonLabel}
    </a>
  );
}
