import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-800 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">
            Something went wrong
          </p>
          <p className="text-xs text-red-600 dark:text-red-500 mb-4">
            {this.state.message}
          </p>
          <button
            onClick={this.handleReset}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors font-medium cursor-pointer border border-red-200 dark:border-red-800"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
