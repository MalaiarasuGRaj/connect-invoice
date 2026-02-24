import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileDown, Save, RotateCcw, FileText } from "lucide-react";
import InvoiceForm from "@/components/InvoiceForm";
import InvoicePreview from "@/components/InvoicePreview";
import InvoiceRepository from "@/components/InvoiceRepository";
import type { InvoiceData } from "@/types/invoice";
import { createDefaultBillingRows, generateInvoiceNumber } from "@/types/invoice";
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

const STORAGE_KEY = "trainer-invoices";

function loadInvoices(): InvoiceData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveInvoices(invoices: InvoiceData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

export default function Index() {
  const [invoice, setInvoice] = useState<InvoiceData>(createBlankInvoice);
  const [invoices, setInvoices] = useState<InvoiceData[]>(loadInvoices);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveInvoices(invoices);
  }, [invoices]);

  const handleClear = useCallback(() => {
    setInvoice(createBlankInvoice());
    toast.success("Form cleared");
  }, []);

  const handleSave = useCallback(() => {
    if (!invoice.trainerName.trim()) {
      toast.error("Trainer name is required");
      return;
    }
    const saved = { ...invoice, createdAt: new Date().toISOString() };
    setInvoices((prev) => [saved, ...prev]);
    setInvoice(createBlankInvoice());
    toast.success("Invoice saved to repository");
  }, [invoice]);

  const handleDownload = useCallback(
    async (inv?: InvoiceData) => {
      const target = inv || invoice;
      if (!target.trainerName.trim()) {
        toast.error("Trainer name is required to download");
        return;
      }

      // If downloading a repo invoice, temporarily render it
      if (inv) {
        setInvoice(inv);
        await new Promise((r) => setTimeout(r, 100));
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
        pdf.save(`${target.invoiceNumber}-${target.trainerName}.pdf`);
        toast.dismiss();
        toast.success("PDF downloaded");
      } catch {
        toast.dismiss();
        toast.error("Failed to generate PDF");
      }
    },
    [invoice]
  );

  const handleView = useCallback((inv: InvoiceData) => {
    setInvoice(inv);
    toast.info("Invoice loaded into preview");
  }, []);

  const handleDelete = useCallback((id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    toast.success("Invoice deleted");
  }, []);

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
              onClick={handleClear}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 text-xs"
              onClick={handleSave}
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save
            </Button>
            <Button
              size="sm"
              className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground text-xs border-0"
              onClick={() => handleDownload()}
            >
              <FileDown className="h-3.5 w-3.5 mr-1.5" />
              Download PDF
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

          {/* Right - Preview + Repository */}
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Live Preview
              </h2>
              <div className="overflow-auto max-h-[700px] rounded-lg border">
                <InvoicePreview ref={previewRef} data={invoice} />
              </div>
            </div>

            <InvoiceRepository
              invoices={invoices}
              onView={handleView}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
