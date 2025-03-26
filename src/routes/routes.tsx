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
import { LessonList } from '@/components/lessons/LessonList';
import { LessonViewer } from '@/components/lessons/LessonViewer';
import { LessonCreator } from '@/components/lessons/LessonCreator';
import { LessonEditor } from '@/components/lessons/LessonEditor';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: 'verify-email', element: <VerifyEmail /> },
      {
        element: <Layout />,
        children: [
          // Auth routes
          { path: 'login', element: <LoginForm /> },
          { path: 'signup', element: <SignUp /> },
          { path: 'forgot-password', element: <ForgotPassword /> },

          // Public routes
          { index: true, element: <LandingPage /> },
          { path: 'about', element: <About /> },
          { path: 'contact', element: <Contact /> },
          { path: 'help', element: <Help /> },
          { path: 'privacy', element: <Privacy /> },
          { path: 'terms', element: <Terms /> },

          // Marketplace routes
          { path: 'marketplace', element: <ListingTypeSelection /> },
          { path: 'marketplace/all', element: <MarketplacePage /> },
          {
            path: 'marketplace/courses',
            element: <MarketplacePage type="course" />
          },
          {
            path: 'marketplace/online-courses',
            element: <MarketplacePage type="onlineCourse" />
          },
          {
            path: 'marketplace/item/:id',
            element: <MarketplaceItemDetail />
          },

          // Protected marketplace routes
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

          // Lesson routes
          {
            path: 'marketplace/courses/:courseId/lessons',
            element: (
                <ProtectedRoute>
                  <LessonList listingId=":courseId" isOwner={false} />
                </ProtectedRoute>
            ),
          },
          {
            path: 'marketplace/courses/:courseId/lessons/create',
            element: (
                <ProtectedRoute>
                  <LessonCreator
                      listingId=":courseId"
                      onCreated={() => {}}
                  />
                </ProtectedRoute>
            ),
          },
          {
            path: 'marketplace/courses/:courseId/lessons/:lessonId',
            element: (
                <ProtectedRoute>
                  <LessonViewer
                      lesson={{ title: '', content: '' }}
                      onClose={() => {}}
                  />
                </ProtectedRoute>
            ),
          },
          {
            path: 'marketplace/courses/:courseId/lessons/:lessonId/edit',
            element: (
                <ProtectedRoute>
                  <LessonEditor
                      lesson={{
                        _id: '',
                        title: '',
                        description: '',
                        content: ''
                      }}
                      onCancel={() => {}}
                      onUpdated={() => {}}
                  />
                </ProtectedRoute>
            ),
          },
        ],
      },

      // Dashboard routes
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