import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Package,
  MessageSquare,
  Store,
  Heart,
  Home,
} from 'lucide-react';
import { motion, useScroll } from 'framer-motion';
import { useEffect, useState } from 'react';

export function FeatureNavbar() {
  const location = useLocation();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position to add shadow and background opacity
  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      setIsScrolled(latest > 60); // Adjust this value based on your navbar height
    });
    return () => unsubscribe();
  }, [scrollY]);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Channels', path: '/channels', icon: MessageSquare },
    { name: 'Marketplace', path: '/marketplace', icon: Store },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Favorites', path: '/favorites', icon: Heart },
  ];

  return (
    <motion.nav
      className={cn(
        'sticky top-0 z-40 backdrop-blur transition-all duration-300',
        isScrolled
          ? 'bg-background/60 border-b border-border/40 shadow-sm'
          : 'bg-background/30'
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-center">
          <div className="flex space-x-10">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="group flex flex-col items-center justify-center relative py-2"
                >
                  <motion.div
                    className={cn(
                      'flex items-center justify-center rounded-full p-2.5 transition-all duration-200',
                      isActive
                        ? 'bg-primary/15 text-primary shadow-sm shadow-primary/10'
                        : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                    )}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>

                  <span
                    className={cn(
                      'text-xs mt-1.5 font-medium transition-all duration-200',
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground/80 group-hover:text-primary/90'
                    )}
                  >
                    {item.name}
                  </span>

                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 h-0.5 w-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 rounded-full"
                      layoutId="activeFeatureNav"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
