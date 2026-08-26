import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase, ADMIN_EMAIL } from '@/lib/supabase';
import {
  LayoutGrid,
  ClipboardList,
  CalendarDays,
  UtensilsCrossed,
  Boxes,
  ShoppingCart,
  Tag,
  MessageSquare,
  ExternalLink,
  Power,
  ListTodo,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// The register is the app. Everything else is a stop on the rail.
const SECTIONS = [
  { page: 'AdminPOS', label: 'Register', icon: LayoutGrid },
  { page: 'AdminOrders', label: 'Orders', icon: ClipboardList, badge: 'pendingOrders' },
  { page: 'AdminCalendar', label: 'Calendar', icon: CalendarDays },
  { page: 'AdminMenu', label: 'Menu', icon: UtensilsCrossed, badge: 'lowStock' },
  { page: 'AdminInventory', label: 'Inventory', icon: Boxes },
  { page: 'AdminGrocery', label: 'Grocery', icon: ShoppingCart },
  { page: 'AdminTasks', label: 'To-Do', icon: ListTodo },
  { page: 'AdminLabels', label: 'Labels', icon: Tag },
  { page: 'AdminReviews', label: 'Reviews', icon: MessageSquare, badge: 'pendingReviews' },
];

/**
 * A narrow icon rail, not a menu. The register fills the screen on open; orders,
 * reviews and the rest are one icon away rather than competing for attention.
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
    <div className="h-screen bg-[#f1f2f4] flex overflow-hidden">
      {/* Icon rail */}
      <aside className="w-[76px] flex-none bg-white flex flex-col items-center py-4 gap-1 border-r border-ink-100">
        <Link to={createPageUrl('AdminPOS')} className="mb-3" title="Register">
          <img src="/logo.png" alt="Oishi's" className="w-11 h-11 rounded-xl object-contain" />
        </Link>

        {SECTIONS.map(({ page, label, icon: Icon, badge }) => {
          const active = currentPageName === page;
          const count = badge ? badges[badge] : 0;
          return (
            <Link
              key={page}
              to={createPageUrl(page)}
              title={label}
              aria-label={label}
              className={cn(
                'group relative w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                active ? 'bg-amber-500 text-white' : 'text-ink-400 hover:bg-amber-50 hover:text-amber-600'
              )}
            >
              <Icon className="w-5 h-5" />
              {count > 0 && (
                <span
                  className={cn(
                    'absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center',
                    active ? 'bg-white text-amber-600' : 'bg-orange-500 text-white'
                  )}
                >
                  {count}
                </span>
              )}
              {/* Name appears on hover — the rail stays narrow */}
              <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-ink-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {label}
              </span>
            </Link>
          );
        })}

        <div className="flex-1" />

        <Link
          to={createPageUrl('Home')}
          title="View site"
          aria-label="View site"
          className="group relative w-12 h-12 rounded-xl flex items-center justify-center text-ink-400 hover:bg-ink-50"
        >
          <ExternalLink className="w-5 h-5" />
          <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-ink-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
            View site
          </span>
        </Link>
        <button
          onClick={handleLogout}
          title="Log out"
          aria-label="Log out"
          className="group relative w-12 h-12 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50"
        >
          <Power className="w-5 h-5" />
          <span className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md bg-ink-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
            Log out
          </span>
        </button>
      </aside>

      {/* Scrolls here rather than on the document: the rail stays put while long
          pages (menu, orders, inventory) run past the fold. The register opts out
          with its own h-full/overflow-hidden root and never scrolls this. */}
      <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
    </div>
  );
}
