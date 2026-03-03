import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileDown, Save, RotateCcw, FileText, Shield } from "lucide-react";
import InvoiceForm from "@/components/InvoiceForm";
import InvoicePreview from "@/components/InvoicePreview";
import type { InvoiceData } from "@/types/invoice";
import { createDefaultBillingRows, generateInvoiceNumber } from "@/types/invoice";
import { supabase } from "@/lib/supabase";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function createBlankInvoice(): InvoiceData {
  return {
    id: crypto.randomUUID(),
    trainerName: "",
    email: "",
    mobile: "",
    pan: "",
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date().toISOString().split("T")[0],
    projectName: "",
    billingRows: createDefaultBillingRows(),
    subtotal: 0,
    grandTotal: 0,
    notes: "",
    attachments: [],
    createdAt: new Date().toISOString(),
  };
}

export default function Index() {
  const [invoice, setInvoice] = useState<InvoiceData>(createBlankInvoice);
  const [saving, setSaving] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleClear = useCallback(() => {
    setInvoice(createBlankInvoice());
    toast.success("Form cleared");
  }, []);

  const handleSave = useCallback(async () => {
    if (!invoice.trainerName.trim()) {
      toast.error("Trainer name is required");
      return;
    }
    setSaving(true);
    try {
      // Insert invoice
      const { data: invData, error: invError } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoice.invoiceNumber,
          trainer_name: invoice.trainerName,
          email: invoice.email,
          mobile: invoice.mobile,
          pan: invoice.pan,
          invoice_date: invoice.invoiceDate || null,
          project_name: invoice.projectName,
          subtotal: invoice.subtotal,
          total: invoice.grandTotal,
          notes: invoice.notes,
        })
        .select("id")
        .single();

      if (invError) throw invError;
      const invoiceId = invData.id;

      // Insert billing items
      const items = invoice.billingRows
        .filter((r) => !r.isAttachRow)
        .map((r) => ({
          invoice_id: invoiceId,
          description: r.description,
          quantity: r.quantity,
          rate: r.rate,
          total: r.total,
        }));

      if (items.length > 0) {
        const { error: itemsError } = await supabase.from("invoice_items").insert(items);
        if (itemsError) throw itemsError;
      }

      // Upload attachments
      for (const att of invoice.attachments) {
        const filePath = `${invoiceId}/${att.id}-${att.name}`;
        // Convert dataUrl to blob
        const res = await fetch(att.dataUrl);
        const blob = await res.blob();
        
        const { error: uploadError } = await supabase.storage
          .from("invoice-attachments")
          .upload(filePath, blob);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("invoice-attachments")
          .getPublicUrl(filePath);

        await supabase.from("attachments").insert({
          invoice_id: invoiceId,
          file_name: att.name,
          file_url: urlData.publicUrl,
        });
      }

      setInvoice(createBlankInvoice());
      toast.success("Invoice saved successfully!");
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error("Failed to save invoice: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  }, [invoice]);

  const handleDownload = useCallback(async () => {
    if (!invoice.trainerName.trim()) {
      toast.error("Trainer name is required to download");
      return;
    }
    if (!previewRef.current) return;

    try {
      toast.loading("Generating PDF...");
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoice.invoiceNumber}-${invoice.trainerName}.pdf`);
      toast.dismiss();
      toast.success("PDF downloaded");
    } catch {
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  }, [invoice]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-header sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary-foreground tracking-tight">
                Trainer Invoice Manager
              </h1>
              <p className="text-[11px] text-primary-foreground/70">
                CONNECT Training Solutions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 text-xs"
              onClick={() => navigate("/admin/login")}
            >
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Admin
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left - Form */}
          <div className="space-y-5">
            <InvoiceForm data={invoice} onChange={setInvoice} />
          </div>

          {/* Right - Preview */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Live Preview
            </h2>
            <div className="overflow-auto max-h-[700px] rounded-lg border">
              <InvoicePreview ref={previewRef} data={invoice} />
            </div>

            {/* Action Buttons - Under Preview */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={handleClear}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Clear Form
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                {saving ? "Saving..." : "Save Invoice"}
              </Button>
              <Button
                size="sm"
                className="text-xs"
                onClick={handleDownload}
              >
                <FileDown className="h-3.5 w-3.5 mr-1.5" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
