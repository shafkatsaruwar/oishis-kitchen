import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Calendar, MapPin, Phone, Mail, ChevronRight, Package, X } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import OrderStatusBadge from '../components/ordering/OrderStatusBadge';
import { format } from 'date-fns';
import { useAuth } from '@/lib/AuthContext';

export default function MyOrders() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, isLoadingAuth } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.email
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order cancelled successfully');
    },
    onError: () => {
      toast.error('Failed to cancel order');
    }
  });

  const canCancelOrder = (order) => {
    if (order.status === 'cancelled' || order.status === 'completed') return false;
    const orderTime = new Date(order.created_at).getTime();
    const now = new Date().getTime();
    const twentyMinutes = 20 * 60 * 1000;
    return (now - orderTime) < twentyMinutes;
  };

  const handleCancelOrder = (order) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      cancelOrderMutation.mutate(order.id);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍛</div>
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>);
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md">

          <div className="text-8xl mb-6">🔐</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Login Required</h1>
          <p className="text-xl text-gray-600 mb-8">
            Please log in to view your orders
          </p>
          <Link to={`${createPageUrl('Login')}?redirect=${createPageUrl('MyOrders')}`}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700">
              Log In / Sign Up
            </Button>
          </Link>
        </motion.div>
      </div>);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🍛</div>
          <p className="text-xl text-gray-600">Loading your orders...</p>
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            My <span className="text-cyan-600">Orders</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8">Track your orders and pickup details</p>
        </motion.div>

        {!orders || orders.length === 0 ?
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16">

            <div className="text-8xl mb-6">📦</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Orders Yet</h2>
            <p className="text-xl text-gray-600 mb-8">
              Start your first order and it will appear here!
            </p>
            <Link to={createPageUrl('OrderOnline')}>
              <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800">
                Browse Menu
              </Button>
            </Link>
          </motion.div> :

        <div className="space-y-6">
            {orders.map((order, idx) =>
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">
                            Order #{order.order_number}
                          </h3>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-gray-500">
                          Placed on {format(new Date(order.created_at), 'MMM dd, yyyy - h:mm a')}
                        </p>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="text-3xl font-bold text-cyan-600">
                          ${order.total.toFixed(2)}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {order.payment_status === 'paid' ? '✓ Paid' : 'Cash Only'}
                        </p>
                        {canCancelOrder(order) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelOrder(order)}
                            className="border-red-500 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Pickup Date & Time</p>
                            <p className="text-gray-900 font-semibold">
                              {format(new Date(order.pickup_date), 'EEEE, MMM dd, yyyy')}
                            </p>
                            <p className="text-gray-900">{order.pickup_time}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Pickup Location</p>
                            <p className="text-gray-900 font-semibold">21 Concord St, #2, Malden, MA 02148</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Mail className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Contact Email</p>
                            <p className="text-gray-900 font-semibold">{order.customer_email}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-gray-900 font-semibold">{order.customer_phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">Order Items</h4>
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, itemIdx) =>
                    <div key={itemIdx} className="flex justify-between text-sm">
                            <span className="text-gray-700">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-semibold text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                    )}
                      </div>
                      {order.special_requests &&
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-gray-500 mb-1">Special Requests:</p>
                          <p className="text-sm text-gray-700">{order.special_requests}</p>
                        </div>
                  }
                    </div>

                    {order.status === 'ready' &&
                <div className="mt-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border-2 border-cyan-300">
                        <p className="text-center font-bold text-cyan-900 text-lg">
                          🎉 Your order is ready for pickup! See you soon!
                        </p>
                      </div>
                }
                  </CardContent>
                </Card>
              </motion.div>
          )}
          </div>
        }

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center">

          <Link to={createPageUrl('OrderOnline')}>
            <Button variant="outline" size="lg">
              Place Another Order
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>);

}
