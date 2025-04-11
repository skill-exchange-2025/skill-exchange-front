import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
// import Navbar from "../ui/custom/others/Navbar";
import { Navbar } from './navbar';
import { Footer } from './footer';
import { FeatureNavbar } from '@/components/layout/FeatureNavbar.tsx'; // You'll need to create this component
import { useAppSelector } from '@/redux/hooks';
import { useCurrentUser } from '@/redux/features/auth/authSlice';
import { useLocation } from 'react-router-dom';

const { Content } = Layout;

const UserDashboard = () => {
  const currentUser = useAppSelector(useCurrentUser);
  const location = useLocation();
  const isMessagingPage = location.pathname.includes('/messaging');

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {currentUser && <FeatureNavbar />}

      <main
        className={`flex-1 flex flex-col ${isMessagingPage ? 'pt-0 pb-0' : ''}`}
      >
        <div
          className={`w-full h-full ${
            isMessagingPage
              ? 'max-w-none p-0'
              : 'max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4'
          }`}
        >
          <Outlet />
        </div>
      </main>

      {!isMessagingPage && <Footer />}
    </div>
  );
};

export default UserDashboard;
