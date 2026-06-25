import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, ADMIN_EMAIL } from '@/lib/supabase';
import { Calendar, Phone, Mail, Package, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import OrderStatusBadge from '../components/ordering/OrderStatusBadge';
import OrderAnalytics from '../components/admin/OrderAnalytics';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';

export default function AdminOrders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: user?.email === ADMIN_EMAIL,
  });

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated!');
    },
    onError: () => {
      toast.error('Failed to update order status');
    }
  });

  const filteredOrders = orders?.filter(order => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusCounts = () => {
    const counts = { pending: 0, confirmed: 0, preparing: 0, ready: 0, completed: 0, cancelled: 0 };
    orders?.forEach(order => {
      counts[order.status] = (counts[order.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-8xl mb-6">🔒</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Access Required</h1>
          <p className="text-xl text-gray-700">This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Order <span className="text-cyan-600">Management</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8">Manage and fulfill customer orders</p>
        </motion.div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statusOptions.map((status) => (
            <Card key={status.value} className="bg-white border-gray-200 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-cyan-600">{statusCounts[status.value] || 0}</div>
                <div className="text-sm text-gray-700 mt-1">{status.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics Charts */}
        <OrderAnalytics orders={orders} />

        {/* Filters */}
        <Card className="mb-8 bg-white border-gray-200 shadow-md">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by order #, name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-300 text-gray-900"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-600" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="all">All Orders</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍛</div>
            <p className="text-xl text-gray-700">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📦</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Orders Found</h2>
            <p className="text-xl text-gray-700">
              {searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'No orders yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="bg-white border-gray-200 shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <CardTitle className="text-gray-900">Order #{order.order_number}</CardTitle>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map((status) => (
                        <Button
                          key={status.value}
                          size="sm"
                          variant={order.status === status.value ? 'default' : 'outline'}
                          onClick={() => updateStatusMutation.mutate({ orderId: order.id, newStatus: status.value })}
                          className={order.status === status.value
                            ? 'bg-cyan-600 hover:bg-cyan-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'}
                        >
                          {status.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6 mb-4">
                    <div>
                      <p className="text-sm text-cyan-600 mb-2 font-medium">Customer</p>
                      <p className="font-semibold text-gray-900 text-lg">{order.customer_name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                        <Mail className="w-4 h-4 text-cyan-600" />
                        {order.customer_email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                        <Phone className="w-4 h-4 text-cyan-600" />
                        {order.customer_phone}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-cyan-600 mb-2 font-medium">Pickup Details</p>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Calendar className="w-4 h-4 text-cyan-600" />
                        <span className="font-semibold">
                          {format(new Date(order.pickup_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <p className="text-gray-700 ml-6 mt-1 font-medium">{order.pickup_time}</p>
                      <p className="text-sm text-gray-600 mt-3">
                        Placed: {format(new Date(order.created_at), 'MMM dd, h:mm a')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-cyan-600 mb-2 font-medium">Payment</p>
                      <p className="text-3xl font-bold text-cyan-600">${order.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-700 mt-1 font-medium">
                        {order.payment_status === 'paid' ? '✓ Paid' : 'Pay on Pickup'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="w-5 h-5 text-cyan-600" />
                      <h4 className="font-semibold text-cyan-600">Order Items</h4>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.quantity}x {item.name}
                            {item.special_instructions && (
                              <span className="text-gray-500 italic"> - {item.special_instructions}</span>
                            )}
                          </span>
                          <span className="font-semibold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    {order.special_requests && (
                      <div className="mt-4 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                        <p className="text-sm text-cyan-600 mb-1 font-medium">Special Requests:</p>
                        <p className="text-sm text-gray-900">{order.special_requests}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
