import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check, Eye, EyeOff } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function ResetPassword() {
  const [searchParams] = useLocation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const token = new URLSearchParams(searchParams).get('token');

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      return await apiRequest('POST', '/api/auth/reset-password', data);
    },
    onSuccess: () => {
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error: any) => {
      toast({ title: 'Erreur', description: error.message || 'Impossible de réinitialiser votre mot de passe', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast({ title: 'Erreur', description: 'Lien invalide. Veuillez demander un nouveau lien de réinitialisation', variant: 'destructive' });
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs', variant: 'destructive' });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas', variant: 'destructive' });
      return;
    }

    if (newPassword.length < 8) {
      toast({ title: 'Erreur', description: 'Le mot de passe doit contenir au moins 8 caractères', variant: 'destructive' });
      return;
    }

    resetPasswordMutation.mutate({ token, newPassword });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Lien invalide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-red-50 border-l-4 border-red-500">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-red-800">Ce lien de réinitialisation est invalide ou a expiré.</AlertDescription>
            </Alert>
            <Button onClick={() => window.location.href = '/mot-de-passe-oublie'} className="w-full">Demander un nouveau lien</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Réinitialiser votre mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="font-semibold text-foreground">Mot de passe réinitialisé!</h2>
                <p className="text-sm text-muted-foreground">Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
              </div>
              <Button onClick={() => window.location.href = '/connexion'} className="w-full">Aller à la connexion</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Alert className="bg-blue-50 border-l-4 border-blue-500">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">Entrez votre nouveau mot de passe. Le mot de passe doit contenir au moins 8 caractères.</AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input id="newPassword" type={showPassword ? 'text' : 'password'} placeholder="Entrez votre nouveau mot de passe" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={resetPasswordMutation.isPending} data-testid="input-new-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Confirmez votre nouveau mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={resetPasswordMutation.isPending} data-testid="input-confirm-password" />
              </div>

              <Button type="submit" disabled={resetPasswordMutation.isPending} className="w-full" data-testid="button-reset-password">
                {resetPasswordMutation.isPending ? 'Réinitialisation...' : 'Réinitialiser mon mot de passe'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Vous vous souvenez de votre mot de passe?{' '}
                  <a href="/connexion" className="text-primary hover:underline font-medium">Se connecter</a>
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
