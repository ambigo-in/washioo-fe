import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoadingButton } from "../components/ui";
import { useAuth } from "../context/useAuth";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { resendOtp, signUpRequest } from "../store/slices/authSlice";
import type { AccountType } from "../types/authTypes";
import { formatIndianPhoneForDisplay } from "../utils/phoneUtils";
import {
  isValidAadhaarNumber,
  isValidDrivingLicenseNumber,
  normalizeAadhaarNumber,
  normalizeDrivingLicenseNumber,
} from "../utils/identityValidation";
import { useLanguage } from "../i18n/LanguageContext";
import { useOtpResendCooldown } from "../hooks/useOtpResendCooldown";
import "../styles/SignUpPage.css";

export default function SignUpPage() {
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const { loading, resendLoading } = useAppSelector((state) => state.auth);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
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
  const accountType =
    state?.accountType === "cleaner" ? state.accountType : "customer";
  const { isCoolingDown, restartCooldown, secondsRemaining } =
    useOtpResendCooldown(state?.otpSentAt);
  const dashboardPath =
    accountType === "cleaner" ? "/cleaner/dashboard" : "/dashboard";

  useEffect(() => {
    if (!phone) navigate("/verify-phone", { replace: true });
  }, [navigate, phone]);

  const handleSignUp = async (event: FormEvent) => {
    event.preventDefault();

    if (!fullName.trim()) {
      setError(t("auth.fullName"));
      return;
    }

    if (otpCode.trim().length < 4) {
      setError(t("auth.welcomeSubtitle"));
      return;
    }

    if (accountType === "cleaner" && !aadhaarNumber.trim()) {
      setError(t("auth.aadhaarRequired"));
      return;
    }

    if (
      accountType === "cleaner" &&
      !isValidAadhaarNumber(aadhaarNumber)
    ) {
      setError(t("auth.aadhaarInvalid"));
      return;
    }

    if (
      accountType === "cleaner" &&
      !isValidDrivingLicenseNumber(drivingLicenseNumber)
    ) {
      setError(t("auth.drivingLicenseInvalid"));
      return;
    }

    setError("");

    try {
      await dispatch(
        signUpRequest({
          body: {
            full_name: fullName.trim(),
            phone_number: phone,
            email: email.trim() || undefined,
            otp_code: otpCode.trim(),
            aadhaar_number:
              accountType === "cleaner"
                ? normalizeAadhaarNumber(aadhaarNumber)
                : undefined,
            driving_license_number:
              accountType === "cleaner"
                ? normalizeDrivingLicenseNumber(drivingLicenseNumber) ||
                  undefined
                : undefined,
          },
          accountType,
        }),
      ).unwrap();
      await login();
      navigate(dashboardPath, { replace: true });
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
    <main className="signup-page-wrapper">
      <form className="auth-container" onSubmit={handleSignUp}>
        <h2>
          {accountType === "cleaner"
            ? t("auth.createCleanerAccount")
            : t("auth.createAccount")}
        </h2>
        <p className="signup-subtitle">{t("auth.firstDetails")}</p>

        {error && <p className="signup-error">{error}</p>}

        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder={t("auth.fullName")}
          autoComplete="name"
        />
        <input
          value={formatIndianPhoneForDisplay(phone)}
          disabled
          aria-label={t("auth.phoneAria")}
        />
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("auth.emailOptional")}
          autoComplete="email"
          type="email"
        />
        <input
          value={otpCode}
          onChange={(event) => setOtpCode(event.target.value)}
          placeholder={t("auth.enterOtp")}
          autoComplete="one-time-code"
          inputMode="numeric"
        />
        {accountType === "cleaner" && (
          <>
            <input
              value={aadhaarNumber}
              onChange={(event) => setAadhaarNumber(event.target.value)}
              placeholder={t("auth.aadhaarNumber")}
              inputMode="numeric"
              autoComplete="off"
              maxLength={12}
            />
            <input
              value={drivingLicenseNumber}
              onChange={(event) =>
                setDrivingLicenseNumber(event.target.value.toUpperCase())
              }
              placeholder={t("auth.drivingLicenseOptional")}
              autoComplete="off"
              maxLength={16}
            />
          </>
        )}
        <LoadingButton isLoading={loading} loadingText={t("auth.signupLoading")} type="submit">
          {t("auth.createAccount")}
        </LoadingButton>

        <p className="signup-footer-text">
          {t("auth.freshCode")}{" "}
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
