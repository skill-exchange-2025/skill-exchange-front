import { useState, useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import {
  useProfileStatus,
  useProfileError,
} from '@/redux/features/profile/profileSlice';
import { ProfileView } from '@/components/Profile/ProfileView';
import { ProfileForm } from '@/components/Profile/ProfileForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCurrentProfile } from '@/redux/features/profile/profileSlice.ts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

// Profile skeleton component
const ProfileSkeleton = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="w-full max-w-3xl mx-auto p-8">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>

          {/* Profile completion */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full mb-3" />
            <div className="space-y-2 mt-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>

          {/* Main content */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-48" />
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-64" />
            </div>
            <div className="flex items-center space-x-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-40" />
            </div>

            <Skeleton className="h-32 w-full mt-4" />

            <div className="flex flex-wrap gap-2 mt-4">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<string>('view');
  const status = useAppSelector(useProfileStatus);
  const error = useAppSelector(useProfileError);
  const profile = useAppSelector(useCurrentProfile);

  // Set tab to view when profile loads
  useEffect(() => {
    if (profile) {
      setActiveTab('view');
    }
  }, [profile]);

  if (status === 'loading') {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="w-full max-w-3xl mx-auto p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Create Your Profile</h1>
            <p className="text-muted-foreground">
              Tell us about yourself to get started
            </p>
          </div>
          <ProfileForm />
        </Card>
      </div>
    );
  }

  if (status === 'failed' && error !== 'No profile found') {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="w-full max-w-3xl mx-auto p-8">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              {error || 'Failed to load profile'}
            </AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()} className="w-full">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-muted-foreground">
            Manage how others see you on the platform
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="view">View Profile</TabsTrigger>
              <TabsTrigger value="edit">Edit Profile</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="view" className="mt-0">
            <ProfileView />
          </TabsContent>

          <TabsContent value="edit" className="mt-0">
            <ProfileForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
