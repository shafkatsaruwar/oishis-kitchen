import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Menu, User, LogOut, UtensilsCrossed } from 'lucide-react';
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
    <div className="min-h-screen bg-cream-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-cream-300">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Oishi's Kitchen" className="w-9 h-9 object-contain" />
              <span className="font-playfair text-xl font-bold text-stone-900">
                Oishi's Kitchen
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-7">
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
                  className={`font-karla font-medium whitespace-nowrap transition-colors duration-200 ${currentPageName === page ? 'text-terracotta-600' : 'text-stone-600 hover:text-terracotta-600'}`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Link to={createPageUrl('OrderOnline')} className="hidden sm:block">
                <Button className="bg-terracotta-600 hover:bg-terracotta-700 text-white font-karla font-semibold">
                  <Menu className="w-4 h-4 mr-2" />
                  Menu & Order
                </Button>
              </Link>
              <Link to={createPageUrl('OrderOnline')} className="sm:hidden">
                <Button size="icon" className="bg-terracotta-600 hover:bg-terracotta-700 text-white">
                  <UtensilsCrossed className="w-5 h-5" />
                </Button>
              </Link>

              <Link to={createPageUrl('Cart')} className="relative">
                <Button variant="outline" size="icon" className="border-cream-400 text-stone-600 hover:bg-cream-100 hover:text-terracotta-600">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-terracotta-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              <div className="hidden md:block">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="border-cream-400 text-stone-600 hover:bg-cream-100 hover:text-terracotta-600">
                        <User className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-cream-300">
                      <DropdownMenuItem asChild className="text-stone-700 hover:text-terracotta-600 font-karla">
                        <Link to={createPageUrl('MyOrders')} className="cursor-pointer">
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem asChild className="text-stone-700 hover:text-terracotta-600 font-karla">
                          <Link to={createPageUrl('AdminOrders')} className="cursor-pointer">
                            Manage Orders
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-red-500 hover:bg-red-50 font-karla"
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
                      className="border-cream-400 text-stone-600 hover:bg-cream-100 hover:text-terracotta-600 font-karla"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Log In
                    </Button>
                  </Link>
                )}
              </div>

              <MobileMenu user={user} isAdmin={isAdmin} onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main content with padding for fixed nav */}
      <div className="pt-20">
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
