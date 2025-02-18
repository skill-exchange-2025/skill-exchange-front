import { useState, useMemo } from 'react';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import { adminPaths } from '@/routes/admin.routes';
import { userPaths } from "@/routes/user.routes.tsx";
import { TUserPath } from '@/types';
import {useAppDispatch, useAppSelector} from '@/redux/hooks';
import {logout, useCurrentUser} from '@/redux/features/auth/authSlice';
import { ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import React from 'react';
import Sider from 'antd/es/layout/Sider';

// Types
interface User {
  email?: string;
  roles?: string[];
  permissions?: string[];
}

type MenuItem = Required<MenuProps>['items'][number] & {
  label: React.ReactNode;
  icon?: React.ReactNode;
  permissions?: string[];
  children?: MenuItem[];
  disabled?: boolean;
};

interface SkillyLogoProps {
  collapsed?: boolean;
}

interface UserProfileProps {
  user: User;
  collapsed: boolean;
}

interface ToggleButtonProps {
  collapsed: boolean;
  onToggle: () => void;
}

// Utility functions
const isReactElement = (element: NonNullable<unknown> | null | undefined): element is React.ReactElement =>
    React.isValidElement(element);

const hasUserPermission = (userPermissions: string[] | undefined, requiredPermissions: string[] | undefined): boolean => {
  if (!requiredPermissions) return true;
  if (!userPermissions) return false;
  return requiredPermissions.some(p => userPermissions.includes(p));
};

// Component for the logo
const SkillyLogo: React.FC<SkillyLogoProps> = ({ collapsed }) => {
  if (collapsed) {
    return (
        <div className="flex justify-center py-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
        </div>
    );
  }

  return (
      <div className="flex items-center gap-2 px-4 py-6">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-800">Skilly</span>
      </div>
  );
};

// Toggle button component
const ToggleButton: React.FC<ToggleButtonProps> = ({ collapsed, onToggle }) => (
    <button
        onClick={onToggle}
        className="absolute right-0 top-16 translate-x-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
    >
      {collapsed ? (
          <ChevronRight className="w-5 h-5 text-gray-600" />
      ) : (
          <ChevronLeft className="w-5 h-5 text-gray-600" />
      )}
    </button>
);

// User profile component
const UserProfile: React.FC<UserProfileProps> = ({ user, collapsed }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200" />
          <div className={`flex-grow ${collapsed ? 'hidden' : ''}`}>
            <div className="text-sm font-medium text-gray-700">
              {user.roles?.join(', ')}
            </div>
            <div className="text-xs text-gray-500">{user.email}</div>
            <button
                onClick={handleLogout}
                className="mt-2 text-xs text-red-600 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
  );
};

// Menu generator hook
const useMenuItems = (paths: TUserPath[], currentUser: User | null): MenuItem[] => {
  return useMemo(() => {
    const generateItems = (items: TUserPath[]): MenuItem[] => {
      return items.map((item) => {
        const hasPermission = hasUserPermission(currentUser?.permissions, item.permissions);

        const menuItem: MenuItem = {
          key: item.path || item.name,
          icon: item.icon && isReactElement(item.icon)
              ? React.cloneElement(item.icon, {
                className: `${!hasPermission ? 'opacity-50' : ''} ${item.icon.props.className || ''}`,
              })
              : item.icon,
          label: item.path ? (
              <Link
                  to={item.path}
                  className={!hasPermission ? 'pointer-events-none text-gray-400' : ''}
              >
                {item.name}
              </Link>
          ) : (
              <span className={!hasPermission ? 'text-gray-400' : ''}>{item.name}</span>
          ),
          disabled: !hasPermission,
          style: {
            opacity: !hasPermission ? 0.6 : 1,
            cursor: !hasPermission ? 'not-allowed' : 'pointer',
          },
        };

        if (item.children) {
          const children = generateItems(item.children);
          menuItem.children = children;
          menuItem.disabled = children.every(child => child?.disabled === true);
        }

        return menuItem;
      });
    };

    return generateItems(paths);
  }, [paths, currentUser]);
};

// Main Sidebar component
const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const currentUser = useAppSelector(useCurrentUser);

  const location = useLocation();
  const paths = currentUser?.roles?.includes("admin") ? adminPaths : userPaths;
  const menuItems = useMenuItems(paths, currentUser);

  const currentPathKey = useMemo(() =>
          location.pathname.split('/').pop() || 'dashboard',
      [location]
  );

  return (
      <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={260}
          collapsedWidth={80}
          className="min-h-screen border-r border-gray-200 bg-white"
          trigger={null}
      >
        <div className="flex flex-col h-full">
          <SkillyLogo collapsed={collapsed} />
          <ToggleButton
              collapsed={collapsed}
              onToggle={() => setCollapsed(!collapsed)}
          />

          <div className="flex-grow mt-4">
            <Menu
                mode="inline"
                selectedKeys={[currentPathKey]}
                items={menuItems}
                className="border-none"
                theme="light"
            />
          </div>

          {currentUser && (
              <UserProfile user={currentUser} collapsed={collapsed} />
          )}
        </div>
      </Sider>
  );
};

export default Sidebar;