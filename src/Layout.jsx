import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogOut, UtensilsCrossed } from 'lucide-react';
import { CartProvider, useCart } from './components/ordering/CartContext';
import { useAuth } from '@/lib/AuthContext';
import { ADMIN_EMAIL } from '@/lib/supabase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MobileMenu from './components/layout/MobileMenu';

function LayoutContent({ children, currentPageName }) {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const handleLogout = async () => {
    await logout();
    navigate(createPageUrl('Home'));
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <img src="/logo.png" alt="Oishi's Kitchen" className="w-8 h-8 object-contain" />
              <span className="font-cormorant text-xl font-medium text-ink-900 leading-none whitespace-nowrap">
                Oishi's Kitchen
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {[
                { label: 'Home', page: 'Home' },
                { label: 'About', page: 'About' },
                { label: 'Gallery', page: 'Gallery' },
                { label: 'Reviews', page: 'Reviews' },
                { label: 'Hey There!', page: 'Contact' },
              ].map(({ label, page }) => (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className={`font-dm text-sm whitespace-nowrap transition-colors duration-150 pb-0.5 ${
                    currentPageName === page
                      ? 'text-ink-900 border-b border-gold-500'
                      : 'text-ink-500 hover:text-ink-900'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Link to={createPageUrl('OrderOnline')} className="hidden lg:block">
                <Button className="bg-ink-900 hover:bg-ink-700 text-ink-50 font-dm font-medium text-xs tracking-widest uppercase rounded px-5">
                  <UtensilsCrossed className="w-3.5 h-3.5 mr-2" />
                  Menu & Order
                </Button>
              </Link>
              <Link to={createPageUrl('OrderOnline')} className="lg:hidden">
                <Button size="icon" className="bg-ink-900 hover:bg-ink-700 text-ink-50 rounded">
                  <UtensilsCrossed className="w-4 h-4" />
                </Button>
              </Link>

              <Link to={createPageUrl('Cart')} className="relative">
                <Button variant="outline" size="icon" className="border-ink-200 text-ink-600 hover:bg-ink-50 hover:text-ink-900 rounded">
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gold-500 text-ink-900 text-xs rounded-full w-4.5 h-4.5 w-5 h-5 flex items-center justify-center font-bold text-[10px]">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              <div className="hidden lg:block">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="border-ink-200 text-ink-600 hover:bg-ink-50 hover:text-ink-900 rounded">
                        <User className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-ink-100">
                      <DropdownMenuItem asChild className="font-dm text-ink-700 hover:text-ink-900">
                        <Link to={createPageUrl('MyOrders')} className="cursor-pointer">
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem asChild className="font-dm text-ink-700 hover:text-ink-900">
                          <Link to={createPageUrl('AdminOrders')} className="cursor-pointer">
                            Manage Orders
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-red-500 hover:bg-red-50 font-dm"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link to={createPageUrl('Login')}>
                    <Button
                      variant="outline"
                      className="border-ink-200 text-ink-600 hover:bg-ink-50 hover:text-ink-900 font-dm text-sm rounded px-4"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Log In
                    </Button>
                  </Link>
                )}
              </div>

              <div className="lg:hidden">
                <MobileMenu user={user} isAdmin={isAdmin} onLogout={handleLogout} />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-[65px]">
        {children}
      </div>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <CartProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </CartProvider>
  );
}
