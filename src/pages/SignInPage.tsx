import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoadingButton } from "../components/ui";
import { useAuth } from "../context/useAuth";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { resendOtp, signInRequest } from "../store/slices/authSlice";
import type { AccountType } from "../types/authTypes";
import { formatIndianPhoneForDisplay } from "../utils/phoneUtils";
import { useLanguage } from "../i18n/LanguageContext";
import { useOtpResendCooldown } from "../hooks/useOtpResendCooldown";
import "../styles/SignInPage.css";

export default function SignInPage() {
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const { loading, resendLoading } = useAppSelector((state) => state.auth);
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const state = location.state as {
    phone?: string;
    accountType?: AccountType;
    otpSentAt?: number;
  } | null;
  const phone = state?.phone || "";
  const accountType = state?.accountType || "customer";
  const { isCoolingDown, restartCooldown, secondsRemaining } =
    useOtpResendCooldown(state?.otpSentAt);

  const dashboardPath =
    accountType === "admin"
      ? "/admin/dashboard"
      : accountType === "cleaner"
        ? "/cleaner/dashboard"
        : "/dashboard";

  useEffect(() => {
    if (!phone) navigate("/verify-phone", { replace: true });
  }, [navigate, phone]);

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();

    if (otpCode.trim().length < 4) {
      setError(t("auth.welcomeSubtitle"));
      return;
    }

    setError("");

    try {
      const authResponse = await dispatch(
        signInRequest({
          body: {
            phone_number: phone,
            otp_code: otpCode.trim(),
          },
          accountType,
        }),
      ).unwrap();
      const user = await login();
      const termsAccepted =
        user?.terms_accepted ??
        authResponse.terms_accepted ??
        authResponse.user?.terms_accepted ??
        false;

      navigate(termsAccepted ? dashboardPath : "/accept-terms", {
        replace: true,
      });
    } catch (err) {
      setError(String(err));
    }
  };

  const handleResend = async () => {
    if (isCoolingDown) return;

    setError("");

    try {
      await dispatch(resendOtp({ phoneNumber: phone, accountType })).unwrap();
      restartCooldown();
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <main className="signin-page-wrapper">
      <form className="auth-container" onSubmit={handleSignIn}>
        <h2>{t("auth.welcomeBack")}</h2>
        <p className="signin-subtitle">{t("auth.welcomeSubtitle")}</p>

        {error && <p className="signin-error">{error}</p>}

        <input
          value={formatIndianPhoneForDisplay(phone)}
          disabled
          aria-label={t("auth.phoneAria")}
        />
        <input
          value={otpCode}
          onChange={(event) => setOtpCode(event.target.value)}
          placeholder={t("auth.enterOtp")}
          autoComplete="one-time-code"
          inputMode="numeric"
        />
        <LoadingButton isLoading={loading} loadingText={t("auth.signingIn")} type="submit">
          {t("auth.login")}
        </LoadingButton>

        {isCoolingDown && (
          <p className="auth-resend-timer">
            {t("auth.resendIn", { seconds: secondsRemaining })}
          </p>
        )}

        <p className="signin-footer-text">
          {t("auth.didNotReceive")}{" "}
          <LoadingButton
            className="link-button"
            disabled={isCoolingDown}
            isLoading={resendLoading}
            loadingText={t("auth.resendingOtp")}
            onClick={handleResend}
            type="button"
          >
            {isCoolingDown
              ? t("auth.resendIn", { seconds: secondsRemaining })
              : t("auth.resendOtp")}
          </LoadingButton>
        </p>
      </form>
    </main>
  );
}
