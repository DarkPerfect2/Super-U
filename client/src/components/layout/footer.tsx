import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-card border-t border-card-border mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-bold text-xl">GC</span>
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-foreground">Géant Casino</h3>
                <p className="text-sm text-muted-foreground">Click & Collect Brazzaville</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Commandez vos courses en ligne et retirez-les en magasin. 
              Large choix de produits frais et d'épicerie.
            </p>
            <div className="flex flex-wrap gap-2 opacity-70">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='40' viewBox='0 0 60 40'%3E%3Crect fill='%23E31E24' width='60' height='40' rx='4'/%3E%3Ctext x='30' y='24' font-family='Arial' font-size='10' fill='white' text-anchor='middle' font-weight='bold'%3EMTN%3C/text%3E%3C/svg%3E" alt="MTN Mobile Money" className="h-8" />
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='40' viewBox='0 0 60 40'%3E%3Crect fill='%23ED1C24' width='60' height='40' rx='4'/%3E%3Ctext x='30' y='24' font-family='Arial' font-size='8' fill='white' text-anchor='middle' font-weight='bold'%3EAIRTEL%3C/text%3E%3C/svg%3E" alt="Airtel Money" className="h-8" />
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='40' viewBox='0 0 60 40'%3E%3Crect fill='%231434CB' width='60' height='40' rx='4'/%3E%3Ctext x='30' y='24' font-family='Arial' font-size='10' fill='white' text-anchor='middle' font-weight='bold'%3EVISA%3C/text%3E%3C/svg%3E" alt="Visa" className="h-8" />
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='40' viewBox='0 0 60 40'%3E%3Crect fill='%23EB001B' width='30' height='40'/%3E%3Crect fill='%23F79E1B' x='30' width='30' height='40'/%3E%3C/svg%3E" alt="Mastercard" className="h-8" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Liens rapides</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-sm text-muted-foreground hover:text-foreground">
                  Catégories
                </Link>
              </li>
              <li>
                <Link href="/compte" className="text-sm text-muted-foreground hover:text-foreground">
                  Mon compte
                </Link>
              </li>
              <li>
                <Link href="/panier" className="text-sm text-muted-foreground hover:text-foreground">
                  Panier
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">Informations</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Politique de retrait
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Géant Casino Brazzaville. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
