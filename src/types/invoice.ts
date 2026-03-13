export interface BillingRow {
  id: string;
  description: string;
  quantity: number | null;
  rate: number | null;
  total: number;
  editable: {
    quantity: boolean;
    rate: boolean;
  };
  applicable: boolean;
  isAttachRow?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface InvoiceData {
  id: string;
  trainerName: string;
  email: string;
  mobile: string;
  pan: string;
  invoiceNumber: string;
  invoiceDate: string;
  projectName: string;
  billingRows: BillingRow[];
  subtotal: number;
  grandTotal: number;
  notes: string;
  attachments: Attachment[];
  createdAt: string;
}

export const COMPANY = {
  name: "CONNECT Training Solutions (P) Limited",
  address: "110E 10/5, Xavier Street, Barani Nagar, Vannarpettai, Tirunelveli-627003",
  contact: "+91 9600965961",
} as const;

export function createDefaultBillingRows(): BillingRow[] {
  return [
    {
      id: "training",
      description: "⭐ Training",
      quantity: 0,
      rate: 0,
      total: 0,
      editable: { quantity: true, rate: true },
      applicable: true,
    },
    {
      id: "food",
      description: "⭐ Food (100 INR × Meals) — If applicable",
      quantity: 0,
      rate: 100,
      total: 0,
      editable: { quantity: true, rate: false },
      applicable: true,
    },
    {
      id: "travel",
      description: "⭐ Travel — If applicable",
      quantity: 1,
      rate: 0,
      total: 0,
      editable: { quantity: false, rate: true },
      applicable: true,
    },
  ];
}

export function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${y}${m}-${rand}`;
}
