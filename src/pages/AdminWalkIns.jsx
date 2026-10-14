import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, ADMIN_EMAIL } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Store, Receipt, Search } from 'lucide-react';
import InvoiceDialog from '@/components/admin/InvoiceDialog';
import { isWalkIn } from '@/lib/orderSource';
import { cn } from '@/lib/utils';

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

/** Local midnight, so "today" means today here rather than in UTC. */
const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const methodLabel = { cash: '💵 Cash', venmo: '💙 Venmo', zelle: '💜 Zelle' };

/**
 * Counter sales, kept out of Orders.
 *
 * A walk-in is finished the moment it is rung up — there is nothing to confirm,
 * prepare or hand over — so it only clutters a queue that exists to track work
 * in progress. This is a log: what was sold, when, for how much.
 */
export default function AdminWalkIns() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['walk-in-orders'],
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

  const walkIns = useMemo(
    () => orders.filter((o) => isWalkIn(o) && o.is_test !== true),
    [orders]
  );

  const today = useMemo(() => {
    const start = startOfToday();
    return walkIns.filter((o) => new Date(o.created_at) >= start);
  }, [walkIns]);

  const shown = useMemo(() => {
    const base = showAll ? walkIns : today;
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (o) =>
        o.order_number?.toLowerCase().includes(q) ||
        o.items?.some((i) => i.name?.toLowerCase().includes(q))
    );
  }, [walkIns, today, showAll, search]);

  const takings = useMemo(
    () => shown.reduce((sum, o) => sum + Number(o.total || 0), 0),
    [shown]
  );

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
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Store className="w-7 h-7 text-amber-600" />
          <h1 className="text-3xl font-bold text-gray-900">Walk-ins</h1>
          <span className="ml-auto text-right">
            <span className="block text-2xl font-bold text-amber-600 tabular-nums">
              {money(takings)}
            </span>
            <span className="text-xs text-gray-500">
              {shown.length} sale{shown.length === 1 ? '' : 's'}
              {showAll ? ' all time' : ' today'}
            </span>
          </span>
        </div>

        <Card className="bg-white mb-6">
          <CardContent className="p-4 flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[12rem]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Order # or dish"
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAll(false)}
              className={cn('border-gray-300', !showAll && 'bg-gray-900 text-white border-gray-900')}
            >
              Today
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAll(true)}
              className={cn('border-gray-300', showAll && 'bg-gray-900 text-white border-gray-900')}
            >
              All
            </Button>
          </CardContent>
        </Card>

        {isLoading ? (
          <p className="text-center text-gray-600 py-10">Loading…</p>
        ) : shown.length === 0 ? (
          <p className="text-center text-gray-600 py-10">
            {showAll ? 'No counter sales yet.' : 'No counter sales today.'}
          </p>
        ) : (
          <Card className="bg-white">
            <CardContent className="p-0 divide-y divide-gray-100">
              {shown.map((order) => (
                <div key={order.id} className="flex items-center gap-3 p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">#{order.order_number}</span>
                      <span className="text-xs text-gray-500">
                        {methodLabel[order.payment_method] || order.payment_method}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {new Date(order.created_at).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                      {' · '}
                      {order.items?.length || 0} item{(order.items?.length || 0) === 1 ? '' : 's'}
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900 tabular-nums">
                    {money(order.total)}
                  </span>
                  <button
                    onClick={() => setInvoiceOrder(order)}
                    className="text-gray-300 hover:text-amber-600"
                    aria-label={`Receipt for ${order.order_number}`}
                  >
                    <Receipt className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <InvoiceDialog
        order={invoiceOrder}
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />
    </div>
  );
}
