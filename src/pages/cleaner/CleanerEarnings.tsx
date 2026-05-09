import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loadCleanerEarnings } from "../../store/slices/paymentSlice";
import { useLanguage } from "../../i18n/LanguageContext";
import "./CleanerEarnings.css";

const formatMoney = (value?: number | null) =>
  `Rs. ${(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "Not updated yet";

export default function CleanerEarnings() {
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  const { earnings } = useAppSelector((state) => state.payments);

  useEffect(() => {
    dispatch(loadCleanerEarnings());
  }, [dispatch]);

  return (
    <section className="cleaner-earnings">
      <div className="section-header">
        <div>
          <h2>{t("earnings.earnings")}</h2>
          <p>{t("earnings.subtitle")}</p>
        </div>
      </div>

      <div className="earnings-grid">
        <article className="earnings-card">
          <span>{t("earnings.totalEarned")}</span>
          <strong>{formatMoney(earnings?.total_earned)}</strong>
          <small>{t("earnings.totalEarnedHint")}</small>
        </article>
        <article className="earnings-card due">
          <span>{t("earnings.adminDue")}</span>
          <strong>{formatMoney(earnings?.admin_due)}</strong>
          <small>{t("earnings.adminDueHint")}</small>
        </article>
        <article className="earnings-card settled">
          <span>{t("earnings.settled")}</span>
          <strong>{formatMoney(earnings?.settled)}</strong>
          <small>{t("earnings.settledHint")}</small>
        </article>
      </div>

      <p className="earnings-updated">
        {t("earnings.updated")}: {formatDate(earnings?.last_updated)}
      </p>
    </section>
  );
}
