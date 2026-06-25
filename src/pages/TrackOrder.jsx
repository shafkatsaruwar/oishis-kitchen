import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Package, ChefHat, Star, CheckCircle, MapPin, Phone, Calendar, Clock, CreditCard, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { createPageUrl } from '../utils';

const STATUS_STEPS = [
  { key: 'pending',   label: 'Order Received', icon: Package,    desc: 'We got your order!' },
  { key: 'confirmed', label: 'Confirmed',       icon: CheckCircle, desc: 'Confirmed by kitchen' },
  { key: 'preparing', label: 'Preparing',       icon: ChefHat,    desc: 'Being cooked fresh' },
  { key: 'ready',     label: 'Ready for Pickup', icon: Star,      desc: 'Come pick it up!' },
];

const STATUS_COLORS = {
  pending:   'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready:     'bg-green-100 text-green-800',
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return new Date(+y, +m - 1, +d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export default function TrackOrder() {
  const [input, setInput] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const num = params.get('orderNumber');
    if (num) {
      setInput(num);
      lookupOrder(num);
    }
  }, []);

  const lookupOrder = async (num) => {
    const orderNum = (num || input).trim();
    if (!orderNum) return;
    setLoading(true);
    setError('');
    setSearched(false);
    try {
      const { data, error: err } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNum)
        .single();
      if (err || !data) {
        setOrder(null);
        setError('No order found with that number. Please check and try again.');
      } else {
        setOrder(data);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const currentStatusIdx = order
    ? Math.max(STATUS_STEPS.findIndex(s => s.key === order.status), 0)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12">

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Track Your <span className="text-cyan-600">Order</span>
          </h1>
          <p className="text-gray-600 mb-8">
            Enter your order number to see the latest status — no login required.
          </p>
        </motion.div>

        {/* Search box */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="shadow-xl border-0 mb-8">
            <CardContent className="p-6">
              <Label htmlFor="order-number" className="text-base font-semibold text-gray-900 mb-3 block">
                Order Number
              </Label>
              <div className="flex gap-3">
                <Input
                  id="order-number"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && lookupOrder()}
                  placeholder="e.g. ORD-1782349462862-VWEC43G1U"
                  className="font-mono text-sm flex-1"
                />
                <Button
                  onClick={() => lookupOrder()}
                  disabled={loading || !input.trim()}
                  className="bg-cyan-600 hover:bg-cyan-700 px-6"
                >
                  {loading ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Your order number was emailed to you and shown on your confirmation page.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error state */}
        {searched && error && !order && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-2 border-red-200 bg-red-50 shadow-lg mb-6">
              <CardContent className="p-6 text-center">
                <p className="text-red-700 font-semibold mb-1">Order Not Found</p>
                <p className="text-red-600 text-sm">{error}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Order result */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status tracker */}
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Order Status</h2>
                  <Badge className={STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}>
                    {STATUS_STEPS[currentStatusIdx]?.label}
                  </Badge>
                </div>

                <div className="relative">
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 z-0" />
                  <div
                    className="absolute top-5 left-5 h-0.5 bg-green-500 z-0 transition-all duration-700"
                    style={{ width: `${(currentStatusIdx / (STATUS_STEPS.length - 1)) * 100}%` }}
                  />
                  <div className="relative z-10 flex justify-between">
                    {STATUS_STEPS.map((step, idx) => {
                      const Icon = step.icon;
                      const done = idx <= currentStatusIdx;
                      return (
                        <div key={step.key} className="flex flex-col items-center w-1/4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${done ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <p className={`text-xs font-semibold mt-2 text-center leading-tight ${done ? 'text-green-700' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-600">{STATUS_STEPS[currentStatusIdx]?.desc}</p>
                </div>
              </CardContent>
            </Card>

            {/* Pickup date/time */}
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Pickup Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Date</span>
                    </div>
                    <p className="font-bold text-gray-900 text-sm">{formatDate(order.pickup_date)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Time</span>
                    </div>
                    <p className="font-bold text-gray-900 text-sm">{formatTime(order.pickup_time)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order items */}
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Details</h2>

                <div className="border rounded-xl overflow-hidden mb-4">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Items</p>
                  </div>
                  <div className="divide-y">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center px-4 py-3">
                        <div>
                          <span className="font-medium text-gray-900">{item.name}</span>
                          <span className="text-gray-400 text-sm ml-2">× {item.quantity}</span>
                          {item.special_instructions && (
                            <p className="text-xs text-gray-500 mt-0.5 italic">{item.special_instructions}</p>
                          )}
                        </div>
                        <span className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${order.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>${order.tax?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-cyan-600">${order.total?.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Pay on Pickup — Cash, Venmo, or Zelle</span>
                </div>

                {order.special_requests && (
                  <div className="mt-3 bg-rose-50 rounded-lg p-3 border border-rose-200">
                    <p className="text-xs font-semibold text-rose-700 mb-1">Special Requests</p>
                    <p className="text-sm text-gray-700">{order.special_requests}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pickup location */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4 text-white">Pickup Location</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-white font-medium pt-1">21 Concord St, Malden, MA 02148</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-white font-medium pt-1">781-579-4965</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Not logged in nudge */}
        {!order && searched === false && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <p className="text-center text-gray-500 text-sm mt-4">
              Have an account?{' '}
              <Link to={createPageUrl('Login')} className="text-cyan-600 font-medium hover:underline">
                Log in
              </Link>{' '}
              to see all your past orders in one place.
            </p>
          </motion.div>
        )}

      </div>
    </div>
  );
}
