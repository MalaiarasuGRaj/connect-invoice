import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Archive, Search, Download, Trash2, Eye, Paperclip } from "lucide-react";
import type { InvoiceData } from "@/types/invoice";

interface InvoiceRepositoryProps {
  invoices: InvoiceData[];
  onView: (invoice: InvoiceData) => void;
  onDownload: (invoice: InvoiceData) => void;
  onDelete: (id: string) => void;
}

export default function InvoiceRepository({
  invoices,
  onView,
  onDownload,
  onDelete,
}: InvoiceRepositoryProps) {
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");

  const months = useMemo(() => {
    const set = new Set<string>();
    invoices.forEach((inv) => {
      if (inv.invoiceDate) {
        const d = new Date(inv.invoiceDate);
        set.add(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`);
      }
    });
    return Array.from(set).sort().reverse();
  }, [invoices]);

  const filtered = useMemo(() => {
    return invoices
      .filter((inv) => {
        const matchName = inv.trainerName.toLowerCase().includes(search.toLowerCase());
        const matchMonth =
          monthFilter === "all" ||
          (inv.invoiceDate && inv.invoiceDate.startsWith(monthFilter));
        return matchName && matchMonth;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [invoices, search, monthFilter]);

  return (
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
        {/* Filters */}
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
                  {new Date(m + "-01").toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Invoice List */}
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {invoices.length === 0
              ? "No invoices saved yet. Create your first invoice!"
              : "No matching invoices found."}
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filtered.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-card-hover transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{inv.trainerName}</p>
                    {inv.attachments.length > 0 && (
                      <Paperclip className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted-foreground">
                      {inv.invoiceNumber}
                    </span>
                    <span className="text-[11px] text-muted-foreground">•</span>
                    <span className="text-[11px] text-muted-foreground">
                      {inv.invoiceDate
                        ? new Date(inv.invoiceDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "No date"}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary whitespace-nowrap">
                  ₹{inv.grandTotal.toLocaleString("en-IN")}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => onView(inv)}
                    title="View"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => onDownload(inv)}
                    title="Download"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:text-destructive"
                    onClick={() => onDelete(inv.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
