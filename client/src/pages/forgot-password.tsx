import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Check } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPassword() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const forgotPasswordMutation = useMutation({
    mutationFn: async (emailAddress: string) => {
      return await apiRequest('POST', '/api/auth/forgot-password', { email: emailAddress });
    },
    onSuccess: () => {
      setSubmitted(true);
      setEmail('');
    },
    onError: (error: any) => {
      toast({ title: 'Erreur', description: error.message || 'Impossible de traiter votre demande', variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: 'Erreur', description: 'Veuillez entrer votre email', variant: 'destructive' });
      return;
    }
    forgotPasswordMutation.mutate(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Réinitialiser votre mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="font-semibold text-foreground">Email envoyé!</h2>
                <p className="text-sm text-muted-foreground">Vérifiez votre boîte mail pour le lien de réinitialisation. Il expire dans 1 heure.</p>
              </div>
              <Button onClick={() => { setSubmitted(false); navigate('/connexion'); }} className="w-full">
                Retour à la connexion
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Alert className="bg-blue-50 border-l-4 border-blue-500">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input id="email" type="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={forgotPasswordMutation.isPending} data-testid="input-forgot-email" />
              </div>

              <Button type="submit" disabled={forgotPasswordMutation.isPending} className="w-full" data-testid="button-send-reset">
                {forgotPasswordMutation.isPending ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Vous vous souvenez de votre mot de passe?{' '}
                  <button type="button" onClick={() => navigate('/connexion')} className="text-primary hover:underline font-medium">
                    Se connecter
                  </button>
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
