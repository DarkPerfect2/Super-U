import { Switch, Route } from "wouter";
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
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
