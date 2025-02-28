import { useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useProfileStatus, useProfileError, useCurrentProfile } from '@/redux/features/profile/profileSlice';
import { ProfileView } from '@/components/Profile/ProfileView';
import { ProfileForm } from '@/components/Profile/ProfileForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Pencil, Eye } from 'lucide-react';

const ProfilePage = () => {
    const [isEditing, setIsEditing] = useState(false);
    const status = useAppSelector(useProfileStatus);
    const error = useAppSelector(useProfileError);
    const profile = useAppSelector(useCurrentProfile);

    if (status === 'loading') {
        return (
            <Card className="w-full max-w-2xl mx-auto p-6 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                <p className="mt-4 text-gray-600">Loading profile...</p>
            </Card>
        );
    }
    if (!profile) {
        return (
            <div className="container mx-auto py-12 px-6 text-center">
                <h1 className="text-3xl font-bold mb-4">Create Your Profile</h1>
                <p className="text-gray-600 mb-6">Start by filling in your details below.</p>
                <Card className="max-w-3xl mx-auto p-8 shadow-lg rounded-lg">
                    <ProfileForm />
                </Card>
            </div>
        );
    }

    if (status === 'failed' && error !== 'No profile found') {
        return (
            <Card className="w-full max-w-2xl mx-auto p-6 shadow-lg">
                <Alert variant="destructive">
                    <AlertDescription>
                        {error || 'Failed to load profile'}
                    </AlertDescription>
                </Alert>
            </Card>
        );
    }

    return (
        <div>
            <Card className="max-w-4xl mx-auto p-8 shadow-xl rounded-lg border ">
                <div className="mb-6 flex justify-between items-center border-b pb-4">
                    <h1 className="text-3xl font-bold">Profile Management</h1>
                    <Button
                        onClick={() => setIsEditing(!isEditing)}
                        variant={isEditing ? "outline" : "default"}
                        className="flex items-center gap-2"
                    >
                        {isEditing ? <Eye className="w-5 h-5" /> : <Pencil className="w-5 h-5" />}
                        {isEditing ? "View Profile" : "Edit Profile"}
                    </Button>
                </div>
                <div className="mt-6">
                    {isEditing ? <ProfileForm /> : <ProfileView />}
                </div>
            </Card>
        </div>
    );
};

export default ProfilePage;