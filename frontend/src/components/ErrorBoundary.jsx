/**
 * FASE 5: Error Boundary Component
 * Captura errores de React y muestra una UI de fallback amigable
 */
import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-stone-100 p-4">
          <Card className="max-w-md w-full border-rose-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-rose-600" />
              </div>
              
              <h2 className="text-xl font-semibold text-stone-800 mb-2">
                ¡Ups! Algo salió mal
              </h2>
              
              <p className="text-stone-600 mb-6">
                Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-3 bg-stone-100 rounded-lg text-left overflow-auto max-h-32">
                  <code className="text-xs text-rose-600">
                    {this.state.error.toString()}
                  </code>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex-1 rounded-xl"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir al Inicio
                </Button>
                <Button
                  onClick={this.handleReload}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recargar
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

export default ErrorBoundary;
export { ErrorBoundary };
