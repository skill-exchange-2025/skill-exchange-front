import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
// import Navbar from "../ui/custom/others/Navbar";
import Sidebar from './Sidebar';
import { Navbar } from './navbar';
import { Footer } from './footer'; // You'll need to create this component

const { Content } = Layout;

const DashboardLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <Layout>
        <Navbar />
        <Content className="bg-background">
          <div
            style={{
              padding: 24,
              minHeight: 360,
              overflow: 'hidden',
            }}
          >
            <Outlet />
          </div>
        </Content>
        <Footer />
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
