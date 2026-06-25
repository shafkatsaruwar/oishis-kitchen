import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, MapPin, Phone, Clock, Calendar, ShoppingBag, CreditCard, ArrowLeft, RotateCcw, Package, ChefHat, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { supabase } from '@/lib/supabase';

const COLORS = ['#06b6d4', '#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899'];

function ConfettiPiece({ delay, x, color }) {
  return (
    <motion.div
      className="fixed top-0 w-2 h-3 rounded-sm pointer-events-none z-50"
      style={{ left: `${x}%`, backgroundColor: color }}
      initial={{ y: -20, rotate: 0, opacity: 1 }}
      animate={{ y: '110vh', rotate: 720, opacity: [1, 1, 0] }}
      transition={{ duration: 3 + Math.random() * 2, delay, ease: 'easeIn' }}
    />
  );
}

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    delay: Math.random() * 1.5,
    x: Math.random() * 100,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <>
      {pieces.map(p => <ConfettiPiece key={p.id} {...p} />)}
    </>
  );
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Received', icon: ShoppingBag, desc: 'We got your order!' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, desc: 'Order confirmed by kitchen' },
  { key: 'preparing', label: 'Preparing', icon: ChefHat, desc: 'Being cooked fresh for you' },
  { key: 'ready', label: 'Ready for Pickup', icon: Star, desc: 'Come pick it up!' },
];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const date = new Date(+y, +m - 1, +d);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 || 12;
  return `${display}:${m} ${ampm}`;
}

export default function OrderConfirmation() {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const num = params.get('orderNumber') || '';
    setOrderNumber(num);
    if (num) fetchOrder(num);
    else setLoading(false);

    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const fetchOrder = async (num) => {
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', num)
        .single();
      setOrder(data);
    } catch (e) {
      // silently continue — order number still shows
    } finally {
      setLoading(false);
    }
  };

  const currentStatusIdx = order
    ? STATUS_STEPS.findIndex(s => s.key === order.status) ?? 0
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-cyan-50 relative">
      <AnimatePresence>{showConfetti && <Confetti />}</AnimatePresence>

      <div className="max-w-2xl mx-auto px-4 py-12 relative z-10">

        {/* Hero */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative inline-flex items-center justify-center mb-6">
            <motion.div
              className="absolute w-36 h-36 bg-green-200 rounded-full"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute w-28 h-28 bg-green-300 rounded-full"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
            />
            <motion.div
              className="relative z-10 w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
          </div>

          <motion.h1
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Order Confirmed! 🎉
          </motion.h1>
          <motion.p
            className="text-lg text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            Thank you! A confirmation email is on its way.
          </motion.p>
        </motion.div>

        {/* Order Number Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl p-6 text-white text-center mb-6 shadow-xl">
            <p className="text-cyan-100 text-sm font-medium uppercase tracking-widest mb-2">Your Order Number</p>
            <p className="text-2xl md:text-3xl font-bold font-mono tracking-wider">{orderNumber}</p>
            <p className="text-cyan-200 text-sm mt-2">Save this number to track your order</p>
          </div>
        </motion.div>

        {/* Order Status Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
        >
          <Card className="border-0 shadow-xl mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Status</h2>
              <div className="relative">
                {/* connector line */}
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
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${done ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
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
                <Badge className="bg-green-600 text-white mb-2">
                  {STATUS_STEPS[currentStatusIdx]?.label}
                </Badge>
                <p className="text-sm text-gray-600">{STATUS_STEPS[currentStatusIdx]?.desc}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Details (fetched from Supabase) */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Card className="border-0 shadow-xl mb-6">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Details</h2>

                {/* Pickup Date/Time */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Pickup Date</span>
                    </div>
                    <p className="font-bold text-gray-900">{formatDate(order.pickup_date)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Pickup Time</span>
                    </div>
                    <p className="font-bold text-gray-900">{formatTime(order.pickup_time)}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="border rounded-xl overflow-hidden mb-4">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Items Ordered</p>
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

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${order.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (6.25%)</span>
                    <span>${order.tax?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2 text-gray-900">
                    <span>Total</span>
                    <span className="text-cyan-600">${order.total?.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment */}
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
          </motion.div>
        )}

        {/* Pickup Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: order ? 1.15 : 1 }}
        >
          <Card className="border-0 shadow-xl mb-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <CardContent className="p-6">
              <h2 className="text-lg font-bold mb-4 text-white">Pickup Information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Location</p>
                    <p className="text-white font-medium">21 Concord St, Malden, MA 02148</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Questions?</p>
                    <p className="text-white font-medium">781-579-4965</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <Link to={createPageUrl('MyOrders')} className="flex-1">
            <Button size="lg" className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-base py-6">
              <Package className="w-5 h-5 mr-2" />
              Track My Orders
            </Button>
          </Link>
          <Link to={createPageUrl('OrderOnline')} className="flex-1">
            <Button size="lg" variant="outline" className="w-full text-base py-6 border-2">
              <RotateCcw className="w-5 h-5 mr-2" />
              Order Again
            </Button>
          </Link>
          <Link to={createPageUrl('Home')} className="flex-1">
            <Button size="lg" variant="ghost" className="w-full text-base py-6">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Home
            </Button>
          </Link>
        </motion.div>

        <motion.p
          className="text-center text-gray-500 italic text-sm mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          "Made with love, served with pride. Thank you for choosing Oishi's Kitchen!" ❤️
        </motion.p>

      </div>
    </div>
  );
}
