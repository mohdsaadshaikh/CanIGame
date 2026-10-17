import { Alert, Button, Container, Stack, Text } from '@mantine/core'
import { IconAlertTriangle } from '@tabler/icons-react'
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Last line of defence: a render error anywhere below this shows a recoverable
 * message instead of a blank window. (React still requires a class for this.)
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled render error:', error, info.componentStack)
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children

    return (
      <Container size="sm" py="xl">
        <Alert icon={<IconAlertTriangle size={24} />} title="Something went wrong" color="red">
          <Stack gap="sm">
            <Text size="sm">{this.state.error.message}</Text>
            <Button
              variant="light"
              color="red"
              onClick={() => window.location.reload()}
              w="fit-content"
            >
              Reload app
            </Button>
          </Stack>
        </Alert>
      </Container>
    )
  }
}
