import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Phone, Mail, ShoppingCart, Shield, Truck, CreditCard } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
          À propos de Géant Casino
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Votre supermarché de confiance à Brazzaville, maintenant disponible en ligne avec notre service Click & Collect
        </p>
      </div>

      {/* Mission Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              Notre Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Depuis plus de 20 ans, Géant Casino Brazzaville s'engage à offrir à ses clients 
              les meilleurs produits au meilleur prix. Notre mission est de simplifier vos 
              courses quotidiennes en vous proposant un large choix de produits frais, 
              d'épicerie et de biens de consommation de qualité.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-6 w-6 text-primary" />
              Click & Collect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Notre service Click & Collect révolutionne vos courses ! Commandez en ligne, 
              choisissez votre créneau de retrait et récupérez vos produits directement 
              en magasin. Fini les files d'attente, gagnez du temps tout en bénéficiant 
              de la fraîcheur et de la qualité Géant Casino.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Services Section */}
      <div className="mb-12">
        <h2 className="font-heading text-3xl font-bold text-center mb-8">Nos Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Créneaux Flexibles</h3>
              <p className="text-sm text-muted-foreground">
                Choisissez votre horaire de retrait parmi nos créneaux disponibles
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Produits Frais</h3>
              <p className="text-sm text-muted-foreground">
                Fruits, légumes, viandes et poissons sélectionnés avec soin
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Paiement Sécurisé</h3>
              <p className="text-sm text-muted-foreground">
                MTN Money, Airtel Money et cartes bancaires acceptés
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Retrait Rapide</h3>
              <p className="text-sm text-muted-foreground">
                Vos courses prêtes en moins de 2 heures après commande
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Our Values */}
      <div className="mb-12">
        <h2 className="font-heading text-3xl font-bold text-center mb-8">Nos Valeurs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Qualité</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Nous sélectionnons rigoureusement nos produits pour vous garantir 
                la meilleure qualité au meilleur prix.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Proximité</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Nous sommes proches de nos clients et à l'écoute de leurs besoins 
                pour améliorer constamment nos services.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Innovation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Nous innovons constamment pour faciliter votre quotidien avec 
                des solutions modernes et pratiques.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Information */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-center">Nous Contacter</CardTitle>
          <CardDescription className="text-center">
            Notre équipe est à votre disposition pour vous accompagner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <MapPin className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Adresse</h3>
              <p className="text-sm text-muted-foreground">
                Avenue Amilcar Cabral<br />
                Centre-ville, Brazzaville<br />
                République du Congo
              </p>
            </div>

            <div className="flex flex-col items-center">
              <Phone className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Téléphone</h3>
              <p className="text-sm text-muted-foreground">
                +242 06 xxx xx xx<br />
                Lun-Sam: 8h-20h<br />
                Dim: 8h-18h
              </p>
            </div>

            <div className="flex flex-col items-center">
              <Mail className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Email</h3>
              <p className="text-sm text-muted-foreground">
                contact@geantcasino-brazza.cg<br />
                clickcollect@geantcasino-brazza.cg
              </p>
            </div>

            <div className="flex flex-col items-center">
              <Clock className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Créneaux Click & Collect</h3>
              <p className="text-sm text-muted-foreground">
                Lun-Sam: 9h-19h<br />
                Dim: 9h-17h<br />
                Créneaux de 2h
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Highlights */}
      <div className="text-center">
        <h2 className="font-heading text-2xl font-bold mb-6">Pourquoi Choisir Géant Casino ?</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Badge variant="secondary" className="px-4 py-2">Plus de 5000 produits</Badge>
          <Badge variant="secondary" className="px-4 py-2">Livraison en 2h</Badge>
          <Badge variant="secondary" className="px-4 py-2">Produits locaux</Badge>
          <Badge variant="secondary" className="px-4 py-2">Paiement mobile</Badge>
          <Badge variant="secondary" className="px-4 py-2">Support client 7j/7</Badge>
          <Badge variant="secondary" className="px-4 py-2">Garantie fraîcheur</Badge>
        </div>
      </div>
    </div>
  );
}
