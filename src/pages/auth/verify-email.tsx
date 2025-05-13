import {useNavigate, useSearchParams} from 'react-router-dom';
import {useVerifyEmailQuery} from '@/redux/features/auth/authApi';
import {Button} from '@/components/ui/button';
import {Loader2} from 'lucide-react';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  // Pass token directly to the query hook
  const { error, isLoading } = useVerifyEmailQuery(token ?? '', {
    skip: !token, // Skip the query if there's no token
  });

  const status = isLoading ? 'loading' : error ? 'error' : 'success';
  const errorMessage: string = error
    ? typeof error === 'object' &&
      error !== null &&
      'data' in error &&
      error.data &&
      typeof error.data === 'object' &&
      'message' in error.data
      ? String(error.data.message)
      : 'Verification failed'
    : 'An unexpected error occurred';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-lg shadow-lg text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-lg">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-green-600">
              Email Verified Successfully!
            </h1>
            <p className="text-muted-foreground">
              Your email has been verified. You can now log in to your account.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-destructive">
              Email Verification Failed
            </h1>
            <p className="text-muted-foreground">{errorMessage}</p>
            <div className="space-y-2">
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full"
              >
                Go to Login
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
