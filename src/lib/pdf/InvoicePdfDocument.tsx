import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { invoiceSettings } from '@/lib/settings/invoice';
import type { SerializedInvoice } from '@/lib/services/invoice-serialize';
import fs from 'node:fs';
import path from 'node:path';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: '#1e293b', fontFamily: 'Helvetica' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  logo: { width: 120, maxHeight: 60, objectFit: 'contain', marginBottom: 6 },
  companyName: { fontSize: 16, fontWeight: 700, marginBottom: 2 },
  smallMuted: { fontSize: 9, color: '#64748b' },
  invoiceTitle: { fontSize: 20, fontWeight: 700, textAlign: 'right', marginBottom: 4 },
  statusBadge: { fontSize: 9, textAlign: 'right', color: '#0ea5e9', fontWeight: 700 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  metaBlock: { width: '48%' },
  sectionLabel: { fontSize: 9, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  bodyText: { fontSize: 10, marginBottom: 2 },
  table: { marginTop: 10, borderTop: '1 solid #cbd5e1', borderBottom: '1 solid #cbd5e1' },
  tableHeaderRow: { flexDirection: 'row', backgroundColor: '#f1f5f9', paddingVertical: 6, paddingHorizontal: 4 },
  tableRow: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 4, borderTop: '1 solid #e2e8f0' },
  colDescription: { width: '52%' },
  colQty: { width: '12%', textAlign: 'right' },
  colUnitPrice: { width: '18%', textAlign: 'right' },
  colLineTotal: { width: '18%', textAlign: 'right' },
  tableHeaderText: { fontSize: 9, fontWeight: 700, color: '#475569' },
  totalsBlock: { marginTop: 16, alignSelf: 'flex-end', width: '45%' },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  totalsLabel: { fontSize: 10, color: '#475569' },
  totalsValue: { fontSize: 10 },
  grandTotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 6, marginTop: 4, borderTop: '1 solid #1e293b' },
  grandTotalLabel: { fontSize: 12, fontWeight: 700 },
  grandTotalValue: { fontSize: 12, fontWeight: 700 },
  outstandingValue: { fontSize: 11, fontWeight: 700, color: '#dc2626' },
  paidValue: { fontSize: 11, fontWeight: 700, color: '#16a34a' },
  paymentHistoryTitle: { fontSize: 10, fontWeight: 700, marginTop: 20, marginBottom: 6 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', fontSize: 9, paddingVertical: 2, color: '#475569' },
  notesBlock: { marginTop: 20 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#94a3b8' },
});

function formatMoneyPdf(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatDatePdf(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { dateStyle: 'medium' });
}

function resolveLogoSource(): string | null {
  if (!invoiceSettings.logoPath) return null;
  try {
    const resolved = path.join(process.cwd(), 'public', invoiceSettings.logoPath.replace(/^\/+/, ''));
    if (fs.existsSync(resolved)) return resolved;
  } catch {
    // fall through to text-only header
  }
  return null;
}

export function InvoicePdfDocument({ invoice }: { invoice: SerializedInvoice }) {
  const logoSource = resolveLogoSource();
  const items = invoice.items ?? [];
  const payments = invoice.payments ?? [];

  return (
    <Document title={`Invoice ${invoice.invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf's <Image>, not a DOM <img>; renders into a PDF file, not a web accessibility tree */}
            {logoSource && <Image src={logoSource} style={styles.logo} />}
            <Text style={styles.companyName}>{invoiceSettings.companyName}</Text>
            {invoiceSettings.address && <Text style={styles.smallMuted}>{invoiceSettings.address}</Text>}
            {invoiceSettings.businessEmail && <Text style={styles.smallMuted}>{invoiceSettings.businessEmail}</Text>}
            {invoiceSettings.phone && <Text style={styles.smallMuted}>{invoiceSettings.phone}</Text>}
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.statusBadge}>{invoice.status.replace('_', ' ')}</Text>
            <Text style={styles.smallMuted}>{invoice.invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaBlock}>
            <Text style={styles.sectionLabel}>Billed To</Text>
            <Text style={styles.bodyText}>{invoice.clientName}</Text>
            {invoice.clientBusinessName && <Text style={styles.bodyText}>{invoice.clientBusinessName}</Text>}
            {invoice.clientEmail && <Text style={styles.bodyText}>{invoice.clientEmail}</Text>}
            {invoice.clientPhone && <Text style={styles.bodyText}>{invoice.clientPhone}</Text>}
          </View>
          <View style={[styles.metaBlock, { alignItems: 'flex-end' }]}>
            <View style={{ flexDirection: 'row', marginBottom: 3 }}>
              <Text style={[styles.smallMuted, { width: 70, textAlign: 'right', marginRight: 8 }]}>Issue Date</Text>
              <Text style={styles.bodyText}>{formatDatePdf(invoice.issueDate)}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[styles.smallMuted, { width: 70, textAlign: 'right', marginRight: 8 }]}>Due Date</Text>
              <Text style={styles.bodyText}>{formatDatePdf(invoice.dueDate)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colDescription, styles.tableHeaderText]}>Description</Text>
            <Text style={[styles.colQty, styles.tableHeaderText]}>Qty</Text>
            <Text style={[styles.colUnitPrice, styles.tableHeaderText]}>Unit Price</Text>
            <Text style={[styles.colLineTotal, styles.tableHeaderText]}>Amount</Text>
          </View>
          {items.map((item) => (
            <View key={item.id} style={styles.tableRow} wrap={false}>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colUnitPrice}>{formatMoneyPdf(item.unitPrice, invoice.currency)}</Text>
              <Text style={styles.colLineTotal}>{formatMoneyPdf(item.lineTotal, invoice.currency)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{formatMoneyPdf(invoice.subtotal, invoice.currency)}</Text>
          </View>
          {invoice.discountAmount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>
                Discount {invoice.discountType === 'PERCENTAGE' && invoice.discountValue ? `(${invoice.discountValue}%)` : ''}
              </Text>
              <Text style={styles.totalsValue}>-{formatMoneyPdf(invoice.discountAmount, invoice.currency)}</Text>
            </View>
          )}
          {invoice.taxAmount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>
                {invoice.taxLabel || 'Tax'} {invoice.taxRate ? `(${invoice.taxRate}%)` : ''}
              </Text>
              <Text style={styles.totalsValue}>{formatMoneyPdf(invoice.taxAmount, invoice.currency)}</Text>
            </View>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatMoneyPdf(invoice.totalAmount, invoice.currency)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Amount Paid</Text>
            <Text style={[styles.totalsValue, styles.paidValue]}>{formatMoneyPdf(invoice.amountPaid, invoice.currency)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Outstanding Balance</Text>
            <Text style={styles.outstandingValue}>{formatMoneyPdf(invoice.amountOutstanding, invoice.currency)}</Text>
          </View>
        </View>

        {payments.length > 0 && (
          <View>
            <Text style={styles.paymentHistoryTitle}>Payment History</Text>
            {payments.map((payment) => (
              <View key={payment.id} style={styles.paymentRow}>
                <Text>{formatDatePdf(payment.paymentDate)}</Text>
                <Text>{payment.paymentMethod.replace('_', ' ')}</Text>
                <Text>{payment.reference || '—'}</Text>
                <Text>{formatMoneyPdf(payment.amount, invoice.currency)}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.notesBlock}>
          <Text style={styles.sectionLabel}>Payment Instructions</Text>
          <Text style={styles.bodyText}>{invoiceSettings.paymentInstructions}</Text>
        </View>

        {invoice.notes && (
          <View style={styles.notesBlock}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text style={styles.bodyText}>{invoice.notes}</Text>
          </View>
        )}

        <Text style={styles.footer}>{invoiceSettings.footer}</Text>
      </Page>
    </Document>
  );
}
