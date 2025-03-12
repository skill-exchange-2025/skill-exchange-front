import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RootState } from '@/redux/store.ts';
import {
  useFetchProfileQuery,
  useGetProfileCompletionStatusQuery,
} from '@/redux/features/profile/profileApi.ts';
import { setProfile } from '@/redux/features/profile/profileSlice.ts';
import { MapPin, Briefcase, Link, User, FileText, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

// Profile view skeleton component
const ProfileViewSkeleton = () => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Basic info section */}
          <div className="space-y-4">
            <Skeleton className="h-7 w-40" />
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-48" />
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-64" />
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Bio section */}
          <div className="space-y-3">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>

          <Separator />

          {/* Skills section */}
          <div className="space-y-3">
            <Skeleton className="h-7 w-32" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          </div>

          <Separator />

          {/* Interests section */}
          <div className="space-y-3">
            <Skeleton className="h-7 w-32" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProfileView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, status, error } = useAppSelector(
    (state: RootState) => state.profile
  );
  const { data: fetchedProfile } = useFetchProfileQuery(undefined, {
    skip: !!profile,
  });
  const { data: completionStatus, isLoading: isStatusLoading } =
    useGetProfileCompletionStatusQuery();

  useEffect(() => {
    if (fetchedProfile) {
      dispatch(setProfile(fetchedProfile));
    }
  }, [fetchedProfile, dispatch]);

  if (status === 'loading') {
    return <ProfileViewSkeleton />;
  }

  if (status === 'failed') {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || 'Failed to load profile'}</AlertDescription>
      </Alert>
    );
  }

  if (!profile) {
    return (
      <Alert>
        <AlertDescription>No profile data available</AlertDescription>
      </Alert>
    );
  }

  // Calculate profile completion color
  const getCompletionColor = (percentage: number) => {
    if (percentage === 100) return 'bg-green-600';
    if (percentage > 75) return 'bg-emerald-500';
    if (percentage > 50) return 'bg-blue-600';
    if (percentage > 25) return 'bg-amber-500';
    return 'bg-orange-500';
  };

  return (
    <Card className="w-full overflow-hidden border-none shadow-md">
      {/* Profile Header with Background */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="absolute -bottom-16 left-6">
          <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center overflow-hidden">
            <User className="h-16 w-16 text-gray-400" />
          </div>
        </div>
      </div>

      <CardContent className="pt-20 px-6 pb-6">
        {/* Completion Status Section */}
        {!isStatusLoading && completionStatus && (
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">
                Profile Completion
              </h3>
              <Badge
                variant={
                  completionStatus.percentage === 100 ? 'default' : 'secondary'
                }
              >
                {completionStatus.percentage}%
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${getCompletionColor(
                  completionStatus.percentage
                )}`}
                style={{ width: `${completionStatus.percentage}%` }}
              />
            </div>
            {completionStatus.missingFields &&
              completionStatus.missingFields.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Missing information:
                  </p>
                  <ul className="space-y-1">
                    {completionStatus.missingFields.map((field, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-600 flex items-center"
                      >
                        <span className="mr-2">•</span>
                        {field}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}

        {/* Main Profile Content */}
        <div className="space-y-6">
          {/* Bio Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Bio</h3>
            </div>
            <p className="text-gray-700 leading-relaxed pl-7">
              {profile.bio || 'No bio provided'}
            </p>
          </div>

          <Separator />

          {/* Description Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Description</h3>
            </div>
            <p className="text-gray-700 leading-relaxed pl-7">
              {profile.description || 'No description provided'}
            </p>
          </div>

          <Separator />

          {/* Location & Profession Section - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Location</h3>
              </div>
              <p className="text-gray-700 pl-7">
                {profile.location || 'No location provided'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Profession</h3>
              </div>
              <p className="text-gray-700 pl-7">
                {profile.profession || 'No profession provided'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Interests Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Interests</h3>
            </div>
            <div className="flex flex-wrap gap-2 pl-7">
              {profile.interests && profile.interests.length > 0 ? (
                profile.interests.map((interest, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800"
                  >
                    {interest}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-600">No interests added</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Social Links Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Link className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Social Links</h3>
            </div>
            <div className="space-y-2 pl-7">
              {profile.socialLinks && profile.socialLinks.length > 0 ? (
                profile.socialLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link}
                    className="block text-blue-600 hover:text-blue-800 hover:underline transition-colors flex items-center gap-2"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Link className="h-4 w-4" />
                    {link}
                  </a>
                ))
              ) : (
                <p className="text-gray-600">No social links added</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
