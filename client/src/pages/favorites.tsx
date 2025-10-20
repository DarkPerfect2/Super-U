import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import type { Product } from "@shared/schema";

export default function Favorites() {
  const { isAuthenticated } = useAuth();

  const { data: favorites, isLoading } = useQuery<{ product: Product }[]>({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-foreground mb-3">
            Connexion requise
          </h2>
          <p className="text-muted-foreground mb-6">
            Connectez-vous pour accéder à vos favoris
          </p>
          <Button asChild>
            <a href="/connexion">Se connecter</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-8">
        Mes favoris
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {favorites.map((fav) => (
            <ProductCard key={fav.product.id} product={fav.product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-foreground mb-3">
            Aucun favori
          </h2>
          <p className="text-muted-foreground mb-6">
            Ajoutez des produits à vos favoris pour les retrouver facilement
          </p>
          <Button asChild>
            <a href="/produits">Découvrir les produits</a>
          </Button>
        </div>
      )}
    </div>
  );
}
