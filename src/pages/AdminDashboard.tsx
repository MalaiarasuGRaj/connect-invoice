import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useClerk } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import A4InvoiceTemplate from '@/components/A4InvoiceTemplate';
import InvoicePreview from '@/components/InvoicePreview';
import { createDefaultBillingRows } from '@/types/invoice';
import type { InvoiceData, BillingRow } from '@/types/invoice';
import {
  Archive, Search, Download, Trash2, Eye, LogOut, Settings,
  FileText, Loader2, ArrowLeft, Paperclip, X,
} from 'lucide-react';
import Logo from '@/components/Logo';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
interface DbInvoice {
  id: string;
  invoice_number: string;
  trainer_name: string;
  email: string;
  mobile: string;
  pan: string;
  invoice_date: string;
  project_name: string;
  subtotal: number;
  total: number;
  notes: string;
  created_at: string;
}

interface DbItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number | null;
  rate: number | null;
  total: number;
}

interface DbAttachment {
  id: string;
  invoice_id: string;
  file_name: string;
  file_url: string;
}

function dbToInvoice(inv: DbInvoice, items: DbItem[], attachments: DbAttachment[]): InvoiceData {
  const defaultRows = createDefaultBillingRows();
  const billingRows: BillingRow[] = defaultRows.map((defaultRow) => {
    const match = items.find((it) => it.description === defaultRow.description);
    if (match) {
      return { ...defaultRow, quantity: match.quantity, rate: match.rate, total: match.total };
    }
    return defaultRow;
  });

  return {
    id: inv.id,
    trainerName: inv.trainer_name,
    email: inv.email || '',
    mobile: inv.mobile || '',
    pan: inv.pan || '',
    invoiceNumber: inv.invoice_number,
    invoiceDate: inv.invoice_date || '',
    projectName: inv.project_name || '',
    billingRows,
    subtotal: inv.subtotal || 0,
    grandTotal: inv.total || 0,
    notes: inv.notes || '',
    attachments: attachments.map((a) => ({
      id: a.id,
      name: a.file_name,
      type: '',
      size: 0,
      dataUrl: a.file_url,
    })),
    createdAt: inv.created_at,
  };
}

export default function AdminDashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [viewInvoice, setViewInvoice] = useState<InvoiceData | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoaded && !user) {
      navigate('/admin/login');
    } else if (isLoaded && user) {
      fetchInvoices();
    }
  }, [isLoaded, user, navigate]);

  const fetchInvoices = async () => {
    setLoadingData(true);
    const { data: invData, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load invoices');
      setLoadingData(false);
      return;
    }

    const allInvoices: InvoiceData[] = [];
    for (const inv of invData || []) {
      const { data: items } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', inv.id);
      const { data: attachments } = await supabase
        .from('attachments')
        .select('*')
        .eq('invoice_id', inv.id);
      allInvoices.push(dbToInvoice(inv, items || [], attachments || []));
    }
    setInvoices(allInvoices);
    setLoadingData(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete invoice');
    } else {
      setInvoices((prev) => prev.filter((i) => i.id !== id));
      if (viewInvoice?.id === id) setViewInvoice(null);
      toast.success('Invoice deleted');
    }
  };

  const handleDownload = async () => {
    if (!previewRef.current || !viewInvoice) return;
    try {
      toast.loading('Generating PDF...');
      const canvas = await html2canvas(previewRef.current, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${viewInvoice.invoiceNumber}-${viewInvoice.trainerName}.pdf`);
      toast.dismiss();
      toast.success('PDF downloaded');
    } catch {
      toast.dismiss();
      toast.error('Failed to generate PDF');
    }
  };

  const months = useMemo(() => {
    const set = new Set<string>();
    invoices.forEach((inv) => {
      if (inv.invoiceDate) {
        const d = new Date(inv.invoiceDate);
        set.add(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`);
      }
    });
    return Array.from(set).sort().reverse();
  }, [invoices]);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchName = inv.trainerName.toLowerCase().includes(search.toLowerCase());
      const matchMonth = monthFilter === 'all' || (inv.invoiceDate && inv.invoiceDate.startsWith(monthFilter));
      return matchName && matchMonth;
    });
  }, [invoices, search, monthFilter]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-header sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <h1 className="text-lg font-bold text-primary-foreground tracking-tight">
                Invoice Repository
              </h1>
              <p className="text-[11px] text-primary-foreground/70">
                Manage Invoices
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 text-xs"
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Invoice Form
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 text-xs"
              onClick={() => navigate('/admin/settings')}
            >
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left - Repository */}
          <div>
            <Card className="shadow-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Archive className="h-4 w-4 text-primary" />
                  Invoice Repository
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    {invoices.length} invoices
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search by trainer name..."
                      className="pl-8 h-9 text-xs"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={monthFilter} onValueChange={setMonthFilter}>
                    <SelectTrigger className="w-36 h-9 text-xs">
                      <SelectValue placeholder="All months" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All months</SelectItem>
                      {months.map((m) => (
                        <SelectItem key={m} value={m}>
                          {new Date(m + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {loadingData ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    {invoices.length === 0 ? 'No invoices yet.' : 'No matching invoices found.'}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                    {filtered.map((inv) => (
                      <div
                        key={inv.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-card-hover transition-shadow cursor-pointer ${viewInvoice?.id === inv.id ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setViewInvoice(inv)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{inv.trainerName}</p>
                            {inv.attachments.length > 0 && (
                              <Paperclip className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-muted-foreground">{inv.invoiceNumber}</span>
                            <span className="text-[11px] text-muted-foreground">•</span>
                            <span className="text-[11px] text-muted-foreground">
                              {inv.invoiceDate
                                ? new Date(inv.invoiceDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                : 'No date'}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-primary whitespace-nowrap">
                          ₹{inv.grandTotal.toLocaleString('en-IN')}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); setViewInvoice(inv); }} title="View">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(inv.id); }} title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right - Preview */}
          <div>
            {viewInvoice ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Invoice Preview
                  </h2>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleDownload}>
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download PDF
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setViewInvoice(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="overflow-auto max-h-[750px] rounded-lg border bg-muted/30 p-4">
                  <InvoicePreview>
                    <A4InvoiceTemplate ref={previewRef} data={viewInvoice} />
                  </InvoicePreview>
                </div>

                {/* Attachments */}
                {viewInvoice.attachments.length > 0 && (
                  <Card className="shadow-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-primary" />
                        Attachments ({viewInvoice.attachments.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {viewInvoice.attachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.dataUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-primary hover:underline"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          {att.name}
                        </a>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-muted-foreground text-sm">
                Select an invoice from the list to preview
              </div>
            )}
          </div>
        </div>
      </main>
    </div >
  );
}
