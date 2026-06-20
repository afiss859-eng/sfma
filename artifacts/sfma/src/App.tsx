import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Apply from "@/pages/Apply";
import Chat from "@/pages/Chat";
import Dashboard from "@/pages/Dashboard";
import Members from "@/pages/Members";
import Profile from "@/pages/Profile";
import MemberCard from "@/pages/MemberCard";
import Polls from "@/pages/Polls";
import Events from "@/pages/Events";
import Gallery from "@/pages/Gallery";
import Admin from "@/pages/Admin";
import ProfileEdit from "@/pages/ProfileEdit";
import NotFound from "@/pages/not-found";
import { useLocation } from "wouter";

// Configure auth token getter for API client
setAuthTokenGetter(() => localStorage.getItem("sfma_token"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  if (!user) {
    setLocation("/login");
    return null;
  }
  return <Component />;
}

function LordRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLord } = useAuth();
  const [, setLocation] = useLocation();
  if (!user) { setLocation("/login"); return null; }
  if (!isLord) { setLocation("/chat"); return null; }
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/apply" component={Apply} />
      <Route path="/profile/:id" component={Profile} />
      <Route path="/chat">
        {() => <ProtectedRoute component={Chat} />}
      </Route>
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/members">
        {() => <ProtectedRoute component={Members} />}
      </Route>
      <Route path="/card">
        {() => <ProtectedRoute component={MemberCard} />}
      </Route>
      <Route path="/polls">
        {() => <ProtectedRoute component={Polls} />}
      </Route>
      <Route path="/events">
        {() => <ProtectedRoute component={Events} />}
      </Route>
      <Route path="/gallery">
        {() => <ProtectedRoute component={Gallery} />}
      </Route>
      <Route path="/admin">
        {() => <LordRoute component={Admin} />}
      </Route>
      <Route path="/profile-edit">
        {() => <ProtectedRoute component={ProfileEdit} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
