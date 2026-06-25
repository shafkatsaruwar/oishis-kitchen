import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, AlertCircle, UserPlus, LogIn } from 'lucide-react';
import { useCart } from '../components/ordering/CartContext';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import PickupScheduler from '../components/ordering/PickupScheduler';
import { useAuth } from '@/lib/AuthContext';
import emailjs from '@emailjs/browser';

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const TAX_RATE = 0.0625;
  const subtotal = getCartTotal();
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    pickup_date: '',
    pickup_time: '',
    special_requests: '',
    payment_method: 'pay_on_pickup'
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customer_name: user.user_metadata?.full_name || '',
        customer_email: user.email || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    const belowMinimum = cart.filter(item => item.minQty && item.quantity < item.minQty);
    if (belowMinimum.length > 0) {
      toast.error(`${belowMinimum[0].name} requires a minimum of ${belowMinimum[0].minQty}. Please update your cart.`);
      return;
    }

    if (!formData.pickup_date || !formData.pickup_time) {
      toast.error('Please select a pickup date and time');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const orderData = {
        order_number: orderNumber,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        items: cart.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          special_instructions: item.special_instructions || ''
        })),
        subtotal: subtotal,
        tax: tax,
        total: total,
        pickup_date: formData.pickup_date,
        pickup_time: formData.pickup_time,
        special_requests: formData.special_requests,
        status: 'pending',
        payment_method: formData.payment_method,
        payment_status: formData.payment_method === 'pay_on_pickup' ? 'pending' : 'paid'
      };

      const { error } = await supabase.from('orders').insert([orderData]);
      if (error) throw error;

      // Send confirmation email (non-blocking)
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
      if (serviceId && templateId && publicKey) {
        emailjs.send(serviceId, templateId, {
          to_name: formData.customer_name,
          to_email: formData.customer_email,
          order_number: orderNumber,
          pickup_date: formData.pickup_date,
          pickup_time: formData.pickup_time,
          total: `$${total.toFixed(2)}`,
          items_list: cart.map(i => `${i.quantity}x ${i.name} — $${(i.price * i.quantity).toFixed(2)}`).join('\n'),
          payment_method: 'Pay on Pickup (Cash / Venmo / Zelle)',
          special_requests: formData.special_requests || 'None',
          track_url: `${window.location.origin}/TrackOrder?orderNumber=${orderNumber}`,
        }, publicKey).catch(err => console.error('Email failed:', err));
      }

      clearCart();
      navigate(createPageUrl('OrderConfirmation') + `?orderNumber=${orderNumber}`);
      toast.success('Order placed successfully!');

    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again or call us.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    navigate(createPageUrl('OrderOnline'));
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            <span className="text-cyan-600">Checkout</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8">Complete your order for pickup</p>

          {!user &&
          <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg mb-8">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <UserPlus className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Guest Checkout Available</h3>
                      <p className="text-sm text-gray-600">
                        You can checkout as a guest, or log in to track your orders and save your info
                      </p>
                    </div>
                  </div>
                  <Link to={`${createPageUrl('Login')}?redirect=${createPageUrl('Checkout')}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
                      <LogIn className="w-4 h-4 mr-2" />
                      Log In (Optional)
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          }
          </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pickup Only Notice */}
              <Card className="border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-rose-50 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">⚠️ PICKUP ONLY - NO DELIVERY</h3>
                      <p className="text-gray-700 mb-2">
                        We do not offer delivery service. All orders must be picked up at our location.
                      </p>
                      <p className="text-sm text-gray-600">📍 Pickup Location: 21 Concord St, Malden, MA 02148
📞 Questions? Call us: 781-579-4965

                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        placeholder="Your full name"
                        className="mt-2" />

                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.customer_email}
                          onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                          placeholder="your@email.com"
                          disabled={!!user}
                          className="mt-2" />
                        {user &&
                        <p className="text-xs text-gray-500 mt-1">Logged in as {user.email}</p>
                        }
                        </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={formData.customer_phone}
                          onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                          placeholder="(555) 000-0000"
                          className="mt-2" />

                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pickup Scheduler */}
              <PickupScheduler
                selectedDate={formData.pickup_date}
                selectedTime={formData.pickup_time}
                onDateSelect={(date) => setFormData({ ...formData, pickup_date: date, pickup_time: '' })}
                onTimeSelect={(time) => setFormData({ ...formData, pickup_time: time })} />


              {/* Special Requests */}
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Special Requests</h2>
                  <div>
                    <Label htmlFor="special_requests">Dietary Notes or Special Instructions</Label>
                    <Textarea
                      id="special_requests"
                      value={formData.special_requests}
                      onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                      placeholder="Spice level preferences, allergies, or any special instructions..."
                      rows={4}
                      className="mt-2" />

                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
                  <RadioGroup
                    value={formData.payment_method}
                    onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>

                    <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                      <RadioGroupItem value="pay_on_pickup" id="pay_on_pickup" />
                      <Label htmlFor="pay_on_pickup" className="flex-1 cursor-pointer">
                        <div className="font-semibold text-gray-900">Pay on Pickup</div>
                        <div className="text-sm text-gray-600">
                          Cash, Credit Card, or Venmo accepted at pickup
                        </div>
                      </Label>
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                  </RadioGroup>
                  <p className="text-sm text-gray-500 mt-4">💳 We accept: Cash, Venmo, Zelle

                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="shadow-2xl">
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                    <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                      {cart.map((item, idx) =>
                      <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax (6.25%)</span>
                        <span className="font-semibold">${tax.toFixed(2)}</span>
                      </div>
                      <div className="border-t-2 border-gray-300 pt-3">
                        <div className="flex justify-between text-2xl font-bold">
                          <span>Total</span>
                          <span className="text-cyan-600">${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg py-6">

                      {isSubmitting ?
                      <>Processing...</> :

                      <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Place Order
                        </>
                      }
                    </Button>

                    <p className="text-xs text-gray-500 text-center mt-4">
                      By placing this order, you agree to pickup at our location.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>);

}
