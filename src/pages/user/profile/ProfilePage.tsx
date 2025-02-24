import { useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useProfileStatus, useProfileError } from '@/redux/features/profile/profileSlice';
import { ProfileView } from '@/components/Profile/ProfileView';
import { ProfileForm } from '@/components/Profile/ProfileForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {useCurrentProfile} from "@/redux/features/profile/profileSlice.ts";

const ProfilePage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const status = useAppSelector(useProfileStatus);
    const error = useAppSelector(useProfileError);
    const profile = useAppSelector(useCurrentProfile);

    if (status === 'loading') {
        return (
            <Card className="w-full max-w-2xl mx-auto p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </Card>
        );
    }
    if (!profile) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Create Your Profile</h1>
                </div>
                <ProfileForm />
            </div>
        );
    }

    if (status === 'failed' && error !== 'No profile found') {
        return (
            <Card className="w-full max-w-2xl mx-auto p-6">
                <Alert variant="destructive">
                    <AlertDescription>
                        {error || 'Failed to load profile'}
                    </AlertDescription>
                </Alert>
            </Card>
        );
    }


    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Profile Management</h1>
                <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? "outline" : "default"}
                >
                    {isEditing ? "View Profile" : "Edit Profile"}
                </Button>
            </div>

            {isEditing ? <ProfileForm /> : <ProfileView />}
        </div>
    );
};

export default ProfilePage;