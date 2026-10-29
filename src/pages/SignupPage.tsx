import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Mail, Lock, User, UserPlus, ArrowRight, Disc3 } from 'lucide-react';
import { signupSchema } from '../lib/validation';

type SignupErrors = {
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

export const SignupPage: React.FC = () => {
  const { signUp, user, isConfigured } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<SignupErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  useEffect(() => {
    if (user) navigate('/game', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = signupSchema.safeParse({ email, password, displayName });
    const errs: SignupErrors = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if ((key === 'email' || key === 'password' || key === 'displayName') && !errs[key]) {
          errs[key] = issue.message;
        }
      }
    }
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';

    if (!parsed.success || Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { error } = await signUp(parsed.data.email, parsed.data.password, parsed.data.displayName);
      if (error) {
        setErrors({ general: error.message || 'Registration failed.' });
        addToast('Registration failed', 'error');
      } else {
        // If email confirmation is on, there is no session yet: the user must confirm first.
        // If it is off, the AuthContext session arrives and the effect above redirects to /game.
        setAwaitingConfirmation(true);
        addToast('Account created!', 'success');
      }
    } catch {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (awaitingConfirmation && !user) {
    return (
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md rounded-3xl border-3 border-disco-border bg-disco-surface p-8 text-center shadow-retro-xl">
          <Mail className="w-10 h-10 mx-auto text-disco-mustard" />
          <h1 className="mt-3 text-2xl font-display text-disco-cream">Check your email</h1>
          <p className="mt-2 text-sm text-disco-cream-muted">
            If email confirmation is enabled, we sent a link to <strong>{email.trim().toLowerCase()}</strong>.
            Click it, then log in. If confirmation is off, you will be signed in automatically.
          </p>
          <Link
            to="/login"
            className="inline-block mt-5 px-4 py-2 rounded-xl border-2 border-disco-border bg-disco-mustard text-disco-border font-display shadow-retro-sm"
          >
            Go to log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-disco-mustard border-2 border-disco-border items-center justify-center shadow-retro mb-4">
            <Disc3 className="w-9 h-9 text-disco-border animate-disco-spin" />
          </div>
          <h1 className="text-3xl font-bold font-display text-disco-cream">Join The Dance Floor</h1>
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
              <CardDescription>Sign up to record scores and climb the rankings</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {errors.general && (
                <ErrorMessage title="Registration Failed" message={errors.general} className="mb-2" />
              )}

              <Input
                label="Dancer Name"
                type="text"
                name="displayName"
                autoComplete="nickname"
                required
                placeholder="DiscoKing_77"
                helperText="3 to 20 characters: letters, numbers, spaces, - and _"
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
                helperText="At least 8 characters, with a letter and a number"
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