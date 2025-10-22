import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditProfileModal } from '@/components/ui/edit-profile-modal';
import { User, Mail, Phone, Lock, LogOut, ShoppingBag, Heart, Settings } from 'lucide-react';
import type { Order } from '@shared/schema';

export default function Account() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [editModalOpen, setEditModalOpen] = useState(false);

  const { data: orders } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="text-center py-16">
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
            Accès à votre compte
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Vous devez être connecté pour accéder à cette page
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>Retour à l'accueil</Button>
            <Button onClick={() => navigate("/connexion")}>
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-2">Mon compte</h1>
        <p className="text-muted-foreground">Bienvenue, {user?.username}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{user?.username}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <Button onClick={() => setEditModalOpen(true)} variant="outline" className="w-full" data-testid="button-edit-profile">
                <Settings className="h-4 w-4 mr-2" />
                Modifier mes informations
              </Button>

              <Button onClick={logout} variant="outline" className="w-full text-destructive hover:text-destructive" data-testid="button-logout-account">
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Détails du compte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nom d'utilisateur
                </p>
                <p className="font-medium text-foreground">{user?.username}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </p>
                <p className="font-medium text-foreground break-all">{user?.email}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Téléphone
                </p>
                <p className="font-medium text-foreground">{user?.phone || 'Non défini'}</p>
              </div>

              <div className="pt-4 border-t border-border">
                <Button onClick={() => setEditModalOpen(true)} variant="ghost" size="sm" className="w-full">
                  <Lock className="h-4 w-4 mr-2" />
                  Changer mon mot de passe
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Mes commandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders && orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition cursor-pointer" onClick={() => navigate(`/orders/${order.id}`)} data-testid={`order-${order.id}`}>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{parseFloat(order.amount).toLocaleString()} FCFA</p>
                        <p className={`text-sm ${order.status === 'paid' ? 'text-green-600' : order.status === 'pending_payment' ? 'text-yellow-600' : 'text-red-600'}`}>
                          {order.status === 'paid' ? 'Payée' : order.status === 'pending_payment' ? 'En attente' : 'Annulée'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground mb-4">Aucune commande pour le moment</p>
                  <Button variant="outline" onClick={() => navigate("/produits")}>
                    Commencer mes courses
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <Card className="hover:bg-muted/50 transition cursor-pointer" onClick={() => navigate("/favoris")}>
              <CardContent className="pt-6 text-center">
                <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-semibold text-foreground">Mes favoris</p>
              </CardContent>
            </Card>

            <Card className="hover:bg-muted/50 transition cursor-pointer" onClick={() => navigate("/panier")}>
              <CardContent className="pt-6 text-center">
                <ShoppingBag className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="font-semibold text-foreground">Mon panier</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <EditProfileModal open={editModalOpen} onOpenChange={setEditModalOpen} />
    </div>
  );
}
