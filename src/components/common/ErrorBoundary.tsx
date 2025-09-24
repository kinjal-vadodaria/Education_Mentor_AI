import { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Paper, Title, Text, Button, Stack, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // In production, you would send this to your error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { errorInfo } });
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container size="sm" py="xl">
          <Paper shadow="md" p="xl" radius="md" withBorder>
            <Stack align="center" gap="lg">
              <ThemeIcon size={80} color="red" variant="light">
                <IconAlertTriangle size={40} />
              </ThemeIcon>
              
              <div style={{ textAlign: 'center' }}>
                <Title order={2} mb="sm">
                  Oops! Something went wrong
                </Title>
                <Text c="dimmed" size="lg" mb="lg">
                  We&apos;re sorry, but something unexpected happened. Please try refreshing the page.
                </Text>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <Paper p="md" bg="red.0" style={{ textAlign: 'left', marginBottom: '1rem' }}>
                    <Text size="sm" ff="monospace" c="red.8">
                      {this.state.error.message}
                    </Text>
                    <Text size="xs" ff="monospace" c="red.6" mt="xs">
                      {this.state.error.stack}
                    </Text>
                  </Paper>
                )}
              </div>

              <Stack gap="sm">
                <Button
                  leftSection={<IconRefresh size={16} />}
                  onClick={this.handleReload}
                  size="lg"
                >
                  Refresh Page
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleReset}
                  size="lg"
                >
                  Try Again
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}