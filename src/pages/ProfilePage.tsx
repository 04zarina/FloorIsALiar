import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { User, Shield, Key, Save, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { addToast } = useToast();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [error, setError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayName.trim();

    // Validate length 3-20 characters per DB constraint
    if (!trimmed) {
      setError('Display name cannot be empty.');
      return;
    }
    if (trimmed.length < 3) {
      setError('Display name must be at least 3 characters.');
      return;
    }
    if (trimmed.length > 20) {
      setError('Display name cannot exceed 20 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_ ]+$/.test(trimmed)) {
      setError('Only letters, numbers, spaces, and underscores allowed.');
      return;
    }

    setIsSaving(true);
    setError(undefined);

    try {
      if (!user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ display_name: trimmed })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
        addToast(updateError.message, 'error');
      } else {
        await refreshProfile();
        addToast('Dancer profile updated successfully!', 'success');
      }
    } catch {
      setError('Failed to update profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-disco-mustard border-2 border-disco-border text-disco-border text-xs font-bold font-display uppercase tracking-wider mb-2 shadow-retro-xs">
          <User className="w-3.5 h-3.5" />
          <span>Profile Settings</span>
        </div>
        <h1 className="text-3xl font-bold font-display text-disco-cream">
          Dancer Identity
        </h1>
        <p className="text-sm text-disco-cream-muted mt-1">
          Manage your floor name and view your security status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="md:col-span-2">
          <Card variant="mustard">
            <form onSubmit={handleUpdateProfile}>
              <CardHeader>
                <CardTitle>Dancer Name</CardTitle>
                <CardDescription>
                  Your public name shown on the dance floor and leaderboard.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {error && <ErrorMessage message={error} className="mb-2" />}

                <Input
                  label="Display Name"
                  type="text"
                  required
                  placeholder="DiscoStriker"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (error) setError(undefined);
                  }}
                  helperText="Between 3 and 20 characters"
                  error={error}
                  leftIcon={<User className="w-4 h-4" />}
                />

                <Input
                  label="Registered Email"
                  type="email"
                  disabled
                  value={user?.email || ''}
                  helperText="Managed securely by Supabase GoTrue Auth"
                  leftIcon={<Key className="w-4 h-4" />}
                />
              </CardContent>

              <CardFooter>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Security & Metadata Info */}
        <div className="space-y-6">
          <Card className="border-2 border-disco-border shadow-retro">
            <CardHeader>
              <div className="flex items-center gap-2 text-disco-mustard">
                <Shield className="w-5 h-5" />
                <CardTitle className="text-base">Security Features</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-disco-cream-muted">
              <div className="flex items-center gap-2 text-disco-teal font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Row Level Security (RLS) Active</span>
              </div>
              <div className="flex items-center gap-2 text-disco-teal font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Zero Custom Password Storage</span>
              </div>
              <div className="flex items-center gap-2 text-disco-teal font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Cryptographic UUID Verification</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-disco-border shadow-retro">
            <CardHeader>
              <CardTitle className="text-base">Account Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-disco-cream-muted">
              <div className="flex justify-between py-1.5 border-b border-disco-border/30">
                <span>Dancer ID</span>
                <span className="font-mono text-disco-cream truncate max-w-[130px]" title={user?.id}>
                  {user?.id ? `${user.id.substring(0, 8)}...` : '—'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-disco-border/30">
                <span>Joined Date</span>
                <span className="text-disco-cream">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
