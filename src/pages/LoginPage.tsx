import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Mail, Lock, LogIn, ArrowRight, Disc3 } from 'lucide-react';
import { loginSchema } from '../lib/validation';
import { safeRedirectPath } from '../lib/safeRedirect';

type LoginErrors = { email?: string; password?: string; general?: string };

export const LoginPage: React.FC = () => {
  const { signIn, user, isConfigured } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const destination = safeRedirectPath(
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
  );

  // Redirect if already authenticated
  useEffect(() => {
    if (user) navigate(destination, { replace: true });
  }, [user, navigate, destination]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errs: LoginErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if ((key === 'email' || key === 'password') && !errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { error } = await signIn(parsed.data.email, parsed.data.password);
      if (error) {
        // Generic wording: do not reveal whether the email exists
        setErrors({ general: 'Sign in failed. Check your email and password, and confirm your email if you just signed up.' });
        addToast('Failed to sign in', 'error');
      } else {
        addToast('Welcome back to the dance floor!', 'success');
        navigate(destination, { replace: true });
      }
    } catch {
      setErrors({ general: 'Something went wrong. Please try again.' });
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
          <h1 className="text-3xl font-bold font-display text-disco-cream">Welcome Back!</h1>
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
              <CardDescription>Enter your email and password to continue</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {errors.general && (
                <ErrorMessage title="Sign In Error" message={errors.general} className="mb-2" />
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