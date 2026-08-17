'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Select } from '@/components/ui/Select';
import { calculateInvoiceTotals, calculateLineTotal } from '@/lib/services/invoice-calc';
import { formatMoney } from '@/lib/format';
import { SUPPORTED_CURRENCIES, invoiceSettings } from '@/lib/settings/invoice';

interface LeadOption {
  id: string;
  firstName: string;
  lastName: string;
  businessName: string | null;
  email: string;
  phone: string;
}

interface LineItemState {
  description: string;
  quantity: string;
  unitPrice: string;
}

interface InvoiceFormValues {
  leadId: string;
  clientName: string;
  clientBusinessName: string;
  clientEmail: string;
  clientPhone: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  items: LineItemState[];
  taxLabel: string;
  taxRate: string;
  discountType: '' | 'PERCENTAGE' | 'FIXED';
  discountValue: string;
  notes: string;
}

interface InvoiceFormProps {
  leads: LeadOption[];
  preselectedLeadId?: string;
  mode?: 'create' | 'edit';
  invoiceId?: string;
  initialValues?: Partial<InvoiceFormValues>;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function plus30DaysIso() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

const EMPTY_ITEM: LineItemState = { description: '', quantity: '1', unitPrice: '0' };

export function InvoiceForm({ leads, preselectedLeadId, mode = 'create', invoiceId, initialValues }: InvoiceFormProps) {
  const router = useRouter();
  const preselectedLead = leads.find((l) => l.id === preselectedLeadId);

  const [clientMode, setClientMode] = useState<'lead' | 'manual'>(preselectedLead || initialValues?.leadId ? 'lead' : 'manual');
  const [values, setValues] = useState<InvoiceFormValues>({
    leadId: initialValues?.leadId ?? preselectedLead?.id ?? '',
    clientName: initialValues?.clientName ?? (preselectedLead ? `${preselectedLead.firstName} ${preselectedLead.lastName}`.trim() : ''),
    clientBusinessName: initialValues?.clientBusinessName ?? preselectedLead?.businessName ?? '',
    clientEmail: initialValues?.clientEmail ?? preselectedLead?.email ?? '',
    clientPhone: initialValues?.clientPhone ?? preselectedLead?.phone ?? '',
    issueDate: initialValues?.issueDate ?? todayIso(),
    dueDate: initialValues?.dueDate ?? plus30DaysIso(),
    currency: initialValues?.currency ?? invoiceSettings.defaultCurrency,
    items: initialValues?.items && initialValues.items.length > 0 ? initialValues.items : [{ ...EMPTY_ITEM }],
    taxLabel: initialValues?.taxLabel ?? invoiceSettings.defaultTaxLabel,
    taxRate: initialValues?.taxRate ?? (invoiceSettings.defaultTaxRate ? String(invoiceSettings.defaultTaxRate) : ''),
    discountType: initialValues?.discountType ?? '',
    discountValue: initialValues?.discountValue ?? '',
    notes: initialValues?.notes ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function update<K extends keyof InvoiceFormValues>(field: K, value: InvoiceFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleLeadSelect(id: string) {
    const lead = leads.find((l) => l.id === id);
    update('leadId', id);
    if (lead) {
      setValues((prev) => ({
        ...prev,
        leadId: id,
        clientName: `${lead.firstName} ${lead.lastName}`.trim(),
        clientBusinessName: lead.businessName ?? '',
        clientEmail: lead.email,
        clientPhone: lead.phone,
      }));
    }
  }

  function updateItem(index: number, field: keyof LineItemState, value: string) {
    setValues((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  }

  function addItem() {
    setValues((prev) => ({ ...prev, items: [...prev.items, { ...EMPTY_ITEM }] }));
  }

  function removeItem(index: number) {
    setValues((prev) => ({ ...prev, items: prev.items.length > 1 ? prev.items.filter((_, i) => i !== index) : prev.items }));
  }

  const totals = useMemo(
    () =>
      calculateInvoiceTotals({
        items: values.items.map((item) => ({ quantity: Number(item.quantity) || 0, unitPrice: Number(item.unitPrice) || 0 })),
        taxRate: values.taxRate ? Number(values.taxRate) : undefined,
        discountType: values.discountType || undefined,
        discountValue: values.discountValue ? Number(values.discountValue) : undefined,
      }),
    [values.items, values.taxRate, values.discountType, values.discountValue]
  );

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const body = {
      clientName: values.clientName,
      clientBusinessName: values.clientBusinessName,
      clientEmail: values.clientEmail,
      clientPhone: values.clientPhone,
      leadId: clientMode === 'lead' ? values.leadId : '',
      issueDate: new Date(values.issueDate).toISOString(),
      dueDate: new Date(values.dueDate).toISOString(),
      currency: values.currency,
      items: values.items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
      })),
      taxLabel: values.taxLabel,
      taxRate: values.taxRate ? Number(values.taxRate) : null,
      discountType: values.discountType || null,
      discountValue: values.discountValue ? Number(values.discountValue) : null,
      notes: values.notes,
    };

    setSubmitting(true);
    try {
      const url = mode === 'edit' ? `/api/crm/invoices/${invoiceId}` : '/api/crm/invoices';
      const method = mode === 'edit' ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        if (result.error?.fieldErrors) {
          const flattened: Record<string, string> = {};
          for (const [key, messages] of Object.entries(result.error.fieldErrors as Record<string, string[]>)) {
            if (messages?.[0]) flattened[key] = messages[0];
          }
          setFieldErrors(flattened);
        }
        throw new Error(result.error || 'Unable to save invoice');
      }
      const id = mode === 'edit' ? invoiceId : result.invoice.id;
      router.push(`/crm/invoices/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Client</h2>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setClientMode('lead')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${clientMode === 'lead' ? 'bg-sky-500/20 text-sky-300' : 'border border-white/10 text-slate-400 hover:text-white'}`}
          >
            Existing Lead
          </button>
          <button
            type="button"
            onClick={() => setClientMode('manual')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${clientMode === 'manual' ? 'bg-sky-500/20 text-sky-300' : 'border border-white/10 text-slate-400 hover:text-white'}`}
          >
            Manual Entry
          </button>
        </div>

        {clientMode === 'lead' && (
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-slate-400">Select Lead</label>
            <Select value={values.leadId} onChange={(e) => handleLeadSelect(e.target.value)} className="w-full max-w-md">
              <option value="">Choose a lead…</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.firstName} {lead.lastName}
                  {lead.businessName ? ` — ${lead.businessName}` : ''}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Client Name" value={values.clientName} onChange={(v) => update('clientName', v)} error={fieldErrors.clientName} required />
          <TextField label="Business Name" value={values.clientBusinessName} onChange={(v) => update('clientBusinessName', v)} />
          <TextField label="Email" type="email" value={values.clientEmail} onChange={(v) => update('clientEmail', v)} error={fieldErrors.clientEmail} />
          <TextField label="Phone" type="tel" value={values.clientPhone} onChange={(v) => update('clientPhone', v)} />
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Details</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Issue Date</label>
            <input
              type="date"
              value={values.issueDate}
              onChange={(e) => update('issueDate', e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Due Date</label>
            <input
              type="date"
              value={values.dueDate}
              onChange={(e) => update('dueDate', e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Currency</label>
            <Select value={values.currency} onChange={(e) => update('currency', e.target.value)} className="w-full">
              {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Line Items</h2>
          <button type="button" onClick={addItem} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-white/20 hover:text-white">
            Add Item
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {values.items.map((item, index) => {
            const lineTotal = calculateLineTotal(Number(item.quantity) || 0, Number(item.unitPrice) || 0);
            return (
              <div key={index} className="flex flex-wrap items-end gap-2 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className="min-w-[200px] flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-400">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    required
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>
                <div className="w-24">
                  <label className="mb-1 block text-xs font-medium text-slate-400">Qty</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>
                <div className="w-32">
                  <label className="mb-1 block text-xs font-medium text-slate-400">Unit Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>
                <div className="w-28 text-right">
                  <div className="mb-1 text-xs font-medium text-slate-400">Total</div>
                  <div className="py-2 text-sm text-white">{formatMoney(lineTotal, values.currency)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={values.items.length === 1}
                  className="rounded-lg border border-white/10 px-2.5 py-2 text-xs text-slate-400 hover:border-rose-400/30 hover:text-rose-300 disabled:opacity-40"
                  aria-label="Remove item"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Tax &amp; Discount</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <TextField label="Tax Label" value={values.taxLabel} onChange={(v) => update('taxLabel', v)} placeholder="e.g. HST" />
          <TextField label="Tax %" type="number" value={values.taxRate} onChange={(v) => update('taxRate', v)} placeholder="0" />
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Discount Type</label>
            <Select value={values.discountType} onChange={(e) => update('discountType', e.target.value as InvoiceFormValues['discountType'])} className="w-full">
              <option value="">None</option>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed Amount</option>
            </Select>
          </div>
          <TextField
            label="Discount Value"
            type="number"
            value={values.discountValue}
            onChange={(v) => update('discountValue', v)}
            placeholder="0"
            disabled={!values.discountType}
          />
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Notes</h2>
        <textarea
          value={values.notes}
          onChange={(e) => update('notes', e.target.value)}
          rows={3}
          className="mt-3 w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
          placeholder="Optional notes for this invoice"
        />
      </section>

      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="ml-auto max-w-xs space-y-2 text-sm">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span className="text-white">{formatMoney(totals.subtotal, values.currency)}</span>
          </div>
          {totals.discountAmount > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Discount</span>
              <span className="text-white">-{formatMoney(totals.discountAmount, values.currency)}</span>
            </div>
          )}
          {totals.taxAmount > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>{values.taxLabel || 'Tax'}</span>
              <span className="text-white">{formatMoney(totals.taxAmount, values.currency)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-white/10 pt-2 text-base font-semibold">
            <span className="text-white">Total</span>
            <span className="text-white">{formatMoney(totals.totalAmount, values.currency)}</span>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-sky-500/30 disabled:opacity-60"
        >
          {submitting ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Create Invoice'}
        </button>
      </div>
    </form>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

function TextField({ label, value, onChange, error, type = 'text', placeholder, required, disabled }: TextFieldProps) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full rounded-lg border bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 disabled:opacity-50 ${
          error ? 'border-rose-400 focus:ring-rose-400' : 'border-white/10 focus:border-sky-400 focus:ring-sky-400'
        }`}
      />
      {error && <p className="mt-1 text-xs text-rose-300">{error}</p>}
    </div>
  );
}
