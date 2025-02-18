import { useState } from 'react';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { adminPaths } from '@/routes/admin.routes';
import { TUserPath } from '@/types';
import { useAppSelector } from '@/redux/hooks';
import { useCurrentUser } from '@/redux/features/auth/authSlice';
import {ChevronLeft, ChevronRight, GraduationCap} from 'lucide-react';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const SkillyLogo = () => (
    <div className="flex items-center gap-2 px-4 py-6">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <GraduationCap className="w-5 h-5 text-white" />
      </div>
      <span className="text-xl font-bold text-gray-800">Skilly</span>
    </div>
);

const Sidebar = () => {
  const currentUser = useAppSelector(useCurrentUser);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const generateMenuItems = (paths: TUserPath[]): MenuItem[] => {
    return paths.map((item) => {
      const menuItem: MenuItem = {
        key: item.path || item.name,
        icon: item.icon,
        label: item.path ? (
            <Link to={item.path}>{item.name}</Link>
        ) : (
            item.name
        ),
      };

      if (item.children) {
        menuItem?.children = generateMenuItems(item.children);
      }

      return menuItem;
    });
  };

  const currentPathKey = location.pathname.split('/').pop() || 'dashboard';

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
          {/* Logo Section */}
          <div className="flex-shrink-0">
            {collapsed ? (
                <div className="flex justify-center py-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                </div>
            ) : (
                <SkillyLogo />
            )}
          </div>

          {/* Toggle Button */}
          <button
              onClick={() => setCollapsed(!collapsed)}
              className="absolute right-0 top-16 translate-x-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            {collapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
                <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Menu Section */}
          <div className="flex-grow mt-4">
            <Menu
                mode="inline"
                selectedKeys={[currentPathKey]}
                items={generateMenuItems(adminPaths)}
                className="border-none"
            />
          </div>

          {/* Footer Section */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div className={`flex-grow ${collapsed ? 'hidden' : ''}`}>
                <div className="text-sm font-medium text-gray-700">
                  {currentUser?.roles?.join(', ')}
                </div>
                <div className="text-xs text-gray-500">{currentUser?.email}</div>
              </div>
            </div>
          </div>
        </div>
      </Sider>
  );
};

export default Sidebar;