import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("Route render failed", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="route-error-boundary" role="alert">
          <h1>Something went wrong</h1>
          <p>Please refresh the page or try again in a moment.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Refresh page
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
