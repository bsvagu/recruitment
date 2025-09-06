import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CompanyForm from "@/components/company-form";
import { useToast } from "@/hooks/use-toast";

export default function CompanyCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Success",
      description: "Company created successfully!",
    });
    setLocation("/companies");
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-4">
        <Link href="/companies">
          <Button variant="outline" size="sm" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
        </Link>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-none">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
              Create New Company
            </h1>
            <p className="text-muted-foreground">
              Add a new company to your recruitment database
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Fill in the company details below. All required fields are marked with an asterisk (*).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}