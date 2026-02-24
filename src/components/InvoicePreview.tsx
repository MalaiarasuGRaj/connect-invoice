import { forwardRef } from "react";
import type { InvoiceData } from "@/types/invoice";
import { COMPANY } from "@/types/invoice";
import { Paperclip } from "lucide-react";

interface InvoicePreviewProps {
  data: InvoiceData;
}

const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-[white] text-[#1a1a2e] p-8 rounded-lg shadow-elevated max-w-[210mm] mx-auto"
        style={{ fontFamily: "'Inter', sans-serif", minHeight: "297mm" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: "hsl(262,83%,58%)" }}>
              INVOICE
            </h1>
            <p className="text-xs mt-1" style={{ color: "#6b7280" }}>
              {data.invoiceNumber}
            </p>
          </div>
          <div className="text-right text-xs" style={{ color: "#6b7280" }}>
            <p>
              Date:{" "}
              <span className="font-medium" style={{ color: "#1a1a2e" }}>
                {data.invoiceDate
                  ? new Date(data.invoiceDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </p>
            {data.projectName && (
              <p className="mt-0.5">
                Project:{" "}
                <span className="font-medium" style={{ color: "#1a1a2e" }}>
                  {data.projectName}
                </span>
              </p>
            )}
          </div>
        </div>

        <div
          className="w-full h-[2px] mb-6"
          style={{ background: "linear-gradient(to right, hsl(262,83%,58%), hsl(280,80%,65%))" }}
        />

        {/* From & To */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: "hsl(262,83%,58%)" }}>
              From
            </p>
            <p className="font-semibold text-sm">{data.trainerName || "Trainer Name"}</p>
            {data.email && <p className="text-xs" style={{ color: "#6b7280" }}>{data.email}</p>}
            {data.mobile && <p className="text-xs" style={{ color: "#6b7280" }}>{data.mobile}</p>}
            {data.pan && <p className="text-xs" style={{ color: "#6b7280" }}>PAN: {data.pan}</p>}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: "hsl(262,83%,58%)" }}>
              To
            </p>
            <p className="font-semibold text-sm">{COMPANY.name}</p>
            <p className="text-xs" style={{ color: "#6b7280" }}>{COMPANY.address}</p>
            <p className="text-xs" style={{ color: "#6b7280" }}>{COMPANY.contact}</p>
          </div>
        </div>

        {/* Billing Table */}
        <table className="w-full text-xs mb-6" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "hsl(262,83%,58%)" }}>
              <th className="text-left p-2.5 font-medium text-xs" style={{ color: "white" }}>Description</th>
              <th className="text-center p-2.5 font-medium text-xs" style={{ color: "white" }}>Qty / Days</th>
              <th className="text-center p-2.5 font-medium text-xs" style={{ color: "white" }}>Rate (₹)</th>
              <th className="text-right p-2.5 font-medium text-xs" style={{ color: "white" }}>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {data.billingRows
              .filter((r) => !r.isAttachRow)
              .map((row, i) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #e5e7eb", background: i % 2 === 0 ? "#faf8ff" : "white" }}>
                  <td className="p-2.5">{row.description}</td>
                  <td className="p-2.5 text-center">
                    {row.quantity !== null ? row.quantity : "N/A"}
                  </td>
                  <td className="p-2.5 text-center">
                    {row.rate !== null ? `₹${row.rate.toLocaleString("en-IN")}` : "N/A"}
                  </td>
                  <td className="p-2.5 text-right font-medium">
                    {row.total > 0 ? `₹${row.total.toLocaleString("en-IN")}` : "—"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-56">
            <div className="flex justify-between py-1.5 text-xs" style={{ color: "#6b7280" }}>
              <span>Subtotal</span>
              <span className="font-medium" style={{ color: "#1a1a2e" }}>
                ₹{data.subtotal.toLocaleString("en-IN")}
              </span>
            </div>
            <div
              className="flex justify-between py-2 text-sm font-bold mt-1 rounded-md px-3"
              style={{ background: "hsl(262,83%,95%)", color: "hsl(262,83%,40%)" }}
            >
              <span>Grand Total</span>
              <span>₹{data.grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-1" style={{ color: "hsl(262,83%,58%)" }}>
              Notes
            </p>
            <p className="text-xs whitespace-pre-wrap" style={{ color: "#6b7280" }}>
              {data.notes}
            </p>
          </div>
        )}

        {/* Attachments Indicator */}
        {data.attachments.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: "hsl(262,83%,58%)" }}>
              Attachments
            </p>
            <div className="space-y-1">
              {data.attachments.map((att) => (
                <div key={att.id} className="flex items-center gap-1.5 text-xs" style={{ color: "#6b7280" }}>
                  <Paperclip className="h-3 w-3" />
                  {att.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className="mt-auto pt-6 text-center text-[10px]"
          style={{ color: "#9ca3af", borderTop: "1px solid #e5e7eb" }}
        >
          This is a computer-generated invoice.
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = "InvoicePreview";
export default InvoicePreview;
