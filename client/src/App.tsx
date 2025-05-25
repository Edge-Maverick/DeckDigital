import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import ShopPage from "@/pages/ShopPage";
import OpenPackPage from "@/pages/OpenPackPage";
import CollectionPage from "@/pages/CollectionPage";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "@/hooks/use-theme-provider";
import { CollectionProvider } from "@/hooks/use-collection";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={ShopPage} />
        <Route path="/open-pack" component={OpenPackPage} />
        <Route path="/collection" component={CollectionPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <CollectionProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CollectionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
