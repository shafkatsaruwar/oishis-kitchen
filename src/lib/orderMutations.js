import { supabase } from '@/lib/supabase';

/**
 * Every write here asks PostgREST for the updated row back and throws when
 * nothing comes back.
 *
 * Without `.select()`, an UPDATE that matches zero rows returns 204 — exactly
 * like a successful one. The iOS app had this bug: reversing a payment appeared
 * to work, the UI showed it, and the next refresh silently restored "paid"
 * because the write had never landed.
 */
async function updateOrder(orderId, patch) {
  const { data, error } = await supabase
    .from('orders')
    .update(patch)
    .eq('id', orderId)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error("The database didn't update any order. Nothing was saved — please try again.");
  }
  return data[0];
}

export const setOrderStatus = (orderId, status) => updateOrder(orderId, { status });

export const recordPayment = (orderId, method) =>
  updateOrder(orderId, { payment_status: 'paid', payment_method: method });

export const reversePayment = (orderId) =>
  updateOrder(orderId, { payment_status: null, payment_method: null });

export const setOrderFlags = (orderId, { isTest, isVip }) =>
  updateOrder(orderId, { is_test: isTest, is_vip: isVip });

/**
 * Removes or reinstates tax on an order that already exists — a website order
 * from a customer who turns out to be tax-exempt, say.
 *
 * The subtotal is recomputed from the line items rather than trusted from the
 * row, so an order saved before subtotal was stored still totals correctly.
 */
export function orderSubtotal(order) {
  if (typeof order.subtotal === 'number') return round2(order.subtotal);
  return round2((order.items || []).reduce((sum, i) => sum + (i.price || 0) * (i.quantity || 0), 0));
}

export const setOrderTaxExempt = (order, exempt) => {
  const subtotal = orderSubtotal(order);
  const tax = exempt ? 0 : round2(subtotal * TAX_RATE);
  return updateOrder(order.id, {
    subtotal,
    tax,
    total: round2(subtotal + tax),
  });
};

export async function deleteOrder(orderId) {
  const { error } = await supabase.from('orders').delete().eq('id', orderId);
  if (error) throw error;
}

/** Six base-36 characters, uppercased — same format the checkout generates. */
export function generateOrderNumber() {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

export const TAX_RATE = 0.0625;

export const round2 = (n) => Math.round(n * 100) / 100;

/** Creates an order taken over the phone, matching the web checkout's shape. */
export async function createPhoneOrder({
  customerName,
  customerPhone,
  customerEmail,
  items,
  pickupDate,
  pickupTime,
  specialRequests,
  paidNow,
  paymentMethod,
  noTax = false,
}) {
  const subtotal = round2(items.reduce((sum, i) => sum + i.price * i.quantity, 0));
  // Tax-exempt orders still store a tax of 0 rather than null, so every total
  // downstream stays subtotal + tax without special cases.
  const tax = noTax ? 0 : round2(subtotal * TAX_RATE);
  const total = round2(subtotal + tax);

  const { data, error } = await supabase
    .from('orders')
    .insert({
      order_number: generateOrderNumber(),
      customer_name: customerName.trim(),
      customer_email: (customerEmail || '').trim(),
      customer_phone: customerPhone.trim(),
      items,
      subtotal,
      tax,
      total,
      pickup_date: pickupDate,
      pickup_time: pickupTime,
      special_requests: specialRequests?.trim() || null,
      status: 'confirmed',
      payment_method: paidNow ? paymentMethod : 'pay_on_pickup',
      payment_status: paidNow ? 'paid' : 'pending',
    })
    .select();

  if (error) throw error;
  if (!data || data.length === 0) throw new Error('The order was not saved — please try again.');
  return data[0];
}
