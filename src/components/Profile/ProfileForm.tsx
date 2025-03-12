import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { Profile } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRef } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUploadAvatarMutation } from '@/redux/features/profile/profileApi';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    useCreateProfileMutation,
    useFetchProfileQuery,
    useUpdateProfileMutation,
} from '@/redux/features/profile/profileApi';
import { setProfile, resetStatus } from '@/redux/features/profile/profileSlice';
import {useCurrentProfile} from "@/redux/features/profile/profileSlice.ts";

export const ProfileForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const {  status, error } = useAppSelector((state: RootState) => state.profile);
    const profile = useAppSelector(useCurrentProfile);
    const [newInterest, setNewInterest] = useState('');
    const [newSocialLink, setNewSocialLink] = useState('');
    const { data: fetchedProfile } = useFetchProfileQuery(undefined, { skip: !!profile });
    const [createProfile, { isLoading: creating }] = useCreateProfileMutation();
    const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<Profile>({
        defaultValues: {
            ...profile,
            avatarUrl: profile?.avatarUrl || '',
            interests: profile?.interests || [],
            socialLinks: profile?.socialLinks || [],
        },
    });
    const interests = watch('interests') || [];
    const socialLinks = watch('socialLinks') || [];

    const handleAddInterest = () => {
        if (newInterest.trim()) {
            const updatedInterests = [...interests, newInterest.trim()];
            setValue('interests', updatedInterests);
            setNewInterest('');
        }
    };

    const handleRemoveInterest = (index: number) => {
        const updatedInterests = interests.filter((_, i) => i !== index);
        setValue('interests', updatedInterests);
    };

    const handleAddSocialLink = () => {
        if (newSocialLink.trim()) {
            const updatedLinks = [...socialLinks, newSocialLink.trim()];
            setValue('socialLinks', updatedLinks);
            setNewSocialLink('');
        }
    };

    const handleRemoveSocialLink = (index: number) => {
        const updatedLinks = socialLinks.filter((_, i) => i !== index);
        setValue('socialLinks', updatedLinks);
    };
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);

        try {
            const result = await uploadAvatar(file).unwrap();
            if (result?.avatarUrl) {
                setValue('avatarUrl', result.avatarUrl);
                if (profile) {
                    dispatch(setProfile({
                        ...profile,
                        avatarUrl: result.avatarUrl
                    }));
                }
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            // Reset preview on error
            setAvatarPreview(null);
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };
    useEffect(() => {
        if (fetchedProfile) {
            dispatch(setProfile(fetchedProfile));
            reset(fetchedProfile);
        }
        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview);
        }
    }, [fetchedProfile,avatarPreview, dispatch, reset]);

    const onSubmit = async (data: Profile) => {
        dispatch(resetStatus());
        try {
            const profileData = {
                ...data,
                avatarUrl: watch('avatarUrl'), // Include the avatarUrl from form state
            };

            if (!profile?.profileExists) {
                const result = await createProfile(profileData).unwrap();
                dispatch(setProfile(result)); // Update Redux state with new profile
            } else {
                const result = await updateProfile(profileData).unwrap();
                dispatch(setProfile(result)); // Update Redux state with updated profile
            }
        } catch (err) {
            console.error('Profile submission error:', err);
        }
    };
    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{profile ? 'Update Profile' : 'Create Profile'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="bio">Bio</label>
                        <Textarea
                            id="bio"
                            {...register('bio', { required: 'Bio is required' })}
                            className={errors.bio ? 'border-red-500' : ''}
                        />
                        {errors.bio && <span className="text-red-500 text-sm">{errors.bio.message}</span>}
                    </div>
                    // Replace the existing avatar section with this updated version:
                    <div className="flex flex-col items-center space-y-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                        <Avatar
                            className="h-24 w-24 cursor-pointer hover:opacity-80 transition-opacity border-2 border-gray-200"
                            onClick={handleAvatarClick}
                        >
                            <AvatarImage
                                src={avatarPreview ||
                                    (watch('avatarUrl') ?
                                        `http://localhost:5000${watch('avatarUrl')}` :
                                        profile?.avatarUrl ?
                                            `http://localhost:5000${profile.avatarUrl}` :
                                            undefined)
                                }
                                alt="Profile avatar"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                }}
                            />
                            <AvatarFallback className="bg-gray-100">
                                {profile?.user?.name?.[0]?.toUpperCase() || '?'}
                            </AvatarFallback>
                        </Avatar>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAvatarClick}
                            disabled={isUploading}
                            className="relative"
                        >
                            {isUploading ? (
                                <>
                                    <span className="opacity-0">Change Avatar</span>
                                    <span className="absolute inset-0 flex items-center justify-center">
                    Uploading...
                </span>
                                </>
                            ) : (
                                'Change Avatar'
                            )}
                        </Button>
                        {avatarPreview && (
                            <p className="text-sm text-muted-foreground text-center">
                                Preview shown. Save profile to confirm changes.
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="description">Description</label>
                        <Textarea
                            id="description"
                            {...register('description', { required: 'Description is required' })}
                            className={errors.description ? 'border-red-500' : ''}
                        />
                        {errors.description && <span className="text-red-500 text-sm">{errors.description.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="location">Location</label>
                        <Input
                            id="location"
                            {...register('location', { required: 'Location is required' })}
                            className={errors.location ? 'border-red-500' : ''}
                        />
                        {errors.location && <span className="text-red-500 text-sm">{errors.location.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="profession">Profession</label>
                        <Input
                            id="profession"
                            {...register('profession', { required: 'Profession is required' })}
                            className={errors.profession ? 'border-red-500' : ''}
                        />
                        {errors.profession && <span className="text-red-500 text-sm">{errors.profession.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="interests">Interests</label>
                        <div className="flex gap-2">
                            <Input
                                id="interests"
                                value={newInterest}
                                onChange={(e) => setNewInterest(e.target.value)}
                                placeholder="Add an interest"
                            />
                            <Button
                                type="button"
                                onClick={handleAddInterest}
                                variant="outline"
                            >
                                Add
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {interests.map((interest, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 flex items-center gap-2"
                                >
                                    {interest}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveInterest(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Social Links Section */}
                    <div className="space-y-2">
                        <label htmlFor="socialLinks">Social Links</label>
                        <div className="flex gap-2">
                            <Input
                                id="socialLinks"
                                value={newSocialLink}
                                onChange={(e) => setNewSocialLink(e.target.value)}
                                placeholder="Add a social link"
                            />
                            <Button
                                type="button"
                                onClick={handleAddSocialLink}
                                variant="outline"
                            >
                                Add
                            </Button>
                        </div>
                        <div className="space-y-2 mt-2">
                            {socialLinks.map((link, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                                >
                                    <span className="flex-1 text-blue-600">{link}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSocialLink(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {status === 'failed' && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {status === 'failed' && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Button type="submit" disabled={creating || updating} className="w-full">
                        {creating || updating
                            ? 'Saving...'
                            : profile
                                ? 'Update Profile'
                                : 'Create Profile'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
