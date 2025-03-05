import { Navbar } from './navbar';
import { Footer } from './footer';
import { Outlet } from 'react-router-dom';
import { FeatureNavbar } from './FeatureNavbar';
import { useAppSelector } from '@/redux/hooks';
import { useCurrentUser } from '@/redux/features/auth/authSlice';

export function Layout() {
  const currentUser = useAppSelector(useCurrentUser);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {currentUser && <FeatureNavbar />}
      <main className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
