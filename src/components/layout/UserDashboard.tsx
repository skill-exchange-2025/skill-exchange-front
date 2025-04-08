import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
// import Navbar from "../ui/custom/others/Navbar";
import { Navbar } from './navbar';
import { Footer } from './footer';
import {FeatureNavbar} from "@/components/layout/FeatureNavbar.tsx"; // You'll need to create this component

const { Content } = Layout;

const UserDashboard = () => {
    return (
        <Layout style={{ minHeight: '100vh', overflow: 'hidden' }}>
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
                        <FeatureNavbar></FeatureNavbar>
                        <Outlet />
                    </div>
                </Content>
                <Footer />
            </Layout>
        </Layout>
    );
};

export default UserDashboard;
