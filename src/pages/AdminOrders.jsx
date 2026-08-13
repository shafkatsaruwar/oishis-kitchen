import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, ADMIN_EMAIL } from '@/lib/supabase';
import { Calendar, Phone, Mail, Package, Search, Filter, Printer, DollarSign, Undo2, FileText, PhoneCall, Star, FlaskConical } from 'lucide-react';
import LabelPrintDialog from '../components/admin/LabelPrintDialog';
import PaymentDialog from '../components/admin/PaymentDialog';
import InvoiceDialog from '../components/admin/InvoiceDialog';
import PhoneOrderDialog from '../components/admin/PhoneOrderDialog';
import { recordPayment, reversePayment, setOrderFlags } from '@/lib/orderMutations';
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
  const [labelOrder, setLabelOrder] = useState(null);
  const [payOrder, setPayOrder] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [showPhoneOrder, setShowPhoneOrder] = useState(false);
  const [hideTestOrders, setHideTestOrders] = useState(true);
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

  const invalidateOrders = () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] });

  const paymentMutation = useMutation({
    mutationFn: ({ orderId, method }) => recordPayment(orderId, method),
    onSuccess: () => {
      invalidateOrders();
      setPayOrder(null);
      toast.success('Payment recorded');
    },
    onError: (e) => toast.error(e.message || 'Payment not recorded'),
  });

  const reverseMutation = useMutation({
    mutationFn: (orderId) => reversePayment(orderId),
    onSuccess: () => {
      invalidateOrders();
      toast.success('Payment reversed');
    },
    onError: (e) => toast.error(e.message || 'Could not reverse payment'),
  });

  const flagsMutation = useMutation({
    mutationFn: ({ orderId, isTest, isVip }) => setOrderFlags(orderId, { isTest, isVip }),
    onSuccess: invalidateOrders,
    onError: (e) => toast.error(e.message || 'Could not update tags'),
  });

  const filteredOrders = orders?.filter(order => {
    const matchesSearch =
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesTestFilter = !hideTestOrders || order.is_test !== true;

    return matchesSearch && matchesStatus && matchesTestFilter;
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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Orders</h1>
          <p className="text-gray-600 mb-5">Manage and fulfill customer orders</p>
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Button
              onClick={() => setShowPhoneOrder(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <PhoneCall className="w-4 h-4 mr-2" />
              New Phone Order
            </Button>
            <Button
              variant="outline"
              onClick={() => setHideTestOrders((v) => !v)}
              className={hideTestOrders ? 'border-gray-300 text-gray-600' : 'border-orange-400 text-orange-600'}
            >
              <FlaskConical className="w-4 h-4 mr-2" />
              {hideTestOrders ? 'Test orders hidden' : 'Showing test orders'}
            </Button>
          </div>
        </motion.div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statusOptions.map((status) => (
            <Card key={status.value} className="bg-white border-gray-200 shadow-md">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-amber-600">{statusCounts[status.value] || 0}</div>
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLabelOrder(order)}
                        className="border-amber-400 text-amber-700 hover:bg-amber-50"
                      >
                        <Printer className="w-4 h-4 mr-1" />
                        Labels
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {statusOptions.map((status) => (
                        <Button
                          key={status.value}
                          size="sm"
                          variant={order.status === status.value ? 'default' : 'outline'}
                          onClick={() => updateStatusMutation.mutate({ orderId: order.id, newStatus: status.value })}
                          className={order.status === status.value
                            ? 'bg-amber-500 hover:bg-amber-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'}
                        >
                          {status.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100 mt-3">
                    {order.payment_status === 'paid' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reverseMutation.mutate(order.id)}
                        disabled={reverseMutation.isPending}
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        <Undo2 className="w-4 h-4 mr-1" />
                        Undo payment
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setPayOrder(order)}
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        Record payment
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setInvoiceOrder(order)}
                      className="border-gray-300 text-gray-700"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      {order.payment_status === 'paid' ? 'Receipt' : 'Invoice'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        flagsMutation.mutate({
                          orderId: order.id,
                          isTest: order.is_test === true,
                          isVip: !(order.is_vip === true),
                        })
                      }
                      className={order.is_vip ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-gray-300 text-gray-600'}
                    >
                      <Star className="w-4 h-4 mr-1" />
                      VIP
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        flagsMutation.mutate({
                          orderId: order.id,
                          isTest: !(order.is_test === true),
                          isVip: order.is_vip === true,
                        })
                      }
                      className={order.is_test ? 'border-gray-400 bg-gray-100 text-gray-700' : 'border-gray-300 text-gray-600'}
                    >
                      <FlaskConical className="w-4 h-4 mr-1" />
                      Test
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6 mb-4">
                    <div>
                      <p className="text-sm text-amber-600 mb-2 font-medium">Customer</p>
                      <p className="font-semibold text-gray-900 text-lg">{order.customer_name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                        <Mail className="w-4 h-4 text-amber-600" />
                        {order.customer_email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                        <Phone className="w-4 h-4 text-amber-600" />
                        {order.customer_phone}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-amber-600 mb-2 font-medium">Pickup Details</p>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Calendar className="w-4 h-4 text-amber-600" />
                        <span className="font-semibold">
                          {(() => {
                            const d = new Date(order.pickup_date);
                            return isNaN(d.getTime())
                              ? order.pickup_date
                              : format(d, 'MMM dd, yyyy');
                          })()}
                        </span>
                      </div>
                      <p className="text-gray-700 ml-6 mt-1 font-medium">{order.pickup_time}</p>
                      <p className="text-sm text-gray-600 mt-3">
                        Placed: {format(new Date(order.created_at), 'MMM dd, h:mm a')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-amber-600 mb-2 font-medium">Payment</p>
                      <p className="text-3xl font-bold text-amber-600">${order.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-700 mt-1 font-medium">
                        {order.payment_status === 'paid' ? '✓ Paid' : 'Pay on Pickup'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="w-5 h-5 text-amber-600" />
                      <h4 className="font-semibold text-amber-600">Order Items</h4>
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
                      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm text-amber-600 mb-1 font-medium">Special Requests:</p>
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

      <LabelPrintDialog
        key={labelOrder?.id}
        order={labelOrder}
        isOpen={!!labelOrder}
        onClose={() => setLabelOrder(null)}
      />

      <PaymentDialog
        key={payOrder?.id}
        order={payOrder}
        isOpen={!!payOrder}
        onClose={() => setPayOrder(null)}
        isSaving={paymentMutation.isPending}
        onRecord={(method) => paymentMutation.mutate({ orderId: payOrder.id, method })}
      />

      <InvoiceDialog
        key={invoiceOrder?.id}
        order={invoiceOrder}
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />

      <PhoneOrderDialog
        isOpen={showPhoneOrder}
        onClose={() => setShowPhoneOrder(false)}
        onCreated={invalidateOrders}
      />
    </div>
  );
}
