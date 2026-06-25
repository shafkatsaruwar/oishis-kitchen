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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <img src="/logo.png" alt="Oishi's Kitchen" className="w-10 h-10 object-contain" />
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                Oishi's Kitchen
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {[
                { label: 'Home', page: 'Home' },
                { label: 'About', page: 'About' },
                { label: 'Gallery', page: 'Gallery' },
                { label: 'Reviews', page: 'Reviews' },
                { label: 'Contact', page: 'Contact' },
              ].map(({ label, page }) => (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className={`transition-colors font-medium ${currentPageName === page ? 'text-cyan-600' : 'text-gray-700 hover:text-cyan-600'}`}
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Link to={createPageUrl('OrderOnline')} className="hidden sm:block">
                <Button className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800">
                  <Menu className="w-4 h-4 mr-2" />
                  Menu & Order
                </Button>
              </Link>
              <Link to={createPageUrl('OrderOnline')} className="sm:hidden">
                <Button size="icon" className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800">
                  <UtensilsCrossed className="w-5 h-5" />
                </Button>
              </Link>

              <Link to={createPageUrl('Cart')} className="relative">
                <Button variant="outline" size="icon" className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-cyan-600">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-cyan-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              <div className="hidden md:block">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-cyan-600">
                        <User className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-gray-200">
                      <DropdownMenuItem asChild className="text-gray-700 hover:text-cyan-600 hover:bg-gray-100">
                        <Link to={createPageUrl('MyOrders')} className="cursor-pointer">
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem asChild className="text-gray-700 hover:text-cyan-600 hover:bg-gray-100">
                          <Link to={createPageUrl('AdminOrders')} className="cursor-pointer">
                            Manage Orders
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-red-500 hover:bg-red-50"
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
                      className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-cyan-600"
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
