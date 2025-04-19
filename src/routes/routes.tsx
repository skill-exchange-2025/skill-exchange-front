import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import { LandingPage } from '@/pages/landing';
import { About } from '@/pages/About';
import { Contact } from '@/pages/Contact';
import { Help } from '@/pages/help';
import { Privacy } from '@/pages/privacy';
import { Terms } from '@/pages/terms';
import { SignUp } from '@/pages/auth/sign-up';
import { ForgotPassword } from '@/pages/auth/forgot-password';
import { Layout } from '@/components/layout/layout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import AdminRoutes from './AdminRoutes';
import UserRoutes from './UserRoutes';
import DashboardLayout from '@/components/layout/DashboardLayout';
import UserDashboard from '@/components/layout/UserDashboard';
import LoginForm from '@/pages/auth/Login';
import { VerifyEmail } from '@/pages/auth/verify-email';
import { MarketplacePage } from '@/pages/marketplace';
import { MarketplaceItemDetail } from '@/pages/marketplace/item-detail';
import { CreateEditMarketplaceItem } from '@/pages/marketplace/create-edit-item';
import { ListingTypeSelection } from '@/pages/marketplace/listing-type-selection';
import { TransactionsPage } from '@/pages/marketplace/transactions';
import MessagingLayout from '../pages/messaging/MessagingLayout';
import ChannelPage from '../pages/messaging/ChannelPage';
import ChannelListPage from '../pages/messaging/ChannelListPage';
import { CreateLesson } from '@/pages/marketplace/create-lesson';
// Import the EditLesson component (you'll need to create this)
import { EditLesson } from '@/pages/marketplace/edit-lesson';
import { LessonDetail } from '@/pages/marketplace/lesson-detail';
import ManageLessons from "@/pages/marketplace/manage-lessons.tsx";
import FriendsPage from '@/pages/friends';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: 'verify-email', element: <VerifyEmail /> },

      {
        element: <Layout />,
        children: [
          {
            path: 'login',
            element: <LoginForm />,
          },
          { index: true, element: <LandingPage /> },
          { path: 'about', element: <About /> },
          { path: 'contact', element: <Contact /> },
          { path: 'help', element: <Help /> },
          { path: 'privacy', element: <Privacy /> },
          { path: 'terms', element: <Terms /> },
          { path: 'forgot-password', element: <ForgotPassword /> },
          { path: 'signup', element: <SignUp /> },
          

          {
            path: 'marketplace',
            element: (
                <ProtectedRoute>
                  <ListingTypeSelection />
                </ProtectedRoute>
            ),
          },
          {
            path: 'marketplace/all',
            element: (
                <ProtectedRoute>
                  <MarketplacePage />
                </ProtectedRoute>
            ),
          },
          {
            path: 'marketplace/courses',
            element: (
                <ProtectedRoute>
                  <MarketplacePage type="course" />
                </ProtectedRoute>
            ),
          },
          {
            path: 'marketplace/online-courses',
            element: (
                <ProtectedRoute>
                  <MarketplacePage type="onlineCourse" />
                </ProtectedRoute>
            ),
          },
          {
            path: 'marketplace/item/:id',
            element: (
                <ProtectedRoute>
                  <MarketplaceItemDetail />
                </ProtectedRoute>
            ),
          },
          {
            path: 'marketplace/create',
            element: (
                <ProtectedRoute>
                  <CreateEditMarketplaceItem />
                </ProtectedRoute>
            ),
          },
          {
            path: 'marketplace/edit/:id',
            element: (
                <ProtectedRoute>
                  <CreateEditMarketplaceItem />
                </ProtectedRoute>
            ),
          },
          {
            path: 'marketplace/transactions',
            element: (
                <ProtectedRoute>
                  <TransactionsPage />
                </ProtectedRoute>
            ),
          },

          {
            path: 'marketplace/item/:id/create-lesson',
            element: (
                <ProtectedRoute>
                  <CreateLesson />
                </ProtectedRoute>
            ),
          },
          {
            path: 'marketplace/lessons/:lessonId/edit',
            element: (
                <ProtectedRoute>
                  <EditLesson />
                </ProtectedRoute>
            ),
          },
            {
                path: 'marketplace/item/:itemId/lessons',
                element: (
                    <ProtectedRoute>
                        <ManageLessons />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'marketplace/item/:itemId/lessons/:lessonId',
                element: (
                    <ProtectedRoute>
                        <LessonDetail />
                    </ProtectedRoute>
                ),
            },
            {
              path: 'chat',
              element: (
                <ProtectedRoute>
                  <FriendsPage />
                </ProtectedRoute>
              ),
            },
            {
              path: 'chat/:userId',
              element: (
                <ProtectedRoute>
                  <FriendsPage />
                </ProtectedRoute>
              )},




          {
            path: 'messaging',
            element: (
                <ProtectedRoute>
                  <MessagingLayout />
                </ProtectedRoute>
            ),
            children: [
              { index: true, element: <ChannelListPage /> },
              { path: ':channelId', element: <ChannelPage /> },
            ],
          },
        ],
      },
      {
        path: 'admin',
        element: (
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [{ path: '*', element: <AdminRoutes /> }],
      },
      {
        path: 'user',
        element: (
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
        ),
        children: [{ path: '*', element: <UserRoutes /> }],
      },
    ],
  },
]);

export default router;