interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  additionalData?: Record<string, unknown>;
}

class ErrorReportingService {
  private isProduction = import.meta.env.MODE === 'production';
  private apiEndpoint = import.meta.env.VITE_ERROR_REPORTING_ENDPOINT;

  async reportError(error: Error, additionalData?: Record<string, unknown>) {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      additionalData,
    };

    // Log to console in development
    if (!this.isProduction) {
      console.error('Error Report:', errorReport);
      return;
    }

    // Send to error reporting service in production
    if (this.apiEndpoint) {
      try {
        await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorReport),
        });
      } catch (reportingError) {
        console.error('Failed to report error:', reportingError);
      }
    }
  }

  reportUserAction(action: string, data?: Record<string, unknown>) {
    if (!this.isProduction) {
      console.log('User Action:', { action, data });
      return;
    }

    // In production, you might want to send this to analytics
    // Example: analytics.track(action, data);
  }
}

export const errorReporting = new ErrorReportingService();