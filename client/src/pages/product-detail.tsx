import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ShoppingCart, Heart, Star, ChevronLeft, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/stores/cart-store";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, RatingWithUser } from "@shared/schema";

export default function ProductDetail() {
  const [, params] = useRoute("/produits/:id");
  const productId = params?.id;
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const addItem = useCartStore((state) => state.addItem);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });

  const { data: ratings } = useQuery<{ results: RatingWithUser[] }>({
    queryKey: [`/api/products/${productId}/ratings`],
    enabled: !!productId,
  });

  const ratingMutation = useMutation({
    mutationFn: async (data: { rating: number; comment?: string }) => {
      return await apiRequest("POST", `/api/products/${productId}/ratings`, data);
    },
    onSuccess: () => {
      toast({ title: "Avis ajouté", description: "Merci pour votre avis !" });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/products/${productId}/ratings`] });
      setRating(0);
      setComment("");
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible d'ajouter l'avis", variant: "destructive" });
    },
  });

  if (isLoading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const images = product.images as string[];
  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock < 10;

  const handleAddToCart = () => {
    if (!inStock) {
      toast({ title: "Stock insuffisant", description: "Ce produit n'est plus disponible", variant: "destructive" });
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      imageUrl: images[0] || "",
      stock: product.stock,
    });

    toast({ title: "Ajouté au panier", description: `${quantity} × ${product.name} ajouté(s) au panier` });
  };

  const handleSubmitRating = () => {
    if (!isAuthenticated) {
      toast({ title: "Connexion requise", description: "Veuillez vous connecter pour laisser un avis", variant: "destructive" });
      return;
    }
    if (rating === 0) {
      toast({ title: "Note requise", description: "Veuillez sélectionner une note", variant: "destructive" });
      return;
    }
    ratingMutation.mutate({ rating, comment: comment.trim() || undefined });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6" data-testid="button-back">
        <Link href="/produits">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Retour aux produits
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden bg-muted rounded-lg">
            <img
              src={images[selectedImage] || "/placeholder-product.png"}
              alt={product.name}
              className="w-full h-full object-cover"
              data-testid="img-product-main"
            />
            {!inStock && (
              <Badge variant="destructive" className="absolute top-4 left-4">
                Rupture de stock
              </Badge>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${selectedImage === index ? "border-primary" : "border-transparent"} hover-elevate`}
                  data-testid={`img-thumb-${index}`}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3" data-testid="text-product-title">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(parseFloat(product.ratingAverage)) ? "text-chart-3 fill-current" : "text-muted stroke-current fill-none"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.ratingAverage} ({product.ratingCount} avis)
              </span>
            </div>

            <p className="font-heading font-bold text-4xl text-foreground mb-4" data-testid="text-product-price">
              {parseFloat(product.price).toLocaleString()} FCFA
            </p>

            {lowStock && inStock && (
              <Badge className="bg-chart-3 text-white mb-4">
                Plus que {product.stock} restants
              </Badge>
            )}
          </div>

          {product.description && (
            <div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">Description</h3>
              <p className="text-muted-foreground" data-testid="text-product-description">{product.description}</p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center border border-border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={!inStock}
                data-testid="button-quantity-decrease"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="px-4 font-medium" data-testid="text-quantity">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={!inStock}
                data-testid="button-quantity-increase"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              className="flex-1"
              disabled={!inStock}
              onClick={handleAddToCart}
              data-testid="button-add-to-cart"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Ajouter au panier
            </Button>

            <Button
              variant="outline"
              size="icon"
              data-testid="button-add-favorite"
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="font-heading font-bold text-2xl text-foreground mb-6">Avis clients</h2>

        {isAuthenticated && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-heading font-semibold text-lg mb-4">Donner votre avis</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Note</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="hover:scale-110 transition-transform"
                        data-testid={`button-rating-${star}`}
                      >
                        <Star
                          className={`h-8 w-8 ${star <= rating ? "text-chart-3 fill-current" : "text-muted stroke-current"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Commentaire (optionnel)</label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Partagez votre expérience avec ce produit..."
                    rows={4}
                    data-testid="textarea-comment"
                  />
                </div>
                <Button
                  onClick={handleSubmitRating}
                  disabled={ratingMutation.isPending}
                  data-testid="button-submit-rating"
                >
                  {ratingMutation.isPending ? "Envoi..." : "Publier l'avis"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {ratings?.results && ratings.results.length > 0 ? (
          <div className="space-y-4">
            {ratings.results.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-foreground">{review.user.username}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? "text-chart-3 fill-current" : "text-muted stroke-current fill-none"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-muted-foreground">{review.comment}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Aucun avis pour le moment. Soyez le premier à donner votre avis !
          </p>
        )}
      </div>
    </div>
  );
}
