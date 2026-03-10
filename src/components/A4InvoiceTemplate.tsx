import { forwardRef } from "react";
import type { InvoiceData } from "@/types/invoice";
import { COMPANY } from "@/types/invoice";

interface A4InvoiceTemplateProps {
    data: InvoiceData;
}

const A4InvoiceTemplate = forwardRef<HTMLDivElement, A4InvoiceTemplateProps>(
    ({ data }, ref) => {
        // Format date in Indian style
        const formatDate = (dateStr: string) => {
            if (!dateStr) return "—";
            return new Date(dateStr).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        };

        return (
            <div
                ref={ref}
                style={{
                    width: "210mm",
                    minHeight: "297mm",
                    padding: "20mm",
                    backgroundColor: "#ffffff",
                    color: "#1a1a2e",
                    fontFamily: "'Inter', 'Roboto', 'Helvetica', sans-serif",
                    boxSizing: "border-box",
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Header Section */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "32pt", color: "hsl(262, 83%, 58%)", fontWeight: 800, letterSpacing: "-1px" }}>
                            INVOICE
                        </h1>
                        <p style={{ margin: "4px 0 0 0", fontSize: "10pt", color: "#6b7280" }}>
                            {data.invoiceNumber}
                        </p>
                    </div>
                    <div style={{ textAlign: "right", fontSize: "10pt" }}>
                        <div style={{ marginBottom: "4px" }}>
                            <span style={{ color: "#6b7280" }}>Date: </span>
                            <span style={{ fontWeight: 600 }}>{formatDate(data.invoiceDate)}</span>
                        </div>
                        {data.projectName && (
                            <div>
                                <span style={{ color: "#6b7280" }}>Project: </span>
                                <span style={{ fontWeight: 600 }}>{data.projectName}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Divider Line */}
                <div style={{ height: "1.5pt", backgroundColor: "hsl(262, 83%, 58%)", margin: "20px 0", width: "100%" }} />

                {/* From / To Section - Using Table for Layout stability */}
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px", tableLayout: "fixed" }}>
                    <tbody>
                        <tr>
                            <td style={{ verticalAlign: "top", width: "50%", padding: "0 10px 0 0" }}>
                                <p style={{ color: "hsl(262, 83%, 58%)", fontSize: "9pt", fontWeight: 700, margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "1px" }}>
                                    FROM
                                </p>
                                <p style={{ fontSize: "11pt", fontWeight: 700, margin: "0 0 4px 0" }}>{data.trainerName || "Trainer Name"}</p>
                                <div style={{ fontSize: "10pt", color: "#4b5563", lineHeight: "1.4" }}>
                                    {data.email && <p style={{ margin: 0 }}>{data.email}</p>}
                                    {data.mobile && <p style={{ margin: 0 }}>{data.mobile}</p>}
                                    {data.pan && <p style={{ margin: "4px 0 0 0", fontWeight: 600 }}>PAN: {data.pan}</p>}
                                </div>
                            </td>
                            <td style={{ verticalAlign: "top", width: "50%", padding: "0 0 0 10px" }}>
                                <p style={{ color: "hsl(262, 83%, 58%)", fontSize: "9pt", fontWeight: 700, margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "1px" }}>
                                    TO
                                </p>
                                <p style={{ fontSize: "11pt", fontWeight: 700, margin: "0 0 4px 0" }}>{COMPANY.name}</p>
                                <div style={{ fontSize: "10pt", color: "#4b5563", lineHeight: "1.4" }}>
                                    <p style={{ margin: 0 }}>{COMPANY.address}</p>
                                    <p style={{ margin: "4px 0 0 0" }}>{COMPANY.contact}</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Items Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px" }}>
                    <thead>
                        <tr style={{ backgroundColor: "hsl(262, 83%, 58%)" }}>
                            <th style={{ textAlign: "left", padding: "12px 15px", color: "white", fontSize: "10pt", fontWeight: 600, borderTopLeftRadius: "4px" }}>Description</th>
                            <th style={{ textAlign: "center", padding: "12px 15px", color: "white", fontSize: "10pt", fontWeight: 600, width: "60px" }}>Qty</th>
                            <th style={{ textAlign: "center", padding: "12px 15px", color: "white", fontSize: "10pt", fontWeight: 600, width: "100px" }}>Rate</th>
                            <th style={{ textAlign: "right", padding: "12px 15px", color: "white", fontSize: "10pt", fontWeight: 600, width: "120px", borderTopRightRadius: "4px" }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.billingRows
                            .filter((r) => !r.isAttachRow)
                            .map((row, i) => (
                                <tr key={row.id} style={{ borderBottom: "1pt solid #e5e7eb", backgroundColor: i % 2 === 0 ? "#faf8ff" : "#ffffff" }}>
                                    <td style={{ padding: "12px 15px", fontSize: "10pt" }}>{row.description}</td>
                                    <td style={{ padding: "12px 15px", fontSize: "10pt", textAlign: "center" }}>
                                        {row.quantity !== null ? row.quantity : "—"}
                                    </td>
                                    <td style={{ padding: "12px 15px", fontSize: "10pt", textAlign: "center" }}>
                                        {row.rate !== null ? `₹${row.rate.toLocaleString("en-IN")}` : "—"}
                                    </td>
                                    <td style={{ padding: "12px 15px", fontSize: "10pt", textAlign: "right", fontWeight: 600 }}>
                                        {row.total > 0 ? `₹${row.total.toLocaleString("en-IN")}` : "—"}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>

                {/* Total Section */}
                <div style={{ marginLeft: "auto", width: "250px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: "8px 0", fontSize: "10pt", color: "#6b7280" }}>Subtotal</td>
                                <td style={{ padding: "8px 0", fontSize: "10pt", textAlign: "right", fontWeight: 600 }}>
                                    ₹{data.subtotal.toLocaleString("en-IN")}
                                </td>
                            </tr>
                            <tr style={{ borderTop: "1pt solid #e5e7eb" }}>
                                <td style={{ padding: "12px 0", fontSize: "12pt", fontWeight: 700, color: "hsl(262, 83%, 58%)" }}>Grand Total</td>
                                <td style={{ padding: "12px 0", fontSize: "14pt", fontWeight: 800, textAlign: "right", color: "hsl(262, 83%, 58%)" }}>
                                    ₹{data.grandTotal.toLocaleString("en-IN")}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Notes */}
                {data.notes && (
                    <div style={{ marginTop: "40px" }}>
                        <p style={{ color: "hsl(262, 83%, 58%)", fontSize: "9pt", fontWeight: 700, margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "1px" }}>
                            Notes
                        </p>
                        <p style={{ fontSize: "10pt", color: "#4b5563", margin: 0, whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                            {data.notes}
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div style={{ marginTop: "auto", paddingTop: "20px", borderTop: "1pt solid #e5e7eb", textAlign: "center", fontSize: "9pt", color: "#9ca3af" }}>
                    This is a computer-generated invoice. No signature required.
                </div>
            </div>
        );
    }
);

A4InvoiceTemplate.displayName = "A4InvoiceTemplate";
export default A4InvoiceTemplate;
