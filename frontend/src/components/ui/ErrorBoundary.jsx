import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-folia-cream px-6 text-center text-folia-ink">
          <p className="font-display text-3xl">Something went wrong</p>
          <p className="mt-3 max-w-md text-sm text-folia-ink/60">
            {String(this.state.error?.message || this.state.error)}
          </p>
          <button
            type="button"
            className="mt-8 rounded-full bg-folia-ink px-5 py-2.5 text-sm text-folia-cream"
            onClick={() => {
              try {
                localStorage.removeItem("persist:folia-cart");
                localStorage.removeItem("persist:folia-auth");
                localStorage.removeItem("persist:folia-wishlist");
                sessionStorage.clear();
              } catch {
                /* ignore */
              }
              window.location.reload();
            }}
          >
            Clear saved data & reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
