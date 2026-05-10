import { useEffect, useState } from "react";

export const OTP_RESEND_COOLDOWN_SECONDS = 60;

const getRemainingSeconds = (expiresAt: number) =>
  Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));

export function useOtpResendCooldown(initialSentAt?: number) {
  const [cooldownExpiresAt, setCooldownExpiresAt] = useState(
    () => (initialSentAt || Date.now()) + OTP_RESEND_COOLDOWN_SECONDS * 1000,
  );
  const [secondsRemaining, setSecondsRemaining] = useState(() =>
    getRemainingSeconds(cooldownExpiresAt),
  );

  useEffect(() => {
    const updateRemaining = () => {
      setSecondsRemaining(getRemainingSeconds(cooldownExpiresAt));
    };

    updateRemaining();

    if (cooldownExpiresAt <= Date.now()) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const nextSecondsRemaining = getRemainingSeconds(cooldownExpiresAt);
      setSecondsRemaining(nextSecondsRemaining);

      if (nextSecondsRemaining <= 0) {
        window.clearInterval(intervalId);
      }
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [cooldownExpiresAt]);

  return {
    isCoolingDown: secondsRemaining > 0,
    restartCooldown: () =>
      setCooldownExpiresAt(Date.now() + OTP_RESEND_COOLDOWN_SECONDS * 1000),
    secondsRemaining,
  };
}
