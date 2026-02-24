import { useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Building2,
  FileText,
  Table,
  Paperclip,
  StickyNote,
  Upload,
  X,
} from "lucide-react";
import type { InvoiceData, Attachment } from "@/types/invoice";
import { COMPANY } from "@/types/invoice";

interface InvoiceFormProps {
  data: InvoiceData;
  onChange: (data: InvoiceData) => void;
}

export default function InvoiceForm({ data, onChange }: InvoiceFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = useCallback(
    (partial: Partial<InvoiceData>) => {
      onChange({ ...data, ...partial });
    },
    [data, onChange]
  );

  const updateBillingRow = useCallback(
    (index: number, field: "quantity" | "rate", value: number) => {
      const rows = [...data.billingRows];
      const row = { ...rows[index] };
      if (field === "quantity") row.quantity = value;
      if (field === "rate") row.rate = value;
      row.total = (row.quantity ?? 0) * (row.rate ?? 0);
      rows[index] = row;
      const subtotal = rows.reduce((sum, r) => sum + r.total, 0);
      onChange({ ...data, billingRows: rows, subtotal, grandTotal: subtotal });
    },
    [data, onChange]
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const attachment: Attachment = {
            id: crypto.randomUUID(),
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: reader.result as string,
          };
          onChange({
            ...data,
            attachments: [...data.attachments, attachment],
          });
        };
        reader.readAsDataURL(file);
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [data, onChange]
  );

  const removeAttachment = useCallback(
    (id: string) => {
      onChange({
        ...data,
        attachments: data.attachments.filter((a) => a.id !== id),
      });
    },
    [data, onChange]
  );

  return (
    <div className="space-y-5">
      {/* Trainer Information */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <User className="h-4 w-4 text-primary" />
            Trainer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="trainerName" className="text-xs font-medium text-muted-foreground">
                Trainer Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="trainerName"
                placeholder="Enter trainer name"
                value={data.trainerName}
                onChange={(e) => update({ trainerName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="trainer@example.com"
                value={data.email}
                onChange={(e) => update({ email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mobile" className="text-xs font-medium text-muted-foreground">
                Mobile Number
              </Label>
              <Input
                id="mobile"
                placeholder="+91 XXXXX XXXXX"
                value={data.mobile}
                onChange={(e) => update({ mobile: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pan" className="text-xs font-medium text-muted-foreground">
                PAN Number
              </Label>
              <Input
                id="pan"
                placeholder="ABCDE1234F"
                value={data.pan}
                onChange={(e) => update({ pan: e.target.value.toUpperCase() })}
                maxLength={10}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Details (Fixed) */}
      <Card className="shadow-card border-primary/20 bg-accent/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Building2 className="h-4 w-4 text-primary" />
            Company Details
            <Badge variant="secondary" className="text-[10px] ml-auto">
              Read Only
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p className="font-medium text-foreground">{COMPANY.name}</p>
            <p>{COMPANY.address}</p>
            <p>{COMPANY.contact}</p>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Details */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Invoice Number</Label>
              <Input value={data.invoiceNumber} disabled className="bg-muted/50" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invoiceDate" className="text-xs font-medium text-muted-foreground">
                Invoice Date
              </Label>
              <Input
                id="invoiceDate"
                type="date"
                value={data.invoiceDate}
                onChange={(e) => update({ invoiceDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="projectName" className="text-xs font-medium text-muted-foreground">
              Project / Training Name
            </Label>
            <Input
              id="projectName"
              placeholder="Eg: Soft Skill Training"
              value={data.projectName}
              onChange={(e) => update({ projectName: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Billing Details */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Table className="h-4 w-4 text-primary" />
            Billing Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left p-2 font-medium text-muted-foreground text-xs">
                    Description
                  </th>
                  <th className="text-center p-2 font-medium text-muted-foreground text-xs w-24">
                    Qty / Days
                  </th>
                  <th className="text-center p-2 font-medium text-muted-foreground text-xs w-28">
                    Rate (₹)
                  </th>
                  <th className="text-right p-2 font-medium text-muted-foreground text-xs w-28">
                    Total (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.billingRows.map((row, i) => (
                  <tr key={row.id} className="border-b last:border-0">
                    <td className="p-2 text-xs text-foreground/80">{row.description}</td>
                    <td className="p-2">
                      {row.editable.quantity ? (
                        <Input
                          type="number"
                          min={0}
                          className="h-8 text-center text-xs"
                          value={row.quantity ?? ""}
                          onChange={(e) =>
                            updateBillingRow(i, "quantity", Number(e.target.value) || 0)
                          }
                        />
                      ) : (
                        <span className="block text-center text-xs text-muted-foreground">
                          {row.isAttachRow ? "—" : "N/A"}
                        </span>
                      )}
                    </td>
                    <td className="p-2">
                      {row.editable.rate ? (
                        <Input
                          type="number"
                          min={0}
                          className="h-8 text-center text-xs"
                          value={row.rate ?? ""}
                          onChange={(e) =>
                            updateBillingRow(i, "rate", Number(e.target.value) || 0)
                          }
                        />
                      ) : (
                        <span className="block text-center text-xs text-muted-foreground">
                          {row.isAttachRow ? "—" : row.rate !== null ? `₹${row.rate}` : "N/A"}
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-right text-xs font-medium">
                      {row.total > 0 ? `₹${row.total.toLocaleString("en-IN")}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Separator className="my-3" />
          <div className="flex justify-end">
            <div className="text-right space-y-1">
              <p className="text-sm text-muted-foreground">
                Subtotal:{" "}
                <span className="font-semibold text-foreground">
                  ₹{data.subtotal.toLocaleString("en-IN")}
                </span>
              </p>
              <p className="text-base font-bold text-primary">
                Grand Total: ₹{data.grandTotal.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attachments */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Paperclip className="h-4 w-4 text-primary" />
            Attachments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-primary/50" />
            <p className="text-sm text-muted-foreground">
              Click to upload bills (PDF, images, documents)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
          {data.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {data.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between bg-muted/50 rounded-md px-3 py-2"
                >
                  <span className="text-xs truncate max-w-[200px]">{att.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeAttachment(att.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <StickyNote className="h-4 w-4 text-primary" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Optional notes for the invoice..."
            rows={3}
            value={data.notes}
            onChange={(e) => update({ notes: e.target.value })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
