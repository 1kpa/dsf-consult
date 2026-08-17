/**
 * Invoice/company branding settings. Sourced from environment variables so
 * nothing is hard-coded across the invoicing UI/PDF — every value below has
 * a sensible default so the feature works out of the box, but should be
 * overridden per deployment via the env vars listed in .env.example.
 */
export const invoiceSettings = {
  companyName: process.env.INVOICE_COMPANY_NAME || 'DSF Consult',
  logoPath: process.env.INVOICE_LOGO_PATH || '',
  businessEmail: process.env.INVOICE_BUSINESS_EMAIL || 'billing@dsfconsult.com',
  phone: process.env.INVOICE_PHONE || '',
  address: process.env.INVOICE_ADDRESS || '',
  footer: process.env.INVOICE_FOOTER || 'Thank you for your business.',
  defaultCurrency: process.env.INVOICE_DEFAULT_CURRENCY || 'CAD',
  defaultTaxLabel: process.env.INVOICE_DEFAULT_TAX_LABEL || 'Tax',
  defaultTaxRate: Number(process.env.INVOICE_DEFAULT_TAX_RATE ?? 0),
  paymentInstructions:
    process.env.INVOICE_PAYMENT_INSTRUCTIONS ||
    'Payment instructions will be provided separately. Please contact us with any questions.',
} as const;

export const SUPPORTED_CURRENCIES = ['CAD', 'USD', 'NGN'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
