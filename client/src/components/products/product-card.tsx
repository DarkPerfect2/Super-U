import { Link } from "wouter";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ProductImage } from "@/components/ui/product-image";
import { useCartStore } from "@/stores/cart-store";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) {
      toast({
        title: "Stock insuffisant",
        description: "Ce produit n'est plus disponible",
        variant: "destructive",
      });
      return;
    }

    const images = product.images as string[];
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: images[0] || "",
      stock: product.stock,
    });

    toast({
      title: "Ajouté au panier",
      description: `${product.name} a été ajouté à votre panier`,
    });
  };

  const images = product.images as string[];
  const inStock = product.stock > 0;
  const lowStock = product.stock > 0 && product.stock < 10;

  return (
    <Link href={`/produits/${product.id}`}>
      <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer group h-full flex flex-col" data-testid={`product-card-${product.id}`}>
        <div className="aspect-square relative overflow-hidden bg-muted group-hover:scale-105 transition-transform duration-300">
          <ProductImage
            src={images[0] || "/placeholder-product.png"}
            alt={product.name}
            className="w-full h-full"
          />
          {!inStock && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Rupture
            </Badge>
          )}
          {lowStock && inStock && (
            <Badge className="absolute top-2 left-2 bg-chart-3 text-white">
              Stock limité
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            data-testid={`button-favorite-${product.id}`}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="font-medium text-foreground mb-2 line-clamp-2 flex-1" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${i < Math.floor(parseFloat(product.ratingAverage)) ? "text-chart-3 fill-current" : "text-muted stroke-current fill-none"}`}
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
            <span className="text-xs text-muted-foreground ml-1">
              ({product.ratingCount})
            </span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="font-heading font-bold text-xl text-foreground" data-testid={`text-price-${product.id}`}>
                {parseFloat(product.price).toLocaleString()} FCFA
              </p>
              {lowStock && inStock && (
                <p className="text-xs text-chart-3">Plus que {product.stock} restants</p>
              )}
            </div>
            <Button
              size="icon"
              disabled={!inStock}
              onClick={handleAddToCart}
              data-testid={`button-add-cart-${product.id}`}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
