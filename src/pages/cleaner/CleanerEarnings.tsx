import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loadCleanerEarnings } from "../../store/slices/paymentSlice";
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
  const { earnings } = useAppSelector((state) => state.payments);

  useEffect(() => {
    dispatch(loadCleanerEarnings());
  }, [dispatch]);

  return (
    <section className="cleaner-earnings">
      <div className="section-header">
        <div>
          <h2>Earnings</h2>
          <p>Earnings update after admin reconciliation.</p>
        </div>
      </div>

      <div className="earnings-grid">
        <article className="earnings-card">
          <span>Total Earned</span>
          <strong>{formatMoney(earnings?.total_earned)}</strong>
          <small>Your share after admin split.</small>
        </article>
        <article className="earnings-card due">
          <span>Due to Admin</span>
          <strong>{formatMoney(earnings?.admin_due)}</strong>
          <small>Cash/UPI you need to hand over to admin.</small>
        </article>
        <article className="earnings-card settled">
          <span>Settled</span>
          <strong>{formatMoney(earnings?.settled)}</strong>
          <small>Admin share already handed over.</small>
        </article>
      </div>

      <p className="earnings-updated">
        Last updated: {formatDate(earnings?.last_updated)}
      </p>
    </section>
  );
}
