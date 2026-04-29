import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    // State to track if an error occurred
    this.state = { hasError: false };
  }

  // Update state so the next render shows the fallback UI
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  // You can log the error to an analytics service here
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when a crash happens
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
          <div className="bg-white p-8 rounded-xl shadow-md max-w-lg">
            <h1 className="text-4xl font-bold text-red-500 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              Our system encountered an unexpected error. Don't worry, your data is safe.
            </p>
            
            {/* Button to refresh the page */}
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#11889c] text-white px-6 py-2 rounded-lg hover:bg-[#0e6d7d] transition-all"
            >
              Try Refreshing
            </button>
          </div>
        </div>
      );
    }

    // If no error, render the children components normally
    return this.props.children; 
  }
}

export default ErrorBoundary;