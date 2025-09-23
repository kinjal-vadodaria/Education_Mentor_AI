interface ErrorContext {
  context?: string;
  userId?: string;
  [key: string]: any;
}

class ErrorReportingService {
  reportError(error: unknown, context?: ErrorContext): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error Report:', errorMessage);
    if (errorStack) {
      console.error('Stack:', errorStack);
    }
    if (context) {
      console.error('Context:', context);
    }

    // In production, you would send this to a service like Sentry
    // For now, we'll just log to console
  }

  reportUserAction(action: string, data?: Record<string, any>): void {
    console.log('User Action:', action, data);
    // In production, you would send this to analytics
  }
}

export const errorReporting = new ErrorReportingService();