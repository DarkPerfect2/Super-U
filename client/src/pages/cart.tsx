import { Link } from "wouter";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/stores/cart-store";

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="font-heading font-bold text-2xl text-foreground mb-3">
            Votre panier est vide
          </h2>
          <p className="text-muted-foreground mb-6">
            Découvrez nos produits et commencez vos courses en ligne
          </p>
          <Button asChild data-testid="button-continue-shopping">
            <Link href="/produits">Continuer mes courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-8">
        Mon panier
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.productId} data-testid={`cart-item-${item.productId}`}>
              <CardContent className="p-4 md:p-6">
                <div className="flex gap-4">
                  <img
                    src={item.imageUrl || "/placeholder-product.png"}
                    alt={item.name}
                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
                  />

                  <div className="flex-1 min-w-0">
                    <Link href={`/produits/${item.productId}`}>
                      <h3 className="font-heading font-semibold text-lg text-foreground mb-2 hover:text-primary" data-testid={`text-item-name-${item.productId}`}>
                        {item.name}
                      </h3>
                    </Link>
                    <p className="font-heading font-bold text-xl text-foreground mb-3" data-testid={`text-item-price-${item.productId}`}>
                      {parseFloat(item.price).toLocaleString()} FCFA
                    </p>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center border border-border rounded-lg">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          data-testid={`button-decrease-${item.productId}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="px-3 font-medium" data-testid={`text-quantity-${item.productId}`}>
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          data-testid={`button-increase-${item.productId}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.productId)}
                        data-testid={`button-remove-${item.productId}`}
                      >
                        <Trash2 className="h-5 w-5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <h2 className="font-heading font-bold text-xl text-foreground mb-6">
                Récapitulatif
              </h2>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">
                      {(parseFloat(item.price) * item.quantity).toLocaleString()} FCFA
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-heading font-bold text-lg">Total</span>
                  <span className="font-heading font-bold text-2xl text-primary" data-testid="text-total">
                    {getTotal().toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              <Button className="w-full" size="lg" asChild data-testid="button-checkout">
                <Link href="/checkout">
                  Passer la commande
                </Link>
              </Button>

              <Button variant="outline" className="w-full mt-3" asChild>
                <Link href="/produits">
                  Continuer mes courses
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
