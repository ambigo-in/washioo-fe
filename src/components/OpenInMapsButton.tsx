import "./OpenInMapsButton.css";

type OpenInMapsButtonProps = {
  latitude?: number | null;
  longitude?: number | null;
};

export default function OpenInMapsButton({
  latitude,
  longitude,
}: OpenInMapsButtonProps) {
  const hasLocation = latitude != null && longitude != null;

  if (!hasLocation) {
    return (
      <button
        className="maps-button disabled"
        disabled
        title="Location unavailable — customer hasn't shared live location"
        type="button"
      >
        Open in Google Maps
      </button>
    );
  }

  return (
    <a
      className="maps-button"
      href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
      rel="noopener noreferrer"
      target="_blank"
    >
      Open in Google Maps
    </a>
  );
}
