import { Link, useLocation } from "wouter";
import { ReactNode } from "react";
import { Building, Users, Briefcase, BarChart3, PieChart, Settings, UserCog, Search, Bell, Menu, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="min-h-screen bg-gray-50">
      {/* Swigify-style Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                type="text" 
                placeholder="Search for customer, Name & ID"
                className="w-64 pl-10 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
                data-testid="input-global-search"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 rounded-full" data-testid="button-notifications">
              <Bell className="h-5 w-5 text-gray-600" />
            </Button>
            
            <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-full">
              <Settings className="h-5 w-5 text-gray-600" />
            </Button>
            
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-sm font-medium bg-blue-500 text-white">JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex flex-col w-64 bg-blue-600 shadow-xl">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-2">
                  <div className="text-white text-2xl font-bold">S</div>
                  <span className="text-white text-lg font-semibold">RecruitPortal</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="text-white hover:bg-blue-700">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarContent 
                  location={location} 
                  navigationItems={navigationItems} 
                  analyticsItems={analyticsItems} 
                  adminItems={adminItems} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar - Swigify Style */}
        <aside className="hidden lg:flex w-64 bg-blue-600 h-[calc(100vh-4rem)] sticky top-16">
          <div className="flex-1 overflow-y-auto">
            {/* Logo */}
            <div className="p-6 pb-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">R</span>
                </div>
                <span className="text-white text-xl font-semibold">RecruitPortal</span>
              </div>
            </div>
            
            <SidebarContent 
              location={location} 
              navigationItems={navigationItems} 
              analyticsItems={analyticsItems} 
              adminItems={adminItems} 
            />
          </div>
        </aside>

        {/* Main Content - Swigify Style */}
        <main className="flex-1 bg-white">
          <div className="p-6 max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Swigify-style sidebar content
function SidebarContent({ location, navigationItems, analyticsItems, adminItems }: {
  location: string;
  navigationItems: any[];
  analyticsItems: any[];
  adminItems: any[];
}) {
  return (
    <div className="px-4 space-y-2">
      {/* Navigation Items */}
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
        
        return (
          <Link 
            key={item.path} 
            href={item.path} 
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group text-sm font-medium",
              isActive 
                ? 'bg-blue-700 text-white' 
                : 'text-blue-100 hover:bg-blue-700 hover:text-white'
            )} 
            data-testid={`link-${item.label.toLowerCase()}`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
      
      {/* Analytics Items */}
      {analyticsItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
        
        return (
          <Link 
            key={item.path} 
            href={item.path} 
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group text-sm font-medium",
              isActive 
                ? 'bg-blue-700 text-white' 
                : 'text-blue-100 hover:bg-blue-700 hover:text-white'
            )} 
            data-testid={`link-${item.label.toLowerCase()}`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
      
      {/* Admin Items */}
      {adminItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.path || (item.path !== '/' && location.startsWith(item.path));
        
        return (
          <Link 
            key={item.path} 
            href={item.path} 
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group text-sm font-medium",
              isActive 
                ? 'bg-blue-700 text-white' 
                : 'text-blue-100 hover:bg-blue-700 hover:text-white'
            )} 
            data-testid={`link-${item.label.toLowerCase().replace(' ', '-')}`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
