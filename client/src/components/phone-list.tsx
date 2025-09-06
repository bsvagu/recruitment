import { useState } from "react";
import { Plus, Trash2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Phone as PhoneType, InsertPhone } from "@/lib/types";

interface PhoneEntry {
  id?: string;
  type: string;
  phone: string;
  isPrimary: boolean;
  isVerified?: boolean;
}

interface PhoneListProps {
  phones?: PhoneType[];
  onChange?: (phones: Omit<InsertPhone, 'entityType' | 'entityId'>[]) => void;
  className?: string;
}

export default function PhoneList({ phones = [], onChange, className }: PhoneListProps) {
  const [phoneList, setPhoneList] = useState<PhoneEntry[]>(
    phones.length > 0
      ? phones.map(phone => ({
          id: phone.id,
          type: phone.type,
          phone: phone.phone,
          isPrimary: phone.isPrimary,
          isVerified: phone.isVerified,
        }))
      : [{ type: 'work', phone: '', isPrimary: true }]
  );

  const phoneTypes = [
    { value: 'work', label: 'Work' },
    { value: 'personal', label: 'Personal' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'fax', label: 'Fax' },
    { value: 'other', label: 'Other' },
  ];

  const updatePhone = (index: number, field: keyof PhoneEntry, value: any) => {
    const updated = [...phoneList];
    updated[index] = { ...updated[index], [field]: value };

    // Ensure only one primary phone
    if (field === 'isPrimary' && value) {
      updated.forEach((phone, i) => {
        if (i !== index) {
          phone.isPrimary = false;
        }
      });
    }

    setPhoneList(updated);
    onChange?.(updated.filter(phone => phone.phone.trim()));
  };

  const addPhone = () => {
    setPhoneList([...phoneList, { type: 'work', phone: '', isPrimary: false }]);
  };

  const removePhone = (index: number) => {
    const updated = phoneList.filter((_, i) => i !== index);
    setPhoneList(updated);
    onChange?.(updated.filter(phone => phone.phone.trim()));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Phone Numbers
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {phoneList.map((phoneEntry, index) => (
          <div key={index} className="flex items-center gap-3 p-3 border rounded-none" data-testid={`phone-entry-${index}`}>
            <Select
              value={phoneEntry.type}
              onValueChange={(value) => updatePhone(index, 'type', value)}
            >
              <SelectTrigger className="w-32" data-testid={`select-phone-type-${index}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {phoneTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phoneEntry.phone}
              onChange={(e) => updatePhone(index, 'phone', e.target.value)}
              className="flex-1"
              data-testid={`input-phone-${index}`}
            />

            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">Primary</div>
              <Switch
                checked={phoneEntry.isPrimary}
                onCheckedChange={(checked) => updatePhone(index, 'isPrimary', checked)}
                data-testid={`switch-phone-primary-${index}`}
              />
            </div>

            {phoneEntry.isVerified && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Verified
              </Badge>
            )}

            {phoneList.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removePhone(index)}
                className="text-destructive hover:text-destructive"
                data-testid={`button-remove-phone-${index}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addPhone}
          className="w-full"
          data-testid="button-add-phone"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Phone
        </Button>
      </CardContent>
    </Card>
  );
}
