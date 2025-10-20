import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ShoppingBag, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { Category } from "@shared/schema";

export default function Home() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px] bg-cover bg-center bg-no-repeat flex items-center justify-center overflow-hidden" style={{backgroundImage: "url('https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1600')"}}>
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h1 className="font-heading font-bold text-4xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight drop-shadow-lg">
            Vos courses en un clic
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow">
            Commandez en ligne et retirez vos produits en magasin. 
            Simple, rapide et pratique.
          </p>
          <Button
            size="lg"
            className="text-lg px-8 h-12"
            asChild
            data-testid="button-start-shopping"
          >
            <Link href="/produits">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Commencer mes courses en ligne
            </Link>
          </Button>
        </div>
      </section>

      {/* Policy Notice */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 -mt-8 relative z-20">
        <Alert className="bg-chart-3/10 border-l-4 border-chart-3" data-testid="alert-policy">
          <AlertCircle className="h-5 w-5 text-chart-3" />
          <AlertDescription className="text-sm md:text-base font-medium">
            <strong>Politique de retrait :</strong> 24h maximum pour produits périssables, 
            48h pour non périssables. Passé ce délai, commande annulée et remise en rayon, 
            sans remboursement (commande expirée).
          </AlertDescription>
        </Alert>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
            Nos catégories
          </h2>
          <p className="text-muted-foreground text-lg">
            Découvrez notre large sélection de produits
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
              >
                <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer group" data-testid={`category-card-${category.slug}`}>
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-heading font-semibold text-lg text-white mb-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-white/80">
                        {category.productCount} produits
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              Aucune catégorie disponible pour le moment
            </p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                Large choix
              </h3>
              <p className="text-muted-foreground">
                Des milliers de produits frais et d'épicerie disponibles
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-chart-2 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                Retrait rapide
              </h3>
              <p className="text-muted-foreground">
                Choisissez votre créneau et retirez vos courses en magasin
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-chart-3 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
                Paiement sécurisé
              </h3>
              <p className="text-muted-foreground">
                Mobile Money et carte bancaire acceptés
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
