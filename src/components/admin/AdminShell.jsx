import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase, ADMIN_EMAIL } from '@/lib/supabase';
import {
  ClipboardList,
  UtensilsCrossed,
  CalendarDays,
  ShoppingCart,
  MessageSquare,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { page: 'AdminOrders', label: 'Orders', icon: ClipboardList, badge: 'pendingOrders' },
  { page: 'AdminCalendar', label: 'Calendar', icon: CalendarDays },
  { page: 'AdminMenu', label: 'Menu', icon: UtensilsCrossed, badge: 'lowStock' },
  { page: 'AdminGrocery', label: 'Grocery', icon: ShoppingCart },
  { page: 'AdminReviews', label: 'Reviews', icon: MessageSquare, badge: 'pendingReviews' },
];

/**
 * Chrome for every admin page: one persistent nav so moving between sections is
 * a single click, with the customer-facing header, order bar and contact buttons
 * out of the way. Live counts sit on Orders and Reviews so the things that need
 * attention are visible without opening them.
 */
export default function AdminShell({ currentPageName, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const { data: badges = {} } = useQuery({
    queryKey: ['admin-badges'],
    queryFn: async () => {
      const [orders, reviews, stock] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        // Dishes running low or out. stock_qty is null when a dish isn't tracked.
        supabase.from('menu_items').select('stock_qty, low_stock_threshold').not('stock_qty', 'is', null),
      ]);
      const lowStock = (stock.data || []).filter(
        (i) => i.stock_qty <= (i.low_stock_threshold ?? 5)
      ).length;
      return {
        pendingOrders: orders.count || 0,
        pendingReviews: reviews.count || 0,
        lowStock,
      };
    },
    enabled: isAdmin,
    refetchInterval: 60_000,
  });

  const handleLogout = async () => {
    await logout();
    navigate(createPageUrl('Home'));
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col lg:flex-row">
      {/* Sidebar — becomes a top strip on narrow screens */}
      <aside className="lg:w-60 lg:min-h-screen bg-white border-b lg:border-b-0 lg:border-r border-ink-100 flex lg:flex-col lg:sticky lg:top-0 lg:h-screen">
        <div className="hidden lg:flex items-center gap-2 px-5 py-5 border-b border-ink-100">
          <img src="/logo.png" alt="" className="w-8 h-8 rounded object-contain" />
          <div>
            <p className="font-serif text-lg leading-none text-ink-900">Oishi's</p>
            <p className="text-[11px] tracking-widest text-amber-600 uppercase">Admin</p>
          </div>
        </div>

        {/* Mobile: five even columns so nothing needs scrolling. Desktop: a list. */}
        <nav className="flex lg:flex-col gap-1 p-2 lg:p-3 flex-1 w-full">
          {SECTIONS.map(({ page, label, icon: Icon, badge }) => {
            const active = currentPageName === page;
            const count = badge ? badges[badge] : 0;
            return (
              <Link
                key={page}
                to={createPageUrl(page)}
                className={cn(
                  'relative flex-1 lg:flex-none flex flex-col lg:flex-row items-center lg:gap-3 gap-0.5 px-1 lg:px-3 py-2 rounded-lg transition-colors',
                  active
                    ? 'bg-amber-500 text-white font-semibold'
                    : 'text-ink-600 hover:bg-amber-50 hover:text-amber-700'
                )}
              >
                <Icon className="w-4 h-4 flex-none" />
                <span className="text-[10px] lg:text-sm lg:flex-1 whitespace-nowrap">{label}</span>
                {count > 0 && (
                  <span
                    className={cn(
                      'text-[10px] lg:text-[11px] font-bold px-1.5 rounded-full absolute lg:static top-1 right-1 lg:top-auto lg:right-auto',
                      active ? 'bg-white/25 text-white' : 'bg-orange-100 text-orange-700'
                    )}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block p-3 border-t border-ink-100 space-y-1">
          <Link
            to={createPageUrl('Home')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-500 hover:bg-ink-50"
          >
            <ExternalLink className="w-4 h-4" />
            View site
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
