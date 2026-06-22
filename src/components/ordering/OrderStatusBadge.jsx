import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Loader2, Package, XCircle } from 'lucide-react';

export default function OrderStatusBadge({ status }) {
  const statusConfig = {
    pending: {
      label: 'Order Received',
      icon: Clock,
      className: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    confirmed: {
      label: 'Confirmed',
      icon: CheckCircle,
      className: 'bg-green-100 text-green-800 border-green-300',
    },
    preparing: {
      label: 'Preparing',
      icon: Loader2,
      className: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    ready: {
      label: 'Ready for Pickup',
      icon: Package,
      className: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle,
      className: 'bg-gray-100 text-gray-800 border-gray-300',
    },
    cancelled: {
      label: 'Cancelled',
      icon: XCircle,
      className: 'bg-red-100 text-red-800 border-red-300',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} border px-3 py-1.5 text-sm font-semibold`}>
      <Icon className={`w-4 h-4 mr-1.5 inline ${status === 'preparing' ? 'animate-spin' : ''}`} />
      {config.label}
    </Badge>
  );
}