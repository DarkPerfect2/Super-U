import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Package, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { OrderWithDetails } from "@shared/schema";

export default function Account() {
  const { user, updateUser, logout } = useAuth();
  const { toast } = useToast();
  const [newUsername, setNewUsername] = useState(user?.username || "");

  const { data: orders } = useQuery<OrderWithDetails[]>({
    queryKey: ["/api/orders"],
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: { username: string }) => {
      return await apiRequest("PATCH", "/api/auth/me", data);
    },
    onSuccess: (data) => {
      updateUser(data);
      toast({ title: "Profil mis à jour", description: "Vos informations ont été mises à jour avec succès" });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le profil", variant: "destructive" });
    },
  });

  const handleUpdateProfile = () => {
    if (!newUsername.trim()) {
      toast({ title: "Erreur", description: "Le nom d'utilisateur est requis", variant: "destructive" });
      return;
    }
    updateUserMutation.mutate({ username: newUsername });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_payment":
        return <Badge variant="outline">En attente</Badge>;
      case "paid":
        return <Badge className="bg-chart-2 text-white">Payée</Badge>;
      case "preparing":
        return <Badge className="bg-chart-3 text-white">En préparation</Badge>;
      case "ready":
        return <Badge className="bg-primary text-white">Prête</Badge>;
      case "picked_up":
        return <Badge variant="secondary">Récupérée</Badge>;
      case "cancelled_expired":
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Veuillez vous connecter pour accéder à votre compte</p>
            <Button asChild>
              <a href="/connexion">Se connecter</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-8">
        Mon compte
      </h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="profile" data-testid="tab-profile">
            <User className="h-4 w-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders">
            <Package className="h-4 w-4 mr-2" />
            Commandes
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Informations personnelles</CardTitle>
              <CardDescription>Gérez vos informations de compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input value={user.email} disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom d'utilisateur</label>
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  data-testid="input-username"
                />
              </div>
              <Button
                onClick={handleUpdateProfile}
                disabled={updateUserMutation.isPending || newUsername === user.username}
                data-testid="button-update-profile"
              >
                {updateUserMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <Card key={order.id} data-testid={`order-card-${order.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-heading font-bold text-lg text-foreground">
                        Commande #{order.orderNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.productName} × {item.quantity}
                        </span>
                        <span className="font-medium">
                          {parseFloat(item.subtotal).toLocaleString()} FCFA
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Retrait</p>
                      <p className="font-medium">
                        {order.pickupSlot.date} - {order.pickupSlot.timeFrom}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-heading font-bold text-xl text-primary">
                        {parseFloat(order.amount).toLocaleString()} FCFA
                      </p>
                    </div>
                  </div>

                  {order.tempPickupCode && (
                    <div className="mt-4 bg-primary/10 rounded-lg p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Code de retrait</p>
                      <p className="font-heading font-bold text-2xl text-primary tracking-wider">
                        {order.tempPickupCode}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">Aucune commande pour le moment</p>
                <Button asChild>
                  <a href="/produits">Commencer mes courses</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Paramètres du compte</CardTitle>
              <CardDescription>Gérez les paramètres de votre compte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Déconnexion</p>
                  <p className="text-sm text-muted-foreground">Se déconnecter de votre compte</p>
                </div>
                <Button variant="outline" onClick={logout} data-testid="button-logout">
                  Déconnexion
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
