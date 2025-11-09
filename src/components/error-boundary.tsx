'use client';

import { Component, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container mx-auto px-4 py-8">
          <Card className="mx-auto max-w-md">
            <CardHeader>
              <div className="mb-4 flex justify-center">
                <div className="bg-destructive/10 rounded-full p-3">
                  <AlertTriangle className="text-destructive h-6 w-6" />
                </div>
              </div>
              <CardTitle className="text-center">Algo deu errado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center text-sm">
                Ocorreu um erro inesperado. Por favor, tente novamente.
              </p>
              {this.state.error && process.env.NODE_ENV === 'development' && (
                <div className="bg-muted rounded-md p-3">
                  <p className="text-destructive font-mono text-xs">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.location.reload()}
                >
                  Recarregar Página
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.href = '/';
                  }}
                >
                  Ir para Início
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
