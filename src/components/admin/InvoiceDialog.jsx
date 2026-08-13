import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Printer, MessageCircle } from 'lucide-react';

/**
 * The invoice/receipt card. Rendered twice — once inside the dialog for viewing,
 * once inside a print root, because everything inside a dialog is hidden during
 * print and the Print button would otherwise produce a blank page.
 *
 * Matches ReceiptContent in the iOS app: logo, dashed rules, itemised lines,
 * and — on invoices only — the line telling the customer how they can pay.
 */
function InvoiceCard({ order }) {
  const isInvoice = order.payment_status !== 'paid';
  const subtotal = order.subtotal ?? order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const methodLabel =
    { venmo: 'Venmo', zelle: 'Zelle', cash: 'Cash' }[order.payment_method] || 'Cash';

  return (
    <div className="ok-invoice">
      <div className="text-center pb-5">
        <img src="/logo.png" alt="" className="w-16 h-16 mx-auto rounded-lg object-contain" />
        <h2
          className="text-2xl font-bold text-amber-600 mt-2"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          Oishi's Kitchen
        </h2>
        <p className="text-xs text-gray-500">Homemade Bangladeshi Food</p>
      </div>

      <div className="ok-invoice-dash" />

      <div className="py-4">
        <div className="flex justify-between text-xs text-gray-500 font-semibold">
          <span>{isInvoice ? 'INVOICE' : 'RECEIPT'}</span>
          <span>
            {new Date(order.created_at).toLocaleString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
        </div>
        <p className="font-bold text-gray-900 mt-1">Order #{order.order_number}</p>
        <p className="text-gray-600">{order.customer_name}</p>
      </div>

      <div className="ok-invoice-dash" />

      <div className="py-4 space-y-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-gray-800">
              {item.quantity}×&nbsp; {item.name}
            </span>
            <span className="tabular-nums text-gray-900">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="ok-invoice-dash" />

      <div className="py-4 space-y-1 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="tabular-nums">${subtotal.toFixed(2)}</span>
        </div>
        {order.tax != null && (
          <div className="flex justify-between text-gray-600">
            <span>Tax</span>
            <span className="tabular-nums">${order.tax.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
          <span className="font-bold text-gray-900">
            {isInvoice ? 'Amount Due' : `Paid via ${methodLabel}`}
          </span>
          <span className="text-2xl font-bold text-amber-600 tabular-nums">
            ${order.total.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-500 pt-1">
          <span>Pickup</span>
          <span>
            {order.pickup_date}
            {order.pickup_time ? ` · ${order.pickup_time}` : ''}
          </span>
        </div>
        {isInvoice && (
          <p className="text-xs text-gray-500 pt-1">
            You can pay via Cash (preferred), Venmo or Zelle.
          </p>
        )}
      </div>

      <div className="ok-invoice-dash" />

      <div className="text-center pt-4">
        <p className="font-bold text-amber-600">Thank you! 🧡</p>
        <p className="text-xs text-gray-500">Oishi's Kitchen · Homemade Bangladeshi Food</p>
      </div>
    </div>
  );
}

export default function InvoiceDialog({ order, isOpen, onClose }) {
  if (!order) return null;

  const isInvoice = order.payment_status !== 'paid';
  const phone = (order.customer_phone || '').replace(/\D/g, '');

  const whatsappText = encodeURIComponent(
    `Hi ${order.customer_name}! Your Oishi's Kitchen order #${order.order_number} ` +
      `comes to $${order.total.toFixed(2)}. Pickup ${order.pickup_date}` +
      `${order.pickup_time ? ` at ${order.pickup_time}` : ''}. ` +
      (isInvoice ? 'You can pay via Cash (preferred), Venmo or Zelle. ' : 'Thank you! ')
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-white max-w-md max-h-[90vh] overflow-y-auto">
          <VisuallyHidden.Root>
            <DialogTitle>
              {isInvoice ? 'Invoice' : 'Receipt'} for order {order.order_number}
            </DialogTitle>
          </VisuallyHidden.Root>
          <InvoiceCard order={order} />

          <div className="flex gap-2 pt-2">
            <Button onClick={() => window.print()} variant="outline" className="flex-1 border-gray-300">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            {phone && (
              <Button asChild className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                <a
                  href={`https://wa.me/${phone}?text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {isOpen && (
        <div className="ok-print-root ok-print-invoice" aria-hidden="true">
          <InvoiceCard order={order} />
        </div>
      )}
    </>
  );
}
