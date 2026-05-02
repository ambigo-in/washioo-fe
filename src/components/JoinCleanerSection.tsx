import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "../styles/JoinCleanerSection.css";

export default function JoinCleanerSection() {
  const navigate = useNavigate();
  const { isAuthenticated, hasRole } = useAuth();

  const handleJoin = () => {
    if (isAuthenticated && hasRole("cleaner")) {
      navigate("/cleaner/dashboard");
      return;
    }

    navigate("/verify-phone", {
      state: { accountType: "cleaner", authMode: "signup" },
    });
  };

  return (
    <section className="join-cleaner-section">
      <div className="join-cleaner-media" aria-hidden="true" />
      <div className="join-cleaner-content">
        <span className="join-cleaner-label">For cleaners</span>
        <h2>Join Washioo as a cleaner</h2>
        <p>
          Get nearby wash jobs, manage your schedule, and track your earnings
          from one simple dashboard.
        </p>

        <div className="join-cleaner-points">
          <span>Flexible work</span>
          <span>Local assignments</span>
          <span>Clear earnings</span>
        </div>

        <button type="button" onClick={handleJoin}>
          Join as Cleaner
        </button>
      </div>
    </section>
  );
}
