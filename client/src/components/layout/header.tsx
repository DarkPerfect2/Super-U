import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, User, Search, Heart, Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useCartStore } from "@/stores/cart-store";
import { SearchSuggestions } from "./search-suggestions";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";

export function Header() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produits?search=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="flex items-center gap-2" data-testid="link-home">
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-heading font-bold text-xl">GC</span>
              </div>
              <div className="hidden md:block">
                <h1 className="font-heading font-bold text-lg leading-none text-foreground">Géant Casino</h1>
                <p className="text-xs text-muted-foreground">Click & Collect</p>
              </div>
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Accueil
            </Link>
            <div className="relative group">
              <button
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                onMouseEnter={() => setShowCategoriesDropdown(true)}
                onMouseLeave={() => setShowCategoriesDropdown(false)}
              >
                Catégories
                <ChevronDown className="h-4 w-4" />
              </button>

              {showCategoriesDropdown && (
                <div
                  className="absolute left-0 top-full mt-0 w-48 bg-background border border-border rounded-md shadow-lg z-50 py-1"
                  onMouseEnter={() => setShowCategoriesDropdown(true)}
                  onMouseLeave={() => setShowCategoriesDropdown(false)}
                >
                  <Link href="/produits" className="block w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    Tous les produits
                  </Link>
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.slug}`}
                      className="block w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="/a-propos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              À propos
            </Link>
          </nav>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher des produits..."
                  className="pl-10 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                  data-testid="input-search"
                />
                {showSearch && searchQuery.length > 0 && (
                  <SearchSuggestions
                    query={searchQuery}
                    onClose={() => setShowSearch(false)}
                    onSelect={(productId) => {
                      navigate(`/produits/${productId}`);
                      setShowSearch(false);
                      setSearchQuery("");
                    }}
                  />
                )}
              </div>
            </form>
          </div>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/favoris")}
                  data-testid="button-favorites"
                >
                  <Heart className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => navigate("/panier")}
                  data-testid="button-cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      data-testid="badge-cart-count"
                    >
                      {itemCount}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/compte")}
                  data-testid="button-account"
                >
                  <User className="h-5 w-5 mr-2" />
                  <span className="hidden lg:inline">{user?.username}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={logout}
                  data-testid="button-logout"
                >
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => navigate("/panier")}
                  data-testid="button-cart-guest"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {itemCount}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/connexion")}
                  data-testid="button-login"
                >
                  Connexion
                </Button>
                <Button
                  onClick={() => navigate("/inscription")}
                  data-testid="button-register"
                >
                  Inscription
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-menu-toggle"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-10 rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearch(true)}
                data-testid="input-search-mobile"
              />
              {showSearch && searchQuery.length > 0 && (
                <SearchSuggestions
                  query={searchQuery}
                  onClose={() => setShowSearch(false)}
                  onSelect={(productId) => {
                    navigate(`/produits/${productId}`);
                    setShowSearch(false);
                    setSearchQuery("");
                  }}
                />
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {/* Navigation Links - Mobile */}
            <div className="border-b border-border pb-2 mb-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  navigate("/");
                  setMobileMenuOpen(false);
                }}
              >
                Accueil
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  navigate("/produits");
                  setMobileMenuOpen(false);
                }}
              >
                Tous les produits
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  className="w-full justify-start pl-8"
                  onClick={() => {
                    navigate(`/categories/${category.slug}`);
                    setMobileMenuOpen(false);
                  }}
                >
                  {category.name}
                </Button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  navigate("/a-propos");
                  setMobileMenuOpen(false);
                }}
              >
                À propos
              </Button>
            </div>
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate("/favoris");
                    setMobileMenuOpen(false);
                  }}
                  data-testid="button-favorites-mobile"
                >
                  <Heart className="h-5 w-5 mr-3" />
                  Favoris
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate("/panier");
                    setMobileMenuOpen(false);
                  }}
                  data-testid="button-cart-mobile"
                >
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  Panier {itemCount > 0 && `(${itemCount})`}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate("/compte");
                    setMobileMenuOpen(false);
                  }}
                  data-testid="button-account-mobile"
                >
                  <User className="h-5 w-5 mr-3" />
                  Mon compte
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  data-testid="button-logout-mobile"
                >
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate("/panier");
                    setMobileMenuOpen(false);
                  }}
                  data-testid="button-cart-guest-mobile"
                >
                  <ShoppingCart className="h-5 w-5 mr-3" />
                  Panier {itemCount > 0 && `(${itemCount})`}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigate("/connexion");
                    setMobileMenuOpen(false);
                  }}
                  data-testid="button-login-mobile"
                >
                  Connexion
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    navigate("/inscription");
                    setMobileMenuOpen(false);
                  }}
                  data-testid="button-register-mobile"
                >
                  Inscription
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
