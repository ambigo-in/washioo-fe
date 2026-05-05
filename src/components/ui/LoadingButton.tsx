import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./LoadingButton.css";

interface LoadingButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> {
  isLoading: boolean;
  disabled?: boolean;
  loadingText?: string;
  children: ReactNode;
}

export default function LoadingButton({
  isLoading,
  disabled,
  loadingText,
  children,
  className = "",
  type = "button",
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      className={`${className} ${isLoading ? "btn-loading" : ""}`.trim()}
      disabled={isLoading || !!disabled}
      type={type}
    >
      {isLoading ? (
        <>
          <span className="spinner" aria-hidden="true" />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
