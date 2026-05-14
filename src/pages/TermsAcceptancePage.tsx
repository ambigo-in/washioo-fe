import { useEffect, useRef, useState, type UIEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LoadingButton } from "../components/ui";
import { useAuth } from "../context/useAuth";
import type { UserRole } from "../types/apiTypes";
import { termsSections } from "./TermsAndConditionsPage";
import "./TermsAcceptancePage.css";

type TermsLocationState = {
  from?: {
    pathname?: string;
    search?: string;
  };
} | null;

const getDashboardPath = (role?: UserRole | null) => {
  if (role === "admin") return "/admin/dashboard";
  if (role === "cleaner") return "/cleaner/dashboard";
  return "/dashboard";
};

export default function TermsAcceptancePage() {
  const {
    acceptTerms,
    activeRole,
    isAuthenticated,
    isLoading,
    termsAccepted,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as TermsLocationState;
  const termsBoxRef = useRef<HTMLDivElement | null>(null);
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const dashboardPath = getDashboardPath(activeRole);
  const returnPath = state?.from?.pathname
    ? `${state.from.pathname}${state.from.search ?? ""}`
    : dashboardPath;

  useEffect(() => {
    const termsBox = termsBoxRef.current;
    if (!termsBox) return;

    if (termsBox.scrollHeight <= termsBox.clientHeight + 4) {
      setHasReadTerms(true);
    }
  }, []);

  if (isLoading) {
    return <div className="route-state">Checking your session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/verify-phone" replace />;
  }

  if (termsAccepted) {
    return <Navigate to={dashboardPath} replace />;
  }

  const handleTermsScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const remaining =
      target.scrollHeight - target.scrollTop - target.clientHeight;
    if (remaining <= 12) {
      setHasReadTerms(true);
    }
  };

  const handleAccept = async () => {
    if (!agreed || !hasReadTerms) return;

    setError("");
    setIsSubmitting(true);
    try {
      await acceptTerms();
      navigate(returnPath, { replace: true });
    } catch (err) {
      setError(String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="terms-acceptance-page">
      <section className="terms-acceptance-panel" aria-labelledby="terms-title">
        <div className="terms-acceptance-header">
          <p>Washioo Legal</p>
          <h1 id="terms-title">Terms & Conditions</h1>
          <span>Required before continuing</span>
        </div>

        {error && <p className="terms-acceptance-error">{error}</p>}

        <div
          ref={termsBoxRef}
          className="terms-acceptance-scrollbox"
          onScroll={handleTermsScroll}
          tabIndex={0}
        >
          {termsSections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <ol>
                {section.clauses.map((clause) => (
                  <li key={clause}>{clause}</li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <div className="terms-acceptance-links">
          <a href="/terms-and-conditions" target="_blank" rel="noreferrer">
            Full Terms of Service
          </a>
          <a href="/privacy-policy" target="_blank" rel="noreferrer">
            Privacy Policy
          </a>
        </div>

        <label className="terms-acceptance-checkbox">
          <input
            type="checkbox"
            checked={agreed}
            disabled={!hasReadTerms || isSubmitting}
            onChange={(event) => setAgreed(event.target.checked)}
          />
          <span>
            I have read and agree to the Terms & Conditions and Privacy Policy
          </span>
        </label>

        {!hasReadTerms && (
          <p className="terms-acceptance-hint">
            Scroll to the bottom of the terms to enable consent.
          </p>
        )}

        <LoadingButton
          disabled={!agreed || !hasReadTerms}
          isLoading={isSubmitting}
          loadingText="Saving acceptance"
          onClick={handleAccept}
          type="button"
        >
          Accept & Continue
        </LoadingButton>
      </section>
    </main>
  );
}
