import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, ADMIN_EMAIL } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import OrderStatusBadge from '../components/ordering/OrderStatusBadge';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Orders keyed by their pickup date, so a day's cooking load is visible at a glance. */
export default function AdminCalendar() {
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const [monthStart, setMonthStart] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = useState(() => new Date().toISOString().slice(0, 10));

  const { data: orders = [] } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const byDate = useMemo(() => {
    const map = {};
    for (const o of orders) {
      if (o.is_test) continue;
      const key = o.pickup_date;
      if (!key) continue;
      (map[key] ||= []).push(o);
    }
    return map;
  }, [orders]);

  const cells = useMemo(() => {
    const year = monthStart.getFullYear();
    const month = monthStart.getMonth();
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out = Array(first.getDay()).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      out.push({ day: d, key, orders: byDate[key] || [], isToday: key === new Date().toISOString().slice(0, 10) });
    }
    return out;
  }, [monthStart, byDate]);

  const shiftMonth = (delta) =>
    setMonthStart((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

  const dayOrders = byDate[selected] || [];

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-700">Admin access only.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <CalendarDays className="w-7 h-7 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Pickup Calendar</h1>
        </div>

        <Card className="bg-white mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" onClick={() => shiftMonth(-1)} aria-label="Previous month">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <p className="font-bold text-gray-900">
                {monthStart.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
              </p>
              <Button variant="ghost" size="sm" onClick={() => shiftMonth(1)} aria-label="Next month">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
              {DAY_LABELS.map((d, i) => (
                <div key={i} className="text-xs text-gray-400 font-semibold py-1">
                  {d}
                </div>
              ))}
              {cells.map((cell, i) =>
                cell === null ? (
                  <div key={`pad-${i}`} />
                ) : (
                  <button
                    key={cell.key}
                    onClick={() => setSelected(cell.key)}
                    className={cn(
                      'aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative',
                      selected === cell.key
                        ? 'bg-amber-500 text-white'
                        : cell.orders.length > 0
                          ? 'bg-amber-50 text-amber-800'
                          : 'text-gray-600 hover:bg-gray-100',
                      cell.isToday && selected !== cell.key && 'ring-1 ring-amber-400'
                    )}
                  >
                    {cell.day}
                    {cell.orders.length > 0 && (
                      <span
                        className={cn(
                          'text-[10px] font-bold',
                          selected === cell.key ? 'text-white' : 'text-amber-600'
                        )}
                      >
                        {cell.orders.length}
                      </span>
                    )}
                  </button>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <h2 className="font-bold text-gray-900 mb-3">
          {dayOrders.length} order{dayOrders.length === 1 ? '' : 's'} on {selected}
        </h2>

        <div className="space-y-3">
          {dayOrders.map((order) => (
            <Card key={order.id} className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900">{order.customer_name}</p>
                    <p className="text-xs text-gray-500">
                      #{order.order_number} · {order.pickup_time}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-bold text-amber-600">${order.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                </div>
              </CardContent>
            </Card>
          ))}
          {dayOrders.length === 0 && (
            <p className="text-gray-500 text-center py-8">Nothing scheduled.</p>
          )}
        </div>
      </div>
    </div>
  );
}
