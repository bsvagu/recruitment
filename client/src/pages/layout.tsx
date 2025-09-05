import { Link, useLocation } from "wouter";
import { ReactNode } from "react";
import { Building, Users, Briefcase, BarChart3, PieChart, Settings, UserCog, Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navigationItems = [
    { path: "/companies", label: "Companies", icon: Building, count: 247 },
    { path: "/contacts", label: "Contacts", icon: Users, count: 1432 },
    { path: "/jobs", label: "Jobs", icon: Briefcase, count: 89 },
  ];

  const analyticsItems = [
    { path: "/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/reports", label: "Reports", icon: BarChart3 },
    { path: "/insights", label: "Insights", icon: PieChart },
  ];

  const adminItems = [
    { path: "/settings", label: "Settings", icon: Settings },
    { path: "/user-management", label: "User Management", icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                <Building className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">RecruitPortal</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/companies" className={`text-sm font-medium transition-colors pb-4 -mb-px ${
                location.startsWith('/companies') 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
                Companies
              </Link>
              <Link href="/contacts" className={`text-sm font-medium transition-colors pb-4 -mb-px ${
                location.startsWith('/contacts') 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
                Contacts
              </Link>
              <Link href="/analytics" className={`text-sm font-medium transition-colors pb-4 -mb-px ${
                location.startsWith('/analytics') 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
                Analytics
              </Link>
              <Link href="/reports" className={`text-sm font-medium transition-colors pb-4 -mb-px ${
                location.startsWith('/reports') 
                  ? 'text-primary border-b-2 border-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
                Reports
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Global search..."
                className="w-64 pl-10"
                data-testid="input-global-search"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center bg-destructive text-destructive-foreground">
                3
              </Badge>
            </Button>
            
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-sm font-medium">JD</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium" data-testid="text-user-name">John Doe</div>
                <div className="text-xs text-muted-foreground">Admin</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card h-[calc(100vh-4rem)] sticky top-16">
          <div className="p-4 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Management
            </div>
            
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
              
              return (
                <Link key={item.path} href={item.path} className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`} data-testid={`link-${item.label.toLowerCase()}`}>
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.count && (
                    <Badge 
                      variant={isActive ? "default" : "secondary"} 
                      className={`ml-auto text-xs ${isActive ? 'bg-primary text-primary-foreground' : ''}`}
                      data-testid={`badge-${item.label.toLowerCase()}-count`}
                    >
                      {item.count}
                    </Badge>
                  )}
                </Link>
              );
            })}
            
            <div className="pt-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Analytics
              </div>
              
              {analyticsItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
                
                return (
                  <Link key={item.path} href={item.path} className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`} data-testid={`link-${item.label.toLowerCase()}`}>
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
            
            <div className="pt-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Admin
              </div>
              
              {adminItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
                
                return (
                  <Link key={item.path} href={item.path} className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`} data-testid={`link-${item.label.toLowerCase().replace(' ', '-')}`}>
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
