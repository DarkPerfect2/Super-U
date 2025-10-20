import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Filter, Grid3x3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/products/product-card";
import { ProductListItem } from "@/components/products/product-list-item";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import type { Product, Category } from "@shared/schema";

interface ProductsResponse {
  results: Product[];
  count: number;
  next: string | null;
  previous: string | null;
}

export default function Products() {
  const [, navigate] = useLocation();
  const [categoryRoute] = useRoute("/categories/:slug");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  // Get category slug from URL route parameter or search params
  const categorySlug = categoryRoute ? categoryRoute.slug : "";
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Build API URL with proper parameters
  const buildProductsUrl = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (categorySlug) params.append("category", categorySlug);
    params.append("sort", sortBy);
    if (page > 1) params.append("page", page.toString());
    return `/api/products${params.toString() ? "?" + params.toString() : ""}`;
  };

  const { data: productsData, isLoading } = useQuery<ProductsResponse>({
    queryKey: ["/api/products", searchQuery, categorySlug, sortBy, page],
    queryFn: () => apiRequest("GET", buildProductsUrl()),
  });

  const currentCategory = categories?.find(c => c.slug === categorySlug);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <a href="/" className="hover:text-foreground">Accueil</a>
          <span>/</span>
          {currentCategory ? (
            <>
              <span>Catégories</span>
              <span>/</span>
              <span className="text-foreground font-medium">{currentCategory.name}</span>
            </>
          ) : searchQuery ? (
            <>
              <span>Recherche</span>
              <span>/</span>
              <span className="text-foreground font-medium">"{searchQuery}"</span>
            </>
          ) : (
            <span className="text-foreground font-medium">Tous les produits</span>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-2">
            {currentCategory?.name || (searchQuery ? `Résultats pour "${searchQuery}"` : "Tous les produits")}
          </h1>
          <p className="text-muted-foreground">
            {productsData?.count || 0} produit{(productsData?.count || 0) > 1 ? 's' : ''} disponible{(productsData?.count || 0) > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]" data-testid="select-sort">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Plus récents</SelectItem>
              <SelectItem value="price_asc">Prix croissant</SelectItem>
              <SelectItem value="price_desc">Prix décroissant</SelectItem>
              <SelectItem value="popular">Plus populaires</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="hidden md:flex items-center gap-1 border border-border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
              data-testid="button-view-grid"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
              data-testid="button-view-list"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products */}
      {isLoading ? (
        <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6" : "space-y-4"}>
          {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : productsData && productsData.results.length > 0 ? (
        <>
          <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6" : "space-y-4"}>
            {productsData.results.map((product) => (
              viewMode === "grid" ? (
                <ProductCard key={product.id} product={product} />
              ) : (
                <ProductListItem key={product.id} product={product} />
              )
            ))}
          </div>

          {/* Pagination */}
          {productsData.count > 20 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <Button
                variant="outline"
                disabled={!productsData.previous}
                onClick={() => setPage(p => p - 1)}
                data-testid="button-prev-page"
              >
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Page {page} sur {Math.ceil(productsData.count / 20)}
              </span>
              <Button
                variant="outline"
                disabled={!productsData.next}
                onClick={() => setPage(p => p + 1)}
                data-testid="button-next-page"
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-4">
            Aucun produit trouvé
          </p>
          <Button variant="outline" asChild>
            <a href="/">Retour à l'accueil</a>
          </Button>
        </div>
      )}
    </div>
  );
}
