import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, Image, Phone, ShoppingBag, Star, User, LogOut, Settings, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MobileMenu({ user, isAdmin, onLogout, transparent = false }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Home', path: 'Home', icon: Home },
    { name: 'About', path: 'About', icon: User },
    // { name: 'Monthly Plans', path: 'MonthlyPlans', icon: CalendarDays },
    { name: 'Gallery', path: 'Gallery', icon: Image },
    { name: 'Reviews', path: 'Reviews', icon: Star },
    { name: 'Hey There!', path: 'Contact', icon: Phone },
  ];

  return (
    <div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-none transition-colors duration-300 ${transparent ? 'text-white hover:bg-white/10' : 'text-ink-600 hover:bg-ink-50'}`}
      >
        {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-ink-900/50 z-[55] top-[65px]"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="fixed right-0 top-[65px] bottom-0 w-64 bg-white shadow-2xl z-[60] p-6 border-l border-ink-100"
              >
                <nav className="overflow-hidden">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={createPageUrl(item.path)}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 text-ink-700 hover:text-ink-900 hover:bg-ink-50 transition-colors py-3 px-3 border-b border-ink-100 last:border-b-0 rounded-sm"
                      >
                        <Icon className="w-4 h-4 text-ink-400" />
                        <span className="font-dm text-sm">{item.name}</span>
                      </Link>
                    );
                  })}
                  {user ? (
                    <>
                      <Link
                        to={createPageUrl('MyOrders')}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 text-ink-700 hover:text-ink-900 hover:bg-ink-50 transition-colors py-3 px-3 border-b border-ink-100 rounded-sm"
                      >
                        <ShoppingBag className="w-4 h-4 text-ink-400" />
                        <span className="font-dm text-sm">My Orders</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          to={createPageUrl('AdminPOS')}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 text-ink-700 hover:text-ink-900 hover:bg-ink-50 transition-colors py-3 px-3 border-b border-ink-100 rounded-sm"
                        >
                          <Settings className="w-4 h-4 text-ink-400" />
                          <span className="font-dm text-sm">Admin</span>
                        </Link>
                      )}
                      <button
                        onClick={() => { setIsOpen(false); onLogout(); }}
                        className="w-full flex items-center gap-3 text-red-500 hover:bg-red-50 transition-colors py-3 px-3 rounded-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="font-dm text-sm">Log Out</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      to={createPageUrl('Login')}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 text-ink-700 hover:text-ink-900 hover:bg-ink-50 transition-colors py-3 px-3 rounded-sm"
                    >
                      <User className="w-4 h-4 text-ink-400" />
                      <span className="font-dm text-sm">Log In</span>
                    </Link>
                  )}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
