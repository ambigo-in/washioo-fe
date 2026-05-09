import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LoadingButton } from "../components/ui";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { sendOtpRequest } from "../store/slices/authSlice";
import type { AccountType } from "../types/authTypes";
import { isValidIndianPhone, normalizeIndianPhone } from "../utils/phoneUtils";
import { useLanguage, type LanguageCode } from "../i18n/LanguageContext";
import "../styles/PhoneVerificationPage.css";

export default function PhoneVerificationPage() {
  const dispatch = useAppDispatch();
  const { language, setLanguage, t } = useLanguage();
  const { loading } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const state = location.state as {
    accountType?: AccountType;
    authMode?: "signin" | "signup";
  } | null;
  const initialAccountType =
    state?.accountType === "cleaner" || state?.accountType === "admin"
      ? state.accountType
      : "customer";

  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] =
    useState<AccountType>(initialAccountType);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const phoneNumber = normalizeIndianPhone(phone);

    if (!isValidIndianPhone(phoneNumber)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setError("");

    try {
      const response = await dispatch(
        sendOtpRequest({ phoneNumber, accountType }),
      ).unwrap();

      const requestedAccountType = accountType;
      const hasRoleForRequestedType =
        response.roles?.includes(requestedAccountType);
      const hasExistingAccount =
        requestedAccountType === "admin"
          ? true
          : (hasRoleForRequestedType ?? response.user_exist);
      const nextPath =
        requestedAccountType === "admin" || hasExistingAccount
          ? "/signin"
          : "/signup";

      navigate(nextPath, {
        state: {
          phone: phoneNumber,
          accountType: requestedAccountType,
          otpSentAt: Date.now(),
        },
      });
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <main className="signin-page-wrapper">
      <form className="auth-container" onSubmit={handleSubmit}>
        <label className="auth-language-select">
          <span>{t("language.label")}</span>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as LanguageCode)}
          >
            <option value="en">{t("language.english")}</option>
            <option value="te">{t("language.telugu")}</option>
            <option value="hi">{t("language.hindi")}</option>
          </select>
        </label>
        <h2>{t("auth.verifyPhone")}</h2>
        <p className="signin-subtitle">{t("auth.verifySubtitle")}</p>

        {error && <p className="signin-error">{error}</p>}

        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder={t("auth.phonePlaceholder")}
          autoComplete="tel"
          inputMode="tel"
          maxLength={14}
        />
        <select
          value={accountType}
          onChange={(event) => {
            const nextType = event.target.value as AccountType;
            setAccountType(nextType);
          }}
        >
          <option value="customer">{t("common.customer")}</option>
          <option value="cleaner">{t("common.cleaner")}</option>
        </select>
        <LoadingButton
          isLoading={loading}
          loadingText={t("auth.sendingOtp")}
          type="submit"
        >
          {t("auth.continue")}
        </LoadingButton>
      </form>
    </main>
  );
}
