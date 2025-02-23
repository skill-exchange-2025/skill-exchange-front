export interface Profile {
    bio: string;
    description: string;
    location: string;
    socialLinks: string[];
    profession: string;
    interests: string[];
    birthDate?: string;
}

export interface ProfileState {
    profile: Profile | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}
