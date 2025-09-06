import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/pages/layout";
import Companies from "@/pages/companies";
import CompanyCreate from "@/pages/company-create";
import CompanyEdit from "@/pages/company-edit";
import CompanyOverview from "@/pages/company-overview";
import Contacts from "@/pages/contacts";
import ContactCreate from "@/pages/contact-create";
import Jobs from "@/pages/jobs";
import Analytics from "@/pages/analytics";
import Reports from "@/pages/reports";
import Insights from "@/pages/insights";
import CompanyDetail from "@/pages/company-detail";
import ContactDetail from "@/pages/contact-detail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Companies} />
        <Route path="/companies" component={Companies} />
        <Route path="/companies/create" component={CompanyCreate} />
        <Route path="/companies/:id/edit" component={CompanyEdit} />
        <Route path="/companies/:id/overview" component={CompanyOverview} />
        <Route path="/companies/:id" component={CompanyDetail} />
        <Route path="/contacts" component={Contacts} />
        <Route path="/contacts/create" component={ContactCreate} />
        <Route path="/contacts/:id" component={ContactDetail} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/reports" component={Reports} />
        <Route path="/insights" component={Insights} />
        <Route path="/settings" component={() => <div className="p-8 text-center text-muted-foreground">Settings feature coming soon</div>} />
        <Route path="/user-management" component={() => <div className="p-8 text-center text-muted-foreground">User Management feature coming soon</div>} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
