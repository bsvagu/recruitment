import { useState } from "react";
import { Plus, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Email, InsertEmail } from "@/lib/types";

interface EmailEntry {
  id?: string;
  type: string;
  email: string;
  isPrimary: boolean;
  isVerified?: boolean;
}

interface EmailListProps {
  emails?: Email[];
  onChange?: (emails: Omit<InsertEmail, 'entityType' | 'entityId'>[]) => void;
  className?: string;
}

export default function EmailList({ emails = [], onChange, className }: EmailListProps) {
  const [emailList, setEmailList] = useState<EmailEntry[]>(
    emails.length > 0
      ? emails.map(email => ({
          id: email.id,
          type: email.type,
          email: email.email,
          isPrimary: email.isPrimary,
          isVerified: email.isVerified,
        }))
      : [{ type: 'work', email: '', isPrimary: true }]
  );

  const emailTypes = [
    { value: 'work', label: 'Work' },
    { value: 'personal', label: 'Personal' },
    { value: 'sales', label: 'Sales' },
    { value: 'support', label: 'Support' },
    { value: 'billing', label: 'Billing' },
    { value: 'other', label: 'Other' },
  ];

  const updateEmail = (index: number, field: keyof EmailEntry, value: any) => {
    const updated = [...emailList];
    updated[index] = { ...updated[index], [field]: value };

    // Ensure only one primary email
    if (field === 'isPrimary' && value) {
      updated.forEach((email, i) => {
        if (i !== index) {
          email.isPrimary = false;
        }
      });
    }

    setEmailList(updated);
    onChange?.(updated.filter(email => email.email.trim()));
  };

  const addEmail = () => {
    setEmailList([...emailList, { type: 'work', email: '', isPrimary: false }]);
  };

  const removeEmail = (index: number) => {
    const updated = emailList.filter((_, i) => i !== index);
    setEmailList(updated);
    onChange?.(updated.filter(email => email.email.trim()));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email Addresses
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 border border-gray-200 dark:border-gray-700 p-4">
        {emailList.map((emailEntry, index) => (
          <div key={index} className="flex items-center gap-3 p-3 border rounded-none" data-testid={`email-entry-${index}`}>
            <Select
              value={emailEntry.type}
              onValueChange={(value) => updateEmail(index, 'type', value)}
            >
              <SelectTrigger className="w-32" data-testid={`select-email-type-${index}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {emailTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="email"
              placeholder="email@example.com"
              value={emailEntry.email}
              onChange={(e) => updateEmail(index, 'email', e.target.value)}
              className="flex-1"
              data-testid={`input-email-${index}`}
            />

            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">Primary</div>
              <Switch
                checked={emailEntry.isPrimary}
                onCheckedChange={(checked) => updateEmail(index, 'isPrimary', checked)}
                data-testid={`switch-email-primary-${index}`}
              />
            </div>

            {emailEntry.isVerified && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Verified
              </Badge>
            )}

            {emailList.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeEmail(index)}
                className="text-destructive hover:text-destructive"
                data-testid={`button-remove-email-${index}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addEmail}
          className="w-full"
          data-testid="button-add-email"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Email
        </Button>
      </CardContent>
    </Card>
  );
}
