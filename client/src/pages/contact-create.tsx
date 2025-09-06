import { Link, useLocation } from "wouter";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ContactForm from "@/components/contact-form";
import { useToast } from "@/hooks/use-toast";

export default function ContactCreate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Success",
      description: "Contact created successfully!",
    });
    setLocation("/contacts");
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-4">
        <Link href="/contacts">
          <Button variant="outline" size="sm" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contacts
          </Button>
        </Link>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-none">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">
              Create Contact
            </h1>
            <p className="text-muted-foreground">
              Add a new contact to your professional network
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            Add the contact details below. All required fields are marked with an asterisk (*).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </div>
  );
}