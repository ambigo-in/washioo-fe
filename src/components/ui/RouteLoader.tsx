type RouteLoaderProps = {
  message?: string;
};

export default function RouteLoader({
  message = "Loading your account...",
}: RouteLoaderProps) {
  return (
    <div className="route-state" role="status" aria-live="polite">
      <div className="route-loader">
        <div className="route-loader-ring" aria-hidden="true" />
        <p>{message}</p>
      </div>
    </div>
  );
}
