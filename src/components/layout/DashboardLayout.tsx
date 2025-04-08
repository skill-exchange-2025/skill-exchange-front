import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
// import Navbar from "../ui/custom/others/Navbar";
import Sidebar from './Sidebar';
import { Navbar } from './navbar';
import { Footer } from './footer'; // You'll need to create this component
import { FeatureNavbar } from './FeatureNavbar';
import { useAppSelector } from '@/redux/hooks';
import { useCurrentUser } from '@/redux/features/auth/authSlice';

const { Content } = Layout;

const DashboardLayout = () => {
  const currentUser = useAppSelector(useCurrentUser);

  return (
    <Layout style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <Layout className="flex flex-col">
        <Navbar />
        {currentUser && <FeatureNavbar />}
        <Content className="bg-background dark:bg-background">
          <div className="max-w-[1200px] mx-auto p-5 min-h-[calc(100vh-120px)]">
            <Outlet />
          </div>
        </Content>
        <Footer />
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
