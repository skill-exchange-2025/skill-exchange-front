import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { Profile } from '@/types/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useCreateProfileMutation,
  useFetchProfileQuery,
  useUpdateProfileMutation,
} from '@/redux/features/profile/profileApi';
import { setProfile, resetStatus } from '@/redux/features/profile/profileSlice';
import { useCurrentProfile } from '@/redux/features/profile/profileSlice.ts';
import {
  MapPin,
  Briefcase,
  Link,
  User,
  FileText,
  Heart,
  Plus,
  X,
  Loader2,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const ProfileForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state: RootState) => state.profile);
  const profile = useAppSelector(useCurrentProfile);
  const [newInterest, setNewInterest] = useState('');
  const [newSocialLink, setNewSocialLink] = useState('');
  const { data: fetchedProfile } = useFetchProfileQuery(undefined, {
    skip: !!profile,
  });
  const [createProfile, { isLoading: creating }] = useCreateProfileMutation();
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();

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

  useEffect(() => {
    if (fetchedProfile) {
      dispatch(setProfile(fetchedProfile));
      reset(fetchedProfile);
    }
  }, [fetchedProfile, dispatch, reset]);

  const onSubmit = async (data: Profile) => {
    dispatch(resetStatus());
    try {
      if (!profile?.profileExists) {
        await createProfile(data).unwrap();
        toast.success('Profile created', {
          description: 'Your profile has been created successfully.',
        });
      } else {
        await updateProfile(data).unwrap();
        toast.success('Profile updated', {
          description: 'Your profile has been updated successfully.',
        });
      }
    } catch (err) {
      console.error('Profile submission error:', err);
      toast.error('Error', {
        description: 'There was a problem saving your profile.',
      });
    }
  };

  return (
    <Card className="w-full border-none shadow-md">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Bio Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <Label htmlFor="bio" className="text-lg font-semibold">
                Bio
              </Label>
            </div>
            <Textarea
              id="bio"
              {...register('bio', { required: 'Bio is required' })}
              className={`min-h-[100px] ${errors.bio ? 'border-red-500' : ''}`}
              placeholder="Tell us about yourself in a few sentences"
            />
            {errors.bio && (
              <span className="text-red-500 text-sm">{errors.bio.message}</span>
            )}
          </div>

          <Separator />

          {/* Description Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <Label htmlFor="description" className="text-lg font-semibold">
                Description
              </Label>
            </div>
            <Textarea
              id="description"
              {...register('description', {
                required: 'Description is required',
              })}
              className={`min-h-[120px] ${
                errors.description ? 'border-red-500' : ''
              }`}
              placeholder="Provide a detailed description of your background, skills, and experience"
            />
            {errors.description && (
              <span className="text-red-500 text-sm">
                {errors.description.message}
              </span>
            )}
          </div>

          <Separator />

          {/* Location & Profession Section - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <Label htmlFor="location" className="text-lg font-semibold">
                  Location
                </Label>
              </div>
              <Input
                id="location"
                {...register('location', { required: 'Location is required' })}
                className={errors.location ? 'border-red-500' : ''}
                placeholder="City, Country"
              />
              {errors.location && (
                <span className="text-red-500 text-sm">
                  {errors.location.message}
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <Label htmlFor="profession" className="text-lg font-semibold">
                  Profession
                </Label>
              </div>
              <Input
                id="profession"
                {...register('profession', {
                  required: 'Profession is required',
                })}
                className={errors.profession ? 'border-red-500' : ''}
                placeholder="Your current profession"
              />
              {errors.profession && (
                <span className="text-red-500 text-sm">
                  {errors.profession.message}
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* Interests Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <Label htmlFor="interests" className="text-lg font-semibold">
                Interests
              </Label>
            </div>
            <div className="flex gap-2">
              <Input
                id="interests"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="Add an interest"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInterest();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddInterest}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {interests.map((interest, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-1 bg-gray-100 text-gray-800 flex items-center gap-1"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(index)}
                    className="text-gray-500 hover:text-red-500 rounded-full ml-1 focus:outline-none"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {interests.length === 0 && (
                <p className="text-gray-500 text-sm">No interests added yet</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Social Links Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Link className="h-5 w-5 text-primary" />
              <Label htmlFor="socialLinks" className="text-lg font-semibold">
                Social Links
              </Label>
            </div>
            <div className="flex gap-2">
              <Input
                id="socialLinks"
                value={newSocialLink}
                onChange={(e) => setNewSocialLink(e.target.value)}
                placeholder="Add a social link (https://...)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSocialLink();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddSocialLink}
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 mt-2">
              {socialLinks.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                >
                  <Link className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="flex-1 text-blue-600 text-sm truncate">
                    {link}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSocialLink(index)}
                    className="text-gray-500 hover:text-red-500 rounded-full focus:outline-none"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {socialLinks.length === 0 && (
                <p className="text-gray-500 text-sm">
                  No social links added yet
                </p>
              )}
            </div>
          </div>

          {status === 'failed' && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={creating || updating}
            className="w-full mt-6"
            size="lg"
          >
            {creating || updating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {profile ? 'Updating...' : 'Creating...'}
              </>
            ) : profile ? (
              'Update Profile'
            ) : (
              'Create Profile'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
