import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogOut, UtensilsCrossed, Phone, MessageCircle } from 'lucide-react';
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
  const isHome = currentPageName === 'Home';
  const [scrolled, setScrolled] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  const transparent = !scrolled;

  const handleLogout = async () => {
    await logout();
    navigate(createPageUrl('Home'));
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        transparent
          ? 'bg-transparent border-transparent'
          : 'bg-white/97 backdrop-blur-sm border-b border-ink-100'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Oishi's Kitchen"
                className={`w-8 h-8 object-contain transition-all duration-500 ${transparent ? 'brightness-0 invert' : ''}`}
              />
              <span className={`font-cormorant text-xl font-medium leading-none whitespace-nowrap transition-colors duration-500 ${
                transparent ? 'text-white' : 'text-ink-900'
              }`}>
                Oishi's Kitchen
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {[
                { label: 'Home', page: 'Home' },
                { label: 'About', page: 'About' },
                // { label: 'Monthly Plans', page: 'MonthlyPlans' },
                { label: 'Gallery', page: 'Gallery' },
                { label: 'Reviews', page: 'Reviews' },
                { label: 'Hey There!', page: 'Contact' },
              ].map(({ label, page }) => (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className={`font-dm text-sm whitespace-nowrap transition-colors duration-300 pb-0.5 ${
                    currentPageName === page
                      ? transparent
                        ? 'text-white border-b border-gold-400'
                        : 'text-ink-900 border-b border-gold-500'
                      : transparent
                        ? 'text-white/70 hover:text-white'
                        : 'text-ink-500 hover:text-ink-900'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Link to={createPageUrl('OrderOnline')} className="hidden lg:block">
                <Button className={`font-dm font-medium text-xs tracking-widest uppercase rounded-none px-5 h-9 transition-all duration-300 ${
                  transparent
                    ? 'bg-white text-ink-900 hover:bg-white/90 border-white'
                    : 'bg-ink-900 hover:bg-ink-700 text-white'
                }`}>
                  <UtensilsCrossed className="w-3.5 h-3.5 mr-2" />
                  Menu & Order
                </Button>
              </Link>
              <Link to={createPageUrl('OrderOnline')} className="lg:hidden">
                <Button size="icon" className={`rounded-none transition-all duration-300 ${
                  transparent ? 'bg-white/10 hover:bg-white/20 text-white border border-white/30' : 'bg-ink-900 hover:bg-ink-700 text-white'
                }`}>
                  <UtensilsCrossed className="w-4 h-4" />
                </Button>
              </Link>

              <Link to={createPageUrl('Cart')} className="relative">
                <Button variant="ghost" size="icon" className={`transition-colors duration-300 rounded-none ${
                  transparent ? 'text-white hover:bg-white/10' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                }`}>
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gold-500 text-ink-900 text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              <div className="hidden lg:block">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className={`rounded-none transition-colors duration-300 ${
                        transparent ? 'text-white hover:bg-white/10' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                      }`}>
                        <User className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-ink-100 rounded-none">
                      <DropdownMenuItem asChild className="font-dm text-ink-700 hover:text-ink-900 rounded-none">
                        <Link to={createPageUrl('MyOrders')} className="cursor-pointer">
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem asChild className="font-dm text-ink-700 hover:text-ink-900 rounded-none">
                          <Link to={createPageUrl('AdminOrders')} className="cursor-pointer">
                            Manage Orders
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {isAdmin && (
                        <DropdownMenuItem asChild className="font-dm text-ink-700 hover:text-ink-900 rounded-none">
                          <Link to={createPageUrl('AdminMenu')} className="cursor-pointer">
                            Manage Menu
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-red-500 hover:bg-red-50 font-dm rounded-none"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link to={createPageUrl('Login')}>
                    <Button variant="ghost" className={`rounded-none font-dm text-sm transition-colors duration-300 ${
                      transparent ? 'text-white hover:bg-white/10' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                    }`}>
                      <User className="w-4 h-4 mr-2" />
                      Log In
                    </Button>
                  </Link>
                )}
              </div>

              <div className="lg:hidden">
                <MobileMenu user={user} isAdmin={isAdmin} onLogout={handleLogout} transparent={transparent} />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className={`${isHome ? '' : 'pt-[65px]'} ${!['Cart', 'Checkout', 'AdminOrders', 'AdminMenu', 'MyOrders', 'Login'].includes(currentPageName) ? 'pb-[72px]' : ''}`}>
        {children}
      </div>

      {/* Sticky mobile order bar — hidden on cart/checkout pages */}
      {!['Cart', 'Checkout', 'AdminOrders', 'AdminMenu', 'MyOrders', 'Login'].includes(currentPageName) && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-ink-100 px-4 py-3 flex gap-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <Link to={createPageUrl('OrderOnline')} className="flex-1">
            <Button className="w-full bg-ink-900 hover:bg-ink-700 text-white font-dm font-medium text-sm rounded-none h-11 tracking-wide">
              Order Now
            </Button>
          </Link>
          <a href="https://wa.me/17815794965" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="border-[#25D366] text-[#25D366] hover:bg-green-50 rounded-none h-11 px-4 gap-2 font-dm text-sm">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </Button>
          </a>
          <a href="tel:+17815794965">
            <Button variant="outline" className="border-ink-200 text-ink-700 hover:bg-ink-50 rounded-none h-11 px-4 gap-2 font-dm text-sm">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Call</span>
            </Button>
          </a>
        </div>
      )}
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
