import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/stores/cart-store";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { PickupSlot } from "@shared/schema";

export default function Checkout() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { items, getTotal, clearCart } = useCartStore();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [customerName, setCustomerName] = useState(user?.username || "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "card">("momo");
  const [notes, setNotes] = useState("");

  const { data: slots } = useQuery<PickupSlot[]>({
    queryKey: ["/api/pickup-slots"],
  });

  const orderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: (data) => {
      clearCart();
      navigate(`/confirmation/${data.id}`);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de créer la commande", variant: "destructive" });
    },
  });

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="text-center py-16">
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4">
            Authentification requise
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Vous devez être connecté pour finaliser votre commande
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate("/panier")}
            >
              Retour au panier
            </Button>
            <Button
              onClick={() => navigate("/connexion")}
            >
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    navigate("/panier");
    return null;
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!customerName || !customerPhone) {
        toast({ title: "Erreur", description: "Veuillez remplir tous les champs", variant: "destructive" });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedSlot) {
        toast({ title: "Erreur", description: "Veuillez sélectionner un créneau", variant: "destructive" });
        return;
      }
      setStep(3);
    }
  };

  const handlePlaceOrder = () => {
    const orderData = {
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      pickupSlotId: selectedSlot,
      userId: user?.id || undefined,
      amount: getTotal().toString(),
      currency: "XAF",
      paymentMethod,
      notes: notes || undefined,
      status: "pending_payment",
    };

    orderMutation.mutate(orderData);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-8">
        Finaliser ma commande
      </h1>

      {/* Stepper */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-4">
              <div className={`flex items-center gap-3 ${step >= s ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step > s ? "bg-primary" : step === s ? "bg-primary border-4 border-primary/20" : "bg-muted"}`}>
                  {step > s ? (
                    <Check className="h-5 w-5 text-primary-foreground" />
                  ) : (
                    <span className={`font-heading font-bold ${step === s ? "text-primary-foreground" : "text-muted-foreground"}`}>{s}</span>
                  )}
                </div>
                <span className="hidden md:block font-medium">
                  {s === 1 ? "Informations" : s === 2 ? "Créneau" : "Paiement"}
                </span>
              </div>
              {s < 3 && <div className={`hidden md:block w-16 h-1 ${step > s ? "bg-primary" : "bg-muted"}`}></div>}
            </div>
          ))}
        </div>
      </div>

      <Alert className="bg-chart-3/10 border-l-4 border-chart-3 mb-8" data-testid="alert-policy">
        <AlertCircle className="h-5 w-5 text-chart-3" />
        <AlertDescription className="text-sm font-medium">
          <strong>Important :</strong> 24h max pour produits périssables, 48h pour non périssables. 
          Commande annulée sans remboursement après expiration.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 1: Customer Info */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Informations de contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    data-testid="input-customer-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    data-testid="input-customer-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optionnel)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    data-testid="input-customer-email"
                  />
                </div>
                <Button onClick={handleNextStep} className="w-full" data-testid="button-next-step-1">
                  Continuer
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Pickup Slot */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Choisir un créneau de retrait</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={selectedSlot} onValueChange={setSelectedSlot}>
                  <div className="space-y-2">
                    {slots && slots.length > 0 ? (
                      slots.map((slot) => (
                        <div key={slot.id} className="flex items-center space-x-2 border border-border rounded-lg p-4 hover-elevate">
                          <RadioGroupItem value={slot.id} id={slot.id} data-testid={`radio-slot-${slot.id}`} />
                          <Label htmlFor={slot.id} className="flex-1 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{slot.date}</p>
                                <p className="text-sm text-muted-foreground">{slot.timeFrom} - {slot.timeTo}</p>
                              </div>
                              <p className="text-sm">
                                {slot.remaining > 0 ? (
                                  <span className={slot.remaining < 10 ? "text-chart-3" : "text-chart-2"}>
                                    {slot.remaining} places restantes
                                  </span>
                                ) : (
                                  <span className="text-destructive">Complet</span>
                                )}
                              </p>
                            </div>
                          </Label>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">Aucun créneau disponible</p>
                    )}
                  </div>
                </RadioGroup>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Retour
                  </Button>
                  <Button onClick={handleNextStep} className="flex-1" data-testid="button-next-step-2">
                    Continuer
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Mode de paiement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "momo" | "card")}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 border border-border rounded-lg p-4 hover-elevate">
                      <RadioGroupItem value="momo" id="momo" data-testid="radio-momo" />
                      <Label htmlFor="momo" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">Mobile Money</span>
                          <div className="flex gap-1 opacity-70">
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='26' viewBox='0 0 40 26'%3E%3Crect fill='%23E31E24' width='40' height='26' rx='2'/%3E%3Ctext x='20' y='16' font-family='Arial' font-size='8' fill='white' text-anchor='middle' font-weight='bold'%3EMTN%3C/text%3E%3C/svg%3E" alt="MTN" className="h-6" />
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='26' viewBox='0 0 40 26'%3E%3Crect fill='%23ED1C24' width='40' height='26' rx='2'/%3E%3Ctext x='20' y='16' font-family='Arial' font-size='6' fill='white' text-anchor='middle' font-weight='bold'%3EAIRTEL%3C/text%3E%3C/svg%3E" alt="Airtel" className="h-6" />
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 border border-border rounded-lg p-4 hover-elevate">
                      <RadioGroupItem value="card" id="card" data-testid="radio-card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">Carte bancaire</span>
                          <div className="flex gap-1 opacity-70">
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='26' viewBox='0 0 40 26'%3E%3Crect fill='%231434CB' width='40' height='26' rx='2'/%3E%3Ctext x='20' y='16' font-family='Arial' font-size='8' fill='white' text-anchor='middle' font-weight='bold'%3EVISA%3C/text%3E%3C/svg%3E" alt="Visa" className="h-6" />
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='26' viewBox='0 0 40 26'%3E%3Crect fill='%23EB001B' width='20' height='26'/%3E%3Crect fill='%23F79E1B' x='20' width='20' height='26'/%3E%3C/svg%3E" alt="Mastercard" className="h-6" />
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optionnel)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Instructions particulières pour votre commande..."
                    rows={3}
                    data-testid="textarea-notes"
                  />
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Retour
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    className="flex-1"
                    disabled={orderMutation.isPending}
                    data-testid="button-place-order"
                  >
                    {orderMutation.isPending ? "Traitement..." : "Payer et confirmer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="font-heading">Résumé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate">{item.name} × {item.quantity}</span>
                    <span className="font-medium whitespace-nowrap ml-2">
                      {(parseFloat(item.price) * item.quantity).toLocaleString()} FCFA
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-heading font-bold text-lg">Total</span>
                  <span className="font-heading font-bold text-2xl text-primary" data-testid="text-checkout-total">
                    {getTotal().toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
