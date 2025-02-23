import React, {useEffect} from 'react';
import {useAppDispatch, useAppSelector} from '@/redux/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {RootState} from "@/redux/store.ts";
import {useFetchProfileQuery} from "@/redux/features/profile/profileApi.ts";
import {setProfile} from "@/redux/features/profile/profileSlice.ts";

export const ProfileView: React.FC = () => {
    const dispatch = useAppDispatch();
    const { profile, status, error } = useAppSelector((state: RootState) => state.profile);
    const { data: fetchedProfile } = useFetchProfileQuery(undefined, { skip: !!profile });

    useEffect(() => {
        if (fetchedProfile) {
            dispatch(setProfile(fetchedProfile));
        }
    }, [fetchedProfile, dispatch]);

    if (status === 'loading') {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (status === 'failed') {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    {error || 'Failed to load profile'}
                </AlertDescription>
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

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Bio Section */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Bio</h3>
                    <p className="text-gray-600">{profile.bio || 'No bio provided'}</p>
                </div>

                {/* Description Section */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Description</h3>
                    <p className="text-gray-600">{profile.description || 'No description provided'}</p>
                </div>

                {/* Location Section */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Location</h3>
                    <p className="text-gray-600">{profile.location || 'No location provided'}</p>
                </div>

                {/* Profession Section */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Profession</h3>
                    <p className="text-gray-600">{profile.profession || 'No profession provided'}</p>
                </div>

                {/* Interests Section */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                        {profile.interests && profile.interests.length > 0 ? (
                            profile.interests.map((interest, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                                >
                                    {interest}
                                </span>
                            ))
                        ) : (
                            <p className="text-gray-600">No interests added</p>
                        )}
                    </div>
                </div>

                {/* Social Links Section */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Social Links</h3>
                    <div className="space-y-2">
                        {profile.socialLinks && profile.socialLinks.length > 0 ? (
                            profile.socialLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link}
                                    className="block text-blue-600 hover:underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {link}
                                </a>
                            ))
                        ) : (
                            <p className="text-gray-600">No social links added</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};