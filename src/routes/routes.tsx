import {createBrowserRouter} from 'react-router-dom';
import App from '../App';
import {LandingPage} from '@/pages/landing';
import {About} from '@/pages/About';
import {Contact} from '@/pages/Contact';
import {Help} from '@/pages/help';
import {Privacy} from '@/pages/privacy';
import {Terms} from '@/pages/terms';
import {SignUp} from '@/pages/auth/sign-up';
import {ForgotPassword} from '@/pages/auth/forgot-password';
import {Layout} from '@/components/layout/layout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import PublicRoute from '@/components/layout/PublicRoute';
import AdminRoutes from './AdminRoutes';
import UserRoutes from './UserRoutes';
import DashboardLayout from '@/components/layout/DashboardLayout';
import UserDashboard from '@/components/layout/UserDashboard';
import LoginForm from '@/pages/auth/Login';
import {VerifyEmail} from '@/pages/auth/verify-email';
import {MarketplacePage} from '@/pages/marketplace';
import {MarketplaceItemDetail} from '@/pages/marketplace/item-detail';
import {CreateEditMarketplaceItem} from '@/pages/marketplace/create-edit-item';
import {ListingTypeSelection} from '@/pages/marketplace/listing-type-selection';
import {TransactionsPage} from '@/pages/marketplace/transactions';
import MessagingLayout from '../pages/messaging/MessagingLayout';
import ChannelPage from '../pages/messaging/ChannelPage';
import ChannelListPage from '../pages/messaging/ChannelListPage';
import {CreateLesson} from '@/pages/marketplace/create-lesson';
import {EditLesson} from '@/pages/marketplace/edit-lesson';
import {LessonDetail} from '@/pages/marketplace/lesson-detail';
import ManageLessons from "@/pages/marketplace/manage-lessons.tsx";
import {CreateFeedback} from "@/pages/user/feedback/CreateFeedback.tsx";
import {FeedbackList} from "@/pages/user/feedback/FeedbackList.tsx";
import {EditFeedback} from "@/pages/user/feedback/EditFeedback.tsx";
import CodingRoomPage from "@/pages/CodingRooms/CodingRoomPage";
import CreateRoomPage from "@/pages/CodingRooms/CreateRoomPage.tsx";
import {DiscoverPage} from '@/pages/discover';
import SummarizerPage from '@/pages/SummarizerPage';

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
            element: (
              <PublicRoute>
                <LoginForm />
              </PublicRoute>
            ),
          },
          { index: true, element: <LandingPage /> },
          { path: 'about', element: <About /> },
          { path: 'contact', element: <Contact /> },
          { path: 'help', element: <Help /> },
          { path: 'privacy', element: <Privacy /> },
          { path: 'terms', element: <Terms /> },
          {
            path: 'forgot-password',
            element: (
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            ),
          },
          {
            path: 'signup',
            element: (
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            ),
          },
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
                path: 'summarizer',
                element:
                    <ProtectedRoute>
                        <SummarizerPage />
                    </ProtectedRoute>
            },
            {

              path:'summarize/:lessonId',
                element:
                    <ProtectedRoute>
                        <SummarizerPage />
                    </ProtectedRoute>
          },
          {
            path: '/discover',
            element: <DiscoverPage />,
          },
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
        path: "coding-rooms/create",
        element: <CreateRoomPage />,
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [{ path: '*', element: <AdminRoutes /> },{ path: "coding-rooms/:roomId", element: <CodingRoomPage /> },],
      },
        {
            path: 'user',
            element: (
                <ProtectedRoute>
                    <UserDashboard />
                </ProtectedRoute>
            ),
            children: [
                { path: '*', element: <UserRoutes /> },
                {
                    path: 'feedback',
                    children: [
                        { index: true, element: <FeedbackList /> },
                        { path: 'create', element: <CreateFeedback /> },
                        {
                            path: 'edit/:id',
                            element: <EditFeedback />
                        },

                    ]
                }
            ],
        },
      { path: "coding-rooms/:roomId", element: <CodingRoomPage /> },
      {
        path: 'user',
        element: (
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        ),
        children: [{ path: '*', element: <UserRoutes /> },{ path: "coding-rooms/:roomId", element: <CodingRoomPage /> },],
      },
    ],
  },

]);

export default router;
