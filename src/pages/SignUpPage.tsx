import { useEffect, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoadingButton } from "../components/ui";
import { useAuth } from "../context/useAuth";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { resendOtp, signUpRequest } from "../store/slices/authSlice";
import {
  uploadCleanerAadhaar,
  uploadCleanerDrivingLicense,
  uploadCleanerProfilePhoto,
} from "../api/cleanerApi";
import { getAppConfig } from "../api/authApi";
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
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [aadhaarImage, setAadhaarImage] = useState<File | null>(null);
  const [drivingLicenseImage, setDrivingLicenseImage] = useState<File | null>(
    null,
  );
  const [drivingLicenseRequired, setDrivingLicenseRequired] = useState(
    String(import.meta.env.VITE_DRIVING_LICENSE_REQUIRED || "false").toLowerCase() === "true",
  );
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const { acceptTerms, login } = useAuth();

  const state = location.state as {
    phone?: string;
    accountType?: AccountType;
    otpSentAt?: number;
    termsAcceptedAtOtp?: boolean;
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

  useEffect(() => {
    getAppConfig()
      .then((config) =>
        setDrivingLicenseRequired(config.cleaner.driving_license_required),
      )
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!("OTPCredential" in window) || !navigator.credentials) return;

    const controller = new AbortController();
    navigator.credentials
      .get({
        otp: { transport: ["sms"] },
        signal: controller.signal,
      } as CredentialRequestOptions)
      .then((credential) => {
        const code = (credential as { code?: string } | null)?.code;
        if (code) setOtpCode(code);
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

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

    if (accountType === "cleaner" && !profilePhoto) {
      setError(t("auth.profilePhotoRequired"));
      return;
    }

    if (accountType === "cleaner" && !aadhaarImage) {
      setError(t("auth.aadhaarImageRequired"));
      return;
    }

    if (
      accountType === "cleaner" &&
      !isValidAadhaarNumber(aadhaarNumber)
    ) {
      setError(t("auth.aadhaarInvalid"));
      return;
    }

    const normalizedDrivingLicense =
      normalizeDrivingLicenseNumber(drivingLicenseNumber);

    if (
      accountType === "cleaner" &&
      drivingLicenseRequired &&
      !normalizedDrivingLicense
    ) {
      setError(t("auth.drivingLicenseRequired"));
      return;
    }

    if (accountType === "cleaner" && !isValidDrivingLicenseNumber(drivingLicenseNumber)) {
      setError(t("auth.drivingLicenseInvalid"));
      return;
    }

    if (
      accountType === "cleaner" &&
      (drivingLicenseRequired || normalizedDrivingLicense) &&
      !drivingLicenseImage
    ) {
      setError(t("auth.drivingLicenseImageRequired"));
      return;
    }

    setError("");

    try {
      const authResponse = await dispatch(
        signUpRequest({
          body: {
            full_name: fullName.trim(),
            phone_number: phone,
            email: email.trim() || undefined,
            otp_code: otpCode.trim(),
            terms_accepted: Boolean(state?.termsAcceptedAtOtp),
            aadhaar_number:
              accountType === "cleaner"
                ? normalizeAadhaarNumber(aadhaarNumber)
                : undefined,
            driving_license_number:
              accountType === "cleaner"
                ? normalizedDrivingLicense || undefined
                : undefined,
          },
          accountType,
        }),
      ).unwrap();
      if (accountType === "cleaner" && profilePhoto && aadhaarImage) {
        await uploadCleanerProfilePhoto(profilePhoto);
        await uploadCleanerAadhaar(
          aadhaarImage,
          normalizeAadhaarNumber(aadhaarNumber),
        );
        if (drivingLicenseImage && normalizedDrivingLicense) {
          await uploadCleanerDrivingLicense(
            drivingLicenseImage,
            normalizedDrivingLicense,
          );
        }
      }
      let termsAccepted =
        authResponse.terms_accepted ??
        authResponse.user?.terms_accepted ??
        false;
      if (state?.termsAcceptedAtOtp && !termsAccepted) {
        const acceptedUser = await acceptTerms();
        termsAccepted = acceptedUser.terms_accepted;
      }
      await login().catch(() => undefined);

      navigate(state?.termsAcceptedAtOtp || termsAccepted ? dashboardPath : "/accept-terms", {
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
          name="otp"
          inputMode="numeric"
          pattern="[0-9]*"
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
            <label className="file-field">
              <span>{t("profile.profilePhoto")}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  setProfilePhoto(event.target.files?.[0] || null)
                }
              />
            </label>
            <label className="file-field">
              <span>{t("profile.aadhaarFrontImage")}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  setAadhaarImage(event.target.files?.[0] || null)
                }
              />
            </label>
            <input
              value={drivingLicenseNumber}
              onChange={(event) =>
                setDrivingLicenseNumber(event.target.value.toUpperCase())
              }
              placeholder={
                drivingLicenseRequired
                  ? t("auth.drivingLicenseRequired")
                  : t("auth.drivingLicenseOptional")
              }
              autoComplete="off"
              maxLength={16}
            />
            <label className="file-field">
              <span>
                {drivingLicenseRequired
                  ? t("auth.drivingLicenseImageRequired")
                  : t("profile.drivingLicenseImage")}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  setDrivingLicenseImage(event.target.files?.[0] || null)
                }
              />
            </label>
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
