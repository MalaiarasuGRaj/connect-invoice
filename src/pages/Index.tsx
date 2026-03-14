import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileDown, RotateCcw, Archive } from "lucide-react";
import Logo from "@/components/Logo";
import InvoiceForm from "@/components/InvoiceForm";
import A4InvoiceTemplate from "@/components/A4InvoiceTemplate";
import InvoicePreview from "@/components/InvoicePreview";
import type { InvoiceData } from "@/types/invoice";
import { createDefaultBillingRows, generateInvoiceNumber } from "@/types/invoice";
import { supabase } from "@/lib/supabase";
import { generatePDF } from "@/lib/generatePdf";


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
  const previewRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleClear = useCallback(() => {
    setInvoice(createBlankInvoice());
    toast.success("Form cleared");
  }, []);


  const handleDownload = useCallback(async () => {
    if (!invoice.trainerName.trim()) {
      toast.error("Trainer name is required to download");
      return;
    }
    if (!previewRef.current) return;

    try {
      // Auto-save first
      toast.loading("Saving invoice...");
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

      if (invError) {
        console.error("Auto-save error:", invError);
        throw new Error("Could not save to database: " + invError.message);
      }

      const invoiceId = invData.id;
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

      toast.dismiss();
      toast.loading("Generating PDF...");
      await generatePDF(
        previewRef.current,
        `${invoice.invoiceNumber}-${invoice.trainerName}.pdf`
      );
      toast.dismiss();
      toast.success("Invoice saved and PDF downloaded");
    } catch (err: any) {
      toast.dismiss();
      console.error("Download/Save error:", err);
      toast.error("Process failed: " + (err.message || "Unknown error"));
    }
  }, [invoice]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-header sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
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
              onClick={() => navigate("/admin")}
            >
              <Archive className="h-3.5 w-3.5 mr-1.5" />
              Repository
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
            <div className="overflow-auto max-h-[750px] rounded-lg border bg-muted/30 p-4">
              <InvoicePreview>
                <A4InvoiceTemplate ref={previewRef} data={invoice} />
              </InvoicePreview>
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
