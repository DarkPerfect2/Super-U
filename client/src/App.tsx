import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Confirmation from "@/pages/confirmation";
import Account from "@/pages/account";
import Favorites from "@/pages/favorites";
import About from "@/pages/about";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/produits" component={Products} />
      <Route path="/produits/:id" component={ProductDetail} />
      <Route path="/categories/:slug" component={Products} />
      <Route path="/connexion" component={Login} />
      <Route path="/inscription" component={Register} />
      <Route path="/panier" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/confirmation/:id" component={Confirmation} />
      <Route path="/compte" component={Account} />
      <Route path="/favoris" component={Favorites} />
      <Route path="/a-propos" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to top when location changes
    window.scrollTo(0, 0);
    // Save scroll position for back navigation
    sessionStorage.setItem(`scroll_${location}`, '0');
  }, [location]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <ScrollToTop />
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
