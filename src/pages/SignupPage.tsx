import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Mail, Lock, User, UserPlus, ArrowRight, Disc3 } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signUp, user, isConfigured } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/game', { replace: true });
    }
  }, [user, navigate]);

  const validate = () => {
    const errs: typeof errors = {};

    // Display Name: 3-20 characters constraint
    if (!displayName.trim()) {
      errs.displayName = 'Display name is required.';
    } else if (displayName.trim().length < 3) {
      errs.displayName = 'Display name must be at least 3 characters.';
    } else if (displayName.trim().length > 20) {
      errs.displayName = 'Display name cannot exceed 20 characters.';
    } else if (!/^[a-zA-Z0-9_ ]+$/.test(displayName.trim())) {
      errs.displayName = 'Only letters, numbers, spaces, and underscores allowed.';
    }

    // Email
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please provide a valid email format.';
    }

    // Password
    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    // Confirm password
    if (!confirmPassword) {
      errs.confirmPassword = 'Confirmation password is required.';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
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
      const { error } = await signUp(email, password, displayName.trim());
      if (error) {
        setErrors({ general: error.message || 'Registration failed.' });
        addToast(error.message || 'Registration failed', 'error');
      } else {
        addToast('Welcome to the dance floor! Your profile is ready.', 'success');
        navigate('/game');
      }
    } catch {
      setErrors({ general: 'Unexpected registration anomaly. Please retry.' });
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
            Join The Dance Floor
          </h1>
          <p className="text-sm text-disco-cream-muted mt-1">
            Pick your dancer name and start your high-score streak
          </p>
        </div>

        {!isConfigured && (
          <div className="mb-6 p-4 rounded-2xl border-2 border-disco-border bg-disco-orange text-white text-xs leading-relaxed shadow-retro-xs">
            <strong>Notice:</strong> Supabase credentials are missing from <code className="bg-disco-border/40 px-1.5 py-0.5 rounded text-white">.env</code>.
          </div>
        )}

        <Card variant="mustard">
          <form onSubmit={handleSubmit} noValidate>
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
              <CardDescription>
                Sign up to record scores and climb the rankings
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {errors.general && (
                <ErrorMessage
                  title="Registration Failed"
                  message={errors.general}
                  className="mb-2"
                />
              )}

              <Input
                label="Dancer Name"
                type="text"
                name="displayName"
                required
                placeholder="DiscoKing_77"
                helperText="Between 3 and 20 characters"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (errors.displayName) setErrors((prev) => ({ ...prev, displayName: undefined }));
                }}
                error={errors.displayName}
                leftIcon={<User className="w-4 h-4" />}
              />

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
                autoComplete="new-password"
                required
                placeholder="••••••••"
                helperText="Minimum 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                error={errors.password}
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                error={errors.confirmPassword}
                leftIcon={<Lock className="w-4 h-4" />}
              />
            </CardContent>

            <CardFooter className="flex-col gap-4">
              <Button
                type="submit"
                variant="secondary"
                size="md"
                isLoading={isLoading}
                className="w-full justify-center"
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Get My Dance Card
              </Button>

              <div className="text-xs text-center text-disco-cream-muted mt-2">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-disco-pink hover:underline font-bold inline-flex items-center gap-1"
                >
                  Log In <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};
