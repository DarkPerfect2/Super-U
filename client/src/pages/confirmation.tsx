import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { CheckCircle2, Package, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderWithDetails } from "@shared/schema";

export default function Confirmation() {
  const [, params] = useRoute("/confirmation/:id");
  const orderId = params?.id;

  const { data: order, isLoading } = useQuery<OrderWithDetails>({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId,
  });

  if (isLoading || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-12">
        <Skeleton className="h-12 w-3/4 mb-8" />
        <Skeleton className="h-48 w-full mb-6" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-chart-2 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-12 w-12 text-white" />
        </div>
        <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
          Commande confirmée !
        </h1>
        <p className="text-lg text-muted-foreground">
          Merci pour votre commande. Vous recevrez un SMS avec les détails.
        </p>
      </div>

      {/* Policy Alert */}
      <Alert className="bg-chart-3/10 border-l-4 border-chart-3 mb-8" data-testid="alert-policy">
        <AlertCircle className="h-5 w-5 text-chart-3" />
        <AlertDescription className="text-sm font-medium">
          <strong>Rappel important :</strong> Votre commande expire dans{" "}
          {order.items.some((item: any) => item.product?.isPerishable) ? "24 heures" : "48 heures"}.
          Passé ce délai, elle sera annulée et remise en rayon sans remboursement.
        </AlertDescription>
      </Alert>

      {/* Order Details */}
      <Card className="mb-6" data-testid="card-order-details">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Numéro de commande</p>
              <p className="font-heading font-bold text-2xl text-foreground" data-testid="text-order-number">
                {order.orderNumber}
              </p>
            </div>
            <Badge className="bg-chart-2 text-white">
              {order.status === "pending_payment" && "En attente de paiement"}
              {order.status === "paid" && "Payée"}
              {order.status === "preparing" && "En préparation"}
              {order.status === "ready" && "Prête"}
              {order.status === "picked_up" && "Récupérée"}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground mb-1">Créneau de retrait</p>
                <p className="text-sm text-muted-foreground">
                  {order.pickupSlot.date} - {order.pickupSlot.timeFrom} à {order.pickupSlot.timeTo}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground mb-1">Articles commandés</p>
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <p key={item.id} className="text-sm text-muted-foreground">
                      {item.productName} × {item.quantity} - {parseFloat(item.subtotal).toLocaleString()} FCFA
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-border mt-6 pt-6">
            <div className="flex justify-between items-center">
              <span className="font-heading font-bold text-lg">Total payé</span>
              <span className="font-heading font-bold text-2xl text-primary" data-testid="text-total-paid">
                {parseFloat(order.amount).toLocaleString()} {order.currency}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pickup Codes */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="font-heading font-bold text-xl text-foreground mb-4">
            Code de retrait
          </h2>
          {order.tempPickupCode ? (
            <div className="bg-primary/10 rounded-lg p-6 text-center mb-4">
              <p className="text-sm text-muted-foreground mb-2">Code temporaire</p>
              <p className="font-heading font-bold text-4xl text-primary tracking-wider" data-testid="text-temp-code">
                {order.tempPickupCode}
              </p>
            </div>
          ) : (
            <div className="bg-muted rounded-lg p-6 text-center mb-4">
              <p className="text-sm text-muted-foreground">
                Le code de retrait sera généré après validation du paiement
              </p>
            </div>
          )}
          <p className="text-sm text-muted-foreground text-center">
            Présentez ce code au comptoir lors du retrait de votre commande.
            Un code final vous sera fourni lors de la vérification.
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="flex-1" data-testid="button-continue-shopping">
          <Link href="/">Retour à l'accueil</Link>
        </Button>
        <Button variant="outline" asChild className="flex-1" data-testid="button-view-orders">
          <Link href="/compte">Voir mes commandes</Link>
        </Button>
      </div>
    </div>
  );
}
