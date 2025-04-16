import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLocation } from 'react-router-dom';
import {
  MessageSquare,
  Store,
  Home,
  Book,
  MessageCircle,
} from 'lucide-react';
import { motion, useScroll } from 'framer-motion';
import { useEffect, useState } from 'react';

export function FeatureNavbar() {
  const location = useLocation();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const isMessagingPage = location.pathname.includes('/messaging');

  // Track scroll position to add blur and hide names
  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      setIsScrolled(latest > 60);
    });
    return () => unsubscribe();
  }, [scrollY]);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Channels', path: '/messaging', icon: MessageSquare },
    { name: 'Marketplace', path: '/marketplace', icon: Store },
    { name: 'Chat', path: '/chat', icon: MessageCircle },
    { name: 'Courses', path: '/courses', icon: Book },
  ];

  return (
    <motion.div
      className={`flex transition-all duration-300 bg-accent/50 dark:bg-accent/10 p-1.5 sticky top-0 z-40 rounded-full space-x-8 self-center mx-auto ${
        isMessagingPage ? 'mb-1' : 'my-3'
      }`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {navItems.map((item) => {
        const isActive =
          item.path === '/'
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
        const Icon = item.icon;

        return (
          <Link
            key={item.path}
            to={item.path}
            className="group flex flex-col items-center justify-center relative py-1.5 px-2"
          >
            <motion.div
              className={cn(
                'flex items-center justify-center rounded-full p-2 transition-all duration-200',
                isActive
                  ? 'bg-primary/20 dark:bg-primary/30 text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20'
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
                  : 'text-muted-foreground group-hover:text-primary/90',
                isScrolled && 'opacity-0 absolute pointer-events-none'
              )}
            >
              {item.name}
            </span>

            {isActive && (
              <motion.div
                className="absolute h-0.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40 rounded-full -bottom-1 w-full"
                layoutId="activeFeatureNav"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </Link>
        );
      })}
    </motion.div>
  );
}
