import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Moon, Sun, CreditCard } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logout, useCurrentUser } from '@/redux/features/auth/authSlice';
import { useState } from 'react';
import { CreditPurchaseDialog } from '../credits/CreditPurchaseDialog';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentUser = useAppSelector(useCurrentUser);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);

  const handleSignOut = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold">Your App</span>
          </Link>

          <div className="flex items-center space-x-4">
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
                <div className="flex items-center space-x-2">
                  <Link to="/marketplace">
                    <Button variant="ghost">Marketplace</Button>
                  </Link>
                </div>

                <div
                  className="flex items-center space-x-2 px-3 py-1 rounded-full bg-secondary cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={() => setCreditDialogOpen(true)}
                >
                  <CreditCard className="h-4 w-4" />
                  <span className="font-medium">
                    {currentUser.credits || 0}
                  </span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={currentUser.avatarUrl}
                          alt={currentUser.email}
                        />
                        <AvatarFallback>
                          {currentUser.email?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium">
                        {currentUser.roles?.join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentUser.email}
                      </p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/user/profile">Edit Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      Sign Out
                    </DropdownMenuItem>
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
