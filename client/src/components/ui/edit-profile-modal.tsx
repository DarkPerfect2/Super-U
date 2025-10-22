import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { X, Eye, EyeOff } from 'lucide-react';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileModal({ open, onOpenChange }: EditProfileModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PATCH', '/api/auth/me', data);
    },
    onSuccess: () => {
      toast({ title: 'Profil mis à jour', description: 'Vos informations ont été sauvegardées' });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de mettre à jour le profil',
        variant: 'destructive',
      });
    },
  });

  const handleSaveInfo = async () => {
    if (!formData.username || !formData.email) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs', variant: 'destructive' });
      return;
    }

    updateProfileMutation.mutate({
      username: formData.username,
      email: formData.email,
      phone: formData.phone || undefined,
    });
  };

  const handleSavePassword = async () => {
    if (!formData.currentPassword || !formData.newPassword) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs de mot de passe', variant: 'destructive' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas', variant: 'destructive' });
      return;
    }

    if (formData.newPassword.length < 8) {
      toast({ title: 'Erreur', description: 'Le mot de passe doit contenir au moins 8 caractères', variant: 'destructive' });
      return;
    }

    updateProfileMutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="flex flex-row items-center justify-between">
          <AlertDialogTitle>Modifier mon profil</AlertDialogTitle>
          <button onClick={() => onOpenChange(false)} className="opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </AlertDialogHeader>

        <div className="space-y-6">
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-2 px-4 text-sm font-medium transition-colors ${
                activeTab === 'info' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Informations
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`pb-2 px-4 text-sm font-medium transition-colors ${
                activeTab === 'password' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mot de passe
            </button>
          </div>

          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input id="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} data-testid="input-edit-username" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} data-testid="input-edit-email" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input id="phone" type="tel" placeholder="+242 06..." value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} data-testid="input-edit-phone" />
              </div>

              <Button onClick={handleSaveInfo} disabled={updateProfileMutation.isPending} className="w-full" data-testid="button-save-info">
                {updateProfileMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <div className="relative">
                  <Input id="currentPassword" type={showPasswords ? 'text' : 'password'} value={formData.currentPassword} onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })} data-testid="input-current-password" />
                  <button onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
                    {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input id="newPassword" type={showPasswords ? 'text' : 'password'} value={formData.newPassword} onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} data-testid="input-new-password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input id="confirmPassword" type={showPasswords ? 'text' : 'password'} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} data-testid="input-confirm-password" />
              </div>

              <Button onClick={handleSavePassword} disabled={updateProfileMutation.isPending} className="w-full" data-testid="button-save-password">
                {updateProfileMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
