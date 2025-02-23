import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { Profile } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    useCreateProfileMutation,
    useFetchProfileQuery,
    useUpdateProfileMutation,
} from '@/redux/features/profile/profileApi';
import { setProfile, resetStatus } from '@/redux/features/profile/profileSlice';

export const ProfileForm: React.FC = () => {
    const dispatch = useAppDispatch();
    const { profile, status, error } = useAppSelector((state: RootState) => state.profile);

    const { data: fetchedProfile } = useFetchProfileQuery(undefined, { skip: !!profile });
    const [createProfile, { isLoading: creating }] = useCreateProfileMutation();
    const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<Profile>({
        defaultValues: profile || undefined,
    });

    useEffect(() => {
        if (fetchedProfile) {
            dispatch(setProfile(fetchedProfile));
            reset(fetchedProfile);
        }
    }, [fetchedProfile, dispatch, reset]);

    const onSubmit = async (data: Profile) => {
        dispatch(resetStatus());
        try {
            if (profile) {
                const updatedProfile = await updateProfile(data).unwrap();
                dispatch(setProfile(updatedProfile));
            } else {
                const createdProfile = await createProfile(data).unwrap();
                dispatch(setProfile(createdProfile));
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
