import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Mail, Lock, LogIn, ArrowRight, Disc3 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn, user, isConfigured } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/game';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please provide a valid email format.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setErrors({ general: error.message || 'Authentication failed. Please verify credentials.' });
        addToast(error.message || 'Failed to sign in', 'error');
      } else {
        addToast('Welcome back to the dance floor!', 'success');
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/game';
        navigate(from, { replace: true });
      }
    } catch {
      setErrors({ general: 'Unexpected system anomaly. Please retry.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-disco-mustard border-2 border-disco-border items-center justify-center shadow-retro mb-4">
            <Disc3 className="w-9 h-9 text-disco-border animate-disco-spin" />
          </div>
          <h1 className="text-3xl font-bold font-display text-disco-cream">
            Welcome Back!
          </h1>
          <p className="text-sm text-disco-cream-muted mt-1">
            Sign in to check your dance records and stats
          </p>
        </div>

        {!isConfigured && (
          <div className="mb-6 p-4 rounded-2xl border-2 border-disco-border bg-disco-orange text-white text-xs leading-relaxed shadow-retro-xs">
            <strong>Notice:</strong> Supabase credentials are missing from <code className="bg-disco-border/40 px-1.5 py-0.5 rounded text-white">.env</code>.
          </div>
        )}

        <Card variant="pink">
          <form onSubmit={handleSubmit} noValidate>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Enter your email and password to continue
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {errors.general && (
                <ErrorMessage
                  title="Sign In Error"
                  message={errors.general}
                  className="mb-2"
                />
              )}

              <Input
                label="Email Address"
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="dancer@disco.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                error={errors.email}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                error={errors.password}
                leftIcon={<Lock className="w-4 h-4" />}
              />
            </CardContent>

            <CardFooter className="flex-col gap-4">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full justify-center"
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                Let&apos;s Dance
              </Button>

              <div className="text-xs text-center text-disco-cream-muted mt-2">
                Don&apos;t have an account yet?{' '}
                <Link
                  to="/signup"
                  className="text-disco-mustard hover:underline font-bold inline-flex items-center gap-1"
                >
                  Create Account <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};
