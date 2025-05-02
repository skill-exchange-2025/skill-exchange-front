import {Link, useNavigate} from 'react-router-dom';
import {Button} from '@/components/ui/button';
import {Bell, Moon, Sun} from 'lucide-react';
import cryptoIcon from '@/assets/icons/crypto.png';
import logoImage from '@/assets/icons/logo.png';
import {useTheme} from '@/components/theme-provider';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {useAppDispatch, useAppSelector} from '@/redux/hooks';
import {logout, useCurrentUser} from '@/redux/features/auth/authSlice';
import {useEffect, useState} from 'react';
import {CreditPurchaseDialog} from '../credits/CreditPurchaseDialog';
import {useGetUserCreditsQuery} from '@/redux/features/credits/creditsApi';
import {useCurrentProfile} from '@/redux/features/profile/profileSlice';
import {useFetchProfileQuery} from '@/redux/features/profile/profileApi';
import {Badge} from '@/components/ui/badge';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector(useCurrentUser);
  const userProfile = useAppSelector(useCurrentProfile);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      message: string;
      type: 'transaction' | 'system';
      read: boolean;
    }>
  >([]);
  const { data: creditsData } = useGetUserCreditsQuery();

  // Fetch profile if we have a user but no profile
  const { refetch: refetchProfile } = useFetchProfileQuery(undefined, {
    skip: !currentUser || !!userProfile,
  });

  // Listen for notification events
  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      const { message, type } = event.detail;
      addNotification(message, type);
    };

    window.addEventListener(
      'addNotification',
      handleNotification as EventListener
    );
    return () => {
      window.removeEventListener(
        'addNotification',
        handleNotification as EventListener
      );
    };
  }, []);

  // Try to load profile if user exists but profile doesn't
  useEffect(() => {
    if (currentUser && !userProfile) {
      refetchProfile();
    }
  }, [currentUser, userProfile, refetchProfile]);

  const handleSignOut = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Helper function to safely get avatar URL
  const getAvatarUrl = () => {
    try {
      // Check if the avatar URL needs a base URL prepended
      const avatarUrl = userProfile?.avatarUrl || '';
      if (!avatarUrl) return '';

      if (avatarUrl && !avatarUrl.startsWith('http')) {
        return `http://localhost:5000${avatarUrl}`;
      }
      return avatarUrl;
    } catch (error) {
      console.error('Error getting avatar URL:', error);
      return '';
    }
  };

  // Helper function to get username
  const getDisplayName = () => {
    try {
      return (
        userProfile?.user?.name ||
        currentUser?.name ||
        currentUser?.email?.split('@')[0] ||
        ''
      );
    } catch (error) {
      console.error('Error getting display name:', error);
      return currentUser?.email?.split('@')[0] || '';
    }
  };

  // Get first letter for avatar fallback
  const getAvatarFallback = () => {
    try {
      const name = getDisplayName();
      return name.charAt(0).toUpperCase();
    } catch (error) {
      console.error('Error getting avatar fallback:', error);
      return 'U';
    }
  };

  // Function to add a new notification
  const addNotification = (message: string, type: 'transaction' | 'system') => {
    const newNotification = {
      id: Date.now().toString(),
      message,
      type,
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  // Function to mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Function to mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  // Get unread notifications count
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background dark:bg-background">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-2 group">
            <img
              src={logoImage}
              alt="Skilly Logo"
              className="h-8 w-auto group-hover:animate-[spin-once_0.7s_ease-in-out]"
            />
            <span className="font-bold text-xl transition-all duration-300 group-hover:text-[#00EC96] group-hover:text-shadow-neon-green group-hover:animate-neon-glow">
              Skilly
            </span>
          </Link>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {theme === 'dark' ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {currentUser ? (
              <div className="flex items-center space-x-4">
                {/* Credits Section */}
                <div
                  className="flex items-center space-x-2 px-3 py-1 rounded-full bg-secondary cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => setCreditDialogOpen(true)}
                >
                  <img src={cryptoIcon} alt="Credits" className="h-4 w-4" />
                  <span className="font-medium">
                    {creditsData?.balance || 0}
                  </span>
                </div>

                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="flex items-center justify-between p-2 border-b">
                      <h4 className="font-medium">Notifications</h4>
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-xs"
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <DropdownMenuItem
                            key={notification.id}
                            className={`flex flex-col items-start p-3 cursor-pointer ${
                              !notification.read ? 'bg-accent/50' : ''
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-sm font-medium">
                                {notification.message}
                              </span>
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-primary" />
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">
                              {new Date().toLocaleString()}
                            </span>
                          </DropdownMenuItem>
                        ))
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Avatar & Profile Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full overflow-hidden p-0 border border-border/40 hover:border-primary/40 transition-colors"
                      onClick={() => {
                        // If we have a user but no profile, try to fetch the profile
                        if (currentUser && !userProfile) {
                          refetchProfile();
                        }
                      }}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={getAvatarUrl()}
                          alt={currentUser?.email || ''}
                          className="object-cover"
                          onError={(e) => {
                            // Hide the image on error and show fallback
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <AvatarFallback className="dark:bg-blue-600 text-white">
                          {getAvatarFallback()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    {/* User Info Header */}
                    <div className="flex items-center gap-2 p-2 border-b border-border">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={getAvatarUrl()}
                          alt={currentUser?.email || ''}
                          onError={(e) => {
                            // Hide the image on error and show fallback
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <AvatarFallback className="dark:bg-blue-600 text-white">
                          {getAvatarFallback()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {getDisplayName()}
                        </p>
                        <p className="text-xs text-muted-foreground leading-none">
                          {currentUser?.email || ''}
                        </p>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-1">
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link to="/user/profile">Manage Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link to="/user/feedback">Manage My feedbacks</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link to="/messaging">Messages</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="cursor-pointer"
                      >
                        Sign Out
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Credit Purchase Dialog */}
      <CreditPurchaseDialog
        open={creditDialogOpen}
        onOpenChange={setCreditDialogOpen}
      />
    </nav>
  );
}
